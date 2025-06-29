"use client"

import React, { useRef, useState, useEffect } from "react"
import { createPortal } from "react-dom"
import {
  Menu, FilePlus, FolderOpen, Save, FileText, Upload, Download, Share,
  Music, Settings, Library, User, CreditCard, LogOut, Book, HelpCircle,
  Clock, Studio, Key, Zap
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ProjectMenuFlowHandlers, executeFlowById } from "@/lib/project-menu-handlers"
import { useToast } from "@/hooks/use-toast"
import AuthManager from "./auth/auth-manager"

// YAML Structure Interfaces
interface YamlMenuItem {
  item_id: string
  label: string
  flow_id: string
  click_action: string
  icon: string
  visible: boolean
  auth_required: boolean
  feature_flag?: string
}

interface MenuGroup {
  group_id: string
  items: YamlMenuItem[]
}

interface MenuSection {
  section_id: string
  title: string
  visible_for: string[]
  groups: MenuGroup[]
}

interface ProjectMenuYaml {
  menu: {
    button_label: string
    button_always_visible: boolean
    auth_states: string[]
    sections: MenuSection[]
  }
  flow_handlers: Record<string, any>
}

interface GlobalMenuCanonicalProps {
  onAction?: (action: string) => void
}

export default function GlobalMenuCanonical({ onAction }: GlobalMenuCanonicalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [projectMenu, setProjectMenu] = useState<ProjectMenuYaml | null>(null)
  const [authState, setAuthState] = useState<string>("anonymous")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { toast } = useToast()

  // Load canonical menu structure (YAML-based)
  useEffect(() => {
    async function loadProjectMenuYaml() {
      try {
        setIsLoading(true)
        // Use canonical structure that matches project_menu.yaml
        const canonicalMenu = getCanonicalStructure()
        setProjectMenu(canonicalMenu)
        console.log('✅ Loaded canonical menu structure:', canonicalMenu)
        
      } catch (error) {
        console.error('❌ Failed to load menu structure:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadProjectMenuYaml()
  }, [])

  // Determine current auth state
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("seq1_auth_token") 
      const npub = localStorage.getItem("seq1_npub")
      const nsec = localStorage.getItem("seq1_nsec")
      
      const hasValidAuth = !!(token && npub)
      const hasPhantomState = !!(nsec && !npub) // Corrupted state
      
      if (hasPhantomState) {
        console.warn('🚨 Phantom auth state detected - clearing storage')
        localStorage.removeItem("seq1_nsec")
        localStorage.removeItem("seq1_npub")
        localStorage.removeItem("seq1_auth_token")
        setAuthState("anonymous")
      } else if (hasValidAuth) {
        setAuthState("authenticated")
      } else {
        setAuthState("anonymous")
      }
    }
    setMounted(true)
  }, [])

  // Listen for auth state changes
  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem("seq1_auth_token")
      const npub = localStorage.getItem("seq1_npub")
      const isAuthenticated = !!(token && npub)
      
      setAuthState(isAuthenticated ? "authenticated" : "anonymous")
      console.log(`🔄 Auth state changed to: ${isAuthenticated ? "authenticated" : "anonymous"}`)
    }

    window.addEventListener("seq1:auth:loggedIn", handleAuthChange)
    window.addEventListener("seq1:auth:loggedOut", handleAuthChange)
    window.addEventListener("storage", handleAuthChange)

    return () => {
      window.removeEventListener("seq1:auth:loggedIn", handleAuthChange)
      window.removeEventListener("seq1:auth:loggedOut", handleAuthChange)
      window.removeEventListener("storage", handleAuthChange)
    }
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Canonical structure matching project_menu.yaml exactly
  function getCanonicalStructure(): ProjectMenuYaml {
    return {
      menu: {
        button_label: "PROJECT",
        button_always_visible: true,
        auth_states: ["anonymous", "authenticated", "expired", "authenticating"],
        sections: [
          {
            section_id: "studio_access",
            title: "Studio Access",
            visible_for: ["anonymous", "expired"],
            groups: [{
              group_id: "authentication",
              items: [{
                item_id: "access_studio",
                label: "ACCESS STUDIO",
                flow_id: "access_studio_flow",
                click_action: "trigger_auth_modal",
                icon: "studio",
                visible: true,
                auth_required: false
              }]
            }]
          },
          {
            section_id: "project_management", 
            title: "Projects",
            visible_for: ["authenticated"],
            groups: [{
              group_id: "project_actions",
              items: [
                {
                  item_id: "new_project",
                  label: "New Project", 
                  flow_id: "create_project_flow",
                  click_action: "navigate_to_new_project",
                  icon: "plus",
                  visible: true,
                  auth_required: true
                },
                {
                  item_id: "open_project",
                  label: "Open Project",
                  flow_id: "open_project_flow", 
                  click_action: "show_project_browser",
                  icon: "folder-open",
                  visible: true,
                  auth_required: true
                },
                {
                  item_id: "recent_projects",
                  label: "Recent Projects",
                  flow_id: "recent_projects_flow",
                  click_action: "show_recent_projects", 
                  icon: "clock",
                  visible: true,
                  auth_required: true
                }
              ]
            }]
          },
          {
            section_id: "studio_tools",
            title: "Studio",
            visible_for: ["authenticated"],
            groups: [{
              group_id: "composition",
              items: [
                {
                  item_id: "sequencer",
                  label: "Sequencer",
                  flow_id: "sequencer_flow",
                  click_action: "navigate_to_sequencer",
                  icon: "music",
                  visible: true,
                  auth_required: true
                },
                {
                  item_id: "device_manager",
                  label: "Device Manager", 
                  flow_id: "device_manager_flow",
                  click_action: "navigate_to_devices",
                  icon: "settings",
                  visible: true,
                  auth_required: true
                },
                {
                  item_id: "clip_library",
                  label: "Clip Library",
                  flow_id: "clip_library_flow",
                  click_action: "navigate_to_clips",
                  icon: "library", 
                  visible: true,
                  auth_required: true
                }
              ]
            }]
          },
          {
            section_id: "account_management",
            title: "Account", 
            visible_for: ["authenticated"],
            groups: [{
              group_id: "user_actions",
              items: [
                {
                  item_id: "account_settings",
                  label: "Account Settings",
                  flow_id: "account_settings_flow",
                  click_action: "navigate_to_account",
                  icon: "user",
                  visible: true,
                  auth_required: true
                },
                {
                  item_id: "billing",
                  label: "Billing", 
                  flow_id: "billing_flow",
                  click_action: "navigate_to_billing",
                  icon: "credit-card",
                  visible: true,
                  auth_required: true
                },
                {
                  item_id: "logout",
                  label: "Sign Out",
                  flow_id: "logout_flow",
                  click_action: "trigger_logout",
                  icon: "log-out",
                  visible: true,
                  auth_required: true
                }
              ]
            }]
          },
          {
            section_id: "help_support",
            title: "Help & Support",
            visible_for: ["anonymous", "authenticated", "expired"],
            groups: [{
              group_id: "documentation", 
              items: [
                {
                  item_id: "documentation",
                  label: "Documentation",
                  flow_id: "documentation_flow",
                  click_action: "navigate_to_docs",
                  icon: "book",
                  visible: true,
                  auth_required: false
                },
                {
                  item_id: "support", 
                  label: "Support",
                  flow_id: "support_flow",
                  click_action: "navigate_to_support",
                  icon: "help-circle",
                  visible: true,
                  auth_required: false
                }
              ]
            }]
          }
        ]
      },
      flow_handlers: {}
    }
  }

  // Icon mapping for menu items
  function getIcon(iconName: string): JSX.Element {
    const iconMap: Record<string, JSX.Element> = {
      "studio": <Studio size={14} className="icon-abstract" />,
      "key": <Key size={14} className="icon-abstract" />,
      "plus": <FilePlus size={14} className="icon-abstract" />,
      "folder-open": <FolderOpen size={14} className="icon-abstract" />,
      "clock": <Clock size={14} className="icon-abstract" />,
      "music": <Music size={14} className="icon-abstract" />,
      "settings": <Settings size={14} className="icon-abstract" />,
      "library": <Library size={14} className="icon-abstract" />,
      "user": <User size={14} className="icon-abstract" />,
      "credit-card": <CreditCard size={14} className="icon-abstract" />,
      "log-out": <LogOut size={14} className="icon-abstract" />,
      "book": <Book size={14} className="icon-abstract" />,
      "help-circle": <HelpCircle size={14} className="icon-abstract" />
    }
    return iconMap[iconName] || <Menu size={14} className="icon-abstract" />
  }

  // Execute flow using the ProjectMenuFlowHandlers
  async function executeFlow(flowId: string, clickAction: string) {
    console.log(`🔄 Executing flow: ${flowId}, action: ${clickAction}`)
    
    try {
      // Use the implemented flow handlers
      const result = await executeFlowById(flowId)
      
      if (!result.allowed) {
        if (result.requiresAuth) {
          console.log(`🔐 Authentication required for ${flowId}`)
          setShowAuthModal(true)
          return
        } else {
          toast({
            title: "❌ Action Failed",
            description: result.message || `Could not execute ${flowId}`,
            duration: 3000,
          })
          return
        }
      }

      // Handle specific click actions
      switch (clickAction) {
        case "trigger_auth_modal":
          setShowAuthModal(true)
          break
          
        case "navigate_to_new_project":
          toast({ title: "🆕 New Project", description: "Creating new project...", duration: 2000 })
          break
          
        case "show_project_browser":
          toast({ title: "📁 Project Browser", description: "Opening project browser...", duration: 2000 })
          break
          
        case "show_recent_projects":
          toast({ title: "🕒 Recent Projects", description: "Loading recent projects...", duration: 2000 })
          break
          
        case "navigate_to_sequencer":
          toast({ title: "🎵 Sequencer", description: "Opening sequencer...", duration: 2000 })
          break
          
        case "navigate_to_devices":
          toast({ title: "⚙️ Device Manager", description: "Opening device manager...", duration: 2000 })
          break
          
        case "navigate_to_clips":
          toast({ title: "📚 Clip Library", description: "Opening clip library...", duration: 2000 })
          break
          
        case "navigate_to_account":
          toast({ title: "👤 Account Settings", description: "Opening account settings...", duration: 2000 })
          break
          
        case "navigate_to_billing":
          toast({ title: "💳 Billing", description: "Opening billing...", duration: 2000 })
          break
          
        case "trigger_logout":
          await handleLogout()
          break
          
        case "navigate_to_docs":
          window.open("https://docs.seq1.net", "_blank")
          break
          
        case "navigate_to_support":
          window.open("https://support.seq1.net", "_blank")
          break
          
        default:
          console.warn(`⚠️ Unhandled click action: ${clickAction}`)
          toast({
            title: "🚧 Feature Coming Soon",
            description: `${clickAction} will be implemented soon`,
            duration: 3000,
          })
      }

      if (result.message) {
        toast({
          title: "✅ Success",
          description: result.message,
          duration: 2000,
        })
      }

    } catch (error) {
      console.error(`❌ Error executing flow ${flowId}:`, error)
      toast({
        title: "❌ Flow Execution Failed",
        description: `Error in ${flowId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: 4000,
      })
    }
  }

  // Handle logout flow
  async function handleLogout() {
    try {
      console.log('🚪 Executing logout...')
      
      // Execute logout flow handler
      const result = await executeFlowById("logout_flow")
      
      if (result.allowed) {
        // Clear local storage
        localStorage.removeItem("seq1_auth_token")
        localStorage.removeItem("seq1_npub")
        localStorage.removeItem("seq1_nsec")
        
        // Update state
        setAuthState("anonymous")
        setIsOpen(false)
        
        // Dispatch logout event
        window.dispatchEvent(new CustomEvent("seq1:auth:loggedOut"))
        
        toast({
          title: "👋 Signed Out",
          description: "You have been successfully signed out",
          duration: 2000,
        })
      } else {
        toast({
          title: "❌ Logout Failed",
          description: result.message || "Could not sign out",
          duration: 3000,
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast({
        title: "❌ Logout Error",
        description: "An error occurred during logout",
        duration: 3000,
      })
    }
  }

  // Generate visible menu items based on auth state and YAML configuration
  function getVisibleMenuItems() {
    if (!projectMenu) return []
    
    const visibleItems: YamlMenuItem[] = []
    
    for (const section of projectMenu.menu.sections) {
      // Check if section is visible for current auth state
      if (!section.visible_for.includes(authState)) {
        console.log(`Section ${section.section_id} not visible for auth state: ${authState}`)
        continue
      }
      
      for (const group of section.groups) {
        for (const item of group.items) {
          // Check item visibility
          if (!item.visible) continue
          
          // Check auth requirements vs current state
          if (item.auth_required && authState === "anonymous") {
            console.log(`Item ${item.item_id} requires auth but user is anonymous`)
            continue
          }
          
          visibleItems.push(item)
        }
      }
    }
    
    console.log(`Generated ${visibleItems.length} visible menu items for auth state: ${authState}`)
    return visibleItems
  }

  // Handle menu item click
  async function handleMenuItemClick(item: YamlMenuItem) {
    console.log(`🖱️ Menu item clicked: ${item.label} (${item.flow_id})`)
    setIsOpen(false)
    
    await executeFlow(item.flow_id, item.click_action)
    
    // Call parent action handler if provided
    if (onAction) {
      onAction(item.flow_id)
    }
  }

  const visibleMenuItems = getVisibleMenuItems()

  // Calculate menu position
  const calculateMenuPosition = () => {
    if (!buttonRef.current) return { top: 0, left: 0 }
    
    const rect = buttonRef.current.getBoundingClientRect()
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    const menuWidth = 280
    const menuHeight = Math.min(400, visibleMenuItems.length * 48 + 120)
    
    let top = rect.bottom + 4
    let left = rect.right - menuWidth
    
    if (left < 8) left = 8
    if (left + menuWidth > windowWidth - 8) left = windowWidth - menuWidth - 8
    if (top + menuHeight > windowHeight - 8) top = rect.top - menuHeight - 4
    
    return { top, left }
  }

  const renderMenu = () => {
    if (!isOpen || !mounted) return null

    const position = calculateMenuPosition()

    return createPortal(
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 2147483646 }}>
        <div
          ref={menuRef}
          className="fixed pointer-events-auto modal-content py-2 animate-menuReveal shadow-xl"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: "280px",
            zIndex: 2147483647,
            transformOrigin: "top right",
            maxHeight: "calc(100vh - 100px)",
            overflowY: "auto",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
          }}
        >
          {/* Menu Header */}
          <div className="bg-[var(--seq1-accent)] px-4 py-3 border-b border-[var(--seq1-border)]">
            <h3 className="seq1-heading text-sm tracking-wide">
              {projectMenu?.menu.button_label || "PROJECT"} MENU
            </h3>
            <div className="text-xs text-[var(--seq1-text-secondary)] mt-1">
              Auth: {authState} • Items: {visibleMenuItems.length}
              {error && <span className="text-red-400"> • Error: YAML fallback</span>}
            </div>
          </div>

          <div className="p-2">
            {isLoading ? (
              <div className="px-4 py-8 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--seq1-pulse)] mx-auto mb-3"></div>
                <div className="text-xs text-[var(--seq1-text-secondary)]">Loading menu...</div>
              </div>
            ) : visibleMenuItems.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-[var(--seq1-text-secondary)]">
                No menu items available for current state: {authState}
              </div>
            ) : (
              visibleMenuItems.map((item, index) => (
                <button
                  key={`${item.item_id}-${index}`}
                  className={cn(
                    "w-full text-left px-4 py-3 text-xs flex items-center rounded-sm transition-all duration-200",
                    "text-[var(--seq1-text-primary)] hover:bg-[var(--seq1-accent)] micro-feedback"
                  )}
                  onClick={() => handleMenuItemClick(item)}
                  role="menuitem"
                >
                  <span className="mr-3 text-[var(--seq1-text-secondary)]">
                    {getIcon(item.icon)}
                  </span>
                  <span className="seq1-caption font-medium flex-1">
                    {item.label}
                  </span>
                  {item.auth_required && (
                    <span className="ml-2 w-1 h-1 bg-[var(--seq1-warning)] rounded-full"></span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </div>,
      document.body
    )
  }

  if (!mounted) return null

  return (
    <div style={{ position: "relative", zIndex: 1000 }}>
      {/* PROJECT Button - Always shows button_label from YAML */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "channel-button micro-feedback flex items-center px-3 py-1.5",
          isOpen && "active"
        )}
        style={{
          position: "relative",
          zIndex: 2,
        }}
      >
        <Menu size={14} className="mr-1.5 icon-abstract" />
        <span className="text-xs tracking-wide font-medium">
          {projectMenu?.menu.button_label || "PROJECT"}
        </span>
      </button>
      
      {renderMenu()}
      
      {/* Auth Modal */}
      {showAuthModal && (
        <AuthManager
          isVisible={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  )
} 