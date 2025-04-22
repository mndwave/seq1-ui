"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { TimelineClip } from "@/lib/timeline-clip-schema"
import type { ButtonAnimationState } from "./timeline-types"
import {
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  DndContext,
} from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable"
import { SortableTimelineSection, TimelineDragPreview } from "./timeline-section"
import { updateTimelineClip, reorderTimelineClips } from "@/lib/api/timeline-api"

interface TimelineContentProps {
  sections: TimelineClip[]
  setSections: React.Dispatch<React.SetStateAction<TimelineClip[]>>
  selectedSection: string | null
  setSelectedSection: React.Dispatch<React.SetStateAction<string | null>>
  barWidth: number
  totalBars: number
  isPlaying: boolean
  playheadPosition: number
  showDragHandle: boolean
  showControls: boolean
  animatingButtons: ButtonAnimationState
  setAnimatingButtons: React.Dispatch<React.SetStateAction<ButtonAnimationState>>
  onSectionSelect?: (sectionId: string) => void
  usedColorMap: Record<string, number>
  setUsedColorMap: React.Dispatch<React.SetStateAction<Record<string, number>>>
  timelineRef: React.RefObject<HTMLDivElement>
  duplicateSection: (sectionId: string) => void
  deleteSection: (sectionId: string) => void
}

export default function TimelineContent({
  sections,
  setSections,
  selectedSection,
  setSelectedSection,
  barWidth,
  totalBars,
  isPlaying,
  playheadPosition,
  showDragHandle,
  showControls,
  animatingButtons,
  setAnimatingButtons,
  onSectionSelect,
  usedColorMap,
  setUsedColorMap,
  timelineRef,
  duplicateSection,
  deleteSection,
}: TimelineContentProps) {
  // State for drag and drop
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedSection, setDraggedSection] = useState<TimelineClip | null>(null)
  const [panelSizes, setPanelSizes] = useState<number[]>([])

  // Refs
  const playheadRef = useRef<HTMLDivElement>(null)
  const lastSectionRef = useRef<HTMLDivElement>(null)

  // Constants
  const DEFAULT_SECTION_LENGTH = 4 // Default section length is 4 bars (in beats)
  const BEATS_PER_BAR = 4 // 4 beats per bar

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  // Handle section resize
  const handleSectionResize = async (sectionId: string, newLengthInBars: number) => {
    // Calculate the new length in beats
    const newLengthInBeats = newLengthInBars * BEATS_PER_BAR

    // Update the local state immediately for a responsive UI
    setSections(
      sections.map((section) => (section.id === sectionId ? { ...section, length: newLengthInBeats } : section)),
    )

    try {
      // Call the API to persist the change
      await updateTimelineClip(sectionId, { length: newLengthInBeats })
    } catch (error) {
      console.error(`Failed to update clip ${sectionId} length:`, error)
      // Optionally revert the local state if the API call fails
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string)
    setIsDragging(true)
    const section = sections.find((s) => s.id === event.active.id)
    setDraggedSection(section || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    setIsDragging(false)
    setActiveDragId(null)
    setDraggedSection(null)

    if (!over) return

    if (active.id !== over.id) {
      const oldIndex = sections.findIndex((item) => item.id === active.id)
      const newIndex = sections.findIndex((item) => item.id === over.id)

      if (oldIndex < 0 || newIndex < 0) {
        return // Or handle the error as appropriate for your application
      }

      // Create a new array with the updated order
      const newItems = [...sections]
      newItems.splice(newIndex, 0, newItems.splice(oldIndex, 1)[0])

      // Update the local state immediately for a responsive UI
      setSections(newItems)

      try {
        // Call the API to persist the new order
        const orderedIds = newItems.map((item) => item.id)
        await reorderTimelineClips(orderedIds)
      } catch (error) {
        console.error("Failed to update clip order:", error)
        // Optionally revert the local state if the API call fails
        setSections(sections)
      }
    }
  }

  // Define handleSectionSelect function
  const handleSectionSelect = (sectionId: string, e: React.MouseEvent) => {
    setSelectedSection(sectionId)
    if (onSectionSelect) {
      onSectionSelect(sectionId)
    }
  }

  // Add an effect to update the scroll position when sections change
  useEffect(() => {
    if (sections.length > 0 && timelineRef.current && lastSectionRef.current) {
      // Only auto-scroll when a new section is added
      const lastSection = sections[sections.length - 1]
      if (lastSection.isNew) {
        const timelineWidth = timelineRef.current.clientWidth
        const lastSectionRight = lastSectionRef.current.getBoundingClientRect().right
        const timelineRight = timelineRef.current.getBoundingClientRect().right

        // If the last section is not fully visible, scroll to make it visible
        if (lastSectionRight > timelineRight) {
          const scrollAmount = lastSectionRight - timelineRight + 50 // Add some padding
          timelineRef.current.scrollLeft += scrollAmount
        }
      }
    }
  }, [sections])

  // If there are no sections, just show an empty container
  if (sections.length === 0) {
    return <div className="flex h-[40px]">{/* Empty state - no add button here anymore */}</div>
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {/* Main timeline content */}
      <div className="flex h-[40px] relative">
        {/* Playhead */}
        {isPlaying && (
          <div
            ref={playheadRef}
            className="absolute top-0 bottom-0 w-0.5 bg-[#aaaaaa] z-20 pointer-events-none"
            style={{
              left: `${playheadPosition}px`,
              transform: "translateX(-50%)",
              height: "100%", // Constrain height to 100% of TimelineContent
            }}
          >
            <div className="w-1 h-1 bg-[#aaaaaa] rounded-full -mt-0.5 -ml-[3px]"></div>
          </div>
        )}
        {/* Regular sections rendered without ResizablePanelGroup */}
        <div className="flex h-full">
          <SortableContext items={sections.map((section) => section.id)} strategy={horizontalListSortingStrategy}>
            {sections.map((section, index) => {
              const isLastSection = index === sections.length - 1
              return (
                <div
                  key={section.id}
                  className="relative h-full"
                  style={{ width: `${(section.length / BEATS_PER_BAR) * barWidth}px` }}
                  ref={isLastSection ? lastSectionRef : null}
                >
                  <SortableTimelineSection
                    section={section}
                    index={index}
                    isSelected={selectedSection === section.id}
                    barWidth={barWidth}
                    showDragHandle={showDragHandle}
                    onSelect={handleSectionSelect}
                    onDuplicate={() => duplicateSection(section.id)}
                    onDelete={() => deleteSection(section.id)}
                    animatingButtons={animatingButtons}
                    showControls={showControls}
                  />

                  {/* Resize handle - rendered as an independent element */}
                  {index < sections.length && (
                    <div
                      className="absolute right-0 top-0 bottom-0 w-4 cursor-ew-resize hover:bg-[#f0e6c8] hover:bg-opacity-20 transition-colors duration-200 resize-handle z-10"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()

                        const startX = e.clientX
                        const startWidth = (section.length / BEATS_PER_BAR) * barWidth

                        const handleMouseMove = (moveEvent: MouseEvent) => {
                          const deltaX = moveEvent.clientX - startX
                          const newWidth = startWidth + deltaX

                          // Convert to bars, round to nearest bar, then convert back to beats
                          const newLengthInBars = Math.max(1, Math.round(newWidth / barWidth))
                          handleSectionResize(section.id, newLengthInBars)
                        }

                        const handleMouseUp = () => {
                          document.removeEventListener("mousemove", handleMouseMove)
                          document.removeEventListener("mouseup", handleMouseUp)
                          document.body.classList.remove("resizing-cursor")
                        }

                        document.addEventListener("mousemove", handleMouseMove)
                        document.addEventListener("mouseup", handleMouseUp)
                        document.body.classList.add("resizing-cursor")
                      }}
                    >
                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-[#f0e6c8] bg-opacity-40 hover:bg-opacity-70"></div>
                    </div>
                  )}

                  {/* Remove the Add button that was positioned at the end of the last section */}
                </div>
              )
            })}
          </SortableContext>
        </div>
      </div>

      {/* DragOverlay for custom drag preview */}
      <DragOverlay adjustScale={false}>
        {draggedSection ? <TimelineDragPreview section={draggedSection} barWidth={barWidth} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
