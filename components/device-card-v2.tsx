"use client"

import { useState } from "react"
import type { Device } from "@/lib/types"

/**
 * Props for the DeviceCardV2 component
 */
interface DeviceCardV2Props {
  /** Device data to display */
  device: Device
  /** Whether to use a single data indicator for both IN/OUT */
  useSingleIndicator: boolean
  /** Callback when config button is clicked */
  onConfigClick: () => void
  /** Layout variation to use (1-4) */
  layoutVariation?: number
}

/**
 * DeviceCardV2 component
 *
 * An updated version of DeviceCard that supports different layout variations
 * for the MIDI indicator and power switch.
 */
export default function DeviceCardV2({
  device,
  useSingleIndicator,
  onConfigClick,
  layoutVariation = 1,
}: DeviceCardV2Props) {
  const [isConnected, setIsConnected] = useState(device.isConnected)

  /**
   * Toggles the connection state of the device
   */
  const toggleConnection = () => {
    setIsConnected(!isConnected)
  }

  return (
    <div className="p-4 relative inset-panel">
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
              <div className="relative w-14 h-5 flex items-center justify-center">
                {/* Auto indicator background with very subtle green tint */}
                <div
                  className="absolute inset-0 bg-[#2a2520] border border-[#3a3a30]"
                  style={{
                    borderRadius: "1px",
                    backgroundColor: "rgba(60, 160, 72, 0.05)", // Very subtle green
                  }}
                ></div>

                {/* Subtle dot pattern */}
                <div className="absolute inset-0 dot-pattern opacity-10" style={{ borderRadius: "1px" }}></div>

                {/* Indicator text */}
                <span className="relative text-[9px] tracking-wide text-[#70a080] font-medium opacity-60">AUTO</span>
              </div>
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium text-[#f0e6c8]">{device.name}</h3>
            <p className="text-xs text-[#a09080] tracking-wide">{device.port}</p>
          </div>
        </div>

        {/* Different layouts based on the selected variation */}
        {layoutVariation === 1 && (
          <div className="flex items-center">
            {useSingleIndicator ? (
              <SingleDataIndicator
                inActive={device.midiActivity?.in}
                outActive={device.midiActivity?.out}
                className="mr-3"
              />
            ) : (
              <div className="flex mr-3 space-x-1">
                <MidiActivityLight active={device.midiActivity?.in} color="red" label="IN" />
                <MidiActivityLight active={device.midiActivity?.out} color="orange" label="OUT" />
              </div>
            )}
            <RockerSwitch isActive={isConnected} onClick={toggleConnection} />
          </div>
        )}

        {layoutVariation === 2 && (
          <div className="flex items-center">
            {useSingleIndicator ? (
              <SingleDataIndicator
                inActive={device.midiActivity?.in}
                outActive={device.midiActivity?.out}
                className="mr-4"
              />
            ) : (
              <div className="flex mr-4 space-x-1">
                <MidiActivityLight active={device.midiActivity?.in} color="red" label="IN" />
                <MidiActivityLight active={device.midiActivity?.out} color="orange" label="OUT" />
              </div>
            )}
            <div className="flex flex-col items-center">
              <SmallRockerSwitch isActive={isConnected} onClick={toggleConnection} />
              <span className="text-[6px] text-[#a09080] mt-0.5 tracking-wide">POWER</span>
            </div>
          </div>
        )}

        {layoutVariation === 3 && (
          <div className="flex items-center space-x-4">
            {useSingleIndicator ? (
              <SingleDataIndicator inActive={device.midiActivity?.in} outActive={device.midiActivity?.out} />
            ) : (
              <div className="flex space-x-1">
                <MidiActivityLight active={device.midiActivity?.in} color="red" label="IN" />
                <MidiActivityLight active={device.midiActivity?.out} color="orange" label="OUT" />
              </div>
            )}

            <div className="flex flex-col items-center">
              <div
                className="w-8 h-5 rounded-sm relative"
                style={{
                  backgroundColor: isConnected ? "#8a2020" : "#333333",
                  boxShadow: isConnected ? `0 0 4px rgba(138, 32, 32, 0.2)` : "none",
                }}
                onClick={toggleConnection}
              >
                {/* Circle indicator */}
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                  style={{
                    border: isConnected ? "1px solid rgba(255, 255, 255, 0.5)" : "1px solid rgba(150, 150, 150, 0.4)",
                    opacity: isConnected ? 0.7 : 0.4,
                  }}
                ></div>

                {/* Glow effects */}
                {isConnected && (
                  <div
                    className="absolute -inset-1 blur-sm"
                    style={{
                      borderRadius: "3px",
                      background:
                        "radial-gradient(circle at center, rgba(138, 32, 32, 0.15) 0%, rgba(138, 32, 32, 0.05) 80%, transparent 100%)",
                    }}
                  ></div>
                )}
              </div>
              <span className="text-[6px] text-[#a09080] mt-0.5 tracking-wide">POWER</span>
            </div>
          </div>
        )}

        {layoutVariation === 4 && (
          <div className="flex items-center">
            <RockerSwitch isActive={isConnected} onClick={toggleConnection} />
          </div>
        )}
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
 */
function SingleDataIndicator({ inActive, outActive, className = "" }: SingleDataIndicatorProps) {
  // Determine color based on activity
  const getColor = () => {
    if (inActive && outActive) return "#dc9050" // Both - orange
    if (inActive) return "#dc5050" // Input only - red
    if (outActive) return "#50dc64" // Output only - green
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

/**
 * RockerSwitch component
 *
 * Displays a toggle switch for device connection with a realistic vintage bulb-like glow
 * that has imperfections and a hazy effect on the surrounding area
 */
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

/**
 * SmallRockerSwitch component
 *
 * A smaller version of the RockerSwitch component
 */
function SmallRockerSwitch({ isActive, onClick }: { isActive: boolean; onClick: () => void }) {
  // Using an even duller, more muted red for a weak vintage bulb look
  const activeRed = "#8a2020" // Very dull, muted red

  return (
    <button
      onClick={onClick}
      className="relative w-8 h-5 flex items-center justify-center"
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
        className={`relative w-6 h-4 transition-colors duration-200 overflow-hidden`}
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
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-all duration-200`}
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
