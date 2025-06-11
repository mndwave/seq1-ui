"use client"

import { useState } from "react"
import Knob from "./synth-controls/knob"
import Switch from "./synth-controls/switch"
import Slider from "./synth-controls/slider"

// Define types for our control panel
export type ControlType = "knob" | "switch" | "slider"

export interface ControlConfig {
  id: string
  type: ControlType
  name: string
  value: number | string
  min?: number
  max?: number
  options?: string[]
  unit?: string
  color?: string
  size?: "sm" | "md" | "lg"
}

export interface SectionConfig {
  id: string
  title: string
  controls: ControlConfig[]
  columns?: number
}

interface SynthControlPanelProps {
  title: string
  sections: SectionConfig[]
  readOnly?: boolean
  onControlChange?: (controlId: string, value: number | string) => void
  className?: string
}

export default function SynthControlPanel({
  title,
  sections,
  readOnly = true,
  onControlChange,
  className = "",
}: SynthControlPanelProps) {
  // State to track control values
  const [controlValues, setControlValues] = useState<Record<string, number | string>>(() => {
    // Initialize with provided values
    const initialValues: Record<string, number | string> = {}
    sections.forEach((section) => {
      section.controls.forEach((control) => {
        initialValues[control.id] = control.value
      })
    })
    return initialValues
  })

  // Handle control change
  const handleControlChange = (controlId: string, value: number | string) => {
    setControlValues((prev) => ({
      ...prev,
      [controlId]: value,
    }))

    if (onControlChange) {
      onControlChange(controlId, value)
    }
  }

  // Render a control based on its type
  const renderControl = (control: ControlConfig) => {
    const currentValue = controlValues[control.id] ?? control.value

    switch (control.type) {
      case "knob":
        return (
          <Knob
            key={control.id}
            name={control.name}
            value={currentValue as number}
            min={control.min}
            max={control.max}
            unit={control.unit}
            color={control.color}
            size={control.size}
            readOnly={readOnly}
            onChange={(value) => handleControlChange(control.id, value)}
          />
        )
      case "switch":
        return (
          <Switch
            key={control.id}
            name={control.name}
            options={control.options || []}
            value={currentValue}
            size={control.size}
            readOnly={readOnly}
            onChange={(value) => handleControlChange(control.id, value)}
          />
        )
      case "slider":
        return (
          <Slider
            key={control.id}
            name={control.name}
            value={currentValue as number}
            min={control.min}
            max={control.max}
            unit={control.unit}
            color={control.color}
            size={control.size}
            readOnly={readOnly}
            onChange={(value) => handleControlChange(control.id, value)}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className={`bg-black border border-[#3a2a30] rounded-sm overflow-hidden w-full ${className}`}>
      {/* Header */}
      <div className="bg-[#3a2a30] px-4 py-2 flex justify-between items-center">
        <h3 className="text-[#f0e6c8] text-sm tracking-wide">{title}</h3>
      </div>

      {/* Sections */}
      <div className="p-4 space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="space-y-2">
            {/* Section title */}
            <div className="flex items-center">
              <h4 className="text-xs text-[#a09080] tracking-wide uppercase">{section.title}</h4>
              <div className="ml-2 flex-1 h-px bg-[#3a2a30]"></div>
            </div>

            {/* Controls grid - with spacing like the patch sheet */}
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${section.columns || 3}, minmax(0, 1fr))`,
              }}
            >
              {section.controls.map((control) => renderControl(control))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
