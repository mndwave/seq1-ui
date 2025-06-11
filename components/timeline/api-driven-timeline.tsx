"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import TimelineToolbar from "./timeline-toolbar"
import BarRuler from "./bar-ruler"
import TimelineContent from "./timeline-content"
import { useTimeline } from "@/hooks/use-timeline"
import { useTransport } from "@/hooks/use-transport"
import { getBalancedVibrantColors } from "@/lib/color-utils"
import { AnimatedEllipsis } from "@/components/animated-ellipsis"

interface ApiDrivenTimelineProps {
  onSectionSelect?: (sectionId: string) => void
  className?: string
  selectedDeviceId?: string | null
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
    const maxEndBar = sections.reduce((max, section) => {
      const endBar = (section.start + section.length) / BEATS_PER_BAR
      return Math.max(max, endBar)
    }, 0)
    const calculatedWidth = Math.max(totalBars, maxEndBar) * BAR_WIDTH
    setContentWidth(calculatedWidth)
  }, [sections, BAR_WIDTH, BEATS_PER_BAR, totalBars])

  // Handle section duplication
  const duplicateSection = useCallback(
    async (sectionId: string) => {
      if (!sectionId) return

      const sectionToDuplicate = sections.find((section) => section.id === sectionId)
      if (!sectionToDuplicate) return

      // Start the copy button animation
      setAnimatingButtons((prev) => ({
        ...prev,
        [sectionId]: { action: "copy", state: "grow" },
      }))

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
          setAnimatingButtons((prev) => ({
            ...prev,
            [sectionId]: undefined,
          }))
        } catch (error) {
          console.error("Failed to duplicate section:", error)
          setAnimatingButtons((prev) => ({
            ...prev,
            [sectionId]: undefined,
          }))
        }
      }, 300)
    },
    [sections, createClip, setSelectedSection],
  )

  // Handle section deletion
  const deleteSection = useCallback(
    async (sectionId: string) => {
      if (!sectionId) return

      // Start the delete button animation
      setAnimatingButtons((prev) => ({
        ...prev,
        [sectionId]: { action: "delete", state: "grow" },
      }))

      // Short delay to allow the button animation to play
      setTimeout(async () => {
        try {
          // Delete the section
          await deleteClip(sectionId)
          if (selectedSection === sectionId) {
            setSelectedSection(null)
          }
          // Reset the button animation
          setAnimatingButtons((prev) => ({
            ...prev,
            [sectionId]: undefined,
          }))
        } catch (error) {
          console.error("Failed to delete section:", error)
          setAnimatingButtons((prev) => ({
            ...prev,
            [sectionId]: undefined,
          }))
        }
      }, 300)
    },
    [deleteClip, selectedSection, setSelectedSection],
  )

  // Handle adding a new section
  const insertClipAfterSelectedOrAppend = useCallback(async () => {
    // Prevent multiple rapid clicks
    if (isAddingSection) return
    setIsAddingSection(true)

    // Start the add button animation
    setAnimatingButtons((prev) => ({
      ...prev,
      "add-button": { action: "add", state: "grow" },
    }))

    // Short delay to allow the button animation to play
    setTimeout(async () => {
      try {
        // Calculate the start position for the new section
        let startPosition = 0

        if (sections.length === 0) {
          // If no sections exist, start at bar 1 (beat 0 if 0-indexed, or beat 4 if 1-indexed bars)
          // Assuming start is 0-indexed beats:
          startPosition = 0
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
          `Clip ${(sections.length + 1).toString().padStart(2, "0")}`, // Changed "Section" to "Clip"
          startPosition,
          DEFAULT_SECTION_LENGTH * BEATS_PER_BAR,
          colors[0],
        )

        // Refresh clips from API to ensure we have the latest state
        // await fetchClips(); // useTimeline hook should update sections automatically

        // Select the newly created section
        setSelectedSection(newSection.id)

        // Reset the button animation
        setAnimatingButtons((prev) => ({
          ...prev,
          "add-button": undefined,
        }))

        // Scroll to the new section
        setTimeout(() => {
          if (timelineRef.current) {
            // Calculate new content width based on the potentially new section
            const maxEndBar = sections.concat(newSection).reduce((max, section) => {
              const endBar = (section.start + section.length) / BEATS_PER_BAR
              return Math.max(max, endBar)
            }, 0)
            const newContentWidth = Math.max(totalBars, maxEndBar) * BAR_WIDTH
            timelineRef.current.scrollLeft = newContentWidth - timelineRef.current.clientWidth + 100
          }

          // Reset the adding state after animation completes
          setTimeout(() => {
            setIsAddingSection(false)
          }, 200)
        }, 10)
      } catch (error) {
        console.error("Failed to create new section:", error)
        // Reset states
        setAnimatingButtons((prev) => ({
          ...prev,
          "add-button": undefined,
        }))
        setIsAddingSection(false)
      }
    }, 300)
  }, [
    isAddingSection,
    sections,
    selectedSection,
    createClip,
    setSelectedSection,
    BEATS_PER_BAR,
    DEFAULT_SECTION_LENGTH,
    BAR_WIDTH,
    totalBars,
  ])

  // Handle loop drag start
  const handleLoopDragStart = useCallback((bar: number) => {
    setDragStartBar(bar)
    setCurrentDragBar(bar)
    setIsDraggingLoop(true)
    setHasDraggedMeaningfully(false)
  }, [])

  // Handle loop drag
  const handleLoopDrag = useCallback(
    (bar: number) => {
      setCurrentDragBar(bar)

      // Check if we've dragged meaningfully
      if (dragStartBar !== null && Math.abs(bar - dragStartBar) >= DRAG_THRESHOLD) {
        setHasDraggedMeaningfully(true)
      }
    },
    [dragStartBar],
  )

  // Handle loop drag end
  const handleLoopDragEnd = useCallback(() => {
    // Only create a loop if we've dragged meaningfully
    if (hasDraggedMeaningfully && dragStartBar !== null && currentDragBar !== null) {
      const startBarValue = Math.min(dragStartBar, currentDragBar)
      const endBarValue = Math.max(dragStartBar, currentDragBar) + 1 // +1 to include the end bar

      // Set the loop region
      setLoopRegion({ startBar: startBarValue, endBar: endBarValue })

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
  }, [hasDraggedMeaningfully, dragStartBar, currentDragBar, setLoopRegion, onLoopChange])

  // Handle zoom
  const handleZoom = useCallback(
    (direction: "in" | "out") => {
      let newZoomLevel: number
      if (direction === "in") {
        newZoomLevel = zoomLevel + ZOOM_STEP
      } else {
        newZoomLevel = zoomLevel - ZOOM_STEP
      }
      newZoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoomLevel))
      if (!Number.isFinite(newZoomLevel)) {
        newZoomLevel = direction === "in" ? MIN_ZOOM + ZOOM_STEP : MAX_ZOOM - ZOOM_STEP
      }
      setZoomLevel(newZoomLevel)
    },
    [zoomLevel],
  )

  // Handle wheel for zooming
  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -1 : 1 // Invert the delta for more natural zoom
      let newZoomLevel = zoomLevel + delta * ZOOM_STEP
      newZoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoomLevel))
      if (!Number.isFinite(newZoomLevel)) {
        newZoomLevel = MIN_ZOOM
      }
      setZoomLevel(newZoomLevel)
    },
    [zoomLevel],
  )

  const handleSectionNameChange = useCallback(
    async (sectionId: string, newName: string) => {
      await updateClip(sectionId, { name: newName })
    },
    [updateClip],
  )

  return (
    <div
      className={cn("timeline-container bg-[#1a1015] border-t border-[#3a2a30] flex flex-col", className)}
      ref={timelineRef}
      onWheel={handleWheel}
      style={{ height: "auto" }} // The parent TimelineContainer controls height (e.g., h-20)
      role="region"
      aria-label="Timeline Editor"
    >
      {/* Timeline toolbar - always visible */}
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

      {/* Area below toolbar for status messages or timeline content */}
      <div
        className="timeline-body-area flex-1 flex flex-col items-center justify-center text-text-secondary overflow-hidden p-2"
        aria-live="polite"
      >
        {(isLoadingClips || isLoadingTransport) && (
          <div className="text-sm flex items-center">
            Accessing sequence data
            <AnimatedEllipsis />
          </div>
        )}
        {(clipsError || transportError) && !isLoadingClips && !isLoadingTransport && (
          <div className="text-sm text-red-500" role="alert">
            {clipsError || transportError || "Error accessing sequence. Please verify connection."}
          </div>
        )}
        {!isLoadingClips && !clipsError && sections.length === 0 && (
          <div className="text-center">
            <p className="text-md mb-1">Sequence is empty.</p>
            <p className="text-xs">Press '+' in the toolbar to lay down your first Clip.</p>
          </div>
        )}

        {!isLoadingClips && !isLoadingTransport && !clipsError && !transportError && sections.length > 0 && (
          // Scrollable content wrapper - takes full height of timeline-body-area if sections exist
          <div className="overflow-x-auto w-full h-full relative" aria-label="Timeline scrollable content">
            {/* Ghost playhead for hover */}
            {hoverBarPosition !== null && (
              <div
                className="absolute top-0 bottom-0 w-[1px] pointer-events-none z-30"
                style={{
                  left: `${hoverBarPosition * BAR_WIDTH}px`,
                  backgroundColor: "rgba(255, 255, 255, 0.25)",
                  height: "100%",
                }}
                aria-hidden="true"
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
              setSections={reorderClips} // Use reorderClips for DnD updates
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
              onSectionNameChange={handleSectionNameChange} // Pass name change handler
            />
          </div>
        )}
      </div>
    </div>
  )
}
