"use client"

import { useState, useEffect } from "react"
import { Info, Mail, Clock } from "lucide-react"
import DraggableModal from "./draggable-modal"
import { getCurrentVersion, fetchBitcoinBlockheight } from "@/lib/version"

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const [version, setVersion] = useState<string>(getCurrentVersion())
  const [isUpdatingVersion, setIsUpdatingVersion] = useState(false)

  // Update version when modal opens
  useEffect(() => {
    const updateVersion = async () => {
      if (!isOpen) return
      
      setIsUpdatingVersion(true)
      try {
        // Try to fetch latest blockheight
        await fetchBitcoinBlockheight()
        setVersion(getCurrentVersion())
      } catch (error) {
        console.warn("Failed to update version:", error)
      } finally {
        setIsUpdatingVersion(false)
      }
    }

    updateVersion()
  }, [isOpen])

  const blockheight = version.replace(/[\[\]]/g, '')
  const isUnknown = version === "[unknown]"

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title="ABOUT SEQ1"
      icon={<Info size={16} className="info-icon-pulse" />}
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

      {/* Version Information */}
      <div className="mt-4 pt-3 border-t border-[#3a3a3a]">
        <div className="flex items-center justify-between text-xs text-[#8fbc8f]">
          <div className="flex items-center space-x-2">
            <Clock size={12} />
            <span>Consensus Clock:</span>
          </div>
          <div className="flex items-center space-x-1">
            {isUpdatingVersion && (
              <div className="w-2 h-2 bg-[#8fbc8f] rounded-full animate-pulse"></div>
            )}
            <span 
              className={`font-mono ${isUnknown ? 'text-[#a09080]' : 'text-[#f0e6c8]'}`}
              title={isUnknown ? "Version unknown - network unreachable" : `Bitcoin block ${blockheight}`}
            >
              {version}
            </span>
          </div>
        </div>
        {!isUnknown && (
          <div className="text-xs text-[#666] mt-1">
            Version = Bitcoin Block {blockheight}
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-[#3a3a3a]">
        <div className="text-sm text-[#8fbc8f] mb-3">
          Wanna get in touch? Tell us what you think? Feature requests? Feedback? Hate mail?
        </div>
        <div className="flex justify-center pt-2 pb-2">
          <a
            href="https://primal.net/mndwave"
            target="_blank"
            rel="noopener noreferrer"
            className="relative px-5 py-2.5 overflow-hidden group bg-[#f0e6c8] rounded-sm text-[#2a1a20] hover:bg-[#fff] transition-all duration-300"
            style={{
              boxShadow: "0 2px 0 #3a2a30, inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 4px 8px rgba(0, 0, 0, 0.3)",
            }}
            data-immutable="mndwave-contact"
            data-business-critical="true"
          >
            {/* Button texture overlay */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent opacity-50"></span>

            {/* Subtle noise texture */}
            <span className="absolute inset-0 w-full h-full dot-pattern opacity-10"></span>

            {/* Button text with shadow for depth */}
            <div
              className="relative flex items-center justify-center text-xs tracking-wide font-bold"
              style={{ textShadow: "0 1px 0 rgba(255, 255, 255, 0.4)" }}
            >
              <span>DM</span>
              <span className="ml-[0.35em]">MNDWAVE</span>
              <span className="ml-[0.35em]">ON</span>
              <span className="ml-[0.35em]">NOSTR</span>
              <Mail size={14} className="ml-1.5" />
            </div>

            {/* Button press effect */}
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#3a2a30] opacity-20 group-active:h-0 transition-all duration-150"></span>
            <span className="absolute inset-0 w-full h-full bg-[#2a1a20] opacity-0 group-active:opacity-5 group-active:translate-y-px transition-all duration-150"></span>
          </a>
        </div>
      </div>
    </DraggableModal>
  )
}
