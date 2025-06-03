"use client"

import { useState, useEffect } from "react"
import { Info } from "lucide-react"
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
        <div className="text-sm text-[#f0e6c8]">
          <p className="font-medium">SEQ1 [{blockHeight}]</p>
          <p className="text-xs text-[#a09080] mt-1">Precision instrument for sound design</p>
        </div>

        <div className="text-xs text-[#a09080] leading-relaxed space-y-2">
          <p>
            Sovereign music creation through Nostr protocol.
          </p>
          <p>
            Bitcoin-native. Hardware-first. Artist-owned.
          </p>
        </div>
      </div>
      <div className="mt-6 pt-4 border-t border-[#3a3a3a]">
        <div className="text-sm text-[#8fbc8f] mb-3">
          Questions? Feedback? Feature requests? We'd love to hear from you.
        </div>
        <div className="space-y-2">
          <a
            href="mailto:hello@seq1.net"
            className="block text-sm text-[#4287f5] hover:text-[#5a97ff] transition-colors"
          >
            hello@seq1.net
          </a>
          <a
            href="https://github.com/seq1org"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-[#4287f5] hover:text-[#5a97ff] transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </DraggableModal>
  )
}
