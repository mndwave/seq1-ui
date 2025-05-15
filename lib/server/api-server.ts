// API base URL - can be public
const API_BASE_URL = process.env.NEXT_PUBLIC_SEQ1_API_URL || "https://api.seq1.net"
// WebSocket base URL - ensure we're using wss:// for secure connections
const WS_BASE_URL = (process.env.NEXT_PUBLIC_SEQ1_API_URL || "https://api.seq1.net")
  .replace("https://", "wss://")
  .replace("http://", "ws://")
// API key - use server-only environment variable
const API_KEY = process.env.SEQ1_API_KEY || ""

// Debug mode
const DEBUG = true

/**
 * Log debug information if debug mode is enabled
 */
function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log("[SEQ1 API Server]", ...args)
  }
}

/**
 * Check if the API key is available
 */
export function isAuthenticated(): boolean {
  return !!API_KEY && API_KEY.length > 0
}

/**
 * Get the WebSocket URL with authentication token
 */
export function getAuthenticatedWebSocketUrl(): string {
  return `${WS_BASE_URL}/ws/session?token=${API_KEY}`
}

/**
 * Make an authenticated API request from the server
 */
export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  debugLog(`Making ${options.method || "GET"} request to ${endpoint}`)

  // Set up headers
  const headers = new Headers(options.headers)
  headers.set("Content-Type", "application/json")
  headers.set("Authorization", `Bearer ${API_KEY}`)

  // Make the request
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    debugLog(`Received response from ${endpoint} with status:`, response.status)

    // Parse the response
    let data
    try {
      data = await response.json()
      debugLog(`Response data:`, data)
    } catch (e) {
      debugLog(`Error parsing JSON response:`, e)
      throw new Error("Invalid JSON response from API")
    }

    // Check if the response is an error
    if (!response.ok) {
      debugLog(`Error response from ${endpoint}:`, response.status, data)
      throw new Error(data.message || "An error occurred")
    }

    // Return the data
    return data
  } catch (error: any) {
    debugLog(`Error in request to ${endpoint}:`, error)
    throw new Error(error.message || "An error occurred")
  }
}

/**
 * Check API health
 */
export async function checkApiHealth(): Promise<{
  success: boolean
  message: string
  details?: any
}> {
  try {
    debugLog("Checking API health")

    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Add a timeout to prevent long waits
      signal: AbortSignal.timeout(5000),
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        message: "API is healthy",
        details: data,
      }
    } else {
      return {
        success: false,
        message: `API returned error status: ${response.status}`,
      }
    }
  } catch (error: any) {
    debugLog("API health check failed:", error)

    let errorMessage = "Unknown error occurred"
    if (error.name === "AbortError") {
      errorMessage = "Request timed out after 5 seconds"
    } else if (error.name === "TypeError" && error.message === "Failed to fetch") {
      errorMessage = "Network error: Failed to fetch. The API server may be unreachable."
    } else if (error.message) {
      errorMessage = error.message
    }

    return {
      success: false,
      message: errorMessage,
      details: error,
    }
  }
}

// Server actions for transport API
export async function getTransportStateServer() {
  return apiRequest("/api/transport")
}

export async function startPlaybackServer() {
  return apiRequest("/api/transport/play", { method: "POST" })
}

export async function stopPlaybackServer() {
  return apiRequest("/api/transport/stop", { method: "POST" })
}

export async function setPlayheadPositionServer(position: number) {
  return apiRequest("/api/transport/playhead", {
    method: "POST",
    body: JSON.stringify({ position }),
  })
}

export async function updateLoopStateServer(
  isLooping: boolean,
  loopRegion?: { startBar: number; endBar: number } | null,
) {
  return apiRequest("/api/transport/loop", {
    method: "POST",
    body: JSON.stringify({ isLooping, loopRegion }),
  })
}

export async function updateBpmServer(bpm: number) {
  return apiRequest("/api/transport/bpm", {
    method: "POST",
    body: JSON.stringify({ bpm }),
  })
}

export async function updateTimeSignatureServer(timeSignature: string) {
  return apiRequest("/api/transport/time-signature", {
    method: "POST",
    body: JSON.stringify({ timeSignature }),
  })
}

// Server actions for timeline API
export async function getTimelineClipsServer() {
  return apiRequest("/api/clips")
}

export async function createTimelineClipServer(clip: any) {
  return apiRequest("/api/clips", {
    method: "POST",
    body: JSON.stringify(clip),
  })
}

export async function updateTimelineClipServer(id: string, updates: any) {
  return apiRequest(`/api/clips/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  })
}

export async function deleteTimelineClipServer(id: string) {
  return apiRequest(`/api/clips/${id}`, {
    method: "DELETE",
  })
}

export async function reorderTimelineClipsServer(orderedIds: string[]) {
  return apiRequest("/api/clips/reorder", {
    method: "POST",
    body: JSON.stringify({ orderedIds }),
  })
}

// Server actions for device API
export async function getDevicesServer() {
  return apiRequest("/api/devices")
}

export async function addDeviceServer(device: any) {
  return apiRequest("/api/devices", {
    method: "POST",
    body: JSON.stringify(device),
  })
}

export async function updateDeviceServer(id: string, updates: any) {
  return apiRequest(`/api/devices/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  })
}

export async function removeDeviceServer(id: string) {
  return apiRequest(`/api/devices/${id}`, {
    method: "DELETE",
  })
}

// Server actions for MIDI API
export async function getMidiPortsServer() {
  return apiRequest("/api/midi/ports")
}

export async function sendMidiMessageServer(deviceId: string, midiData: string) {
  return apiRequest("/api/midi/send", {
    method: "POST",
    body: JSON.stringify({ deviceId, midiData }),
  })
}

// Server actions for account API
export async function getAccountInfoServer() {
  return apiRequest("/api/account")
}

export async function updateAccountInfoServer(profile: any) {
  return apiRequest("/api/account", {
    method: "POST",
    body: JSON.stringify(profile),
  })
}

// Check authentication status
export async function checkAuthStatusServer() {
  try {
    const response = await apiRequest("/api/auth/session")
    return { isAuthenticated: true, user: response }
  } catch (error) {
    return { isAuthenticated: false, user: null }
  }
}
