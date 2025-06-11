// lib/api-client.ts
import config from "./config"
import {
  getTransportState as getActualTransportState,
  getPublicTransportState as getActualPublicTransportState,
} from "./api/transport-api" // Import the actual functions
import { wsClient } from "./websocket-manager" // For legacy WebSocket stub

const DEBUG = process.env.NODE_ENV === "development" || config.DEBUG_MODE

function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log("[SEQ1APIClient]", ...args)
  }
}

interface AnonymousSessionCreateResponse {
  session_id: string
  created_at: string
  expires_at: string
  time_remaining_seconds: number
  total_trial_time_used_seconds: number
  total_trial_time_allowance_seconds: number
  usage_percentage: number
}

interface AnonymousSessionStatusResponse {
  session_id: string
  created_at: string
  expires_at: string
  time_remaining_seconds: number
  total_trial_time_used_seconds: number
  total_trial_time_allowance_seconds: number
  usage_percentage: number
  is_expired: boolean
  is_active: boolean
}

interface AnonymousSessionHeartbeatResponse {
  session_id: string
  expires_at: string
  time_remaining_seconds: number
  total_trial_time_used_seconds: number
  usage_percentage: number
  is_expired: boolean
}

interface ConvertToRegisteredUserResponse {
  session_id: string
  converted_to_npub: string
  token: string
  user: any // Define a proper User type elsewhere
  total_trial_time_used_seconds: number
  preserved_data_summary?: any
  success: boolean
  message?: string
}

interface AuthTokenResponse {
  token: string
  user: any // Define a proper User type elsewhere
}

interface ApiErrorDetail {
  message: string
  code?: string
  details?: any
}

interface ApiError extends Error {
  status: number
  errorData?: ApiErrorDetail
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, delay = 1000): Promise<Response> {
  let lastError: any
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, options)
      if (!response.ok && response.status >= 500 && i < retries) {
        debugLog(`fetchWithRetry: Server error ${response.status} for ${url}. Retrying (${i + 1}/${retries})...`)
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)))
        lastError = new Error(`Server error ${response.status} after ${i + 1} retries`)
        continue
      }
      return response
    } catch (error: any) {
      lastError = error
      if (i < retries) {
        debugLog(`fetchWithRetry: Network error for ${url}. Retrying (${i + 1}/${retries})...`, error.message)
        await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)))
        continue
      }
    }
  }
  debugLog(`fetchWithRetry: Failed after ${retries} retries for ${url}. Last error:`, lastError)
  throw lastError instanceof Error ? lastError : new Error("Fetch failed after multiple retries")
}

export class SEQ1APIClient {
  baseURL: string
  token: string | null
  sessionId: string | null
  sessionCreatedAt: string | null
  sessionExpiresAt: string | null
  readonly sessionWindowDurationMs: number
  private eventListeners: Record<string, ((data: any) => void)[]> = {}

  constructor() {
    this.baseURL = config.SEQ1_API_URL
    debugLog(`SEQ1APIClient initialized with baseURL: ${this.baseURL}`)
    this.sessionWindowDurationMs = config.TRIAL_DURATION * 60 * 60 * 1000

    if (typeof window !== "undefined") {
      try {
        this.token = localStorage.getItem("seq1_jwt_token")
        this.sessionId = localStorage.getItem("seq1_anonymous_session_id")
        this.sessionCreatedAt = localStorage.getItem("seq1_session_created_at")
        this.sessionExpiresAt = localStorage.getItem("seq1_session_expires_at")
      } catch (e) {
        console.warn("localStorage access failed:", e)
        this.token = null
        this.sessionId = null
        this.sessionCreatedAt = null
        this.sessionExpiresAt = null
      }
    } else {
      this.token = null
      this.sessionId = null
      this.sessionCreatedAt = null
      this.sessionExpiresAt = null
    }
  }

  private async handleApiResponseError(response: Response, url: string, context: string): Promise<ApiErrorDetail> {
    let errorData: ApiErrorDetail = { message: `API request failed: ${response.status} ${response.statusText}` }
    try {
      const jsonError = await response.json()
      errorData = { ...errorData, ...jsonError }
    } catch (e) {
      /* Not JSON */
    }
    debugLog(`API Error (${context} - ${url}): Status ${response.status}`, errorData)
    this.emit("api-error", { context, status: response.status, error: errorData, url })
    if (response.status === 401 && typeof window !== "undefined") {
      if (this.token) {
        this.clearToken()
        this.emit("auth-required", { message: "Session expired.", operation: "REAUTH" })
      } else {
        this.emit("auth-required", { message: "Authentication required.", operation: "AUTH_GENERAL" })
      }
    } else if (response.status === 410 && typeof window !== "undefined") {
      const message = errorData.message || "Trial expired."
      this.clearAnonymousSessionDetails()
      this.emit("trial-expired", { message })
    } else if (response.status === 419 && typeof window !== "undefined") {
      const message = errorData.message || "Session ended."
      this.sessionExpiresAt = new Date(0).toISOString()
      if (this.sessionId) localStorage.setItem("seq1_session_expires_at", this.sessionExpiresAt)
      this.emit("session-expired", { message })
    }
    return errorData
  }

  async directRequest<T = any>(endpoint: string, options: RequestInit = {}, context?: string): Promise<T> {
    const url = `${this.baseURL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`
    const requestContext = context || `directRequest ${options.method || "GET"} ${endpoint}`
    const headers = new Headers(options.headers || {})
    if (!headers.has("Content-Type") && options.body && typeof options.body === "string")
      headers.set("Content-Type", "application/json")
    if (config.API_VERSION) headers.set("X-SEQ1-Version", config.API_VERSION)
    headers.set("X-Client-App-Version", config.APP_VERSION_STRING)
    if (this.token) headers.set("Authorization", `Bearer ${this.token}`)
    else if (
      this.sessionId &&
      (endpoint.startsWith("/api/sessions/anonymous") || endpoint.startsWith("/api/auth/upgrade-session"))
    ) {
      headers.set("X-Session-ID", this.sessionId)
    }
    try {
      const response = await fetchWithRetry(url, { ...options, headers })
      if (!response.ok) {
        const errDetail = await this.handleApiResponseError(response, url, requestContext)
        const e = new Error(errDetail.message) as ApiError
        e.status = response.status
        e.errorData = errDetail
        throw e
      }
      if (response.status === 204) return undefined as T
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) return response.json()
      return response.text() as T
    } catch (e: any) {
      debugLog(`Error in directRequest (${requestContext} - ${url}):`, e.message)
      if (!(e as ApiError).status)
        this.emit("api-error", { context: requestContext, error: e, url, status: e.status || 0 })
      throw e
    }
  }

  async proxiedRequest<T = any>(endpoint: string, options: RequestInit = {}, context?: string): Promise<T> {
    const proxiedUrl = `/api/proxy${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`
    const requestContext = context || `proxiedRequest ${options.method || "GET"} ${endpoint}`
    const headers = new Headers(options.headers || {})
    if (!headers.has("Content-Type") && options.body && typeof options.body === "string")
      headers.set("Content-Type", "application/json")
    headers.set("X-Client-App-Version", config.APP_VERSION_STRING)
    if (this.token) headers.set("Authorization", `Bearer ${this.token}`)
    else if (this.sessionId) headers.set("X-Session-ID", this.sessionId)
    try {
      const response = await fetch(proxiedUrl, { ...options, headers })
      if (!response.ok) {
        const errDetail = await this.handleApiResponseError(response, proxiedUrl, requestContext)
        const e = new Error(errDetail.message) as ApiError
        e.status = response.status
        e.errorData = errDetail
        throw e
      }
      if (response.status === 204) return undefined as T
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) return response.json()
      return response.text() as T
    } catch (e: any) {
      debugLog(`Error in proxiedRequest (${requestContext} - ${proxiedUrl}):`, e.message)
      if (!(e as ApiError).status)
        this.emit("api-error", { context: requestContext, error: e, url: proxiedUrl, status: e.status || 0 })
      throw e
    }
  }
  async request<T = any>(endpoint: string, options: RequestInit = {}, context?: string): Promise<T> {
    return this.proxiedRequest<T>(endpoint, options, context)
  }
  async createAnonymousSession(): Promise<AnonymousSessionCreateResponse> {
    if (typeof window === "undefined") throw new Error("Cannot create anonymous session on server.")
    try {
      const response = await this.directRequest<AnonymousSessionCreateResponse>(
        "/api/sessions/anonymous/create",
        {
          method: "POST",
          body: JSON.stringify({
            user_agent: navigator.userAgent,
            session_data: {
              theme: localStorage.getItem("theme") || "dark",
              client_app_version: config.APP_VERSION_STRING,
            },
          }),
        },
        "createAnonymousSession",
      )
      this.sessionId = response.session_id
      this.sessionCreatedAt = response.created_at
      this.sessionExpiresAt = response.expires_at
      try {
        localStorage.setItem("seq1_anonymous_session_id", this.sessionId)
        localStorage.setItem("seq1_session_created_at", this.sessionCreatedAt)
        localStorage.setItem("seq1_session_expires_at", this.sessionExpiresAt)
      } catch (e) {
        console.warn("localStorage.setItem failed for anon session:", e)
      }
      this.emit("anonymous-session-created", response)
      return response
    } catch (error) {
      console.error("Failed to create/refresh anon session:", error)
      throw error
    }
  }
  async getAnonymousSessionStatus(sessionIdToCheck?: string): Promise<AnonymousSessionStatusResponse> {
    const currentSessionId = sessionIdToCheck || this.sessionId
    if (!currentSessionId) throw new Error("No session ID to get status.")
    try {
      const response = await this.directRequest<AnonymousSessionStatusResponse>(
        `/api/sessions/anonymous/${currentSessionId}`,
        {},
        "getAnonymousSessionStatus",
      )
      if (currentSessionId === this.sessionId) {
        this.sessionExpiresAt = response.expires_at
        this.sessionCreatedAt = response.created_at
        try {
          localStorage.setItem("seq1_session_expires_at", this.sessionExpiresAt)
          localStorage.setItem("seq1_session_created_at", this.sessionCreatedAt)
        } catch (e) {
          console.warn("localStorage.setItem failed for session status:", e)
        }
      }
      this.emit("anonymous-session-status", response)
      return response
    } catch (error) {
      console.error("Failed to get anon session status:", error)
      throw error
    }
  }
  async updateAnonymousSessionHeartbeat(
    activeTimeSeconds: number,
    sessionData: Record<string, any> = {},
  ): Promise<AnonymousSessionHeartbeatResponse> {
    if (!this.sessionId) throw new Error("No active anon session for heartbeat.")
    try {
      const response = await this.directRequest<AnonymousSessionHeartbeatResponse>(
        `/api/sessions/anonymous/${this.sessionId}/heartbeat`,
        {
          method: "POST",
          body: JSON.stringify({
            active_time_seconds: activeTimeSeconds,
            session_data: { ...sessionData, client_app_version: config.APP_VERSION_STRING },
          }),
        },
        "updateAnonymousSessionHeartbeat",
      )
      this.sessionExpiresAt = response.expires_at
      try {
        localStorage.setItem("seq1_session_expires_at", this.sessionExpiresAt)
      } catch (e) {
        console.warn("localStorage.setItem failed for heartbeat expiry:", e)
      }
      this.emit("anonymous-session-heartbeat", response)
      if (response.is_expired) this.emit("session-expired", { message: "Session window ended." })
      return response
    } catch (error) {
      console.error("Failed to update anon session heartbeat:", error)
      throw error
    }
  }
  async convertToRegisteredUser(
    npub: string,
    preserveData = true,
    additionalCredentials?: Record<string, any>,
  ): Promise<ConvertToRegisteredUserResponse> {
    if (!this.sessionId) throw new Error("No anon session to convert.")
    try {
      const response = await this.directRequest<ConvertToRegisteredUserResponse>(
        "/api/auth/upgrade-session",
        {
          method: "POST",
          body: JSON.stringify({ npub, preserve_data: preserveData, preserve_timer: true, ...additionalCredentials }),
        },
        "convertToRegisteredUser",
      )
      if (response.success && response.token && response.user) {
        this.setToken(response.token, response.user)
      } else if (!response.success) {
        throw new Error(response.message || "Failed to convert anon session.")
      }
      return response
    } catch (error) {
      console.error("Failed to convert anon session:", error)
      throw error
    }
  }
  async nostrLogin(signedEvent: any): Promise<AuthTokenResponse> {
    try {
      const response = await this.directRequest<AuthTokenResponse>(
        "/api/auth/nostr",
        { method: "POST", body: JSON.stringify(signedEvent) },
        "nostrLogin",
      )
      if (response.token && response.user) {
        this.setToken(response.token, response.user)
      } else {
        throw new Error("Nostr login no token/user.")
      }
      return response
    } catch (error) {
      console.error("Nostr login failed:", error)
      throw error
    }
  }
  isSessionExpired(): boolean {
    if (typeof window === "undefined") return true
    if (this.token) return false
    if (!this.sessionExpiresAt) {
      if (!this.sessionCreatedAt) return true
      return Date.now() - new Date(this.sessionCreatedAt).getTime() > this.sessionWindowDurationMs
    }
    return Date.now() > new Date(this.sessionExpiresAt).getTime()
  }
  getTimeRemaining(): number {
    if (typeof window === "undefined") return 0
    if (this.token) return Number.POSITIVE_INFINITY
    if (!this.sessionExpiresAt) {
      if (!this.sessionCreatedAt) return 0
      const elapsed = Date.now() - new Date(this.sessionCreatedAt).getTime()
      return Math.max(0, this.sessionWindowDurationMs - elapsed)
    }
    return Math.max(0, new Date(this.sessionExpiresAt).getTime() - Date.now())
  }
  setToken(token: string, user?: any): void {
    if (typeof window === "undefined") return
    this.token = token
    try {
      localStorage.setItem("seq1_jwt_token", token)
      if (user && user.npub) localStorage.setItem("seq1_user_npub", user.npub)
    } catch (e) {
      console.warn("localStorage.setItem failed for token:", e)
    }
    this.clearAnonymousSessionDetails(true)
    this.emit("token-set", { token, user })
  }
  clearToken(): void {
    if (typeof window === "undefined") return
    const oldToken = this.token
    this.token = null
    try {
      localStorage.removeItem("seq1_jwt_token")
      localStorage.removeItem("seq1_user_npub")
    } catch (e) {
      console.warn("localStorage.removeItem failed for token:", e)
    }
    if (oldToken) this.emit("token-cleared", {})
  }
  clearAnonymousSessionDetails(removeFromStorage = true): void {
    if (typeof window === "undefined" && removeFromStorage) return
    const oldSessionId = this.sessionId
    this.sessionId = null
    this.sessionCreatedAt = null
    this.sessionExpiresAt = null
    if (removeFromStorage) {
      try {
        localStorage.removeItem("seq1_anonymous_session_id")
        localStorage.removeItem("seq1_session_created_at")
        localStorage.removeItem("seq1_session_expires_at")
      } catch (e) {
        console.warn("localStorage.removeItem failed for session details:", e)
      }
    }
    if (oldSessionId) this.emit("anonymous-session-cleared", { previouslyHadSession: !!oldSessionId })
  }
  on(event: string, listener: (data: any) => void): void {
    if (!this.eventListeners[event]) this.eventListeners[event] = []
    this.eventListeners[event].push(listener)
  }
  off(event: string, listener: (data: any) => void): void {
    if (!this.eventListeners[event]) return
    this.eventListeners[event] = this.eventListeners[event].filter((l) => l !== listener)
  }
  emit(event: string, data: any): void {
    if (!this.eventListeners[event]) return
    debugLog(`Emitting event: ${event}`, data)
    this.eventListeners[event].forEach((listener) => {
      try {
        listener(data)
      } catch (e) {
        console.error(`Error in event listener for ${event}:`, e)
      }
    })
  }
}
export const apiClient = new SEQ1APIClient()

// --- DEPRECATED / MOVED EXPORTS - For build compatibility ---
/** @deprecated Use AuthManager or apiClient properties directly. */
export const checkSession = () => {
  console.warn(
    "[DEPRECATED] checkSession called from apiClient.ts. This function is deprecated. Use AuthManager or apiClient properties.",
  )
  return !!apiClient.token || (!!apiClient.sessionId && !apiClient.isSessionExpired())
}

/** @deprecated Import from 'lib/api/transport-api.ts' instead. */
export const getTransportState = async () => {
  console.warn(
    "[DEPRECATED] getTransportState called from apiClient.ts. Import from 'lib/api/transport-api.ts' instead.",
  )
  return getActualTransportState()
}

/** @deprecated Import from 'lib/api/transport-api.ts' instead. */
export const getPublicTransportState = async () => {
  console.warn(
    "[DEPRECATED] getPublicTransportState called from apiClient.ts. Import from 'lib/api/transport-api.ts' instead.",
  )
  return getActualPublicTransportState()
}

/** @deprecated Use wsClient from 'lib/websocket-manager.ts' instead. */
export const createLegacyWebSocket = (onMessageCallback: (event: MessageEvent) => void): WebSocket | null => {
  console.warn(
    "[DEPRECATED] createLegacyWebSocket called from apiClient.ts. Use wsClient from 'lib/websocket-manager.ts' instead.",
  )
  if (typeof window === "undefined" || typeof WebSocket === "undefined") {
    return null
  }
  // This is a simplified stub. The actual wsClient from websocket-manager should be used.
  // For build purposes, we return a mock-like object or connect to the managed client.
  if (!wsClient.isConnected()) {
    wsClient.connect()
  }
  wsClient.on("message", (data) => {
    // Adapt data to MessageEvent if necessary, or simplify for stub
    onMessageCallback({ data } as MessageEvent)
  })
  // This doesn't return a real WebSocket instance in the same way,
  // but aims to satisfy the old signature for build purposes.
  // A proper fix involves updating consumers.
  return wsClient.getSocket() as WebSocket | null // Assuming getSocket() returns the underlying socket or null
}
// --- END DEPRECATED ---

export async function getSystemStatus(): Promise<any> {
  try {
    const healthCheck = await apiClient.directRequest<{ status?: string; version?: string; message?: string }>(
      "/api/health",
      {},
      "getSystemStatus",
    )
    return {
      status: healthCheck.status || "online",
      version: healthCheck.version || config.APP_VERSION_STRING,
      message: healthCheck.message || "System is operational.",
      raw: healthCheck,
    }
  } catch (error: any) {
    console.error("Error in getSystemStatus:", error)
    return {
      status: "error",
      version: config.APP_VERSION_STRING,
      message: error.message || "Failed to get system status",
    }
  }
}
