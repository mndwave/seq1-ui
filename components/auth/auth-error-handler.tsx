"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import LoginModal from "./login-modal"

export default function AuthErrorHandler() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    const handleAuthExpired = () => {
      if (!isAuthenticated) {
        setShowLoginModal(true)
      }
    }

    window.addEventListener("seq1:auth:expired", handleAuthExpired)

    return () => {
      window.removeEventListener("seq1:auth:expired", handleAuthExpired)
    }
  }, [isAuthenticated])

  return (
    <>
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          message="Your session has expired. Please log in again."
        />
      )}
    </>
  )
}
