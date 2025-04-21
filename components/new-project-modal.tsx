"use client"

import { useState } from "react"
import { FilePlus, Save } from "lucide-react"
import DraggableModal from "./draggable-modal"

interface NewProjectModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
  const [hasUnsavedChanges] = useState(true) // This would be determined by your app state

  const handleDiscard = () => {
    // Discard changes and create new project
    console.log("Discarding changes and creating new project")
    onClose()
  }

  const handleSaveAndNew = () => {
    // Save current project and create new one
    console.log("Saving current project and creating new one")
    onClose()
  }

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title="NEW PROJECT"
      icon={<FilePlus size={16} className="text-[#a09080]" />}
      width="w-96" // Add this width constraint
    >
      {hasUnsavedChanges ? (
        <div className="space-y-4">
          <p className="text-sm text-[#f0e6c8]">
            The current project has unsaved changes. Do you want to save before creating a new project?
          </p>

          {/* Action buttons */}
          <div className="flex justify-end space-x-2 pt-2">
            <button className="channel-button flex items-center px-3 py-1.5" onClick={onClose}>
              <span className="text-xs tracking-wide">CANCEL</span>
            </button>

            <button className="channel-button flex items-center px-3 py-1.5" onClick={handleDiscard}>
              <span className="text-xs tracking-wide">DON'T SAVE</span>
            </button>

            <button className="channel-button active flex items-center px-3 py-1.5" onClick={handleSaveAndNew}>
              <Save size={14} className="mr-1.5" />
              <span className="text-xs tracking-wide">SAVE</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-[#f0e6c8]">Create a new project?</p>

          {/* Action buttons */}
          <div className="flex justify-end space-x-2 pt-2">
            <button className="channel-button flex items-center px-3 py-1.5" onClick={onClose}>
              <span className="text-xs tracking-wide">CANCEL</span>
            </button>

            <button className="channel-button active flex items-center px-3 py-1.5" onClick={handleDiscard}>
              <FilePlus size={14} className="mr-1.5" />
              <span className="text-xs tracking-wide">CREATE NEW</span>
            </button>
          </div>
        </div>
      )}
    </DraggableModal>
  )
}
