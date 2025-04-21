"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { createPortal } from "react-dom"

interface DraggableModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  minimal?: boolean
  width?: string
}

export default function DraggableModal({
  isOpen,
  onClose,
  title,
  icon,
  children,
  minimal = false,
  width = "w-md",
}: DraggableModalProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: -1000, y: -1000 }) // Start off-screen until positioned
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hasBeenPositioned, setHasBeenPositioned] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  // Set mounted state after component mounts (for SSR compatibility)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset positioning when modal opens
  useEffect(() => {
    if (isOpen) {
      setHasBeenPositioned(false)
    }
  }, [isOpen])

  // Center the modal when it opens
  useEffect(() => {
    if (isOpen && mounted && !hasBeenPositioned) {
      // Use setTimeout to ensure the modal is rendered before measuring
      const timer = setTimeout(() => {
        if (modalRef.current) {
          const modalWidth = modalRef.current.offsetWidth
          const modalHeight = modalRef.current.offsetHeight
          const windowWidth = window.innerWidth
          const windowHeight = window.innerHeight

          // Center the modal
          setPosition({
            x: Math.max(0, (windowWidth - modalWidth) / 2),
            y: Math.max(0, (windowHeight - modalHeight) / 2),
          })
          setHasBeenPositioned(true)
        }
      }, 50) // Small delay to ensure the modal is rendered

      return () => clearTimeout(timer)
    }
  }, [isOpen, mounted, hasBeenPositioned])

  // Handle mouse down on the header (start dragging)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (modalRef.current) {
      setIsDragging(true)
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    }
  }

  // Handle mouse move (dragging)
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

  // Close on escape key
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
  }, [isOpen])

  // Add this new function to handle closing with animation
  const handleClose = () => {
    if (modalRef.current) {
      // Apply closing animations
      const backdrop = modalRef.current.parentElement
      if (backdrop) {
        backdrop.style.animation = "backdropFadeOut 200ms forwards ease-in"
      }
      modalRef.current.style.animation = "modalFadeOut 200ms forwards ease-in"

      // Delay actual closing to allow animation to complete
      setTimeout(() => {
        onClose()
      }, 200)
    } else {
      onClose()
    }
  }

  // Render the modal using a portal
  const renderModal = () => {
    if (!isOpen || !mounted) return null

    return createPortal(
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/0 transition-all duration-300 ease-in-out"
        onClick={handleClose} // Changed from onClose to handleClose
        style={{
          backdropFilter: "blur(0px)",
          animation: "backdropFadeIn 300ms forwards ease-out",
        }}
      >
        <div
          ref={modalRef}
          className={`bg-[#2a1a20] border-2 border-[#3a2a30] shadow-xl ${minimal ? "w-auto" : width}`}
          style={{
            position: "absolute",
            left: `${position.x}px`,
            top: `${position.y}px`,
            visibility: hasBeenPositioned ? "visible" : "hidden", // Hide until positioned
            cursor: isDragging ? "grabbing" : "auto",
            zIndex: 9999,
            opacity: 0,
            transform: "scale(0.95)",
            animation: "modalFadeIn 300ms forwards ease-out",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header - draggable */}
          <div
            className="bg-[#3a2a30] px-4 py-2 flex justify-between items-center cursor-grab"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center">
              {icon && <span className="mr-2">{icon}</span>}
              <h3 className="text-[#f0e6c8] text-sm tracking-wide">{title}</h3>
            </div>
            {!minimal && (
              <button onClick={handleClose} className="text-[#a09080] hover:text-[#f0e6c8]">
                <X size={16} />
              </button>
            )}
          </div>

          {/* Modal content */}
          <div className={minimal ? "p-0" : "p-4"}>{children}</div>
        </div>
      </div>,
      document.body,
    )
  }

  return renderModal()
}
