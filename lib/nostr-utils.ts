import { getPublicKey, nip19, finalizeEvent, type EventTemplate, type Event as NostrToolsEvent } from "nostr-tools"
import { utils as secp256k1Utils } from "@noble/secp256k1"
import { Buffer } from "buffer"

// Types
export interface NostrKeypair {
  nsec: string
  npub: string
  privateKeyHex: string
  publicKeyHex: string
}

export interface StoredNostrKeypair extends NostrKeypair {
  created: string
}

// Core key generation - CLIENT-SIDE ONLY
export const generateNostrKeypair = (): NostrKeypair => {
  const privateKeyBytes = secp256k1Utils.randomPrivateKey() // This is a Uint8Array
  const privateKeyHex = Buffer.from(privateKeyBytes).toString("hex") // Convert to hex for getPublicKey and storage

  const publicKeyHex = getPublicKey(privateKeyHex) // nostr-tools getPublicKey expects hex private key
  const publicKeyBytes = Buffer.from(publicKeyHex, "hex") // npubEncode might also prefer Uint8Array, or hex is fine. Let's be consistent if possible.
  // nip19.npubEncode actually expects a hex string for the public key.

  return {
    nsec: nip19.nsecEncode(privateKeyBytes), // Pass the Uint8Array directly
    npub: nip19.npubEncode(publicKeyHex), // npubEncode expects a hex string for the public key
    privateKeyHex, // Store the hex version
    publicKeyHex,
  }
}

// Secure storage manager
export class SecureNostrStorage {
  private STORAGE_KEY = "seq1_nostr_keys"
  private NPUB_KEY = "seq1_npub" // For quick access if needed elsewhere

  storeKeys(keypair: NostrKeypair): boolean {
    const keyData: StoredNostrKeypair = {
      ...keypair,
      created: new Date().toISOString(),
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(keyData))
    localStorage.setItem(this.NPUB_KEY, keypair.npub)
    return true
  }

  getStoredKeys(): StoredNostrKeypair | null {
    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as StoredNostrKeypair
        // Basic validation
        if (parsed && parsed.nsec && parsed.npub && parsed.privateKeyHex && parsed.publicKeyHex) {
          return parsed
        }
      } catch (e) {
        console.error("Error parsing stored Nostr keys:", e)
        this.clearKeys() // Clear corrupted data
        return null
      }
    }
    return null
  }

  hasStoredKeys(): boolean {
    return !!this.getStoredKeys()
  }

  clearKeys(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.NPUB_KEY)
  }

  // Get public data safe to send to server
  getPublicData(): { npub: string; publicKeyHex: string } | null {
    const keys = this.getStoredKeys()
    return keys ? { npub: keys.npub, publicKeyHex: keys.publicKeyHex } : null
  }
}

export const nostrStorage = new SecureNostrStorage()

// Event Signing Functions
export const signNostrEvent = (eventTemplate: EventTemplate, privateKeyHex: string): NostrToolsEvent => {
  // finalizeEvent (from nostr-tools v1.x) expects an EventTemplate without pubkey.
  // It will derive and add the pubkey itself.
  // The EventTemplate type imported from nostr-tools v1.x will not have a pubkey field.
  const templateForFinalize: EventTemplate = {
    kind: eventTemplate.kind,
    tags: eventTemplate.tags || [],
    content: eventTemplate.content || "",
    created_at: eventTemplate.created_at || Math.floor(Date.now() / 1000),
  }
  return finalizeEvent(templateForFinalize, privateKeyHex)
}

export const createAuthEvent = (challenge: string, privateKeyHex: string): NostrToolsEvent => {
  // finalizeEvent (from nostr-tools v1.x) expects an EventTemplate without pubkey.
  const authEventTemplateForFinalize: EventTemplate = {
    kind: 22242, // NIP-42 Authentication
    content: challenge,
    tags: [],
    created_at: Math.floor(Date.now() / 1000),
  }
  return finalizeEvent(authEventTemplateForFinalize, privateKeyHex)
}

// Helper to decode nsec to privateKeyHex
export const decodeNsec = (nsec: string): string | null => {
  try {
    const { type, data } = nip19.decode(nsec) // data here will be Uint8Array if nsec is valid
    if (type === "nsec") {
      return Buffer.from(data as Uint8Array).toString("hex") // Convert Uint8Array to hex string
    }
    console.warn("Decoded type is not nsec:", type)
    return null
  } catch (e) {
    console.error("Failed to decode nsec:", e)
    return null
  }
}

// Security Constants & Rules
export const RESERVED_USERNAMES = ["kyle", "mndwave", "admin", "root", "seq1"]
export const MINDWAVE_NPUB = "npub19tcq5k5fe26ujyllgcd7s6kayyp9hfh7vm0an58g9w2g3jud9u7sz84zw5"

// CRITICAL SECURITY RULES
export const SECURITY_RULES = {
  NEVER_SEND_NSEC: "Private keys must never leave the client",
  ONLY_SEND_NPUB: "Only public keys can be sent to server",
  CLIENT_SIDE_GENERATION: "Keys must be generated client-side only",
  LOCAL_STORAGE_ONLY: "Keys stored in browser localStorage only",
  CLIENT_SIDE_SIGNING: "All event signing happens client-side",
}

// Define the structure of a Nostr event (for external use if needed, distinct from nostr-tools Event)
export interface NostrEvent {
  id: string
  pubkey: string
  created_at: number
  kind: number
  tags: string[][]
  content: string
  sig: string
}
