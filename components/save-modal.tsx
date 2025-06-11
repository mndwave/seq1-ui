"use client"
import { useState, useEffect } from "react"
import { Save, Check, Wand2 } from "lucide-react"
import DraggableModal from "./draggable-modal"
import { generateProjectName } from "@/lib/name-generator"
import { SocialTuningPrompt } from "./social-tuning-prompt"

interface SaveModalProps {
  isOpen: boolean
  onClose: () => void
  isFirstSave?: boolean
  projectName?: string
}

export default function SaveModal({
  isOpen,
  onClose,
  isFirstSave = false,
  projectName = "UNTITLED PROJECT",
}: SaveModalProps) {
  const [filename, setFilename] = useState(projectName)
  const [saveComplete, setSaveComplete] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFilename(projectName)
      setSaveComplete(false)
    }
  }, [isOpen, projectName])

  const handleSave = () => {
    // Save logic would go here
    console.log(`Saving project as ${filename}`)

    // For first-time save, we'll close the modal after saving
    if (isFirstSave) {
      onClose()
    } else {
      // For subsequent saves, show success indicator briefly then close
      setSaveComplete(true)
      setTimeout(() => {
        onClose()
      }, 1000)
    }
  }

  // Generate a new project name
  const handleGenerateName = () => {
    setFilename(generateProjectName())
  }

  // If it's not the first save and the modal is open, auto-save and show feedback
  useEffect(() => {
    if (isOpen && !isFirstSave) {
      handleSave()
    }
  }, [isOpen, isFirstSave])

  // For first-time save, show the filename input modal
  if (isFirstSave) {
    return (
      <DraggableModal
        isOpen={isOpen}
        onClose={onClose}
        title="SAVE PROJECT"
        icon={<Save size={16} className="text-[#a09080]" />}
      >
        <div className="space-y-4">
          {/* Filename input with name generator button */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs text-[#a09080] tracking-wide">PROJECT NAME</label>
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

          {/* Social Tuning Prompt */}
          <SocialTuningPrompt className="mt-4 mb-2" />

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

  // For subsequent saves, show a minimal success indicator
  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title="SAVING PROJECT"
      icon={<Save size={16} className="text-[#a09080]" />}
    >
      <div className="flex items-center justify-center p-4">
        {saveComplete ? (
          <div className="flex items-center text-[#50dc64]">
            <Check size={18} className="mr-2" />
            <span>Project saved successfully</span>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="animate-spin mr-2">
              <Save size={18} />
            </div>
            <span>Saving project...</span>
          </div>
        )}
      </div>
    </DraggableModal>
  )
}
