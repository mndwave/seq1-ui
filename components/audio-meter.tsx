"use client"

import { useEffect, useState } from "react"

interface AudioMeterProps {
  className?: string
  barCount?: number
  color?: string
  showText?: boolean
  text?: string
}

/**
 * AudioMeter component
 *
 * Displays an animated audio meter visualization similar to a hi-fi equalizer
 * with bars that pulse from both top and bottom
 */
export default function AudioMeter({
  className = "",
  barCount = 16,
  color = "#f0e6c8", // Cream/vintage color
  showText = false, // Default to not showing text
  text = "THINKING",
}: AudioMeterProps) {
  const [barHeights, setBarHeights] = useState<number[]>([])

  // Initialize bar heights on mount
  useEffect(() => {
    setBarHeights(
      Array(barCount)
        .fill(0)
        .map(() => Math.random() * 0.6 + 0.2),
    )
  }, [barCount])

  // Animate bar heights
  useEffect(() => {
    const interval = setInterval(() => {
      setBarHeights((prev) =>
        prev.map(() => {
          // Create a natural-looking audio meter effect with varying heights
          // Heights are between 0.2 (20%) and 0.8 (80%)
          return Math.random() * 0.6 + 0.2
        }),
      )
    }, 250) // Slower update - every 250ms for a more relaxed feel

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`flex flex-col items-start ${className}`}>
      {/* Center-aligned bars that extend both up and down */}
      <div className="flex items-center h-12 space-x-[4px]">
        {barHeights.map((height, index) => {
          // Calculate the height for top and bottom parts
          // Each part gets half of the total height
          const halfHeight = height / 2

          return (
            <div key={index} className="flex flex-col items-center justify-center h-full">
              {/* Top bar */}
              <div
                className="w-[5px] rounded-full transition-all duration-300 ease-out"
                style={{
                  height: `${halfHeight * 100}%`,
                  backgroundColor: color,
                  opacity: 0.9,
                }}
              />

              {/* 1px gap */}
              <div className="h-[1px]"></div>

              {/* Bottom bar (using same height as top for symmetry) */}
              <div
                className="w-[5px] rounded-full transition-all duration-300 ease-out"
                style={{
                  height: `${halfHeight * 100}%`,
                  backgroundColor: color,
                  opacity: 0.9,
                }}
              />
            </div>
          )
        })}
      </div>
      {showText && (
        <div className="text-sm font-mono mt-1" style={{ color }}>
          {text}
        </div>
      )}
    </div>
  )
}
