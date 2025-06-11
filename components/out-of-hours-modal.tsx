"use client"

import { useState, useEffect } from "react"
import AccountModal from "./account-modal"
import { AlertCircle } from "lucide-react"

interface OutOfHoursModalProps {
  isOpen: boolean
  onClose: () => void
  remainingHours: number
}

export default function OutOfHoursModal({ isOpen, onClose, remainingHours }: OutOfHoursModalProps) {
  // State to track if the user has added hours
  const [hasAddedHours, setHasAddedHours] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setHasAddedHours(false)
    }
  }, [isOpen])

  // Handle account update - check if hours were added
  const handleAccountUpdate = (newHours: number) => {
    if (newHours > remainingHours) {
      setHasAddedHours(true)
    }
  }

  // Only allow closing if hours have been added or explicitly closing
  const handleClose = () => {
    if (hasAddedHours) {
      onClose()
    }
  }

  // Force close regardless of hour status
  const handleForceClose = () => {
    onClose()
  }

  return (
    <>
      {/* Overlay that prevents interaction with the rest of the UI */}
      {isOpen && !hasAddedHours && <div className="fixed inset-0 bg-black bg-opacity-70 z-40" />}

      {/* Warning banner that appears above the modal */}
      {isOpen && !hasAddedHours && (
        <div className="fixed top-0 left-0 right-0 bg-red-900/80 text-white py-2 px-4 z-50 flex items-center justify-center">
          <AlertCircle size={16} className="mr-2" />
          <span className="text-sm">You've run out of creative time. Please add more hours to continue.</span>
        </div>
      )}

      {/* Account modal with billing tab pre-selected */}
      <AccountModal
        isOpen={isOpen}
        onClose={hasAddedHours ? handleClose : handleForceClose}
        initialTab="billing"
        onAccountUpdate={handleAccountUpdate}
        disableClose={!hasAddedHours}
        showOutOfHoursMessage={!hasAddedHours}
      />
    </>
  )
}
