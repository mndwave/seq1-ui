/**
 * SEQ1 API Client
 * Centralized client for interacting with the SEQ1 backend API
 */

// API base URL
const API_BASE_URL = "https://api.seq1.net"
const WS_BASE_URL = "wss://api.seq1.net"

// Token storage keys
const TOKEN_STORAGE_KEY = "seq1_auth_token"

/**
 * Get the stored authentication token
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

/**
 * Store the authentication token
 */
export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
}

/**
 * Clear the stored authentication token
 */
export function clearAuthToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

/**
 * Check if the user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken()
}

/**
 * Handle API errors
 */
function handleApiError(error: any): never {
  // Log the error
  console.error("API Error:", error)

  // If the error is a response object, try to parse it
  if (error.response) {
    try {
      // If we get a 401, clear the token and redirect to login
      if (error.response.status === 401) {
        clearAuthToken()
        // Dispatch an event that can be caught by the auth context
        window.dispatchEvent(new CustomEvent("seq1:auth:expired"))
        throw new Error("Authentication required. Please log in again.")
      }

      // Otherwise, throw the error message from the response
      throw new Error(error.response.data.message || "An error occurred")
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
  const token = getAuthToken()

  // Set up headers
  const headers = new Headers(options.headers)
  headers.set("Content-Type", "application/json")
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  // Make the request
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Parse the response
    const data = await response.json()

    // Check if the response is an error
    if (!response.ok) {
      // If we get a 401, clear the token and redirect to login
      if (response.status === 401) {
        clearAuthToken()
        window.dispatchEvent(new CustomEvent("seq1:auth:expired"))
        throw new Error("Authentication required. Please log in again.")
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
    return handleApiError(error)
  }
}

/**
 * Create a WebSocket connection
 */
export function createWebSocket(onMessage: (event: MessageEvent) => void): WebSocket {
  const token = getAuthToken()
  if (!token) {
    throw new Error("Authentication required for WebSocket connection")
  }

  // Create the WebSocket connection
  const ws = new WebSocket(`${WS_BASE_URL}/ws/session`)

  // Set up event handlers
  ws.onopen = (event) => {
    // Send the authentication token
    ws.send(JSON.stringify({ type: "authenticate", token }))
  }

  ws.onmessage = onMessage

  ws.onerror = (event) => {
    console.error("WebSocket error:", event)
  }

  ws.onclose = (event) => {
    console.log("WebSocket closed:", event)
    // Attempt to reconnect after a delay
    setTimeout(() => {
      if (isAuthenticated()) {
        createWebSocket(onMessage)
      }
    }, 5000)
  }

  return ws
}

// Authentication API

/**
 * Login with Nostr private key or extension
 */
export async function login(data: { privateKey?: string; useExtension?: boolean }): Promise<any> {
  const response = await apiRequest<any>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  })

  // Store the token
  if (response.token) {
    setAuthToken(response.token)
  }

  return response
}

/**
 * Sign up a new user
 */
export async function signup(data: { username: string; displayName?: string; email?: string }): Promise<any> {
  const response = await apiRequest<any>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  })

  // Store the token
  if (response.token) {
    setAuthToken(response.token)
  }

  return response
}

/**
 * Logout the current user
 */
export async function logout(): Promise<any> {
  try {
    await apiRequest<any>("/api/auth/logout", {
      method: "POST",
    })
  } finally {
    // Always clear the token, even if the request fails
    clearAuthToken()
  }
}

/**
 * Check the current session
 */
export async function checkSession(): Promise<any> {
  return await apiRequest<any>("/api/auth/session")
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
  const token = getAuthToken()

  // Create form data
  const formData = new FormData()
  formData.append("file", file)

  // Set up headers
  const headers = new Headers()
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  // Make the request
  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    })

    // Parse the response
    const data = await response.json()

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
  const token = getAuthToken()

  // Create form data
  const formData = new FormData()
  formData.append("file", file)

  // Set up headers
  const headers = new Headers()
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  // Make the request
  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    })

    // Parse the response
    const data = await response.json()

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
    console.log("MIDI data received (base64):", midiBase64.substring(0, 50) + "...")

    // Mock successful playback
    return { success: true }
  } catch (error) {
    console.error("Error playing MIDI clip:", error)
    throw error
  }
}
