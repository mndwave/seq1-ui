"use client"

import type React from "react"
import { useState, useRef, useEffect, type KeyboardEvent, useCallback } from "react"
import { Copy, Trash2, GripHorizontal, ZoomIn, ZoomOut, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSensor, useSensors, PointerSensor, type DragStartEvent, type DragEndEvent } from "@dnd-kit/core"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DndContext, DragOverlay, SortableContext, horizontalListSortingStrategy } from "@dnd-kit/core"
import { useImmer } from "use-immer"

// Define types for our timeline
export interface TimelineSection {
  id: string
  name: string
  length: number // Length in bars
  color?: string
  isNew?: boolean // Flag to track newly added sections
}

interface TimelineProps {
  onSectionSelect?: (sectionId: string) => void
  isPlaying?: boolean
  className?: string
  selectedDeviceId?: string | null
  initialSections?: TimelineSection[]
}

// In the SortableTimelineSection component inside dnd-timeline.tsx
// Add the constants for the width thresholds
const LABEL_VISIBILITY_THRESHOLD = 90 // px
const MOVE_HANDLE_VISIBILITY_THRESHOLD = 50 // px

// Sortable section component
function SortableTimelineSection({
  section,
  index,
  isSelected,
  barWidth,
  showDragHandle,
  onSelect,
  onDuplicate,
  onDelete,
  onNameChange,
  animatingButtons,
}: {
  section: TimelineSection
  index: number
  isSelected: boolean
  barWidth: number
  showDragHandle: boolean
  onSelect: (id: string, e: React.MouseEvent) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onNameChange: (id: string, newName: string) => void
  animatingButtons: Record<string, { action: "copy" | "delete" | "add"; state: "grow" | "shrink" }>
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })
  const [sectionWidth, setSectionWidth] = useState<number>(0)
  const sectionRef = useRef<HTMLDivElement>(null)

  // Add state for editing mode
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(section.name)
  const inputRef = useRef<HTMLInputElement>(null)

  // Use ResizeObserver to track the section's width
  useEffect(() => {
    if (!sectionRef.current) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSectionWidth(entry.contentRect.width)
      }
    })

    observer.observe(sectionRef.current)

    return () => {
      observer.disconnect()
    }
  }, [])

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const sectionColor = section.color || "#e07a8a"
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: `${section.length * barWidth}px`,
    borderLeft: index === 0 ? "1px solid #3a2a30" : "none",
    backgroundColor: `${sectionColor}40`,
    opacity: isDragging ? 0.5 : 1,
  }

  // Determine if the label should be visible
  const showLabel = sectionWidth >= LABEL_VISIBILITY_THRESHOLD

  // Determine if the move handle should be visible
  const showMoveHandle = sectionWidth >= MOVE_HANDLE_VISIBILITY_THRESHOLD && showDragHandle

  // Handle click on label to enter edit mode
  const handleLabelClick = (e: React.MouseEvent) => {
    // Prevent propagation to avoid triggering section selection
    e.stopPropagation()

    // Only allow editing if the label is visible
    if (showLabel) {
      setIsEditing(true)
      setEditValue(section.name)
    }
  }

  // Handle saving the edited name
  const handleSave = useCallback(() => {
    if (editValue.trim() !== "") {
      onNameChange(section.id, editValue.trim())
    }
    setIsEditing(false)
  }, [editValue, onNameChange, section.id])

  // Handle key presses in the input
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      // Cancel editing and restore previous value
      setEditValue(section.name)
      setIsEditing(false)
    }
  }

  return (
    <div
      ref={(el) => {
        // Combine the refs
        setNodeRef(el)
        if (sectionRef) {
          sectionRef.current = el
        }
      }}
      data-section-id={section.id}
      className={cn(
        "h-full border-r border-[#3a2a30] relative group",
        isSelected && "bg-[#2a1a20] ring-2 ring-[#f0e6c8] ring-opacity-50 ring-inset transition-all duration-200",
        isDragging && "timeline-section-dragging",
        animatingButtons[section.id]?.state === "shrink" && "animate-button-shrink",
      )}
      style={style}
      onClick={(e) => onSelect(section.id, e)}
    >
      {/* Section content - always visible */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center section-content z-20",
          section.isNew && "animate-sectionContentFade",
        )}
      >
        {showLabel && (
          <div className="truncate text-xs text-[#f0e6c8] max-w-full px-6">
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="bg-transparent text-xs text-[#f0e6c8] border-none outline-none w-full text-center"
                style={{
                  maxWidth: "100%",
                  minWidth: "40px",
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="truncate cursor-text" onClick={handleLabelClick}>
                {section.name}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Drag handle - conditionally visible based on width */}
      {showMoveHandle && (
        <div
          {...attributes}
          {...listeners}
          className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing bg-[#2a1a20] bg-opacity-50 hover:bg-opacity-70 drag-handle"
          style={{
            zIndex: 20, // Ensure it's above other elements
            touchAction: "none",
          }}
        >
          <GripHorizontal size={14} className="text-[#f0e6c8]" />
        </div>
      )}
    </div>
  )
}

// Update the TimelineDragPreview component to also respect the width threshold
function TimelineDragPreview({ section, barWidth }: { section: TimelineSection | null; barWidth: number }) {
  if (!section) return null

  const sectionColor = section.color || "#e07a8a"
  const width = section.length * barWidth
  const showLabel = width >= LABEL_VISIBILITY_THRESHOLD

  return (
    <div
      className="h-full bg-[#2a1a20] ring-2 ring-[#f0e6c8] ring-opacity-50 drag-preview"
      style={{
        width: `${width}px`,
        backgroundColor: `${sectionColor}60`,
        borderStyle: "dashed",
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {showLabel && (
          <div className="truncate text-xs text-[#f0e6c8] max-w-full px-6">
            <span className="truncate">{section.name}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DndTimeline({
  onSectionSelect,
  isPlaying = false,
  className = "",
  selectedDeviceId,
  initialSections = [],
}: TimelineProps) {
  // State for sections - initialize with initialSections if provided
  const [sections, updateSections] = useImmer<TimelineSection[]>(initialSections)
  const [playheadPosition, setPlayheadPosition] = useState(0)
  const [selectedSection, setSelectedSection] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(0.518) // Start at 22% zoom as requested by user
  const [totalBars, setTotalBars] = useState(256) // Maximum number of bars
  // Track which colors have been used
  const [usedColorMap, setUsedColorMap] = useState<Record<string, number>>({})
  // Track if we're currently adding a section
  const [isAddingSection, setIsAddingSection] = useState(false)
  // Track button animations
  const [animatingButtons, setAnimatingButtons] = useState<{
    [key: string]: { action: "copy" | "delete" | "add"; state: "grow" | "shrink" }
  }>({})
  // Active drag section
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  // Track if we're currently dragging
  const [isDragging, setIsDragging] = useState(false)
  // Track the section being dragged
  const [draggedSection, setDraggedSection] = useState<TimelineSection | null>(null)

  // Refs
  const timelineRef = useRef<HTMLDivElement>(null)
  const playheadRef = useRef<HTMLDivElement>(null)
  const playheadAnimationRef = useRef<number | null>(null)
  const addButtonRef = useRef<HTMLButtonElement>(null)

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px of movement required before drag starts
      },
    }),
  )

  // Constants
  const BASE_BAR_WIDTH = 64 // Base width of one bar in pixels
  const DEFAULT_SECTION_LENGTH = 4 // Default section length is 4 bars
  const MIN_ZOOM = 0.1 // Minimum zoom level (most zoomed out)
  const MAX_ZOOM = 2 // Maximum zoom level (most zoomed in)
  const ZOOM_STEP = 0.05 // Smaller zoom step size for finer control
  const MIN_ZOOM_FOR_CONTROLS = 0.5 // Minimum zoom level to show copy/delete icons (50%)
  const MIN_ZOOM_FOR_DRAG_HANDLE = 0.24 // Minimum zoom level to show drag handle (24%)

  // Calculate actual bar width based on zoom level
  const BAR_WIDTH = BASE_BAR_WIDTH * zoomLevel

  // Check if zoom level is high enough to show different controls
  const showControls = zoomLevel >= MIN_ZOOM_FOR_CONTROLS
  const showDragHandle = zoomLevel >= MIN_ZOOM_FOR_DRAG_HANDLE

  // Enhanced color palette with more distinct colors
  const SECTION_COLORS = [
    "#e07a8a", // Vibrant pink
    "#50b0b0", // Teal
    "#d9a765", // Gold
    "#7a7adc", // Periwinkle
    "#60dc74", // Green
    "#dc5050", // Red
    "#c07adc", // Lavender
    "#dc7a55", // Coral
    "#4287f5", // Blue
    "#e050a0", // Magenta
    "#8adc50", // Lime
    "#dc9050", // Orange
    "#50dc9e", // Mint
    "#9e50dc", // Purple
    "#dc50dc", // Bright pink
  ]

  // Group colors by hue family to avoid similar colors next to each other
  const COLOR_FAMILIES = [
    ["#e07a8a", "#dc5050", "#e050a0", "#dc50dc"], // Reds/Pinks
    ["#dc7a55", "#d9a765", "#dc9050"], // Oranges/Browns
    ["#50b0b0", "#4287f5"], // Blues
    ["#7a7adc", "#9e50dc", "#c07adc"], // Purples
  ]

  // Initialize sections from props when component mounts
  useEffect(() => {
    if (initialSections.length > 0 && sections.length === 0) {
      // If initial sections don't have colors, assign them
      const sectionsWithColors = initialSections.map((section, index) => {
        if (!section.color) {
          return {
            ...section,
            color: SECTION_COLORS[index % SECTION_COLORS.length],
          }
        }
        return section
      })

      // Track colors used by initial sections
      const initialColorMap: Record<string, number> = {}
      sectionsWithColors.forEach((section) => {
        if (section.color) {
          initialColorMap[section.color] = (initialColorMap[section.color] || 0) + 1
        }
      })

      setUsedColorMap(initialColorMap)
      updateSections((draft) => {
        draft.push(...sectionsWithColors)
      })
    }
  }, [initialSections, sections.length, updateSections])

  // Handle name change for a section
  const handleSectionNameChange = async (sectionId: string, newName: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    console.log(`API: Updated section ${sectionId} name to ${newName}`)

    // Update local state
    updateSections((draft) => {
      const sectionIndex = draft.findIndex((section) => section.id === sectionId)
      if (sectionIndex !== -1) {
        draft[sectionIndex].name = newName
      }
    })
  }

  // Calculate color distance (simple RGB distance)
  const getColorDistance = (color1: string, color2: string): number => {
    // Convert hex to RGB
    const r1 = Number.parseInt(color1.slice(1, 3), 16)
    const g1 = Number.parseInt(color2.slice(3, 5), 16)
    const b1 = Number.parseInt(color2.slice(5, 7), 16)

    const r2 = Number.parseInt(color1.slice(1, 3), 16)
    const g2 = Number.parseInt(color2.slice(3, 5), 16)
    const b2 = Number.parseInt(color2.slice(5, 7), 16)

    // Calculate Euclidean distance in RGB space
    return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2))
  }

  // Get the last used color in the timeline
  const getLastUsedColor = (): string | null => {
    if (sections.length === 0) return null
    return sections[sections.length - 1].color || null
  }

  // Get a color from a different family than the last used color
  const getColorFromDifferentFamily = (lastColor: string | null): string => {
    if (!lastColor) {
      // If no last color, just return the first color
      return SECTION_COLORS[0]
    }

    // Find which family the last color belongs to
    let lastColorFamily = -1
    for (let i = 0; i < COLOR_FAMILIES.length; i++) {
      if (COLOR_FAMILIES[i].includes(lastColor)) {
        lastColorFamily = i
        break
      }
    }

    // Get available colors from different families
    const availableColors = SECTION_COLORS.filter((color) => !usedColorMap[color] || usedColorMap[color] === 0)

    if (availableColors.length === 0) {
      // If no available colors, generate a modified color
      return modifyColor(lastColor)
    }

    // Sort available colors by distance from last color (descending)
    const sortedColors = [...availableColors].sort(
      (a, b) => getColorDistance(b, lastColor) - getColorDistance(a, lastColor),
    )

    // Take one of the most distant colors (with some randomness)
    const topDistantColors = sortedColors.slice(0, Math.min(3, sortedColors.length))
    return topDistantColors[Math.floor(Math.random() * topDistantColors.length)]
  }

  // Update the getUniqueColor function to ensure colors are not reused and have good variation
  const getUniqueColor = (): string => {
    // Get the last used color
    const lastColor = getLastUsedColor()

    // Get a color from a different family
    const selectedColor = getColorFromDifferentFamily(lastColor)

    // Mark this color as used
    setUsedColorMap((prev) => ({
      ...prev,
      [selectedColor]: (prev[selectedColor] || 0) + 1,
    }))

    return selectedColor
  }

  const modifyColor = (baseColor: string): string => {
    // Convert hex to RGB
    const r = Number.parseInt(baseColor.slice(1, 3), 16)
    const g = Number.parseInt(baseColor.slice(3, 5), 16)
    const b = Number.parseInt(baseColor.slice(5, 7), 16)

    // Modify the color significantly to ensure visual distinction
    // Rotate the color in RGB space by shifting the channels
    const newR = (g + 50) % 256
    const newG = (b + 50) % 256
    const newB = (r + 50) % 256

    // Convert back to hex
    return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`
  }

  // Generate a new section
  const createNewSection = () => {
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

      const newSection: TimelineSection = {
        id: `section-${Date.now()}`,
        name: `Section ${(sections.length + 1).toString().padStart(2, "0")}`,
        length: DEFAULT_SECTION_LENGTH, // Always 4 bars
        color: newColor,
        isNew: true, // Mark as new for animation
      }

      // Add the new section
      updateSections((draft) => {
        draft.push(newSection)
      })

      // Reset the button animation
      setAnimatingButtons({
        ...animatingButtons,
        "add-button": undefined,
      })

      // Scroll to the new section
      setTimeout(() => {
        if (timelineRef.current) {
          const totalWidth =
            sections.reduce((total, section) => total + section.length * BAR_WIDTH, 0) +
            DEFAULT_SECTION_LENGTH * BAR_WIDTH
          timelineRef.current.scrollLeft = totalWidth - timelineRef.current.clientWidth + 50
        }

        // Reset the adding state after animation completes - use a shorter time
        setTimeout(() => {
          setIsAddingSection(false)

          // Remove the isNew flag from the section
          updateSections((draft) => {
            const sectionIndex = draft.findIndex((section) => section.id === newSection.id)
            if (sectionIndex !== -1) {
              draft[sectionIndex].isNew = false
            }
          })
        }, 200) // Match animation duration plus a small buffer
      }, 10)
    }, 300) // Delay to match the button animation
  }

  // Duplicate a section
  const handleCopySection = (sectionId: string | null) => {
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
      // Create a new section with the same properties but a new ID
      const newSection: TimelineSection = {
        id: `section-${Date.now()}`,
        name: `${sectionToDuplicate.name} (Copy)`,
        length: sectionToDuplicate.length,
        color: sectionToDuplicate.color, // Keep the same color
        isNew: true, // Mark as new for animation
      }

      // Add the new section after the original
      updateSections((draft) => {
        const index = draft.findIndex((section) => section.id === sectionId)
        if (index !== -1) {
          draft.splice(index + 1, 0, newSection)
        }
      })

      // Reset the button animation
      setAnimatingButtons({
        ...animatingButtons,
        [sectionId]: undefined,
      })

      // Select the new section
      setSelectedSection(newSection.id)

      // Increment the usage count for this color
      if (sectionToDuplicate.color) {
        setUsedColorMap((prev) => ({
          ...prev,
          [sectionToDuplicate.color!]: (prev[sectionToDuplicate.color!] || 0) + 1,
        }))
      }

      // Remove the isNew flag after animation completes
      setTimeout(() => {
        updateSections((draft) => {
          const newSectionIndex = draft.findIndex((section) => section.id === newSection.id)
          if (newSectionIndex !== -1) {
            draft[newSectionIndex].isNew = false
          }
        })
      }, 300) // Match animation duration
    }, 300) // Delay to match the button animation
  }

  // Delete a section with simplified animation
  const deleteSection = (sectionId: string) => {
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
      updateSections((draft) => {
        const index = draft.findIndex((section) => section.id === sectionId)
        if (index !== -1) {
          draft.splice(index, 1)
        }
      })

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

  // Handle section selection
  const handleSectionSelect = (sectionId: string, e: React.MouseEvent) => {
    // Don't select if we're dragging
    if (isDragging) return

    // Don't select if clicking on a button or drag handle
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest(".drag-handle")) {
      return
    }

    setSelectedSection(sectionId)

    if (onSectionSelect) {
      onSectionSelect(sectionId)
    }
  }

  // Handle zoom in/out
  const handleZoom = (direction: "in" | "out") => {
    if (direction === "in") {
      setZoomLevel((prev) => Math.min(prev + ZOOM_STEP, MAX_ZOOM))
    } else {
      setZoomLevel((prev) => Math.max(prev - ZOOM_STEP, MIN_ZOOM))
    }
  }

  // Handle wheel zoom (pinch to trackpads)
  const handleWheel = (e: React.WheelEvent) => {
    // Check if ctrl key is pressed (pinch gesture on trackpad or ctrl+wheel)
    if (e.ctrlKey) {
      e.preventDefault()

      // Determine zoom direction
      if (e.deltaY < 0) {
        // Zoom in
        handleZoom("in")
      } else {
        // Zoom out
        handleZoom("out")
      }
    }
  }

  // Animate playhead when playing
  useEffect(() => {
    let startTime: number | null = null
    let totalDuration = 0

    // Calculate total duration in milliseconds
    sections.forEach((section) => {
      // Assuming 120 BPM, 4/4 time signature
      // One bar = 4 beats = 4 * (60/120) seconds = 2 seconds
      totalDuration += section.length * 2000 // 2000ms per bar
    })

    // If no sections, don't animate
    if (totalDuration === 0) return

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime

      // Loop back to start if we reach the end
      const position = elapsed % totalDuration

      // Calculate playhead position
      let currentPosition = 0
      let currentSectionStart = 0

      for (const section of sections) {
        const sectionDuration = section.length * 2000
        if (currentPosition + sectionDuration > position) {
          // We're in this section
          const sectionProgress = (position - currentPosition) / sectionDuration
          setPlayheadPosition(currentSectionStart + sectionProgress * section.length * BAR_WIDTH)
          break
        }
        currentPosition += sectionDuration
        currentSectionStart += section.length * BAR_WIDTH
      }

      playheadAnimationRef.current = requestAnimationFrame(animate)
    }

    if (isPlaying) {
      playheadAnimationRef.current = requestAnimationFrame(animate)
    }

    return () => {
      if (playheadAnimationRef.current) {
        cancelAnimationFrame(playheadAnimationRef.current)
      }
    }
  }, [isPlaying, sections, BAR_WIDTH])

  // Calculate total width of timeline
  const totalWidth = Math.max(
    sections.reduce((total, section) => total + section.length * BAR_WIDTH, 0),
    totalBars * BAR_WIDTH,
  )

  // Generate bar markers for the timeline
  const generateBarMarkers = () => {
    const markers = []

    // Calculate how many bars we can display based on the available width
    const maxBars = Math.min(totalBars, Math.ceil(totalWidth / BAR_WIDTH))

    // Show markers every 4 bars, starting with bar 1
    for (let i = 0; i < maxBars; i++) {
      // Show numbers for every 4th bar (1, 5, 9, 13, etc.)
      const showNumber = i === 0 || (i + 1) % 4 === 1
      // Show minor tick for every bar
      const showMinorTick = !showNumber

      if (showNumber) {
        markers.push(
          <div
            key={`bar-${i}`}
            className="absolute"
            style={{
              left: `${i * BAR_WIDTH}px`,
              top: 0,
              height: "16px",
              width: "1px",
              backgroundColor: "#f0e6c8",
            }}
          >
            <div className="absolute text-[9px] text-[#a09080]" style={{ left: "4px", top: "0px" }}>
              {i + 1}
            </div>
          </div>,
        )
      } else if (showMinorTick) {
        markers.push(
          <div
            key={`bar-${i}`}
            className="absolute"
            style={{
              left: `${i * BAR_WIDTH}px`,
              top: 0,
              height: "6px",
              width: "1px",
              backgroundColor: "#3a2a30",
            }}
          />,
        )
      }

      // Add beat sub-notches (4 beats per bar)
      if (BAR_WIDTH >= 20) {
        // Only show beat markers if we have enough space
        for (let beat = 1; beat < 4; beat++) {
          markers.push(
            <div
              key={`beat-${i}-${beat}`}
              className="absolute"
              style={{
                left: `${i * BAR_WIDTH + (beat * BAR_WIDTH) / 4}px`,
                top: 0,
                height: "4px",
                width: "1px",
                backgroundColor: "#3a2a30",
                opacity: 0.5,
              }}
            />,
          )
        }
      }
    }
    return markers
  }

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true)
    setActiveDragId(event.active.id as string)
    const section = sections.find((s) => s.id === event.active.id)
    setDraggedSection(section || null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false)
    setActiveDragId(null)
    setDraggedSection(null)

    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = sections.findIndex((section) => section.id === active.id)
    const newIndex = sections.findIndex((section) => section.id === over.id)

    if (oldIndex < 0 || newIndex < 0) {
      return
    }

    updateSections((draft) => {
      const [movedSection] = draft.splice(oldIndex, 1)
      draft.splice(newIndex, 0, movedSection)
    })
  }

  return (
    <div
      className={cn(
        "timeline-container bg-[#1a1015] border-t border-[#3a2a30] overflow-x-auto",
        className,
        isDragging ? "dragging-cursor" : "",
      )}
      ref={timelineRef}
      onWheel={handleWheel}
    >
      <div className="flex flex-col h-full">
        {/* Timeline header with bar markers */}
        <div className="timeline-header h-6 border-b border-[#3a2a30] relative bg-[#1a1015]">
          <div className="absolute inset-0" style={{ width: `${totalWidth}px` }}>
            {generateBarMarkers()}
          </div>

          {/* Zoom controls */}
          <div className="absolute right-2 top-0 flex items-center space-x-1 z-10">
            {/* Background mask to prevent timeline showing through */}
            <div className="absolute inset-0 -left-12 -right-2 bg-[#1a1015]"></div>

            {/* Section actions */}
            <button
              onClick={() => selectedSection && handleCopySection(selectedSection)}
              className={cn(
                "p-1 hover:bg-[#3a2a30] rounded-sm transition-colors duration-200 relative z-10",
                animatingButtons[selectedSection || ""]?.action === "copy" &&
                  animatingButtons[selectedSection || ""]?.state === "grow" &&
                  "animate-button-grow",
                !selectedSection && "opacity-50 cursor-not-allowed",
              )}
              title="Duplicate section"
              disabled={!selectedSection}
            >
              <Copy size={12} className={`${!selectedSection ? "text-[#5a4a50]" : "text-[#a09080]"}`} />
            </button>

            <button
              onClick={() => deleteSection(selectedSection)}
              className={cn(
                "p-1 hover:bg-[#3a2a30] rounded-sm transition-colors duration-200 relative z-10",
                animatingButtons[selectedSection || ""]?.action === "delete" &&
                  animatingButtons[selectedSection || ""]?.state === "grow" &&
                  "animate-button-grow",
                !selectedSection && "opacity-50 cursor-not-allowed",
              )}
              title="Delete section"
              disabled={!selectedSection}
            >
              <Trash2 size={12} className={`${!selectedSection ? "text-[#5a4a50]" : "text-[#a09080]"}`} />
            </button>

            <div className="w-px h-4 bg-[#3a2a30] mx-1"></div>

            {/* Zoom controls */}
            <button
              onClick={() => handleZoom("out")}
              className="p-1 hover:bg-[#3a2a30] rounded-sm transition-colors duration-200 relative z-10"
              title="Zoom out"
              disabled={zoomLevel <= MIN_ZOOM}
            >
              <ZoomOut size={12} className={`${zoomLevel <= MIN_ZOOM ? "text-[#5a4a50]" : "text-[#a09080]"}`} />
            </button>
            <span className="text-[9px] text-[#a09080] w-8 text-center relative z-10 flex items-center justify-center h-6">
              {Math.round(((zoomLevel - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100)}%
            </span>
            <button
              onClick={() => handleZoom("in")}
              className="p-1 hover:bg-[#3a2a30] rounded-sm transition-colors duration-200 relative z-10"
              title="Zoom in"
              disabled={zoomLevel >= MAX_ZOOM}
            >
              <ZoomIn size={12} className={`${zoomLevel >= MAX_ZOOM ? "text-[#5a4a50]" : "text-[#a09080]"}`} />
            </button>
          </div>
        </div>

        {/* Sections container with DndContext */}
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex h-full" style={{ minWidth: `${totalWidth}px`, position: "relative" }}>
            {sections.length === 0 ? (
              // Standalone Add button only when no sections exist
              <button
                ref={addButtonRef}
                onClick={createNewSection}
                className={cn(
                  "h-full w-8 border-r border-[#3a2a30] flex items-center justify-center hover:bg-[#3a2a30] transition-colors duration-200 bg-[#2a1a20]",
                  animatingButtons["add-button"]?.state === "grow" && "animate-button-grow",
                  isAddingSection && "cursor-not-allowed opacity-50",
                )}
                title="Add section"
                disabled={isAddingSection}
              >
                <Plus size={12} className="text-[#f0e6c8]" />
              </button>
            ) : (
              // When sections exist, render them with SortableContext
              <SortableContext items={sections.map((section) => section.id)} strategy={horizontalListSortingStrategy}>
                {sections.map((section, index) => (
                  <div key={section.id} className="relative h-full">
                    <SortableTimelineSection
                      key={section.id}
                      section={section}
                      index={index}
                      isSelected={selectedSection === section.id}
                      barWidth={BAR_WIDTH}
                      showDragHandle={showDragHandle}
                      onSelect={handleSectionSelect}
                      onDuplicate={handleCopySection}
                      onDelete={deleteSection}
                      onNameChange={handleSectionNameChange}
                      animatingButtons={animatingButtons}
                    />
                  </div>
                ))}
              </SortableContext>
            )}
          </div>

          {/* DragOverlay for custom drag preview */}
          <DragOverlay adjustScale={false}>
            {draggedSection ? <TimelineDragPreview section={draggedSection} barWidth={BAR_WIDTH} /> : null}
          </DragOverlay>
        </DndContext>

        {/* Playhead */}
        {sections.length > 0 && isPlaying && (
          <div
            ref={playheadRef}
            className="absolute top-0 bottom-0 w-0.5 bg-[#f5a623] z-20 pointer-events-none"
            style={{
              left: `${playheadPosition}px`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="w-2 h-2 bg-[#f5a623] rounded-full -mt-1 -ml-[3px]"></div>
          </div>
        )}
      </div>
    </div>
  )
}
