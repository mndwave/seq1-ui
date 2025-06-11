"use client"

import { useState, useEffect } from "react"
import GlobalTransport from "@/components/global-transport"
import Timeline from "@/components/timeline/timeline"
import { cn } from "@/lib/utils"

export default function TimelineDemoPage() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLooping, setIsLooping] = useState(false)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [isHardwareConnected, setIsHardwareConnected] = useState(true)

  // Toggle play state every 5 seconds for demo purposes
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPlaying((prev) => !prev)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  // Handle section selection
  const handleSectionSelect = (sectionId: string) => {
    setSelectedSection(sectionId)
    console.log(`Selected section: ${sectionId}`)
  }

  // Handle loop state change
  const handleLoopChange = (loopState: boolean) => {
    setIsLooping(loopState)
  }

  return (
    <div className="flex flex-col h-screen bg-[#1a1015] text-white">
      {/* Transport bar */}
      <GlobalTransport isHardwareConnected={isHardwareConnected} onLoopChange={handleLoopChange} />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Timeline */}
        <div className={cn("flex-1", isHardwareConnected ? "" : "opacity-50 pointer-events-none")}>
          <Timeline
            onSectionSelect={handleSectionSelect}
            isPlaying={isPlaying}
            isLooping={isLooping}
            onLoopChange={handleLoopChange}
          />
        </div>
      </div>
    </div>
  )
}
