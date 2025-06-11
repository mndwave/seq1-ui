"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface KnobProps {
  name: string
  value: number
  min?: number
  max?: number
  defaultValue?: number
  size?: "sm" | "md" | "lg"
  color?: string
  indicatorColor?: string
  unit?: string
  readOnly?: boolean
  onChange?: (value: number) => void
}

export default function Knob({
  name,
  value,
  min = 0,
  max = 100,
  defaultValue,
  size = "md",
  color = "#f0e6c8",
  indicatorColor = "#f0e6c8",
  unit = "",
  readOnly = true,
  onChange,
}: KnobProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [startValue, setStartValue] = useState(0)
  const knobRef = useRef<HTMLDivElement>(null)

  // Calculate rotation angle based on value
  const getRotationAngle = () => {
    const range = max - min
    const valueInRange = value - min
    const percentage = valueInRange / range
    // Map from 0-1 to -150 to 150 degrees (300 degree rotation)
    return -150 + percentage * 300
  }

  // Handle mouse down on knob
  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly) return

    setIsDragging(true)
    setStartY(e.clientY)
    setStartValue(value)

    // Add event listeners to window
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    // Prevent text selection
    e.preventDefault()
  }

  // Handle mouse move
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    // Calculate vertical movement (negative = up, positive = down)
    const deltaY = startY - e.clientY

    // Convert movement to value change (100px = full range)
    const sensitivity = 1.5
    const range = max - min
    const valueChange = (deltaY / 100) * range * sensitivity

    // Calculate new value
    let newValue = startValue + valueChange

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
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  }

  // Format value for display
  const displayValue = () => {
    if (Number.isInteger(value)) {
      return `${value}${unit}`
    }
    return `${value.toFixed(1)}${unit}`
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <div ref={knobRef} className={`relative ${sizeClasses[size]} cursor-pointer`} onMouseDown={handleMouseDown}>
              {/* Simple white circle with indicator line - exactly like the Minimoog patch sheet */}
              <div className="absolute inset-0 rounded-full bg-white border border-gray-300"></div>

              {/* Indicator line */}
              <div
                className="absolute top-1/2 left-1/2 w-[1px] h-[40%] -ml-[0.5px] origin-bottom bg-black"
                style={{
                  transform: `rotate(${getRotationAngle()}deg)`,
                }}
              ></div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{`${name}: ${displayValue()}`}</p>
          </TooltipContent>
        </Tooltip>

        {/* No parameter name displayed in the patch sheet style */}
      </div>
    </TooltipProvider>
  )
}
