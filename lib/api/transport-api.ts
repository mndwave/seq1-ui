/**
 * Client-side utility for interacting with the SEQ1 transport API
 */

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
    const response = await fetch("/api/transport", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to get transport state")
    }

    return await response.json()
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
    const response = await fetch("/api/transport/play", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to start playback")
    }

    return await response.json()
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
    const response = await fetch("/api/transport/stop", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to stop playback")
    }

    return await response.json()
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
    const response = await fetch("/api/transport/playhead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ position }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to set playhead position")
    }

    return await response.json()
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
    const response = await fetch("/api/transport/loop", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isLooping, loopRegion }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to update loop state")
    }

    return await response.json()
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
    const response = await fetch("/api/transport/bpm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ bpm }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to update BPM")
    }

    return await response.json()
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
    const response = await fetch("/api/transport/time-signature", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ timeSignature }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to update time signature")
    }

    return await response.json()
  } catch (error) {
    console.error("Error updating time signature:", error)
    throw error
  }
}
