import { apiClient } from "./api-client"
import { sessionManager } from "./session-manager"

// Type for the return value of handlers
interface MenuHandlerResult {
  allowed: boolean
  requiresAuth: boolean
  message?: string
}

// COMPLETE FLOW_ID HANDLERS - All 12 flows from project_menu.yaml
export const ProjectMenuFlowHandlers: Record<string, () => Promise<MenuHandlerResult>> = {
  
  // 1. ACCESS STUDIO FLOW
  async access_studio_flow(): Promise<MenuHandlerResult> {
    // Triggers authentication modal for anonymous users
    if (!apiClient.token) {
      sessionManager.showAuthRequired("ACCESS_STUDIO")
      return { allowed: false, requiresAuth: true, message: "Please authenticate to access studio" }
    }
    return { allowed: true, requiresAuth: false }
  },

  // 2. CREATE PROJECT FLOW  
  async create_project_flow(): Promise<MenuHandlerResult> {
    if (!apiClient.token) {
      sessionManager.showAuthRequired("CREATE_PROJECT")
      return { allowed: false, requiresAuth: true, message: "Authentication required to create projects" }
    }
    return { allowed: true, requiresAuth: false }
  },

  // 3. OPEN PROJECT FLOW
  async open_project_flow(): Promise<MenuHandlerResult> {
    if (!apiClient.token) {
      sessionManager.showAuthRequired("OPEN_PROJECT") 
      return { allowed: false, requiresAuth: true, message: "Authentication required to open projects" }
    }
    return { allowed: true, requiresAuth: false }
  },

  // 4. RECENT PROJECTS FLOW
  async recent_projects_flow(): Promise<MenuHandlerResult> {
    if (!apiClient.token) {
      sessionManager.showAuthRequired("RECENT_PROJECTS")
      return { allowed: false, requiresAuth: true, message: "Authentication required to view recent projects" }
    }
    return { allowed: true, requiresAuth: false }
  },

  // 5. SEQUENCER FLOW
  async sequencer_flow(): Promise<MenuHandlerResult> {
    if (!apiClient.token) {
      sessionManager.showAuthRequired("SEQUENCER_ACCESS")
      return { allowed: false, requiresAuth: true, message: "Authentication required to access sequencer" }
    }
    return { allowed: true, requiresAuth: false }
  },

  // 6. DEVICE MANAGER FLOW
  async device_manager_flow(): Promise<MenuHandlerResult> {
    if (!apiClient.token) {
      sessionManager.showAuthRequired("DEVICE_MANAGER")
      return { allowed: false, requiresAuth: true, message: "Authentication required to manage devices" }
    }
    return { allowed: true, requiresAuth: false }
  },

  // 7. CLIP LIBRARY FLOW
  async clip_library_flow(): Promise<MenuHandlerResult> {
    if (!apiClient.token) {
      sessionManager.showAuthRequired("CLIP_LIBRARY")
      return { allowed: false, requiresAuth: true, message: "Authentication required to access clip library" }
    }
    return { allowed: true, requiresAuth: false }
  },

  // 8. ACCOUNT SETTINGS FLOW
  async account_settings_flow(): Promise<MenuHandlerResult> {
    if (!apiClient.token) {
      sessionManager.showAuthRequired("ACCOUNT_SETTINGS")
      return { allowed: false, requiresAuth: true, message: "Authentication required to access account settings" }
    }
    return { allowed: true, requiresAuth: false }
  },

  // 9. BILLING FLOW
  async billing_flow(): Promise<MenuHandlerResult> {
    if (!apiClient.token) {
      sessionManager.showAuthRequired("BILLING_ACCESS")
      return { allowed: false, requiresAuth: true, message: "Authentication required to access billing" }
    }
    return { allowed: true, requiresAuth: false }
  },

  // 10. LOGOUT FLOW
  async logout_flow(): Promise<MenuHandlerResult> {
    if (!apiClient.token) {
      return { allowed: false, requiresAuth: false, message: "Already logged out" }
    }
    // Logout is always allowed for authenticated users
    try {
      await apiClient.logout()
      sessionManager.clearSession()
      return { allowed: true, requiresAuth: false, message: "Logged out successfully" }
    } catch (error) {
      console.error("Logout error:", error)
      return { allowed: false, requiresAuth: false, message: "Logout failed" }
    }
  },

  // 11. DOCUMENTATION FLOW
  async documentation_flow(): Promise<MenuHandlerResult> {
    // Documentation is always accessible
    return { allowed: true, requiresAuth: false }
  },

  // 12. SUPPORT FLOW
  async support_flow(): Promise<MenuHandlerResult> {
    // Support is always accessible
    return { allowed: true, requiresAuth: false }
  }
}

// Legacy handlers for backward compatibility
export const ProjectMenuHandlers: Record<string, () => Promise<MenuHandlerResult>> = {
  async new(): Promise<MenuHandlerResult> {
    return ProjectMenuFlowHandlers.create_project_flow()
  },

  async about(): Promise<MenuHandlerResult> {
    return ProjectMenuFlowHandlers.documentation_flow()
  },

  async open(): Promise<MenuHandlerResult> {
    return ProjectMenuFlowHandlers.open_project_flow()
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
    if (!apiClient.token) {
      sessionManager.showAuthRequired("EXPORT_ALS")
      return { allowed: false, requiresAuth: true }
    }
    return { allowed: true, requiresAuth: false }
  },

  async import(): Promise<MenuHandlerResult> {
    if (!apiClient.token) {
      sessionManager.showAuthRequired("IMPORT_ALS")
      return { allowed: false, requiresAuth: true }
    }
    return { allowed: true, requiresAuth: false }
  },

  async account(): Promise<MenuHandlerResult> {
    return ProjectMenuFlowHandlers.account_settings_flow()
  }
}

// Helper function to execute flow by flow_id
export const executeFlowById = async (flowId: string): Promise<MenuHandlerResult> => {
  const handler = ProjectMenuFlowHandlers[flowId]
  if (!handler) {
    console.error(`No handler found for flow_id: ${flowId}`)
    return { 
      allowed: false, 
      requiresAuth: false, 
      message: `Flow ${flowId} not implemented` 
    }
  }
  
  try {
    return await handler()
  } catch (error) {
    console.error(`Error executing flow ${flowId}:`, error)
    return { 
      allowed: false, 
      requiresAuth: false, 
      message: `Flow ${flowId} execution failed` 
    }
  }
} 