"use client"

/**
 * SEQ1 API Client
 * This is the client-side API client that does NOT contain sensitive environment variables
 */

// Debug mode
const DEBUG = true

/**
 * Log debug information if debug mode is enabled
 */
function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log("[SEQ1 API Client]", ...args)
  }
}

/**
 * Check if the user is authenticated
 * This is a client-side check that doesn't expose the API key
 */
export function isAuthenticated(): boolean {
  // We'll rely on the server to tell us if we're authenticated
  // This is just a placeholder that always returns true
  // In a real implementation, you would check a cookie or local storage
  return true
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
    // Test basic connectivity to the API
    const response = await fetch("/api/test-connectivity")
    const data = await response.json()
    return {
      success: data.success,
      message: data.message,
      details: data,
    }
  } catch (error) {
    console.error("Error testing API connectivity:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to connect to API",
    }
  }
}

/**
 * Make an authenticated API request from the client
 */
async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // Use the proxy endpoint to make authenticated requests
  const url = `/api/proxy${endpoint}`

  debugLog(`Making ${options.method || "GET"} request to ${endpoint} via proxy`)

  // Set up headers
  const headers = new Headers(options.headers)
  headers.set("Content-Type", "application/json")

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
    window.dispatchEvent(
      new CustomEvent("seq1:api:network-error", {
        detail: { message: error.message, originalError: error },
      }),
    )
    throw new Error(error.message || "An error occurred")
  }
}

/**
 * Get system status
 */
export async function getSystemStatus() {
  try {
    const response = await fetch("/api/health-check")
    const data = await response.json()
    return {
      status: data.status === "ok" ? "online" : "offline",
      message: data.message,
      details: data,
    }
  } catch (error) {
    console.error("Error checking system status:", error)
    return {
      status: "offline",
      message: "Failed to check system status",
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Get transport state
 */
export async function getTransportState(): Promise<any> {
  try {
    return await apiRequest("/api/transport")
  } catch (error) {
    console.error("Error getting transport state:", error)
    throw new Error("Failed to get transport state")
  }
}

/**
 * Get public transport state
 */
export async function getPublicTransportState(): Promise<any> {
  try {
    // Use the proxy for public endpoints too for consistency
    return await fetch("/api/proxy/api/public/transport", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json())
  } catch (error) {
    console.error("Error getting public transport state:", error)
    throw new Error("Failed to get public transport state")
  }
}

/**
 * Check session
 */
export async function checkSession(): Promise<any> {
  return await apiRequest("/api/auth/session")
}

/**
 * Send a chat message
 */
export async function sendChatMessage(prompt: string, deviceId: string, clipId: string): Promise<any> {
  return await apiRequest("/api/chat", {
    method: "POST",
    body: JSON.stringify({ prompt, device_id: deviceId, clip_id: clipId }),
  })
}

/**
 * Create a WebSocket connection to the SEQ1 API
 * This uses a proxy to avoid exposing the API key
 */
export function createWebSocket(onMessage: (event: MessageEvent) => void): WebSocket {
  // Check if WebSocket is supported
  if (typeof WebSocket === "undefined") {
    console.warn("WebSocket is not supported in this environment")
    // Return a mock WebSocket that doesn't do anything
    return {
      close: () => {},
      send: () => {},
      readyState: WebSocket.CLOSED,
      onopen: null,
      onclose: null,
      onmessage: null,
      onerror: null,
    } as WebSocket
  }

  // Use a local WebSocket proxy instead of connecting directly to the API
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
  const wsProxyUrl = `${protocol}//${window.location.host}/api/ws-proxy`
  debugLog("Creating WebSocket connection to proxy:", wsProxyUrl)

  let ws: WebSocket
  let reconnectAttempts = 0
  const maxReconnectAttempts = 5
  const reconnectDelay = 5000

  function createConnection(): WebSocket {
    try {
      const socket = new WebSocket(wsProxyUrl)

      socket.onopen = () => {
        debugLog("WebSocket connection opened")
        reconnectAttempts = 0 // Reset reconnect attempts on successful connection
      }

      socket.onmessage = (event) => {
        debugLog("WebSocket message received:", event.data)
        try {
          onMessage(event)
        } catch (error) {
          console.error("Error handling WebSocket message:", error)
        }
      }

      socket.onerror = (error) => {
        console.warn("WebSocket connection error (this is normal if the API server is not running):", error)
        // Don't throw an error here, just log it
      }

      socket.onclose = (event) => {
        debugLog("WebSocket connection closed:", event.code, event.reason)

        // Only attempt to reconnect if it wasn't a manual close and we haven't exceeded max attempts
        if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++
          debugLog(`Attempting to reconnect WebSocket (attempt ${reconnectAttempts}/${maxReconnectAttempts})...`)
          setTimeout(() => {
            try {
              ws = createConnection()
            } catch (error) {
              console.warn("Failed to reconnect WebSocket:", error)
            }
          }, reconnectDelay)
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          console.warn("Max WebSocket reconnection attempts reached. WebSocket functionality will be disabled.")
        }
      }

      return socket
    } catch (error) {
      console.warn("Failed to create WebSocket connection (this is normal if the API server is not running):", error)
      // Return a mock WebSocket that doesn't do anything
      return {
        close: () => {},
        send: () => {},
        readyState: WebSocket.CLOSED,
        onopen: null,
        onclose: null,
        onmessage: null,
        onerror: null,
      } as WebSocket
    }
  }

  ws = createConnection()
  return ws
}

/**
 * Play a MIDI clip
 * This uses a proxy to avoid exposing the API key
 */
export async function playMidiClip(midiBase64: string, deviceId?: string): Promise<void> {
  try {
    debugLog("Playing MIDI clip", { deviceId })

    // Use a local API route to avoid exposing the API key
    const response = await fetch("/api/midi/play", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ midiBase64, deviceId }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Failed to play MIDI clip")
    }

    debugLog("MIDI clip played successfully")
  } catch (error: any) {
    console.error("Error playing MIDI clip:", error)
    throw new Error(error.message || "An error occurred")
  }
}
