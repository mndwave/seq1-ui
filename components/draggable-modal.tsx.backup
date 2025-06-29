"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DraggableModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  minimal?: boolean
  width?: string
  disableClose?: boolean
}

export default function DraggableModal({
  isOpen,
  onClose,
  title,
  icon,
  children,
  minimal = false,
  width = "w-md",
  disableClose = false,
}: DraggableModalProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: -1000, y: -1000 }) // Start off-screen until positioned
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hasBeenPositioned, setHasBeenPositioned] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
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
      setIsClosing(false)
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

          // Center the modal with slight upward bias for better visual balance
          setPosition({
            x: Math.max(0, (windowWidth - modalWidth) / 2),
            y: Math.max(0, (windowHeight - modalHeight) / 2 - 50),
          })
          setHasBeenPositioned(true)
        }
      }, 50) // Small delay to ensure the modal is rendered

      return () => clearTimeout(timer)
    }
  }, [isOpen, mounted, hasBeenPositioned])

  // Handle mouse down on the header (start dragging)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (modalRef.current && !disableClose) {
      setIsDragging(true)
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    }
    e.preventDefault()
  }

  // Handle mouse move (dragging)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && modalRef.current) {
        const newX = Math.max(0, Math.min(window.innerWidth - modalRef.current.offsetWidth, e.clientX - dragOffset.x))
        const newY = Math.max(0, Math.min(window.innerHeight - modalRef.current.offsetHeight, e.clientY - dragOffset.y))
        
        setPosition({ x: newX, y: newY })
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

  // Enhanced close handler with exit animation
  const handleClose = () => {
    if (disableClose) return
    
    setIsClosing(true)
    // Wait for exit animation before actually closing
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 250) // Reduced for snappier feel
  }

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !disableClose) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, disableClose])

  // Render the modal using a portal
  const renderModal = () => {
    if (!isOpen || !mounted) return null

    return createPortal(
      <div
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ease-out",
          "modal-backdrop",
          isClosing && "animate-backdrop-out"
        )}
        onClick={handleClose}
        style={{
          cursor: isDragging ? "grabbing" : "default",
        }}
      >
        <div
          ref={modalRef}
          className={cn(
            "modal-content shadow-2xl",
            minimal ? "w-auto" : width,
            isClosing && "animate-modal-out"
          )}
          style={{
            position: "absolute",
            left: `${position.x}px`,
            top: `${position.y}px`,
            visibility: hasBeenPositioned ? "visible" : "hidden",
            cursor: isDragging ? "grabbing" : "auto",
            zIndex: 9999,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Enhanced Modal Header */}
          <div
            className={cn(
              "flex justify-between items-center relative",
              "bg-gradient-to-r from-[#3a2a30] to-[#4a3a40]",
              "border-b border-[#4a3a40]",
              "px-6 py-4",
              !disableClose && "cursor-grab active:cursor-grabbing"
            )}
            onMouseDown={handleMouseDown}
          >
            {/* Subtle header glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[rgba(66,135,245,0.05)] to-transparent opacity-60 pointer-events-none" />
            
            <div className="flex items-center space-x-3 relative z-10">
              {icon && (
                <div className="icon-abstract flex-shrink-0">
                  {icon}
                </div>
              )}
              <h3 className="seq1-heading text-lg font-semibold tracking-wide">
                {title}
              </h3>
            </div>
            
            {!minimal && !disableClose && (
              <button 
                onClick={handleClose} 
                className="micro-feedback p-2 rounded-full hover:bg-[rgba(66,135,245,0.1)] transition-all duration-200 relative z-10 group"
                aria-label="Close modal"
              >
                <X size={18} className="text-[#a09080] group-hover:text-[#f0e6c8]" />
              </button>
            )}
          </div>

          {/* Enhanced Modal Content */}
          <div className={cn(
            "relative overflow-hidden",
            minimal ? "p-0" : "p-6"
          )}>
            {/* Subtle content background pattern */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.3)_1px,_transparent_0)] bg-[length:20px_20px]" />
            </div>
            
            <div className="relative z-10">
              {children}
            </div>
          </div>

          {/* Enhanced focus ring for accessibility */}
          <div className="absolute inset-0 rounded-lg ring-2 ring-transparent transition-all duration-200 pointer-events-none" />
        </div>
      </div>,
      document.body,
    )
  }

  return renderModal()
}
