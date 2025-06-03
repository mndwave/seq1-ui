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

// Types from the new document
interface AnonymousSessionCreateResponse {
  session_id: string
  created_at: string // ISO Date string
  expires_at: string // ISO Date string
  time_remaining: number // seconds
  usage_percentage: number
  // ... any other fields returned
}

interface AnonymousSessionStatusResponse {
  session_id: string
  time_remaining: number // seconds
  usage_percentage: number
  is_expired: boolean
  is_active: boolean
  // ... any other fields
}

interface AnonymousSessionHeartbeatResponse {
  session_id: string
  used_time: number // seconds
  time_remaining: number // seconds
  usage_percentage: number
  is_expired: boolean
  // ... any other fields
}

interface ConvertToRegisteredUserResponse {
  session_id: string
  converted_to_npub: string
  total_trial_time: number // seconds
  preserved_data: any // or a more specific type
  success: boolean
  // ... any other fields
}

interface AuthTokenResponse {
  token: string
  // ... any other fields
}

export class SEQ1APIClient {
  baseURL: string
  token: string | null
  sessionId: string | null
  sessionStartTime: string | null // Store actual start time from server if available, or client's perception
  sessionExpiresAt: string | null // Store actual expiry time from server
  SESSION_DURATION: number // Milliseconds

  private eventListeners: Record<string, ((data: any) => void)[]> = {}

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.seq1.net"
    const trialDurationHours = Number.parseFloat(process.env.NEXT_PUBLIC_TRIAL_DURATION_HOURS || "3")
    this.SESSION_DURATION = trialDurationHours * 60 * 60 * 1000 // Convert hours to ms

    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("seq1_jwt_token")
      this.sessionId = localStorage.getItem("seq1_anonymous_session_id") // Updated key name
      this.sessionStartTime = localStorage.getItem("seq1_session_start_time")
      this.sessionExpiresAt = localStorage.getItem("seq1_session_expires_at")
    } else {
      this.token = null
      this.sessionId = null
      this.sessionStartTime = null
      this.sessionExpiresAt = null
    }
  }

  // Generic request method (direct) - for calls directly to API base URL
  async directRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`
    debugLog(`Making direct ${options.method || "GET"} request to ${url}`)

    const headers = new Headers(options.headers || {})
    if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
      headers.set("Content-Type", "application/json")
    }

    if (this.token) {
      headers.set("Authorization", `Bearer ${this.token}`)
    } else if (this.sessionId && !endpoint.includes("/api/auth/nostr")) {
      // Don't send session ID for auth token request
      // Only add X-Session-ID if it's an anonymous session request, not for getting JWT
      if (endpoint.startsWith("/api/sessions/anonymous") || endpoint.startsWith("/api/proxy")) {
        headers.set("X-Session-ID", this.sessionId)
      }
    }

    const response = await fetch(url, { ...options, headers })

    if (response.status === 401 && typeof window !== "undefined") {
      this.clearToken() // Clear JWT
      // Optionally clear session_id if 401 means anonymous session is also invalid
      // this.clearAnonymousSessionDetails();
      window.dispatchEvent(new CustomEvent("seq1:auth:required", { detail: { message: "Authentication required" } }))
      this.emit("auth-required", { message: "Authentication required" })
      // Do not throw here if specific handlers in AuthContext will manage UI
    }

    if (response.status === 410 && typeof window !== "undefined") {
      // Trial expired
      this.clearAnonymousSessionDetails()
      window.dispatchEvent(new CustomEvent("seq1:trial:expired", { detail: { message: "Trial expired" } }))
      this.emit("trial-expired", { message: "Trial expired" })
    }

    // 419 was previously used for session expiry, but 410 seems more specific for trial
    if (response.status === 419 && typeof window !== "undefined") {
      this.clearAnonymousSessionDetails()
      window.dispatchEvent(new CustomEvent("seq1:session:expired", { detail: { message: "Session expired" } }))
      this.emit("session-expired", { message: "Session expired - please sign up to continue" })
    }

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: `API request failed: ${response.status} ${response.statusText}` }))
      // Include status in the thrown error object
      throw { status: response.status, ...errorData }
    }

    if (response.status === 204) return undefined as T // No content
    return response.json()
  }

  // Generic request method (proxied) - for calls via Next.js /api/proxy
  async proxiedRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const proxiedUrl = `/api/proxy${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`
    debugLog(
      `Making proxied ${options.method || "GET"} request to ${proxiedUrl} (targeting ${this.baseURL}${endpoint})`,
    )

    const headers = new Headers(options.headers || {})
    if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
      headers.set("Content-Type", "application/json")
    }
    // JWT token and Session ID are expected to be handled by the proxy or added by directRequest logic if it's called by proxy

    const response = await fetch(proxiedUrl, { ...options, headers })

    // Error handling for 401/410/419 can also be centralized here if proxy returns these statuses directly
    if (response.status === 401 && typeof window !== "undefined") {
      this.clearToken()
      window.dispatchEvent(
        new CustomEvent("seq1:auth:required", { detail: { message: "Authentication required via proxy" } }),
      )
      this.emit("auth-required", { message: "Authentication required via proxy" })
    }
    if (response.status === 410 && typeof window !== "undefined") {
      this.clearAnonymousSessionDetails()
      window.dispatchEvent(new CustomEvent("seq1:trial:expired", { detail: { message: "Trial expired via proxy" } }))
      this.emit("trial-expired", { message: "Trial expired via proxy" })
    }
    if (response.status === 419 && typeof window !== "undefined") {
      this.clearAnonymousSessionDetails()
      window.dispatchEvent(
        new CustomEvent("seq1:session:expired", { detail: { message: "Session expired via proxy" } }),
      )
      this.emit("session-expired", { message: "Session expired via proxy" })
    }

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: `API request failed via proxy: ${response.status} ${response.statusText}` }))
      throw { status: response.status, ...errorData }
    }
    if (response.status === 204) return undefined as T
    return response.json()
  }

  // Default request method for general API calls (e.g., /api/clips, /api/devices)
  // These should typically go through the proxy.
  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.proxiedRequest<T>(endpoint, options)
  }

  // --- Anonymous Session API Methods ---
  async createAnonymousSession(): Promise<AnonymousSessionCreateResponse> {
    if (typeof window === "undefined") throw new Error("Cannot create anonymous session on server.")
    debugLog("Creating anonymous session.")
    try {
      // Use simpler request body to avoid backend JSON serialization bug
      const response = await this.directRequest<AnonymousSessionCreateResponse>("/api/sessions/anonymous/create", {
        method: "POST",
        body: JSON.stringify({
          user_agent: navigator.userAgent,
          ip_address: null, // Backend will detect
          // Temporarily remove session_data due to backend JSONB serialization bug
          // session_data: {
          //   theme: localStorage.getItem("theme") || "dark",
          //   client_app_version: process.env.NEXT_PUBLIC_APP_VERSION || "unknown",
          // },
        }),
      })

      this.sessionId = response.session_id
      this.sessionStartTime = response.created_at // Use server's created_at as start time
      this.sessionExpiresAt = response.expires_at
      localStorage.setItem("seq1_anonymous_session_id", this.sessionId)
      localStorage.setItem("seq1_session_start_time", this.sessionStartTime)
      localStorage.setItem("seq1_session_expires_at", this.sessionExpiresAt)
      debugLog("Anonymous session created:", response)
      this.emit("anonymous-session-created", response)
      return response
    } catch (error) {
      console.error("Failed to create anonymous session:", error)
      this.emit("api-error", { context: "createAnonymousSession", error })
      throw error
    }
  }

  async getAnonymousSessionStatus(sessionId: string): Promise<AnonymousSessionStatusResponse> {
    debugLog(`Getting status for anonymous session: ${sessionId}`)
    try {
      const response = await this.directRequest<AnonymousSessionStatusResponse>(`/api/sessions/anonymous/${sessionId}`)
      this.emit("anonymous-session-status", response)
      return response
    } catch (error) {
      console.error("Failed to get anonymous session status:", error)
      this.emit("api-error", { context: "getAnonymousSessionStatus", error })
      throw error
    }
  }

  async updateAnonymousSessionHeartbeat(
    sessionId: string,
    activeTimeSeconds: number,
    sessionData: Record<string, any> = {},
  ): Promise<AnonymousSessionHeartbeatResponse> {
    debugLog(`Updating heartbeat for anonymous session: ${sessionId}`)
    try {
      const response = await this.directRequest<AnonymousSessionHeartbeatResponse>(
        `/api/sessions/anonymous/${sessionId}/heartbeat`,
        {
          method: "POST",
          body: JSON.stringify({
            active_time_seconds: activeTimeSeconds,
            session_data: sessionData,
          }),
        },
      )
      // Update local expiry if server sends new one
      if (response.time_remaining !== undefined && this.sessionStartTime) {
        const newExpiresAt = new Date(
          new Date(this.sessionStartTime).getTime() + response.time_remaining * 1000 + activeTimeSeconds * 1000,
        ) // Approximate
        this.sessionExpiresAt = newExpiresAt.toISOString()
        localStorage.setItem("seq1_session_expires_at", this.sessionExpiresAt)
      }
      this.emit("anonymous-session-heartbeat", response)
      return response
    } catch (error) {
      console.error("Failed to update anonymous session heartbeat:", error)
      this.emit("api-error", { context: "updateAnonymousSessionHeartbeat", error })
      throw error
    }
  }

  async convertToRegisteredUser(sessionId: string, npub: string): Promise<ConvertToRegisteredUserResponse> {
    debugLog(`Converting anonymous session ${sessionId} to registered user ${npub}`)
    try {
      const response = await this.directRequest<ConvertToRegisteredUserResponse>(
        `/api/sessions/anonymous/${sessionId}/convert`,
        {
          method: "POST",
          body: JSON.stringify({
            npub: npub,
            preserve_data: true,
          }),
        },
      )
      if (response.success) {
        this.clearAnonymousSessionDetails() // Clear old anonymous session ID
      }
      this.emit("anonymous-session-converted", response)
      return response
    } catch (error) {
      console.error("Failed to convert anonymous session:", error)
      this.emit("api-error", { context: "convertToRegisteredUser", error })
      throw error
    }
  }

  // --- NOSTR Authentication API Method ---
  async getAuthToken(npub: string): Promise<AuthTokenResponse> {
    debugLog(`Getting auth token for npub: ${npub}`)
    try {
      // This request should NOT include the X-Session-ID header for anonymous sessions
      const response = await this.directRequest<AuthTokenResponse>("/api/auth/nostr", {
        method: "POST",
        body: JSON.stringify({ npub }),
      })
      if (response.token) {
        this.setToken(response.token)
      }
      this.emit("auth-token-received", response)
      return response
    } catch (error) {
      console.error("Failed to get auth token:", error)
      this.emit("api-error", { context: "getAuthToken", error })
      throw error
    }
  }

  // --- Session Helper Methods ---
  isSessionExpired(): boolean {
    if (typeof window === "undefined") return true
    if (this.token) return false // If JWT token exists, session is not "anonymous session" expired

    if (!this.sessionExpiresAt) {
      // If no explicit expiry, rely on SESSION_DURATION from client start
      if (!this.sessionStartTime) return true // No start time, assume expired
      return Date.now() - new Date(this.sessionStartTime).getTime() > this.SESSION_DURATION
    }
    return Date.now() > new Date(this.sessionExpiresAt).getTime()
  }

  getTimeRemaining(): number {
    // Returns time remaining in milliseconds
    if (typeof window === "undefined") return 0
    if (this.token) return Number.POSITIVE_INFINITY // Authenticated users don't have a trial time limit

    if (!this.sessionExpiresAt) {
      if (!this.sessionStartTime) return 0
      const elapsed = Date.now() - new Date(this.sessionStartTime).getTime()
      return Math.max(0, this.SESSION_DURATION - elapsed)
    }
    return Math.max(0, new Date(this.sessionExpiresAt).getTime() - Date.now())
  }

  setToken(token: string): void {
    if (typeof window === "undefined") return
    this.token = token
    localStorage.setItem("seq1_jwt_token", token)
    // When a token is set, anonymous session details are no longer primary
    this.clearAnonymousSessionDetails(false) // false to not clear localStorage items if user might log out back to anonymous
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

  clearAnonymousSessionDetails(removeFromStorage = true): void {
    if (typeof window === "undefined" && removeFromStorage) return

    this.sessionId = null
    this.sessionStartTime = null
    this.sessionExpiresAt = null
    if (removeFromStorage) {
      localStorage.removeItem("seq1_anonymous_session_id")
      localStorage.removeItem("seq1_session_start_time")
      localStorage.removeItem("seq1_session_expires_at")
    }
    debugLog("Anonymous session details cleared from apiClient state.")
    if (removeFromStorage) this.emit("anonymous-session-cleared", {})
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

// --- Bridge Functions (Kept for compatibility, should eventually be phased out or updated) ---
export async function getSystemStatus(): Promise<SystemStatus | { success: boolean; message: string; data?: any }> {
  debugLog("Legacy getSystemStatus called, delegating to SystemAPI or /api/health...")
  try {
    // Prefer new /api/health endpoint if SystemAPI is not fully implemented for it yet
    // return apiClient.directRequest<SystemStatus>("/api/health"); // Example
    const result = await SystemAPI.testApiConnectivity() // Assumes this hits /api/health or similar
    if (result.success && result.data) {
      return {
        status: result.data.status || "online",
        version: result.data.version || process.env.NEXT_PUBLIC_API_VERSION || "N/A",
        message: result.message,
        raw: result.data,
      } as SystemStatus
    }
    return {
      status: result.success ? "online" : "offline",
      version: process.env.NEXT_PUBLIC_API_VERSION || "N/A",
      message: result.message,
    } as SystemStatus
  } catch (error: any) {
    console.error("Error in getSystemStatus:", error)
    return {
      status: "error",
      version: process.env.NEXT_PUBLIC_API_VERSION || "N/A",
      message: error.message || "Failed to get system status",
    } as SystemStatus
  }
}

export async function checkSession(): Promise<{
  isAuthenticated: boolean
  user: any | null
  error?: string
  isAnonymous?: boolean
  sessionId?: string | null
}> {
  debugLog("Legacy checkSession called...")
  if (typeof window === "undefined") {
    return { isAuthenticated: false, user: null, error: "Session check unavailable server-side", isAnonymous: false }
  }
  if (apiClient.token) {
    // Ideally, decode token to get user details or make a /me request
    return { isAuthenticated: true, user: { npub: "User (JWT)" }, isAnonymous: false }
  }
  if (apiClient.sessionId && !apiClient.isSessionExpired()) {
    return {
      isAuthenticated: false,
      user: { id: apiClient.sessionId },
      isAnonymous: true,
      sessionId: apiClient.sessionId,
    }
  }
  return { isAuthenticated: false, user: null, isAnonymous: false }
}

export async function getTransportState(): Promise<TransportState> {
  debugLog("Legacy getTransportState called, delegating to TransportAPI.getState()...")
  return TransportAPI.getState() // Assumes TransportAPI.getState() calls /api/transport/status or similar
}

export async function getPublicTransportState(): Promise<Partial<TransportState>> {
  debugLog("Legacy getPublicTransportState called, delegating to TransportAPI.getPublicTransportState()...")
  return TransportAPI.getPublicTransportState()
}

// Legacy WebSocket creation
function wsDebugLog(...args: any[]) {
  if (DEBUG) console.log("[Legacy WebSocket]", ...args)
}
export function createWebSocket(onMessageCallback: (event: MessageEvent) => void): WebSocket {
  // ... (Implementation from previous response, seems fine)
  if (typeof window === "undefined" || typeof WebSocket === "undefined") {
    wsDebugLog("WebSocket not supported in this environment.")
    return { readyState: 3, close: () => {}, send: () => {} } as any
  }
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
  const wsProxyUrl = `${protocol}//${window.location.host}/api/ws-proxy`
  wsDebugLog("Creating legacy WebSocket connection to proxy:", wsProxyUrl)
  const socket = new WebSocket(wsProxyUrl)
  socket.onopen = () => wsDebugLog("Legacy WebSocket connection established.")
  socket.onmessage = (event) => {
    wsDebugLog("Legacy WebSocket message received:", event.data)
    onMessageCallback(event)
  }
  socket.onerror = (error) => wsDebugLog("Legacy WebSocket error:", error)
  socket.onclose = (event) => wsDebugLog("Legacy WebSocket connection closed:", event.code, event.reason)
  return socket
}
