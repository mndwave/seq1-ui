"use client"

import { useEffect, useState, useCallback } from "react"
import SessionSaveModal from "./session-save-modal"
import { stateManager } from "@/lib/state-manager"
import { useToast } from "@/hooks/use-toast"
import { sessionManager } from "@/lib/session-manager"
// import { AUTH_CONTEXT_OPERATIONS } from '@/lib/project-menu-constants'; // File not available, using string

export default function SessionEventHandler() {
  const [showSaveModal, setShowSaveModal] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const handleSessionTimeoutWarning = (event: CustomEvent) => {
      // Detail structure from SessionManager: { message, urgent, showSaveButton, timeRemaining }
      if (event.detail && event.detail.showSaveButton === true) {
        setShowSaveModal(true)
      }
    }

    window.addEventListener("session-timeout-warning", handleSessionTimeoutWarning as EventListener)
    return () => {
      window.removeEventListener("session-timeout-warning", handleSessionTimeoutWarning as EventListener)
    }
  }, [])

  const handleSaveToDevice = useCallback(() => {
    try {
      const currentState = stateManager.getState()
      // Assuming timeline state is what needs to be saved.
      // You might want to save a more comprehensive snapshot.
      const dataToSave = {
        timeline: currentState.timeline,
        transport: currentState.transport,
        // Add other relevant parts of the state here
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem("seq1_save_snapshot", JSON.stringify(dataToSave))
      toast({
        title: "Project Saved Locally",
        description: "Your current work snapshot has been saved to this device.",
        variant: "default",
      })
      setShowSaveModal(false)
    } catch (error) {
      console.error("Failed to save to device:", error)
      toast({
        title: "Save Failed",
        description: "Could not save your work to this device. Check console for details.",
        variant: "destructive",
      })
    }
  }, [toast])

  const handleUpgradeAccount = useCallback(() => {
    setShowSaveModal(false)
    // Trigger AuthManager to show login/signup modal
    // Using a descriptive string for operation context as AUTH_CONTEXT_OPERATIONS file is not provided for edit
    sessionManager.showAuthRequired(
      "UPGRADE_FROM_SESSION_SAVE_PROMPT",
      "Secure your session to save your work permanently and unlock all features.",
      "signup", // Suggest signup as it's an "upgrade" context
    )
  }, [])

  return (
    <SessionSaveModal
      isOpen={showSaveModal}
      onClose={() => setShowSaveModal(false)}
      onSaveToDevice={handleSaveToDevice}
      onUpgradeAccount={handleUpgradeAccount}
    />
  )
}
