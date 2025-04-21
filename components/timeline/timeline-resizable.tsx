"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

interface TimelineResizableProps {
  children: React.ReactNode
  className?: string
  minWidth: number
  initialWidth: number
  barWidth: number
  onResize: (newLength: number) => void
  id: string
}

export function TimelineResizable({
  children,
  className,
  minWidth,
  initialWidth,
  barWidth,
  onResize,
  id,
}: TimelineResizableProps) {
  // Calculate the initial size as a percentage of the parent container
  // For our timeline, we'll use a large number as the "total" width
  // and calculate our section's percentage of that
  const totalWidth = 10000 // A large arbitrary number
  const initialSizePercentage = (initialWidth / totalWidth) * 100

  // Handle resize
  const handleResize = (sizes: number[]) => {
    // Convert the percentage back to pixels
    const newWidth = (sizes[0] / 100) * totalWidth

    // Calculate new length in beats, quantized to 1-bar increments (4 beats per bar)
    const newLengthInBeats = Math.max(4, Math.round(((newWidth / barWidth) * 4) / 4) * 4)

    // Call the onResize callback with the new length
    onResize(newLengthInBeats)
  }

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className={cn("h-full", className)}
      onLayout={handleResize}
      autoSaveId={`timeline-section-${id}`}
    >
      <ResizablePanel defaultSize={initialSizePercentage} minSize={(minWidth / totalWidth) * 100} className="h-full">
        {children}
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
