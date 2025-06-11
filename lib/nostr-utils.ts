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
      localStorage.setItem("seq1_nostr_keypair", JSON.stringify(storedKeypair))
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
          localStorage.removeItem("seq1_nostr_keypair")
          return null
        }
      }
    }
    return null
  },
  getStoredNpub: (): string | null => {
    if (typeof window !== "undefined") return localStorage.getItem("nostr_npub")
    return null
  },
  clearKeys: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("seq1_nostr_keypair")
      localStorage.removeItem("nostr_npub")
      localStorage.removeItem("nostr_private_key")
      localStorage.removeItem("nostr_public_key")
      localStorage.removeItem("jwt_token")
      localStorage.removeItem("seq1_npub_extension") // Also clear extension npub
    }
  },
  getPublicData: (): { npub: string; publicKeyHex: string } | null => {
    const keys = nostrStorage.getStoredKeys()
    if (keys) {
      return { npub: keys.npub, publicKeyHex: keys.publicKeyHex }
    }
    if (typeof window !== "undefined") {
      const extensionNpub = localStorage.getItem("seq1_npub_extension")
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

/**
 * Creates a NIP-42 style authentication event.
 * This is typically used when a relay sends a `CHALLENGE` message.
 */
export function createAuthEvent(challenge: string, privateKeyHex: string): NostrToolsEvent {
  const eventTemplate: EventTemplate = {
    kind: 22242,
    created_at: Math.floor(Date.now() / 1000),
    tags: [["challenge", challenge]],
    content: "",
    // `finalizeEvent` will derive pubkey from privateKeyHex and add it.
  }
  // nostr-tools v1 finalizeEvent expects private key as Uint8Array
  return finalizeEvent(eventTemplate, Buffer.from(privateKeyHex, "hex"))
}

/**
 * Creates a NIP-07 style authentication event (Kind 22242) signed with the provided private key.
 * This is used by `auth-context` for NSEC login and can be adapted for extension login flows
 * where the client needs to construct the auth event itself before sending it to the server.
 *
 * @param challenge - The challenge string to include in the event tags.
 * @param privateKeyHex - The user's Nostr private key in hex format.
 * @param publicKeyHex - The user's Nostr public key in hex format.
 * @returns The signed NostrToolsEvent.
 */
export function createAuthEventForNip07Login(
  challenge: string,
  privateKeyHex: string,
  publicKeyHex: string, // publicKeyHex is needed for the event template before signing
): NostrToolsEvent {
  const eventTemplate: EventTemplate = {
    kind: 22242,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["challenge", challenge],
      // Optionally, you could add a relay URL tag if the auth is specific to a relay,
      // but for general server auth, it's often omitted or the server URL is used.
      // e.g., ["relay", "wss://your.server.com"]
    ],
    content: "", // NIP-07 auth events typically have empty content
    pubkey: publicKeyHex, // The pubkey of the user authenticating
  }
  // nostr-tools v1 finalizeEvent expects private key as Uint8Array.
  // It will compute the event ID and sign it.
  // The `pubkey` in the template is used to populate `event.pubkey`.
  // @ts-ignore - nostr-tools v1 `finalizeEvent` can be a bit finicky with EventTemplate type if pubkey is pre-filled,
  // but it's standard practice to include it. If issues arise, it can be omitted and finalizeEvent will derive it.
  // However, explicitly setting it is clearer.
  return finalizeEvent(eventTemplate, Buffer.from(privateKeyHex, "hex"))
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
