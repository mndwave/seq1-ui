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

/**
 * Get the current transport state - NO FALLBACKS
 */
export async function getTransportState(): Promise<TransportState> {
  console.log("🔴 DIRECT API CALL: Fetching transport state from API...")
  const response = await makeApiRequest("/api/transport")
  console.log("🔴 DIRECT API RESPONSE: Transport state:", response)
  return response
}

/**
 * Start playback - NO FALLBACKS
 */
export async function startPlayback(): Promise<TransportState> {
  console.log("🔴 DIRECT API CALL: Starting playback...")
  const response = await makeApiRequest("/api/transport/play", { method: "POST" })
  console.log("🔴 DIRECT API RESPONSE: Playback started:", response)
  return response
}

/**
 * Stop playback - NO FALLBACKS
 */
export async function stopPlayback(): Promise<TransportState> {
  console.log("🔴 DIRECT API CALL: Stopping playback...")
  const response = await makeApiRequest("/api/transport/stop", { method: "POST" })
  console.log("🔴 DIRECT API RESPONSE: Playback stopped:", response)
  return response
}

/**
 * Set the playhead position - NO FALLBACKS
 */
export async function setPlayheadPosition(position: number): Promise<TransportState> {
  console.log("🔴 DIRECT API CALL: Setting playhead position to:", position)
  const response = await makeApiRequest("/api/transport/playhead", {
    method: "POST",
    body: JSON.stringify({ position }),
  })
  console.log("🔴 DIRECT API RESPONSE: Playhead position set:", response)
  return response
}

/**
 * Toggle loop state or update loop region - NO FALLBACKS
 */
export async function updateLoopState(
  isLooping: boolean,
  loopRegion?: { startBar: number; endBar: number } | null,
): Promise<TransportState> {
  console.log("🔴 DIRECT API CALL: Updating loop state:", { isLooping, loopRegion })
  const response = await makeApiRequest("/api/transport/loop", {
    method: "POST",
    body: JSON.stringify({ isLooping, loopRegion }),
  })
  console.log("🔴 DIRECT API RESPONSE: Loop state updated:", response)
  return response
}

/**
 * Update BPM - NO FALLBACKS
 */
export async function updateBpm(bpm: number): Promise<TransportState> {
  console.log("🔴 DIRECT API CALL: Updating BPM to:", bpm)
  const response = await makeApiRequest("/api/transport/bpm", {
    method: "POST",
    body: JSON.stringify({ bpm }),
  })
  console.log("🔴 DIRECT API RESPONSE: BPM updated:", response)
  return response
}

/**
 * Update time signature - NO FALLBACKS
 */
export async function updateTimeSignature(timeSignature: string): Promise<TransportState> {
  console.log("🔴 DIRECT API CALL: Updating time signature to:", timeSignature)
  const response = await makeApiRequest("/api/transport/time-signature", {
    method: "POST",
    body: JSON.stringify({ timeSignature }),
  })
  console.log("🔴 DIRECT API RESPONSE: Time signature updated:", response)
  return response
}
