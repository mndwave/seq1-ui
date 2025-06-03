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

          {/* Connection toggle */}
          <button onClick={toggleConnection} className="flex items-center" aria-label="Toggle device connection">
            <div
              className={`w-12 h-6 rounded-full relative transition-all duration-300 ${
                isConnected ? "bg-[#50dc64]" : "bg-[#3a2a30]"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300 ${
                  isConnected ? "left-6" : "left-0.5"
                }`}
              />
            </div>
          </button>
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

/**
 * MidiActivityLight component
 *
 * Displays a small indicator light for MIDI activity
 * Green = MIDI input, Red = MIDI output, Orange = simultaneous input/output
 */
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

/**
 * SingleDataIndicator component
 *
 * Displays a combined indicator for both MIDI input and output activity
 * Colors follow conventional MIDI standards:
 * - Green: Input only
 * - Red: Output only  
 * - Orange: Both input and output
 * - Dark gray: No activity
 */
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
