"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Plus, Minus } from "lucide-react"
import DraggableModal from "./draggable-modal"

interface BpmModalProps {
  isOpen: boolean
  onClose: () => void
  currentBpm: number
  onSave: (bpm: number) => void
}

export default function BpmModal({ isOpen, onClose, currentBpm, onSave }: BpmModalProps) {
  const [bpm, setBpm] = useState(currentBpm)
  const [isEditing, setIsEditing] = useState(false)
  const [tempBpm, setTempBpm] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // For button press and hold functionality
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const stepRef = useRef(1)

  // Reset to current BPM when modal opens
  useEffect(() => {
    if (isOpen) {
      setBpm(currentBpm)
      setIsEditing(false)
    }
  }, [isOpen, currentBpm])

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  // Clean up intervals and timeouts on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleUpdate = () => {
    onSave(bpm)
    onClose()
  }

  const startIncrement = () => {
    stepRef.current = 1

    // Initial increment
    setBpm((prev) => Math.min(prev + 1, 300))

    // Set timeout before starting rapid increments
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setBpm((prev) => {
          // Gradually increase step size for faster changes
          if (stepRef.current < 10 && intervalRef.current) {
            stepRef.current += 0.5
          }
          return Math.min(prev + Math.floor(stepRef.current), 300)
        })
      }, 100)
    }, 500)
  }

  const startDecrement = () => {
    stepRef.current = 1

    // Initial decrement
    setBpm((prev) => Math.max(prev - 1, 20))

    // Set timeout before starting rapid decrements
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setBpm((prev) => {
          // Gradually increase step size for faster changes
          if (stepRef.current < 10 && intervalRef.current) {
            stepRef.current += 0.5
          }
          return Math.max(prev - Math.floor(stepRef.current), 20)
        })
      }, 100)
    }, 500)
  }

  const stopAdjustment = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    intervalRef.current = null
    timeoutRef.current = null
  }

  const handleDisplayClick = () => {
    setIsEditing(true)
    setTempBpm(bpm.toString())
  }

  const handleInputBlur = () => {
    const newBpm = Number.parseInt(tempBpm)
    if (!isNaN(newBpm) && newBpm >= 20 && newBpm <= 300) {
      setBpm(newBpm)
    }
    setIsEditing(false)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleInputBlur()
    } else if (e.key === "Escape") {
      setIsEditing(false)
    }
  }

  return (
    <DraggableModal isOpen={isOpen} onClose={onClose} title="SET BPM" width="w-80">
      <div className="space-y-6">
        {/* BPM display and controls */}
        <div className="space-y-3">
          <label className="text-xs text-[#a09080] tracking-wide">TEMPO (BPM)</label>

          <div className="flex items-center justify-center">
            {/* Minus button styled like play button */}
            <button
              className="w-12 h-12 rounded-full flex items-center justify-center bg-[#2a1a20] border border-[#3a2a30]"
              onMouseDown={startDecrement}
              onMouseUp={stopAdjustment}
              onMouseLeave={stopAdjustment}
              onTouchStart={startDecrement}
              onTouchEnd={stopAdjustment}
            >
              <Minus size={20} className="text-[#a09080]" />
            </button>

            {/* BPM display/input with matching style to main display */}
            <div
              className="mx-4 w-32 h-14 segmented-display flex items-center justify-center cursor-pointer rounded-sm"
              onClick={!isEditing ? handleDisplayClick : undefined}
              style={{
                boxShadow: "inset 0 0 5px rgba(0, 0, 0, 0.1)",
              }}
            >
              {isEditing ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={tempBpm}
                  onChange={(e) => setTempBpm(e.target.value)}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKeyDown}
                  className="w-full h-full bg-transparent border-none text-center text-2xl font-bold text-[#2a1a20] focus:outline-none"
                />
              ) : (
                <span className="text-2xl font-bold text-[#2a1a20]">{bpm}</span>
              )}
            </div>

            {/* Plus button styled like play button */}
            <button
              className="w-12 h-12 rounded-full flex items-center justify-center bg-[#2a1a20] border border-[#3a2a30]"
              onMouseDown={startIncrement}
              onMouseUp={stopAdjustment}
              onMouseLeave={stopAdjustment}
              onTouchStart={startIncrement}
              onTouchEnd={stopAdjustment}
            >
              <Plus size={20} className="text-[#a09080]" />
            </button>
          </div>

          <p className="text-xs text-center text-[#a09080]">Click on display to type value directly</p>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end pt-2">
          <button className="channel-button active flex items-center px-4 py-2" onClick={handleUpdate}>
            <span className="text-xs tracking-wide">UPDATE</span>
          </button>
        </div>
      </div>
    </DraggableModal>
  )
}
