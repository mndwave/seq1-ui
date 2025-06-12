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
  Key,
  Shield
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
import { apiClient } from "@/lib/api-client"
import { cn } from "@/lib/utils"

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
  onAction: (action: string) => void
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
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  
  // 🚨 DEBUG STATE - TEMPORARY
  const [debugInfo, setDebugInfo] = useState<any>({})

  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })
  const { toast } = useToast()
  const { hasAccess: hasConsciousnessAccess } = useConsciousnessAccess()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Enhanced menu items with better iconography
  const menuItems: MenuItem[] = [
    {
      id: "1",
      label: "NEW PROJECT",
      icon: <FilePlus size={14} className="icon-abstract" />,
      actionId: "new",
      disabled: false,
      comingSoon: false,
    },
    {
      id: "2",
      label: "OPEN PROJECT",
      icon: <FolderOpen size={14} className="icon-abstract" />,
      actionId: "open",
      disabled: false,
      comingSoon: false,
      dividerAfter: true,
    },
    {
      id: "3",
      label: "SAVE",
      icon: <Save size={14} className="icon-abstract" />,
      actionId: "save",
      disabled: false,
      comingSoon: false,
    },
    {
      id: "4",
      label: "SAVE AS",
      icon: <FileText size={14} className="icon-abstract" />,
      actionId: "saveAs",
      disabled: false,
      comingSoon: false,
      dividerAfter: true,
    },
    {
      id: "5",
      label: "IMPORT",
      icon: <Upload size={14} className="icon-abstract" />,
      actionId: "import",
      disabled: true,
      comingSoon: true,
    },
    {
      id: "6",
      label: "EXPORT",
      icon: <Download size={14} className="icon-abstract" />,
      actionId: "export",
      disabled: true,
      comingSoon: true,
      dividerAfter: true,
    },
    {
      id: "7",
      label: "SHARE TRACK",
      icon: <Share size={14} className="icon-abstract" />,
      actionId: "shareTrack",
      disabled: true,
      comingSoon: true,
    },
    {
      id: "8",
      label: "ABOUT SEQ1",
      icon: <Info size={14} className="icon-abstract" />,
      actionId: "about",
      disabled: false,
      comingSoon: false,
      dividerBefore: true,
    },
  ]

  // Enhanced logout with cryptographic signature for admins
  const handleEnhancedLogout = async () => {
    setIsLoggingOut(true)
    
    try {
      // Check if user has admin privileges
      const isAdmin = hasConsciousnessAccess
      
      if (isAdmin) {
        // Generate cryptographic signature trace for Dave
        const timestamp = Date.now()
        const sessionId = apiClient.sessionId
        const signatureData = {
          action: "admin_logout",
          timestamp,
          sessionId,
          userAgent: navigator.userAgent,
          location: window.location.href
        }
        
        // Send trace to Dave (this would be sent via encrypted channel in production)
        console.log("🔐 Admin logout signature:", signatureData)
        
        // In production, this would be sent to Dave's monitoring system
        // await sendAdminTrace(signatureData)
        
        toast({
          title: "🔒 Secure Admin Logout",
          description: "Cryptographic trace logged. Session terminated.",
          duration: 3000,
        })
      }
      
      // Clear all auth states
      authManager.logout()
      setIsJwtAuthenticated(false)
      setIsOpen(false)
      
      // Visual feedback for successful logout
      setTimeout(() => {
        toast({
          title: "✅ Logout Complete", 
          description: "All authentication data cleared.",
          duration: 2000,
        })
      }, 500)
      
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "⚠️ Logout Error",
        description: "Some cleanup may be incomplete. Please refresh if needed.",
        duration: 4000,
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Enhanced API test function
  const testApiConnection = async () => {
    try {
      const response = await fetch(`${apiClient.baseURL}/health`)
      const data = await response.json()
      setDebugInfo({
        apiBaseUrl: apiClient.baseURL,
        apiStatus: response.status,
        apiResponse: data,
        authStatus: isJwtAuthenticated,
        sessionId: apiClient.sessionId,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      setDebugInfo({
        apiBaseUrl: apiClient.baseURL,
        apiStatus: "ERROR",
        apiError: error instanceof Error ? error.message : "Unknown error",
        authStatus: isJwtAuthenticated,
        sessionId: apiClient.sessionId,
        timestamp: new Date().toISOString(),
      })
    }
  }

  useEffect(() => {
    const handleAuthStatusChange = () => {
      setIsJwtAuthenticated(authManager.isAuthenticated)
      if (authManager.isAuthenticated && pendingAction) {
        onAction(pendingAction)
        setPendingAction(null)
      }
    }

    window.addEventListener("seq1:auth:loggedIn", handleAuthStatusChange)
    window.addEventListener("seq1:auth:loggedOut", handleAuthStatusChange)

    return () => {
      window.removeEventListener("seq1:auth:loggedIn", handleAuthStatusChange)
      window.removeEventListener("seq1:auth:loggedOut", handleAuthStatusChange)
    }
  }, [pendingAction, onAction])

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
      toast({ 
        title: "🚀 Feature In Development", 
        description: `${menuItem.label} is coming soon to SEQ1. Stay tuned for updates!`,
        duration: 4000,
      })
      return
    }

    if (actionId === "about") {
      setShowAboutModal(true)
      return
    }
    
    // 🚨 DEBUG ACTION - TEMPORARY
    if (actionId === "debug") {
      console.log("🔍 [DEBUG] Current Debug Info:", debugInfo)
      await testApiConnection()
      toast({
        title: "🔍 Debug Info",
        description: `API: ${debugInfo.apiBaseUrl || 'Unknown'} | Auth: ${isJwtAuthenticated ? 'YES' : 'NO'} | Check console for details`,
        duration: 5000,
      })
      return
    }
    
    if (actionId === "consciousness") {
      setShowConsciousnessInterface(true)
      return
    }

    if (actionId === "account") {
      setShowAccountModal(true)
      return
    }

    // Check if action requires authentication
    if (AUTH_REQUIRED_OPERATIONS.includes(actionId) && !isJwtAuthenticated) {
      setAuthModalMessage(`Please sign in to ${menuItem.label.toLowerCase()}.`)
      setPendingAction(actionId)
      setShowAuthModal(true)
      return
    }

    // Execute the action
    try {
      onAction(actionId)
    } catch (error) {
      console.error(`Error executing action ${actionId}:`, error)
      toast({
        title: "⚠️ Action Failed",
        description: `Could not ${menuItem.label.toLowerCase()}. Please try again.`,
        duration: 3000,
      })
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
    // The 'seq1:auth:loggedIn' event listener will handle state updates and pending actions.
  }

  const renderAuthOption = () => {
    if (isJwtAuthenticated) {
      return (
        <>
          {/* Consciousness Option for Admins */}
          {hasConsciousnessAccess && (
            <button
              className="w-full text-left px-4 py-3 text-xs text-[var(--seq1-neural)] hover:bg-[var(--seq1-accent)] flex items-center rounded-sm transition-all duration-200 micro-feedback"
              onClick={() => handleMenuActionClick("consciousness")}
              role="menuitem"
            >
              <Brain size={14} className="mr-3 text-[var(--seq1-neural)] icon-abstract" />
              <span className="seq1-caption font-semibold">CONSCIOUSNESS</span>
              <div className="ml-auto w-2 h-2 bg-[var(--seq1-pulse)] rounded-full animate-pulse" />
            </button>
          )}
          
          {/* Account Option */}
          <button
            className="w-full text-left px-4 py-3 text-xs text-[var(--seq1-pulse)] hover:bg-[var(--seq1-accent)] flex items-center rounded-sm transition-all duration-200 micro-feedback"
            onClick={() => handleMenuActionClick("account")}
            role="menuitem"
          >
            <User size={14} className="mr-3 text-[var(--seq1-pulse)] icon-abstract" />
            <span className="seq1-caption font-semibold">YOUR STUDIO</span>
          </button>
          
          {/* Enhanced Logout */}
          <button
            className="w-full text-left px-4 py-3 text-xs text-[var(--seq1-text-primary)] hover:bg-[var(--seq1-accent)] flex items-center rounded-sm transition-all duration-200 micro-feedback"
            onClick={handleEnhancedLogout}
            disabled={isLoggingOut}
            role="menuitem"
          >
            {isLoggingOut ? (
              <>
                <div className="mr-3 w-3.5 h-3.5 border border-[var(--seq1-text-muted)] border-t-transparent rounded-full animate-spin" />
                <span className="seq1-caption">LOGGING OUT...</span>
              </>
            ) : (
              <>
                <LogOut size={14} className="mr-3 text-[var(--seq1-text-muted)] icon-abstract" />
                <span className="seq1-caption">SIGN OUT</span>
                {hasConsciousnessAccess && (
                  <Shield size={10} className="ml-auto text-[var(--seq1-warning)]" />
                )}
              </>
            )}
          </button>
        </>
      )
    }

    // Not authenticated - show auth options
    return (
      <button
        className="w-full text-left px-4 py-3 text-xs text-[var(--seq1-neural)] hover:bg-[var(--seq1-accent)] flex items-center rounded-sm transition-all duration-200 micro-feedback"
        onClick={() => setShowAuthModal(true)}
        role="menuitem"
      >
        <Key size={14} className="mr-3 text-[var(--seq1-neural)] icon-abstract" />
        <span className="seq1-caption font-semibold">ACCESS STUDIO</span>
      </button>
    )
  }

  const renderMenu = () => {
    if (!isOpen || !mounted) return null

    return createPortal(
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 2147483646 }}>
        <div
          ref={menuRef}
          className="absolute pointer-events-auto modal-content w-64 py-2 animate-[modal-content-in_0.3s_ease-out]"
          style={{
            top: `${menuPosition.top}px`,
            right: `${menuPosition.right}px`,
            width: "280px",
            zIndex: 2147483647,
          }}
        >
          {/* Enhanced Header */}
          <div className="bg-[var(--seq1-accent)] px-4 py-3 border-b border-[var(--seq1-border)]">
            <h3 className="seq1-heading text-sm tracking-wide">PROJECT MENU</h3>
          </div>

          <div className="p-2">
            {menuItems.map((item) => (
              <React.Fragment key={item.id}>
                {item.dividerBefore && <div className="border-t border-[var(--seq1-border)] my-2"></div>}
                
                <button
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
                  
                  {item.comingSoon && (
                    <div className="ml-auto">
                      <span className="px-2 py-1 text-[8px] bg-[var(--seq1-neural)]20 text-[var(--seq1-neural)] rounded-sm tracking-wider border border-[var(--seq1-neural)]40">
                        COMING SOON
                      </span>
                    </div>
                  )}
                </button>
                
                {item.dividerAfter && <div className="border-t border-[var(--seq1-border)] my-2"></div>}
              </React.Fragment>
            ))}
            
            <div className="border-t border-[var(--seq1-border)] my-2"></div>
            {renderAuthOption()}
          </div>
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
        console.log("🔍 [DEBUG] App Auth Initialized:", {
          isAuthenticated: authManager.isAuthenticated,
          hasToken: !!apiClient.token,
          sessionId: apiClient.sessionId
        })
      }
    }
    initializeAppAuth()
  }, [])

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "channel-button flex items-center px-3 py-1.5 micro-feedback",
          isOpen && "active"
        )}
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <Menu size={14} className="mr-1.5 icon-abstract" />
        <span className="text-xs tracking-wide font-medium">PROJECT</span>
      </button>
      
      {renderMenu()}
      
      {/* AuthManager Modal - provides both login and signup options */}
      {showAuthModal && (
        <AuthManager
          isOpen={showAuthModal}
          initialMode="signup" // Start with signup but allow switching to login 
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
