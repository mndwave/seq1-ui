/**
 * Client-side utility for interacting with the SEQ1 transport API
 */
import * as apiClient from "@/lib/api-client"

export interface TransportState {
  playheadPosition: number // Position in bars
  isPlaying: boolean
  isLooping: boolean
  loopRegion: {
    startBar: number
    endBar: number
  } | null
  bpm: number
  timeSignature: string
}

/**
 * Get the current transport state
 * @returns The current transport state
 */
export async function getTransportState(): Promise<TransportState> {
  try {
    return await apiClient.getTransportState()
  } catch (error) {
    console.error("Error getting transport state:", error)
    throw error
  }
}

/**
 * Start playback
 * @returns The updated transport state
 */
export async function startPlayback(): Promise<TransportState> {
  try {
    return await apiClient.startPlayback()
  } catch (error) {
    console.error("Error starting playback:", error)
    throw error
  }
}

/**
 * Stop playback
 * @returns The updated transport state
 */
export async function stopPlayback(): Promise<TransportState> {
  try {
    return await apiClient.stopPlayback()
  } catch (error) {
    console.error("Error stopping playback:", error)
    throw error
  }
}

/**
 * Set the playhead position
 * @param position The position in bars
 * @returns The updated transport state
 */
export async function setPlayheadPosition(position: number): Promise<TransportState> {
  try {
    return await apiClient.setPlayheadPosition(position)
  } catch (error) {
    console.error("Error setting playhead position:", error)
    throw error
  }
}

/**
 * Toggle loop state or update loop region
 * @param isLooping Whether looping is enabled
 * @param loopRegion Optional loop region to set
 * @returns The updated transport state
 */
export async function updateLoopState(
  isLooping: boolean,
  loopRegion?: { startBar: number; endBar: number } | null,
): Promise<TransportState> {
  try {
    return await apiClient.updateLoopState(isLooping, loopRegion)
  } catch (error) {
    console.error("Error updating loop state:", error)
    throw error
  }
}

/**
 * Update BPM
 * @param bpm The new BPM value
 * @returns The updated transport state
 */
export async function updateBpm(bpm: number): Promise<TransportState> {
  try {
    return await apiClient.updateBpm(bpm)
  } catch (error) {
    console.error("Error updating BPM:", error)
    throw error
  }
}

/**
 * Update time signature
 * @param timeSignature The new time signature
 * @returns The updated transport state
 */
export async function updateTimeSignature(timeSignature: string): Promise<TransportState> {
  try {
    return await apiClient.updateTimeSignature(timeSignature)
  } catch (error) {
    console.error("Error updating time signature:", error)
    throw error
  }
}
