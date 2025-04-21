"use client"

import { useState } from "react"
import MiniMoogPreset from "./minimoog-preset"

interface ChatSynthPresetDemoProps {
  className?: string
}

export default function ChatSynthPresetDemo({ className = "" }: ChatSynthPresetDemoProps) {
  const [presetName, setPresetName] = useState("70s Violin Lead")

  const presets = ["70s Violin Lead", "Very Bad Place", "Acid Bass", "Funky Clav", "Brass Section"]

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((preset) => (
          <button
            key={preset}
            className={`channel-button ${preset === presetName ? "active" : ""} px-3 py-1.5`}
            onClick={() => setPresetName(preset)}
          >
            <span className="text-xs tracking-wide">{preset}</span>
          </button>
        ))}
      </div>

      <MiniMoogPreset presetName={presetName} />
    </div>
  )
}
