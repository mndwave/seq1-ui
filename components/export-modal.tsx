"use client"

import { useState } from "react"
import { X, Upload } from "lucide-react"

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [filename, setFilename] = useState("untitled_project")

  if (!isOpen) return null

  const handleExport = () => {
    // Export logic would go here
    console.log(`Exporting as ${filename}.als`)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-96 bg-[#2a1a20] border-2 border-[#3a2a30] relative">
        {/* Modal header with vintage hardware styling */}
        <div className="bg-[#3a2a30] px-4 py-2 flex justify-between items-center">
          <h3 className="text-[#f0e6c8] text-sm tracking-wide">EXPORT TO ABLETON LIVE</h3>
          <button onClick={onClose} className="text-[#a09080] hover:text-[#f0e6c8]">
            <X size={16} />
          </button>
        </div>

        {/* Modal content */}
        <div className="p-4 space-y-4">
          {/* Filename input */}
          <div className="space-y-1">
            <label className="text-xs text-[#a09080] tracking-wide">FILENAME</label>
            <div className="flex items-center">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                className="flex-1 bg-[#1a1015] border border-[#3a2a30] rounded-sm px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4287f5] text-[#f0e6c8] tracking-wide"
              />
              <span className="ml-2 text-sm text-[#a09080]">.als</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-2 pt-2">
            <button className="channel-button flex items-center px-3 py-1.5" onClick={onClose}>
              <span className="text-xs tracking-wide">CANCEL</span>
            </button>

            <button className="channel-button active flex items-center px-3 py-1.5" onClick={handleExport}>
              <Upload size={14} className="mr-1.5" />
              <span className="text-xs tracking-wide">EXPORT</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
