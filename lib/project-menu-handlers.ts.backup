import { apiClient } from "./api-client"
import { sessionManager } from "./session-manager"

// Type for the return value of handlers
interface MenuHandlerResult {
  allowed: boolean
  requiresAuth: boolean
  message?: string // Optional message for UI if needed
}

// This assumes your project menu actions are identified by strings like 'new', 'open', 'save', etc.
// These should match the 'id' field in your DirectProjectMenu's menuItems array.
export const ProjectMenuHandlers: Record<string, () => Promise<MenuHandlerResult>> = {
  // 🟢 FREE OPERATIONS (Example: 'new', 'about')
  // For operations listed in FREE_OPERATIONS, they can bypass these explicit checks
  // or be handled by a default permissive handler if not listed here.
  // The DirectProjectMenu can first check against FREE_OPERATIONS list.

  async new(): Promise<MenuHandlerResult> {
    // Maps to 'NEW_PROJECT'
    // Always allowed
    return { allowed: true, requiresAuth: false }
  },

  async about(): Promise<MenuHandlerResult> {
    // Maps to 'ABOUT_SEQ1'
    // Always allowed
    return { allowed: true, requiresAuth: false }
  },

  // 🔴 AUTH REQUIRED OPERATIONS
  async open(): Promise<MenuHandlerResult> {
    // Maps to 'OPEN_PROJECT'
    if (!apiClient.token) {
      sessionManager.showAuthRequired("OPEN_PROJECT") // Use constant for operation type
      return { allowed: false, requiresAuth: true }
    }
    return { allowed: true, requiresAuth: false }
  },

  async save(): Promise<MenuHandlerResult> {
    if (!apiClient.token) {
      sessionManager.showAuthRequired("SAVE")
      return { allowed: false, requiresAuth: true }
    }
    return { allowed: true, requiresAuth: false }
  },

  async saveAs(): Promise<MenuHandlerResult> {
    if (!apiClient.token) {
      sessionManager.showAuthRequired("SAVE_AS")
      return { allowed: false, requiresAuth: true }
    }
    return { allowed: true, requiresAuth: false }
  },

  async export(): Promise<MenuHandlerResult> {
    // Maps to 'EXPORT_ALS'
    // Note: The document uses 'EXPORT_ALS', your menu component might use 'export' as action id
    if (!apiClient.token) {
      sessionManager.showAuthRequired("EXPORT_ALS")
      return { allowed: false, requiresAuth: true }
    }
    // This feature is also marked as "comingSoon" and "disabled" in DirectProjectMenu
    // So, actual execution might be blocked there too. This handler just gates auth.
    return { allowed: true, requiresAuth: false }
  },

  async import(): Promise<MenuHandlerResult> {
    // Maps to 'IMPORT_ALS'
    if (!apiClient.token) {
      sessionManager.showAuthRequired("IMPORT_ALS")
      return { allowed: false, requiresAuth: true }
    }
    return { allowed: true, requiresAuth: false }
  },

  async account(): Promise<MenuHandlerResult> {
    // Maps to 'ACCOUNT_ACCESS'
    if (!apiClient.token) {
      // The AccountModal itself might handle this, but good to gate here too.
      // The DirectProjectMenu already shows "ACCOUNT" only if authenticated.
      // This handler might be redundant if UI already gates it.
      sessionManager.showAuthRequired("ACCOUNT_ACCESS")
      return { allowed: false, requiresAuth: true }
    }
    return { allowed: true, requiresAuth: false }
  },
  // Add other handlers as needed, e.g., for 'COLLABORATION' if it becomes a menu item.
}
