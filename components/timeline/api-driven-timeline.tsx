"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import type { LoopRegion } from "@/lib/timeline-clip-schema"
import TimelineToolbar from "./timeline-toolbar"
import BarRuler from "./bar-ruler"
import TimelineContent from "./timeline-content"
import { useTimeline } from "@/hooks/use-timeline"
import { useTransport } from "@/hooks/use-transport"
import { getBalancedVibrantColors } from "@/lib/color-utils"

interface ApiDrivenTimelineProps {
  onSectionSelect?: (sectionId: string) => void
  isPlaying?: boolean
  className?: string
  selectedDeviceId?: string | null
  loopRegion?: LoopRegion | null
  setLoopRegion?: (loopRegion: LoopRegion | null) => void
  isLooping?: boolean
  onLoopChange?: (isLooping: boolean) => void
}

export default function ApiDrivenTimeline({
  onSectionSelect,
  className = "",
  selectedDeviceId,
  onLoopChange,
}: ApiDrivenTimelineProps) {
  // Use our custom hooks to manage timeline data and transport state
  const {
    clips: sections,
    isLoading: isLoadingClips,
    error: clipsError,
    selectedClipId: selectedSection,
    setSelectedClipId: setSelectedSection,
    createClip,
    updateClip,
    deleteClip,
    reorderClips,
    fetchClips,
  } = useTimeline()

  const {
    transportState,
    isLoading: isLoadingTransport,
    error: transportError,
    togglePlayback,
    seekPlayhead,
    toggleLooping,
    setLoopRegion,
  } = useTransport()

  // Destructure transport state
  const { playheadPosition, isPlaying, isLooping, loopRegion } = transportState

  // State for UI
  const [zoomLevel, setZoomLevel] = useState(0.518)
  const [totalBars, setTotalBars] = useState(999)
  const [usedColorMap, setUsedColorMap] = useState<Record<string, number>>({})
  const [animatingButtons, setAnimatingButtons] = useState({})
  const [isAddingSection, setIsAddingSection] = useState(false)
  const [hoverBarPosition, setHoverBarPosition] = useState<number | null>(null)
  const [isDraggingLoop, setIsDraggingLoop] = useState(false)
  const [dragStartBar, setDragStartBar] = useState<number | null>(null)
  const [currentDragBar, setCurrentDragBar] = useState<number | null>(null)
  const [hasDraggedMeaningfully, setHasDraggedMeaningfully] = useState(false)
  const [contentWidth, setContentWidth] = useState(0)

  // Refs
  const timelineRef = useRef<HTMLDivElement>(null)

  // Constants
  const BASE_BAR_WIDTH = 64
  const MIN_ZOOM = 0.1
  const MAX_ZOOM = 2
  const ZOOM_STEP = 0.05
  const MIN_ZOOM_FOR_CONTROLS = 0.5
  const MIN_ZOOM_FOR_DRAG_HANDLE = 0.24
  const DEFAULT_SECTION_LENGTH = 4
  const BEATS_PER_BAR = 4
  const DRAG_THRESHOLD = 1

  // Calculate actual bar width based on zoom level
  const BAR_WIDTH = BASE_BAR_WIDTH * zoomLevel

  // Check if zoom level is high enough to show different controls
  const showControls = zoomLevel >= MIN_ZOOM_FOR_CONTROLS
  const showDragHandle = zoomLevel >= MIN_ZOOM_FOR_DRAG_HANDLE

  // Update color map when sections change
  useEffect(() => {
    if (sections.length > 0) {
      const colorMap: Record<string, number> = {}
      sections.forEach((section) => {
        if (section.color) {
          colorMap[section.color] = (colorMap[section.color] || 0) + 1
        }
      })
      setUsedColorMap(colorMap)
    }

    // Calculate content width based on sections
    const width =
      (sections.reduce((total, section) => Math.max(total, section.start + section.length), 0) / BEATS_PER_BAR) *
      BAR_WIDTH
    setContentWidth(width)
  }, [sections, BAR_WIDTH, BEATS_PER_BAR])

  // Handle section duplication
  const duplicateSection = async (sectionId: string) => {
    if (!sectionId) return

    const sectionToDuplicate = sections.find((section) => section.id === sectionId)
    if (!sectionToDuplicate) return

    // Start the copy button animation
    setAnimatingButtons({
      ...animatingButtons,
      [sectionId]: { action: "copy", state: "grow" },
    })

    // Short delay to allow the button animation to play
    setTimeout(async () => {
      try {
        // Create a new section with the same properties
        const newSection = await createClip(
          `${sectionToDuplicate.name} (copy)`,
          sectionToDuplicate.start + sectionToDuplicate.length, // Position after the original
          sectionToDuplicate.length,
          sectionToDuplicate.color,
        )

        // Select the new section
        setSelectedSection(newSection.id)

        // Reset the button animation
        setAnimatingButtons({
          ...animatingButtons,
          [sectionId]: undefined,
        })
      } catch (error) {
        console.error("Failed to duplicate section:", error)
      }
    }, 300)
  }

  // Handle section deletion
  const deleteSection = async (sectionId: string) => {
    if (!sectionId) return

    // Start the delete button animation
    setAnimatingButtons({
      ...animatingButtons,
      [sectionId]: { action: "delete", state: "grow" },
    })

    // Short delay to allow the button animation to play
    setTimeout(async () => {
      try {
        // Delete the section
        await deleteClip(sectionId)

        // Reset the button animation
        setAnimatingButtons({
          ...animatingButtons,
          [sectionId]: undefined,
        })
      } catch (error) {
        console.error("Failed to delete section:", error)
      }
    }, 300)
  }

  // Handle adding a new section
  const insertClipAfterSelectedOrAppend = async () => {
    // Prevent multiple rapid clicks
    if (isAddingSection) return
    setIsAddingSection(true)

    // Start the add button animation
    setAnimatingButtons({
      ...animatingButtons,
      "add-button": { action: "add", state: "grow" },
    })

    // Short delay to allow the button animation to play
    setTimeout(async () => {
      try {
        // Calculate the start position for the new section
        let startPosition = 0

        if (sections.length === 0) {
          // If no sections exist, start at bar 1 (beat 4)
          startPosition = 4
        } else if (selectedSection) {
          // If a section is selected, add after it
          const selectedSectionData = sections.find((s) => s.id === selectedSection)
          if (selectedSectionData) {
            startPosition = selectedSectionData.start + selectedSectionData.length
          } else {
            // If selected section not found, add after the last section
            const lastSection = [...sections].sort((a, b) => a.start + a.length - (b.start + b.length)).pop()
            if (lastSection) {
              startPosition = lastSection.start + lastSection.length
            }
          }
        } else {
          // If no section is selected, add after the last section
          const lastSection = [...sections].sort((a, b) => a.start + a.length - (b.start + b.length)).pop()
          if (lastSection) {
            startPosition = lastSection.start + lastSection.length
          }
        }

        // Get a balanced set of colors
        const colors = getBalancedVibrantColors(1)

        // Create the new section
        const newSection = await createClip(
          `Section ${(sections.length + 1).toString().padStart(2, "0")}`,
          startPosition,
          DEFAULT_SECTION_LENGTH * BEATS_PER_BAR,
          colors[0],
        )

        // Refresh clips from API to ensure we have the latest state
        await fetchClips()

        // Select the newly created section
        setSelectedSection(newSection.id)

        // Reset the button animation
        setAnimatingButtons({
          ...animatingButtons,
          "add-button": undefined,
        })

        // Scroll to the new section
        setTimeout(() => {
          if (timelineRef.current) {
            timelineRef.current.scrollLeft = contentWidth - timelineRef.current.clientWidth + 100
          }

          // Reset the adding state after animation completes
          setTimeout(() => {
            setIsAddingSection(false)
          }, 200)
        }, 10)
      } catch (error) {
        console.error("Failed to create new section:", error)
        // Reset states
        setAnimatingButtons({
          ...animatingButtons,
          "add-button": undefined,
        })
        setIsAddingSection(false)
      }
    }, 300)
  }

  // Handle loop drag start
  const handleLoopDragStart = (bar: number) => {
    setDragStartBar(bar)
    setCurrentDragBar(bar)
    setIsDraggingLoop(true)
    setHasDraggedMeaningfully(false)
  }

  // Handle loop drag
  const handleLoopDrag = (bar: number) => {
    setCurrentDragBar(bar)

    // Check if we've dragged meaningfully
    if (dragStartBar !== null && Math.abs(bar - dragStartBar) >= DRAG_THRESHOLD) {
      setHasDraggedMeaningfully(true)
    }
  }

  // Handle loop drag end
  const handleLoopDragEnd = () => {
    // Only create a loop if we've dragged meaningfully
    if (hasDraggedMeaningfully && dragStartBar !== null && currentDragBar !== null) {
      const startBar = Math.min(dragStartBar, currentDragBar)
      const endBar = Math.max(dragStartBar, currentDragBar) + 1 // +1 to include the end bar

      // Set the loop region
      setLoopRegion({ startBar, endBar })

      // Enable looping if we have an onLoopChange handler
      if (onLoopChange) {
        onLoopChange(true)
      }
    }

    // Reset drag state
    setIsDraggingLoop(false)
    setDragStartBar(null)
    setCurrentDragBar(null)
    setHasDraggedMeaningfully(false)
  }

  // Handle zoom
  const handleZoom = (amount: number) => {
    const newZoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomLevel + amount))
    setZoomLevel(newZoomLevel)
  }

  // Handle wheel for zooming
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -1 : 1 // Invert the delta for more natural zoom
    handleZoom(delta * ZOOM_STEP)
  }

  // Show loading state
  if (isLoadingClips || isLoadingTransport) {
    return (
      <div
        className={cn(
          "timeline-container bg-[#1a1015] border-t border-[#3a2a30] flex items-center justify-center",
          className,
        )}
      >
        <div className="text-white opacity-70">Loading timeline...</div>
      </div>
    )
  }

  // Show error state
  if (clipsError || transportError) {
    return (
      <div
        className={cn(
          "timeline-container bg-[#1a1015] border-t border-[#3a2a30] flex items-center justify-center",
          className,
        )}
      >
        <div className="text-red-400">{clipsError || transportError}</div>
      </div>
    )
  }

  return (
    <div
      className={cn("timeline-container bg-[#1a1015] border-t border-[#3a2a30] flex flex-col", className)}
      ref={timelineRef}
      onWheel={handleWheel}
      style={{ height: "auto" }}
    >
      {/* Timeline toolbar - top row */}
      <TimelineToolbar
        zoomLevel={zoomLevel}
        handleZoom={handleZoom}
        duplicateSection={(sectionId) => sectionId && duplicateSection(sectionId)}
        deleteSection={(sectionId) => sectionId && deleteSection(sectionId)}
        createNewSection={insertClipAfterSelectedOrAppend}
        animatingButtons={animatingButtons}
        selectedSection={selectedSection}
        isAddingSection={isAddingSection}
        isPlaying={isPlaying}
        togglePlayback={togglePlayback}
        isLooping={isLooping}
        toggleLooping={toggleLooping}
      />

      {/* Scrollable content wrapper */}
      <div className="overflow-x-auto flex-1 h-full relative" style={{ minWidth: "100%" }}>
        {/* Ghost playhead for hover */}
        {hoverBarPosition !== null && (
          <div
            className="absolute top-0 bottom-0 w-[1px] pointer-events-none z-30"
            style={{
              left: `${hoverBarPosition * BAR_WIDTH}px`,
              backgroundColor: "rgba(255, 255, 255, 0.25)",
              height: "100%",
            }}
          />
        )}

        {/* Bar ruler - middle row */}
        <BarRuler
          totalBars={totalBars}
          totalWidth={contentWidth}
          barWidth={BAR_WIDTH}
          timelineRef={timelineRef}
          setPlayheadPosition={seekPlayhead}
          isPlaying={isPlaying}
          onHoverBarChange={setHoverBarPosition}
          loopRegion={loopRegion}
          setLoopRegion={setLoopRegion}
          isDraggingLoop={isDraggingLoop}
          dragStartBar={dragStartBar}
          currentDragBar={currentDragBar}
          onLoopDragStart={handleLoopDragStart}
          onLoopDrag={handleLoopDrag}
          onLoopDragEnd={handleLoopDragEnd}
        />

        {/* Timeline content - bottom row with fixed height */}
        <TimelineContent
          sections={sections}
          setSections={() => {}} // This is now handled by the API
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
          barWidth={BAR_WIDTH}
          totalBars={totalBars}
          isPlaying={isPlaying}
          playheadPosition={playheadPosition}
          showDragHandle={showDragHandle}
          showControls={showControls}
          animatingButtons={animatingButtons}
          setAnimatingButtons={setAnimatingButtons}
          onSectionSelect={onSectionSelect}
          usedColorMap={usedColorMap}
          setUsedColorMap={setUsedColorMap}
          timelineRef={timelineRef}
          duplicateSection={duplicateSection}
          deleteSection={deleteSection}
        />
      </div>
    </div>
  )
}
