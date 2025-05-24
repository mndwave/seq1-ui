import { makeApiRequest } from "@/lib/server/api-server"

// Define the transport state type
export type TransportState = {
  playheadPosition: number
  isPlaying: boolean
  isLooping: boolean
  loopRegion: { startBar: number; endBar: number } | null
  bpm: number
  timeSignature: string
}

// Default transport state to use as fallback when API fails
const DEFAULT_TRANSPORT_STATE: TransportState = {
  playheadPosition: 0,
  isPlaying: false,
  isLooping: false,
  loopRegion: null,
  bpm: 120,
  timeSignature: "4/4",
}

/**
 * Get the current transport state
 */
export async function getTransportState(): Promise<TransportState> {
  try {
    console.log("Fetching transport state from API...")
    const response = await makeApiRequest("/api/transport")
    console.log("Transport state response:", response)
    return response
  } catch (error) {
    console.warn("Transport API unavailable, using default state:", error)
    // Don't throw an error, just return the default state
    return DEFAULT_TRANSPORT_STATE
  }
}

/**
 * Start playback
 */
export async function startPlayback(): Promise<TransportState> {
  try {
    const response = await makeApiRequest("/api/transport/play", { method: "POST" })
    return response
  } catch (error) {
    console.warn("Failed to start playback via API, updating local state:", error)
    // Return optimistic state update
    return { ...DEFAULT_TRANSPORT_STATE, isPlaying: true }
  }
}

/**
 * Stop playback
 */
export async function stopPlayback(): Promise<TransportState> {
  try {
    const response = await makeApiRequest("/api/transport/stop", { method: "POST" })
    return response
  } catch (error) {
    console.warn("Failed to stop playback via API, updating local state:", error)
    // Return optimistic state update
    return { ...DEFAULT_TRANSPORT_STATE, isPlaying: false }
  }
}

/**
 * Set the playhead position
 */
export async function setPlayheadPosition(position: number): Promise<TransportState> {
  try {
    const response = await makeApiRequest("/api/transport/playhead", {
      method: "POST",
      body: JSON.stringify({ position }),
    })
    return response
  } catch (error) {
    console.warn("Failed to set playhead position via API, updating local state:", error)
    // Return optimistic state update
    return { ...DEFAULT_TRANSPORT_STATE, playheadPosition: position }
  }
}

/**
 * Toggle loop state or update loop region
 */
export async function updateLoopState(
  isLooping: boolean,
  loopRegion?: { startBar: number; endBar: number } | null,
): Promise<TransportState> {
  try {
    const response = await makeApiRequest("/api/transport/loop", {
      method: "POST",
      body: JSON.stringify({ isLooping, loopRegion }),
    })
    return response
  } catch (error) {
    console.warn("Failed to update loop state via API, updating local state:", error)
    // Return optimistic state update
    return { ...DEFAULT_TRANSPORT_STATE, isLooping, loopRegion: loopRegion || null }
  }
}

/**
 * Update BPM
 */
export async function updateBpm(bpm: number): Promise<TransportState> {
  try {
    const response = await makeApiRequest("/api/transport/bpm", {
      method: "POST",
      body: JSON.stringify({ bpm }),
    })
    return response
  } catch (error) {
    console.warn("Failed to update BPM via API, updating local state:", error)
    // Return optimistic state update
    return { ...DEFAULT_TRANSPORT_STATE, bpm }
  }
}

/**
 * Update time signature
 */
export async function updateTimeSignature(timeSignature: string): Promise<TransportState> {
  try {
    const response = await makeApiRequest("/api/transport/time-signature", {
      method: "POST",
      body: JSON.stringify({ timeSignature }),
    })
    return response
  } catch (error) {
    console.warn("Failed to update time signature via API, updating local state:", error)
    // Return optimistic state update
    return { ...DEFAULT_TRANSPORT_STATE, timeSignature }
  }
}

/**
 * Check if the transport API is available
 */
export async function isTransportApiAvailable(): Promise<boolean> {
  try {
    await makeApiRequest("/api/transport")
    return true
  } catch (error) {
    return false
  }
}
