"use client"

import { useState, useEffect } from "react"
import type { LogoAnimationState } from "@/lib/types"

/**
 * Props for the AnimatedLogo component
 */
interface AnimatedLogoProps {
  /** Callback fired when animation sequence completes */
  onAnimationComplete?: () => void
  /** Additional CSS classes */
  className?: string
  /** Whether to skip the animation sequence and go straight to final state */
  skipAnimation?: boolean
}

/**
 * AnimatedLogo component
 *
 * Displays the SEQ1 logo with a smooth valve-like warm-up animation:
 * 1. Outline - Initial state with just the outline visible (light off)
 * 2. Warming - Slow valve warm-up effect where the glow gradually intensifies
 * 3. Hot - Final state with subtle pulsing glow
 */
export default function AnimatedLogo({
  onAnimationComplete,
  className = "",
  skipAnimation = false,
}: AnimatedLogoProps) {
  const [animationState, setAnimationState] = useState<LogoAnimationState>(skipAnimation ? "hot" : "outline")
  const [hasInitialized, setHasInitialized] = useState(false)

  useEffect(() => {
    if (skipAnimation) {
      // If skipping the initial animation, go straight to hot state
      setAnimationState("hot")
      setHasInitialized(true)

      // Still need to call the completion callback
      if (onAnimationComplete) {
        onAnimationComplete()
      }
      return
    }

    // Only start animation if not already initialized
    if (!hasInitialized) {
      // Start with outline
      setAnimationState("outline")

      // After a short delay, start warming up
      const warmingTimer = setTimeout(() => {
        setAnimationState("warming")

        // After warming phase, transition to hot state
        const hotTimer = setTimeout(() => {
          setAnimationState("hot")
          setHasInitialized(true)
          if (onAnimationComplete) {
            onAnimationComplete()
          }
        }, 2000) // 2 second warming phase

        return () => clearTimeout(hotTimer)
      }, 1000) // 1 second delay before starting warm-up

      return () => clearTimeout(warmingTimer)
    }
  }, [onAnimationComplete, skipAnimation, hasInitialized])

  return (
    <h1
      className={`text-2xl font-semibold italic font-poppins transition-all duration-700 ${className} ${
        animationState === "warming" ? "animate-logo-warming" : ""
      } ${animationState === "hot" ? "animate-logo-hot" : ""}`}
      style={{
        color: animationState === "outline" ? "transparent" : undefined,
        WebkitTextStroke: animationState === "outline" ? "1px #f0e6c8" : undefined,
        opacity: animationState === "outline" ? 0.7 : 1,
        textShadow: animationState === "hot" ? "0 0 10px rgba(240, 230, 200, 0.6)" : undefined,
      }}
    >
      SEQ1
    </h1>
  )
}
