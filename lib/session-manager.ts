import { apiClient } from "./api-client" // Ensure this path is correct
import config from "./config" // For TRIAL_DURATION and other configs
import { AUTH_CONTEXT_OPERATIONS } from "./project-menu-constants" // For operation context

const DEBUG = process.env.NODE_ENV === "development" || config.DEBUG_MODE

function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log("[SessionManager]", ...args)
  }
}

export class SessionManager {
  private warningTimers: Set<NodeJS.Timeout>
  private readonly sessionDurationMs: number // Milliseconds for the current anonymous session window
  private heartbeatInterval: NodeJS.Timeout | null = null
  private lastActivityTime: number = Date.now()

  constructor() {
    this.warningTimers = new Set()
    // TRIAL_DURATION from config is in hours, convert to milliseconds
    this.sessionDurationMs = config.TRIAL_DURATION * 60 * 60 * 1000
    debugLog(
      `SessionManager initialized. Anonymous session window: ${this.sessionDurationMs / 1000 / 60} minutes. Total trial limit managed by backend.`,
    )
  }

  /**
   * Initializes the SessionManager.
   * - If user is anonymous, it ensures an anonymous session exists or creates one.
   * - Starts timeout warnings for anonymous sessions.
   * - Clears warnings if user is authenticated.
   * - Sets up activity listeners for heartbeat.
   */
  async initialize(): Promise<void> {
    if (typeof window === "undefined") return

    debugLog("Initializing SessionManager...")
    this.setupActivityListeners()

    if (!apiClient.token) {
      // User is anonymous
      debugLog("User is anonymous. Managing session...")
      if (!apiClient.sessionId || apiClient.isSessionExpired()) {
        debugLog("No active anonymous session or session expired. Attempting to create/refresh.")
        try {
          // createAnonymousSession now handles setting sessionId, sessionStartTime, sessionExpiresAt in apiClient
          await apiClient.createAnonymousSession()
          debugLog(
            `Anonymous session created/refreshed by SessionManager. Session ID: ${apiClient.sessionId}, Expires At: ${apiClient.sessionExpiresAt}`,
          )
        } catch (error: any) {
          debugLog("Failed to create/refresh anonymous session in SessionManager:", error)
          if (error.status === 410) {
            // Total trial limit reached
            this.dispatchTrialExpiredEvent(
              error.message || "Your total free trial time has been used. Please sign up to continue.",
            )
          }
          return // Cannot proceed without a session
        }
      }

      if (apiClient.sessionId && !apiClient.isSessionExpired()) {
        this.startTimeoutWarnings()
        this.startHeartbeat()
        debugLog("Anonymous session active. Timeout warnings and heartbeat (re)started.")
      } else {
        debugLog("Anonymous session not active or expired after attempt, warnings/heartbeat not started.")
      }
    } else {
      // User is authenticated
      debugLog("User is authenticated. Clearing anonymous session warnings and stopping heartbeat.")
      this.clearWarnings()
      this.stopHeartbeat()
    }
  }

  private setupActivityListeners(): void {
    if (typeof window === "undefined") return
    ;["mousemove", "mousedown", "keypress", "scroll", "touchstart"].forEach((eventType) => {
      window.addEventListener(eventType, this.handleUserActivity, { passive: true })
    })
  }

  private handleUserActivity = (): void => {
    this.lastActivityTime = Date.now()
  }

  private startHeartbeat(): void {
    if (typeof window === "undefined" || !apiClient.sessionId || apiClient.token) return
    this.stopHeartbeat() // Clear existing interval

    const HEARTBEAT_INTERVAL_MS = config.ANONYMOUS_HEARTBEAT_INTERVAL * 1000 // Convert seconds to ms

    debugLog(`Starting heartbeat every ${HEARTBEAT_INTERVAL_MS / 1000} seconds.`)
    this.heartbeatInterval = setInterval(async () => {
      if (!apiClient.sessionId || apiClient.token) {
        this.stopHeartbeat()
        return
      }

      const now = Date.now()
      // Active time is considered the time since last activity, capped by interval duration
      const activeTimeSinceLastHeartbeat = Math.min(now - this.lastActivityTime, HEARTBEAT_INTERVAL_MS) / 1000 // in seconds

      // Reset lastActivityTime to now for the next interval,
      // but only count as "active" if there was recent activity.
      // If activeTimeSinceLastHeartbeat is close to HEARTBEAT_INTERVAL_MS, it means no activity.
      const isActive = activeTimeSinceLastHeartbeat < HEARTBEAT_INTERVAL_MS * 0.9 // e.g. active if activity in last 90% of interval
      const activeTimeForApi = isActive ? activeTimeSinceLastHeartbeat : 0

      this.lastActivityTime = now // Reset for next interval's calculation

      try {
        debugLog(
          `Sending heartbeat. Active time for this interval (approx): ${activeTimeForApi.toFixed(1)}s. Session ID: ${apiClient.sessionId}`,
        )
        const heartbeatResponse = await apiClient.updateAnonymousSessionHeartbeat(
          apiClient.sessionId,
          activeTimeForApi, // Send active time in seconds
          { client_app_version: config.APP_VERSION_STRING },
        )
        debugLog("Heartbeat successful:", heartbeatResponse)

        if (heartbeatResponse.is_expired) {
          debugLog("Heartbeat response indicates session is expired.")
          this.clearWarnings() // Stop further client-side warnings
          this.stopHeartbeat()
          // The API client will have updated its sessionExpiresAt and dispatched seq1:session:expired or seq1:trial:expired
          // No need to dispatch again from here unless the API client missed it.
        } else if (apiClient.sessionExpiresAt) {
          // If heartbeat provides new expiry, apiClient updates it. Re-evaluate warnings.
          this.startTimeoutWarnings() // Re-calculate warnings based on potentially new expiry
        }
      } catch (error: any) {
        debugLog("Heartbeat failed:", error)
        if (error.status === 410 || error.status === 419) {
          // 410: Total trial expired, 419: Current session window expired
          // APIClient should handle these and dispatch events.
          this.clearWarnings()
          this.stopHeartbeat()
        }
        // Potentially handle other errors, e.g., network issues
      }
    }, HEARTBEAT_INTERVAL_MS)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
      debugLog("Heartbeat stopped.")
    }
  }

  /**
   * Starts timeout warnings based on the session's expiry time.
   * This relies on `apiClient.sessionExpiresAt` being set correctly.
   */
  startTimeoutWarnings(): void {
    if (typeof window === "undefined" || !apiClient.sessionExpiresAt || apiClient.token) {
      if (apiClient.token) debugLog("User is authenticated, skipping anonymous timeout warnings.")
      else debugLog("Cannot start warnings: no session expiry time or server environment.")
      return
    }
    this.clearWarnings() // Clear any existing timers

    const expiresAtTime = new Date(apiClient.sessionExpiresAt).getTime()
    if (isNaN(expiresAtTime)) {
      debugLog("Invalid session expiry time, cannot calculate warnings.")
      return
    }

    const now = Date.now()
    const timeRemainingMs = expiresAtTime - now

    if (timeRemainingMs <= 0) {
      debugLog("Session already expired based on sessionExpiresAt, not setting new warnings.")
      // apiClient should have dispatched seq1:session:expired or seq1:trial:expired
      return
    }

    debugLog(
      `Recalculating warnings. Time remaining: ${Math.round(timeRemainingMs / 1000 / 60)} minutes. Expires at: ${apiClient.sessionExpiresAt}`,
    )

    // Warning definitions (times are relative to session *expiry*)
    const warningConfigs = [
      // {
      //   // Example: Mid-point warning if session is long enough
      //   condition: () => this.sessionDurationMs > 60 * 60 * 1000, // e.g., only if session > 1hr
      //   timeBeforeExpiry: this.sessionDurationMs / 2,
      //   message: () => `About ${Math.round(this.sessionDurationMs / 2 / 1000 / 60)} minutes of free time remaining in this session! 🎵`,
      //   urgent: false, showSave: false
      // },
      {
        condition: () => timeRemainingMs > 30 * 60 * 1000 + 1000, // Only if more than 30 mins left initially
        timeBeforeExpiry: 30 * 60 * 1000, // 30 minutes before expiry
        message: () => "30 minutes left in your Studio Session! 🎵",
        urgent: false,
        showSave: false,
      },
      {
        condition: () => timeRemainingMs > 5 * 60 * 1000 + 1000,
        timeBeforeExpiry: 5 * 60 * 1000, // 5 minutes before expiry
        message: () => "Just 5 minutes left! Secure your session to save your work! ⚡",
        urgent: false,
        showSave: true,
      },
      {
        condition: () => timeRemainingMs > 1 * 60 * 1000 + 1000,
        timeBeforeExpiry: 1 * 60 * 1000, // 1 minute before expiry
        message: () => "ONLY 1 MINUTE LEFT! Secure your session NOW or lose your work! 🚨",
        urgent: true,
        showSave: true,
      },
    ]

    warningConfigs.forEach((config) => {
      if (config.condition && !config.condition()) {
        debugLog(`Skipping warning due to condition: "${config.message()}"`)
        return
      }

      const warningTriggerTime = expiresAtTime - config.timeBeforeExpiry
      const actualDelayMs = warningTriggerTime - now
      const message = config.message()

      if (actualDelayMs > 0) {
        debugLog(`Setting warning: "${message}" in ${Math.round(actualDelayMs / 1000 / 60)} minutes.`)
        const timerId = setTimeout(() => {
          if (!apiClient.token && apiClient.sessionId && !apiClient.isSessionExpired()) {
            // Check again if user authenticated or session expired in the meantime
            this.dispatchTimeoutWarning(message, config.urgent, config.showSave)
          } else {
            debugLog("User authenticated or session ended before warning triggered, suppressing:", message)
          }
        }, actualDelayMs)
        this.warningTimers.add(timerId)
      } else {
        debugLog(`Skipping past warning (or warning time is now): "${message}"`)
      }
    })

    // Final expiry handler based on apiClient.sessionExpiresAt
    // This is a client-side fallback. The server is the source of truth.
    const clientSideExpiryDelay = expiresAtTime - now
    if (clientSideExpiryDelay > 0) {
      debugLog(
        `Setting client-side final session expiry handler in ${Math.round(clientSideExpiryDelay / 1000 / 60)} minutes.`,
      )
      const expiryTimerId = setTimeout(() => {
        if (!apiClient.token && apiClient.sessionId) {
          // Only if still anonymous and session ID exists
          debugLog("Client-side timer indicates session should be expired.")
          // apiClient.isSessionExpired() should now return true.
          // The API client itself will dispatch 'seq1:session:expired' or 'seq1:trial:expired'
          // when its internal check (e.g., during a request or via isSessionExpired()) confirms it.
          // We can dispatch a generic one here if needed, but it might be redundant.
          // this.dispatchSessionExpiredEvent("Your free session has ended based on client timer.");
        } else {
          debugLog("User authenticated or session already handled before client-side final expiry timer.")
        }
      }, clientSideExpiryDelay)
      this.warningTimers.add(expiryTimerId)
    }
  }

  /**
   * Dispatches a 'session-timeout-warning' event.
   */
  private dispatchTimeoutWarning(message: string, urgent = false, showSaveButton = false): void {
    if (typeof window === "undefined" || apiClient.token) return
    debugLog("Dispatching 'session-timeout-warning':", { message, urgent, showSaveButton })
    window.dispatchEvent(
      new CustomEvent("session-timeout-warning", {
        detail: {
          message,
          urgent,
          showSaveButton,
          timeRemaining: apiClient.getTimeRemaining(), // Get current remaining time from apiClient
        },
      }),
    )
  }

  /**
   * Dispatches an 'auth-required' event.
   * @param operation - A string identifying the operation that requires auth (e.g., "SAVE", "EXPORT_ALS").
   * @param customMessage - An optional custom message for the auth modal.
   * @param mode - Preferred initial mode for AuthManager ('login' or 'signup').
   */
  showAuthRequired(
    operation: string = AUTH_CONTEXT_OPERATIONS.SECURE_SESSION_BUTTON,
    customMessage: string | null = null,
    mode: "login" | "signup" = "login",
  ): void {
    if (typeof window === "undefined") return

    const defaultMessages: Record<string, string> = {
      [AUTH_CONTEXT_OPERATIONS.SAVE]: "💾 Save your amazing track! Secure your session to keep it forever.",
      [AUTH_CONTEXT_OPERATIONS.SAVE_AS]: "💾 Save your creation! Secure your session to build your music library.",
      [AUTH_CONTEXT_OPERATIONS.OPEN_PROJECT]: "📂 Access your saved projects. Secure your session.",
      [AUTH_CONTEXT_OPERATIONS.EXPORT_ALS]: "📤 Export to Ableton Live! Secure your session for advanced features.",
      [AUTH_CONTEXT_OPERATIONS.IMPORT_ALS]: "📥 Import from Ableton Live! Secure your session for advanced features.",
      [AUTH_CONTEXT_OPERATIONS.ACCOUNT_ACCESS]: "⚙️ Access Your Studio settings by securing your session.",
      [AUTH_CONTEXT_OPERATIONS.SECURE_SESSION_BUTTON]:
        "Secure your Studio Session to save your work and unlock all features.",
      DEFAULT: "🎵 Secure your Studio Session to unlock this feature!",
    }

    const message = customMessage || defaultMessages[operation.toUpperCase()] || defaultMessages.DEFAULT
    const timeRemaining = apiClient.getTimeRemaining() // Get current remaining time

    debugLog("Dispatching 'auth-required':", { operation, message, mode, timeRemaining })
    window.dispatchEvent(
      new CustomEvent("auth-required", {
        detail: {
          message,
          context: "project-menu", // Or determine context more dynamically if needed
          operation,
          timeRemaining,
          mode, // Pass the mode to AuthManager
        },
      }),
    )
  }

  /**
   * Dispatches a 'seq1:trial:expired' event.
   * This is typically called if apiClient.createAnonymousSession() fails with a 410.
   */
  private dispatchTrialExpiredEvent(message: string): void {
    if (typeof window === "undefined") return
    debugLog("Dispatching 'seq1:trial:expired':", { message })
    window.dispatchEvent(new CustomEvent("seq1:trial:expired", { detail: { message } }))
    // Also trigger an auth-required state, prompting signup
    this.showAuthRequired("TRIAL_EXPIRED", message, "signup")
  }

  /**
   * Clears all active warning timers. Called when user authenticates or session explicitly ends.
   */
  clearWarnings(): void {
    if (typeof window === "undefined") return
    debugLog("Clearing all session warning timers.")
    this.warningTimers.forEach((timer) => clearTimeout(timer))
    this.warningTimers.clear()
  }

  /**
   * Call this when the user logs in or out to re-evaluate session state.
   */
  handleAuthenticationChange(): void {
    debugLog("Authentication state changed, re-evaluating session management.")
    this.initialize() // Re-initialize to apply correct logic (start/stop warnings & heartbeat)
  }

  // Cleanup listeners on dispose (if SessionManager instance is ever destroyed)
  dispose(): void {
    if (typeof window === "undefined") return
    this.clearWarnings()
    this.stopHeartbeat()
    ;["mousemove", "mousedown", "keypress", "scroll", "touchstart"].forEach((eventType) => {
      window.removeEventListener(eventType, this.handleUserActivity)
    })
    debugLog("SessionManager disposed.")
  }
}

// Singleton instance
export const sessionManager = new SessionManager()

// Listen to apiClient events to react to auth changes
if (typeof window !== "undefined") {
  apiClient.on("token-set", () => {
    debugLog("SessionManager observed token-set event from apiClient.")
    sessionManager.handleAuthenticationChange()
  })
  apiClient.on("token-cleared", () => {
    debugLog("SessionManager observed token-cleared event from apiClient.")
    sessionManager.handleAuthenticationChange()
  })
  apiClient.on("anonymous-session-created", (data: any) => {
    debugLog("SessionManager observed anonymous-session-created event from apiClient:", data)
    // If sessionManager didn't initiate this, it might need to re-evaluate warnings/heartbeat
    if (!sessionManager["heartbeatInterval"]) {
      // Check if heartbeat is running as a proxy for initialization
      sessionManager.initialize()
    }
  })
  apiClient.on("session-expired", (data: { message: string }) => {
    debugLog("SessionManager observed session-expired event from apiClient:", data)
    sessionManager.clearWarnings()
    sessionManager.stopHeartbeat()
    // No need to dispatch another event, apiClient already did.
    // But we might want to trigger the auth modal.
    sessionManager.showAuthRequired(
      AUTH_CONTEXT_OPERATIONS.SECURE_SESSION_BUTTON,
      data.message || "Your session has expired. Please secure it to continue.",
      "login",
    )
  })
  apiClient.on("trial-expired", (data: { message: string }) => {
    debugLog("SessionManager observed trial-expired event from apiClient:", data)
    sessionManager.clearWarnings()
    sessionManager.stopHeartbeat()
    sessionManager.dispatchTrialExpiredEvent(
      data.message || "Your total free trial time has been used. Please sign up to continue.",
    )
  })
}
