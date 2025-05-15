import * as serverApi from "@/lib/server/api-server"

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
    const response = await serverApi.getTransportStateServer()
    console.log("Transport state response:", response)
    return response
  } catch (error) {
    console.error("Error getting transport state:", error)
    console.log("Using default transport state as fallback")
    return DEFAULT_TRANSPORT_STATE
  }
}

/**
 * Start playback
 */
export async function startPlayback(): Promise<TransportState> {
  try {
    return await serverApi.startPlaybackServer()
  } catch (error) {
    console.error("Error starting playback:", error)
    return { ...DEFAULT_TRANSPORT_STATE, isPlaying: true }
  }
}

/**
 * Stop playback
 */
export async function stopPlayback(): Promise<TransportState> {
  try {
    return await serverApi.stopPlaybackServer()
  } catch (error) {
    console.error("Error stopping playback:", error)
    return { ...DEFAULT_TRANSPORT_STATE, isPlaying: false }
  }
}

/**
 * Set the playhead position
 */
export async function setPlayheadPosition(position: number): Promise<TransportState> {
  try {
    return await serverApi.setPlayheadPositionServer(position)
  } catch (error) {
    console.error("Error setting playhead position:", error)
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
    return await serverApi.updateLoopStateServer(isLooping, loopRegion)
  } catch (error) {
    console.error("Error updating loop state:", error)
    return { ...DEFAULT_TRANSPORT_STATE, isLooping, loopRegion: loopRegion || null }
  }
}

/**
 * Update BPM
 */
export async function updateBpm(bpm: number): Promise<TransportState> {
  try {
    return await serverApi.updateBpmServer(bpm)
  } catch (error) {
    console.error("Error updating BPM:", error)
    return { ...DEFAULT_TRANSPORT_STATE, bpm }
  }
}

/**
 * Update time signature
 */
export async function updateTimeSignature(timeSignature: string): Promise<TransportState> {
  try {
    return await serverApi.updateTimeSignatureServer(timeSignature)
  } catch (error) {
    console.error("Error updating time signature:", error)
    return { ...DEFAULT_TRANSPORT_STATE, timeSignature }
  }
}
