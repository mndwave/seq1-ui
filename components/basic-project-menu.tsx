"use client"

import { useState, useEffect, useRef } from "react"
import { Menu, FilePlus, FolderOpen, Save, FileText, Upload, Download, Share } from "lucide-react"

interface BasicProjectMenuProps {
  onAction: (action: string) => void
}

export default function BasicProjectMenu({ onAction }: BasicProjectMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleClick = (action: string) => {
    onAction(action)
    setIsOpen(false)
  }

  return (
    <div style={{ position: "relative", zIndex: 9999 }}>
      {/* Menu Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`channel-button flex items-center px-3 py-1.5 ${isOpen ? "active" : ""}`}
      >
        <Menu size={14} className="mr-1.5" />
        <span className="text-xs tracking-wide">PROJECT</span>
      </button>

      {/* Menu Dropdown */}
      {isOpen && (
        <div
          ref={menuRef}
          className="animate-menuReveal"
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "4px",
            zIndex: 99999,
            width: "240px",
            backgroundColor: "#2a1a20",
            border: "2px solid #3a2a30",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div className="p-2">
            {/* NEW PROJECT - enabled */}
            <button
              onClick={() => handleClick("new")}
              className="w-full text-left px-4 py-2 text-xs text-[#f0e6c8] hover:bg-[#3a2a30] flex items-center rounded-sm relative group"
            >
              <FilePlus size={14} className="mr-3 text-[#a09080]" />
              <span>NEW PROJECT</span>
            </button>

            {/* OPEN PROJECT - enabled */}
            <button
              onClick={() => handleClick("open")}
              className="w-full text-left px-4 py-2 text-xs text-[#f0e6c8] hover:bg-[#3a2a30] flex items-center rounded-sm relative group"
            >
              <FolderOpen size={14} className="mr-3 text-[#a09080]" />
              <span>OPEN PROJECT</span>
            </button>

            <div className="border-t border-[#3a2a30] my-2"></div>

            {/* SAVE - enabled */}
            <button
              onClick={() => handleClick("save")}
              className="w-full text-left px-4 py-2 text-xs text-[#f0e6c8] hover:bg-[#3a2a30] flex items-center rounded-sm relative group"
            >
              <Save size={14} className="mr-3 text-[#a09080]" />
              <span>SAVE</span>
            </button>

            {/* SAVE AS - enabled */}
            <button
              onClick={() => handleClick("saveAs")}
              className="w-full text-left px-4 py-2 text-xs text-[#f0e6c8] hover:bg-[#3a2a30] flex items-center rounded-sm relative group"
            >
              <FileText size={14} className="mr-3 text-[#a09080]" />
              <span>SAVE AS...</span>
            </button>

            <div className="border-t border-[#3a2a30] my-2"></div>

            {/* EXPORT ALS - disabled */}
            <div className="w-full text-left px-4 py-2 text-xs flex items-center rounded-sm relative group">
              <Upload size={14} className="mr-3 text-[#a09080] opacity-50" />
              <span className="text-[#a09080]">EXPORT ALS</span>
            </div>

            {/* SHARE TRACK - enabled */}
            <button
              onClick={() => handleClick("shareTrack")}
              className="w-full text-left px-4 py-2 text-xs text-[#f0e6c8] hover:bg-[#3a2a30] flex items-center rounded-sm relative group"
            >
              <Share size={14} className="mr-3 text-[#a09080]" />
              <span>SHARE TRACK</span>
            </button>

            {/* IMPORT ALS - disabled */}
            <div className="w-full text-left px-4 py-2 text-xs flex items-center rounded-sm relative group">
              <Download size={14} className="mr-3 text-[#a09080] opacity-50" />
              <span className="text-[#a09080]">IMPORT ALS</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
