"use client"

import { useRef, useState } from "react"
import { Menu, FilePlus, FolderOpen, Save, FileText, Upload, X, Info } from "lucide-react"
import { useMenu } from "@/lib/menu-context"
import AboutModal from "./about-modal"

type ProjectAction = "new" | "open" | "save" | "saveAs" | "export" | "close"

interface ProjectMenuButtonProps {
  onAction: (action: ProjectAction) => void
}

export default function ProjectMenuButton({ onAction }: ProjectMenuButtonProps) {
  const { openMenu, isMenuOpen, closeMenu } = useMenu()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [showAboutModal, setShowAboutModal] = useState(false)

  const handleOpenMenu = () => {
    // If menu is already open, close it (Windows 3.1 style toggle behavior)
    if (isMenuOpen) {
      closeMenu()
      return
    }

    if (!buttonRef.current) return

    const rect = buttonRef.current.getBoundingClientRect()
    const windowWidth = window.innerWidth

    // Position the menu aligned with the right edge of the button
    let leftPosition = rect.right - 240 // 240px is the width of the menu

    // Make sure the menu doesn't go off the left edge of the screen
    if (leftPosition < 0) {
      leftPosition = 0
    }

    // Also ensure it doesn't go off the right edge
    if (leftPosition + 240 > windowWidth) {
      leftPosition = windowWidth - 240 - 8
    }

    // Create menu items
    const menuItems = [
      {
        id: "new",
        label: "NEW PROJECT",
        icon: <FilePlus size={14} />,
        action: () => {
          console.log("New action triggered - disabled")
          closeMenu()
        },
        disabled: true,
        comingSoon: true,
      },
      {
        id: "open",
        label: "OPEN PROJECT",
        icon: <FolderOpen size={14} />,
        action: () => {
          console.log("Open action triggered - disabled")
          closeMenu()
        },
        disabled: true,
        comingSoon: true,
        dividerAfter: true,
      },
      {
        id: "save",
        label: "SAVE",
        icon: <Save size={14} />,
        action: () => {
          console.log("Save action triggered - disabled")
          closeMenu()
        },
        disabled: true,
        comingSoon: true,
      },
      {
        id: "saveAs",
        label: "SAVE AS...",
        icon: <FileText size={14} />,
        action: () => {
          console.log("Save As action triggered - disabled")
          closeMenu()
        },
        disabled: true,
        comingSoon: true,
      },
      {
        id: "export",
        label: "EXPORT ALS",
        icon: <Upload size={14} />,
        action: () => {
          console.log("Export action triggered - disabled")
          closeMenu()
        },
        disabled: true,
        comingSoon: true,
        dividerAfter: true,
      },
      {
        id: "about",
        label: "ABOUT SEQ1",
        icon: <Info size={14} />,
        action: () => {
          setShowAboutModal(true)
          closeMenu()
        },
        disabled: false,
        comingSoon: false,
        dividerBefore: true,
      },
      {
        id: "close",
        label: "CLOSE PROJECT",
        icon: <X size={14} />,
        action: () => {
          console.log("Close action triggered - disabled")
          closeMenu()
        },
        disabled: true,
        comingSoon: true,
      },
    ]

    // Open the menu at the adjusted position
    openMenu(menuItems, {
      top: rect.bottom, // No gap between button and menu
      left: leftPosition,
    })
  }

  return (
    <button
      ref={buttonRef}
      onClick={handleOpenMenu}
      className={`channel-button flex items-center px-3 py-1.5 ${isMenuOpen ? "active" : ""}`}
      style={{ position: "relative", zIndex: 100, pointerEvents: "auto" }}
    >
      <Menu size={14} className="mr-1.5" />
      <span className="text-xs tracking-wide">PROJECT</span>
    </button>
  )
  showAboutModal && <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />
}
