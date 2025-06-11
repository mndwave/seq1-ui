"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Create a context to track if the logo animation has played
type LogoAnimationContextType = {
  hasLogoAnimationPlayed: boolean
  setLogoAnimationPlayed: () => void
}

const LogoAnimationContext = createContext<LogoAnimationContextType>({
  hasLogoAnimationPlayed: false,
  setLogoAnimationPlayed: () => {},
})

// Create a provider component
export function LogoAnimationProvider({ children }: { children: ReactNode }) {
  // Use localStorage to persist the animation state across page loads
  const [hasLogoAnimationPlayed, setHasLogoAnimationPlayed] = useState(false)

  // Check localStorage on mount
  useEffect(() => {
    // Only run on client
    if (typeof window !== "undefined") {
      const hasPlayed = localStorage.getItem("seq1LogoAnimationPlayed") === "true"
      setHasLogoAnimationPlayed(hasPlayed)
    }
  }, [])

  // Function to set animation as played
  const setLogoAnimationPlayed = () => {
    setHasLogoAnimationPlayed(true)
    // Store in localStorage to persist across page loads
    if (typeof window !== "undefined") {
      localStorage.setItem("seq1LogoAnimationPlayed", "true")
    }
  }

  return (
    <LogoAnimationContext.Provider value={{ hasLogoAnimationPlayed, setLogoAnimationPlayed }}>
      {children}
    </LogoAnimationContext.Provider>
  )
}

// Hook to use the logo animation context
export function useLogoAnimation() {
  return useContext(LogoAnimationContext)
}
