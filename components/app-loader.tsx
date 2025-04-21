"use client"

import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { useLogoAnimation } from "@/lib/logo-animation-context"

export default function AppLoader() {
  const [isLoading, setIsLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<"filling" | "unfilling">("filling")
  const { hasLogoAnimationPlayed, setLogoAnimationPlayed } = useLogoAnimation()
  const animationRef = useRef<number>(0)
  const startTimeRef = useRef<number | null>(null)
  const logoRef = useRef<HTMLHeadingElement>(null)
  const animationCompleteRef = useRef(false)

  // Animation duration in milliseconds
  const totalAnimationDuration = 2500
  const phaseOneDuration = totalAnimationDuration / 2 // First half: filling
  const phaseTwoDuration = totalAnimationDuration / 2 // Second half: unfilling

  // Animate both the logo fill and progress bar with the same progress value
  const animate = (timestamp: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp

    const elapsed = timestamp - startTimeRef.current

    // Determine which phase we're in
    if (elapsed < phaseOneDuration) {
      // Phase 1: Light bar filling (0% to 100%)
      setPhase("filling")
      const currentProgress = Math.min(elapsed / phaseOneDuration, 1)
      setProgress(currentProgress)

      // Update logo fill based on progress - perfectly linear
      if (logoRef.current) {
        // Linear transition from outline to filled
        logoRef.current.style.color = `rgba(240, 230, 200, ${currentProgress})`
        logoRef.current.style.WebkitTextStroke = `${(1 - currentProgress).toFixed(2)}px #f0e6c8`
        // No glow in this phase
        logoRef.current.style.textShadow = "none"
      }
    } else if (elapsed < totalAnimationDuration) {
      // Phase 2: Dark bar filling (0% to 100%)
      setPhase("unfilling")

      // Calculate second phase progress (0% to 100%)
      const phaseProgress = Math.min((elapsed - phaseOneDuration) / phaseTwoDuration, 1)
      setProgress(phaseProgress)

      // Update logo glow based on progress - perfectly linear
      if (logoRef.current) {
        // Logo is fully filled in this phase
        logoRef.current.style.color = "rgba(240, 230, 200, 1)"
        logoRef.current.style.WebkitTextStroke = "0px #f0e6c8"
        // Linear transition to full glow
        const glowIntensity = phaseProgress * 10 // Increase glow from 0 to 10px
        logoRef.current.style.textShadow = `0 0 ${glowIntensity}px rgba(240, 230, 200, 0.6)`
      }
    } else {
      // Animation complete
      animationCompleteRef.current = true
      setLogoAnimationPlayed()

      // Ensure the final state is perfect
      if (logoRef.current) {
        logoRef.current.style.color = "rgba(240, 230, 200, 1)"
        logoRef.current.style.WebkitTextStroke = "0px #f0e6c8"
        logoRef.current.style.textShadow = "0 0 10px rgba(240, 230, 200, 0.6)"
      }
      setProgress(1) // Ensure progress is exactly 1

      // Only start fade out if page is loaded
      if (document.readyState === "complete") {
        startFadeOut()
      }
      return
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  const startFadeOut = () => {
    // Add a delay after animation completes to show the glowing state
    setTimeout(() => {
      setFadeOut(true)
      setTimeout(() => {
        setIsLoading(false)
      }, 800) // Fade out duration
    }, 800) // Delay to showcase the glowing state
  }

  useEffect(() => {
    // Ensure we start with the outline only
    if (logoRef.current) {
      logoRef.current.style.color = "transparent"
      logoRef.current.style.WebkitTextStroke = "1px #f0e6c8"
      logoRef.current.style.textShadow = "none"
    }

    // Start the animation immediately
    animationRef.current = requestAnimationFrame(animate)

    // Wait for the page to fully load
    if (document.readyState === "complete") {
      handleLoaded()
    } else {
      window.addEventListener("load", handleLoaded)
      // Fallback in case the load event doesn't fire
      const timeout = setTimeout(handleLoaded, 3500)

      return () => {
        window.removeEventListener("load", handleLoaded)
        clearTimeout(timeout)
      }
    }

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [])

  const handleLoaded = () => {
    // If animation is already complete, start fade out
    if (animationCompleteRef.current) {
      startFadeOut()
    }
    // Otherwise, the animation completion will trigger the fade out
  }

  if (!isLoading) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] bg-[#1a1015] flex items-center justify-center transition-opacity duration-500",
        fadeOut ? "opacity-0" : "opacity-100",
      )}
    >
      <div className="flex flex-col items-center">
        {/* Logo with fill based on progress */}
        <h1 ref={logoRef} className="text-4xl font-semibold italic font-poppins mb-6">
          SEQ1
        </h1>

        {/* Loading bar container */}
        <div className="w-48 h-1 overflow-hidden relative">
          {/* Phase 1: Light filling bar */}
          {phase === "filling" && (
            <div
              className="h-full bg-[#f0e6c8]"
              style={{
                width: `${progress * 100}%`,
              }}
            ></div>
          )}

          {/* Phase 2: Dark filling bar (overlays the light bar) */}
          {phase === "unfilling" && (
            <>
              {/* Light bar (now full width) */}
              <div className="absolute inset-0 h-full bg-[#f0e6c8]"></div>

              {/* Dark bar filling over the light bar */}
              <div
                className="absolute inset-0 h-full bg-[#1a1015]"
                style={{
                  width: `${progress * 100}%`,
                  left: 0,
                }}
              ></div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
