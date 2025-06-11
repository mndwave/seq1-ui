/**
 * Schema definitions for dynamic synth preset rendering
 */

// Base control properties shared by all control types
export interface BaseControlSchema {
  id: string
  type: "knob" | "switch" | "slider" | "label"
  name: string
  tooltip?: string
  animationDelay?: number // For staggered animations (in ms)
}

// Knob-specific properties
export interface KnobSchema extends BaseControlSchema {
  type: "knob"
  value: number
  min?: number
  max?: number
  defaultValue?: number
  displayType?: "normal" | "range" | "frequency" | "waveform"
  fillColor?: string
  size?: "sm" | "md" | "lg"
  unit?: string
  // New modulation property for expressive parameters
  modulation?: {
    active: boolean
    minValue: number
    maxValue: number
    speed?: "slow" | "medium" | "fast"
    description?: string // Custom description for the modulation
  }
}

// Switch-specific properties
export interface SwitchSchema extends BaseControlSchema {
  type: "switch"
  value: string
  options: string[]
  orientation?: "horizontal" | "vertical"
  fillColor?: string
}

// Slider-specific properties
export interface SliderSchema extends BaseControlSchema {
  type: "slider"
  value: number
  min?: number
  max?: number
  defaultValue?: number
  orientation?: "horizontal" | "vertical"
  size?: "sm" | "md" | "lg"
  fillColor?: string
  unit?: string
}

// Label-specific properties
export interface LabelSchema extends BaseControlSchema {
  type: "label"
  text: string
  textSize?: "xs" | "sm" | "md" | "lg"
  textColor?: string
  isBold?: boolean
  isUppercase?: boolean
}

// Union type for all possible controls
export type ControlSchema = KnobSchema | SwitchSchema | SliderSchema | LabelSchema

// Section schema
export interface SectionSchema {
  id: string
  title: string
  layout: {
    columns?: number
    rows?: number
    width?: number // Width in grid columns
  }
  controls: ControlSchema[]
  animationDelay?: number // For staggered animations (in ms)
}

// Complete synth preset schema
export interface SynthPresetSchema {
  id: string
  deviceName: string
  presetName: string
  description?: string
  author?: string
  created?: string
  modified?: string
  tags?: string[]
  sections: SectionSchema[]
  notes?: string
  highlightColor?: string // Main accent color for the preset
}
