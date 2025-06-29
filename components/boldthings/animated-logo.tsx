"use client"

import React, { useEffect, useState } from 'react'

interface BoldthingsAnimatedLogoProps {
  className?: string
  valveGlow?: boolean
  boldGlowClass?: string
  thingsGlowClass?: string
  appearDelay?: number
  appearDuration?: number
}

export function BoldthingsAnimatedLogo({
  className = "",
  valveGlow = true,
  boldGlowClass = "bold-glow",
  thingsGlowClass = "things-glow",
  appearDelay = 300,
  appearDuration = 1500
}: BoldthingsAnimatedLogoProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [glowIntensity, setGlowIntensity] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, appearDelay)

    return () => clearTimeout(timer)
  }, [appearDelay])

  useEffect(() => {
    if (valveGlow && isVisible) {
      const glowTimer = setTimeout(() => {
        setGlowIntensity(true)
      }, appearDuration / 2)

      return () => clearTimeout(glowTimer)
    }
  }, [valveGlow, isVisible, appearDuration])

  return (
    <div 
      className={`subtle-flicker transition-all ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'scale(1)' : 'scale(0.9)',
        transitionDuration: `${appearDuration}ms`,
        transitionTimingFunction: 'ease-out'
      }}
    >
      <h1 className="text-6xl md:text-8xl font-bold text-center">
        <span 
          className={`${boldGlowClass} transition-all duration-500 ${
            glowIntensity ? 'brightness-110' : ''
          }`}
        >
          SEQ
        </span>
        <span 
          className={`text-retro-display transition-all duration-500 ${
            thingsGlowClass
          } ${glowIntensity ? 'brightness-110' : ''}`}
        >
          1
        </span>
      </h1>
    </div>
  )
} 