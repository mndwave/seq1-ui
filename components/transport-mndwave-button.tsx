import React from 'react'
import { CANONICAL_MOBILE_CONTENT } from '../lib/canonical_content_constants'

export default function TransportMndwaveButton() {
  const handleClick = () => {
    window.open(CANONICAL_MOBILE_CONTENT.dmMndwave.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      onClick={handleClick}
      className="channel-button micro-feedback flex items-center px-3 py-1.5"
      style={{
        position: "relative",
        zIndex: 2,
      }}
      title="Visit MNDWAVE on Primal/Nostr"
    >
      <span className="text-xs tracking-wide">
        <span className="font-bold">MND</span><span className="font-medium">WAVE</span>
      </span>
    </button>
  )
}

export { TransportMndwaveButton }
