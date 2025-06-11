"use client"

import { useState, useEffect } from "react"
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import type { SynthPresetSchema, ControlSchema } from "@/lib/synth-preset-schema"

interface DynamicSynthPresetProps {
  preset: SynthPresetSchema
  className?: string
}

export default function DynamicSynthPreset({ preset, className = "" }: DynamicSynthPresetProps) {
  const [notes, setNotes] = useState<string>(preset.notes || "")
  const highlightColor = preset.highlightColor || "#ff7f50"

  return (
    <div className={`relative ${className}`}>
      {/* Message bubble with vintage hardware-style border with enhanced animation */}
      <div
        className="max-w-full p-4 relative transition-all duration-300 bg-[#1a1015] border-l-2 animate-preset-container"
        style={{
          borderLeftColor: highlightColor,
          boxShadow: `inset 0 0 0 1px rgba(240, 230, 200, 0.1), 
                inset 0 0 0 2px rgba(58, 42, 48, 0.8)`,
        }}
      >
        {/* Patch sheet header with delayed animation */}
        <div className="mb-4 border-b border-[#f0e6c8] pb-1 animate-preset-header">
          <div className="flex items-baseline">
            <span className="text-sm font-medium mr-2 text-[#f0e6c8]">Sound:</span>
            <span className="text-xl font-medium" style={{ color: highlightColor }}>
              {preset.presetName}
            </span>
          </div>
          <div className="text-xs text-[#a09080] mt-1">{preset.deviceName}</div>
        </div>

        {/* Main patch sheet grid with staggered animation */}
        <div className="grid grid-cols-5 border border-[#f0e6c8] bg-[#1a1015]">
          {/* Render each section */}
          {preset.sections.map((section, sectionIndex) => {
            // Calculate section width (default to 1 if not specified)
            const sectionWidth = section.layout.width || 1

            return (
              <div
                key={section.id}
                className={`border-r last:border-r-0 border-[#f0e6c8] p-3 animate-preset-section`}
                style={{
                  gridColumn: `span ${sectionWidth} / span ${sectionWidth}`,
                  animationDelay: `${section.animationDelay || sectionIndex * 100}ms`,
                }}
              >
                <div
                  className={`grid gap-4 h-full`}
                  style={{
                    gridTemplateColumns: `repeat(${section.layout.columns || 1}, minmax(0, 1fr))`,
                    gridTemplateRows: section.layout.rows ? `repeat(${section.layout.rows}, minmax(0, 1fr))` : "auto",
                  }}
                >
                  {/* Render controls for this section */}
                  {section.controls.map((control, controlIndex) => (
                    <div
                      key={control.id}
                      className="flex flex-col items-center animate-preset-knob"
                      style={{ animationDelay: `${control.animationDelay || 400 + controlIndex * 50}ms` }}
                    >
                      {renderControl(control, highlightColor)}
                      {control.type !== "label" && (
                        <div className="text-[10px] text-center mt-1 text-[#f0e6c8]">{control.name}</div>
                      )}
                    </div>
                  ))}

                  {/* Section title at the bottom */}
                  <div
                    className={`col-span-${section.layout.columns || 1} mt-auto text-center font-bold text-sm text-[#f0e6c8]`}
                  >
                    {section.title}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Notes section - with delayed animation */}
        {preset.notes && (
          <div className="mt-4 border border-[#f0e6c8] p-2 animate-preset-section" style={{ animationDelay: "900ms" }}>
            <div className="font-bold text-sm mb-1 text-[#f0e6c8]">Notes:</div>
            <div className="text-sm" style={{ color: highlightColor }}>
              {preset.notes}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Function to render the appropriate control based on type
function renderControl(control: ControlSchema, highlightColor: string) {
  switch (control.type) {
    case "knob":
      return (
        <DynamicKnob
          value={control.value}
          min={control.min || 0}
          max={control.max || 127}
          type={control.displayType || "normal"}
          fillColor={control.fillColor || "transparent"}
          name={control.name}
          tooltip={control.tooltip}
          modulation={control.modulation}
        />
      )
    case "switch":
      return (
        <DynamicSwitch
          value={control.value}
          options={control.options}
          orientation={control.orientation || "horizontal"}
          fillColor={control.fillColor || "transparent"}
          name={control.name}
          tooltip={control.tooltip}
        />
      )
    case "slider":
      return (
        <DynamicSlider
          value={control.value}
          min={control.min || 0}
          max={control.max || 127}
          orientation={control.orientation || "vertical"}
          size={control.size || "md"}
          fillColor={control.fillColor || highlightColor}
          name={control.name}
          unit={control.unit || ""}
          tooltip={control.tooltip}
        />
      )
    case "label":
      return (
        <div
          className={`text-${control.textSize || "xs"} ${control.isBold ? "font-bold" : ""} ${control.isUppercase ? "uppercase" : ""}`}
          style={{ color: control.textColor || "#f0e6c8" }}
        >
          {control.text}
        </div>
      )
    default:
      return null
  }
}

// Dynamic Knob Component
function DynamicKnob({
  value,
  min = 0,
  max = 127,
  type = "normal",
  fillColor = "transparent",
  name = "",
  tooltip = "",
  modulation,
}: {
  value: number
  min?: number
  max?: number
  type?: "normal" | "range" | "frequency" | "waveform"
  fillColor?: string
  name?: string
  tooltip?: string
  modulation?: {
    active: boolean
    minValue: number
    maxValue: number
    speed?: "slow" | "medium" | "fast"
    description?: string
  }
}) {
  // Add state for animated value
  const [animatedValue, setAnimatedValue] = useState(value)

  // Use the animated value or the static value
  const displayValue = modulation?.active ? animatedValue : value

  // Add animation effect when modulation is active
  useEffect(() => {
    if (modulation?.active) {
      const speed = modulation.speed || "medium"
      const duration = speed === "slow" ? 4000 : speed === "medium" ? 2000 : 1000

      const animation = setInterval(() => {
        setAnimatedValue((prev) => {
          // Create a smooth oscillation between min and max values
          const range = modulation.maxValue - modulation.minValue
          const position = (Math.sin(Date.now() / duration) + 1) / 2 // 0 to 1
          return modulation.minValue + position * range
        })
      }, 50)

      return () => clearInterval(animation)
    } else {
      // Reset to static value when modulation is disabled
      setAnimatedValue(value)
    }
  }, [modulation, value])

  // Calculate rotation angle based on value
  const getRotationAngle = () => {
    // For frequency type, we need to map 0-127 to -5 to +5 for display purposes
    if (type === "frequency") {
      // Map the 0-127 range to -150 to 150 degrees (300 degree rotation)
      return -150 + (displayValue / 127) * 300
    }

    const range = max - min
    const valueInRange = displayValue - min
    const percentage = valueInRange / range
    // Map from 0-1 to -150 to 150 degrees (300 degree rotation)
    return -150 + percentage * 300
  }

  // Calculate the rotation in radians for the indicator line
  const rotationAngle = getRotationAngle()
  const rotationRad = (rotationAngle * Math.PI) / 180

  // Calculate the end point of the indicator line
  const centerX = 50
  const centerY = 50

  // Adjusted sizes for better proportions
  const outerRadius = 45 // Outer ring radius (slightly smaller)
  const knobRadius = 35 // Knob body radius (smaller relative to outer ring)
  const indicatorLength = knobRadius - 5 // Indicator line length

  const endX = centerX + indicatorLength * Math.sin(rotationRad)
  const endY = centerY - indicatorLength * Math.cos(rotationRad)

  // Format value for display
  const formatDisplayValue = () => {
    // For frequency type, map 0-127 to -5 to +5
    if (type === "frequency") {
      const mappedValue = (displayValue / 127) * 10 - 5
      return mappedValue.toFixed(1)
    }

    if (Number.isInteger(displayValue)) {
      return `${displayValue}`
    }
    return `${displayValue.toFixed(1)}`
  }

  // Add a pulsing glow effect for modulated knobs
  const glowEffect = modulation?.active
    ? {
        filter: `drop-shadow(0 0 3px ${fillColor !== "transparent" ? fillColor : "#f0e6c8"})`,
        animation: "pulse 2s infinite ease-in-out",
      }
    : {}

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <svg
            width="50"
            height="50"
            viewBox="0 0 100 100"
            style={glowEffect}
            className={modulation?.active ? "animate-pulse-subtle" : ""}
          >
            {/* Outer circle with tick marks - now closer to knob */}
            <circle cx="50" cy="50" r={outerRadius} stroke="#f0e6c8" strokeWidth="1" fill="none" />

            {/* Tick marks - more detailed with varying lengths */}
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i * 15 - 180) * (Math.PI / 180)
              const innerRadius = i % 2 === 0 ? outerRadius - 5 : outerRadius - 3
              const x1 = 50 + innerRadius * Math.cos(angle)
              const y1 = 50 + innerRadius * Math.sin(angle)
              const x2 = 50 + outerRadius * Math.cos(angle)
              const y2 = 50 + outerRadius * Math.sin(angle)

              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f0e6c8" strokeWidth="1" />
            })}

            {/* Value labels based on type - adjusted positions */}
            {type === "range" && (
              <>
                <text x="50" y="25" textAnchor="middle" fill="#f0e6c8" fontSize="7">
                  32'
                </text>
                <text x="70" y="35" textAnchor="middle" fill="#f0e6c8" fontSize="7">
                  16'
                </text>
                <text x="75" y="50" textAnchor="middle" fill="#f0e6c8" fontSize="7">
                  8'
                </text>
                <text x="70" y="70" textAnchor="middle" fill="#f0e6c8" fontSize="7">
                  4'
                </text>
                <text x="50" y="80" textAnchor="middle" fill="#f0e6c8" fontSize="7">
                  2'
                </text>
              </>
            )}
            {type === "frequency" && (
              <>
                <text x="50" y="25" textAnchor="middle" fill="#f0e6c8" fontSize="7">
                  0
                </text>
                <text x="70" y="35" textAnchor="middle" fill="#f0e6c8" fontSize="7">
                  +1
                </text>
                <text x="75" y="50" textAnchor="middle" fill="#f0e6c8" fontSize="7">
                  +2
                </text>
                <text x="70" y="70" textAnchor="middle" fill="#f0e6c8" fontSize="7">
                  +3
                </text>
                <text x="50" y="80" textAnchor="middle" fill="#f0e6c8" fontSize="7">
                  +4
                </text>
                <text x="30" y="70" textAnchor="middle" fill="#f0e6c8" fontSize="7">
                  +5
                </text>
                <text x="25" y="50" textAnchor="middle" fill="#f0e6c8" fontSize="7">
                  -5
                </text>
                <text x="30" y="35" textAnchor="middle" fill="#f0e6c8" fontSize="7">
                  -1
                </text>
              </>
            )}
            {type === "waveform" && (
              <>
                <text x="50" y="25" textAnchor="middle" fill="#f0e6c8" fontSize="7">
                  △
                </text>
                <text x="70" y="35" textAnchor="middle" fill="#f0e6c8" fontSize="7">
                  ◁△
                </text>
                <text x="75" y="50" textAnchor="middle" fill="#f0e6c8" fontSize="7">
                  ◁
                </text>
                <text x="70" y="70" textAnchor="middle" fill="#f0e6c8" fontSize="7">
                  □
                </text>
                <text x="50" y="80" textAnchor="middle" fill="#f0e6c8" fontSize="7">
                  ⊓⊔
                </text>
                <text x="30" y="70" textAnchor="middle" fill="#f0e6c8" fontSize="7">
                  ⊓⊔
                </text>
              </>
            )}

            {/* Knob body - white or colored circle - now smaller */}
            <circle
              cx="50"
              cy="50"
              r={knobRadius}
              fill={fillColor !== "transparent" ? fillColor : "white"}
              stroke="#f0e6c8"
              strokeWidth="1"
            />

            {/* Indicator line - always black and visible */}
            <line x1="50" y1="50" x2={endX} y2={endY} stroke="black" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-[#2a1a20] border border-[#3a2a30] text-[#f0e6c8] text-xs">
          {/* Only show parameter name and value by default */}
          {`${name}: ${formatDisplayValue()}`}

          {/* Only show description if provided */}
          {modulation?.active && modulation.description && <div className="mt-1">{modulation.description}</div>}

          {/* Show regular tooltip if provided and not modulating */}
          {!modulation?.active && tooltip && tooltip !== name && <div className="mt-1">{tooltip}</div>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Dynamic Switch Component
function DynamicSwitch({
  value,
  options,
  orientation = "horizontal",
  fillColor = "transparent",
  name = "",
  tooltip = "",
}: {
  value: string
  options: string[]
  orientation?: "horizontal" | "vertical"
  fillColor?: string
  name?: string
  tooltip?: string
}) {
  // For binary switches (On/Off)
  if (options.length === 2 && orientation === "horizontal") {
    const isOn = value === options[0] // First option is typically "On"

    return (
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <div className="flex flex-col items-center">
              <div className="w-10 h-5 border border-[#f0e6c8]">
                {isOn ? (
                  <div
                    className="w-full h-full"
                    style={{ backgroundColor: fillColor !== "transparent" ? fillColor : "#8badc0" }}
                  ></div>
                ) : (
                  <div className="w-full h-full bg-[#1a1015]"></div>
                )}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-[#2a1a20] border border-[#3a2a30] text-[#f0e6c8] text-xs">
            {tooltip || `${name}: ${value}`}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // For vertical switches
  if (orientation === "vertical") {
    // Calculate which position is selected (0 = top, 1 = bottom)
    const selectedIndex = options.indexOf(value)

    return (
      <TooltipProvider>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <div className="flex flex-col items-center">
              <div className="w-4 h-12 border border-[#f0e6c8] bg-[#1a1015] relative">
                {/* Top position */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1/2 ${selectedIndex === 0 ? "bg-white" : "bg-[#1a1015]"}`}
                />
                {/* Bottom position */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1/2 ${selectedIndex === 1 ? "bg-white" : "bg-[#1a1015]"}`}
                />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="bg-[#2a1a20] border border-[#3a2a30] text-[#f0e6c8] text-xs">
            {tooltip || `${name}: ${value}`}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // For multi-position horizontal switches
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <div className="flex space-x-1">
            {options.map((option, index) => (
              <div key={option} className="w-3 h-5 border border-[#f0e6c8]">
                {value === option ? (
                  <div
                    className="w-full h-full"
                    style={{ backgroundColor: fillColor !== "transparent" ? fillColor : "#8badc0" }}
                  ></div>
                ) : (
                  <div className="w-full h-full bg-[#1a1015]"></div>
                )}
              </div>
            ))}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-[#2a1a20] border border-[#3a2a30] text-[#f0e6c8] text-xs">
          {tooltip || `${name}: ${value}`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Dynamic Slider Component
function DynamicSlider({
  value,
  min = 0,
  max = 127,
  orientation = "vertical",
  size = "md",
  fillColor = "#f0e6c8",
  name = "",
  unit = "",
  tooltip = "",
}: {
  value: number
  min?: number
  max?: number
  orientation?: "horizontal" | "vertical"
  size?: "sm" | "md" | "lg"
  fillColor?: string
  name?: string
  unit?: string
  tooltip?: string
}) {
  // Calculate percentage for slider position
  const getPercentage = () => {
    const range = max - min
    const valueInRange = value - min
    return (valueInRange / range) * 100
  }

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
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <div className={`relative ${sizeClasses[size]} bg-[#1a1015] border border-[#3a2a30] rounded-sm`}>
            {/* Slider background with subtle texture */}
            <div className="absolute inset-0 rounded-sm dot-pattern opacity-10"></div>

            {/* Slider track */}
            <div
              className={`absolute ${orientation === "vertical" ? "bottom-0 left-0 right-0" : "left-0 top-0 bottom-0"}`}
              style={{
                height: orientation === "vertical" ? `${getPercentage()}%` : "100%",
                width: orientation === "vertical" ? "100%" : `${getPercentage()}%`,
                backgroundColor: fillColor,
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
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-[#2a1a20] border border-[#3a2a30] text-[#f0e6c8] text-xs">
          {tooltip || `${name}: ${displayValue()}`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
