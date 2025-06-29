"use client"

import { useState } from "react"
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

  if (!isOpen) return null

  return (
    <>
      <LoginModal isOpen={isOpen && mode === "login"} onClose={onClose} onSignupClick={() => setMode("signup")} onAuthComplete={onAuthComplete} />
      <SignupModal isOpen={isOpen && mode === "signup"} onClose={onClose} onLoginClick={() => setMode("login")} onAuthComplete={onAuthComplete} />
    </>
  )
}
