"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { User, LogOut } from "lucide-react"
import AuthManager from "./auth/auth-manager"

export default function UserProfileButton() {
  const { user, isAuthenticated, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleButtonClick = () => {
    if (isAuthenticated) {
      setShowDropdown(!showDropdown)
    } else {
      setShowAuthModal(true)
    }
  }

  return (
    <div className="relative">
      {/* User button */}
      <button
        onClick={handleButtonClick}
        className={`channel-button flex items-center px-3 py-1.5 ${isAuthenticated ? "active" : ""}`}
      >
        <User size={14} className="mr-1.5" />
        <span className="text-xs tracking-wide">{isAuthenticated ? user?.username || "ACCOUNT" : "SIGN IN"}</span>
      </button>

      {/* Dropdown menu */}
      {showDropdown && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-[#2a1a20] border-2 border-[#3a2a30] shadow-lg z-50 animate-menuReveal">
          <div className="p-3 border-b border-[#3a2a30]">
            <div className="text-sm font-medium text-[#f0e6c8]">{user?.displayName || user?.username}</div>
            <div className="text-xs text-[#a09080] truncate">{user?.npub}</div>
          </div>
          <div className="p-1">
            <button
              onClick={() => {
                logout()
                setShowDropdown(false)
              }}
              className="w-full text-left px-3 py-2 text-xs text-[#f0e6c8] hover:bg-[#3a2a30] flex items-center rounded-sm"
            >
              <LogOut size={14} className="mr-2 text-[#a09080]" />
              <span>SIGN OUT</span>
            </button>
          </div>
        </div>
      )}

      {/* Auth modal */}
      <AuthManager isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}
