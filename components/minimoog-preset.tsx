"use client"

import { useState, useEffect } from "react"

// Add tooltip imports at the top of the file
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

interface MiniMoogPresetProps {
  presetName: string
  className?: string
}

// Update the existing component to use the new animation classes
export default function MiniMoogPreset({ presetName, className = "" }: MiniMoogPresetProps) {
  const [notes, setNotes] = useState<string>("")

  // Add state for animated knob values
  const [cutoffValue, setCutoffValue] = useState(89)
  const [sustainValue, setSustainValue] = useState(89)

  // Update the animation speeds to make them faster and more noticeable
  useEffect(() => {
    const cutoffAnimation = setInterval(() => {
      setCutoffValue((prev) => {
        // Create a smooth oscillation between 40 and 90
        const position = (Math.sin(Date.now() / 1000) + 1) / 2 // 0 to 1, faster speed (1000ms)
        return 40 + position * 50 // 40 to 90
      })
    }, 30) // More frequent updates for smoother animation

    return () => clearInterval(cutoffAnimation)
  }, [])

  // Add animation effect for the sustain knob
  useEffect(() => {
    const sustainAnimation = setInterval(() => {
      setSustainValue((prev) => {
        // Create a smooth oscillation between 70 and 110
        const position = (Math.sin(Date.now() / 2000) + 1) / 2 // 0 to 1, medium speed (2000ms)
        return 70 + position * 40 // 70 to 110
      })
    }, 30) // More frequent updates for smoother animation

    return () => clearInterval(sustainAnimation)
  }, [])

  return (
    <div className={`relative ${className}`}>
      {/* Message bubble with vintage hardware-style border but with enhanced animation */}
      <div
        className="max-w-full p-4 relative transition-all duration-300 bg-[#1a1015] border-l-2 border-[#f5a623] animate-preset-container"
        style={{
          boxShadow: `inset 0 0 0 1px rgba(240, 230, 200, 0.1), 
                inset 0 0 0 2px rgba(58, 42, 48, 0.8)`,
        }}
      >
        {/* Patch sheet header with delayed animation */}
        <div className="mb-4 border-b border-[#f0e6c8] pb-1 animate-preset-header">
          <div className="flex items-baseline">
            <span className="text-sm font-medium mr-2 text-[#f0e6c8]">Sound:</span>
            <span className="text-xl font-medium text-[#ff7f50]">{presetName}</span>
          </div>
        </div>

        {/* Main patch sheet grid with staggered animation */}
        <div className="grid grid-cols-5 border border-[#f0e6c8] bg-[#1a1015]">
          {/* CONTROLLERS section */}
          <div className="border-r border-[#f0e6c8] p-3 animate-preset-section" style={{ animationDelay: "300ms" }}>
            <div className="flex flex-col h-full items-center justify-between">
              {/* Keep the existing structure but add animation classes */}
              <div className="mb-4 flex flex-col items-center animate-preset-knob" style={{ animationDelay: "400ms" }}>
                <MiniMoogKnob value={64} min={0} max={127} name="TUNE" />
                <div className="text-[10px] text-center mt-1 text-[#f0e6c8]">TUNE</div>
              </div>

              <div className="mb-4 flex flex-col items-center animate-preset-knob" style={{ animationDelay: "450ms" }}>
                <MiniMoogKnob value={0} min={0} max={127} name="GLIDE" />
                <div className="text-[10px] text-center mt-1 text-[#f0e6c8]">GLIDE</div>
              </div>

              <div className="mb-4 flex flex-col items-center animate-preset-knob" style={{ animationDelay: "500ms" }}>
                <MiniMoogKnob value={89} min={0} max={127} fillColor="#ff7f50" name="MOD MIX" />
                <div className="text-[10px] text-center mt-1 text-[#f0e6c8]">MOD MIX</div>
              </div>

              <div className="mb-4 flex flex-col items-center animate-preset-knob" style={{ animationDelay: "550ms" }}>
                <SwitchComponent value="On" options={["On", "Off"]} fillColor="#ff7f50" name="OSC MOD" />
                <div className="text-[10px] text-center mt-1 text-[#f0e6c8]">OSC MOD</div>
              </div>

              <div className="mb-4 flex flex-col items-center animate-preset-knob" style={{ animationDelay: "600ms" }}>
                <SwitchComponent value="Off" options={["On", "Off"]} name="FILTER MOD" />
                <div className="text-[10px] text-center mt-1 text-[#f0e6c8]">FILTER MOD</div>
              </div>

              <div className="mt-auto text-center font-bold text-sm text-[#f0e6c8]">CONTROLLERS</div>
            </div>
          </div>

          {/* OSCILLATOR BANK section - with staggered animation */}
          <div className="border-r border-[#f0e6c8] p-3 animate-preset-section" style={{ animationDelay: "400ms" }}>
            <div className="grid grid-cols-2 gap-4 h-full">
              {/* Continue with the existing structure but add animation classes to each control */}
              <div className="flex flex-col items-center animate-preset-knob" style={{ animationDelay: "450ms" }}>
                <MiniMoogKnob value={32} min={2} max={32} type="range" name="RANGE" />
                <div className="text-[10px] text-center mt-1 text-[#f0e6c8]">RANGE</div>
              </div>

              <div className="flex flex-col items-center animate-preset-knob" style={{ animationDelay: "500ms" }}>
                <MiniMoogKnob value={64} min={0} max={127} type="frequency" name="OSC1 FREQ" />
                <div className="text-[10px] text-center mt-1 text-[#f0e6c8]">OSC1 FREQ</div>
              </div>

              <div className="flex flex-col items-center animate-preset-knob" style={{ animationDelay: "550ms" }}>
                <MiniMoogKnob value={64} min={0} max={127} type="frequency" name="OSC2 FREQ" />
                <div className="text-[10px] text-center mt-1 text-[#f0e6c8]">OSC2 FREQ</div>
              </div>

              <div className="flex flex-col items-center animate-preset-knob" style={{ animationDelay: "600ms" }}>
                <MiniMoogKnob value={51} min={0} max={127} type="waveform" name="WAVEFORM" />
                <div className="text-[10px] text-center mt-1 text-[#f0e6c8]">WAVEFORM</div>
              </div>

              <div className="flex flex-col items-center animate-preset-knob" style={{ animationDelay: "650ms" }}>
                <MiniMoogKnob value={64} min={0} max={127} type="frequency" name="OSC3 FREQ" />
                <div className="text-[10px] text-center mt-1 text-[#f0e6c8]">OSC3 FREQ</div>
              </div>

              <div className="flex flex-col items-center animate-preset-knob" style={{ animationDelay: "700ms" }}>
                <MiniMoogKnob value={76} min={0} max={127} type="waveform" name="WAVEFORM" />
                <div className="text-[10px] text-center mt-1 text-[#f0e6c8]">WAVEFORM</div>
              </div>

              <div className="col-span-2 mt-auto text-center font-bold text-sm text-[#f0e6c8]">OSCILLATOR BANK</div>
            </div>
          </div>

          {/* MIXER section - with staggered animation */}
          <div className="border-r border-[#f0e6c8] p-3 animate-preset-section" style={{ animationDelay: "500ms" }}>
            <div className="flex flex-col h-full items-center justify-between">
              <div className="mb-4 flex flex-col items-center animate-preset-knob" style={{ animationDelay: "550ms" }}>
                <MiniMoogKnob value={102} min={0} max={127} fillColor="#8badc0" name="VOLUME" />
                <div className="text-[10px] text-center mt-1 text-[#f0e6c8]">VOLUME</div>
              </div>

              <div className="mb-4 flex flex-col items-center animate-preset-knob" style={{ animationDelay: "600ms" }}>
                <SwitchComponent value="On" options={["On", "Off"]} fillColor="#8badc0" name="OSC1" />
                <div className="text-[10px] text-center mt-1 text-[#f0e6c8]">OSC1</div>
              </div>

              <div className="mb-4 flex flex-col items-center animate-preset-knob" style={{ animationDelay: "650ms" }}>
                <SwitchComponent value="On" options={["On", "Off"]} fillColor="#8badc0" name="OSC2" />
                <div className="text-[10px] text-center mt-1 text-[#f0e6c8]">OSC2</div>
              </div>

              <div className="mb-4 flex flex-col items-center animate-preset-knob" style={{ animationDelay: "700ms" }}>
                <MiniMoogKnob value={0} min={0} max={127} name="NOISE" />
                <div className="text-[10px] text-center mt-1 text-[#f0e6c8]">NOISE</div>
              </div>

              <div className="mb-4 flex flex-col items-center animate-preset-knob" style={{ animationDelay: "750ms" }}>
                <VerticalSwitchComponent value="White" options={["White", "Pink"]} name="NOISE TYPE" />
                <div className="text-[10px] text-center mt-1 text-[#f0e6c8]">
                  WHITE
                  <br />
                  PINK
                </div>
              </div>

              <div className="mt-auto text-center font-bold text-sm text-[#f0e6c8]">MIXER</div>
            </div>
          </div>

          {/* MODIFIERS section - with staggered animation */}
          <div className="border-r border-[#f0e6c8] p-3 animate-preset-section" style={{ animationDelay: "600ms" }}>
            <div className="grid grid-cols-3 gap-3 h-full">
              {/* Continue with existing structure but add animation classes */}
              <div className="flex flex-col items-center animate-preset-knob" style={{ animationDelay: "650ms" }}>
                {/* Use the animated cutoff value */}
                <MiniMoogKnob
                  value={cutoffValue}
                  min={0}
                  max={127}
                  fillColor="#ff7f50"
                  name="CUTOFF"
                  isModulating={true}
                  modulationRange="40-90"
                />
                <div className="text-[10px] text-center mt-1 text-[#f0e6c8]">CUTOFF</div>
              </div>

              <div className="flex flex-col items-center animate-preset-knob" style={{ animationDelay: "675ms" }}>
                <MiniMoogKnob value={51} min={0} max={127} fillColor="#ff7f50" name="RESONANCE" />
                <div className="text-[10px] text-center mt-1 text-[#f0e6c8]">RESONANCE</div>
              </div>

              <div className="flex flex-col items-center animate-preset-knob" style={{ animationDelay: "700ms" }}>
                <MiniMoogKnob value={76} min={0} max={127} fillColor="#ff7f50" name="CONTOUR" />
                <div className="text-[10px] text-center mt-1 text-[#f0e6c8]">CONTOUR</div>
              </div>

              <div className="col-span-3 text-[10px] text-center font-bold text-[#f0e6c8]">FILTER CONTOUR</div>

              <div className="flex flex-col items-center animate-preset-knob" style={{ animationDelay: "725ms" }}>
                <MiniMoogKnob value={0} min={0} max={127} name="FILTER ATTACK" />
                <div className="text-[10px] text-center mt-1 text-[#f0e6c8]">ATTACK</div>
              </div>

              <div className="flex flex-col items-center animate-preset-knob" style={{ animationDelay: "750ms" }}>
                <MiniMoogKnob value={64} min={0} max={127} name="FILTER DECAY" />
                <div className="text-[10px] text-center mt-1 text-[#f0e6c8]">DECAY</div>
              </div>

              <div className="flex flex-col items-center animate-preset-knob" style={{ animationDelay: "775ms" }}>
                <MiniMoogKnob value={76} min={0} max={127} name="FILTER SUSTAIN" />
                <div className="text-[10px] text-center mt-1 text-[#f0e6c8]">SUSTAIN</div>
              </div>

              <div className="col-span-3 text-[10px] text-center font-bold text-[#f0e6c8]">LOUDNESS CONTOUR</div>

              <div className="flex flex-col items-center animate-preset-knob" style={{ animationDelay: "800ms" }}>
                <MiniMoogKnob value={0} min={0} max={127} name="LOUDNESS ATTACK" />
                <div className="text-[10px] text-center mt-1 text-[#f0e6c8]">ATTACK</div>
              </div>

              <div className="flex flex-col items-center animate-preset-knob" style={{ animationDelay: "825ms" }}>
                <MiniMoogKnob value={51} min={0} max={127} name="LOUDNESS DECAY" />
                <div className="text-[10px] text-center mt-1 text-[#f0e6c8]">DECAY</div>
              </div>

              <div className="flex flex-col items-center animate-preset-knob" style={{ animationDelay: "850ms" }}>
                {/* Use the animated sustain value */}
                <MiniMoogKnob
                  value={sustainValue}
                  min={0}
                  max={127}
                  fillColor="#ff7f50"
                  name="LOUDNESS SUSTAIN"
                  isModulating={true}
                  modulationRange="70-110"
                />
                <div className="text-[10px] text-center mt-1 text-[#f0e6c8]">SUSTAIN</div>
              </div>

              <div className="col-span-3 mt-auto text-center font-bold text-sm text-[#f0e6c8]">MODIFIERS</div>
            </div>
          </div>

          {/* OUTPUT section - with staggered animation */}
          <div className="p-3 animate-preset-section" style={{ animationDelay: "700ms" }}>
            <div className="flex flex-col h-full items-center justify-between">
              <div className="mb-4 flex flex-col items-center animate-preset-knob" style={{ animationDelay: "750ms" }}>
                <MiniMoogKnob value={102} min={0} max={127} name="OUTPUT VOLUME" />
                <div className="text-[10px] text-center mt-1 text-[#f0e6c8]">VOLUME</div>
              </div>

              <div className="mb-4 flex flex-col items-center animate-preset-knob" style={{ animationDelay: "800ms" }}>
                <SwitchComponent value="On" options={["On", "Off"]} fillColor="#8badc0" name="MAIN OUT" />
                <div className="text-[10px] text-center mt-1 text-[#f0e6c8]">MAIN OUT</div>
              </div>

              <div className="mt-auto text-center font-bold text-sm text-[#f0e6c8]">OUTPUT</div>
            </div>
          </div>
        </div>

        {/* Notes section - with delayed animation */}
        <div className="mt-4 border border-[#f0e6c8] p-2 animate-preset-section" style={{ animationDelay: "900ms" }}>
          <div className="font-bold text-sm mb-1 text-[#f0e6c8]">Notes:</div>
          <div className="text-sm text-[#ff7f50]">
            Use Oscillator-3 Frequency knob to adjust modulation rate. Try sweeping the CUTOFF and SUSTAIN knobs for
            expressive timbral changes.
          </div>
        </div>
      </div>
    </div>
  )
}

// Update the MiniMoogKnob function to include a more prominent flashing ring
function MiniMoogKnob({
  value,
  min = 0,
  max = 127,
  type = "normal",
  fillColor = "transparent",
  name = "",
  isModulating = false,
  modulationRange = "",
}: {
  value: number
  min?: number
  max?: number
  type?: "normal" | "range" | "frequency" | "waveform"
  fillColor?: string
  name?: string
  isModulating?: boolean
  modulationRange?: string
}) {
  // Calculate rotation angle based on value
  const getRotationAngle = () => {
    // For frequency type, we need to map 0-127 to -5 to +5 for display purposes
    if (type === "frequency") {
      // Map the 0-127 range to -150 to 150 degrees (300 degree rotation)
      return -150 + (value / 127) * 300
    }

    const range = max - min
    const valueInRange = value - min
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
  const displayValue = () => {
    // Get the current value to display
    const currentValue = value

    // For frequency type, map 0-127 to -5 to +5
    if (type === "frequency") {
      const mappedValue = (currentValue / 127) * 10 - 5
      return mappedValue.toFixed(1)
    }

    if (Number.isInteger(currentValue)) {
      return `${currentValue}`
    }
    return `${currentValue.toFixed(1)}`
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <svg width="50" height="50" viewBox="0 0 100 100" className={isModulating ? "animate-pulse-subtle" : ""}>
            {/* Outer circle with tick marks */}
            <circle cx="50" cy="50" r={outerRadius} stroke="#f0e6c8" strokeWidth="1" fill="none" />

            {/* Add a flashing ring for modulating knobs */}
            {isModulating && (
              <circle
                cx="50"
                cy="50"
                r={outerRadius + 3}
                stroke={fillColor !== "transparent" ? fillColor : "#f0e6c8"}
                strokeWidth="2"
                fill="none"
                className="animate-flash-ring"
              />
            )}

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

            {/* Add a subtle glow effect for modulating knobs */}
            {isModulating && (
              <circle
                cx="50"
                cy="50"
                r={knobRadius}
                fill="none"
                stroke={fillColor !== "transparent" ? fillColor : "#f0e6c8"}
                strokeWidth="2"
                className="animate-knob-glow"
                style={{ filter: `drop-shadow(0 0 3px ${fillColor !== "transparent" ? fillColor : "#f0e6c8"})` }}
              />
            )}

            {/* Indicator line - always black and visible */}
            <line x1="50" y1="50" x2={endX} y2={endY} stroke="black" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-[#2a1a20] border border-[#3a2a30] text-[#f0e6c8] text-xs">
          {isModulating ? (
            <div className="animate-text-flash">
              <div className="font-bold">
                {name}: {displayValue()}
              </div>
              <div className="text-[10px] mt-1">Modulating between {modulationRange}</div>
              <div className="text-[10px] opacity-80">Parameter is automated</div>
            </div>
          ) : (
            `${name}: ${displayValue()}`
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Update the SwitchComponent to include tooltips
function SwitchComponent({
  value,
  options,
  fillColor = "transparent",
  name = "", // Add name parameter
}: {
  value: string
  options: string[]
  fillColor?: string
  name?: string // Add name parameter type
}) {
  // For binary switches (On/Off)
  if (options.length === 2) {
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
            {name ? `${name}: ${value}` : `Value: ${value}`}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // For multi-position switches
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
          {name ? `${name}: ${value}` : `Value: ${value}`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Update the VerticalSwitchComponent to include tooltips
function VerticalSwitchComponent({
  value,
  options,
  name = "", // Add name parameter
}: {
  value: string
  options: string[]
  name?: string // Add name parameter type
}) {
  // Calculate which position is selected (0 = top, 1 = bottom)
  const selectedIndex = options.indexOf(value)

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center">
            <div className="w-4 h-12 border border-[#f0e6c8] bg-[#1a1015] relative">
              {/* White position (top) */}
              <div
                className={`absolute top-0 left-0 right-0 h-1/2 ${selectedIndex === 0 ? "bg-white" : "bg-[#1a1015]"}`}
              />
              {/* Pink position (bottom) */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-1/2 ${selectedIndex === 1 ? "bg-white" : "bg-[#1a1015]"}`}
              />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-[#2a1a20] border border-[#3a2a30] text-[#f0e6c8] text-xs">
          {name ? `${name}: ${value}` : `Value: ${value}`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
