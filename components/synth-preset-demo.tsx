"use client"

import { useState } from "react"
import DynamicSynthPreset from "./dynamic-synth-preset"
import { minimoogViolinPreset } from "@/lib/sample-presets"

interface SynthPresetDemoProps {
  className?: string
}

export default function SynthPresetDemo({ className = "" }: SynthPresetDemoProps) {
  const [preset, setPreset] = useState(minimoogViolinPreset)

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap gap-2 mb-4">
        <button className="channel-button active px-3 py-1.5">
          <span className="text-xs tracking-wide">{preset.presetName}</span>
        </button>
      </div>

      <DynamicSynthPreset preset={preset} />
    </div>
  )
}
