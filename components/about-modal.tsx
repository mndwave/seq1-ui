"use client"

import { Info } from "lucide-react"
import DraggableModal from "./draggable-modal"

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title="ABOUT SEQ1"
      icon={<Info size={16} className="text-[#f5a623]" />}
      width="w-96"
    >
      <div className="space-y-3">
        <p className="text-sm text-[#f0e6c8]">
          SEQ1 is a new type of DAW that connects to your hardware synths and drum machines, harnessing the power of AI
          with human emotion.
        </p>

        <p className="text-sm text-[#a09080]">
          Adaptive and responsive to your creative direction, SEQ1 helps you create sequences, design patches, and
          explore new musical territories.
        </p>
      </div>
    </DraggableModal>
  )
}
