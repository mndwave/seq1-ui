import {
  nip19,
  getPublicKey as getHexPublicKey, // Renaming for clarity, as it takes hex privKey and returns hex pubKey
  finalizeEvent,
  type EventTemplate,
  type Event as NostrToolsEvent,
} from "nostr-tools"
import { utils as secp256k1Utils } from "@noble/secp256k1" // For private key generation
import { Buffer } from "buffer" // Ensure Buffer is available

// Ensure window.Buffer is available for nostr-tools or other libraries if running in browser
if (typeof window !== "undefined" && typeof window.Buffer === "undefined") {
  window.Buffer = Buffer
}

export interface NostrKeypair {
  nsec: string
  npub: string
  privateKeyHex: string
  publicKeyHex: string
}

export interface StoredNostrKeypair extends NostrKeypair {
  created: string // ISO date string
}

export interface NostrNote {
  id: string
  pubkey: string
  created_at: number // Unix timestamp in seconds
  kind: number
  tags: string[][]
  content: string
  sig: string
}

export function generateNostrKeypair(): NostrKeypair {
  const privateKeyBytes: Uint8Array = secp256k1Utils.randomPrivateKey() // Generates a Uint8Array
  const privateKeyHex: string = Buffer.from(privateKeyBytes).toString("hex") // Convert to hex

  const publicKeyHex: string = getHexPublicKey(privateKeyHex) // nostr-tools' getPublicKey expects a hex private key

  return {
    nsec: nip19.nsecEncode(privateKeyBytes), // nsecEncode expects Uint8Array (raw private key bytes)
    npub: nip19.npubEncode(publicKeyHex), // npubEncode expects hex public key
    privateKeyHex,
    publicKeyHex,
  }
}

export function decodeNsec(nsec: string): string | null {
  try {
    const decoded = nip19.decode(nsec)
    if (decoded.type === "nsec") {
      // The 'data' for nsec is the raw private key bytes (Uint8Array)
      return Buffer.from(decoded.data as Uint8Array).toString("hex")
    }
    return null
  } catch (e) {
    console.error("Error decoding nsec:", e)
    return null
  }
}

export const nostrStorage = {
  storeKeys: (keys: NostrKeypair): void => {
    if (typeof window !== "undefined") {
      const storedKeypair: StoredNostrKeypair = { ...keys, created: new Date().toISOString() }
      localStorage.setItem("seq1_nostr_keypair", JSON.stringify(storedKeypair))
    }
  },
  getStoredKeys: (): StoredNostrKeypair | null => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("seq1_nostr_keypair")
      return stored ? JSON.parse(stored) : null
    }
    return null
  },
  clearKeys: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("seq1_nostr_keypair")
    }
  },
  getPublicData: (): { npub: string; publicKeyHex: string } | null => {
    const keys = nostrStorage.getStoredKeys()
    if (keys) {
      return { npub: keys.npub, publicKeyHex: keys.publicKeyHex }
    }
    // Check for extension login
    if (typeof window !== "undefined") {
      const extensionNpub = localStorage.getItem("seq1_npub_extension")
      if (extensionNpub) {
        try {
          const decoded = nip19.decode(extensionNpub)
          if (decoded.type === "npub") {
            return { npub: extensionNpub, publicKeyHex: decoded.data as string }
          }
        } catch (e) {
          console.error("Error decoding extension npub for public data:", e)
        }
      }
    }
    return null
  },
}

export function createAuthEvent(challenge: string, privateKeyHex: string): NostrToolsEvent {
  // const pubkey = getHexPublicKey(privateKeyHex) // Not strictly needed here as finalizeEvent derives it
  const eventTemplate: EventTemplate = {
    kind: 22242, // NIP-42: Authentication
    created_at: Math.floor(Date.now() / 1000),
    tags: [["challenge", challenge]], // NIP-42 recommends putting challenge in a tag
    content: "", // Content can be empty or relay URL for NIP-42
    // pubkey field is not part of EventTemplate for finalizeEvent in nostr-tools v1
  }
  // finalizeEvent will compute ID, sign the event, and add the pubkey.
  return finalizeEvent(eventTemplate, privateKeyHex)
}

export function formatRelativeTime(timestamp: number): string {
  const now = new Date()
  // Assuming timestamp is in seconds (Unix timestamp)
  const date = new Date(timestamp * 1000)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 5) {
    return "just now"
  }
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`
  }
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) {
    return "yesterday"
  }
  if (diffInDays < 7) {
    return `${diffInDays}d ago`
  }
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
  if (date.getFullYear() !== now.getFullYear()) {
    options.year = "numeric"
  }
  return date.toLocaleDateString(undefined, options)
}
