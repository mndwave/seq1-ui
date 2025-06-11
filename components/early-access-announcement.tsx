"use client"

import { Radio } from "lucide-react"
import DraggableModal from "./draggable-modal"
import { ExternalLink } from "lucide-react"

interface EarlyAccessAnnouncementProps {
  isOpen: boolean
  onClose: () => void
}

export default function EarlyAccessAnnouncement({ isOpen, onClose }: EarlyAccessAnnouncementProps) {
  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title="TRANSMISSION INCOMING"
      icon={<Radio size={16} className="text-[#f5a623] animate-pulse" />}
      width="max-w-96" // Use the new width prop
      // Force the modal to be centered initially
      initialPosition="center"
    >
      <div className="space-y-3">
        <p className="text-sm text-[#f0e6c8] font-bold">
          THIS PROJECT IS <span className="text-[#f5a623]">SO F'ING EARLY</span>
        </p>

        <p className="text-xs text-[#a09080]">
          <span className="text-[#f5a623] font-medium">VERY SOON:</span> We'll be streaming from the lab.
        </p>

        <p className="text-xs text-[#a09080]">Follow along as we venture into the unknown.</p>

        {/* Action buttons */}
        <div className="flex justify-center pt-2 pb-2">
          <a
            href="https://primal.net/mndwave"
            target="_blank"
            rel="noopener noreferrer"
            className="relative px-5 py-2.5 overflow-hidden group bg-[#f0e6c8] rounded-sm text-[#2a1a20] hover:bg-[#fff] transition-all duration-300"
            style={{
              boxShadow: "0 2px 0 #3a2a30, inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 4px 8px rgba(0, 0, 0, 0.3)",
            }}
          >
            {/* Button texture overlay */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent opacity-50"></span>

            {/* Subtle noise texture */}
            <span className="absolute inset-0 w-full h-full dot-pattern opacity-10"></span>

            {/* Button text with shadow for depth */}
            <span
              className="relative flex items-center justify-center text-xs font-bold tracking-wide"
              style={{ textShadow: "0 1px 0 rgba(255, 255, 255, 0.4)" }}
            >
              FOLLOW THE RIDE
              <ExternalLink size={14} className="ml-1.5 group-hover:translate-x-0.5 transition-transform" />
            </span>

            {/* Button press effect */}
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#3a2a30] opacity-20 group-active:h-0 transition-all duration-150"></span>
            <span className="absolute inset-0 w-full h-full bg-[#2a1a20] opacity-0 group-active:opacity-5 group-active:translate-y-px transition-all duration-150"></span>
          </a>
        </div>
      </div>
    </DraggableModal>
  )
}
