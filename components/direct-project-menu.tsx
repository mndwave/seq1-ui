"use client"

import React, { useRef, useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import {
  MenuIcon,
  FilePlus,
  FolderOpen,
  Save,
  FileText,
  Upload,
  Download,
  UserPlus,
  LogOut,
  Info,
  Settings2,
} from "lucide-react"

import { Button } from "@/components/ui/button" // Assuming shadcn Button
import { useToast } from "@/hooks/use-toast"
import { authManager } from "@/lib/auth-manager"
import { sessionManager } from "@/lib/session-manager"
import { ProjectMenuHandlers } from "@/lib/project-menu-handlers"
import { FREE_OPERATIONS, AUTH_CONTEXT_OPERATIONS } from "@/lib/project-menu-constants"
import config from "@/lib/config"

// Modals (ensure paths are correct)
import AuthManager from "./auth/auth-manager" // Updated path
import AboutModal from "./about-modal"
import AccountModal from "./account/account-modal"

interface MenuItemConfig {
  id: string // Unique ID for the menu item itself
  label: string
  icon: React.ReactNode
  actionId: string // The action identifier passed to onAction and handlers
  disabled?: boolean
  comingSoon?: boolean
  dividerAfter?: boolean
  dividerBefore?: boolean
  authRequired?: boolean // Explicitly mark if auth is generally required
  showVersionTag?: boolean
}

interface DirectProjectMenuProps {
  onAction: (action: string, payload?: any) => void // Payload can be used for future extensions
}

const DirectProjectMenuComponent: React.FC<DirectProjectMenuProps> = ({ onAction }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(authManager.isAuthenticated) // JWT auth
  const [isMounted, setIsMounted] = useState(false)

  // Modal states
  const [showAuthManager, setShowAuthManager] = useState(false)
  const [authManagerInitialMode, setAuthManagerInitialMode] = useState<"login" | "signup">("login")
  const [authManagerMessage, setAuthManagerMessage] = useState<string | undefined>(undefined)
  const [operationToUnlock, setOperationToUnlock] = useState<string | null>(null)

  const [showAboutModal, setShowAboutModal] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)

  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })
  const { toast } = useToast()

  // Update authentication state from authManager
  const refreshAuthState = useCallback(async () => {
    await authManager.checkAuthStatus() // Ensures authManager's state is current
    setIsUserAuthenticated(authManager.isAuthenticated)
  }, [])

  // Effect for initial mount and auth state
  useEffect(() => {
    setIsMounted(true)
    refreshAuthState() // Initial auth check
    sessionManager.initialize() // Initialize session manager for anonymous users
  }, [refreshAuthState])

  // Effect for handling global SEQ1 events
  useEffect(() => {
    const handleLoggedIn = () => {
      refreshAuthState()
      setShowAuthManager(false)
      toast({
        title: "Studio Session Secured!",
        description: "You're all set to create. Full access granted.",
        variant: "default",
      })
      if (operationToUnlock) {
        // Automatically try to perform the action that was pending
        // Ensure the action is re-validated now that user is logged in
        handleMenuItemClick(operationToUnlock)
        setOperationToUnlock(null)
      }
    }

    const handleLoggedOut = () => {
      refreshAuthState()
      setShowAccountModal(false) // Close account modal if open
      toast({
        title: "Session Ended",
        description: "You've been signed out. Secure your session again to continue.",
        variant: "default",
      })
    }

    const handleAuthRequired = (event: CustomEvent) => {
      const { operation, message, mode } = event.detail
      setOperationToUnlock(operation || null)
      setAuthManagerMessage(message || "Secure your Studio Session to continue.")
      setAuthManagerInitialMode(mode || "login")
      setShowAuthManager(true)
    }

    const handleSessionExpired = (event: CustomEvent) => {
      // This implies anonymous session expired, or JWT became invalid server-side
      refreshAuthState() // Re-check auth status
      setAuthManagerMessage(event.detail.message || "Your session has ended. Please secure it to continue.")
      setAuthManagerInitialMode("login") // Default to login
      setShowAuthManager(true)
    }

    const handleSessionTimeoutWarning = (event: CustomEvent) => {
      const { message, urgent, showSaveButton } = event.detail
      toast({
        title: urgent ? "🚨 Studio Session Expiring Soon!" : "⏳ Session Update",
        description: message,
        variant: urgent ? "destructive" : "default",
        duration: urgent ? 10000 : 6000,
        // Potentially add an action button if showSaveButton is true
      })
    }

    window.addEventListener("seq1:auth:loggedIn", handleLoggedIn)
    window.addEventListener("seq1:auth:loggedOut", handleLoggedOut)
    window.addEventListener("auth-required", handleAuthRequired as EventListener)
    window.addEventListener("seq1:session:expired", handleSessionExpired as EventListener)
    window.addEventListener("session-timeout-warning", handleSessionTimeoutWarning as EventListener)

    return () => {
      window.removeEventListener("seq1:auth:loggedIn", handleLoggedIn)
      window.removeEventListener("seq1:auth:loggedOut", handleLoggedOut)
      window.removeEventListener("auth-required", handleAuthRequired as EventListener)
      window.removeEventListener("seq1:session:expired", handleSessionExpired as EventListener)
      window.removeEventListener("session-timeout-warning", handleSessionTimeoutWarning as EventListener)
    }
  }, [operationToUnlock, refreshAuthState, toast])

  const menuItemsConfig: MenuItemConfig[] = [
    {
      id: "new",
      label: "NEW PROJECT",
      icon: <FilePlus size={16} className="mr-2" />,
      actionId: "new",
      authRequired: false,
    },
    {
      id: "open",
      label: "OPEN PROJECT",
      icon: <FolderOpen size={16} className="mr-2" />,
      actionId: "open",
      authRequired: true,
      dividerAfter: true,
    },
    { id: "save", label: "SAVE", icon: <Save size={16} className="mr-2" />, actionId: "save", authRequired: true },
    {
      id: "saveAs",
      label: "SAVE AS...",
      icon: <FileText size={16} className="mr-2" />,
      actionId: "saveAs",
      authRequired: true,
      dividerAfter: true,
    },
    {
      id: "export",
      label: "EXPORT ALS",
      icon: <Upload size={16} className="mr-2" />,
      actionId: "export",
      disabled: true,
      comingSoon: true,
      authRequired: true,
    },
    {
      id: "import",
      label: "IMPORT ALS",
      icon: <Download size={16} className="mr-2" />,
      actionId: "import",
      disabled: true,
      comingSoon: true,
      authRequired: true,
      dividerAfter: true,
    },
    {
      id: "about",
      label: "ABOUT SEQ1",
      icon: <Info size={16} className="mr-2" />,
      actionId: "about",
      authRequired: false,
      showVersionTag: true,
    },
  ]

  // Calculate menu position when it opens
  useEffect(() => {
    if (isMenuOpen && menuButtonRef.current && dropdownRef.current) {
      const buttonRect = menuButtonRef.current.getBoundingClientRect()
      // Position below the button, aligning to its right edge
      setMenuPosition({
        top: buttonRect.bottom + window.scrollY + 5, // 5px gap
        right: window.innerWidth - buttonRect.right - window.scrollX,
      })
    }
  }, [isMenuOpen])

  // Handle clicks outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false)
      }
    }
    if (isMenuOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isMenuOpen])

  const handleMenuItemClick = useCallback(
    async (actionId: string) => {
      setIsMenuOpen(false) // Close menu on any action attempt

      const menuItem = menuItemsConfig.find((item) => item.actionId === actionId)
      // Also handle 'account' and 'logout' which are not in menuItemsConfig
      const isAccountAction = actionId === "account"
      const isLogoutAction = actionId === "logout"
      const isSecureSessionAction = actionId === "secureSession"

      if (!menuItem && !isAccountAction && !isLogoutAction && !isSecureSessionAction) {
        console.warn("Unknown menu action:", actionId)
        return
      }

      const itemLabel =
        menuItem?.label || (isAccountAction ? "Your Studio" : isLogoutAction ? "Sign Out" : "Secure Session")

      if (menuItem?.disabled || menuItem?.comingSoon) {
        toast({
          title: "Feature In Development",
          description: `${menuItem.label} is coming soon to SEQ1. Stay tuned!`,
        })
        return
      }

      // Specific non-handler actions
      if (actionId === "about") {
        setShowAboutModal(true)
        return
      }
      if (isLogoutAction) {
        authManager.logout() // This will trigger 'seq1:auth:loggedOut' event
        return
      }
      if (isSecureSessionAction) {
        sessionManager.showAuthRequired(
          AUTH_CONTEXT_OPERATIONS.SECURE_SESSION_BUTTON,
          "Secure your Studio Session to save your work and unlock all features.",
          "signup", // Default to signup for new users
        )
        return
      }

      // Default assumption: proceed if free or authenticated
      let canProceed = false
      const isFreeOp = FREE_OPERATIONS.includes(actionId)
      const handler = ProjectMenuHandlers[actionId]

      if (isFreeOp) {
        canProceed = true
      } else if (isUserAuthenticated) {
        // Covers 'account' and other authRequired items
        if (isAccountAction) {
          setShowAccountModal(true)
          return // Modal shown, no further action dispatch needed from here
        }
        canProceed = true // Already authenticated
      } else {
        // Not free and not authenticated, this is where handlers or direct sessionManager calls come in
        if (handler) {
          const result = await handler() // Handler calls sessionManager.showAuthRequired
          if (result.allowed) {
            // Should be false if auth was required and not met
            canProceed = true
          } else if (result.requiresAuth) {
            setOperationToUnlock(actionId) // Let event listener handle AuthManager
          }
        } else if (menuItem?.authRequired || isAccountAction) {
          // Fallback for items marked authRequired but without a specific pre-check handler
          // or for the account action.
          const operationContext =
            AUTH_CONTEXT_OPERATIONS[actionId.toUpperCase() as keyof typeof AUTH_CONTEXT_OPERATIONS] ||
            actionId.toUpperCase()
          sessionManager.showAuthRequired(
            operationContext,
            `Access to "${itemLabel}" requires a secure session. Please sign in or create an identity.`,
          )
          setOperationToUnlock(actionId)
        } else {
          // Should not be reached if logic is correct (i.e. item is free or authRequired is handled)
          console.warn(`Menu item ${actionId} has unclear auth requirements.`)
        }
      }

      if (canProceed) {
        if (handler && !isFreeOp && !isAccountAction) {
          // Re-check with handler if it exists, for non-free/non-account
          const result = await handler()
          if (!result.allowed) {
            if (result.requiresAuth) setOperationToUnlock(actionId) // It might have been optimistic
            return
          }
        }
        onAction(actionId)
      }
    },
    [isUserAuthenticated, onAction, toast, setOperationToUnlock],
  )

  const renderAuthRelatedButtons = () => {
    if (isUserAuthenticated) {
      return (
        <>
          <button
            className="w-full text-left px-3 py-2.5 text-sm text-neutral-200 hover:bg-neutral-700 flex items-center rounded-md"
            onClick={() => handleMenuItemClick("account")}
            role="menuitem"
          >
            <Settings2 size={16} className="mr-2 text-neutral-400" />
            Your Studio
          </button>
          <div className="border-t border-neutral-700 my-1" role="separator" />
          <button
            className="w-full text-left px-3 py-2.5 text-sm text-neutral-200 hover:bg-neutral-700 flex items-center rounded-md"
            onClick={() => handleMenuItemClick("logout")}
            role="menuitem"
          >
            <LogOut size={16} className="mr-2 text-neutral-400" />
            Sign Out
          </button>
        </>
      )
    } else {
      return (
        <button
          className="w-full text-left px-3 py-2.5 text-sm text-blue-400 hover:bg-neutral-700 flex items-center rounded-md"
          onClick={() => handleMenuItemClick("secureSession")}
          role="menuitem"
        >
          <UserPlus size={16} className="mr-2 text-blue-400" />
          Secure Your Session
        </button>
      )
    }
  }

  const renderDropdownMenu = () => {
    if (!isMenuOpen || !isMounted) return null

    return createPortal(
      <div
        ref={dropdownRef}
        id="project-menu-dropdown"
        className={`fixed bg-[#2E2027] border border-[#4A3B41] rounded-md shadow-2xl w-64 p-1.5 z-[20001]
          transition-all duration-200 ease-out
          ${isMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
        style={{
          top: `${menuPosition.top}px`,
          right: `${menuPosition.right}px`,
          transformOrigin: 'top right'
        }}
        role="menu"
        aria-orientation="vertical"
        aria-labelledby="project-menu-button"
      >
        {menuItemsConfig.map((item) => (
          <React.Fragment key={item.id}>
            {item.dividerBefore && <div className="border-t border-neutral-700 my-1" role="separator" />}
            <button
              className={`w-full text-left px-3 py-2.5 text-sm flex items-center rounded-md justify-between
                                ${
                                  item.disabled || item.comingSoon
                                    ? "text-neutral-500 cursor-not-allowed"
                                    : "text-neutral-200 hover:bg-neutral-700"
                                }`}
              onClick={() => handleMenuItemClick(item.actionId)}
              disabled={item.disabled || item.comingSoon}
              role="menuitem"
            >
              <div className="flex items-center">
                {item.icon}
                <span>{item.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                {item.showVersionTag && (
                  <span className="text-xs bg-neutral-600 text-neutral-300 px-1.5 py-0.5 rounded-sm">
                    {config.NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT || "899250"}
                  </span>
                )}
                {item.comingSoon && (
                  <span className="text-xs bg-neutral-600 text-neutral-300 px-1.5 py-0.5 rounded-sm">SOON</span>
                )}
              </div>
            </button>
            {item.dividerAfter && <div className="border-t border-neutral-700 my-1" role="separator" />}
          </React.Fragment>
        ))}
        <div className="border-t border-neutral-700 my-1" role="separator" />
        {renderAuthRelatedButtons()}
      </div>,
      document.body, // Portal to body
    )
  }

  return (
    <div className="relative isolate">
      {" "}
      {/* isolate for z-index stacking context */}
      <Button
        ref={menuButtonRef}
        id="project-menu-button"
        variant="outline" // Example shadcn button variant
        className={`seq1-project-menu-button channel-button flex items-center px-3 py-1.5 text-xs tracking-wide ${isMenuOpen ? "active" : ""}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-haspopup="true"
        aria-expanded={isMenuOpen}
        aria-controls="project-menu-dropdown"
        style={{
          // backgroundColor: "rgba(40, 30, 35, 0.9)", // From original
          // border: "1px solid rgba(80, 70, 75, 0.8)", // From original
          borderRadius: "3px", // From original
        }}
      >
        <MenuIcon size={14} className="mr-1.5" />
        PROJECT
      </Button>
      {renderDropdownMenu()}
      {isMounted && showAuthManager && (
        <AuthManager
          isOpen={showAuthManager}
          onClose={() => {
            setShowAuthManager(false)
            setOperationToUnlock(null) // Clear pending action if modal is closed manually
          }}
          initialMode={authManagerInitialMode}
          // Pass onAuthComplete if AuthManager needs to trigger something specific
          // onAuthComplete={() => { console.log("AuthManager reported completion from DPM"); }}
        />
      )}
      {isMounted && showAboutModal && <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />}
      {isMounted && showAccountModal && (
        <AccountModal isOpen={showAccountModal} onClose={() => setShowAccountModal(false)} />
      )}
    </div>
  )
}

const MemoizedDirectProjectMenu = React.memo(DirectProjectMenuComponent)
export default MemoizedDirectProjectMenu
