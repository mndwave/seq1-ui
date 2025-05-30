"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { authManager } from "@/lib/auth-manager"
import { Button } from "@/components/ui/button"
import { sessionManager } from "@/lib/session-manager" // To trigger auth modal

export default function AnonymousSessionTimer() {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [isAnonymousSession, setIsAnonymousSession] = useState(false)

  useEffect(() => {
    const updateTimerState = () => {
      setIsAnonymousSession(authManager.isAnonymous)
      if (authManager.isAnonymous) {
        setTimeRemaining(apiClient.getTimeRemaining())
      } else {
        setTimeRemaining(null)
      }
    }

    updateTimerState() // Initial check

    const intervalId = setInterval(() => {
      if (authManager.isAnonymous) {
        const remaining = apiClient.getTimeRemaining()
        setTimeRemaining(remaining)
        if (remaining <= 0) {
          setIsAnonymousSession(false) // Session effectively over
        }
      } else {
        setIsAnonymousSession(false)
        setTimeRemaining(null)
      }
    }, 1000)

    // Listen for auth state changes
    const handleAuthChange = () => updateTimerState()
    window.addEventListener("seq1:auth:loggedIn", handleAuthChange)
    window.addEventListener("seq1:auth:loggedOut", handleAuthChange)
    // Also listen for session start/expiry if those events are dispatched globally
    // For now, relying on authManager state.

    return () => {
      clearInterval(intervalId)
      window.removeEventListener("seq1:auth:loggedIn", handleAuthChange)
      window.removeEventListener("seq1:auth:loggedOut", handleAuthChange)
    }
  }, [])

  if (!isAnonymousSession || timeRemaining === null || timeRemaining <= 0) {
    return null // Don't display if not anonymous, or time is up
  }

  const minutes = Math.floor(timeRemaining / 60000)
  const seconds = Math.floor((timeRemaining % 60000) / 1000)

  const handleSignUpClick = () => {
    // Trigger the authentication modal
    // The 'SAVE_ATTEMPT' or similar operation can be used to provide context
    sessionManager.showAuthRequired("TIMER_SIGNUP", "Sign up to save your work and continue beyond the free session!")
  }

  return (
    <div className="fixed bottom-4 right-4 bg-background border border-border p-3 rounded-lg shadow-lg text-sm z-50">
      <div className="flex flex-col items-center gap-2">
        <p>
          Free Session Time:{" "}
          <span className="font-semibold tabular-nums">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </span>
        </p>
        <Button onClick={handleSignUpClick} size="sm" variant="outline">
          Sign Up to Save
        </Button>
      </div>
    </div>
  )
}
