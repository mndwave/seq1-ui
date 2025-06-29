"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import LoginModal from "./login-modal"
import SignupModal from "./signup-modal"

interface AuthManagerProps {
  isOpen: boolean
  initialMode?: "login" | "signup"
  onClose: () => void
  onAuthComplete?: () => void | Promise<void>
}

export default function AuthManager({ isOpen, initialMode = "login", onClose, onAuthComplete }: AuthManagerProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode)
  const { isAuthenticated } = useAuth()

  // YAML LAW ENFORCEMENT: Modal should NEVER show if already authenticated
  // Per canonical authentication.yaml: "fix_required: THIS IS THE BUG - modal should not show if already authenticated"
  if (!isOpen || isAuthenticated) {
    if (isAuthenticated && isOpen) {
      // User is authenticated but modal was requested - close immediately per YAML law
      onClose()
    }
    return null
  }

  return (
    <>
      <LoginModal isOpen={isOpen && mode === "login"} onClose={onClose} onSignupClick={() => setMode("signup")} onAuthComplete={onAuthComplete} />
      <SignupModal isOpen={isOpen && mode === "signup"} onClose={onClose} onLoginClick={() => setMode("login")} onAuthComplete={onAuthComplete} />
    </>
  )
}
