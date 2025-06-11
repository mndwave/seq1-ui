"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip"

interface SliderProps {
  name: string
  value: number
  min?: number
  max?: number
  defaultValue?: number
  orientation?: "horizontal" | "vertical"
  size?: "sm" | "md" | "lg"
  color?: string
  unit?: string
  readOnly?: boolean
  onChange?: (value: number) => void
}

export default function Slider({
  name,
  value,
  min = 0,
  max = 100,
  defaultValue,
  orientation = "vertical",
  size = "md",
  color = "#f0e6c8",
  unit = "%",
  readOnly = true,
  onChange,
}: SliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [startPos, setStartPos] = useState(0)
  const [startValue, setStartValue] = useState(0)
  const [showTooltip, setShowTooltip] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  // Calculate percentage for slider position
  const getPercentage = () => {
    const range = max - min
    const valueInRange = value - min
    return (valueInRange / range) * 100
  }

  // Handle mouse down on slider
  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly) return

    setIsDragging(true)
    setStartPos(orientation === "vertical" ? e.clientY : e.clientX)
    setStartValue(value)

    // Add event listeners to window
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    // Prevent text selection
    e.preventDefault()
  }

  // Handle mouse move
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return

    const rect = sliderRef.current.getBoundingClientRect()
    const size = orientation === "vertical" ? rect.height : rect.width

    // Calculate movement (negative = up/left, positive = down/right)
    const delta = orientation === "vertical" ? startPos - e.clientY : e.clientX - startPos

    // Convert movement to value change
    const range = max - min
    const valueChange = (delta / size) * range

    // Calculate new value (invert for vertical slider)
    let newValue = orientation === "vertical" ? startValue + valueChange : startValue + valueChange

    // Clamp value to min/max
    newValue = Math.max(min, Math.min(max, newValue))

    // Call onChange handler
    if (onChange) {
      onChange(newValue)
    }
  }

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false)

    // Remove event listeners
    window.removeEventListener("mousemove", handleMouseMove)
    window.removeEventListener("mouseup", handleMouseUp)
  }

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  // Determine size classes
  const sizeClasses = {
    sm: orientation === "vertical" ? "h-16 w-3" : "w-16 h-3",
    md: orientation === "vertical" ? "h-20 w-4" : "w-20 h-4",
    lg: orientation === "vertical" ? "h-24 w-5" : "w-24 h-5",
  }

  // Format value for display
  const displayValue = () => {
    if (Number.isInteger(value)) {
      return `${value}${unit}`
    }
    return `${value.toFixed(1)}${unit}`
  }

  return (
    <div className="flex flex-col items-center">
      <TooltipProvider>
        <Tooltip content={`${name}: ${displayValue()}`}>
          <div
            ref={sliderRef}
            className={`relative ${sizeClasses[size]} bg-[#1a1015] border border-[#3a2a30] rounded-sm cursor-pointer`}
            onMouseDown={handleMouseDown}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {/* Slider background with subtle texture */}
            <div className="absolute inset-0 rounded-sm dot-pattern opacity-10"></div>

            {/* Slider track */}
            <div
              className={`absolute ${
                orientation === "vertical" ? "bottom-0 left-0 right-0" : "left-0 top-0 bottom-0"
              } bg-[#3a2a30]`}
              style={{
                height: orientation === "vertical" ? `${getPercentage()}%` : "100%",
                width: orientation === "vertical" ? "100%" : `${getPercentage()}%`,
              }}
            ></div>

            {/* Slider handle */}
            <div
              className={`absolute ${
                orientation === "vertical" ? "left-0 right-0 h-1" : "top-0 bottom-0 w-1"
              } bg-[#f0e6c8]`}
              style={{
                bottom: orientation === "vertical" ? `${getPercentage()}%` : undefined,
                transform: orientation === "vertical" ? "translateY(50%)" : undefined,
                left: orientation === "horizontal" ? `${getPercentage()}%` : undefined,
                transform: orientation === "horizontal" ? "translateX(-50%)" : undefined,
              }}
            ></div>
          </div>
        </Tooltip>
      </TooltipProvider>

      {/* Parameter name */}
      <div className="mt-1 text-[10px] text-[#a09080] text-center max-w-[60px] truncate">{name}</div>

      {/* Value display */}
      <div className="text-[8px] text-[#f0e6c8] font-mono">{displayValue()}</div>
    </div>
  )
}
