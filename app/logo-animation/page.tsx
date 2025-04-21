"use client"

import { useState } from "react"
import AnimatedLogo from "@/components/animated-logo"

export default function LogoAnimationPage() {
  const [isAnimating, setIsAnimating] = useState(true)

  const handleAnimationComplete = () => {
    setIsAnimating(false)
  }

  const restartAnimation = () => {
    // Instead of incrementing animationCount, add and remove classes
    const logo = document.querySelector(".logo-element")
    if (logo) {
      // Remove existing classes
      logo.classList.remove("seq1-logo-glow")
      // Force a reflow
      void logo.offsetWidth
      // Add classes back
      logo.classList.add("seq1-logo-glow")
      setIsAnimating(true)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#1a1015] p-6">
      <div className="p-8 border border-[#3a2a30] bg-[#2a1a20] rounded-sm max-w-md w-full">
        <div className="h-16 border-b border-[#3a2a30] flex items-center px-4 bg-[#2a1a20] relative overflow-hidden mb-8">
          <div className="absolute inset-0 diagonal-stripes opacity-20"></div>
          <div className="flex-1 flex items-center justify-between relative z-10">
            <div className="flex items-center">
              {/* The key prop forces the component to remount when animationCount changes */}
              <AnimatedLogo onAnimationComplete={handleAnimationComplete} className="mr-8 logo-element" />
              <div className="flex space-x-3">
                {/* Placeholder buttons */}
                <div className="w-8 h-8 rounded-full bg-[#2a1a20] border border-[#3a2a30]"></div>
                <div className="w-8 h-8 rounded-full bg-[#2a1a20] border border-[#3a2a30]"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <p className="text-sm text-[#f0e6c8]">
            {isAnimating ? "Loading SEQ1..." : "Animation complete! The logo has stabilized to solid."}
          </p>

          <button
            onClick={restartAnimation}
            className="channel-button active flex items-center px-3 py-1.5 mx-auto"
            disabled={isAnimating}
          >
            <span className="text-xs tracking-wide">RESTART ANIMATION</span>
          </button>
        </div>
      </div>
    </div>
  )
}
