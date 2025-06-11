import { apiClient, type User } from "./api-client" // Ensure User type is imported if defined in api-client
import { sessionManager } from "./session-manager"
import config from "./config"

const DEBUG = process.env.NODE_ENV === "development" || config.DEBUG_MODE

function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log("[AuthManager]", ...args)
  }
}

// Re-define User interface if not imported, or ensure it's correctly imported
// export interface User {
//   id: string;
//   npub?: string;
//   name?: string;
//   email?: string;
// }

export class AuthManager {
  private static instance: AuthManager
  private isCheckingStatus = false
  private _currentUser: User | null = null

  private constructor() {
    debugLog("AuthManager instance created.")
    apiClient.on("token-set", this.handleTokenSet)
    apiClient.on("token-cleared", this.handleTokenCleared)
    apiClient.on("anonymous-session-created", this.handleAnonymousSessionChange)
    apiClient.on("anonymous-session-cleared", this.handleAnonymousSessionChange)
  }

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager()
    }
    return AuthManager.instance
  }

  get isAuthenticated(): boolean {
    return !!apiClient.token
  }

  get isAnonymous(): boolean {
    return !apiClient.token && !!apiClient.sessionId && !apiClient.isSessionExpired()
  }

  get currentUser(): User | null {
    return this._currentUser
  }

  private handleTokenSet = (data: { user?: User }): void => {
    debugLog("AuthManager observed token-set. User:", data.user)
    this._currentUser = data.user || null
    sessionManager.handleAuthenticationChange()
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("seq1:auth:loggedIn", { detail: { user: this._currentUser } }))
    }
  }

  private handleTokenCleared = (): void => {
    debugLog("AuthManager observed token-cleared.")
    this._currentUser = null
    sessionManager.handleAuthenticationChange()
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("seq1:auth:loggedOut"))
    }
  }

  private handleAnonymousSessionChange = (): void => {
    debugLog("AuthManager observed anonymous session change.")
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("seq1:session:changed", {
          detail: {
            isAnonymous: this.isAnonymous,
            sessionId: apiClient.sessionId,
          },
        }),
      )
    }
  }

  async checkAuthStatus(): Promise<boolean> {
    if (typeof window === "undefined") return false
    if (this.isCheckingStatus) {
      debugLog("Auth status check already in progress.")
      return this.isAuthenticated
    }
    this.isCheckingStatus = true
    debugLog("Checking auth status...")

    if (apiClient.token) {
      try {
        const user = await apiClient.directRequest<User>("/api/auth/me", {}, "checkAuthStatus_fetchUser")
        this._currentUser = user
        sessionManager.clearWarnings()
        sessionManager.stopHeartbeat()
        debugLog("User is authenticated (JWT verified):", user)
        this.isCheckingStatus = false
        if (this._currentUser) {
          apiClient.emit("token-set", { token: apiClient.token, user: this._currentUser, source: "checkAuthStatus" })
        }
        return true
      } catch (error: any) {
        debugLog("Auth status check failed (e.g., token expired or /api/auth/me failed):", error.message)
        this._currentUser = null
        if (apiClient.token) {
          apiClient.clearToken()
        }
      }
    }

    this._currentUser = null
    try {
      await sessionManager.initialize()
      debugLog(`Post auth check, anonymous status: ${this.isAnonymous}, session ID: ${apiClient.sessionId}`)
    } catch (smError) {
      debugLog("Error during SessionManager initialization in checkAuthStatus:", smError)
    }

    this.isCheckingStatus = false
    return false
  }

  async loginWithNostr(signedEvent: any): Promise<User> {
    if (typeof window === "undefined") throw new Error("Login cannot be performed on the server.")
    debugLog("Attempting Nostr login...")
    try {
      const { user, token } = await apiClient.nostrLogin(signedEvent)
      if (!user || !token) {
        throw new Error("Nostr login response was invalid.")
      }
      debugLog("Nostr login successful. User:", user)
      return user
    } catch (error) {
      console.error("Nostr login failed:", error)
      throw error
    }
  }

  async upgradeAnonymousSessionWithNostr(signedEvent: any): Promise<User> {
    if (typeof window === "undefined") throw new Error("Session upgrade cannot be performed on the server.")
    if (!apiClient.sessionId) {
      throw new Error("No anonymous session found to upgrade.")
    }
    debugLog("Attempting to upgrade anonymous session with Nostr...")
    try {
      if (!signedEvent.pubkey) {
        throw new Error("Signed event must contain a pubkey for npub.")
      }

      const { user, token } = await apiClient.convertToRegisteredUser(signedEvent.pubkey, true, {
        nostr_event: signedEvent,
      })

      if (!user || !token) {
        throw new Error("Session upgrade response was invalid.")
      }
      debugLog("Anonymous session upgraded successfully. User:", user)
      return user
    } catch (error) {
      console.error("Failed to upgrade anonymous session:", error)
      throw error
    }
  }

  logout(): void {
    if (typeof window === "undefined") return
    debugLog("Logging out...")
    apiClient.clearToken()
    debugLog("User logged out. Anonymous session state will be re-initialized by SessionManager.")
  }

  async fetchCurrentUser(): Promise<User | null> {
    if (this.isAuthenticated && !this._currentUser) {
      try {
        const user = await apiClient.directRequest<User>("/api/auth/me", {}, "fetchCurrentUser")
        this._currentUser = user
        apiClient.emit("token-set", { token: apiClient.token, user: this._currentUser, source: "fetchCurrentUser" })
        return user
      } catch (error) {
        debugLog("Failed to fetch current user:", error)
        if ((error as any).status === 401 && apiClient.token) {
          apiClient.clearToken()
        }
        return null
      }
    }
    return this._currentUser
  }
}

export const authManager = AuthManager.getInstance()
