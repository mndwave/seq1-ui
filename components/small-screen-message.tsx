"use client"

import { useState, useEffect, useRef } from "react"
import AnimatedLogo from "./animated-logo"
import { Info, MessageSquare } from "lucide-react"
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
            className="relative px-5 py-2.5 overflow-hidden group bg-[#f0e6c8] rounded-sm text-xs text-[#2a1a20] hover:bg-[#fff] transition-all duration-300" style={{boxShadow: "0 2px 0 #3a2a30, inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 4px 8px rgba(0, 0, 0, 0.3)"}}"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent opacity-50"></span><span className="absolute inset-0 w-full h-full dot-pattern opacity-10"></span><div className="relative flex items-center justify-center text-xs tracking-wide font-bold" style={{textShadow: "0 1px 0 rgba(255, 255, 255, 0.4)"}}><span>DM</span><span className="ml-[0.35em]">MNDWAVE</span><MessageSquare size={14} className="ml-1.5" /></div><span className="absolute bottom-0 left-0 right-0 h-1 bg-[#3a2a30] opacity-20 group-active:h-0 transition-all duration-150"></span><span className="absolute inset-0 w-full h-full bg-[#2a1a20] opacity-0 group-active:opacity-5 group-active:translate-y-px transition-all duration-150"></span>
            
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
