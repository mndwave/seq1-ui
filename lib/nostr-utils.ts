/**
 * Utility functions for fetching and handling Nostr content
 */
import { fetchNotesWithFallback } from "./nostr-client"

// Define the structure of a Nostr note
export interface NostrNote {
  id: string
  pubkey: string
  created_at: number
  content: string
  tags: string[][]
}

// Define the structure of a Nostr event
export interface NostrEvent {
  id: string
  pubkey: string
  created_at: number
  kind: number
  tags: string[][]
  content: string
  sig: string
}

/**
 * Fetches recent notes from a specific Nostr pubkey
 * @param pubkey The Nostr public key to fetch notes from
 * @param limit Maximum number of notes to fetch
 * @returns Array of Nostr notes
 */
export async function fetchNostrNotes(pubkey: string, limit = 5): Promise<NostrNote[]> {
  try {
    console.log(`fetchNostrNotes called for pubkey: ${pubkey} with limit: ${limit}`)

    // Use our client to fetch notes with fallback
    const notes = await fetchNotesWithFallback(pubkey, limit)

    console.log(`fetchNostrNotes returning ${notes.length} notes`)
    return notes
  } catch (error) {
    console.error("Error fetching Nostr notes:", error)
    // Return empty array instead of throwing to prevent UI errors
    return []
  }
}

/**
 * Formats a timestamp into a human-readable relative time string
 * @param timestamp Unix timestamp in seconds
 * @returns Formatted relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now() / 1000
  const diff = now - timestamp

  if (diff < 60) {
    return "just now"
  } else if (diff < 3600) {
    const minutes = Math.floor(diff / 60)
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`
  } else if (diff < 86400) {
    const hours = Math.floor(diff / 3600)
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
  } else {
    const days = Math.floor(diff / 86400)
    return `${days} ${days === 1 ? "day" : "days"} ago`
  }
}
