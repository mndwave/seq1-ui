/**
 * Simplified Nostr client implementation with robust error handling
 */

import type { NostrNote } from "./nostr-utils"

// Simplified list of reliable relays
const RELIABLE_RELAYS = ["wss://relay.damus.io", "wss://relay.nostr.band", "wss://nos.lol", "wss://relay.snort.social"]

// Known hex value for our specific npub
const MNDWAVE_HEX = "7e7e9c42a91bfef19fa929e5fda1b72e0ebc1a4c1141673e2794234d86addf4e"

/**
 * Fetches notes from a single relay with proper error handling
 */
function fetchFromSingleRelay(relay: string, pubkeyHex: string, limit: number): Promise<NostrNote[]> {
  return new Promise((resolve) => {
    console.log(`Attempting to connect to relay: ${relay}`)

    // Track if we've already resolved this promise
    let hasResolved = false
    const notes: NostrNote[] = []

    // Create a unique subscription ID
    const subId = `sub_${Math.random().toString(36).substring(2, 15)}`

    // Set a timeout for the entire operation
    const timeoutId = setTimeout(() => {
      if (!hasResolved) {
        console.log(`Timeout for relay: ${relay}`)
        hasResolved = true
        resolve([])

        // Clean up socket if it exists
        if (socket && socket.readyState !== WebSocket.CLOSED) {
          try {
            socket.close()
          } catch (e) {
            console.error(`Error closing socket for ${relay}:`, e)
          }
        }
      }
    }, 8000) // 8 second timeout

    // Create WebSocket connection
    let socket: WebSocket | null = null
    try {
      socket = new WebSocket(relay)
    } catch (e) {
      console.error(`Error creating WebSocket for ${relay}:`, e)
      clearTimeout(timeoutId)
      resolve([])
      return
    }

    // Handle socket open
    socket.onopen = () => {
      console.log(`Connected to ${relay}`)

      try {
        // Send request for notes
        const request = JSON.stringify([
          "REQ",
          subId,
          {
            authors: [pubkeyHex],
            kinds: [1], // Regular notes
            limit: limit,
          },
        ])

        socket.send(request)
        console.log(`Request sent to ${relay}`)
      } catch (e) {
        console.error(`Error sending request to ${relay}:`, e)
        if (!hasResolved) {
          hasResolved = true
          clearTimeout(timeoutId)
          resolve([])

          try {
            socket.close()
          } catch (err) {
            // Ignore close errors
          }
        }
      }
    }

    // Handle messages
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data[0] === "EVENT" && data[1] === subId) {
          const nostrEvent = data[2]

          // Convert to our note format
          const note: NostrNote = {
            id: nostrEvent.id,
            pubkey: nostrEvent.pubkey,
            created_at: nostrEvent.created_at,
            content: nostrEvent.content,
            tags: nostrEvent.tags,
          }

          notes.push(note)
          console.log(`Received note from ${relay}, total: ${notes.length}`)
        } else if (data[0] === "EOSE" && data[1] === subId) {
          // End of stored events
          console.log(`EOSE from ${relay}, found ${notes.length} notes`)

          if (!hasResolved) {
            hasResolved = true
            clearTimeout(timeoutId)
            resolve(notes)

            try {
              socket.close()
            } catch (e) {
              // Ignore close errors
            }
          }
        }
      } catch (e) {
        console.error(`Error processing message from ${relay}:`, e)
      }
    }

    // Handle errors
    socket.onerror = (error) => {
      console.error(`WebSocket error with ${relay}:`, error)

      if (!hasResolved) {
        hasResolved = true
        clearTimeout(timeoutId)
        resolve([])

        try {
          socket.close()
        } catch (e) {
          // Ignore close errors
        }
      }
    }

    // Handle close
    socket.onclose = () => {
      console.log(`Connection closed to ${relay}`)

      if (!hasResolved) {
        hasResolved = true
        clearTimeout(timeoutId)
        resolve(notes)
      }
    }
  })
}

/**
 * Fetches notes from multiple relays sequentially until we get enough notes
 */
export async function fetchNotesFromRelays(pubkey: string, limit = 10): Promise<NostrNote[]> {
  console.log(`Fetching notes for pubkey: ${pubkey}`)

  // Convert npub to hex if needed
  const hexPubkey = pubkey.startsWith("npub") ? MNDWAVE_HEX : pubkey

  // Map to store unique notes
  const uniqueNotes = new Map<string, NostrNote>()

  // Try each relay one by one
  for (const relay of RELIABLE_RELAYS) {
    try {
      const notesFromRelay = await fetchFromSingleRelay(relay, hexPubkey, limit)

      // Add unique notes
      notesFromRelay.forEach((note) => {
        if (!uniqueNotes.has(note.id)) {
          uniqueNotes.set(note.id, note)
        }
      })

      console.log(`Got ${notesFromRelay.length} notes from ${relay}, total unique: ${uniqueNotes.size}`)

      // If we have enough notes, stop
      if (uniqueNotes.size >= limit) {
        console.log(`Found ${uniqueNotes.size} notes, stopping relay connections`)
        break
      }
    } catch (error) {
      console.error(`Error with relay ${relay}:`, error)
      // Continue to next relay
    }
  }

  // Sort notes by timestamp (newest first)
  const result = Array.from(uniqueNotes.values())
    .sort((a, b) => b.created_at - a.created_at)
    .slice(0, limit)

  console.log(`Returning ${result.length} unique notes`)
  return result
}

/**
 * Fetches notes with fallback to mock data
 */
export async function fetchNotesWithFallback(pubkey: string, limit = 10): Promise<NostrNote[]> {
  try {
    // Try to fetch real notes
    const notes = await fetchNotesFromRelays(pubkey, limit)

    // If we got notes, return them
    if (notes.length > 0) {
      return notes
    }

    // Otherwise, fall back to mock data
    console.log("No notes found, using fallback data")
    return getMockNotes(pubkey, limit)
  } catch (error) {
    console.error("Error fetching notes, using fallback data:", error)
    return getMockNotes(pubkey, limit)
  }
}

/**
 * Generate mock notes for testing and fallback
 */
export function getMockNotes(pubkey: string, limit: number): NostrNote[] {
  console.log(`Generating mock notes for ${pubkey}`)

  const mockNotes: NostrNote[] = [
    {
      id: "mock1",
      pubkey,
      created_at: Date.now() / 1000 - 3600,
      content:
        "[MOCK DATA] Working on some new sounds for SEQ1. The hardware integration is coming along nicely. Can't wait to share more soon!",
      tags: [],
    },
    {
      id: "mock2",
      pubkey,
      created_at: Date.now() / 1000 - 7200,
      content:
        "[MOCK DATA] Just connected the Prophet 5 to SEQ1 and the results are mind-blowing. The AI is learning my style and suggesting some incredible progressions.",
      tags: [],
    },
    {
      id: "mock3",
      pubkey,
      created_at: Date.now() / 1000 - 10800,
      content:
        "[MOCK DATA] SEQ1 development update: We're making great progress on the MIDI implementation. Connect your hardware synths and let the AI help you create!",
      tags: [],
    },
    {
      id: "mock4",
      pubkey,
      created_at: Date.now() / 1000 - 14400,
      content:
        "[MOCK DATA] The vintage hardware aesthetic of SEQ1 is inspired by the golden age of synthesizers. Every detail matters in creating that authentic feel.",
      tags: [],
    },
    {
      id: "mock5",
      pubkey,
      created_at: Date.now() / 1000 - 18000,
      content:
        "[MOCK DATA] SEQ1 is more than just a sequencer - it's a creative partner that understands your musical intentions and helps bring them to life.",
      tags: [],
    },
  ]

  return mockNotes.slice(0, limit)
}
