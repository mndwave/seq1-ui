"use client"

import { useState } from "react"
import AudioMeter from "@/components/audio-meter"
import { Button } from "@/components/ui/button"

export default function AudioMeterDemo() {
  const [isActive, setIsActive] = useState(true)
  const [barCount, setBarCount] = useState(16)
  const [showText, setShowText] = useState(false)

  return (
    <div className="min-h-screen bg-[#1a1015] flex flex-col items-center justify-center p-6">
      <div className="p-8 border border-[#3a2a30] bg-[#2a1a20] rounded-sm max-w-md w-full">
        <h1 className="text-xl font-semibold text-[#f0e6c8] mb-6 text-center">Audio Meter Component</h1>

        <div className="flex justify-center mb-8">
          <div
            className="p-6 bg-[#1a1015] border border-[#3a2a30] rounded-sm"
            style={{
              boxShadow: `inset 0 0 0 1px rgba(240, 230, 200, 0.1), 
                        inset 0 0 0 2px rgba(58, 42, 48, 0.8)`,
            }}
          >
            {isActive ? (
              <AudioMeter barCount={barCount} showText={showText} />
            ) : (
              <div className="h-10 flex items-center text-[#a09080]">Meter inactive</div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center space-x-4">
            <Button onClick={() => setIsActive(!isActive)} className="channel-button active">
              {isActive ? "PAUSE" : "ACTIVATE"}
            </Button>

            <Button
              onClick={() => setBarCount(Math.max(4, barCount - 4))}
              className="channel-button"
              disabled={barCount <= 4}
            >
              FEWER BARS
            </Button>

            <Button
              onClick={() => setBarCount(Math.min(32, barCount + 4))}
              className="channel-button"
              disabled={barCount >= 32}
            >
              MORE BARS
            </Button>
          </div>

          <div className="flex justify-center mt-2">
            <Button onClick={() => setShowText(!showText)} className={`channel-button ${showText ? "active" : ""}`}>
              {showText ? "HIDE TEXT" : "SHOW TEXT"}
            </Button>
          </div>

          <div className="text-center text-sm text-[#a09080]">
            Current configuration: {barCount} bars, text {showText ? "visible" : "hidden"}
          </div>
        </div>
      </div>
    </div>
  )
}
