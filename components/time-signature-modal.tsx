"use client"

import { useState, useEffect } from "react"
import DraggableModal from "./draggable-modal"

interface TimeSignatureModalProps {
  isOpen: boolean
  onClose: () => void
  currentTimeSignature: string
  onSave: (timeSignature: string) => void
}

// Common time signature presets
const timeSignaturePresets = ["4/4", "3/4", "6/8", "5/4", "7/8", "2/4", "9/8", "12/8"]

export default function TimeSignatureModal({ isOpen, onClose, currentTimeSignature, onSave }: TimeSignatureModalProps) {
  const [numerator, setNumerator] = useState(4)
  const [denominator, setDenominator] = useState(4)

  // Parse current time signature when modal opens
  useEffect(() => {
    if (isOpen && currentTimeSignature) {
      const [num, denom] = currentTimeSignature.split("/").map(Number)
      if (!isNaN(num) && !isNaN(denom)) {
        setNumerator(num)
        setDenominator(denom)
      }
    }
  }, [isOpen, currentTimeSignature])

  const handleUpdate = () => {
    onSave(`${numerator}/${denominator}`)
    onClose()
  }

  const handlePresetClick = (preset: string) => {
    const [num, denom] = preset.split("/").map(Number)
    setNumerator(num)
    setDenominator(denom)
  }

  return (
    <DraggableModal isOpen={isOpen} onClose={onClose} title="SET TIME SIGNATURE" width="w-80">
      <div className="space-y-6">
        {/* Time signature input */}
        <div className="space-y-3">
          <label className="text-xs text-[#a09080] tracking-wide">TIME SIGNATURE</label>

          <div className="flex items-center justify-center">
            {/* Numerator selector with LCD styling */}
            <div
              className="w-16 h-14 segmented-display flex items-center justify-center rounded-sm"
              style={{
                boxShadow: "inset 0 0 5px rgba(0, 0, 0, 0.1)",
              }}
            >
              <select
                value={numerator}
                onChange={(e) => setNumerator(Number.parseInt(e.target.value))}
                className="w-full h-full bg-transparent border-none text-center text-2xl font-bold text-[#2a1a20] focus:outline-none appearance-none cursor-pointer"
                style={{
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-2xl mx-2 text-[#f0e6c8]">/</span>

            {/* Denominator selector with LCD styling */}
            <div
              className="w-16 h-14 segmented-display flex items-center justify-center rounded-sm"
              style={{
                boxShadow: "inset 0 0 5px rgba(0, 0, 0, 0.1)",
              }}
            >
              <select
                value={denominator}
                onChange={(e) => setDenominator(Number.parseInt(e.target.value))}
                className="w-full h-full bg-transparent border-none text-center text-2xl font-bold text-[#2a1a20] focus:outline-none appearance-none cursor-pointer"
                style={{
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                }}
              >
                {[2, 4, 8, 16].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="text-xs text-center text-[#a09080]">Click to select values</p>
        </div>

        {/* Time signature presets */}
        <div className="space-y-3">
          <label className="text-xs text-[#a09080] tracking-wide">COMMON TIME SIGNATURES</label>
          <div className="grid grid-cols-4 gap-2">
            {timeSignaturePresets.map((preset) => (
              <button
                key={preset}
                onClick={() => handlePresetClick(preset)}
                className={`text-xs py-2 rounded-sm ${
                  `${numerator}/${denominator}` === preset ? "vintage-button-active" : "vintage-button"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end pt-2">
          <button className="channel-button active flex items-center px-4 py-2" onClick={handleUpdate}>
            <span className="text-xs tracking-wide">UPDATE</span>
          </button>
        </div>
      </div>
    </DraggableModal>
  )
}
