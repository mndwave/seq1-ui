"use client"

import React from "react"
import DraggableModal from "@/components/draggable-modal"
import { AlertTriangle, Clock } from "lucide-react"

interface TimeoutModalProps {
  isOpen: boolean
  onClose: () => void // Typically logs out the user
  onExtend: () => void // Extends the session
  isWarning: boolean // True if it's a warning, false if session has expired
}

const TimeoutModalComponent: React.FC<TimeoutModalProps> = ({ isOpen, onClose, onExtend, isWarning }) => {
  const title = "Session Update"
  const message = isWarning
    ? "Your studio session is about to end due to inactivity. Extend your session to continue your work."
    : "Your studio session has ended due to inactivity. Please secure your session again to continue."

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose} // Closing the modal implies logging out if session expired
      title={title}
      icon={
        isWarning ? (
          <Clock size={16} className="text-[#f5a623]" />
        ) : (
          <AlertTriangle size={16} className="text-[#dc5050]" />
        )
      }
      width="w-md"
    >
      <div className="p-4 space-y-4 text-center">
        <div className="flex justify-center mb-2">
          {isWarning ? (
            <Clock size={32} className="text-[#f5a623]" />
          ) : (
            <AlertTriangle size={32} className="text-[#dc5050]" />
          )}
        </div>
        <p className="text-sm text-[#f0e6c8]">{message}</p>
        <div className="flex justify-center space-x-3 pt-2">
          {isWarning && (
            <button
              onClick={onExtend}
              className="channel-button active px-4 py-2 text-xs tracking-wide"
              aria-label="Extend session"
            >
              Extend Session
            </button>
          )}
          <button
            onClick={onClose} // This will trigger logout via AuthContext or similar
            className="channel-button px-4 py-2 text-xs tracking-wide"
            aria-label={isWarning ? "End session" : "Secure session again"}
          >
            {isWarning ? "End Session" : "Secure Session"}
          </button>
        </div>
      </div>
    </DraggableModal>
  )
}
export default React.memo(TimeoutModalComponent)
