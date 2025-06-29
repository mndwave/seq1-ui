import React from 'react'
import { CANONICAL_MOBILE_CONTENT } from '../lib/canonical_content_constants'
import { Mail } from 'lucide-react'

interface DmMndwaveButtonProps {
  className?: string
  style?: React.CSSProperties
}

export default function DmMndwaveButton({ className = '', style = {} }: DmMndwaveButtonProps) {
  const handleDMClick = () => {
    // Use canonical primal.net URL from constants
    window.open(CANONICAL_MOBILE_CONTENT.dmMndwave.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      onClick={handleDMClick}
      className={`relative px-5 py-2.5 overflow-hidden group bg-[#f0e6c8] rounded-sm text-[#2a1a20] hover:bg-[#fff] transition-all duration-300 ${className}`}
      style={{
        boxShadow: '0 2px 0 #3a2a30, inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 4px 8px rgba(0, 0, 0, 0.3)',
        ...style
      }}
      data-immutable="mndwave-contact"
      data-business-critical="true"
      title={`${CANONICAL_MOBILE_CONTENT.dmMndwave.text} on Primal/Nostr`}
    >
      {/* Button texture overlay */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent opacity-50"></span>

      {/* Subtle noise texture */}
      <span className="absolute inset-0 w-full h-full dot-pattern opacity-10"></span>

      {/* Button text with shadow for depth */}
      <div
        className="relative flex items-center justify-center text-xs tracking-wide font-bold"
        style={{ textShadow: '0 1px 0 rgba(255, 255, 255, 0.4)' }}
      >
        <span>DM</span>
        <span className="ml-[0.35em]">MNDWAVE</span>
        <Mail size={14} className="ml-1.5" />
      </div>

      {/* Button press effect */}
      <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#3a2a30] opacity-20 group-active:h-0 transition-all duration-150"></span>
      <span className="absolute inset-0 w-full h-full bg-[#2a1a20] opacity-0 group-active:opacity-5 group-active:translate-y-px transition-all duration-150"></span>
    </button>
  )
}

export { DmMndwaveButton }
