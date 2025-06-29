"use client"

import { useState, useEffect, useRef } from "react"
import { 
  Menu, FilePlus, FolderOpen, Save, FileText, Upload, Download, Share, 
  Music, Settings, Library, User, CreditCard, LogOut, Book, HelpCircle,
  Clock, Studio
} from "lucide-react"
import { cn } from "@/lib/utils"
import AuthManager from "./auth-manager"
import { useConsciousnessAccess } from "@/lib/consciousness-context"

interface MenuItem {
  id: string
  label: string
  icon: JSX.Element
  actionId: string
  disabled: boolean
  comingSoon: boolean
  dividerBefore?: boolean
  dividerAfter?: boolean
  visible?: boolean
  auth_required?: boolean
}

interface MenuSection {
  section_id: string
  title: string
  visible_for: string[]
  groups: MenuGroup[]
}

interface MenuGroup {
  group_id: string
  items: YamlMenuItem[]
}

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

interface ProjectMenuYaml {
  menu: {
    button_label: string
    button_always_visible: boolean
    auth_states: string[]
    sections: MenuSection[]
  }
  flow_handlers: Record<string, any>
}

interface GlobalMenuProps {
  onActionSelect?: (actionId: string) => void
}

export default function GlobalMenu({ onActionSelect }: GlobalMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [projectMenu, setProjectMenu] = useState<ProjectMenuYaml | null>(null)
  const [authState, setAuthState] = useState<string>("anonymous")
  
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { hasAccess: hasConsciousnessAccess } = useConsciousnessAccess()

  // Load project menu YAML
  useEffect(() => {
    async function loadProjectMenu() {
      try {
        const response = await fetch('/system_definitions/ui/project_menu.yaml')
        if (response.ok) {
          const yamlText = await response.text()
          // Simple YAML parser for our specific structure
          const parsedYaml = parseProjectMenuYaml(yamlText)
          setProjectMenu(parsedYaml)
        } else {
          console.error('Failed to load project_menu.yaml')
        }
      } catch (error) {
        console.error('Error loading project menu:', error)
      }
    }
    
    loadProjectMenu()
  }, [])

  // Determine auth state
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasValidToken = !!localStorage.getItem("seq1_auth_token")
      const hasValidNpub = !!localStorage.getItem("seq1_npub")
      const isAuthenticated = hasValidToken && hasValidNpub
      
      if (isAuthenticated) {
        setAuthState("authenticated")
      } else {
        setAuthState("anonymous")
      }
    }
    setMounted(true)
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

  // Simple YAML parser for project menu structure
  function parseProjectMenuYaml(yamlText: string): ProjectMenuYaml {
    // This is a simplified parser - in production you'd use a proper YAML library
    // For now, return the canonical structure
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
          }
        ]
      },
      flow_handlers: {}
    }
  }

  // Icon mapping
  function getIcon(iconName: string): JSX.Element {
    const iconMap: Record<string, JSX.Element> = {
      "studio": <Music size={14} className="icon-abstract" />,
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

  // Flow action handlers
  function handleFlowAction(flowId: string, clickAction: string) {
    console.log(`Executing flow: ${flowId}, action: ${clickAction}`)
    
    switch (clickAction) {
      case "trigger_auth_modal":
        setShowAuthModal(true)
        break
      case "navigate_to_new_project":
        // TODO: Implement navigation
        console.log("Navigate to new project")
        break
      case "show_project_browser":
        // TODO: Implement project browser modal
        console.log("Show project browser")
        break
      case "show_recent_projects":
        // TODO: Implement recent projects dropdown
        console.log("Show recent projects")
        break
      case "navigate_to_account":
        // TODO: Implement account navigation
        console.log("Navigate to account")
        break
      case "trigger_logout":
        handleLogout()
        break
      default:
        console.warn(`Unhandled flow action: ${clickAction}`)
    }
    
    setIsOpen(false)
  }

  function handleLogout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("seq1_auth_token")
      localStorage.removeItem("seq1_npub")
      setAuthState("anonymous")
      // TODO: Add any additional logout logic
    }
  }

  // Generate menu items from YAML structure
  function generateMenuItems(): MenuItem[] {
    if (!projectMenu) return []
    
    const items: MenuItem[] = []
    
    for (const section of projectMenu.menu.sections) {
      // Check if section is visible for current auth state
      if (!section.visible_for.includes(authState)) continue
      
      for (const group of section.groups) {
        for (const yamlItem of group.items) {
          // Check auth requirements
          if (yamlItem.auth_required && authState === "anonymous") continue
          if (!yamlItem.visible) continue
          
          items.push({
            id: yamlItem.item_id,
            label: yamlItem.label,
            icon: getIcon(yamlItem.icon),
            actionId: yamlItem.flow_id,
            disabled: false,
            comingSoon: false,
            visible: true,
            auth_required: yamlItem.auth_required
          })
        }
      }
    }
    
    return items
  }

  function handleMenuActionClick(flowId: string) {
    if (!projectMenu) return
    
    // Find the corresponding item and its click action
    for (const section of projectMenu.menu.sections) {
      for (const group of section.groups) {
        for (const item of group.items) {
          if (item.flow_id === flowId) {
            handleFlowAction(flowId, item.click_action)
            return
          }
        }
      }
    }
    
    console.warn(`Flow not found: ${flowId}`)
  }

  const menuItems = generateMenuItems()

  const renderMenu = () => {
    if (!isOpen || !mounted) return null

    return (
      <div
        ref={menuRef}
        className="absolute top-full left-0 mt-1 bg-[var(--seq1-background)] border border-[var(--seq1-border)] rounded-md shadow-lg overflow-hidden min-w-[200px] z-[9999]"
        style={{
          position: "absolute",
          zIndex: 9999,
        }}
      >
        {/* Enhanced Header */}
        <div className="bg-[var(--seq1-accent)] px-4 py-3 border-b border-[var(--seq1-border)]">
          <h3 className="seq1-heading text-sm tracking-wide">PROJECT MENU</h3>
        </div>

        <div className="p-2">
          {menuItems.length === 0 ? (
            <div className="px-4 py-3 text-xs text-[var(--seq1-text-secondary)]">
              Loading menu...
            </div>
          ) : (
            menuItems.map((item) => (
              <button
                key={item.id}
                className={cn(
                  "w-full text-left px-4 py-3 text-xs flex items-center rounded-sm relative transition-all duration-200",
                  item.disabled || item.comingSoon 
                    ? "coming-soon-button cursor-not-allowed"
                    : "text-[var(--seq1-text-primary)] hover:bg-[var(--seq1-accent)] micro-feedback"
                )}
                onClick={() => handleMenuActionClick(item.actionId)}
                disabled={item.disabled}
                role="menuitem"
              >
                <span className="mr-3 text-[var(--seq1-text-secondary)]">{item.icon}</span>
                <span className={cn(
                  "seq1-caption",
                  item.disabled ? "text-[var(--seq1-text-disabled)]" : ""
                )}>
                  {item.label}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    )
  }

  if (!mounted) return null

  return (
    <div style={{ position: "relative", zIndex: 1000 }}>
      {/* Project Menu Button - ALWAYS shows "PROJECT" */}
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
        <span className="text-xs tracking-wide font-medium">PROJECT</span>
      </button>
      
      {renderMenu()}
      
      {/* AuthManager Modal */}
      {showAuthModal && (
        <AuthManager
          isVisible={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  )
} 