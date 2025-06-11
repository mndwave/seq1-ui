"use client"

import SynthControlPanel, { type SectionConfig } from "./synth-control-panel"

interface SynthPresetCardProps {
  deviceName: string
  presetName: string
  sections: SectionConfig[]
  className?: string
}

export default function SynthPresetCard({ deviceName, presetName, sections, className = "" }: SynthPresetCardProps) {
  return (
    <div className={`relative transition-all duration-500 animate-fadeIn ${className}`}>
      {/* Sender label */}
      <div className="text-xs mb-1 tracking-wide text-[#7a9e9f]">SEQ1</div>

      {/* Message bubble with only the left accent border */}
      <div
        className="max-w-full p-4 relative transition-all duration-300 bg-black border-l-2 border-[#f5a623]"
        style={{
          boxShadow: "none", // Remove the box-shadow that was creating the border effect
        }}
      >
        <div className="mb-3">
          <h3 className="text-lg font-medium text-[#f0e6c8]">{presetName}</h3>
          <p className="text-xs text-[#a09080]">{deviceName}</p>
        </div>

        <SynthControlPanel title={`${deviceName} - ${presetName}`} sections={sections} readOnly={true} />

        <div className="mt-3 text-xs text-[#a09080]">
          Set your {deviceName} knobs and switches as shown above to recreate this sound.
        </div>
      </div>
    </div>
  )
}
