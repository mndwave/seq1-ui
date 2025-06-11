"use client"

import React from "react"

import type { ReactNode } from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { X } from "lucide-react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface DraggableModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  icon?: ReactNode
  children: ReactNode
  minimal?: boolean
  width?: string
}

const DraggableModalComponent: React.FC<DraggableModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  minimal = false,
  width = "w-md",
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: -1000, y: -1000 }) // Start off-screen
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hasBeenPositioned, setHasBeenPositioned] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setHasBeenPositioned(false) // Reset positioning when modal re-opens
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && mounted && !hasBeenPositioned && modalRef.current) {
      const modalWidth = modalRef.current.offsetWidth
      const modalHeight = modalRef.current.offsetHeight
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight

      setPosition({
        x: Math.max(0, (windowWidth - modalWidth) / 2),
        y: Math.max(0, (windowHeight - modalHeight) / 2),
      })
      setHasBeenPositioned(true)
    }
  }, [isOpen, mounted, hasBeenPositioned]) // Removed modalRef.current from deps to avoid potential issues

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (modalRef.current) {
      // Check if the click is on the header itself, not on a button inside the header
      if ((e.target as HTMLElement).closest("button")) {
        return
      }
      setIsDragging(true)
      const modalRect = modalRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - modalRect.left,
        y: e.clientY - modalRect.top,
      })
    }
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragOffset])

  const handleClose = useCallback(() => {
    if (modalRef.current) {
      const backdrop = modalRef.current.parentElement
      if (backdrop) {
        backdrop.style.animation = "backdropFadeOut 250ms cubic-bezier(0.4, 0, 0.2, 1) forwards"
      }
      modalRef.current.style.animation = "modalFadeOut 250ms cubic-bezier(0.4, 0, 0.2, 1) forwards"
      setTimeout(() => {
        onClose()
        // Reset animation styles after closing to ensure they re-apply on next open
        if (backdrop) backdrop.style.animation = ""
        modalRef.current!.style.animation = ""
      }, 250)
    } else {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleClose()
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, handleClose])

  const renderModal = () => {
    if (!isOpen || !mounted) return null

    return createPortal(
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-all duration-300 ease-in-out"
        onClick={handleClose}
        style={{
          animation: "backdropFadeIn 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
          backdropFilter: "blur(1.5px)", // Subtle blur
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          ref={modalRef}
          className={cn(
            `bg-[#2a1a20] border-2 border-[#3a2a30] shadow-xl ${minimal ? "w-auto" : width}`,
            "flex flex-col", // Added for structure
          )}
          style={{
            position: "absolute",
            left: `${position.x}px`,
            top: `${position.y}px`,
            visibility: hasBeenPositioned ? "visible" : "hidden",
            cursor: isDragging ? "grabbing" : "default",
            zIndex: 9999,
            animation: "modalFadeIn 400ms cubic-bezier(0.4, 0, 0.2, 1) forwards",
            maxHeight: "90vh", // Prevent modal from being too tall
          }}
          onClick={(e) => e.stopPropagation()}
          role="document"
        >
          <div
            className="bg-[#3a2a30] px-4 py-2 flex justify-between items-center cursor-grab"
            onMouseDown={handleMouseDown}
            id="modal-title"
          >
            <div className="flex items-center">
              {icon && <span className="mr-2 text-[#a09080]">{icon}</span>}
              <h3 className="text-[#f0e6c8] text-sm tracking-wide">{title}</h3>
            </div>
            {!minimal && (
              <button onClick={handleClose} className="text-[#a09080] hover:text-[#f0e6c8]" aria-label="Close modal">
                <X size={16} />
              </button>
            )}
          </div>
          <div className={cn("overflow-y-auto", minimal ? "p-0" : "p-4")}>{children}</div>
        </div>
      </div>,
      document.body,
    )
  }
  return renderModal()
}

// Add keyframes to globals.css or a style tag if not already present
// For Next.js, we might need to ensure these are globally available.
// Assuming globals.css is the right place:
/*
@keyframes backdropFadeIn {
  from { opacity: 0; backdrop-filter: blur(0px); }
  to { opacity: 1; backdrop-filter: blur(1.5px); }
}
@keyframes modalFadeIn {
  from { opacity: 0; transform: scale(0.97); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes backdropFadeOut {
  from { opacity: 1; backdrop-filter: blur(1.5px); }
  to { opacity: 0; backdrop-filter: blur(0px); }
}
@keyframes modalFadeOut {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.97); }
}
*/

export default React.memo(DraggableModalComponent)
