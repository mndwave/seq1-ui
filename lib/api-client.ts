// lib/api-client.ts
import { SystemAPI, TransportAPI } from "@/lib/api-services" // For actual logic
import type { TransportState } from "@/lib/api/transport-api" // Assuming this type is correct
import type { SystemStatus } from "@/lib/types" // Assuming a SystemStatus type exists

const DEBUG = process.env.NODE_ENV === "development"

function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log("[SEQ1 API Client]", ...args)
  }
}

export class SEQ1APIClient {
  baseURL: string
  token: string | null
  sessionId: string | null
  sessionStartTime: string | null
  SESSION_DURATION: number
  private eventListeners: Record<string, ((data: any) => void)[]> = {}

  constructor(baseURL: string = process.env.NEXT_PUBLIC_SEQ1_API_URL || "https://api.seq1.net") {
    this.baseURL = baseURL
    this.token = typeof window !== "undefined" ? localStorage.getItem("seq1_jwt_token") : null
    this.sessionId = typeof window !== "undefined" ? localStorage.getItem("seq1_session_id") : null
    this.sessionStartTime = typeof window !== "undefined" ? localStorage.getItem("seq1_session_start") : null
    this.SESSION_DURATION = 3 * 60 * 60 * 1000 // 3 hours in ms
  }

  // Generic request method (direct)
  async directRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`
    debugLog(`Making direct ${options.method || "GET"} request to ${url}`)

    const headers = new Headers(options.headers || {})
    if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
      // Check if body is string for JSON
      headers.set("Content-Type", "application/json")
    }

    if (this.token) {
      headers.set("Authorization", `Bearer ${this.token}`)
    } else if (this.sessionId) {
      headers.set("X-Session-ID", this.sessionId)
    }

    const response = await fetch(url, { ...options, headers })

    if (response.status === 401 && typeof window !== "undefined") {
      this.clearToken()
      window.dispatchEvent(new CustomEvent("seq1:auth:required", { detail: { message: "Authentication required" } }))
      this.emit("auth-required", { message: "Authentication required" })
      throw { status: 401, message: "Authentication required" }
    }

    if (response.status === 419 && typeof window !== "undefined") {
      this.clearSession()
      window.dispatchEvent(new CustomEvent("seq1:session:expired", { detail: { message: "Session expired" } }))
      this.emit("session-expired", { message: "Session expired - please sign up to continue" })
      throw { status: 419, message: "Session expired - please sign up to continue" }
    }

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: `API request failed: ${response.status} ${response.statusText}` }))
      throw { status: response.status, ...errorData }
    }

    if (response.status === 204) return undefined as T // No content
    return response.json()
  }

  // Generic request method (proxied)
  async proxiedRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const proxiedUrl = `/api/proxy${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`
    debugLog(
      `Making proxied ${options.method || "GET"} request to ${proxiedUrl} (targeting ${this.baseURL}${endpoint})`,
    )

    const headers = new Headers(options.headers || {})
    if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
      // Check if body is string for JSON
      headers.set("Content-Type", "application/json")
    }
    // JWT token and Session ID will be added by the proxy if configured, or can be added here if proxy doesn't handle it.
    // For now, assuming proxy might handle auth forwarding or these are added if needed.

    const response = await fetch(proxiedUrl, { ...options, headers })

    if (response.status === 401 && typeof window !== "undefined") {
      this.clearToken()
      window.dispatchEvent(new CustomEvent("seq1:auth:required", { detail: { message: "Authentication required" } }))
      this.emit("auth-required", { message: "Authentication required" })
      throw { status: 401, message: "Authentication required" }
    }
    if (response.status === 419 && typeof window !== "undefined") {
      this.clearSession()
      window.dispatchEvent(new CustomEvent("seq1:session:expired", { detail: { message: "Session expired" } }))
      this.emit("session-expired", { message: "Session expired - please sign up to continue" })
      throw { status: 419, message: "Session expired - please sign up to continue" }
    }

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: `API request failed: ${response.status} ${response.statusText}` }))
      throw { status: response.status, ...errorData }
    }
    if (response.status === 204) return undefined as T
    return response.json()
  }

  // Use proxiedRequest by default for client-side calls, directRequest for server-side or specific cases
  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // In a real scenario, you might have logic to decide. For now, defaulting to proxied.
    // If this apiClient is used server-side (e.g. in API routes), directRequest might be better.
    return this.proxiedRequest<T>(endpoint, options)
  }

  async startAnonymousSession(): Promise<void> {
    if (this.token || typeof window === "undefined") return

    if (!this.sessionId || this.isSessionExpired()) {
      debugLog("Starting/refreshing anonymous session.")
      try {
        // This call should be to your actual backend for setting up the initial session.
        const { sessionId } = await this.directRequest<{ sessionId: string }>("/api/sessions/anonymous", {
          method: "POST",
        })

        this.sessionId = sessionId
        this.sessionStartTime = Date.now().toString()
        localStorage.setItem("seq1_session_id", this.sessionId)
        localStorage.setItem("seq1_session_start", this.sessionStartTime)
        debugLog("Anonymous session started/refreshed:", this.sessionId)
        this.emit("session-started", { sessionId: this.sessionId })
      } catch (error) {
        console.error("Failed to start anonymous session:", error)
        this.emit("session-error", error)
      }
    }
  }

  isSessionExpired(): boolean {
    if (typeof window === "undefined" || !this.sessionStartTime) return true
    return Date.now() - Number.parseInt(this.sessionStartTime, 10) > this.SESSION_DURATION
  }

  getTimeRemaining(): number {
    if (typeof window === "undefined" || !this.sessionStartTime) return 0
    const elapsed = Date.now() - Number.parseInt(this.sessionStartTime, 10)
    return Math.max(0, this.SESSION_DURATION - elapsed)
  }

  setToken(token: string): void {
    if (typeof window === "undefined") return
    this.token = token
    localStorage.setItem("seq1_jwt_token", token)
    debugLog("JWT token set.")
    this.emit("token-set", { token })
  }

  clearToken(): void {
    if (typeof window === "undefined") return
    this.token = null
    localStorage.removeItem("seq1_jwt_token")
    debugLog("JWT token cleared.")
    this.emit("token-cleared", {})
  }

  clearSession(): void {
    if (typeof window === "undefined") return
    this.sessionId = null
    this.sessionStartTime = null
    localStorage.removeItem("seq1_session_id")
    localStorage.removeItem("seq1_session_start")
    debugLog("Anonymous session data cleared.")
    this.emit("session-cleared", {})
  }

  // Basic event emitter
  on(event: string, listener: (data: any) => void): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = []
    }
    this.eventListeners[event].push(listener)
  }

  off(event: string, listener: (data: any) => void): void {
    if (!this.eventListeners[event]) return
    this.eventListeners[event] = this.eventListeners[event].filter((l) => l !== listener)
  }

  emit(event: string, data: any): void {
    if (!this.eventListeners[event]) return
    this.eventListeners[event].forEach((listener) => listener(data))
  }
}

export const apiClient = new SEQ1APIClient()

// --- Functions to satisfy the deployment error ---

/**
 * Fetches the system status.
 * This now delegates to SystemAPI.getSystemStatus or SystemAPI.testApiConnectivity.
 */
export async function getSystemStatus(): Promise<SystemStatus | { success: boolean; message: string; data?: any }> {
  debugLog("Legacy getSystemStatus called, delegating to SystemAPI...")
  // Option 1: Use testApiConnectivity if that's what TransportStatusIndicator uses
  // return SystemAPI.testApiConnectivity();

  // Option 2: Use a more generic getSystemStatus if available and it fits SystemStatus type
  // For now, let's assume testApiConnectivity is preferred for a simple status check.
  try {
    // Adapting to return a SystemStatus-like object or the test connectivity result
    const result = await SystemAPI.testApiConnectivity()
    if (result.success && result.data) {
      // Attempt to map to SystemStatus if possible, otherwise return a simplified status
      return {
        status: result.data.status || "online", // Assuming health-check returns a status field
        version: result.data.version || "N/A", // Assuming health-check returns a version
        message: result.message, // Include the message from testApiConnectivity
        raw: result.data, // Include raw data for more context
      } as SystemStatus // Cast, ensure your SystemStatus type matches
    }
    return {
      // Fallback if data is not as expected
      status: result.success ? "online" : "offline",
      version: "N/A",
      message: result.message,
    } as SystemStatus
  } catch (error: any) {
    console.error("Error in getSystemStatus via SystemAPI:", error)
    return {
      status: "error",
      version: "N/A",
      message: error.message || "Failed to get system status",
    } as SystemStatus
  }
}

/**
 * Checks the current session status.
 * This now delegates to authManager.checkAuthStatus() or checks apiClient properties.
 */
export async function checkSession(): Promise<{ isAuthenticated: boolean; user: any | null; error?: string }> {
  debugLog("Legacy checkSession called, delegating to authManager or apiClient state...")
  if (typeof window === "undefined") {
    return { isAuthenticated: false, user: null, error: "Session check unavailable server-side" }
  }
  // Option 1: Use authManager (more comprehensive, involves async)
  // try {
  //   const authStatus = await authManager.checkAuthStatus();
  //   return { isAuthenticated: authStatus.isAuthenticated, user: authStatus.user };
  // } catch (error: any) {
  //   return { isAuthenticated: false, user: null, error: error.message };
  // }

  // Option 2: Simpler check based on apiClient token/session (less comprehensive)
  if (apiClient.token) {
    // Ideally, you'd verify the token or get user info associated with it
    return { isAuthenticated: true, user: { npub: "User (JWT)" } } // Placeholder user
  }
  if (apiClient.sessionId && !apiClient.isSessionExpired()) {
    return { isAuthenticated: false, user: { id: "Anonymous Session" } } // Indicate anonymous session
  }
  return { isAuthenticated: false, user: null }
}

/**
 * Fetches the current transport state.
 * This now delegates to TransportAPI.getState().
 */
export async function getTransportState(): Promise<TransportState> {
  debugLog("Legacy getTransportState called, delegating to TransportAPI.getState()...")
  return TransportAPI.getState()
}

/**
 * Fetches the public transport state.
 * This now delegates to TransportAPI.getPublicTransportState().
 */
export async function getPublicTransportState(): Promise<Partial<TransportState>> {
  debugLog("Legacy getPublicTransportState called, delegating to TransportAPI.getPublicTransportState()...")
  return TransportAPI.getPublicTransportState()
}

// Legacy WebSocket creation, if still needed by any part of the old code.
// Consider removing if SEQ1WebSocket from phase 03 is fully adopted.
function wsDebugLog(...args: any[]) {
  if (DEBUG) {
    console.log("[Legacy WebSocket]", ...args)
  }
}
export function createWebSocket(onMessageCallback: (event: MessageEvent) => void): WebSocket {
  if (typeof window === "undefined" || typeof WebSocket === "undefined") {
    wsDebugLog("WebSocket not supported in this environment.")
    // Return a mock WebSocket that adheres to the interface but does nothing.
    return {
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3,
      readyState: 3, // CLOSED
      binaryType: "blob",
      bufferedAmount: 0,
      extensions: "",
      protocol: "",
      url: "",
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
      close: () => wsDebugLog("Mock WS close called"),
      send: (data: any) => wsDebugLog("Mock WS send called with:", data),
      addEventListener: <K extends keyof WebSocketEventMap>(
        type: K,
        listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
        options?: boolean | AddEventListenerOptions,
      ): void => wsDebugLog(`Mock WS addEventListener for ${type} called`),
      removeEventListener: <K extends keyof WebSocketEventMap>(
        type: K,
        listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
        options?: boolean | EventListenerOptions,
      ): void => wsDebugLog(`Mock WS removeEventListener for ${type} called`),
      dispatchEvent: (event: Event): boolean => {
        wsDebugLog("Mock WS dispatchEvent called with:", event)
        return true
      },
    } as WebSocket
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
  // Assuming your WebSocket proxy is at /api/ws-proxy
  const wsProxyUrl = `${protocol}//${window.location.host}/api/ws-proxy`
  wsDebugLog("Creating legacy WebSocket connection to proxy:", wsProxyUrl)

  const socket = new WebSocket(wsProxyUrl)

  socket.onopen = () => {
    wsDebugLog("Legacy WebSocket connection established.")
  }

  socket.onmessage = (event) => {
    wsDebugLog("Legacy WebSocket message received:", event.data)
    onMessageCallback(event) // Call the provided callback
  }

  socket.onerror = (error) => {
    wsDebugLog("Legacy WebSocket error:", error)
  }

  socket.onclose = (event) => {
    wsDebugLog("Legacy WebSocket connection closed:", event.code, event.reason)
  }

  return socket
}
