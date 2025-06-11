"use client"

import { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"

/**
 * DeviceInitializingMIDI component
 *
 * Shows a loading state when initializing MIDI connections
 */
export default function DeviceInitializingMIDI() {
  const [progress, setProgress] = useState(0)
  const [barHeights, setBarHeights] = useState<number[]>([])

  // Initialize bar heights and start progress
  useEffect(() => {
    // Create initial bar heights
    setBarHeights(
      Array(16)
        .fill(0)
        .map(() => Math.random() * 0.6 + 0.2),
    )

    // Simulate initialization progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (Math.random() * 2 + 1)
        return newProgress >= 100 ? 100 : newProgress
      })
    }, 200)

    return () => clearInterval(interval)
  }, [])

  // Animate bar heights
  useEffect(() => {
    const interval = setInterval(() => {
      setBarHeights((prev) => prev.map(() => Math.random() * 0.6 + 0.2))
    }, 250)

    return () => clearInterval(interval)
  }, [])

  // Colors for the initializing state
  const colors = {
    bg: "rgba(66, 135, 245, 0.1)", // Blue background
    text: "#4287f5", // Blue text
    bars: "#4287f5", // Blue bars
    progress: "#4287f5", // Blue progress
  }

  return (
    <div className="p-4 relative inset-panel">
      <div className="absolute inset-0 dot-pattern opacity-10"></div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center">
          {/* Status indicator */}
          <div className="mr-3 flex items-center justify-center">
            <div className="relative w-14 h-5 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-[#2a2520] border border-[#3a3a30]"
                style={{
                  borderRadius: "1px",
                  backgroundColor: colors.bg,
                }}
              ></div>

              <div className="absolute inset-0 dot-pattern opacity-10" style={{ borderRadius: "1px" }}></div>

              <span className="relative text-[9px] tracking-wide font-medium opacity-80" style={{ color: colors.text }}>
                MIDI
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-[#f0e6c8]">Initializing MIDI</h3>
            <p className="text-xs text-[#a09080] tracking-wide">Connecting to devices</p>
          </div>
        </div>

        {/* Visualization and progress */}
        <div className="flex items-center">
          {/* Audio meter-like visualization */}
          <div className="mr-3 h-8 flex items-center space-x-[2px]">
            {barHeights.map((height, index) => (
              <div
                key={index}
                className="w-[3px] rounded-sm transition-all duration-300 ease-out"
                style={{
                  height: `${height * 100}%`,
                  opacity: 0.6 + height * 0.4,
                  backgroundColor: colors.bars,
                }}
              />
            ))}
          </div>

          {/* Alert icon that pulses */}
          <div className="w-10 h-6 flex items-center justify-center relative">
            <div
              className="absolute inset-0 bg-[#1a1015] border border-[#3a2a30] shadow-md"
              style={{ borderRadius: "1px" }}
            ></div>

            <AlertCircle size={16} className="animate-pulse relative z-10" style={{ color: colors.text }} />
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1 w-full bg-[#1a1015] rounded-sm overflow-hidden">
        <div
          className="h-full transition-all duration-300 ease-out"
          style={{
            width: `${progress}%`,
            backgroundColor: colors.progress,
          }}
        />
      </div>
    </div>
  )
}
