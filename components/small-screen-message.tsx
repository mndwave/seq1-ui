"use client"

import React, { useEffect, useRef, useState } from 'react'
import { MessageSquare, Mail } from 'lucide-react'
import AnimatedLogo from './animated-logo'

export default function SmallScreenMessage() {
  const [hasLogoAnimationPlayed, setHasLogoAnimationPlayed] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if the logo animation has already played
    const hasPlayed = localStorage.getItem('seq1-logo-animation-played') === 'true'
    setHasLogoAnimationPlayed(hasPlayed)
  }, [])

  const handleLogoAnimationComplete = () => {
    setHasLogoAnimationPlayed(true)
    localStorage.setItem('seq1-logo-animation-played', 'true')
  }

  const handleDMClick = () => {
    // Direct link to Primal profile
    window.open('https://primal.net/mndwave', '_blank', 'noopener,noreferrer')
  }

  // Apply background styles to body when component mounts
  useEffect(() => {
    const originalBg = document.body.style.background
    const originalOverflow = document.body.style.overflow
    
    // Set dark background
    document.body.style.background = '#1a1015'
    document.body.style.overflow = 'hidden'
    
    return () => {
      // Restore original styles
      document.body.style.background = originalBg
      document.body.style.overflow = originalOverflow
    }
  }, [])

  // Handle ESC key to close modal (for consistency with other modals)
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Could trigger a close action if needed
      }
    }
    
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  // Focus management for accessibility
  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus()
    }
  }, [])

  return (
    <div
      className="h-screen w-screen flex flex-col bg-[#1a1015] text-[#f0e6c8] p-6 fixed inset-0 overflow-hidden z-50 mobile-crt-effects"
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

          {/* DM MNDWAVE Button - Exact Match to About Modal */}
          <a
            href="https://primal.net/mndwave"
            target="_blank"
            rel="noopener noreferrer"
            className="relative px-5 py-2.5 overflow-hidden group bg-[#f0e6c8] rounded-sm text-[#2a1a20] hover:bg-[#fff] transition-all duration-300"
            style={{
              boxShadow: "0 2px 0 #3a2a30, inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 4px 8px rgba(0, 0, 0, 0.3)",
            }}
            data-immutable="mndwave-contact"
            data-business-critical="true"
          >
            {/* Button texture overlay */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent opacity-50"></span>

            {/* Subtle noise texture */}
            <span className="absolute inset-0 w-full h-full dot-pattern opacity-10"></span>

            {/* Button text with shadow for depth */}
            <div
              className="relative flex items-center justify-center text-xs tracking-wide font-bold"
              style={{ textShadow: "0 1px 0 rgba(255, 255, 255, 0.4)" }}
            >
              <span>DM</span>
              <span className="ml-[0.35em]">MNDWAVE</span>
              <Mail size={14} className="ml-1.5" />
            </div>

            {/* Button press effect */}
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#3a2a30] opacity-20 group-active:h-0 transition-all duration-150"></span>
            <span className="absolute inset-0 w-full h-full bg-[#2a1a20] opacity-0 group-active:opacity-5 group-active:translate-y-px transition-all duration-150"></span>
          </a>
        </div>

        {/* What is SEQ1 section */}
        <div className="mt-12 max-w-md mx-auto text-center">
          <h3 className="text-sm font-semibold text-[#f0e6c8] mb-3">What is SEQ1?</h3>
          <p className="text-xs text-[#a09080] leading-relaxed">
            SEQ1 is a new type of DAW that connects to your hardware synths and drum machines, harnessing the power of AI
            with human emotion. Adaptive and responsive to your creative direction.
          </p>
        </div>
      </div>

      {/* Footer section */}
      <div className="flex justify-center pt-4">
        <p className="text-xs text-[#666] opacity-70">
          For optimal experience, please use a desktop or laptop computer.
        </p>
      </div>
    </div>
  )
}
