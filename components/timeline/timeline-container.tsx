"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import Timeline from "./timeline"
import type { TimelineClip } from "@/lib/timeline-clip-schema"
import type { LoopRegion } from "@/lib/timeline-clip-schema" // import LoopRegion
import { TransportAPI } from "@/lib/api-services"
import { apiClient } from "@/lib/api-client"

interface TimelineContainerProps {
  className?: string
  selectedDeviceId?: string | null
  onLoopChange?: (isLooping: boolean) => void
  onClipSelect?: (clipId: string) => void
}

// Create a content API to manage timeline content
const createContentAPI = (
  setSections: React.Dispatch<React.SetStateAction<TimelineClip[]>>,
  setLoopRegion: (region: LoopRegion | null) => void,
  setIsLooping: (isLooping: boolean) => void,
  nextClipNumber: { current: number }, // Add nextClipNumber to the API
) => {
  return {
    // Add a clip at the specified position with default settings
    addClip: (startBar: number, lengthInBars = 4, name?: string, color?: string) => {
      const clipId = `clip-${Date.now()}`
      const clipName = name || `Clip ${String(nextClipNumber.current).padStart(2, "0")}` // Use nextClipNumber
      nextClipNumber.current++ // Increment the clip number

      // Use provided color or generate a random one from a set of vibrant options
      const colors = [
        "#FF5E5B",
        "#D8D8F6",
        "#39A0ED",
        "#FCFF4B",
        "#A2FAA3",
        "#4ECDC4",
        "#FF9F1C",
        "#F038FF",
        "#6DECAF",
        "#E84855",
      ]
      const finalColor = color || colors[Math.floor(Math.random() * colors.length)]

      const newClip: TimelineClip = {
        id: clipId,
        name: clipName,
        start: startBar * 4, // Convert bars to beats (assuming 4 beats per bar)
        length: lengthInBars * 4, // Convert bars to beats
        color: finalColor,
      }

      setSections((prev) => [...prev, newClip])
      console.log(`Added new clip: ${clipName} at bar ${startBar}`)
      return clipId
    },

    // Deprecated: No longer adds demo content - API-driven only
    addDefaultClip: () => {
      console.warn("addDefaultClip is deprecated - timeline is now API-driven only")
      return ""
    },

    // Deprecated: No longer sets demo loops - API-driven only  
    setDemoLoop: () => {
      console.warn("setDemoLoop is deprecated - timeline is now API-driven only")
    },

    // Clear all content
    clearContent: () => {
      setSections([])
      setLoopRegion(null)
      console.log("Cleared all timeline content")
    },
  }
}

export default function TimelineContainer({
  className = "",
  selectedDeviceId,
  onLoopChange,
  onClipSelect,
}: TimelineContainerProps) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [initialSections, setInitialSections] = useState<TimelineClip[]>([])
  const [loopRegion, setLoopRegion] = useState<LoopRegion | null>(null)
  const [isLooping, setIsLooping] = useState(false)
  const [sections, setSections] = useState<TimelineClip[]>([])

  // Track the next clip number
  const nextClipNumber = useRef(1) // Initialize to 1

  // Create the content API
  const contentAPI = useCallback(
    () => createContentAPI(setSections, setLoopRegion, setIsLooping, nextClipNumber),
    [setSections, setLoopRegion, setIsLooping],
  )

  // Initialize timeline content from API only - no demo data
  useEffect(() => {
    const fetchTimelineData = async () => {
      try {
        // Fetch clips from API using proper client
        const clips = await apiClient.request('/api/timeline/clips')
        setSections(clips)
      } catch (error) {
        console.error("Failed to fetch timeline data:", error)
        // Keep timeline empty on error (no fallback demo data)
        setSections([])
      }
    }

    fetchTimelineData()
  }, [])

  useEffect(() => {
    // Call onLoopChange when isLooping changes
    if (onLoopChange) {
      onLoopChange(isLooping)
    }
  }, [isLooping, onLoopChange])

  // Add a handler for loop region updates
  const handleLoopRegionChange = useCallback(
    (newLoopRegion: LoopRegion | null) => {
      console.log("Setting loop region:", newLoopRegion)
      setLoopRegion(newLoopRegion)

      // If we're setting a loop region, ensure looping is enabled
      if (newLoopRegion && !isLooping) {
        setIsLooping(true)
        if (onLoopChange) {
          onLoopChange(true)
        }
      }
    },
    [isLooping, onLoopChange],
  )

  // Handle loop drag end with explicit region parameters
  const handleLoopDragEnd = useCallback(
    (shouldCreateLoop: boolean, startBar?: number, endBar?: number) => {
      console.log("Loop drag end:", shouldCreateLoop, startBar, endBar)
      if (shouldCreateLoop && startBar !== undefined && endBar !== undefined) {
        handleLoopRegionChange({ startBar, endBar })
      }
    },
    [handleLoopRegionChange],
  )

  const handleSectionSelect = useCallback(
    async (sectionId: string) => {
      setSelectedSection(sectionId)
      console.log(`Selected section ${sectionId} for device ${selectedDeviceId || "none"}`)

      // Notify parent component about clip selection
      if (onClipSelect) {
        onClipSelect(sectionId)
      }

      if (selectedDeviceId) {
        await TransportAPI.playMidiClip(sectionId, selectedDeviceId)
      }
    },
    [onClipSelect, selectedDeviceId],
  )

  return (
    <Timeline
      onSectionSelect={handleSectionSelect}
      isPlaying={false}
      className={className}
      selectedDeviceId={selectedDeviceId}
      initialSections={sections} // Pass the sections state instead of initialSections
      loopRegion={loopRegion}
      setLoopRegion={handleLoopRegionChange}
      isLooping={isLooping}
      onLoopChange={setIsLooping}
      onLoopDragEnd={handleLoopDragEnd}
      contentAPI={contentAPI()} // Pass the content API to the Timeline
    />
  )
}
