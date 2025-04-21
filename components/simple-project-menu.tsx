"use client"

import { useState, useEffect, useRef } from "react"
import { Menu, FilePlus, FolderOpen, Save, FileText, Upload, Download } from "lucide-react"
import { createPortal } from "react-dom"

interface SimpleProjectMenuProps {
  onAction: (action: string) => void
}

export default function SimpleProjectMenu({ onAction }: SimpleProjectMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)

  // Set mounted state after component mounts (for SSR compatibility)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate position when menu opens
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setMenuPosition({
        top: rect.bottom,
        left: rect.left,
      })
    }
  }, [isOpen])

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

  // Replace the renderMenu function with this updated version
  const renderMenu = () => {
    if (!isOpen || !mounted) return null

    return createPortal(
      <div
        ref={menuRef}
        className="fixed bg-[#2a1a20] border-2 border-[#3a2a30] w-64 py-1 animate-menuReveal shadow-xl"
        style={{
          top: `${menuPosition.top}px`,
          left: `${menuPosition.left}px`,
          zIndex: 999999,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
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
            <span className="ml-2 px-1.5 py-0.5 text-[8px] bg-[#3a2a30] text-[#f0e6c8] rounded-sm tracking-wider">
              COMING SOON
            </span>
          </div>

          {/* IMPORT ALS - disabled */}
          <div className="w-full text-left px-4 py-2 text-xs flex items-center rounded-sm relative group">
            <Download size={14} className="mr-3 text-[#a09080] opacity-50" />
            <span className="text-[#a09080]">IMPORT ALS</span>
            <span className="ml-2 px-1.5 py-0.5 text-[8px] bg-[#3a2a30] text-[#f0e6c8] rounded-sm tracking-wider">
              COMING SOON
            </span>
          </div>
        </div>
      </div>,
      document.body,
    )
  }

  return (
    <div className="relative">
      {/* Menu Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`channel-button flex items-center px-3 py-1.5 ${isOpen ? "active" : ""}`}
      >
        <Menu size={14} className="mr-1.5" />
        <span className="text-xs tracking-wide">PROJECT</span>
      </button>

      {/* Menu Dropdown rendered via Portal */}
      {renderMenu()}
    </div>
  )
}
