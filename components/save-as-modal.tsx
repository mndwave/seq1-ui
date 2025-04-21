"use client"

import { useState, useEffect } from "react"
import { Save, Wand2 } from "lucide-react"
import DraggableModal from "./draggable-modal"
import { generateProjectName } from "@/lib/name-generator"

interface SaveAsModalProps {
  isOpen: boolean
  onClose: () => void
  currentName?: string
}

export default function SaveAsModal({ isOpen, onClose, currentName = "UNTITLED PROJECT" }: SaveAsModalProps) {
  const [filename, setFilename] = useState(currentName)

  // Reset filename when modal opens
  useEffect(() => {
    if (isOpen) {
      setFilename(currentName)
    }
  }, [isOpen, currentName])

  const handleSave = () => {
    // Save As logic would go here
    console.log(`Saving as ${filename}`)
    onClose()
  }

  // Generate a new project name
  const handleGenerateName = () => {
    setFilename(generateProjectName())
  }

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title="SAVE SONG AS"
      icon={<Save size={16} className="text-[#a09080]" />}
    >
      <div className="space-y-4">
        {/* Filename input with name generator button */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="text-xs text-[#a09080] tracking-wide">SONG NAME</label>
            <button
              onClick={handleGenerateName}
              className="vintage-button px-2 py-1 flex items-center rounded-sm transition-all duration-200 hover:bg-[#3a2a30]"
              title="Generate random name"
            >
              <Wand2 size={12} className="mr-1" />
              <span className="text-xs tracking-wide">GENERATE</span>
            </button>
          </div>
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value.toUpperCase())}
            onFocus={() => {
              if (filename === "UNTITLED PROJECT") {
                setFilename("")
              }
            }}
            className="w-full bg-[#1a1015] border border-[#3a2a30] rounded-sm px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4287f5] text-[#f0e6c8] tracking-wide"
          />
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-2 pt-2">
          <button className="channel-button flex items-center px-3 py-1.5" onClick={onClose}>
            <span className="text-xs tracking-wide">CANCEL</span>
          </button>

          <button className="channel-button active flex items-center px-3 py-1.5" onClick={handleSave}>
            <Save size={14} className="mr-1.5" />
            <span className="text-xs tracking-wide">SAVE</span>
          </button>
        </div>
      </div>
    </DraggableModal>
  )
}
