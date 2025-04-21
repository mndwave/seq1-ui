"use client"

import type React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRef, useEffect, useState, type KeyboardEvent, useCallback } from "react"
import type { TimelineClip } from "@/lib/timeline-clip-schema"

// Add constants for the width thresholds
const LABEL_VISIBILITY_THRESHOLD = 90 // px
const MOVE_HANDLE_VISIBILITY_THRESHOLD = 50 // px

interface SortableTimelineSectionProps {
  section: TimelineClip
  index: number
  isSelected: boolean
  barWidth: number
  showDragHandle: boolean
  onSelect: (id: string, event: React.MouseEvent<HTMLDivElement>) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onNameChange?: (id: string, newName: string) => void
  animatingButtons: { [key: string]: { state: "idle" | "shrink" | "grow" } }
  showControls: boolean
}

// Update the SortableTimelineSection component to include width detection
export function SortableTimelineSection({
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
  showControls,
}: SortableTimelineSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
    animateLayoutChanges: () => false,
  })

  // Add state to track section width
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

  // Apply transforms with dnd-kit's CSS helpers
  const style: React.CSSProperties = {
    width: "100%",
    height: "100%",
    borderLeft: index === 0 ? "1px solid #3a2a30" : "none",
    backgroundColor: `${sectionColor}40`,
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    transformOrigin: "left",
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
    if (editValue.trim() !== "" && onNameChange) {
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
        "h-full border-r border-[#3a2a30] relative group section-transition",
        isSelected && "bg-[#2a1a20] ring-2 ring-[#f0e6c8] ring-opacity-50 ring-inset transition-all duration-200",
        isDragging && "timeline-section-dragging",
        animatingButtons[section.id]?.state === "shrink" && "animate-button-shrink",
      )}
      style={style}
      onClick={(e) => onSelect(section.id, e)}
    >
      {/* Section content */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center section-content",
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

      {/* Drag handle */}
      {showMoveHandle && (
        <div
          {...attributes}
          {...listeners}
          className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing bg-[#2a1a20] bg-opacity-50 hover:bg-opacity-70 drag-handle"
          style={{
            zIndex: 20,
            touchAction: "none",
            // Add a clip-path to ensure it doesn't overlap with the border
            clipPath: isSelected ? "inset(3px 0 3px 3px)" : "none",
          }}
        >
          <GripHorizontal size={14} className="text-[#f0e6c8]" />
        </div>
      )}
    </div>
  )
}

// Update the TimelineDragPreview component to match the selected border style
export function TimelineDragPreview({ section, barWidth }: { section: TimelineClip | null; barWidth: number }) {
  if (!section) return null

  const sectionColor = section.color || "#e07a8a"
  const width = (section.length / 4) * barWidth
  const showLabel = width >= LABEL_VISIBILITY_THRESHOLD

  return (
    <div
      className="h-full bg-opacity-70 drag-preview ring-2 ring-[#f0e6c8] ring-opacity-50 ring-dashed"
      style={{
        width: `${width}px`,
        backgroundColor: `${sectionColor}60`,
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
