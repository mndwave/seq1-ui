import { apiClient, type SEQ1APIClient } from "./api-client" // Assuming SEQ1APIClient type is exported
import { sessionManager } from "./session-manager"

const DEBUG = process.env.NODE_ENV === "development"

function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log("[AuthManager]", ...args)
  }
}

// Define a simple user type, adjust as needed based on actual API response
interface User {
  id: string
  email?: string
  name?: string
  // Add other user properties
}

export class AuthManager {
  isAuthenticated: boolean
  currentUser: User | null
  isAnonymous: boolean
  private apiClientInstance: SEQ1APIClient

  constructor(client: SEQ1APIClient) {
    this.apiClientInstance = client
    this.isAuthenticated = !!apiClient.token
    this.currentUser = null
    this.isAnonymous = !apiClient.token && !!apiClient.sessionId
    debugLog("AuthManager initialized:", { isAuthenticated: this.isAuthenticated, isAnonymous: this.isAnonymous })
  }

  async checkAuthStatus(): Promise<boolean> {
    if (typeof window === "undefined") return false
    debugLog("Checking auth status...")

    if (!apiClient.token) {
      this.isAuthenticated = false
      this.isAnonymous = !!apiClient.sessionId
      if (this.isAnonymous) {
        debugLog("User is anonymous.")
        // Ensure anonymous session is (re)started if needed
        await sessionManager.initialize()
      } else {
        debugLog("User is not authenticated and not anonymous.")
      }
      return false
    }

    try {
      // Endpoint as per document: /api/auth/me
      const user = await apiClient.directRequest<User>("/api/auth/me")
      this.currentUser = user
      this.isAuthenticated = true
      this.isAnonymous = false
      debugLog("User is authenticated:", user)
      // If user is authenticated, clear any anonymous session warnings
      sessionManager.clearWarnings()
      return true
    } catch (error) {
      debugLog("Auth status check failed (e.g., token expired):", error)
      this.isAuthenticated = false
      this.currentUser = null
      // Don't clear token here, apiClient.request handles 401 by calling clearToken
      // Check if we should fall back to anonymous session
      this.isAnonymous = !!apiClient.sessionId
      if (this.isAnonymous) {
        await sessionManager.initialize() // Re-initialize anonymous session flow
      }
      return false
    }
  }

  // Credentials type should be defined based on your backend requirements
  async upgradeToAuthenticated(credentials: Record<string, any>): Promise<{ token: string; user: User }> {
    if (typeof window === "undefined") throw new Error("Cannot upgrade session in non-browser environment")
    debugLog("Attempting to upgrade anonymous session to authenticated...")

    if (!apiClient.sessionId) {
      throw new Error("No anonymous session ID found to upgrade.")
    }

    try {
      // Endpoint as per document: /api/auth/upgrade-session
      const response = await apiClient.directRequest<{ token: string; user: User }>(
        "/api/auth/upgrade-session",
        {
          method: "POST",
          body: JSON.stringify({
            sessionId: apiClient.sessionId, // Accessing property of apiClient instance
            preserveTimer: true, // Keep original 3-hour limit
            ...credentials,
          }),
        },
      )

      const { token, user } = response
      apiClient.setToken(token)
      this.currentUser = user
      this.isAuthenticated = true
      this.isAnonymous = false

      debugLog("Session upgraded successfully:", user)
      // As per doc: DON'T clear warnings, timer is preserved.
      // However, if they sign up, the warnings about "free time" might be confusing.
      // This needs UX consideration. For now, following the doc.
      // sessionManager.startTimeoutWarnings(); // Re-evaluate if warnings should continue or change

      // Dispatch a global event for UI updates
      window.dispatchEvent(new CustomEvent("seq1:auth:loggedIn", { detail: { user } }))
      return { token, user }
    } catch (error) {
      console.error("Failed to upgrade session:", error)
      throw error
    }
  }

  logout(): void {
    if (typeof window === "undefined") return
    debugLog("Logging out...")
    const previousSessionId = apiClient.sessionId
    const previousSessionStartTime = apiClient.sessionStartTime

    apiClient.clearToken()
    // The document says "clearSession()" here, which would wipe the timer.
    // However, it also says "Restart anonymous session with fresh 3-hour timer".
    // If the timer is truly persistent and NEVER_RESET: true (from TIMER_RULES),
    // then clearSession() should not be called if the intent is to keep the original timer.
    // If logout means a *new* 3-hour cycle can start, then clearSession() is correct.
    // Given "NEVER_RESET: true" for the *original* 3-hour free trial,
    // logging out and getting a *new* 3-hour free trial seems contradictory.
    // Let's assume "logout" means they are no longer that *authenticated* user,
    // but they fall back to their *existing* anonymous session if the timer hasn't run out.
    // If the timer *has* run out, then initialize() would try to start a new one,
    // which might be blocked by the server if the 3 hours are "TOTAL_FREE_TIME ... EVER".

    // Sticking to "preserve timer" logic:
    // If a user logs out, they should revert to their anonymous session state,
    // including its original start time and remaining time.
    // So, we only clear the token. The anonymous session details remain.
    // this.apiClientInstance.clearSession(); // Let's NOT do this to preserve the timer.

    this.isAuthenticated = false
    this.currentUser = null

    // Re-check if an anonymous session is still valid or should be started.
    // If they had an anonymous session before logging in, it should still be there.
    this.isAnonymous = !!apiClient.sessionId && !apiClient.token

    debugLog("User logged out. Attempting to re-initialize anonymous session state.")
    sessionManager.initialize() // This will check if an anonymous session should be active.
    // If their original 3-hour timer is still running, warnings will resume.
    // If it expired, it might try to get a new one (server might deny if "3 hours EVER").

    // Dispatch a global event for UI updates
    window.dispatchEvent(new CustomEvent("seq1:auth:loggedOut"))
  }
}

export const authManager = new AuthManager(apiClient)
