"use client"

import React from "react"

import { useRef, useState, useEffect } from "react"
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
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import AuthManager from "./auth/auth-manager"
import AboutModal from "./about-modal"
import AccountModal from "./account-modal"

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  action: () => void
  disabled: boolean
  comingSoon: boolean
  dividerAfter?: boolean
  dividerBefore?: boolean
}

interface DirectProjectMenuProps {
  onAction: (action: string) => void
}

export default function DirectProjectMenu({ onAction }: DirectProjectMenuProps) {
  const { isAuthenticated, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })
  const [showAboutModal, setShowAboutModal] = useState(false)

  // Update the menuItems array to include IMPORT ALS and adjust separators
  const menuItems = [
    {
      id: "new",
      label: "NEW PROJECT",
      icon: <FilePlus size={14} />,
      action: () => {
        console.log("New action triggered")
        handleMenuAction("new")
      },
      disabled: false,
      comingSoon: false,
    },
    {
      id: "open",
      label: "OPEN PROJECT",
      icon: <FolderOpen size={14} />,
      action: () => {
        console.log("Open action triggered")
        handleMenuAction("open")
      },
      disabled: false,
      comingSoon: false,
      dividerAfter: true,
    },
    {
      id: "save",
      label: "SAVE",
      icon: <Save size={14} />,
      action: () => {
        console.log("Save action triggered")
        handleMenuAction("save")
      },
      disabled: false,
      comingSoon: false,
    },
    {
      id: "saveAs",
      label: "SAVE AS...",
      icon: <FileText size={14} />,
      action: () => {
        console.log("Save As action triggered")
        handleMenuAction("saveAs")
      },
      disabled: false,
      comingSoon: false,
      dividerAfter: true,
    },
    {
      id: "export",
      label: "EXPORT ALS",
      icon: <Upload size={14} />,
      action: () => {
        console.log("Export action triggered - disabled")
        handleMenuAction("export")
      },
      disabled: true,
      comingSoon: true,
    },
    {
      id: "import",
      label: "IMPORT ALS",
      icon: <Download size={14} />,
      action: () => {
        console.log("Import action triggered - disabled")
        handleMenuAction("import")
      },
      disabled: true,
      comingSoon: true,
    },
    {
      id: "about",
      label: "ABOUT SEQ1",
      icon: <Info size={14} />,
      action: () => handleMenuAction("about"),
      disabled: false,
      comingSoon: false,
      dividerBefore: true,
    },
    {
      id: "account",
      label: "ACCOUNT",
      icon: <User size={14} />,
      action: () => {
        console.log("Account action triggered")
        setShowAccountModal(true)
      },
      disabled: false,
      comingSoon: false,
      dividerBefore: true,
    },
  ]

  // Set mounted state after component mounts (for SSR compatibility)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate position when menu opens
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setMenuPosition({
        top: rect.bottom + window.scrollY,
        right: window.innerWidth - rect.right + window.scrollX,
      })
    }
  }, [isOpen])

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

  const handleMenuAction = (id: string) => {
    const menuItem = menuItems.find((item) => item.id === id)

    if (menuItem) {
      if (menuItem.id === "about") {
        setShowAboutModal(true)
        setIsOpen(false)
        return
      }

      if (menuItem.id === "account") {
        setShowAccountModal(true)
        setIsOpen(false)
        return
      }

      if (menuItem.disabled) {
        console.log(`Action ${id} is disabled.`)
        return
      }

      // Check if user is authenticated for actions that require it
      if (!isAuthenticated && (id === "new" || id === "open" || id === "save" || id === "saveAs")) {
        // If action requires auth and user is not authenticated, show auth modal
        setPendingAction(id)
        setShowAuthModal(true)
        setIsOpen(false)
        return
      }

      // Otherwise, proceed with the action
      onAction(id)
      setIsOpen(false)
    }
  }

  const handleAuthComplete = () => {
    // After authentication completes, execute the pending action
    if (pendingAction) {
      onAction(pendingAction)
      setPendingAction(null)
    }
    setShowAuthModal(false)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  // Add this function before the renderMenu function
  const handleLogout = () => {
    logout()
    closeMenu()
  }

  // Add a login/signup or signout option at the bottom of the menu
  const renderAuthOption = () => {
    if (isAuthenticated) {
      return (
        <button
          className="w-full text-left px-4 py-2 text-xs text-[#f0e6c8] hover:bg-[#3a2a30] flex items-center rounded-sm"
          onClick={() => {
            closeMenu()
            logout()
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
            closeMenu()
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

  // Render the menu using a portal
  const renderMenu = () => {
    if (!isOpen || !mounted) return null

    return createPortal(
      <div
        ref={menuRef}
        className="fixed bg-[#2a1a20] border-2 border-[#3a2a30] w-64 py-1 animate-menuReveal shadow-xl"
        style={{
          top: `${menuPosition.top}px`,
          right: `${menuPosition.right}px`,
          zIndex: 2147483647, // Maximum possible z-index value
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div className="p-2">
          {menuItems.map((item, index) => {
            // Skip rendering the account option here, we'll render it separately
            if (item.id === "account") return null

            return (
              <React.Fragment key={item.id}>
                {item.dividerBefore && <div className="border-t border-[#3a2a30] my-2"></div>}
                <button
                  className={`w-full text-left px-4 py-2 text-xs text-[#f0e6c8] hover:bg-[#3a2a30] flex items-center rounded-sm relative ${
                    item.disabled ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                  onClick={() => handleMenuAction(item.id)}
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
            )
          })}

          {/* Single divider before account options */}
          <div className="border-t border-[#3a2a30] my-2"></div>

          {/* Account option with green color */}
          <button
            className="w-full text-left px-4 py-2 text-xs text-[#4ade80] hover:bg-[#3a2a30] flex items-center rounded-sm"
            onClick={() => {
              closeMenu()
              setShowAccountModal(true)
            }}
            role="menuitem"
          >
            <User size={14} className="mr-3 text-[#4ade80]" />
            <span>ACCOUNT</span>
          </button>

          {/* Auth option (login/signup or sign out) */}
          {renderAuthOption()}
        </div>
      </div>,
      document.body,
    )
  }

  return (
    <div className="relative">
      {/* Menu Button */}
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

      {/* Menu Dropdown rendered via Portal */}
      {renderMenu()}

      {/* Auth Modal */}
      <AuthManager isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onAuthComplete={handleAuthComplete} />

      {/* Account Modal */}
      <AccountModal isOpen={showAccountModal} onClose={() => setShowAccountModal(false)} />

      {/* About Modal */}
      {showAboutModal && <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />}
    </div>
  )
}
