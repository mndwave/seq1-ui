"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function LivingSwitchesDemo() {
  const [switches, setSwitches] = useState<boolean[]>(Array(12).fill(true))

  // Toggle a specific switch
  const toggleSwitch = (index: number) => {
    setSwitches((prev) => {
      const newSwitches = [...prev]
      newSwitches[index] = !newSwitches[index]
      return newSwitches
    })
  }

  // Toggle all switches
  const toggleAll = () => {
    setSwitches((prev) => prev.map((s) => !s))
  }

  return (
    <div className="min-h-screen bg-[#1a1015] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#3a2a30] bg-[#2a1a20]">
        <div className="max-w-screen-lg mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold italic text-[#f0e6c8] font-poppins">SEQ1 Living Switches</h1>
          <div className="flex items-center gap-4">
            <Button onClick={toggleAll} className="channel-button active">
              <span className="text-xs tracking-wide">TOGGLE ALL</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Demo container */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-3xl w-full">
          <div className="p-6 bg-[#2a1a20] border border-[#3a2a30] rounded-sm">
            <h2 className="text-sm font-medium text-[#f0e6c8] uppercase tracking-wider mb-6">
              Living Switches with Subtle Modulation
            </h2>

            <div className="grid grid-cols-3 gap-6">
              {switches.map((isOn, index) => (
                <div key={index} className="p-4 relative inset-panel">
                  <div className="absolute inset-0 dot-pattern opacity-10"></div>

                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <h3 className="text-sm font-medium text-[#f0e6c8]">Switch {index + 1}</h3>
                      <p className="text-xs text-[#a09080] tracking-wide">{isOn ? "Powered On" : "Powered Off"}</p>
                    </div>

                    <LivingSwitch isActive={isOn} onClick={() => toggleSwitch(index)} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 text-sm text-[#a09080]">
              <p>
                Each switch has its own subtle "living" quality - with unique brightness modulation patterns that make
                them feel like real vintage hardware. The variations are subtle enough to be almost subliminal, but they
                add an organic quality to the interface.
              </p>
              <p className="mt-4">
                Notice how no two switches pulse in exactly the same way, and occasionally you might catch a
                micro-flicker that mimics the behavior of aging incandescent bulbs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Living switch component with unique animation patterns
function LivingSwitch({ isActive, onClick }: { isActive: boolean; onClick: () => void }) {
  // Using an even duller, more muted red for a weak vintage bulb look
  const activeRed = "#8a2020" // Very dull, muted red

  // Generate unique animation IDs for this instance
  // This ensures each switch has its own animation pattern
  const [flickerType] = useState(() => Math.floor(Math.random() * 4) + 1)
  const [flickerDuration] = useState(() => 3 + Math.random() * 2)
  const [microFlickerType] = useState(() => Math.floor(Math.random() * 4) + 1)
  const [microFlickerDuration] = useState(() => 15 + Math.random() * 10)

  return (
    <button
      onClick={onClick}
      className="relative w-10 h-6 flex items-center justify-center"
      aria-pressed={isActive}
      aria-label="Toggle switch"
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

        {/* Advanced flickering effect for weak bulb simulation - unique to each instance */}
        {isActive && (
          <>
            {/* Slow, subtle brightness modulation */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                animation: `bulbFlicker${flickerType} ${flickerDuration}s infinite`,
                background: "radial-gradient(circle at 60% 30%, rgba(138, 32, 32, 0.3) 0%, transparent 70%)",
              }}
            ></div>

            {/* Very occasional micro-flicker */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                animation: `microFlicker${microFlickerType} ${microFlickerDuration}s infinite`,
                background: "radial-gradient(circle at 40% 60%, rgba(138, 32, 32, 0.4) 0%, transparent 60%)",
              }}
            ></div>
          </>
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
