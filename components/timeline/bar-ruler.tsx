"use client"

import type React from "react"

import { useRef, useState, useCallback, useEffect } from "react"

interface LoopRegion {
  startBar: number
  endBar: number
}

interface BarRulerProps {
  totalBars: number
  totalWidth: number
  barWidth: number
  timelineRef: React.RefObject<HTMLDivElement>
  setPlayheadPosition: (position: number) => void
  isPlaying: boolean
  onHoverBarChange?: (barPosition: number | null) => void
  loopRegion: LoopRegion | null
  isDraggingLoop?: boolean
  dragStartBar: number | null
  currentDragBar: number | null
  onLoopDragStart?: (barPosition: number) => void
  onLoopDrag?: (barPosition: number) => void
  onLoopDragEnd?: (shouldCreateLoop?: boolean, startBar?: number, endBar?: number) => void
}

export default function BarRuler({
  totalBars,
  totalWidth,
  barWidth,
  timelineRef,
  setPlayheadPosition = () => console.warn("setPlayheadPosition not provided to BarRuler"),
  isPlaying = false,
  onHoverBarChange,
  loopRegion,
  isDraggingLoop = false,
  dragStartBar,
  currentDragBar,
  onLoopDragStart,
  onLoopDrag,
  onLoopDragEnd,
}: BarRulerProps) {
  const rulerRef = useRef<HTMLDivElement>(null)
  const [hoverBar, setHoverBar] = useState<number | null>(null)
  const [pendingBar, setPendingBar] = useState<number | null>(null)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const DRAG_THRESHOLD = barWidth * 0.25 // Threshold for minimum drag distance
  const [initialMouseX, setInitialMouseX] = useState<number | null>(null)
  const [currentMouseX, setCurrentMouseX] = useState<number | null>(null)
  const [hasExceededThreshold, setHasExceededThreshold] = useState(false)

  // Internal state to track drag start and current positions
  const [internalDragStartBar, setInternalDragStartBar] = useState<number | null>(null)
  const [internalCurrentDragBar, setInternalCurrentDragBar] = useState<number | null>(null)
  const [isInternalDragging, setIsInternalDragging] = useState(false)

  // State to track completed loop region for persistence
  const [completedLoopRegion, setCompletedLoopRegion] = useState<LoopRegion | null>(null)

  // Ensure we have a minimum width that's large enough
  const minWidth = totalBars * barWidth

  // Use the larger of calculated width or minimum width
  const effectiveWidth = Math.max(totalWidth, minWidth)

  // Function to handle bar click
  const handleBarClick = useCallback(
    (e: React.MouseEvent) => {
      // If we're dragging for loop selection, don't handle click
      if (isDraggingLoop || isInternalDragging) return

      const rect = rulerRef.current?.getBoundingClientRect()
      if (!rect) return

      const clickX = e.clientX - rect.left
      let targetBar = Math.floor(clickX / barWidth)
      targetBar = Math.max(0, Math.min(totalBars - 1, targetBar)) // Clamp to valid range

      const targetPosition = targetBar * barWidth

      if (typeof setPlayheadPosition !== "function") {
        console.warn("setPlayheadPosition is not a function in BarRuler")
        return
      }

      if (isPlaying) {
        // Schedule a jump to the next bar
        setPendingBar(targetBar)
        setTimeout(() => {
          setPlayheadPosition(targetPosition)
          setPendingBar(null)
        }, 100) // Short delay to simulate scheduling
      } else {
        // Seek immediately
        setPlayheadPosition(targetPosition)
      }
    },
    [barWidth, isPlaying, setPlayheadPosition, totalBars, isDraggingLoop, isInternalDragging],
  )

  // Handle mouse movement to update hover bar
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = rulerRef.current?.getBoundingClientRect()
      if (!rect) return

      const mouseX = e.clientX - rect.left
      setCurrentMouseX(mouseX)

      let nearestBar = Math.floor(mouseX / barWidth)
      nearestBar = Math.max(0, Math.min(totalBars - 1, nearestBar)) // Clamp to valid range

      // Always update the hover bar
      setHoverBar(nearestBar)

      // Always notify parent component about hover bar change
      if (onHoverBarChange) {
        onHoverBarChange(nearestBar)
      }

      // If we're in mouse down state, check for threshold and update drag position
      if (isMouseDown && initialMouseX !== null) {
        const pixelMovement = Math.abs(mouseX - initialMouseX)
        const hasMovedBeyondThreshold = pixelMovement >= DRAG_THRESHOLD

        // Only start dragging if we've moved beyond the threshold
        if (hasMovedBeyondThreshold) {
          setHasExceededThreshold(true)

          // Update internal current drag bar
          if (internalDragStartBar !== null) {
            setInternalCurrentDragBar(nearestBar)
            setIsInternalDragging(true)
          }

          // Also call the parent's onLoopDrag if provided
          if (onLoopDrag) {
            console.log("Dragging loop to bar:", nearestBar)
            onLoopDrag(nearestBar)
          }
        }
      }
    },
    [
      barWidth,
      totalBars,
      onHoverBarChange,
      isMouseDown,
      onLoopDrag,
      initialMouseX,
      internalDragStartBar,
      DRAG_THRESHOLD,
    ],
  )

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setHoverBar(null)

    // Notify parent component about hover bar change
    if (onHoverBarChange) {
      onHoverBarChange(null)
    }
  }, [onHoverBarChange])

  // Handle mouse down for loop selection
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      console.log("Mouse down on bar ruler")
      const rect = rulerRef.current?.getBoundingClientRect()
      if (!rect) return

      const mouseX = e.clientX - rect.left
      setInitialMouseX(mouseX) // Store initial mouse position
      setCurrentMouseX(mouseX) // Initialize current mouse position
      setHasExceededThreshold(false) // Reset threshold flag

      let nearestBar = Math.floor(mouseX / barWidth)
      nearestBar = Math.max(0, Math.min(totalBars - 1, nearestBar)) // Clamp to valid range

      // Set internal drag start bar
      setInternalDragStartBar(nearestBar)
      setInternalCurrentDragBar(nearestBar)

      // Clear any completed loop region when starting a new drag
      setCompletedLoopRegion(null)

      setIsMouseDown(true)

      // Start potential loop region drag
      if (onLoopDragStart) {
        console.log("Starting loop drag at bar:", nearestBar)
        onLoopDragStart(nearestBar)
      }
    },
    [barWidth, totalBars, onLoopDragStart],
  )

  // Handle mouse up for loop selection
  const handleMouseUp = useCallback(() => {
    if (isMouseDown) {
      console.log("Mouse up, ending loop drag")
      setIsMouseDown(false)

      // If we've exceeded the threshold, create a completed loop region
      if (hasExceededThreshold && internalDragStartBar !== null && internalCurrentDragBar !== null) {
        const startBar = Math.min(internalDragStartBar, internalCurrentDragBar)
        const endBar = Math.max(internalDragStartBar, internalCurrentDragBar) + 1 // +1 to include the end bar

        // Store the completed loop region
        setCompletedLoopRegion({ startBar, endBar })

        // End loop region drag with flag indicating whether to create a loop
        if (onLoopDragEnd) {
          console.log("Ending loop drag with region:", startBar, endBar)
          onLoopDragEnd(true, startBar, endBar)
        }
      } else {
        // No valid loop region, just end the drag
        if (onLoopDragEnd) {
          onLoopDragEnd(false)
        }

        // Clear any completed loop region
        setCompletedLoopRegion(null)
      }

      // Only keep internal drag state if threshold was exceeded
      if (!hasExceededThreshold) {
        setIsInternalDragging(false)
        setInternalDragStartBar(null)
        setInternalCurrentDragBar(null)
      } else {
        setIsInternalDragging(false) // End active dragging but keep the positions
      }

      // Reset mouse tracking
      setInitialMouseX(null)
      setCurrentMouseX(null)
      setHasExceededThreshold(false)
    }
  }, [isMouseDown, onLoopDragEnd, hasExceededThreshold, internalDragStartBar, internalCurrentDragBar])

  // Add global mouse up handler to handle cases where mouse is released outside the ruler
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isMouseDown) {
        setIsMouseDown(false)

        // If we've exceeded the threshold, create a completed loop region
        if (hasExceededThreshold && internalDragStartBar !== null && internalCurrentDragBar !== null) {
          const startBar = Math.min(internalDragStartBar, internalCurrentDragBar)
          const endBar = Math.max(internalDragStartBar, internalCurrentDragBar) + 1 // +1 to include the end bar

          // Store the completed loop region
          setCompletedLoopRegion({ startBar, endBar })

          // End loop region drag with flag indicating whether to create a loop
          if (onLoopDragEnd) {
            console.log("Ending loop drag with region:", startBar, endBar)
            onLoopDragEnd(true, startBar, endBar)
          }
        } else {
          // No valid loop region, just end the drag
          if (onLoopDragEnd) {
            onLoopDragEnd(false)
          }

          // Clear any completed loop region
          setCompletedLoopRegion(null)
        }

        // Only keep internal drag state if threshold was exceeded
        if (!hasExceededThreshold) {
          setIsInternalDragging(false)
          setInternalDragStartBar(null)
          setInternalCurrentDragBar(null)
        } else {
          setIsInternalDragging(false) // End active dragging but keep the positions
        }

        // Reset mouse tracking
        setInitialMouseX(null)
        setCurrentMouseX(null)
        setHasExceededThreshold(false)
      }
    }

    window.addEventListener("mouseup", handleGlobalMouseUp)
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [isMouseDown, onLoopDragEnd, hasExceededThreshold, internalDragStartBar, internalCurrentDragBar])

  // Update completedLoopRegion when loopRegion prop changes
  useEffect(() => {
    if (loopRegion) {
      setCompletedLoopRegion(loopRegion)
    }
  }, [loopRegion])

  // Calculate the current loop region display
  const getLoopRegionDisplay = () => {
    // First, check if we have an active internal drag with threshold exceeded
    if (
      isInternalDragging &&
      hasExceededThreshold &&
      internalDragStartBar !== null &&
      internalCurrentDragBar !== null
    ) {
      console.log("Using internal drag display:", internalDragStartBar, internalCurrentDragBar)
      const startBar = Math.min(internalDragStartBar, internalCurrentDragBar)
      const endBar = Math.max(internalDragStartBar, internalCurrentDragBar) + 1 // +1 to include the end bar

      return {
        left: startBar * barWidth,
        width: (endBar - startBar) * barWidth,
      }
    }

    // Next, check if we have a completed internal loop region
    else if (completedLoopRegion) {
      console.log("Using completed loop region:", completedLoopRegion.startBar, completedLoopRegion.endBar)
      return {
        left: completedLoopRegion.startBar * barWidth,
        width: (completedLoopRegion.endBar - completedLoopRegion.startBar) * barWidth,
      }
    }

    // Then check for active dragging from props
    else if (isDraggingLoop && dragStartBar !== null && currentDragBar !== null) {
      console.log("Displaying active drag loop region:", dragStartBar, currentDragBar)
      // During drag, show the current selection
      const startBar = Math.min(dragStartBar, currentDragBar)
      const endBar = Math.max(dragStartBar, currentDragBar) + 1 // +1 to include the end bar

      return {
        left: startBar * barWidth,
        width: (endBar - startBar) * barWidth,
      }
    }

    // Finally, check for an existing loop region from props
    else if (loopRegion) {
      console.log("Displaying existing loop region:", loopRegion.startBar, loopRegion.endBar)
      // Show the set loop region
      return {
        left: loopRegion.startBar * barWidth,
        width: (loopRegion.endBar - loopRegion.startBar) * barWidth,
      }
    }

    return null
  }

  const loopDisplay = getLoopRegionDisplay()

  // Reset internal drag state when a new drag starts
  useEffect(() => {
    if (isDraggingLoop && dragStartBar !== null && dragStartBar !== internalDragStartBar) {
      setInternalDragStartBar(dragStartBar)
      setInternalCurrentDragBar(dragStartBar)
    }
  }, [isDraggingLoop, dragStartBar, internalDragStartBar])

  return (
    <div
      ref={rulerRef}
      className="timeline-header h-4 relative bg-[#1a1015] cursor-pointer"
      style={{
        position: "relative",
        zIndex: 20,
        width: `${effectiveWidth}px`,
        minWidth: "100%",
        overflowX: "visible",
        pointerEvents: "auto", // Ensure pointer events are enabled
        userSelect: "none", // Prevent text selection during drag
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleBarClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Bar markers container */}
      <div
        className="absolute inset-0 flex items-center"
        style={{
          width: `${effectiveWidth}px`,
          minWidth: `${totalBars * barWidth}px`, // Ensure minimum width covers all bars
          userSelect: "none", // Prevent text selection during drag
          height: "calc(100% - 1px)", // Leave space for the border at the bottom
        }}
      >
        {/* Force render all bars up to totalBars */}
        {Array.from({ length: totalBars }).map((_, i) => {
          // Show numbers for every 4th bar (1, 5, 9, 13, etc.)
          const showNumber = i === 0 || (i + 1) % 4 === 1

          return (
            <div
              key={`bar-${i}`}
              className="absolute flex items-center"
              style={{
                left: `${i * barWidth}px`,
                top: 0,
                bottom: 0,
                width: "1px",
                backgroundColor: showNumber ? "#f0e6c8" : "#3a2a30",
                height: showNumber ? "100%" : "6px",
              }}
            >
              {showNumber && (
                <div
                  className="absolute text-[9px] text-[#a09080] flex items-center"
                  style={{
                    left: "4px",
                    userSelect: "none", // Prevent text selection during drag
                  }}
                >
                  {i + 1}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Loop region highlight */}
      {loopDisplay && (
        <div
          className="absolute pointer-events-none"
          style={{
            height: "calc(100% - 1px)", // Leave space for the border at the bottom
          }}
        >
          {/* Main loop region highlight */}
          <div
            className="absolute pointer-events-none"
            style={{
              position: "absolute",
              left: `${loopDisplay.left}px`,
              width: `${loopDisplay.width}px`,
              backgroundColor: "rgba(66, 135, 245, 0.2)", // Back to original blue color
              top: 0,
              height: "100%",
              pointerEvents: "none",
            }}
          />

          {/* Left edge marker */}
          <div
            className="absolute pointer-events-none"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${loopDisplay.left}px`,
              width: "2px",
              backgroundColor: "rgba(66, 135, 245, 0.8)", // Increased opacity for visibility
            }}
          />

          {/* Right edge marker */}
          <div
            className="absolute pointer-events-none"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${loopDisplay.left + loopDisplay.width - 2}px`, // Position from left instead of right
              width: "2px",
              backgroundColor: "rgba(66, 135, 245, 0.8)", // Increased opacity for visibility
            }}
          />
        </div>
      )}

      {/* Pending playhead - pulsing secondary playhead */}
      {pendingBar !== null && (
        <div
          className="absolute top-0 bottom-0 w-[1px] animate-pulse"
          style={{
            left: `${pendingBar * barWidth}px`,
            backgroundColor: "rgba(255, 255, 255, 0.3)",
            pointerEvents: "none",
            height: "calc(100% - 1px)", // Leave space for the border at the bottom
          }}
        />
      )}

      {/* Bottom border as a separate element */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          position: "absolute",
          bottom: 0,
          height: "1px",
          backgroundColor: "#3a2a30", // Original color
          width: `${effectiveWidth}px`,
          zIndex: 30, // Very high z-index to ensure it's on top
        }}
      />
    </div>
  )
}
