"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { TimelineClip, LoopRegion } from "@/lib/timeline-clip-schema"
import type { ButtonAnimationState } from "./timeline-types"
import TimelineToolbar from "./timeline-toolbar"
import BarRuler from "./bar-ruler"
import TimelineContent from "./timeline-content"
import { useSensors, useSensor, PointerSensor } from "@dnd-kit/core"
import { generateDistinctColor, getBalancedVibrantColors } from "@/lib/color-utils"
import { createClip } from "./timeline/timeline-utils"

interface TimelineProps {
  onSectionSelect?: (sectionId: string) => void
  isPlaying?: boolean
  className?: string
  selectedDeviceId?: string | null
  initialSections?: TimelineClip[]
  loopRegion: LoopRegion | null
  setLoopRegion: (loopRegion: LoopRegion | null) => void
  isLooping?: boolean
  onLoopChange?: (isLooping: boolean) => void
  onLoopDragEnd?: (shouldCreateLoop: boolean, startBar?: number, endBar?: number) => void
  contentAPI?: {
    addClip: (startBar: number, lengthInBars?: number, name?: string, color?: string) => string
    addDefaultClip: () => string
    setDemoLoop: () => void
    clearContent: () => void
  }
}

export default function Timeline({
  onSectionSelect,
  isPlaying = false,
  className = "",
  selectedDeviceId,
  initialSections = [],
  loopRegion,
  setLoopRegion,
  isLooping = false,
  onLoopChange,
  onLoopDragEnd,
  contentAPI,
}: TimelineProps) {
  // State for sections - initialize with initialSections if provided
  const [sections, setSections] = useState<TimelineClip[]>(initialSections)
  const [playheadPosition, setPlayheadPosition] = useState(0)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(0.518) // Start at 22% zoom as requested by user
  const [totalBars, setTotalBars] = useState(999) // Increased to 999 bars (much higher than needed)
  // Track which colors have been used
  const [usedColorMap, setUsedColorMap] = useState<Record<string, number>>({})
  // Track button animations
  const [animatingButtons, setAnimatingButtons] = useState<ButtonAnimationState>({})
  // Track the actual content width
  const [contentWidth, setContentWidth] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  // Track if we're currently adding a section
  const [isAddingSection, setIsAddingSection] = useState(false)
  const [pendingPlayheadPosition, setPendingPlayheadPosition] = useState<number | null>(null)
  const [ghostPlayheadPosition, setGhostPlayheadPosition] = useState<number | null>(null)
  // New state for tracking hovered bar position
  const [hoverBarPosition, setHoverBarPosition] = useState<number | null>(null)

  // Track if we're in a potential drag state (mouse down but not yet confirmed as a drag)
  const [isPotentialDrag, setIsPotentialDrag] = useState(false)
  // Only set isDraggingLoop to true after we've confirmed a real drag
  const [isDraggingLoop, setIsDraggingLoop] = useState(false)
  const [dragStartBar, setDragStartBar] = useState<number | null>(null)
  const [currentDragBar, setCurrentDragBar] = useState<number | null>(null)
  // Track if a meaningful drag has occurred
  const [hasDraggedMeaningfully, setHasDraggedMeaningfully] = useState(false)

  // Refs
  const timelineRef = useRef<HTMLDivElement>(null)
  const playheadAnimationRef = useRef<number | null>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const timelineContentWrapperRef = useRef<HTMLDivElement>(null)

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  // Constants
  const BASE_BAR_WIDTH = 64 // Base width of one bar in pixels
  const MIN_ZOOM = 0.1 // Minimum zoom level (most zoomed out)
  const MAX_ZOOM = 2 // Maximum zoom level (most zoomed in)
  const ZOOM_STEP = 0.05 // Smaller zoom step size for finer control
  const MIN_ZOOM_FOR_CONTROLS = 0.5 // Minimum zoom level to show copy/delete icons (50%)
  const MIN_ZOOM_FOR_DRAG_HANDLE = 0.24 // Minimum zoom level to show drag handle (24%)
  const DEFAULT_SECTION_LENGTH = 4 // Default section length is 4 bars (in beats)
  const BEATS_PER_BAR = 4 // 4 beats per bar
  const DRAG_THRESHOLD = 1 // Minimum number of bars to move before considering it a drag

  // Calculate actual bar width based on zoom level
  const BAR_WIDTH = BASE_BAR_WIDTH * zoomLevel

  // Check if zoom level is high enough to show different controls
  const showControls = zoomLevel >= MIN_ZOOM_FOR_CONTROLS
  const showDragHandle = zoomLevel >= MIN_ZOOM_FOR_DRAG_HANDLE

  // Update sections when initialSections changes
  useEffect(() => {
    if (initialSections.length > 0) {
      // Get a balanced set of vibrant colors for all sections
      const vibrantColors = getBalancedVibrantColors(initialSections.length)

      // Assign vibrant colors to sections if they don't already have colors
      const sectionsWithColors = initialSections.map((section, index) => {
        return {
          ...section,
          color: section.color || vibrantColors[index % vibrantColors.length],
        }
      })

      // Track colors used by initial sections
      const initialColorMap: Record<string, number> = {}
      sectionsWithColors.forEach((section) => {
        if (section.color) {
          initialColorMap[section.color] = (initialColorMap[section.color] || 0) + 1
        }
      })

      setUsedColorMap(initialColorMap)
      setSections(sectionsWithColors)
    }
  }, [initialSections])

  // Handle name change for a section
  const handleSectionNameChange = async (sectionId: string, newName: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    console.log(`API: Updated section ${sectionId} name to ${newName}`)

    // Update local state
    setSections(sections.map((section) => (section.id === sectionId ? { ...section, name: newName } : section)))
  }

  // Get a unique color for a new section
  const getUniqueColor = (): string => {
    // Get all existing colors from sections
    const existingColors = sections.map((section) => section.color).filter(Boolean) as string[]

    // Generate a new vibrant color that's distinct from existing ones
    return generateDistinctColor(existingColors)
  }

  const insertClipAfterSelectedOrAppend = () => {
    // If contentAPI is available, use it to add a clip
    if (contentAPI) {
      // Determine where to add the clip
      let startBar = 1 // Default to bar 1

      // If a section is selected, add after it
      if (selectedSection) {
        const selectedSectionData = sections.find((s) => s.id === selectedSection)
        if (selectedSectionData) {
          // Calculate the end bar of the selected section
          const endBar = Math.ceil((selectedSectionData.start + selectedSectionData.length) / BEATS_PER_BAR)
          startBar = endBar
        }
      } else if (sections.length > 0) {
        // If no section is selected but sections exist, add after the last one
        const lastSection = sections[sections.length - 1]
        const endBar = Math.ceil((lastSection.start + lastSection.length) / BEATS_PER_BAR)
        startBar = endBar
      }

      // Add the clip using the contentAPI
      const newClipId = contentAPI.addClip(startBar, DEFAULT_SECTION_LENGTH)

      // Select the newly added clip
      setSelectedSection(newClipId)

      return
    }

    // Fallback to the original implementation if contentAPI is not available
    // Prevent multiple rapid clicks
    if (isAddingSection) return
    setIsAddingSection(true)

    // Start the add button animation - use a special key for the add button
    setAnimatingButtons({
      ...animatingButtons,
      "add-button": { action: "add", state: "grow" },
    })

    // Short delay to allow the button animation to play - matching the copy button timing
    setTimeout(() => {
      // Get a unique color for this section
      const newColor = getUniqueColor()

      const newSection: TimelineClip = {
        id: `section-${Date.now()}`,
        name: `Section ${(sections.length + 1).toString().padStart(2, "0")}`,
        start: 0,
        length: DEFAULT_SECTION_LENGTH * BEATS_PER_BAR, // Default length is 4 bars (16 beats)
        color: newColor,
      }

      // If a section is selected, insert after it; otherwise, append to the end
      if (selectedSection) {
        const selectedIndex = sections.findIndex((section) => section.id === selectedSection)
        if (selectedIndex !== -1) {
          const newSections = [...sections]
          newSections.splice(selectedIndex + 1, 0, newSection)
          setSections(newSections)

          // Select the newly inserted section
          setSelectedSection(newSection.id)
        } else {
          // Fallback to append if selected section not found
          setSections([...sections, newSection])
        }
      } else {
        // No selection, append to the end
        setSections([...sections, newSection])
      }

      // Reset the button animation
      setAnimatingButtons({
        ...animatingButtons,
        "add-button": undefined,
      })

      // Scroll to the new section
      setTimeout(() => {
        if (timelineRef.current) {
          const totalWidth =
            sections.reduce((total, section) => total + (section.length / BEATS_PER_BAR) * barWidth, 0) +
            DEFAULT_SECTION_LENGTH * barWidth
          timelineRef.current.scrollLeft = totalWidth - timelineRef.current.clientWidth + 50
        }

        // Reset the adding state after animation completes - use a shorter time
        setTimeout(() => {
          setIsAddingSection(false)
        }, 200) // Match animation duration plus a small buffer
      }, 10)
    }, 300) // Delay to match the copy button animation timing
  }

  const duplicateSection = (sectionId: string) => {
    if (!sectionId) return

    const sectionToDuplicate = sections.find((section) => section.id === sectionId)
    if (!sectionToDuplicate) return

    // Start the copy button animation
    setAnimatingButtons({
      ...animatingButtons,
      [sectionId]: { action: "copy", state: "grow" },
    })

    // Short delay to allow the button animation to play
    setTimeout(() => {
      // Create a new section with the same properties but a new ID and a new color
      const newSection = createClip({
        ...sectionToDuplicate,
        id: `section-${Date.now()}`,
        name: `${sectionToDuplicate.name} (copy)`, // Append "(copy)" to the name
        length: sectionToDuplicate.length,
        color: sectionToDuplicate.color, // Keep the same color
      })

      // Add the new section after the original
      const index = sections.findIndex((section) => section.id === sectionId)
      const newSections = [...sections]
      if (index !== -1) {
        newSections.splice(index + 1, 0, newSection)
        setSections(newSections)
      }

      // Reset the button animation
      setAnimatingButtons({
        ...animatingButtons,
        [sectionId]: undefined,
      })

      // Select the new section
      setSelectedSection(newSection.id)

      // Update the color map
      setUsedColorMap((prev) => ({
        ...prev,
        [newSection.color]: (prev[newSection.color] || 0) + 1,
      }))
    }, 300) // Delay to match the button animation
  }

  const deleteSection = (sectionId: string) => {
    if (!sectionId) return

    // Start the delete button animation
    setAnimatingButtons({
      ...animatingButtons,
      [sectionId]: { action: "delete", state: "grow" },
    })

    // Get the section to delete
    const sectionToDelete = sections.find((section) => section.id === sectionId)

    // Short delay to allow the button animation to play
    setTimeout(() => {
      // Remove the section
      const newSections = sections.filter((section) => section.id !== sectionId)
      setSections(newSections)

      // If the deleted section was selected, clear selection
      if (selectedSection === sectionId) {
        setSelectedSection(null)
      }

      // Reset the button animation
      setAnimatingButtons({
        ...animatingButtons,
        [sectionId]: undefined,
      })

      // Decrement the usage count for this color
      if (sectionToDelete?.color) {
        setUsedColorMap((prev) => ({
          ...prev,
          [sectionToDelete.color!]: Math.max(0, (prev[sectionToDelete.color!] || 0) - 1),
        }))
      }
    }, 300) // Delay to match the button animation
  }

  // Randomize all section colors with vibrant neon colors
  const randomizeAllColors = () => {
    const newSections = [...sections]

    // Get a balanced set of vibrant colors
    const vibrantColors = getBalancedVibrantColors(newSections.length)

    // Assign new colors to each section
    for (let i = 0; i < newSections.length; i++) {
      newSections[i] = {
        ...newSections[i],
        color: vibrantColors[i],
      }
    }

    // Update the sections with new colors
    setSections(newSections)

    // Update the used color map
    const newColorMap: Record<string, number> = {}
    vibrantColors.forEach((color) => {
      newColorMap[color] = (newColorMap[color] || 0) + 1
    })
    setUsedColorMap(newColorMap)
  }

  // Add this after the other useEffect blocks
  const handleHoverBarChange = (barPosition: number | null) => {
    setHoverBarPosition(barPosition)
  }

  // Handle loop drag start
  const handleLoopDragStart = (bar: number) => {
    setDragStartBar(bar)
    setCurrentDragBar(bar)
    setIsDraggingLoop(true)
    setHasDraggedMeaningfully(false)
    console.log(`Loop drag start at bar ${bar}`)
  }

  // Handle loop drag
  const handleLoopDrag = (bar: number) => {
    setCurrentDragBar(bar)

    // Check if we've dragged meaningfully
    if (dragStartBar !== null && Math.abs(bar - dragStartBar) >= DRAG_THRESHOLD) {
      setHasDraggedMeaningfully(true)
    }

    console.log(`Loop drag to bar ${bar}`)
  }

  // Handle loop drag end
  const handleLoopDragEnd = () => {
    console.log(`Loop drag end, meaningful: ${hasDraggedMeaningfully}`)

    // Only create a loop if we've dragged meaningfully
    if (hasDraggedMeaningfully && dragStartBar !== null && currentDragBar !== null) {
      const startBar = Math.min(dragStartBar, currentDragBar)
      const endBar = Math.max(dragStartBar, currentDragBar) + 1 // +1 to include the end bar

      // Call the parent's onLoopDragEnd if available
      if (onLoopDragEnd) {
        onLoopDragEnd(true, startBar, endBar)
      } else {
        // Fallback to direct setLoopRegion if onLoopDragEnd is not available
        setLoopRegion({ startBar, endBar })
      }

      // Enable looping if we have an onLoopChange handler
      if (onLoopChange) {
        onLoopChange(true)
      }
    } else if (onLoopDragEnd) {
      // If the drag wasn't meaningful, call onLoopDragEnd with shouldCreateLoop=false
      onLoopDragEnd(false)
    }

    // Reset drag state
    setIsDraggingLoop(false)
    setDragStartBar(null)
    setCurrentDragBar(null)
    setHasDraggedMeaningfully(false)
  }

  useEffect(() => {
    // This is just for debugging - can be removed after verification
    if (selectedSection) {
      console.log(`Selected section changed to: ${selectedSection}`)
    }
  }, [selectedSection])

  const barWidth = BAR_WIDTH
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false)

  // Define handleWheel and handleZoom functions
  const handleZoomFn = (amount: number) => {
    const newZoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomLevel + amount))
    setZoomLevel(newZoomLevel)
  }

  const handleWheelFn = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -1 : 1 // Invert the delta for more natural zoom
    handleZoomFn(delta * ZOOM_STEP)
  }

  return (
    <div
      className={cn(
        "timeline-container bg-[#1a1015] border-t border-[#3a2a30] flex flex-col",
        className,
        isDraggingTimeline ? "dragging-cursor" : "",
      )}
      ref={timelineRef}
      onWheel={handleWheelFn}
      style={{ height: "auto" }}
    >
      {/* Timeline toolbar - top row */}
      <TimelineToolbar
        zoomLevel={zoomLevel}
        handleZoom={handleZoomFn}
        duplicateSection={(sectionId) => sectionId && duplicateSection(sectionId)}
        deleteSection={(sectionId) => sectionId && deleteSection(sectionId)}
        createNewSection={insertClipAfterSelectedOrAppend}
        animatingButtons={animatingButtons}
        selectedSection={selectedSection}
        isAddingSection={isAddingSection}
      />

      {/* Scrollable content wrapper */}
      <div
        className="overflow-x-auto flex-1 h-full relative"
        style={{ minWidth: "100%" }}
        ref={timelineContentWrapperRef}
      >
        {/* Extended ghost playhead that spans both BarRuler and TimelineContent */}
        {hoverBarPosition !== null && (
          <div
            className="absolute top-0 bottom-0 w-[1px] pointer-events-none z-30"
            style={{
              left: `${hoverBarPosition * barWidth}px`,
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
          setPlayheadPosition={setPlayheadPosition}
          isPlaying={isPlaying}
          onHoverBarChange={handleHoverBarChange}
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
          setSections={setSections}
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
