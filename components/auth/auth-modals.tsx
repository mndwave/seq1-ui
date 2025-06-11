"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import AuthManager from "./auth-manager"

interface AuthModalsProps {
  projectActionRequested?: string | null
  onAuthComplete?: (action?: string) => void
}

export default function AuthModals({ projectActionRequested, onAuthComplete }: AuthModalsProps) {
  const { isAuthenticated } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [requestedAction, setRequestedAction] = useState<string | null>(null)

  // Show auth modal when a project action is requested and user is not authenticated
  useEffect(() => {
    if (projectActionRequested && !isAuthenticated) {
      setShowAuth(true)
      setRequestedAction(projectActionRequested)
    }
  }, [projectActionRequested, isAuthenticated])

  // When authentication completes, call the onAuthComplete callback
  useEffect(() => {
    if (isAuthenticated && showAuth) {
      setShowAuth(false)
      if (onAuthComplete) {
        onAuthComplete(requestedAction || undefined)
      }
    }
  }, [isAuthenticated, showAuth, onAuthComplete, requestedAction])

  return <AuthManager isOpen={showAuth} onClose={() => setShowAuth(false)} />
}
