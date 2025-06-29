"use client"

import DmMndwaveButton from "./dm-mndwave-button"
import VersionIndicator from "./version-indicator"
import React, { useEffect, useRef, useState } from 'react'
import AnimatedLogo from './animated-logo'
import { CANONICAL_MOBILE_CONTENT, CANONICAL_SEQ1_DESCRIPTION } from '../lib/canonical_content_constants'

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
      className="h-screen w-screen flex flex-col bg-[#1a1015] text-[#f0e6c8] p-6 fixed inset-0 overflow-hidden z-50"
      ref={modalRef}
      style={{
        fontFamily: 'Space Mono, monospace',
        background: 'linear-gradient(135deg, #1a1015 0%, #0f0a0d 100%)',
        height: '100vh',
        position: 'fixed'
      }}
    >
      {/* Subtle CRT scanlines effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          background: 'linear-gradient(transparent 50%, rgba(255,255,255,0.1) 50%)',
          backgroundSize: '100% 4px'
        }}
      />

      {/* Logo section - larger and centered with emotional presence */}
      <div className="flex flex-col items-center pt-16">
        <div className="mb-8">
          <AnimatedLogo
            className="text-6xl font-bold seq1-logo-glow"
            onAnimationComplete={handleLogoAnimationComplete}
            skipAnimation={hasLogoAnimationPlayed}
            style={{
              filter: 'drop-shadow(0 0 8px rgba(240, 230, 200, 0.3))',
              textShadow: '0 0 12px rgba(240, 230, 200, 0.4)'
            }}
          />
        </div>
      </div>

      {/* Main content section - moved closer to logo */}
      <div className="flex-1 flex flex-col items-center justify-start pt-2">
        <div className="max-w-sm mx-auto text-center">
          {/* Constitutional screen requirement messaging */}
          <p 
            className="text-base font-medium text-[#f0e6c8] mb-3"
            style={{
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              filter: 'drop-shadow(0 0 4px rgba(240, 230, 200, 0.2))'
            }}
          >
            {CANONICAL_MOBILE_CONTENT.screenRequirement.heading}
          </p>
          
          <p 
            className="text-sm text-[#b8a888] mb-6"
            style={{
              textShadow: '0 1px 1px rgba(0, 0, 0, 0.3)'
            }}
          >
            {CANONICAL_MOBILE_CONTENT.screenRequirement.subtext}
          </p>

          {/* Constitutional DM MNDWAVE button - matches About Modal styling */}
          <div className="flex justify-center mb-6">
            <DmMndwaveButton 
              className="mx-auto" 
              style={{
                display: 'block',
                textAlign: 'center'
              }}
            />
          </div>

          {/* Canonical What is SEQ1? section - two-tone layout like ABOUT modal */}
          <div className="border-t border-[#3a2a30] pt-4">
            <h3 
              className="text-sm font-medium text-[#d4c2a4] mb-3"
              style={{
                textShadow: '0 1px 1px rgba(0, 0, 0, 0.3)'
              }}
            >
              {CANONICAL_MOBILE_CONTENT.whatIsSeq1.heading}
            </h3>
            
            {/* Two-tone canonical content matching ABOUT modal */}
            <div className="space-y-3">
              <p 
                className="text-xs text-[#f0e6c8] leading-relaxed"
                style={{
                  textShadow: '0 1px 1px rgba(0, 0, 0, 0.3)'
                }}
              >
                {CANONICAL_SEQ1_DESCRIPTION.primary}
              </p>
              
              <p 
                className="text-xs text-[#a09080] leading-relaxed"
                style={{
                  textShadow: '0 1px 1px rgba(0, 0, 0, 0.3)'
                }}
              >
                {CANONICAL_SEQ1_DESCRIPTION.secondary}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer section with constitutional VersionIndicator */}
      <div className="flex flex-col items-center pt-4 pb-4">        
        {/* Constitutional VersionIndicator - matches desktop bottom-right style */}
        <div className="flex justify-center">
          <VersionIndicator />
        </div>
      </div>

      {/* Subtle ambient flicker effect */}
      <style jsx>{`
        @keyframes subtle-flicker {
          0%, 100% { opacity: 1; }
          2% { opacity: 0.98; }
          4% { opacity: 0.95; }
          6% { opacity: 0.98; }
          50% { opacity: 0.97; }
          52% { opacity: 0.95; }
          54% { opacity: 0.98; }
        }
        
        .seq1-logo-glow {
          animation: subtle-flicker 8s infinite;
        }
      `}</style>
    </div>
  )
} 