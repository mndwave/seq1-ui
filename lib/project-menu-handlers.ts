// lib/project-menu-handlers.ts
import { apiClient } from "./api-client" // Assuming apiClient has 'token' property
import { sessionManager } from "./session-manager"
import { AUTH_CONTEXT_OPERATIONS } from "./project-menu-constants"

export interface MenuHandlerResult {
  allowed: boolean
  requiresAuth: boolean
  message?: string // Optional: For direct feedback, though sessionManager usually handles UI
  actionToDispatch?: string // Optional: If the handler wants to specify a different action for onAction
}

/**
 * Handlers for project menu actions.
 * They determine if an action can proceed, primarily by checking authentication status.
 * If auth is required and missing, they call `sessionManager.showAuthRequired`.
 */
export const ProjectMenuHandlers: Record<string, () => Promise<MenuHandlerResult>> = {
  /**
   * Handles "NEW PROJECT" action.
   * This operation is typically free.
   */
  async new(): Promise<MenuHandlerResult> {
    // 'new' is in FREE_OPERATIONS, so this handler might be simple or add logging.
    console.log("ProjectMenuHandler: 'new' action initiated.")
    return { allowed: true, requiresAuth: false }
  },

  /**
   * Handles "ABOUT SEQ1" action.
   * This operation is free.
   */
  async about(): Promise<MenuHandlerResult> {
    console.log("ProjectMenuHandler: 'about' action initiated.")
    return { allowed: true, requiresAuth: false }
  },

  /**
   * Handles "OPEN PROJECT" action.
   * Requires authentication.
   */
  async open(): Promise<MenuHandlerResult> {
    if (!apiClient.token) {
      sessionManager.showAuthRequired(
        AUTH_CONTEXT_OPERATIONS.OPEN_PROJECT,
        "Access your saved masterpieces. Secure your session to open a project.",
      )
      return { allowed: false, requiresAuth: true }
    }
    return { allowed: true, requiresAuth: false }
  },

  /**
   * Handles "SAVE" action.
   * Requires authentication.
   */
  async save(): Promise<MenuHandlerResult> {
    if (!apiClient.token) {
      sessionManager.showAuthRequired(
        AUTH_CONTEXT_OPERATIONS.SAVE,
        "Don't lose your vibe! Secure your session to save your project.",
      )
      return { allowed: false, requiresAuth: true }
    }
    return { allowed: true, requiresAuth: false }
  },

  /**
   * Handles "SAVE AS..." action.
   * Requires authentication.
   */
  async saveAs(): Promise<MenuHandlerResult> {
    if (!apiClient.token) {
      sessionManager.showAuthRequired(
        AUTH_CONTEXT_OPERATIONS.SAVE_AS,
        "Create a new version or save with a different name. Secure your session first!",
      )
      return { allowed: false, requiresAuth: true }
    }
    return { allowed: true, requiresAuth: false }
  },

  /**
   * Handles "EXPORT ALS" action.
   * Requires authentication (even if feature is 'coming soon').
   */
  async export(): Promise<MenuHandlerResult> {
    // This feature is marked as "comingSoon" and "disabled" in DirectProjectMenu.
    // The menu UI will prevent click, but handler still checks auth for robustness.
    if (!apiClient.token) {
      sessionManager.showAuthRequired(
        AUTH_CONTEXT_OPERATIONS.EXPORT_ALS,
        "Ready to take your tracks to Ableton? Secure your session to enable export.",
      )
      return { allowed: false, requiresAuth: true }
    }
    // If it were enabled, this would be true. Since it's disabled in UI, this part is more for future.
    return { allowed: true, requiresAuth: false }
  },

  /**
   * Handles "IMPORT ALS" action.
   * Requires authentication (even if feature is 'coming soon').
   */
  async import(): Promise<MenuHandlerResult> {
    // Also "comingSoon" and "disabled" in DirectProjectMenu.
    if (!apiClient.token) {
      sessionManager.showAuthRequired(
        AUTH_CONTEXT_OPERATIONS.IMPORT_ALS,
        "Bring your Ableton projects into SEQ1. Secure your session to enable import.",
      )
      return { allowed: false, requiresAuth: true }
    }
    return { allowed: true, requiresAuth: false }
  },

  /**
   * Handles "YOUR STUDIO" (Account Access) action.
   * Requires authentication.
   */
  async account(): Promise<MenuHandlerResult> {
    // DirectProjectMenu itself also gates the visibility/action of "YOUR STUDIO"
    // based on auth state, but this handler provides a fallback.
    if (!apiClient.token) {
      sessionManager.showAuthRequired(
        AUTH_CONTEXT_OPERATIONS.ACCOUNT_ACCESS,
        "Manage your Creative Identity and Studio settings. Secure your session to proceed.",
      )
      return { allowed: false, requiresAuth: true }
    }
    return { allowed: true, requiresAuth: false }
  },
}
