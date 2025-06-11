"use client"

import { useState, useEffect } from "react"
import LoginModal from "./login-modal" // Corrected: Using the detailed LoginModal
import SignupModal from "./signup-modal" // Corrected: Using the detailed SignupModal

interface AuthManagerModalProps {
  isOpen: boolean
  onClose: () => void
  // Removed initialMessage and operationToUnlock as they are better handled by sessionManager events
  // and the modals themselves can display context-specific info if needed.
  initialMode?: "login" | "signup" // Added to allow specifying initial mode
  onAuthComplete?: () => void // Callback for when auth process (login/signup) is successful
}

export default function AuthManager({ isOpen, onClose, initialMode = "login", onAuthComplete }: AuthManagerModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode)
  const [internalIsOpen, setInternalIsOpen] = useState(isOpen)

  // Effect to control modal visibility based on prop and internal state
  useEffect(() => {
    setInternalIsOpen(isOpen)
  }, [isOpen])

  // Effect to listen for global 'auth-required' events
  useEffect(() => {
    const handleAuthRequired = (event: CustomEvent) => {
      // event.detail might contain { operation: string, message: string }
      // For now, just ensure the modal opens, specific messages are in modals.
      setMode(event.detail?.initialMode || "login") // Default to login if not specified
      setInternalIsOpen(true)
    }

    window.addEventListener("auth-required", handleAuthRequired as EventListener)
    return () => {
      window.removeEventListener("auth-required", handleAuthRequired as EventListener)
    }
  }, [])

  const handleClose = () => {
    setInternalIsOpen(false)
    onClose() // Notify parent
  }

  const handleAuthSuccess = () => {
    if (onAuthComplete) {
      onAuthComplete()
    }
    handleClose() // Close modal on successful authentication
  }

  if (!internalIsOpen) return null

  return (
    <>
      <LoginModal
        isOpen={mode === "login"}
        onClose={handleAuthSuccess} // Close on success
        onSignupClick={() => setMode("signup")}
      />
      <SignupModal
        isOpen={mode === "signup"}
        onClose={handleAuthSuccess} // Close on success
        onLoginClick={() => setMode("login")}
      />
    </>
  )
}
