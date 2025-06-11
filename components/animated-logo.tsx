"use client"

import type React from "react" // Ensured React is in scope for CSSProperties
import { useState, useEffect } from "react"
import type { LogoAnimationState } from "@/lib/types"
import { cn } from "@/lib/utils" // Re-enabled cn utility

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
 * AnimatedLogo component - Re-typed based on Prompt 16
 */
export default function AnimatedLogo({
  onAnimationComplete,
  className: incomingClassNameProp, // Use a distinct name for the prop
  skipAnimation = false,
}: AnimatedLogoProps) {
  const [animationState, setAnimationState] = useState<LogoAnimationState>(skipAnimation ? "hot" : "outline")
  const [hasInitialized, setHasInitialized] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    if (skipAnimation) {
      setAnimationState("hot")
      setHasInitialized(true)
      if (onAnimationComplete) {
        onAnimationComplete()
      }
      return
    }

    if (!hasInitialized) {
      // Initial outline state
      setAnimationState("outline")
      const warmingTimer = setTimeout(() => {
        setAnimationState("warming")
        const hotTimer = setTimeout(() => {
          setAnimationState("hot")
          setHasInitialized(true) // Mark as initialized after full sequence
          if (onAnimationComplete) {
            onAnimationComplete()
          }
        }, 2000) // Duration of warming animation
        return () => clearTimeout(hotTimer)
      }, 1000) // Delay before starting warming
      return () => clearTimeout(warmingTimer)
    }
  }, [onAnimationComplete, skipAnimation, hasInitialized])

  const getGlowStyle = (): React.CSSProperties => {
    if (animationState === "outline") {
      return {} // No glow in outline state
    }
    // Glow styles for 'warming' and 'hot' states
    const baseGlow =
      animationState === "warming"
        ? "0 0 8px rgba(240, 230, 200, 0.4)" // Warming glow
        : "0 0 10px rgba(240, 230, 200, 0.6)" // Hot glow
    const hoverGlow = "0 0 15px rgba(240, 230, 200, 0.8), 0 0 25px rgba(240, 230, 200, 0.4)" // Enhanced glow on hover

    return {
      textShadow: isHovered ? hoverGlow : baseGlow,
      transition: "text-shadow 0.3s ease-in-out, color 0.7s ease-in-out, opacity 0.7s ease-in-out", // Added color/opacity transition
    }
  }

  // Base classes for the logo text
  const baseClasses = "text-2xl font-semibold italic font-poppins transition-all duration-700"

  // Determine animation-specific class from globals.css
  let animationClass = ""
  if (animationState === "warming" && hasInitialized === false) {
    // Apply warming only during initial animation
    animationClass = "animate-logo-warming"
  } else if (animationState === "hot" && hasInitialized === true) {
    // Apply hot (pulsing) after initialization
    animationClass = "animate-logo-hot"
  }
  // Note: If 'animate-logo-hot' is meant for continuous pulsing, 'hasInitialized' check might need adjustment
  // or a separate class for initial fill vs continuous pulse. For now, this matches typical animation flow.

  // Ensure incomingClassNameProp is a string before passing to cn
  const safeIncomingClassName = typeof incomingClassNameProp === "string" ? incomingClassNameProp : ""

  // Construct the final className string using cn
  const finalClassName = cn(baseClasses, safeIncomingClassName, animationClass)

  const dynamicStyles: React.CSSProperties = {
    color: animationState === "outline" ? "transparent" : "rgba(240, 230, 200, 0.8)", // Default color for non-outline
    opacity: animationState === "outline" ? 0.7 : 1, // Slightly transparent for outline
    ...getGlowStyle(),
  }

  if (animationState === "outline") {
    dynamicStyles.WebkitTextStroke = "1px #f0e6c8" // Outline effect
    dynamicStyles.color = "transparent" // Ensure text fill is transparent for outline
  } else if (animationState === "warming") {
    // Specific color for warming, if different from hot and not handled by CSS animation
    // dynamicStyles.color = "rgba(240, 230, 200, 0.5)"; // Example
  } else if (animationState === "hot") {
    // Specific color for hot, if different and not handled by CSS animation
    dynamicStyles.color = "rgba(240, 230, 200, 0.9)" // Brighter for hot state
  }

  return (
    <h1
      className={finalClassName}
      style={dynamicStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      SEQ1
    </h1>
  )
}
