/**
 * SEQ1 API Client
 * Centralized client for interacting with the SEQ1 backend API
 */

// API base URL - Updated to use dev.seq1.net for testing CORS issues
const API_BASE_URL = "https://dev.seq1.net"
const WS_BASE_URL = "wss://dev.seq1.net"

// API authentication
const API_KEY = "5lXQzdP_uqPgEq-cT-lu6I4r81lxRzZhI2SMS7sYeqU"

// Debug mode
const DEBUG = true

/**
 * Log debug information if debug mode is enabled
 */
function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log("[SEQ1 API]", ...args)
  }
}

/**
 * Check if the API key is valid
 * This is a simple function to replace the JWT-based isAuthenticated
 */
export function isAuthenticated(): boolean {
  return !!API_KEY
}

/**
 * Test API connectivity
 * This function attempts to make a simple request to the API to check if it's reachable
 */
export async function testApiConnectivity(): Promise<{
  success: boolean
  message: string
  details?: any
}> {
  try {
    debugLog("Testing API connectivity to", API_BASE_URL)

    // Try to fetch the API health endpoint
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: "GET",
      headers: {
        "X-API-Key": API_KEY,
      },
      // Add a timeout to prevent long waits
      signal: AbortSignal.timeout(5000),
    })

    if (response.ok) {
      debugLog("API connectivity test successful")
      return {
        success: true,
        message: "API is reachable",
      }
    } else {
      const errorData = await response.json().catch(() => ({}))
      debugLog("API connectivity test failed with status:", response.status, errorData)
      return {
        success: false,
        message: `API returned error status: ${response.status}`,
        details: errorData,
      }
    }
  } catch (error: any) {
    debugLog("API connectivity test failed with error:", error)

    // Provide more specific error messages based on the error type
    let errorMessage = "Unknown error occurred"

    if (error.name === "AbortError") {
      errorMessage = "Request timed out after 5 seconds"
    } else if (error.name === "TypeError" && error.message === "Failed to fetch") {
      errorMessage = "Network error: Failed to fetch. The API server may be unreachable or CORS issues may exist."
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

/**
 * Handle API errors
 */
function handleApiError(error: any): never {
  // Log the error with more details
  debugLog("API Error:", error)

  // If it's a TypeError with "Failed to fetch", provide more context
  if (error instanceof TypeError && error.message === "Failed to fetch") {
    debugLog("Network error: Failed to fetch. The API server may be unreachable or CORS issues may exist.")

    // Dispatch an event for network errors
    window.dispatchEvent(
      new CustomEvent("seq1:api:network-error", {
        detail: {
          message: "Unable to connect to the SEQ1 API. Please check your internet connection and try again.",
          originalError: error,
        },
      }),
    )

    throw new Error("Unable to connect to the SEQ1 API. Please check your internet connection and try again.")
  }

  // If the error is a response object, try to parse it
  if (error.response) {
    try {
      // If we get a 401 or 403, handle authentication error
      if (error.response.status === 401 || error.response.status === 403) {
        // Dispatch an event that can be caught by the auth context
        window.dispatchEvent(
          new CustomEvent("seq1:auth:error", {
            detail: { message: "Authentication failed. Please check your API credentials." },
          }),
        )
        throw new Error("Authentication failed. Please check your API credentials.")
      }

      // Otherwise, throw the error message from the response
      throw new Error(error.response.data?.message || "An error occurred")
    } catch (e) {
      throw e
    }
  }

  // If it's a network error, throw a more user-friendly message
  if (error.message === "Network Error") {
    throw new Error("Unable to connect to the SEQ1 API. Please check your internet connection.")
  }

  // Otherwise, just throw the error
  throw error
}

/**
 * Make an API request
 */
export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  debugLog(`Making ${options.method || "GET"} request to ${endpoint}`)

  // Set up headers
  const headers = new Headers(options.headers)
  headers.set("Content-Type", "application/json")
  headers.set("X-API-Key", API_KEY)

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

      // If we get a 401 or 403, handle authentication error
      if (response.status === 401 || response.status === 403) {
        window.dispatchEvent(
          new CustomEvent("seq1:auth:error", {
            detail: { message: "Authentication failed. Please check your API credentials." },
          }),
        )
        throw new Error("Authentication failed. Please check your API credentials.")
      }

      // Otherwise, throw the error
      throw {
        response: {
          status: response.status,
          data,
        },
      }
    }

    // If the response has an error property set to true, throw an error
    if (data.error === true) {
      debugLog(`API returned error:`, data)
      throw {
        response: {
          status: response.status,
          data,
        },
      }
    }

    // Return the data
    return data
  } catch (error) {
    debugLog(`Error in request to ${endpoint}:`, error)
    return handleApiError(error)
  }
}

/**
 * Create a WebSocket connection
 */
export function createWebSocket(onMessage: (event: MessageEvent) => void): WebSocket {
  debugLog("Creating WebSocket connection to", WS_BASE_URL)

  // Create the WebSocket connection
  const ws = new WebSocket(`${WS_BASE_URL}/ws/session`)

  // Set up event handlers
  ws.onopen = (event) => {
    debugLog("WebSocket connection opened")
    // Send the authentication token
    ws.send(JSON.stringify({ type: "authenticate", apiKey: API_KEY }))
  }

  ws.onmessage = (event) => {
    debugLog("WebSocket message received:", event.data)
    onMessage(event)
  }

  ws.onerror = (event) => {
    console.error("WebSocket error:", event)
    debugLog("WebSocket error:", event)
  }

  ws.onclose = (event) => {
    debugLog("WebSocket closed:", event)
    // Attempt to reconnect after a delay
    setTimeout(() => {
      debugLog("Attempting to reconnect WebSocket")
      createWebSocket(onMessage)
    }, 5000)
  }

  return ws
}

// Transport API

/**
 * Get the current transport state
 */
export async function getTransportState(): Promise<any> {
  return await apiRequest<any>("/api/transport")
}

/**
 * Start playback
 */
export async function startPlayback(): Promise<any> {
  return await apiRequest<any>("/api/transport/play", {
    method: "POST",
  })
}

/**
 * Stop playback
 */
export async function stopPlayback(): Promise<any> {
  return await apiRequest<any>("/api/transport/stop", {
    method: "POST",
  })
}

/**
 * Set the playhead position
 */
export async function setPlayheadPosition(position: number): Promise<any> {
  return await apiRequest<any>("/api/transport/playhead", {
    method: "POST",
    body: JSON.stringify({ position }),
  })
}

/**
 * Toggle loop state or update loop region
 */
export async function updateLoopState(
  isLooping: boolean,
  loopRegion?: { startBar: number; endBar: number } | null,
): Promise<any> {
  return await apiRequest<any>("/api/transport/loop", {
    method: "POST",
    body: JSON.stringify({ isLooping, loopRegion }),
  })
}

/**
 * Update BPM
 */
export async function updateBpm(bpm: number): Promise<any> {
  return await apiRequest<any>("/api/transport/bpm", {
    method: "POST",
    body: JSON.stringify({ bpm }),
  })
}

/**
 * Update time signature
 */
export async function updateTimeSignature(timeSignature: string): Promise<any> {
  return await apiRequest<any>("/api/transport/time-signature", {
    method: "POST",
    body: JSON.stringify({ timeSignature }),
  })
}

// Timeline API

/**
 * Get all timeline clips
 */
export async function getTimelineClips(): Promise<any> {
  return await apiRequest<any>("/api/clips")
}

/**
 * Create a new timeline clip
 */
export async function createTimelineClip(clip: any): Promise<any> {
  return await apiRequest<any>("/api/clips", {
    method: "POST",
    body: JSON.stringify(clip),
  })
}

/**
 * Update an existing timeline clip
 */
export async function updateTimelineClip(id: string, updates: any): Promise<any> {
  return await apiRequest<any>(`/api/clips/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  })
}

/**
 * Delete a timeline clip
 */
export async function deleteTimelineClip(id: string): Promise<any> {
  return await apiRequest<any>(`/api/clips/${id}`, {
    method: "DELETE",
  })
}

/**
 * Reorder timeline clips
 */
export async function reorderTimelineClips(orderedIds: string[]): Promise<any> {
  return await apiRequest<any>("/api/clips/reorder", {
    method: "POST",
    body: JSON.stringify({ orderedIds }),
  })
}

/**
 * Get MIDI content for a specific clip
 */
export async function getClipContent(id: string): Promise<any> {
  return await apiRequest<any>(`/api/clips/${id}/content`)
}

/**
 * Update MIDI content for a specific clip
 */
export async function updateClipContent(id: string, content: any): Promise<any> {
  return await apiRequest<any>(`/api/clips/${id}/content`, {
    method: "PUT",
    body: JSON.stringify(content),
  })
}

// Device API

/**
 * Get all connected devices
 */
export async function getDevices(): Promise<any> {
  return await apiRequest<any>("/api/devices")
}

/**
 * Add a new device
 */
export async function addDevice(device: any): Promise<any> {
  return await apiRequest<any>("/api/devices", {
    method: "POST",
    body: JSON.stringify(device),
  })
}

/**
 * Update device configuration
 */
export async function updateDevice(id: string, updates: any): Promise<any> {
  return await apiRequest<any>(`/api/devices/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  })
}

/**
 * Remove a device
 */
export async function removeDevice(id: string): Promise<any> {
  return await apiRequest<any>(`/api/devices/${id}`, {
    method: "DELETE",
  })
}

/**
 * Get available MIDI ports
 */
export async function getMidiPorts(): Promise<any> {
  return await apiRequest<any>("/api/midi/ports")
}

/**
 * Send MIDI message to a device
 */
export async function sendMidiMessage(deviceId: string, midiData: string): Promise<any> {
  return await apiRequest<any>("/api/midi/send", {
    method: "POST",
    body: JSON.stringify({ deviceId, midiData }),
  })
}

/**
 * Get available presets for a device
 */
export async function getDevicePresets(id: string): Promise<any> {
  return await apiRequest<any>(`/api/devices/${id}/presets`)
}

/**
 * Create a new preset
 */
export async function createDevicePreset(id: string, preset: any): Promise<any> {
  return await apiRequest<any>(`/api/devices/${id}/presets`, {
    method: "POST",
    body: JSON.stringify(preset),
  })
}

/**
 * Apply a preset to a device
 */
export async function applyDevicePreset(deviceId: string, presetId: string): Promise<any> {
  return await apiRequest<any>(`/api/devices/${deviceId}/presets/${presetId}`, {
    method: "PUT",
  })
}

// Chat API

/**
 * Send a chat message to the SEQ1 orchestration engine
 */
export async function sendChatMessage(
  prompt: string,
  deviceId?: string | null,
  clipId?: string | null,
  context?: any,
): Promise<any> {
  return await apiRequest<any>("/api/chat", {
    method: "POST",
    body: JSON.stringify({
      prompt,
      device_id: deviceId,
      clip_id: clipId,
      context,
    }),
  })
}

/**
 * Generate a synth preset based on description
 */
export async function generateSynthPreset(prompt: string, deviceId: string): Promise<any> {
  return await apiRequest<any>("/api/chat/synth-preset", {
    method: "POST",
    body: JSON.stringify({
      prompt,
      device_id: deviceId,
    }),
  })
}

/**
 * Update the emotional state context for the AI
 */
export async function updateEmotionalState(emotionalState: string, intensity: number): Promise<any> {
  return await apiRequest<any>("/api/chat/emotional-state", {
    method: "POST",
    body: JSON.stringify({
      emotionalState,
      intensity,
    }),
  })
}

/**
 * Get chat history
 */
export async function getChatHistory(): Promise<any> {
  return await apiRequest<any>("/api/chat/history")
}

// Project API

/**
 * Get all user projects
 */
export async function getProjects(): Promise<any> {
  return await apiRequest<any>("/api/projects")
}

/**
 * Create a new project
 */
export async function createProject(project: any): Promise<any> {
  return await apiRequest<any>("/api/projects", {
    method: "POST",
    body: JSON.stringify(project),
  })
}

/**
 * Get project details
 */
export async function getProject(id: string): Promise<any> {
  return await apiRequest<any>(`/api/projects/${id}`)
}

/**
 * Update project details
 */
export async function updateProject(id: string, updates: any): Promise<any> {
  return await apiRequest<any>(`/api/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  })
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<any> {
  return await apiRequest<any>(`/api/projects/${id}`, {
    method: "DELETE",
  })
}

/**
 * Export project to Ableton Live format
 */
export async function exportProject(id: string, format: string, includeAudio: boolean): Promise<any> {
  return await apiRequest<any>(`/api/projects/${id}/export`, {
    method: "POST",
    body: JSON.stringify({
      format,
      includeAudio,
    }),
  })
}

/**
 * Import project from Ableton Live format
 * This requires a multipart/form-data request, so we handle it differently
 */
export async function importProject(file: File): Promise<any> {
  const url = `${API_BASE_URL}/api/projects/import`

  debugLog("Importing project file:", file.name)

  // Create form data
  const formData = new FormData()
  formData.append("file", file)

  // Set up headers
  const headers = new Headers()
  headers.set("X-API-Key", API_KEY)

  // Make the request
  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    })

    debugLog("Import project response status:", response.status)

    // Parse the response
    let data
    try {
      data = await response.json()
      debugLog("Import project response data:", data)
    } catch (e) {
      debugLog("Error parsing import project response:", e)
      throw new Error("Invalid JSON response from API")
    }

    // Check if the response is an error
    if (!response.ok) {
      throw {
        response: {
          status: response.status,
          data,
        },
      }
    }

    // Return the data
    return data
  } catch (error) {
    debugLog("Error importing project:", error)
    return handleApiError(error)
  }
}

// Account API

/**
 * Get account information
 */
export async function getAccountInfo(): Promise<any> {
  return await apiRequest<any>("/api/account")
}

/**
 * Update account information
 */
export async function updateAccountInfo(updates: any): Promise<any> {
  return await apiRequest<any>("/api/account", {
    method: "PATCH",
    body: JSON.stringify(updates),
  })
}

/**
 * Update profile picture
 * This requires a multipart/form-data request, so we handle it differently
 */
export async function updateProfilePicture(file: File): Promise<any> {
  const url = `${API_BASE_URL}/api/account/profile-picture`

  debugLog("Updating profile picture:", file.name)

  // Create form data
  const formData = new FormData()
  formData.append("file", file)

  // Set up headers
  const headers = new Headers()
  headers.set("X-API-Key", API_KEY)

  // Make the request
  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    })

    debugLog("Update profile picture response status:", response.status)

    // Parse the response
    let data
    try {
      data = await response.json()
      debugLog("Update profile picture response data:", data)
    } catch (e) {
      debugLog("Error parsing update profile picture response:", e)
      throw new Error("Invalid JSON response from API")
    }

    // Check if the response is an error
    if (!response.ok) {
      throw {
        response: {
          status: response.status,
          data,
        },
      }
    }

    // Return the data
    return data
  } catch (error) {
    debugLog("Error updating profile picture:", error)
    return handleApiError(error)
  }
}

/**
 * Get billing information
 */
export async function getBillingInfo(): Promise<any> {
  return await apiRequest<any>("/api/billing")
}

/**
 * Add hours to account
 */
export async function topUpAccount(amount: number, currency: string, paymentMethod: string): Promise<any> {
  return await apiRequest<any>("/api/billing/top-up", {
    method: "POST",
    body: JSON.stringify({
      amount,
      currency,
      paymentMethod,
    }),
  })
}

/**
 * Get payment history
 */
export async function getPaymentHistory(): Promise<any> {
  return await apiRequest<any>("/api/billing/payment-history")
}

/**
 * Get referral information
 */
export async function getReferralInfo(): Promise<any> {
  return await apiRequest<any>("/api/referrals")
}

/**
 * Claim a referral code
 */
export async function claimReferralCode(code: string): Promise<any> {
  return await apiRequest<any>("/api/referrals/claim", {
    method: "POST",
    body: JSON.stringify({
      code,
    }),
  })
}

/**
 * Delete account
 */
export async function deleteAccount(confirmation: string): Promise<any> {
  return await apiRequest<any>("/api/account", {
    method: "DELETE",
    body: JSON.stringify({
      confirmation,
    }),
  })
}

/**
 * Undo last action
 */
export async function undoAction(): Promise<any> {
  return await apiRequest<any>("/api/history/undo", {
    method: "POST",
  })
}

/**
 * Redo last undone action
 */
export async function redoAction(): Promise<any> {
  return await apiRequest<any>("/api/history/redo", {
    method: "POST",
  })
}

/**
 * Decode and play a base64-encoded MIDI clip
 */
export async function playMidiClip(midiBase64: string, deviceId?: string) {
  try {
    // Send the MIDI data to the device
    if (deviceId) {
      return await sendMidiMessage(deviceId, midiBase64)
    }

    // If no device ID is provided, just log that we received the MIDI
    debugLog("MIDI data received (base64):", midiBase64.substring(0, 50) + "...")

    // Mock successful playback
    return { success: true }
  } catch (error) {
    debugLog("Error playing MIDI clip:", error)
    throw error
  }
}
