import {
  nip19,
  getPublicKey as nostrToolsGetPublicKey, // Renamed to avoid conflict if any local getPublicKey
  finalizeEvent,
  type EventTemplate,
  type Event as NostrToolsEvent,
} from "nostr-tools"
import { utils as secp256k1Utils } from "@noble/secp256k1"
import { Buffer } from "buffer"

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
  created: string
}

export interface NostrNote {
  id: string
  pubkey: string
  created_at: number
  kind: number
  tags: string[][]
  content: string
  sig: string
}

export function generateNostrKeypair(): NostrKeypair {
  const privateKeyBytes: Uint8Array = secp256k1Utils.randomPrivateKey()
  const privateKeyHex: string = Buffer.from(privateKeyBytes).toString("hex")
  const publicKeyHex: string = nostrToolsGetPublicKey(privateKeyBytes) // nostr-tools getPublicKey can take Uint8Array private key

  return {
    nsec: nip19.nsecEncode(privateKeyBytes),
    npub: nip19.npubEncode(publicKeyHex),
    privateKeyHex,
    publicKeyHex,
  }
}

export function decodeNsec(nsec: string): string | null {
  try {
    const decoded = nip19.decode(nsec)
    if (decoded.type === "nsec") {
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
      // Store the full keypair object, not individual keys as per the document's example
      localStorage.setItem("seq1_nostr_keypair", JSON.stringify(storedKeypair))
      // For convenience and compatibility with document's app init example:
      localStorage.setItem("nostr_npub", keys.npub)
    }
  },
  getStoredKeys: (): StoredNostrKeypair | null => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("seq1_nostr_keypair")
      if (stored) {
        try {
          return JSON.parse(stored) as StoredNostrKeypair
        } catch (e) {
          console.error("Error parsing stored Nostr keypair:", e)
          localStorage.removeItem("seq1_nostr_keypair") // Clear corrupted data
          return null
        }
      }
    }
    return null
  },
  // Document example uses individual localStorage items, so provide getters for those too
  getStoredNpub: (): string | null => {
    if (typeof window !== "undefined") return localStorage.getItem("nostr_npub")
    return null
  },
  clearKeys: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("seq1_nostr_keypair")
      localStorage.removeItem("nostr_npub")
      localStorage.removeItem("nostr_private_key") // From document example
      localStorage.removeItem("nostr_public_key") // From document example
      localStorage.removeItem("jwt_token") // Clear JWT on logout
    }
  },
  getPublicData: (): { npub: string; publicKeyHex: string } | null => {
    const keys = nostrStorage.getStoredKeys()
    if (keys) {
      return { npub: keys.npub, publicKeyHex: keys.publicKeyHex }
    }
    if (typeof window !== "undefined") {
      const extensionNpub = localStorage.getItem("seq1_npub_extension") // For extension login
      if (extensionNpub) {
        try {
          const decoded = nip19.decode(extensionNpub)
          if (decoded.type === "npub") {
            return { npub: extensionNpub, publicKeyHex: decoded.data as string }
          }
        } catch (e) {
          /* ignore */
        }
      }
    }
    return null
  },
}

export function createAuthEvent(challenge: string, privateKeyHex: string): NostrToolsEvent {
  const eventTemplate: EventTemplate = {
    kind: 22242,
    created_at: Math.floor(Date.now() / 1000),
    tags: [["challenge", challenge]],
    content: "",
  }
  return finalizeEvent(eventTemplate, privateKeyHex)
}

export function formatRelativeTime(timestamp: number): string {
  const now = new Date()
  const date = new Date(timestamp * 1000)
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 5) return "just now"
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays === 1) return "yesterday"
  if (diffInDays < 7) return `${diffInDays}d ago`
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }
  if (date.getFullYear() !== now.getFullYear()) options.year = "numeric"
  return date.toLocaleDateString(undefined, options)
}
