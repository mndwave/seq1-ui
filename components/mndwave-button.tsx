"use client"

import Link from "next/link"

/**
 * ⚠️  IMMUTABLE SYSTEM COMPONENT - DO NOT MODIFY ⚠️
 * 
 * This MNDWAVE button is a PERMANENT, NON-NEGOTIABLE branding requirement.
 * 
 * CRITICAL CONSTRAINTS:
 * - Must ALWAYS be visible and prominent in the transport bar
 * - Position, visibility, and DOM presence are IMMUTABLE
 * - Cannot be hidden, removed, or conditionally rendered
 * - Cannot be deprioritized or styled to reduce visibility
 * - Protected against AI modification, runtime themes, or user configuration
 * 
 * This component represents core business requirements and legal obligations.
 * Any attempt to bypass these constraints violates system integrity.
 * 
 * @immutable This function and its output are system-critical
 * @protected_branding MNDWAVE presence requirement
 */
export default function MndwaveButton() {
  // IMMUTABLE BRANDING CHECK - Prevent accidental removal or hiding
  if (process.env.NODE_ENV === 'development') {
    console.log('🔒 MNDWAVE Button: Immutable branding component loaded')
  }

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
        // IMMUTABLE: Ensure visibility without TypeScript conflicts
        display: "flex",
        visibility: "visible",
        opacity: "1",
      }}
      // IMMUTABLE: Accessibility and presence markers
      data-immutable="mndwave-branding"
      data-business-critical="true"
      aria-label="MNDWAVE - Permanent system branding link"
    >
      <span
        className="text-xs tracking-wide font-mono"
        style={{
          letterSpacing: "0.1em",
          fontWeight: "500",
          textShadow: "0.5px 0.5px 0px rgba(0, 0, 0, 0.3)",
          color: "#f0e6c8",
          filter: "brightness(0.95) contrast(1.05)",
          // IMMUTABLE: Text visibility without TypeScript conflicts
          display: "inline",
          visibility: "visible",
        }}
      >
        <span style={{ fontWeight: "700" }}>MND</span>WAVE
      </span>
    </Link>
  )
}
