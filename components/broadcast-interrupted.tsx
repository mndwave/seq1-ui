"use client"

import { useState, useRef, useEffect } from "react"
import { useLogoAnimation } from "@/lib/logo-animation-context"

interface BroadcastInterruptedProps {
  message?: string
  showStatic?: boolean
  className?: string
}

export default function BroadcastInterrupted({
  message = "WE'LL BE BACK SOON",
  showStatic = true,
  className = "",
}: BroadcastInterruptedProps) {
  // const [isExporting, setIsExporting] = useState(false)
  const componentRef = useRef<HTMLDivElement>(null)
  const [blockHeight, setBlockHeight] = useState<number | null>(null)
  const [glitchActive, setGlitchActive] = useState(false)

  const { hasLogoAnimationPlayed } = useLogoAnimation()

  // Remove the time update effect
  // Keep only the block height fetch effect
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
  }, [])

  // Occasional glitch effect
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() < 0.1) {
        setGlitchActive(true)
        setTimeout(() => setGlitchActive(false), 150 + Math.random() * 200)
      }
    }, 5000)
    return () => clearInterval(glitchInterval)
  }, [])

  // Add valve-like subtle pulsing glow effect
  useEffect(() => {
    // Add the CSS for the valve glow animation
    const style = document.createElement("style")
    style.textContent = `
    @keyframes valveGlow {
      0% { filter: drop-shadow(0 0 8px rgba(240, 230, 200, 0.4)); }
      25% { filter: drop-shadow(0 0 10px rgba(240, 230, 200, 0.5)); }
      50% { filter: drop-shadow(0 0 12px rgba(240, 230, 200, 0.6)); }
      75% { filter: drop-shadow(0 0 10px rgba(240, 230, 200, 0.5)); }
      100% { filter: drop-shadow(0 0 8px rgba(240, 230, 200, 0.4)); }
    }
    
    .valve-glow {
      animation: valveGlow 4s infinite ease-in-out;
    }
  `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div className={`relative ${className}`}>
      <div
        ref={componentRef}
        className="w-full aspect-video bg-[#1a1015] border-2 border-[#3a2a30] relative overflow-hidden"
      >
        {/* Background texture - very subtle */}
        <div className="absolute inset-0 diagonal-stripes opacity-10"></div>

        {/* Static noise effect - very subtle */}
        {showStatic && (
          <div
            className="absolute inset-0 z-10 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundSize: "150px",
              mixBlendMode: "overlay",
            }}
          />
        )}

        {/* Main content - using flex with justify-center and items-center to ensure perfect centering */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-between p-8">
          {/* SEQ1 Logo - positioned at the top third of the screen */}
          <div className="flex-1 flex items-center justify-center mb-8">
            <div className="valve-glow">
              <h1
                className="text-8xl font-semibold italic font-poppins text-[#f0e6c8]"
                style={{
                  textShadow: "0 0 15px rgba(240, 230, 200, 0.6), 0 0 30px rgba(240, 230, 200, 0.4)",
                }}
              >
                SEQ1
              </h1>
            </div>
          </div>

          {/* Message positioned in the center of the screen */}
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xl font-mono tracking-[0.15em] text-[#f0e6c8]">{message}</p>
          </div>

          {/* Block height display - at the bottom */}
          <div className="w-full text-center mt-8">
            <div className="text-[#a09080] text-xs font-mono opacity-60">
              BROADCAST TERMINATED BLOCK HEIGHT {blockHeight !== null ? blockHeight.toLocaleString() : "890,132"}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
