"use client"

import { useState, useEffect, useRef } from "react"
import AnimatedLogo from "./animated-logo"
import { Info, MessageCircle } from "lucide-react"
import { useLogoAnimation } from "@/lib/logo-animation-context"

export default function SmallScreenMessage() {
  const { hasLogoAnimationPlayed, setLogoAnimationPlayed } = useLogoAnimation()
  const [logoAnimationComplete, setLogoAnimationComplete] = useState(hasLogoAnimationPlayed)
  const [blockheight, setBlockheight] = useState<string>("901042")
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Use static blockheight from environment (deployment seal)
    const staticBlockheight = process.env.NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT || "901042"
    setBlockheight(staticBlockheight)
  }, [])

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

  const handleDMClick = () => {
    // Open Nostr client or copy npub
    const npub = "npub1mndwave..." // Replace with actual npub
    if (navigator.clipboard) {
      navigator.clipboard.writeText(npub)
    }
    window.open("https://njump.me/npub1mndwave", "_blank")
  }

  return (
    <div
      className="h-screen w-screen flex flex-col bg-[#1a1015] text-[#f0e6c8] p-6 fixed inset-0 overflow-hidden z-50"
      ref={modalRef}
    >
      {/* Logo section - reduced top padding */}
      <div className="flex flex-col items-center pt-8">
        <div className="mb-6">
          <AnimatedLogo
            className="text-2xl seq1-logo-glow"
            onAnimationComplete={handleLogoAnimationComplete}
            skipAnimation={hasLogoAnimationPlayed}
          />
        </div>
      </div>

      {/* Main content section */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="max-w-sm mx-auto text-center">
          <p className="text-base font-medium text-[#f0e6c8] mb-4">
            SEQ1 requires a larger screen to provide the optimal experience.
          </p>
          <p className="text-sm text-[#a09080] mb-8">
            Please use a device with a screen width of at least 1024px.
          </p>

          {/* DM MNDWAVE Button */}
          <button
            onClick={handleDMClick}
            className="inline-flex items-center px-4 py-2 bg-[var(--seq1-accent)] border border-[var(--seq1-border)] rounded-sm text-xs text-[var(--seq1-text-primary)] hover:bg-[var(--seq1-accent-hover)] transition-all duration-200 micro-feedback"
          >
            <MessageCircle size={14} className="mr-2 icon-abstract" />
            <span className="seq1-caption font-semibold">DM MNDWAVE</span>
          </button>
        </div>

        {/* What is SEQ1 section */}
        <div className="w-full max-w-sm mx-auto mt-12">
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
      </div>

      {/* Consensus Clock at bottom */}
      <div className="w-full text-center pb-4">
        <div className="w-16 h-px bg-[#3a2a30] mx-auto mb-3"></div>
        <div className="space-y-1">
          <p className="text-[10px] text-[#a09080] uppercase tracking-wider">Consensus Clock</p>
          <p className="text-xs text-[#f0e6c8] font-medium">[{blockheight}]</p>
        </div>
      </div>
    </div>
  )
}
