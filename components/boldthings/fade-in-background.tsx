"use client"

import React, { useEffect, useState } from 'react'

interface BoldthingsFadeInBackgroundProps {
  fadeDuration?: number
  fadeDelay?: number
  className?: string
}

export function BoldthingsFadeInBackground({
  fadeDuration = 1200,
  fadeDelay = 300,
  className = ""
}: BoldthingsFadeInBackgroundProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, fadeDelay)

    return () => clearTimeout(timer)
  }, [fadeDelay])

  return (
    <div 
      className={`absolute inset-0 z-10 bg-gradient-to-br from-gray-900 via-black to-gray-800 transition-opacity ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transitionDuration: `${fadeDuration}ms`,
        transitionTimingFunction: 'ease-in-out'
      }}
    />
  )
} 