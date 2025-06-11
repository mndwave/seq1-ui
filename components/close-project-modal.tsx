"use client"

import { useState } from "react"
import { X, Save } from "lucide-react"
import DraggableModal from "./draggable-modal"

interface CloseProjectModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CloseProjectModal({ isOpen, onClose }: CloseProjectModalProps) {
  const [hasUnsavedChanges] = useState(true) // This would be determined by your app state

  const handleDiscard = () => {
    // Discard changes and close project
    console.log("Discarding changes and closing project")
    onClose()
  }

  const handleSaveAndClose = () => {
    // Save current project and close
    console.log("Saving current project and closing")
    onClose()
  }

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title="CLOSE PROJECT"
      icon={<X size={16} className="text-[#a09080]" />}
      width="w-96" // Add this width constraint
    >
      {hasUnsavedChanges ? (
        <div className="space-y-4">
          <p className="text-sm text-[#f0e6c8]">
            The current project has unsaved changes. Do you want to save before closing?
          </p>

          {/* Action buttons */}
          <div className="flex justify-end space-x-2 pt-2">
            <button className="channel-button flex items-center px-3 py-1.5" onClick={onClose}>
              <span className="text-xs tracking-wide">CANCEL</span>
            </button>

            <button className="channel-button flex items-center px-3 py-1.5" onClick={handleDiscard}>
              <span className="text-xs tracking-wide">DON'T SAVE</span>
            </button>

            <button className="channel-button active flex items-center px-3 py-1.5" onClick={handleSaveAndClose}>
              <Save size={14} className="mr-1.5" />
              <span className="text-xs tracking-wide">SAVE</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-[#f0e6c8]">Are you sure you want to close the current project?</p>

          {/* Action buttons */}
          <div className="flex justify-end space-x-2 pt-2">
            <button className="channel-button flex items-center px-3 py-1.5" onClick={onClose}>
              <span className="text-xs tracking-wide">CANCEL</span>
            </button>

            <button className="channel-button active flex items-center px-3 py-1.5" onClick={handleDiscard}>
              <X size={14} className="mr-1.5" />
              <span className="text-xs tracking-wide">CLOSE</span>
            </button>
          </div>
        </div>
      )}
    </DraggableModal>
  )
}
