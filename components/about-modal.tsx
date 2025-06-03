"use client"

import { useState, useEffect } from "react"
import { Info, Mail } from "lucide-react"
import DraggableModal from "./draggable-modal"

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const [blockHeight, setBlockHeight] = useState<string>("999999")

  // Function to get current bitcoin blockheight (same as VersionIndicator)
  const getBlockHeight = async (): Promise<string> => {
    try {
      // Try multiple APIs for reliability
      const apis = [
        "https://blockstream.info/api/blocks/tip/height",
        "https://blockchain.info/q/getblockcount", 
        "https://mempool.space/api/blocks/tip/height"
      ]

      for (const api of apis) {
        try {
          const response = await fetch(api, { 
            signal: AbortSignal.timeout(5000) // 5 second timeout
          })
          if (response.ok) {
            const height = await response.text()
            return height.trim()
          }
        } catch (err) {
          console.warn(`Failed to fetch from ${api}:`, err)
        }
      }
      
      // Fallback to static high number if all APIs fail
      return "999999"
    } catch (error) {
      console.warn("All blockheight APIs failed:", error)
      return "999999"
    }
  }

  // Update blockheight on mount
  useEffect(() => {
    const updateBlockHeight = async () => {
      const height = await getBlockHeight()
      setBlockHeight(height)
    }

    if (isOpen) {
      updateBlockHeight()
    }
  }, [isOpen])

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
