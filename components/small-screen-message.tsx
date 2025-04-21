"use client"

import { useState, useEffect, useRef } from "react"
import AnimatedLogo from "./animated-logo"
import { Info } from "lucide-react"
import { useLogoAnimation } from "@/lib/logo-animation-context"

export default function SmallScreenMessage() {
  const { hasLogoAnimationPlayed, setLogoAnimationPlayed } = useLogoAnimation()
  const [logoAnimationComplete, setLogoAnimationComplete] = useState(hasLogoAnimationPlayed)
  const modalRef = useRef<HTMLDivElement>(null)

  // Set up the animation loop similar to the homepage
  useEffect(() => {
    // Only set up the interval if the initial animation has completed
    if (logoAnimationComplete) {
      const interval = setInterval(() => {
        // Just trigger a subtle glow pulse by adding and removing a class
        if (modalRef.current) {
          const logo = modalRef.current.querySelector(".seq1-logo-glow")
          if (logo) {
            logo.classList.add("logo-pulse-highlight")
            setTimeout(() => {
              logo.classList.remove("logo-pulse-highlight")
            }, 2000)
          }
        }
      }, 35000) // 35 seconds interval

      return () => clearInterval(interval)
    }
  }, [logoAnimationComplete])

  const handleLogoAnimationComplete = () => {
    setLogoAnimationPlayed()
    setLogoAnimationComplete(true)
  }

  return (
    <div
      className="h-screen w-screen flex flex-col justify-between bg-[#1a1015] text-[#f0e6c8] p-6 fixed inset-0 overflow-hidden z-50"
      ref={modalRef}
    >
      {/* Top section with logo and main message */}
      <div className="flex-1 flex flex-col items-center justify-center pt-16">
        <div className="mb-8">
          <AnimatedLogo
            className="text-3xl seq1-logo-glow"
            onAnimationComplete={handleLogoAnimationComplete}
            skipAnimation={hasLogoAnimationPlayed}
          />
        </div>
        <div className="max-w-md mx-auto mt-8 text-center">
          <p className="text-base font-medium text-[#f0e6c8]">
            SEQ1 requires a larger screen to provide the optimal experience.
          </p>
          <p className="text-sm mt-2 text-[#a09080]">Please use a device with a screen width of at least 1024px.</p>
        </div>
      </div>

      {/* What is SEQ1 section at the bottom */}
      <div className="w-full max-w-md mx-auto mt-8 mb-8">
        <div className="space-y-3">
          <div className="flex items-center justify-center">
            <Info size={16} className="text-[#f5a623] mr-2" />
            <h3 className="text-xs font-medium text-[#f5a623] uppercase tracking-wider">What is SEQ1?</h3>
          </div>

          <p className="text-xs text-[#f0e6c8] text-center">
            SEQ1 is a new type of DAW that connects to your hardware synths and drum machines, harnessing the power of
            AI with human emotion.
          </p>

          <p className="text-xs text-[#a09080] text-center">
            Adaptive and responsive to your creative direction, SEQ1 helps you create sequences, design patches, and
            explore new musical territories.
          </p>
        </div>
      </div>

      {/* Version at the very bottom */}
      <div className="w-full text-center">
        <div className="w-16 h-px bg-[#3a2a30] mx-auto mb-2"></div>
        <p className="text-xs text-[#a09080]">SEQ1 v0.1.0-alpha</p>
      </div>
    </div>
  )
}
