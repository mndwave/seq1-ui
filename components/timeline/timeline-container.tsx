"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import Timeline from "./timeline"
import type { TimelineClip } from "@/lib/timeline-clip-schema"
import type { LoopRegion } from "@/lib/timeline-clip-schema" // import LoopRegion
import { TransportAPI } from "@/lib/api-services"
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
    addClip: (startBar: number, lengthInBars = 4, name?: string) => {
      const clipId = `clip-${Date.now()}`
      const clipName = name || `Clip ${String(nextClipNumber.current).padStart(2, "0")}` // Use nextClipNumber
      nextClipNumber.current++ // Increment the clip number

      // Generate a random color from a set of vibrant options
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
      const color = colors[Math.floor(Math.random() * colors.length)]

      const newClip: TimelineClip = {
        id: clipId,
        name: clipName,
        start: startBar * 4, // Convert bars to beats (assuming 4 beats per bar)
        length: lengthInBars * 4, // Convert bars to beats
        color: color,
      }

      setSections((prev) => [...prev, newClip])
      console.log(`Added new clip: ${clipName} at bar ${startBar}`)
      return clipId
    },

    // Add a default demo clip at bar 1
    addDefaultClip: () => {
      return createContentAPI(setSections, setLoopRegion, setIsLooping, nextClipNumber).addClip(0, 4, "Clip 01")
    },

    // Set a demo loop from bar 1 to 5
    setDemoLoop: () => {
      const demoLoop: LoopRegion = { startBar: 0, endBar: 4 }
      setLoopRegion(demoLoop)
      setIsLooping(true)
      console.log("Set demo loop from bar 1 to 5")
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
  const [isLooping, setIsLooping] = useState(true)
  const [sections, setSections] = useState<TimelineClip[]>([])

  // Track if demo content has been initialized
  const demoInitialized = useRef(false)

  // Track the next clip number
  const nextClipNumber = useRef(1) // Initialize to 1

  // Create the content API
  const contentAPI = useCallback(
    () => createContentAPI(setSections, setLoopRegion, setIsLooping, nextClipNumber),
    [setSections, setLoopRegion, setIsLooping],
  )

  // Initialize demo content on load
  useEffect(() => {
    // Only initialize once
    if (demoInitialized.current) return

    // Create the demo content using the proper APIs
    const api = contentAPI()

    // Add a demo clip starting at bar 1
    api.addDefaultClip()

    // Set a loop region from bar 1 to 5
    api.setDemoLoop()

    // Mark as initialized
    demoInitialized.current = true

    console.log("Demo content initialized")
  }, [contentAPI])

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
