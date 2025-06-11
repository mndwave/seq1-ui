"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import type { TimelineClip, LoopRegion } from "@/lib/timeline-clip-schema"
import type { ButtonAnimationState } from "./timeline-types"
import TimelineToolbar from "./timeline-toolbar"
import BarRuler from "./bar-ruler"
import TimelineContent from "./timeline-content"
import { useSensors, useSensor, PointerSensor } from "@dnd-kit/core"
import { generateDistinctColor, getBalancedVibrantColors } from "@/lib/color-utils"
import { getTimelineClips, createTimelineClip, updateTimelineClip, deleteTimelineClip } from "@/lib/api/timeline-api"
import { AnimatedEllipsis } from "@/components/animated-ellipsis"

interface TimelineProps {
  onSectionSelect?: (sectionId: string) => void
  isPlaying?: boolean
  className?: string
  selectedDeviceId?: string | null
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
  loopRegion,
  setLoopRegion,
  isLooping = false,
  onLoopChange,
  onLoopDragEnd,
  contentAPI,
}: TimelineProps) {
  // State for sections - initialize with initialSections if provided
  const [sections, setSections] = useState<TimelineClip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

  // ADD: Fixed width state that doesn't change after initial load
  const [fixedTimelineWidth, setFixedTimelineWidth] = useState<number | null>(null)
  const [initialWidthSet, setInitialWidthSet] = useState(false)

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
  
  // ADD: Calculate the "empty state" width - this should be the consistent width
  const EMPTY_STATE_WIDTH = 800 // Fixed width when timeline shows "sequence is empty"

  // Calculate actual bar width based on zoom level
  const BAR_WIDTH = BASE_BAR_WIDTH * zoomLevel

  // Check if zoom level is high enough to show different controls
  const showControls = zoomLevel >= MIN_ZOOM_FOR_CONTROLS
  const showDragHandle = zoomLevel >= MIN_ZOOM_FOR_DRAG_HANDLE

  // Update sections when initialSections changes
  useEffect(() => {
    const fetchClips = async () => {
      try {
        setIsLoading(true)
        const clips = await getTimelineClips()
        setSections(clips)
        setError(null)
      } catch (err: any) {
        console.error("Failed to fetch timeline clips:", err)
        let specificMessage = "Sequence data unavailable. Check connection or refresh."
        if (err.message) {
          if (
            err.message.toLowerCase().includes("invalid json") ||
            err.message.toLowerCase().includes("unexpected token") ||
            err.message.toLowerCase().includes("failed to parse")
          ) {
            specificMessage =
              "Sequence data is currently unreadable. This might be a temporary server issue. Please try refreshing. If the problem persists, consider checking server logs or contacting support."
          } else if (err.message.toLowerCase().includes("failed to fetch")) {
            specificMessage =
              "Could not connect to the server to get sequence data. Please check your internet connection and try again."
          } else if (err.status === 401 || err.status === 403) {
            specificMessage =
              "Access to sequence data denied. Please ensure you are logged in with appropriate permissions."
          } else if (err.status) {
            specificMessage = `Error fetching sequence data (Status: ${err.status}). Please try again.`
          }
        }
        setError(specificMessage)
        setSections([]) // Ensure sections are empty on error
      } finally {
        setIsLoading(false)
      }
    }

    fetchClips()
  }, [])

  // Handle name change for a section
  const handleSectionNameChange = useCallback(async (sectionId: string, newName: string) => {
    try {
      // Update local state immediately for a responsive UI
      setSections((prevSections) =>
        prevSections.map((section) => (section.id === sectionId ? { ...section, name: newName } : section)),
      )

      // Call the API to persist the change
      await updateTimelineClip(sectionId, { name: newName })

      console.log(`Updated section ${sectionId} name to ${newName}`)
    } catch (error) {
      console.error(`Failed to update section ${sectionId} name:`, error)
      // Optionally revert the local state if the API call fails
      // For now, we'll keep the optimistic update.
    }
  }, []) // sections dependency removed for optimistic update

  // Get a unique color for a new section
  const getUniqueColor = useCallback((): string => {
    // Get all existing colors from sections
    const existingColors = sections.map((section) => section.color).filter(Boolean) as string[]

    // Generate a new vibrant color that's distinct from existing ones
    return generateDistinctColor(existingColors)
  }, [sections])

  const insertClipAfterSelectedOrAppend = useCallback(async () => {
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
        // Get a unique color for this section
        const newColor = getUniqueColor()

        // Calculate the start position for the new section
        let startPosition = 0
        if (selectedSection) {
          const selectedSectionData = sections.find((s) => s.id === selectedSection)
          if (selectedSectionData) {
            startPosition = selectedSectionData.start + selectedSectionData.length
          }
        } else if (sections.length > 0) {
          const lastSection = sections[sections.length - 1]
          startPosition = lastSection.start + lastSection.length
        }

        // Create the new section data
        const newSectionData = {
          name: `Clip ${(sections.length + 1).toString().padStart(2, "0")}`, // Changed "Section" to "Clip"
          start: startPosition,
          length: DEFAULT_SECTION_LENGTH * BEATS_PER_BAR,
          color: newColor,
        }

        // Call the API to create the new section
        const newSection = await createTimelineClip(newSectionData)

        // Add the new section to the local state
        setSections((prevSections) => [...prevSections, newSection])

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
            const totalWidth =
              sections.reduce((total, section) => total + (section.length / BEATS_PER_BAR) * BAR_WIDTH, 0) +
              DEFAULT_SECTION_LENGTH * BAR_WIDTH
            timelineRef.current.scrollLeft = totalWidth - timelineRef.current.clientWidth + 50
          }

          // Reset the adding state after animation completes
          setTimeout(() => {
            setIsAddingSection(false)
          }, 200)
        }, 10)
      } catch (error) {
        console.error("Failed to create new section:", error)
        // Reset the button animation and adding state
        setAnimatingButtons((prev) => ({
          ...prev,
          "add-button": undefined,
        }))
        setIsAddingSection(false)
      }
    }, 300)
  }, [
    contentAPI,
    selectedSection,
    sections,
    isAddingSection,
    getUniqueColor,
    BAR_WIDTH,
    BEATS_PER_BAR,
    DEFAULT_SECTION_LENGTH,
  ])

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
          // Create a new section with the same properties but without an ID
          const newSectionData = {
            name: `${sectionToDuplicate.name} (copy)`,
            start: sectionToDuplicate.start + sectionToDuplicate.length, // Position after the original
            length: sectionToDuplicate.length,
            color: sectionToDuplicate.color,
          }

          // Call the API to create the new section
          const newSection = await createTimelineClip(newSectionData)

          // Add the new section to the local state
          setSections((prevSections) => [...prevSections, newSection])

          // Reset the button animation
          setAnimatingButtons((prev) => ({
            ...prev,
            [sectionId]: undefined,
          }))

          // Select the new section
          setSelectedSection(newSection.id)

          // Update the color map
          setUsedColorMap((prev) => ({
            ...prev,
            [newSection.color]: (prev[newSection.color] || 0) + 1,
          }))
        } catch (error) {
          console.error("Failed to duplicate section:", error)
          // Reset the button animation
          setAnimatingButtons((prev) => ({
            ...prev,
            [sectionId]: undefined,
          }))
        }
      }, 300)
    },
    [sections],
  ) // animatingButtons removed as it's set inside

  const deleteSection = useCallback(
    async (sectionId: string) => {
      if (!sectionId) return

      // Start the delete button animation
      setAnimatingButtons((prev) => ({
        ...prev,
        [sectionId]: { action: "delete", state: "grow" },
      }))

      // Get the section to delete
      const sectionToDelete = sections.find((section) => section.id === sectionId)

      // Short delay to allow the button animation to play
      setTimeout(async () => {
        try {
          // Call the API to delete the section
          await deleteTimelineClip(sectionId)

          // Remove the section from local state
          setSections((prevSections) => prevSections.filter((section) => section.id !== sectionId))

          // If the deleted section was selected, clear selection
          if (selectedSection === sectionId) {
            setSelectedSection(null)
          }

          // Reset the button animation
          setAnimatingButtons((prev) => ({
            ...prev,
            [sectionId]: undefined,
          }))

          // Decrement the usage count for this color
          if (sectionToDelete?.color) {
            setUsedColorMap((prev) => ({
              ...prev,
              [sectionToDelete.color!]: Math.max(0, (prev[sectionToDelete.color!] || 0) - 1),
            }))
          }
        } catch (error) {
          console.error("Failed to delete section:", error)
          // Reset the button animation
          setAnimatingButtons((prev) => ({
            ...prev,
            [sectionId]: undefined,
          }))
        }
      }, 300)
    },
    [sections, selectedSection],
  ) // animatingButtons removed

  // Randomize all section colors with vibrant neon colors
  const randomizeAllColors = useCallback(() => {
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
  }, [sections])

  // Add this after the other useEffect blocks
  const handleHoverBarChange = useCallback((barPosition: number | null) => {
    setHoverBarPosition(barPosition)
  }, [])

  // Handle loop drag start
  const handleLoopDragStart = useCallback((bar: number) => {
    setDragStartBar(bar)
    setCurrentDragBar(bar)
    setIsDraggingLoop(true)
    setHasDraggedMeaningfully(false)
    console.log(`Loop drag start at bar ${bar}`)
  }, [])

  // Handle loop drag
  const handleLoopDrag = useCallback(
    (bar: number) => {
      setCurrentDragBar(bar)

      // Check if we've dragged meaningfully
      if (dragStartBar !== null && Math.abs(bar - dragStartBar) >= DRAG_THRESHOLD) {
        setHasDraggedMeaningfully(true)
      }

      console.log(`Loop drag to bar ${bar}`)
    },
    [dragStartBar],
  )

  // Handle loop drag end
  const handleLoopDragEnd = useCallback(() => {
    console.log(`Loop drag end, meaningful: ${hasDraggedMeaningfully}`)

    // Only create a loop if we've dragged meaningfully
    if (hasDraggedMeaningfully && dragStartBar !== null && currentDragBar !== null) {
      const startBarValue = Math.min(dragStartBar, currentDragBar)
      const endBarValue = Math.max(dragStartBar, currentDragBar) + 1 // +1 to include the end bar

      // Call the parent's onLoopDragEnd if available
      if (onLoopDragEnd) {
        onLoopDragEnd(true, startBarValue, endBarValue)
      } else {
        // Fallback to direct setLoopRegion if onLoopDragEnd is not available
        setLoopRegion({ startBar: startBarValue, endBar: endBarValue })
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
  }, [hasDraggedMeaningfully, dragStartBar, currentDragBar, onLoopDragEnd, setLoopRegion, onLoopChange])

  useEffect(() => {
    // This is just for debugging - can be removed after verification
    if (selectedSection) {
      console.log(`Selected section changed to: ${selectedSection}`)
    }
  }, [selectedSection])

  const barWidth = BAR_WIDTH
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false)

  // Define handleWheel and handleZoom functions
  const handleZoomFn = useCallback(
    (direction: "in" | "out") => {
      // Calculate the new zoom level based on direction
      let newZoomLevel: number

      if (direction === "in") {
        newZoomLevel = zoomLevel + ZOOM_STEP
      } else {
        newZoomLevel = zoomLevel - ZOOM_STEP
      }

      // Ensure the new zoom level is within bounds and is a valid number
      newZoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoomLevel))

      // Additional validation to prevent NaN
      if (!Number.isFinite(newZoomLevel)) {
        newZoomLevel = direction === "in" ? MIN_ZOOM + ZOOM_STEP : MAX_ZOOM - ZOOM_STEP
      }

      // Update the zoom level
      setZoomLevel(newZoomLevel)
    },
    [zoomLevel],
  )

  const handleWheelFn = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -1 : 1 // Invert the delta for more natural zoom

      // Calculate the new zoom level
      let newZoomLevel = zoomLevel + delta * ZOOM_STEP

      // Ensure the new zoom level is within bounds and is a valid number
      newZoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoomLevel))

      // Additional validation to prevent NaN
      if (!Number.isFinite(newZoomLevel)) {
        newZoomLevel = MIN_ZOOM
      }

      // Update the zoom level
      setZoomLevel(newZoomLevel)
    },
    [zoomLevel],
  )

  // Calculate content width based on sections and zoom
  useEffect(() => {
    const maxEndBar = sections.reduce((max, section) => {
      const endBar = (section.start + section.length) / BEATS_PER_BAR
      return Math.max(max, endBar)
    }, 0)
    // Ensure content width is at least the totalBars or the max end bar, whichever is greater
    const calculatedWidth = Math.max(totalBars, maxEndBar) * BAR_WIDTH
    setContentWidth(calculatedWidth)
  }, [sections, totalBars, BAR_WIDTH, BEATS_PER_BAR])

  // ADD: Set the fixed width only once when component mounts
  useEffect(() => {
    if (!initialWidthSet) {
      setFixedTimelineWidth(EMPTY_STATE_WIDTH)
      setInitialWidthSet(true)
    }
  }, [initialWidthSet])

  // ADD: Calculate timeline container style with fixed width
  const timelineContainerStyle = {
    width: fixedTimelineWidth ? `${fixedTimelineWidth}px` : 'auto',
    minWidth: fixedTimelineWidth ? `${fixedTimelineWidth}px` : 'auto',
    maxWidth: fixedTimelineWidth ? `${fixedTimelineWidth}px` : 'none',
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
      style={timelineContainerStyle}
      role="region"
      aria-label="Timeline Editor"
    >
      {/* Timeline toolbar - always visible */}
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

      {/* Area below toolbar for status messages or timeline content */}
      <div
        className="timeline-body-area flex-1 flex flex-col items-center justify-center text-text-secondary overflow-hidden p-2"
        aria-live="polite"
      >
        {isLoading && (
          <div className="text-sm flex items-center">
            Preparing sequence matrix
            <AnimatedEllipsis />
          </div>
        )}
        {error && !isLoading && (
          <div className="text-sm text-red-500" role="alert">
            {error}
          </div>
        )}
        {!isLoading && !error && sections.length === 0 && (
          <div className="text-center">
            <p className="text-md mb-1">Sequence is empty.</p>
            <p className="text-xs">Press '+' in the toolbar to lay down your first Clip.</p>
          </div>
        )}

        {!isLoading && !error && sections.length > 0 && (
          // Scrollable content wrapper - takes full height of timeline-body-area if sections exist
          <div
            className="overflow-x-auto w-full h-full relative"
            ref={timelineContentWrapperRef}
            aria-label="Timeline scrollable content"
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
                aria-hidden="true"
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
              setSections={setSections} // Pass setSections for drag-and-drop reordering
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
