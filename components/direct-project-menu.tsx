"use client"

import React, { useRef, useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import {
  Menu,
  FilePlus,
  FolderOpen,
  Save,
  FileText,
  Upload,
  Download,
  UserPlus,
  LogOut,
  Info,
  User,
  Brain,
  Share,
} from "lucide-react"
// Assuming AuthManagerModal is your JWT/email-password auth modal component
// For now, we'll use the existing AuthManager (Nostr) as a placeholder if not available.
import AuthManager from "./auth/auth-manager" // Use AuthManager to provide both login and signup options
import AboutModal from "./about-modal"
import AccountModal from "./account-modal"
import ConsciousnessInterface from "./consciousness/consciousness-interface"
import { authManager } from "@/lib/auth-manager"
import { sessionManager } from "@/lib/session-manager"
import { ProjectMenuHandlers } from "@/lib/project-menu-handlers"
import { FREE_OPERATIONS, AUTH_REQUIRED_OPERATIONS } from "@/lib/project-menu-constants"
import { useToast } from "@/hooks/use-toast"
import { useConsciousnessAccess } from "@/hooks/use-consciousness-access"

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  actionId: string // Use a distinct actionId for handlers
  disabled: boolean
  comingSoon: boolean
  dividerAfter?: boolean
  dividerBefore?: boolean
}

interface DirectProjectMenuProps {
  onAction: (action: string) => void // This prop executes the actual project operation
}

export default function DirectProjectMenu({ onAction }: DirectProjectMenuProps) {
  const [isJwtAuthenticated, setIsJwtAuthenticated] = useState(authManager.isAuthenticated)
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalMessage, setAuthModalMessage] = useState("Authentication Required")
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showAboutModal, setShowAboutModal] = useState(false)
  const [showConsciousnessInterface, setShowConsciousnessInterface] = useState(false)

  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })
  const { toast } = useToast()
  const { hasAccess: hasConsciousnessAccess } = useConsciousnessAccess()

  const updateAuthState = useCallback(async () => {
    await authManager.checkAuthStatus()
    setIsJwtAuthenticated(authManager.isAuthenticated)
  }, [])

  useEffect(() => {
    updateAuthState()

    const handleLoggedIn = () => {
      setIsJwtAuthenticated(true)
      if (pendingAction) {
        onAction(pendingAction)
        setPendingAction(null)
      }
      setShowAuthModal(false)
    }
    const handleLoggedOut = () => setIsJwtAuthenticated(false)

    const handleAuthRequiredEvent = (event: CustomEvent) => {
      console.log("Auth Required Event from SessionManager:", event.detail)
      setAuthModalMessage(event.detail.message || "Please sign up or log in to continue.")
      setPendingAction(event.detail.operation || null)
      setShowAuthModal(true)
    }
    const handleSessionExpiredEvent = (event: CustomEvent) => {
      console.log("Session Expired Event:", event.detail)
      setAuthModalMessage(event.detail.message || "Your session has expired. Please sign up or log in.")
      setShowAuthModal(true)
    }
    const handleSessionTimeoutWarningEvent = (event: CustomEvent) => {
      console.log("Session Timeout Warning Event:", event.detail)
      toast({
        title: event.detail.urgent ? "Session Ending Soon!" : "Session Warning",
        description: event.detail.message,
        variant: event.detail.urgent ? "destructive" : "default",
        duration: event.detail.urgent ? 10000 : 5000,
      })
    }

    window.addEventListener("seq1:auth:loggedIn", handleLoggedIn)
    window.addEventListener("seq1:auth:loggedOut", handleLoggedOut)
    window.addEventListener("auth-required", handleAuthRequiredEvent as EventListener)
    window.addEventListener("seq1:session:expired", handleSessionExpiredEvent as EventListener)
    window.addEventListener("session-timeout-warning", handleSessionTimeoutWarningEvent as EventListener)

    return () => {
      window.removeEventListener("seq1:auth:loggedIn", handleLoggedIn)
      window.removeEventListener("seq1:auth:loggedOut", handleLoggedOut)
      window.removeEventListener("auth-required", handleAuthRequiredEvent as EventListener)
      window.removeEventListener("seq1:session:expired", handleSessionExpiredEvent as EventListener)
      window.removeEventListener("session-timeout-warning", handleSessionTimeoutWarningEvent as EventListener)
    }
  }, [updateAuthState, pendingAction, onAction, toast])

  const menuItems: MenuItem[] = [
    {
      id: "new",
      label: "NEW",
      icon: <FilePlus size={14} />,
      actionId: "new",
      disabled: false,
      comingSoon: false,
    },
    {
      id: "open",
      label: "OPEN",
      icon: <FolderOpen size={14} />,
      actionId: "open",
      disabled: false,
      comingSoon: false,
      dividerAfter: true,
    },
    { id: "save", label: "SAVE", icon: <Save size={14} />, actionId: "save", disabled: false, comingSoon: false },
    {
      id: "saveAs",
      label: "SAVE AS",
      icon: <FileText size={14} />,
      actionId: "saveAs",
      disabled: false,
      comingSoon: false,
      dividerAfter: !isJwtAuthenticated, // Add divider for unauthenticated users
    },
    // Add Share Track for authenticated users only
    ...(isJwtAuthenticated
      ? [
          {
            id: "shareTrack",
            label: "SHARE TRACK",
            icon: <Share size={14} />,
            actionId: "shareTrack",
            disabled: false,
            comingSoon: false,
            dividerAfter: true,
          },
        ]
      : []),
    {
      id: "export",
      label: "EXPORT",
      icon: <Upload size={14} />,
      actionId: "export",
      disabled: true,
      comingSoon: true,
    },
    {
      id: "import",
      label: "IMPORT",
      icon: <Download size={14} />,
      actionId: "import",
      disabled: true,
      comingSoon: true,
    },
    {
      id: "about",
      label: "ABOUT",
      icon: <Info size={14} />,
      actionId: "about",
      disabled: false,
      comingSoon: false,
      dividerBefore: true,
    },
    ...(isJwtAuthenticated
      ? [
          // Add consciousness interface for admin users
          ...(hasConsciousnessAccess
            ? [
                {
                  id: "consciousness",
                  label: "CONSCIOUSNESS",
                  icon: <Brain size={14} />,
                  actionId: "consciousness",
                  disabled: false,
                  comingSoon: false,
                  dividerBefore: true,
                },
              ]
            : []),
          {
            id: "account",
            label: "ACCOUNT",
            icon: <User size={14} />,
            actionId: "account",
            disabled: false,
            comingSoon: false,
            dividerBefore: hasConsciousnessAccess ? false : true, // Only add divider if consciousness not shown
          },
        ]
      : []),
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setMenuPosition({ top: rect.bottom + window.scrollY, right: window.innerWidth - rect.right + window.scrollX })
    }
  }, [isOpen])

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
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  const handleMenuActionClick = async (actionId: string) => {
    setIsOpen(false)
    const menuItem = menuItems.find((item) => item.actionId === actionId)
    if (!menuItem) return

    if (menuItem.disabled || menuItem.comingSoon) {
      toast({ title: "Coming Soon", description: `${menuItem.label} is not yet available.` })
      return
    }

    if (actionId === "about") {
      setShowAboutModal(true)
      return
    }
    if (actionId === "consciousness") {
      setShowConsciousnessInterface(true)
      return
    }
    if (actionId === "account") {
      if (isJwtAuthenticated) setShowAccountModal(true)
      else sessionManager.showAuthRequired("ACCOUNT_ACCESS") // This will trigger the auth modal via event
      return
    }

    const handler = ProjectMenuHandlers[actionId]
    let canProceed = false

    if (FREE_OPERATIONS.includes(actionId)) {
      canProceed = true
    } else if (handler) {
      const result = await handler()
      if (result.allowed) {
        canProceed = true
      } else if (result.requiresAuth) {
        // sessionManager.showAuthRequired should have been called by the handler
        // The event listener will set pendingAction and show the modal.
        setPendingAction(actionId) // Ensure pendingAction is set
      }
    } else if (AUTH_REQUIRED_OPERATIONS.includes(actionId) && !isJwtAuthenticated) {
      // Fallback for auth-required operations without specific handlers (should not happen if handlers are comprehensive)
      sessionManager.showAuthRequired(actionId.toUpperCase())
      setPendingAction(actionId)
    } else if (isJwtAuthenticated) {
      // Authenticated user, and no specific handler denied access
      console.warn(`No specific handler for authenticated action: ${actionId}. Proceeding.`)
      canProceed = true
    } else {
      console.warn(`Unhandled menu action: ${actionId}. Not explicitly free, no handler, and user not authenticated.`)
      sessionManager.showAuthRequired(actionId.toUpperCase(), "This action requires you to be logged in.")
      setPendingAction(actionId)
    }

    if (canProceed) {
      onAction(actionId) // Execute the actual operation
    }
  }

  const handleAuthModalClose = () => {
    setShowAuthModal(false)
    // If the modal was closed without logging in, clear pending action
    if (!isJwtAuthenticated) {
      setPendingAction(null)
    }
  }

  const handleAuthComplete = async (/* credentials from modal */) => {
    // This function would be called by your AuthManagerModal upon successful JWT login/signup
    // For example: await authManager.upgradeToAuthenticated(credentials) or a login function
    // The 'seq1:auth:loggedIn' event listener will handle state updates and pending actions.
    // For now, we assume the modal itself handles the authManager call.
    // If pendingAction exists and login was successful, it will be handled by the event listener.
    // setShowAuthModal(false); // Already handled by loggedIn event
  }

  const renderAuthOption = () => {
    if (isJwtAuthenticated) {
      return (
        <button
          className="w-full text-left px-4 py-2 text-xs text-[#f0e6c8] hover:bg-[#3a2a30] flex items-center rounded-sm"
          onClick={() => {
            setIsOpen(false)
            authManager.logout()
          }}
          role="menuitem"
        >
          <LogOut size={14} className="mr-3 text-[#a09080]" />
          <span>SIGN OUT</span>
        </button>
      )
    } else {
      return (
        <button
          className="w-full text-left px-4 py-2 text-xs text-[#4287f5] hover:bg-[#3a2a30] flex items-center rounded-sm"
          onClick={() => {
            setIsOpen(false)
            // Show AuthManager with both login and signup options
            setAuthModalMessage("Sign in to your account or create a new one to continue.")
            setShowAuthModal(true)
          }}
          role="menuitem"
        >
          <UserPlus size={14} className="mr-3 text-[#4287f5]" />
          <span>LOGIN / SIGNUP</span>
        </button>
      )
    }
  }

  const renderMenu = () => {
    if (!isOpen || !mounted) return null
    return createPortal(
      <div
        ref={menuRef}
        className="fixed bg-[#2a1a20] border-2 border-[#3a2a30] w-64 py-1 animate-menuReveal shadow-xl z-[2147483647]"
        style={{
          top: `${menuPosition.top}px`,
          right: `${menuPosition.right}px`,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div className="p-2">
          {menuItems.map((item) =>
            item.id === "account" || item.id === "consciousness" ? null : (
              // Handled separately
              <React.Fragment key={item.id}>
                {item.dividerBefore && <div className="border-t border-[#3a2a30] my-2"></div>}
                <button
                  className={`w-full text-left px-4 py-2 text-xs text-[#f0e6c8] hover:bg-[#3a2a30] flex items-center rounded-sm relative ${item.disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                  onClick={() => handleMenuActionClick(item.actionId)}
                  disabled={item.disabled}
                  role="menuitem"
                >
                  {item.icon && <span className="mr-3 text-[#a09080]">{item.icon}</span>}
                  <span className={item.disabled ? "text-[#a09080]" : ""}>{item.label}</span>
                  {item.comingSoon && (
                    <span className="ml-2 px-1.5 py-0.5 text-[8px] bg-[#3a2a30] text-[#f0e6c8] rounded-sm tracking-wider">
                      COMING SOON
                    </span>
                  )}
                </button>
                {item.dividerAfter && <div className="border-t border-[#3a2a30] my-2"></div>}
              </React.Fragment>
            ),
          )}
          <div className="border-t border-[#3a2a30] my-2"></div>
          {isJwtAuthenticated && hasConsciousnessAccess && menuItems.find((item) => item.id === "consciousness") && (
            <button
              className="w-full text-left px-4 py-2 text-xs text-[#4287f5] hover:bg-[#3a2a30] flex items-center rounded-sm"
              onClick={() => handleMenuActionClick("consciousness")}
              role="menuitem"
            >
              <Brain size={14} className="mr-3 text-[#4287f5]" />
              <span>CONSCIOUSNESS</span>
            </button>
          )}
          {isJwtAuthenticated && menuItems.find((item) => item.id === "account") && (
            <button
              className="w-full text-left px-4 py-2 text-xs text-[#4ade80] hover:bg-[#3a2a30] flex items-center rounded-sm"
              onClick={() => handleMenuActionClick("account")}
              role="menuitem"
            >
              <User size={14} className="mr-3 text-[#4ade80]" />
              <span>ACCOUNT</span>
            </button>
          )}
          {renderAuthOption()}
        </div>
      </div>,
      document.body,
    )
  }

  useEffect(() => {
    // Global initialization for session and auth managers
    const initializeAppAuth = async () => {
      if (typeof window !== "undefined") {
        await sessionManager.initialize() // Starts anonymous session and warnings if applicable
        await authManager.checkAuthStatus() // Checks JWT auth status
        setIsJwtAuthenticated(authManager.isAuthenticated)
      }
    }
    initializeAppAuth()
  }, [])

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`channel-button flex items-center px-3 py-1.5 ${isOpen ? "active" : ""}`}
        style={{
          position: "relative",
          zIndex: 1,
          backgroundColor: "rgba(40, 30, 35, 0.9)",
          border: "1px solid rgba(80, 70, 75, 0.8)",
          borderRadius: "3px",
        }}
      >
        <Menu size={14} className="mr-1.5" />
        <span className="text-xs tracking-wide">PROJECT</span>
      </button>
      {renderMenu()}
      {/* AuthManager Modal - provides both login and signup options */}
      {showAuthModal && (
        <AuthManager
          isOpen={showAuthModal}
          initialMode="login" // Start with login but allow switching to signup
          onClose={handleAuthModalClose}
          onAuthComplete={handleAuthComplete}
        />
      )}
      <AccountModal isOpen={showAccountModal} onClose={() => setShowAccountModal(false)} />
      {showAboutModal && <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />}
      <ConsciousnessInterface 
        isVisible={showConsciousnessInterface} 
        onClose={() => setShowConsciousnessInterface(false)} 
      />
    </div>
  )
}
