"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Radio } from "lucide-react"
import AnimatedLogo from "./animated-logo"
import { useLogoAnimation } from "@/lib/logo-animation-context"

interface BroadcastDisplayProps {
  title: string
  content: string
  effectIntensity?: number // 0-100
  flickerIntensity?: number // 0-100
  glitchIntensity?: number // 0-100
  logoAnimationFrequency?: number // seconds between animations, 0 to disable
  className?: string
}

export default function BroadcastDisplay({
  title,
  content,
  effectIntensity = 50,
  flickerIntensity = 30,
  glitchIntensity = 20,
  logoAnimationFrequency = 30, // Default to animate every 30 seconds
  className,
}: BroadcastDisplayProps) {
  const [glitchActive, setGlitchActive] = useState(false)
  const [glitchText, setGlitchText] = useState("")
  const [scanlinePos, setScanlinePos] = useState(0)
  const [blockHeight, setBlockHeight] = useState<number | null>(null)
  const [barHeights, setBarHeights] = useState<number[]>([])
  // Remove these state variables and refs
  // const [triggerLogoAnimation, setTriggerLogoAnimation] = useState(0)
  // const animationTimerRef = useRef<NodeJS.Timeout | null>(null)

  const { hasLogoAnimationPlayed, setLogoAnimationPlayed } = useLogoAnimation()

  // Normalize intensities to 0-1 range
  const normalizedEffect = effectIntensity / 100
  const normalizedFlicker = flickerIntensity / 100
  const normalizedGlitch = glitchIntensity / 100

  // Initialize and animate bar heights for the waveform
  useEffect(() => {
    // Initialize bar heights
    setBarHeights(
      Array(16)
        .fill(0)
        .map(() => Math.random() * 0.6 + 0.2),
    )

    // Animate bar heights
    const interval = setInterval(() => {
      setBarHeights((prev) => prev.map(() => Math.random() * 0.6 + 0.2))
    }, 250) // Slower update for a more relaxed feel

    return () => clearInterval(interval)
  }, [])

  // Remove this useEffect that was setting up periodic logo animation
  /*
  useEffect(() => {
    if (logoAnimationFrequency <= 0) return

    // Trigger first animation after a short delay
    const initialDelay = setTimeout(() => {
      // Instead of incrementing triggerLogoAnimation, add and remove a class
      if (document.querySelector(".broadcast-logo")) {
        const logo = document.querySelector(".broadcast-logo")
        if (logo) {
          logo.classList.add("logo-pulse-highlight")
          setTimeout(() => {
            logo.classList.remove("logo-pulse-highlight")
          }, 2000)
        }
      }
    }
  }, 5000) // Initial animation after 5 seconds

    // Set up recurring animation
    animationTimerRef.current = setInterval(() => {
      // Instead of incrementing triggerLogoAnimation, add and remove a class
      if (document.querySelector(".broadcast-logo")) {
        const logo = document.querySelector(".broadcast-logo")
        if (logo) {
          logo.classList.add("logo-pulse-highlight")
          setTimeout(() => {
            logo.classList.remove("logo-pulse-highlight")
          }, 2000)
        }
      }
    }, logoAnimationFrequency * 1000)

    return () => {
      clearTimeout(initialDelay)
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current)
      }
    }
  }, [logoAnimationFrequency])
  */

  // Fetch Bitcoin block height
  useEffect(() => {
    const fetchBlockHeight = async () => {
      try {
        const response = await fetch("https://blockchain.info/q/getblockcount")
        const height = await response.text()
        setBlockHeight(Number.parseInt(height))
      } catch (error) {
        console.error("Error fetching block height:", error)
        // Set a fallback value if the API call fails
        setBlockHeight(803102)
      }
    }

    // Fetch immediately
    fetchBlockHeight()

    // Then fetch every 60 seconds
    const interval = setInterval(fetchBlockHeight, 60000)

    return () => clearInterval(interval)
  }, [])

  // Scanline animation
  useEffect(() => {
    const interval = setInterval(() => {
      setScanlinePos((prev) => (prev >= 100 ? 0 : prev + 1))
    }, 16) // ~60fps

    return () => clearInterval(interval)
  }, [])

  // Random glitch effect
  useEffect(() => {
    if (normalizedGlitch === 0) return

    const glitchInterval = setInterval(() => {
      // Random chance to trigger glitch based on intensity
      if (Math.random() < normalizedGlitch * 0.1) {
        setGlitchActive(true)

        // Create glitched version of text
        if (Math.random() < 0.3) {
          const glitchOptions = [
            "SIGNAL_INTERRUPT",
            "TRANSMISSION_ERROR",
            "BUFFER_OVERFLOW",
            "SYNC_LOST",
            "DATA_CORRUPT",
          ]
          setGlitchText(glitchOptions[Math.floor(Math.random() * glitchOptions.length)])
        }

        // Reset after short duration
        setTimeout(
          () => {
            setGlitchActive(false)
            setGlitchText("")
          },
          50 + Math.random() * 200,
        )
      }
    }, 2000) // Check for glitch every 2 seconds

    return () => clearInterval(glitchInterval)
  }, [normalizedGlitch])

  return (
    <div
      className={cn("relative overflow-hidden bg-[#1a1015] border-2 border-[#3a2a30]", "flex flex-col", className)}
      style={{
        aspectRatio: "16/9",
      }}
    >
      {/* Background texture */}
      <div className="absolute inset-0 diagonal-stripes opacity-20"></div>

      {/* CRT screen effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 ${30 * normalizedEffect}px rgba(122, 158, 159, 0.1)`,
          background: `radial-gradient(circle at center, transparent 50%, rgba(0, 0, 0, ${0.5 * normalizedEffect}) 100%)`,
        }}
      ></div>

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent ${2 - normalizedEffect}px, rgba(0, 0, 0, ${0.1 * normalizedEffect}) ${2 - normalizedEffect}px, rgba(0, 0, 0, ${0.1 * normalizedEffect}) ${4 - normalizedEffect * 2}px)`,
          opacity: 0.3 + normalizedEffect * 0.3,
        }}
      ></div>

      {/* Moving scanline */}
      <div
        className="absolute left-0 right-0 h-[2px] pointer-events-none"
        style={{
          top: `${scanlinePos}%`,
          background: `rgba(255, 255, 255, ${0.1 * normalizedEffect})`,
          boxShadow: `0 0 ${5 * normalizedEffect}px rgba(122, 158, 159, 0.5)`,
          opacity: 0.3 + normalizedEffect * 0.3,
        }}
      ></div>

      {/* Content container */}
      <div
        className={cn("flex-1 flex flex-col px-10 pt-6 pb-10 relative z-10", normalizedFlicker > 0 && "crt-flicker")}
        style={{
          // Custom animation speed based on flicker intensity
          animationDuration: `${8 - normalizedFlicker * 5}s`,
        }}
      >
        {/* Header */}
        <div className="mb-6 relative flex items-center">
          <Radio size={20} className="text-[#f5a623] animate-pulse mr-2" />
          <h2
            className={cn("text-[#f5a623] text-lg font-mono tracking-wider relative", glitchActive && "glitch-text")}
            data-text={title}
          >
            {glitchActive && glitchText ? glitchText : title}
          </h2>

          {/* Waveform animation */}
          <div className="ml-auto">
            <div className="h-6 flex items-center space-x-[2px]">
              {barHeights.map((height, index) => (
                <div
                  key={index}
                  className="w-[3px] rounded-sm transition-all duration-300 ease-out"
                  style={{
                    height: `${height * 100}%`,
                    backgroundColor: "#f0e6c8", // Cream color
                    opacity: 0.6 + height * 0.4,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div
          className={cn(
            "text-[#f0e6c8] text-sm font-mono leading-relaxed whitespace-pre-wrap flex-1",
            glitchActive && "glitch-text",
          )}
        >
          {content}
        </div>

        {/* SEQ1 Logo with animation - fixed position, only animates once */}
        <div className="absolute bottom-10 right-10 opacity-60 z-10">
          <AnimatedLogo
            className="scale-75 transform-origin-bottom-right seq1-logo-glow broadcast-logo"
            skipAnimation={hasLogoAnimationPlayed}
            onAnimationComplete={() => {
              setLogoAnimationPlayed()
            }}
          />
        </div>

        {/* Block height display - fixed position */}
        <div className="absolute bottom-4 right-10 z-10">
          <div className="text-[#a09080] text-[10px] font-mono opacity-60">
            BLOCK HEIGHT: {blockHeight !== null ? blockHeight.toLocaleString() : "803,102"}
          </div>
        </div>
      </div>
    </div>
  )
}
