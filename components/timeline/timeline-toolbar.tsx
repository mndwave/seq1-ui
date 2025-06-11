"use client"

import { ZoomIn, ZoomOut, Copy, Trash2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TimelineToolbarProps {
  zoomLevel: number
  handleZoom: (direction: "in" | "out") => void
  duplicateSection: (sectionId: string) => void
  deleteSection: (sectionId: string) => void
  createNewSection: () => void
  animatingButtons: Record<string, { action: "copy" | "delete" | "add"; state: "grow" | "shrink" }>
  selectedSection: string | null
  isAddingSection?: boolean
}

const TimelineToolbar = ({
  zoomLevel,
  handleZoom,
  duplicateSection,
  deleteSection,
  createNewSection,
  animatingButtons,
  selectedSection,
  isAddingSection = false,
}: TimelineToolbarProps) => {
  const MIN_ZOOM = 0.1 // Minimum zoom level (most zoomed out)
  const MAX_ZOOM = 2 // Maximum zoom level (most zoomed in)

  // Fix for NaN% issue - ensure we have valid numbers and handle edge cases
  const calculateZoomPercentage = () => {
    // Ensure all values are valid numbers
    const min = Number.isFinite(MIN_ZOOM) ? MIN_ZOOM : 0.1
    const max = Number.isFinite(MAX_ZOOM) ? MAX_ZOOM : 2
    const current = Number.isFinite(zoomLevel) ? zoomLevel : min

    // Prevent division by zero or negative ranges
    if (max <= min) return 0

    // Calculate percentage and ensure it's between 0-100
    const percentage = Math.round(((current - min) / (max - min)) * 100)

    // Ensure the result is a valid number between 0-100
    return Number.isFinite(percentage) ? Math.max(0, Math.min(100, percentage)) : 0
  }

  // Get the zoom percentage with validation
  const zoomPercentage = calculateZoomPercentage()

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className="flex items-center px-1 relative h-5 border-b border-[#3a2a30]"
        style={{
          backgroundColor: "#1a1015",
          position: "relative",
          zIndex: 50,
        }}
      >
        {/* Add section button - always visible */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={createNewSection}
              className={cn(
                "p-1 rounded-sm transition-colors duration-200 relative z-20 toolbar-icon",
                !isAddingSection && "toolbar-icon--active",
                animatingButtons["add-button"]?.action === "add" &&
                  animatingButtons["add-button"]?.state === "grow" &&
                  "animate-button-grow",
                isAddingSection && "cursor-not-allowed opacity-50",
              )}
              disabled={isAddingSection}
            >
              <Plus size={12} className="text-[#a09080]" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Add section</p>
          </TooltipContent>
        </Tooltip>

        {/* Section actions */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => selectedSection && duplicateSection(selectedSection)}
              className={cn(
                "p-1 rounded-sm transition-colors duration-200 relative z-20 ml-0.5 toolbar-icon",
                selectedSection && "toolbar-icon--active",
                animatingButtons[selectedSection || ""]?.action === "copy" &&
                  animatingButtons[selectedSection || ""]?.state === "grow" &&
                  "animate-button-grow",
                !selectedSection && "opacity-50 cursor-not-allowed",
              )}
              disabled={!selectedSection}
            >
              <Copy size={12} className={`${!selectedSection ? "text-[#5a4a50]" : "text-[#a09080]"}`} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Duplicate section</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => selectedSection && deleteSection(selectedSection)}
              className={cn(
                "p-1 rounded-sm transition-colors duration-200 relative z-20 ml-0.5 toolbar-icon",
                selectedSection && "toolbar-icon--active",
                animatingButtons[selectedSection || ""]?.action === "delete" &&
                  animatingButtons[selectedSection || ""]?.state === "grow" &&
                  "animate-button-grow",
                !selectedSection && "opacity-50 cursor-not-allowed",
              )}
              disabled={!selectedSection}
            >
              <Trash2 size={12} className={`${!selectedSection ? "text-[#5a4a50]" : "text-[#a09080]"}`} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Delete section</p>
          </TooltipContent>
        </Tooltip>

        <div className="w-px bg-[#3a2a30] mx-1 z-20 relative self-stretch"></div>

        {/* Zoom controls */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleZoom("out")}
              className={cn(
                "p-0.5 rounded-sm transition-colors duration-200 relative z-20 flex items-center toolbar-icon",
                zoomLevel > MIN_ZOOM && "toolbar-icon--active",
              )}
              disabled={zoomLevel <= MIN_ZOOM}
            >
              <ZoomOut size={12} className={`${zoomLevel <= MIN_ZOOM ? "text-[#5a4a50]" : "text-[#a09080]"}`} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Zoom out</p>
          </TooltipContent>
        </Tooltip>

        <span className="text-[9px] text-[#a09080] w-8 text-center relative z-20 flex items-center justify-center h-full">
          {zoomPercentage}%
        </span>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleZoom("in")}
              className={cn(
                "p-0.5 rounded-sm transition-colors duration-200 relative z-20 flex items-center toolbar-icon",
                zoomLevel < MAX_ZOOM && "toolbar-icon--active",
              )}
              disabled={zoomLevel >= MAX_ZOOM}
            >
              <ZoomIn size={12} className={`${zoomLevel >= MAX_ZOOM ? "text-[#5a4a50]" : "text-[#a09080]"}`} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Zoom in</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}

export default TimelineToolbar
