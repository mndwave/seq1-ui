"use client"

import { useEffect, useState } from "react"

interface VintageAudioMeterProps {
  className?: string
  barCount?: number
  backgroundColor?: string
  barColor?: string
  showText?: boolean
  text?: string
}

/**
 * VintageAudioMeter component
 *
 * Displays an animated audio meter visualization that closely matches
 * the vintage hi-fi equalizer look from the provided screenshot,
 * with bars that pulse from both top and bottom
 */
export default function VintageAudioMeter({
  className = "",
  barCount = 24,
  backgroundColor = "#f0e6c8", // Cream background
  barColor = "#3a2a30", // Dark purple/brown for bars
  showText = false,
  text = "THINKING",
}: VintageAudioMeterProps) {
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
          return Math.random() * 0.6 + 0.2
        }),
      )
    }, 250) // Slower update - every 250ms for a more relaxed feel

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`flex flex-col items-start ${className}`}>
      <div className="flex items-center p-2 rounded-sm" style={{ backgroundColor }}>
        <div className="flex items-center h-12 space-x-[3px]">
          {barHeights.map((height, index) => {
            // Calculate the height for top and bottom parts
            // Each part gets half of the total height
            const halfHeight = height / 2

            return (
              <div key={index} className="flex flex-col items-center justify-center h-full">
                {/* Top bar */}
                <div
                  className="w-[6px] rounded-[3px] transition-all duration-300 ease-out"
                  style={{
                    height: `${halfHeight * 100}%`,
                    backgroundColor: barColor,
                    opacity: 0.9,
                  }}
                />

                {/* 1px gap */}
                <div className="h-[1px]"></div>

                {/* Bottom bar (using same height as top for symmetry) */}
                <div
                  className="w-[6px] rounded-[3px] transition-all duration-300 ease-out"
                  style={{
                    height: `${halfHeight * 100}%`,
                    backgroundColor: barColor,
                    opacity: 0.9,
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>
      {showText && (
        <div className="text-sm font-mono mt-1" style={{ color: backgroundColor }}>
          {text}
        </div>
      )}
    </div>
  )
}
