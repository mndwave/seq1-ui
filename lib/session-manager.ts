import { apiClient } from "./api-client"

const DEBUG = process.env.NODE_ENV === "development"

function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log("[SessionManager]", ...args)
  }
}

export class SessionManager {
  private warningTimers: Set<NodeJS.Timeout>
  private readonly sessionDuration: number // 3 hours in ms

  constructor() {
    this.warningTimers = new Set()
    this.sessionDuration = 3 * 60 * 60 * 1000
  }

  async initialize(): Promise<void> {
    if (typeof window === "undefined") return

    debugLog("Initializing SessionManager...")
    if (!apiClient.token) {
      await apiClient.createAnonymousSession()
      if (apiClient.sessionId && apiClient.sessionStartTime) {
        // Ensure session started
        this.startTimeoutWarnings()
        debugLog("Anonymous session active, timeout warnings started.")
      } else {
        debugLog("Anonymous session not active, warnings not started.")
      }
    } else {
      debugLog("User is authenticated, no anonymous session warnings needed.")
    }
  }

  startTimeoutWarnings(): void {
    if (typeof window === "undefined" || !apiClient.sessionStartTime) return
    this.clearWarnings() // Clear any existing warnings first

    const startTime = Number.parseInt(apiClient.sessionStartTime, 10)

    const warnings = [
      {
        delay: this.sessionDuration - 30 * 60 * 1000,
        message: "30 minutes of free time remaining! 🎵",
        urgent: false,
        showSave: false,
      }, // 30 mins left
      {
        delay: this.sessionDuration - 5 * 60 * 1000,
        message: "5 minutes left! Sign up to save your work! ⚡",
        urgent: false,
        showSave: true,
      }, // 5 mins left
      {
        delay: this.sessionDuration - 1 * 60 * 1000,
        message: "1 MINUTE LEFT! Sign up now or lose your session! 🚨",
        urgent: true,
        showSave: true,
      }, // 1 min left
    ]

    warnings.forEach((warning) => {
      const timeUntilWarning = startTime + warning.delay - Date.now()
      if (timeUntilWarning > 0) {
        debugLog(`Setting warning: "${warning.message}" in ${timeUntilWarning / 1000 / 60} minutes`)
        const timerId = setTimeout(() => {
          this.showTimeoutWarning(warning.message, warning.urgent, warning.showSave)
        }, timeUntilWarning)
        this.warningTimers.add(timerId)
      } else {
        debugLog(`Skipping past warning: "${warning.message}"`)
      }
    })

    // Final timeout
    const timeUntilExpiry = startTime + this.sessionDuration - Date.now()
    if (timeUntilExpiry > 0) {
      debugLog(`Setting final session expiry handler in ${timeUntilExpiry / 1000 / 60} minutes`)
      const expiryTimerId = setTimeout(() => {
        debugLog("Session formally expired based on timer.")
        // The API client will handle 419, but this can be a proactive client-side trigger
        window.dispatchEvent(
          new CustomEvent("seq1:session:expired", {
            detail: { message: "Your free session has ended. Please sign up to save your work and continue." },
          }),
        )
        apiClient.clearAnonymousSessionDetails() // Proactively clear session details
      }, timeUntilExpiry)
      this.warningTimers.add(expiryTimerId)
    }
  }

  showTimeoutWarning(message: string, urgent = false, showSaveButton = false): void {
    if (typeof window === "undefined") return
    debugLog("Dispatching session-timeout-warning:", { message, urgent, showSaveButton })
    window.dispatchEvent(
      new CustomEvent("session-timeout-warning", {
        detail: {
          message,
          urgent,
          showSaveButton,
          timeRemaining: apiClient.getTimeRemaining(),
        },
      }),
    )
  }

  showAuthRequired(operation: string, customMessage: string | null = null): void {
    if (typeof window === "undefined") return
    const messages: Record<string, string> = {
      SAVE: "💾 Save your amazing track! Sign up to keep it forever.",
      SAVE_AS: "💾 Save your creation! Sign up to build your music library.",
      OPEN_PROJECT: "📂 Sign up to access your saved projects.",
      EXPORT_ALS: "📤 Export to Ableton Live! Sign up for advanced features.",
      IMPORT_ALS: "📥 Import from Ableton Live! Sign up for advanced features.",
      ACCOUNT_ACCESS: "⚙️ Create your account to access settings.",
      DEFAULT: "🎵 Sign up to unlock this feature!",
    }

    const message = customMessage || messages[operation.toUpperCase()] || messages.DEFAULT
    debugLog("Dispatching auth-required:", { operation, message })
    window.dispatchEvent(
      new CustomEvent("auth-required", {
        detail: {
          message,
          context: "project-menu", // As per document
          operation,
          timeRemaining: apiClient.getTimeRemaining(),
        },
      }),
    )
  }

  clearWarnings(): void {
    if (typeof window === "undefined") return
    debugLog("Clearing all session warning timers.")
    this.warningTimers.forEach((timer) => clearTimeout(timer))
    this.warningTimers.clear()
  }
}

export const sessionManager = new SessionManager()
