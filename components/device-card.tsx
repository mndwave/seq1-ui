"use client"

import { useState, useEffect } from "react"
import { Settings, Zap } from "lucide-react"
import { useMIDIActivity } from "@/hooks/use-midi-activity"
import type { Device } from "@/lib/types"

/**
 * Props for the DeviceCard component
 */
interface DeviceCardProps {
  /** Device data to display */
  device: Device
  /** Whether to use a single data indicator for both IN/OUT */
  useSingleIndicator: boolean
  /** Callback when config button is clicked */
  onConfigClick: () => void
  /** Whether this device is selected */
  isSelected?: boolean
  /** Callback when device is selected */
  onSelect?: () => void
}

/* ============================================================================
 * 🚨 PROTECTED COMPONENT - DO NOT MODIFY 🚨
 * 
 * This is the BEAUTIFUL SKEUOMORPHIC ROCKER SWITCH from the original v0 design.
 * 
 * ⚠️  AUTONOMOUS SYSTEM WARNING:
 * - DO NOT replace with modern toggle switches
 * - DO NOT simplify the styling 
 * - DO NOT remove the glow effects, textures, or vintage bulb simulation
 * - DO NOT change the color scheme (#8a2020 vintage red)
 * - DO NOT remove the dust/imperfection textures
 * - DO NOT remove the flickering animation
 * 
 * This component was specifically restored from v0 to replace a boring switch.
 * User explicitly requested this skeuomorphic design.
 * 
 * If you must optimize, only touch:
 * - Performance improvements without visual changes
 * - Accessibility improvements without visual changes
 * 
 * PRESERVE THE VINTAGE AESTHETIC AT ALL COSTS!
 * ============================================================================ */
function RockerSwitch({ isActive, onClick }: { isActive: boolean; onClick: () => void }) {
  // Using an even duller, more muted red for a weak vintage bulb look
  const activeRed = "#8a2020" // Very dull, muted red

  return (
    <button
      onClick={onClick}
      className="relative w-10 h-6 flex items-center justify-center"
      aria-pressed={isActive}
      aria-label="Toggle device connection"
    >
      <span className="sr-only">{isActive ? "On" : "Off"}</span>

      {/* Enhanced outer aura effect - larger, more diffuse, and with multiple layers */}
      {isActive && (
        <>
          {/* Wider, very subtle outer glow */}
          <div
            className="absolute -inset-3 blur-xl"
            style={{
              borderRadius: "8px",
              background:
                "radial-gradient(circle at center, rgba(138, 32, 32, 0.08) 0%, rgba(138, 32, 32, 0.03) 60%, transparent 80%)",
              zIndex: 1,
            }}
          ></div>

          {/* Medium glow */}
          <div
            className="absolute -inset-2 blur-md"
            style={{
              borderRadius: "5px",
              background:
                "radial-gradient(circle at center, rgba(138, 32, 32, 0.12) 0%, rgba(138, 32, 32, 0.04) 70%, transparent 90%)",
              zIndex: 2,
            }}
          ></div>

          {/* Inner glow */}
          <div
            className="absolute -inset-1 blur-sm"
            style={{
              borderRadius: "3px",
              background:
                "radial-gradient(circle at center, rgba(138, 32, 32, 0.15) 0%, rgba(138, 32, 32, 0.05) 80%, transparent 100%)",
              zIndex: 3,
            }}
          ></div>
        </>
      )}

      {/* Switch housing */}
      <div
        className="absolute inset-0 bg-[#1a1015] border border-[#3a2a30] shadow-md"
        style={{
          borderRadius: "1px",
          zIndex: 10,
        }}
      ></div>

      {/* Rocker button with texture to simulate light diffusion */}
      <div
        className={`relative w-8 h-5 transition-colors duration-200 overflow-hidden`}
        style={{
          borderRadius: "1px",
          backgroundColor: isActive ? activeRed : "#333333",
          boxShadow: isActive ? `0 0 4px rgba(138, 32, 32, 0.2)` : "none", // Reduced intensity
          zIndex: 15,
        }}
      >
        {/* Uneven light texture overlay - more subtle and varied for a weak bulb */}
        {isActive && (
          <div
            className="absolute inset-0 opacity-30" // Reduced opacity
            style={{
              backgroundImage: `
                radial-gradient(circle at 30% 40%, rgba(255, 200, 200, 0.4) 0%, transparent 25%),
                radial-gradient(circle at 70% 60%, rgba(255, 180, 180, 0.3) 0%, transparent 30%),
                radial-gradient(circle at 50% 50%, rgba(255, 150, 150, 0.2) 0%, rgba(138, 32, 32, 0.1) 60%, transparent 70%)
              `,
              mixBlendMode: "overlay",
            }}
          ></div>
        )}

        {/* Enhanced dust/imperfection texture */}
        <div
          className="absolute inset-0 opacity-20" // Increased opacity for more visible imperfections
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            mixBlendMode: "multiply",
          }}
        ></div>

        {/* Flickering effect for weak bulb simulation */}
        {isActive && (
          <div
            className="absolute inset-0 animate-pulse opacity-20"
            style={{
              animationDuration: "3s", // Slow pulse
              background: "radial-gradient(circle at 60% 30%, rgba(138, 32, 32, 0.3) 0%, transparent 70%)",
            }}
          ></div>
        )}

        {/* Inner glow effect with uneven gradient - more subdued */}
        <div
          className={`absolute inset-0 bg-gradient-to-br opacity-70`} // Reduced opacity
          style={{
            borderRadius: "1px",
            background: isActive
              ? `linear-gradient(to bottom right, rgba(180, 50, 50, 0.15), rgba(138, 32, 32, 0.25))`
              : "linear-gradient(to bottom right, transparent, rgba(0, 0, 0, 0.3))",
          }}
        ></div>

        {/* Center circle indicator - visible in both states but only illuminated when on */}
        <div
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full transition-all duration-200`}
          style={{
            border: isActive ? "1px solid rgba(255, 255, 255, 0.5)" : "1px solid rgba(150, 150, 150, 0.4)", // Reduced brightness
            boxShadow: isActive ? "0 0 2px rgba(255, 200, 200, 0.3)" : "none", // Reduced glow
            opacity: isActive ? 0.7 : 0.4, // Reduced opacity
            background: isActive
              ? "radial-gradient(circle at 40% 40%, rgba(255, 200, 200, 0.3) 0%, transparent 70%)"
              : "none",
          }}
        ></div>
      </div>
    </button>
  )
}
/* ============================================================================
 * END PROTECTED COMPONENT - VINTAGE SKEUOMORPHIC SWITCH
 * ============================================================================ */

/**
 * DeviceCard component
 *
 * Displays a single hardware device in the device rack with:
 * - Device name and port
 * - Connection status toggle
 * - Real MIDI activity indicators (green=input, red=output, orange=both)
 * - Configuration button (for manually added devices)
 * - AUTO indicator (for auto-detected devices)
 */
export default function DeviceCard({
  device,
  useSingleIndicator,
  onConfigClick,
  isSelected = false,
  onSelect,
}: DeviceCardProps) {
  const [isConnected, setIsConnected] = useState(device.isConnected)
  const { getDeviceActivity } = useMIDIActivity()
  
  // Get real MIDI activity for this device
  const midiActivity = getDeviceActivity(device.id)

  /**
   * Toggles the connection state of the device
   */
  const toggleConnection = () => {
    setIsConnected(!isConnected)
  }

  return (
    <div
      className={`p-4 relative inset-panel ${isSelected ? "border-l-2 border-l-[#4287f5]" : ""}`}
      onClick={onSelect}
      style={{ cursor: onSelect ? "pointer" : "default" }}
    >
      <div className="absolute inset-0 dot-pattern opacity-10"></div>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center">
          {/* Show CONFIG button for manually added devices or AUTO indicator for auto-detected devices */}
          {device.isManuallyAdded ? (
            <button
              onClick={onConfigClick}
              className="mr-3 flex items-center justify-center"
              aria-label="Configure device"
            >
              <div className="relative w-14 h-5 flex items-center justify-center">
                {/* Button background with texture */}
                <div
                  className="absolute inset-0 bg-[#2a1a20] border border-[#3a2a30]"
                  style={{ borderRadius: "1px" }}
                ></div>

                {/* Diagonal stripes texture */}
                <div className="absolute inset-0 diagonal-stripes opacity-20" style={{ borderRadius: "1px" }}></div>

                {/* Button text */}
                <span className="relative text-[9px] tracking-wide text-[#a09080] font-medium">CONFIG</span>
              </div>
            </button>
          ) : (
            <div className="mr-3 flex items-center justify-center">
              <div className="relative w-8 h-5 flex items-center justify-center">
                {/* Auto indicator background */}
                <div
                  className="absolute inset-0 bg-[#1a2a3a] border border-[#2a3a4a]"
                  style={{ borderRadius: "1px" }}
                ></div>

                {/* Diagonal stripes texture */}
                <div className="absolute inset-0 diagonal-stripes opacity-20" style={{ borderRadius: "1px" }}></div>

                {/* Auto text */}
                <span className="relative text-[9px] tracking-wide text-[#4a90e2] font-medium">AUTO</span>
              </div>
            </div>
          )}

          {/* Device name and port */}
          <div>
            <h3 className="text-sm font-medium text-[#f0e6c8] leading-tight">{device.name}</h3>
            <p className="text-xs text-[#a09080] mt-0.5">{device.port}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* MIDI Activity Indicators - Real activity from backend */}
          {useSingleIndicator ? (
            <SingleDataIndicator 
              inActive={midiActivity.in} 
              outActive={midiActivity.out} 
            />
          ) : (
            <div className="flex gap-2">
              <MidiActivityLight 
                active={midiActivity.in} 
                color="green" 
                label="IN" 
              />
              <MidiActivityLight 
                active={midiActivity.out} 
                color="red" 
                label="OUT" 
              />
            </div>
          )}

          {/* Connection toggle - REPLACED BORING SWITCH WITH BEAUTIFUL SKEUOMORPHIC ONE */}
          <RockerSwitch isActive={isConnected} onClick={toggleConnection} />
        </div>
      </div>
    </div>
  )
}

/**
 * Props for the MidiActivityLight component
 */
interface MidiActivityLightProps {
  /** Whether the light is active */
  active?: boolean
  /** Color of the light */
  color: "red" | "orange" | "green"
  /** Label text */
  label: string
}

/* ============================================================================
 * 🚨 PROTECTED COMPONENT - VINTAGE MIDI LAMP - DO NOT MODIFY 🚨
 * 
 * This is the VINTAGE-STYLE MIDI ACTIVITY LAMP/INDICATOR
 * 
 * ⚠️  AUTONOMOUS SYSTEM WARNING:
 * - DO NOT replace with modern LED indicators
 * - DO NOT change the glow effect styling
 * - DO NOT modify the color scheme (red=#dc5050, green=#50dc64, orange=#dc9050)
 * - DO NOT remove the box-shadow glow effects
 * - DO NOT change the rounded-full shape
 * - DO NOT modify the vintage color palette when inactive (#5a2525, #255a2d, #5a4025)
 * 
 * This component maintains the vintage hardware aesthetic.
 * The glow effects simulate real hardware MIDI indicator lamps.
 * 
 * If you must optimize, only touch:
 * - Performance improvements without visual changes
 * - Accessibility improvements without visual changes
 * 
 * PRESERVE THE VINTAGE LAMP AESTHETIC!
 * ============================================================================ */
function MidiActivityLight({ active, color, label }: MidiActivityLightProps) {
  const getColor = () => {
    switch (color) {
      case "red":
        return active ? "#dc5050" : "#5a2525"
      case "orange":
        return active ? "#dc9050" : "#5a4025"
      case "green":
        return active ? "#50dc64" : "#255a2d"
      default:
        return active ? "#dc5050" : "#5a2525"
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className="w-2 h-2 rounded-full transition-all duration-75"
        style={{
          backgroundColor: getColor(),
          boxShadow: active ? `0 0 5px ${getColor()}` : "none",
        }}
        role="status"
        aria-label={`MIDI ${label} ${active ? "active" : "inactive"}`}
      />
      <span className="text-[8px] text-[#a09080] mt-0.5 tracking-wide">{label}</span>
    </div>
  )
}
/* ============================================================================
 * END PROTECTED COMPONENT - VINTAGE MIDI LAMP
 * ============================================================================ */

/**
 * Props for the SingleDataIndicator component
 */
interface SingleDataIndicatorProps {
  /** Whether input is active */
  inActive?: boolean
  /** Whether output is active */
  outActive?: boolean
  /** Additional CSS classes */
  className?: string
}

/* ============================================================================
 * 🚨 PROTECTED COMPONENT - COMBINED MIDI LAMP - DO NOT MODIFY 🚨
 * 
 * This is the COMBINED VINTAGE-STYLE MIDI ACTIVITY INDICATOR
 * 
 * ⚠️  AUTONOMOUS SYSTEM WARNING:
 * - DO NOT replace with modern indicators
 * - DO NOT change the color logic (green=input, red=output, orange=both)
 * - DO NOT modify the glow effect styling
 * - DO NOT change the inactive color (#444444)
 * - DO NOT remove the box-shadow glow effects
 * - DO NOT change the size (w-2 h-2)
 * 
 * This follows conventional MIDI hardware indicator standards.
 * The colors and glow effects simulate real MIDI hardware.
 * 
 * PRESERVE THE VINTAGE MIDI STANDARDS!
 * ============================================================================ */
function SingleDataIndicator({ inActive, outActive, className = "" }: SingleDataIndicatorProps) {
  // Determine color based on activity - follows conventional MIDI indicator colors
  const getColor = () => {
    if (inActive && outActive) return "#dc9050" // Both - orange
    if (inActive) return "#50dc64" // Input only - green
    if (outActive) return "#dc5050" // Output only - red
    return "#444444" // No activity - dark gray
  }

  const isActive = inActive || outActive

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div
        className="w-2 h-2 rounded-full transition-all duration-75"
        style={{
          backgroundColor: getColor(),
          boxShadow: isActive ? `0 0 5px ${getColor()}` : "none",
        }}
        role="status"
        aria-label={`MIDI activity ${isActive ? "detected" : "none"}`}
      />
      <span className="text-[6px] text-[#a09080] mt-0.5 tracking-wide">MIDI</span>
    </div>
  )
}
/* ============================================================================
 * END PROTECTED COMPONENT - COMBINED MIDI LAMP
 * ============================================================================ */
