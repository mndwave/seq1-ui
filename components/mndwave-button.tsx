"use client"

import Link from "next/link"

export default function MndwaveButton() {
  return (
    <Link
      href="https://primal.net/mndwave"
      target="_blank"
      rel="noopener noreferrer"
      className="channel-button flex items-center px-3 py-1.5 mr-2"
      style={{
        backgroundColor: "rgba(40, 30, 35, 0.9)",
        border: "1px solid rgba(80, 70, 75, 0.8)",
        borderRadius: "3px",
      }}
    >
      <span
        className="text-xs tracking-wide font-mono"
        style={{
          letterSpacing: "0.1em",
          fontWeight: "500",
          textShadow: "0.5px 0.5px 0px rgba(0, 0, 0, 0.3)",
          color: "#f0e6c8",
          filter: "brightness(0.95) contrast(1.05)",
        }}
      >
        <span style={{ fontWeight: "700" }}>MND</span>WAVE
      </span>
    </Link>
  )
}
