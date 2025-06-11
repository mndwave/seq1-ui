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
  totalBars: number // This prop might not be directly used in TimelineContent if contentWidth is derived differently
  isPlaying: boolean
  playheadPosition: number
  showDragHandle: boolean
  showControls: boolean
  animatingButtons: ButtonAnimationState
  setAnimatingButtons: React.Dispatch<React.SetStateAction<ButtonAnimationState>>
  onSectionSelect?: (sectionId: string, e: React.MouseEvent) => void // Added event arg
  usedColorMap: Record<string, number> // Assuming this is still needed for some logic
  setUsedColorMap: React.Dispatch<React.SetStateAction<Record<string, number>>> // Assuming this is still needed
  timelineRef: React.RefObject<HTMLDivElement> // Or specific element type if known
  duplicateSection: (sectionId: string) => void
  deleteSection: (sectionId: string) => void
  onSectionNameChange: (sectionId: string, newName: string) => void // Added this prop
}

export default function TimelineContent({
  sections,
  setSections,
  selectedSection,
  setSelectedSection,
  barWidth,
  // totalBars, // Not directly used for iteration here
  isPlaying,
  playheadPosition,
  showDragHandle,
  showControls,
  animatingButtons,
  // setAnimatingButtons, // This might be managed by the parent Timeline component
  onSectionSelect,
  // usedColorMap,
  // setUsedColorMap,
  timelineRef,
  duplicateSection,
  deleteSection,
  onSectionNameChange,
}: TimelineContentProps) {
  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Drag activation threshold
      },
    }),
  )

  // State for drag and drop
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draggedSection, setDraggedSection] = useState<TimelineClip | null>(null)
  // const [panelSizes, setPanelSizes] = useState<number[]>([]) // This seems unused here

  // Refs
  const playheadRef = useRef<HTMLDivElement>(null)
  const lastSectionRef = useRef<HTMLDivElement>(null)

  // Constants
  // const DEFAULT_SECTION_LENGTH = 4 // Default section length is 4 bars (in beats) - Defined in parent
  const BEATS_PER_BAR = 4 // 4 beats per bar - Should be a shared constant or prop if configurable

  // Defensive check for the sections prop
  const isValidSections = Array.isArray(sections)

  // Handle section resize
  const handleSectionResize = async (sectionId: string, newLengthInBars: number) => {
    const newLengthInBeats = newLengthInBars * BEATS_PER_BAR

    const originalSections = [...sections]
    setSections(
      sections.map((section) => (section.id === sectionId ? { ...section, length: newLengthInBeats } : section)),
    )

    try {
      await updateTimelineClip(sectionId, { length: newLengthInBeats })
    } catch (error) {
      console.error(`Failed to update clip ${sectionId} length:`, error)
      setSections(originalSections) // Revert on error
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

    if (!over || active.id === over.id) return

    const oldIndex = sections.findIndex((item) => item.id === active.id)
    const newIndex = sections.findIndex((item) => item.id === over.id)

    if (oldIndex < 0 || newIndex < 0) return

    const newItems = [...sections]
    const [movedItem] = newItems.splice(oldIndex, 1)
    newItems.splice(newIndex, 0, movedItem)

    setSections(newItems) // Optimistic update

    try {
      const orderedIds = newItems.map((item) => item.id)
      await reorderTimelineClips(orderedIds)
    } catch (error) {
      console.error("Failed to update clip order:", error)
      // Revert to original order on API error
      const originalOrder = [...sections]
      originalOrder.splice(newIndex, 0, originalOrder.splice(oldIndex, 1)[0])
      setSections(originalOrder)
    }
  }

  const handleSectionSelectInternal = (sectionId: string, e: React.MouseEvent) => {
    setSelectedSection(sectionId)
    if (onSectionSelect) {
      onSectionSelect(sectionId, e)
    }
  }

  useEffect(() => {
    if (sections.length > 0 && timelineRef.current && lastSectionRef.current) {
      const lastSectionData = sections[sections.length - 1]
      if (lastSectionData && (lastSectionData as any).isNew) {
        // Check for isNew if it's part of your logic
        const timelineWidth = timelineRef.current.clientWidth
        const lastSectionElementRight = lastSectionRef.current.getBoundingClientRect().right
        const timelineElementRight = timelineRef.current.getBoundingClientRect().right

        if (lastSectionElementRight > timelineElementRight) {
          const scrollAmount = lastSectionElementRight - timelineElementRight + 50
          timelineRef.current.scrollLeft += scrollAmount
        }
        // Potentially remove 'isNew' flag after scrolling
        // setSections(prev => prev.map(s => s.id === lastSectionData.id ? {...s, isNew: false} : s));
      }
    }
  }, [sections, timelineRef])

  // If there are no sections (after the Array.isArray check), render an empty state or specific message
  if (!isValidSections) {
    console.error("TimelineContent: sections prop is not an array!", sections)
    // Render an error message or null to prevent further errors
    return (
      <div className="flex h-[40px] items-center justify-center text-red-500 p-2">Error: Invalid timeline data.</div>
    )
  }

  if (sections.length === 0) {
    // This message is now shown by the parent Timeline component when sections are empty.
    // TimelineContent can just render an empty div if it's guaranteed sections is an array.
    return <div className="flex h-[40px]" aria-label="Timeline empty"></div>
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-[40px] relative" aria-label="Timeline sections area">
        {isPlaying && (
          <div
            ref={playheadRef}
            className="absolute top-0 bottom-0 w-0.5 bg-[#aaaaaa] z-20 pointer-events-none"
            style={{
              left: `${playheadPosition}px`,
              transform: "translateX(-50%)",
              height: "100%",
            }}
            aria-hidden="true"
          >
            <div className="w-1 h-1 bg-[#aaaaaa] rounded-full -mt-0.5 -ml-[3px]"></div>
          </div>
        )}
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
                    onSelect={handleSectionSelectInternal}
                    onDuplicate={() => duplicateSection(section.id)}
                    onDelete={() => deleteSection(section.id)}
                    animatingButtons={animatingButtons}
                    showControls={showControls}
                    onNameChange={onSectionNameChange} // Pass down the name change handler
                  />

                  {/* Resize handle */}
                  <div
                    className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-primary/20 transition-colors duration-100 resize-handle z-10 group"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()

                      const startX = e.clientX
                      const startWidthInBars = section.length / BEATS_PER_BAR

                      document.body.classList.add("resizing-cursor")

                      const handleMouseMove = (moveEvent: MouseEvent) => {
                        const deltaX = moveEvent.clientX - startX
                        const newWidthInPx = startWidthInBars * barWidth + deltaX
                        const newLengthInBars = Math.max(1, Math.round(newWidthInPx / barWidth))

                        if (newLengthInBars !== section.length / BEATS_PER_BAR) {
                          handleSectionResize(section.id, newLengthInBars)
                        }
                      }

                      const handleMouseUp = () => {
                        document.removeEventListener("mousemove", handleMouseMove)
                        document.removeEventListener("mouseup", handleMouseUp)
                        document.body.classList.remove("resizing-cursor")
                      }

                      document.addEventListener("mousemove", handleMouseMove)
                      document.addEventListener("mouseup", handleMouseUp)
                    }}
                    aria-label={`Resize clip ${section.name}`}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 h-1/2 w-[3px] bg-primary/40 group-hover:bg-primary/70 rounded-full transition-colors duration-100"></div>
                  </div>
                </div>
              )
            })}
          </SortableContext>
        </div>
      </div>

      <DragOverlay adjustScale={false}>
        {draggedSection ? <TimelineDragPreview section={draggedSection} barWidth={barWidth} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
