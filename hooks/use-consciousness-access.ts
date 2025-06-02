"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"

// Admin NOSTR public keys with consciousness access
const CONSCIOUSNESS_OPERATORS = process.env.NEXT_PUBLIC_CONSCIOUSNESS_ADMIN_NPUBS
  ? process.env.NEXT_PUBLIC_CONSCIOUSNESS_ADMIN_NPUBS.split(",").map(npub => npub.trim()).filter(Boolean)
  : [
      "npub19tcq5k5fe26ujyllgcd7s6kayyp9hfh7vm0an58g9w2g3jud9u7sz84zw5", // kyle/mndwave fallback
    ]

if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_CONSCIOUSNESS_ADMIN_NPUBS) {
  console.warn('🧠 Using fallback consciousness operators - set NEXT_PUBLIC_CONSCIOUSNESS_ADMIN_NPUBS in .env')
}

interface ConsciousnessAccess {
  hasAccess: boolean
  isLoading: boolean
  error: string | null
  userNpub: string | null
}

export function useConsciousnessAccess(): ConsciousnessAccess {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [hasAccess, setHasAccess] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAccess = async () => {
      setIsLoading(true)
      setError(null)

      try {
        if (!isAuthenticated || authLoading) {
          setHasAccess(false)
          setIsLoading(authLoading)
          return
        }

        if (!user?.npub) {
          setHasAccess(false)
          setIsLoading(false)
          return
        }

        // Check if user's npub is in the consciousness operators list
        const hasConsciousnessAccess = CONSCIOUSNESS_OPERATORS.includes(user.npub)
        
        if (hasConsciousnessAccess) {
          console.log('🧠 Consciousness access granted for:', user.npub)
        }
        
        setHasAccess(hasConsciousnessAccess)
        setIsLoading(false)

      } catch (err) {
        console.error('Error checking consciousness access:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setHasAccess(false)
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [user, isAuthenticated, authLoading])

  return {
    hasAccess,
    isLoading,
    error,
    userNpub: user?.npub || null
  }
} 