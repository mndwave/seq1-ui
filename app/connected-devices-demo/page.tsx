"use client"

import { useState, useEffect } from "react"
import { devices } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import DeviceCard from "@/components/device-card"
import DeviceInitializing from "@/components/device-initializing"

export default function ConnectedDevicesDemo() {
  const [useSingleIndicator, setUseSingleIndicator] = useState(true)
  const [showInitializingDevice, setShowInitializingDevice] = useState(false)
  const [activeDevices, setActiveDevices] = useState([...devices])
  const [showMIDIActivity, setShowMIDIActivity] = useState(false)

  // Add a device that's initializing
  const addInitializingDevice = () => {
    setShowInitializingDevice(true)

    // Auto-remove after initialization completes
    setTimeout(() => {
      setShowInitializingDevice(false)

      // Add a new device to the list
      const newDevice = {
        id: `new-${Date.now()}`,
        name: "Elektron Digitakt",
        type: "Digital Drum Machine",
        port: "USB MIDI 2",
        isConnected: true,
        hasPatches: true,
        patchCount: 128,
        isManuallyAdded: true,
        midiActivity: {
          in: false,
          out: false,
        },
      }

      setActiveDevices((prev) => [...prev, newDevice])
    }, 6000) // 6 seconds total (5s initialization + 1s fade)
  }

  // Toggle MIDI activity simulation
  useEffect(() => {
    if (!showMIDIActivity) return

    const interval = setInterval(() => {
      setActiveDevices((currentDevices) =>
        currentDevices.map((device) => {
          if (!device.isConnected) return device

          // Random MIDI activity simulation
          const shouldTriggerIn = Math.random() > 0.7
          const shouldTriggerOut = Math.random() > 0.5

          return {
            ...device,
            midiActivity: {
              in: shouldTriggerIn,
              out: shouldTriggerOut,
            },
          }
        }),
      )
    }, 200) // Flicker rate

    return () => clearInterval(interval)
  }, [showMIDIActivity])

  return (
    <div className="min-h-screen bg-[#1a1015] flex flex-col">
      {/* Header with controls */}
      <div className="p-4 border-b border-[#3a2a30] bg-[#2a1a20]">
        <div className="max-w-screen-lg mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-xl font-semibold italic text-[#f0e6c8] font-poppins">SEQ1 Connected Devices Demo</h1>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setUseSingleIndicator(!useSingleIndicator)}
              className={`channel-button ${useSingleIndicator ? "active" : ""}`}
            >
              <span className="text-xs tracking-wide">
                {useSingleIndicator ? "SINGLE INDICATOR" : "DUAL INDICATORS"}
              </span>
            </Button>

            <Button
              onClick={() => setShowMIDIActivity(!showMIDIActivity)}
              className={`channel-button ${showMIDIActivity ? "active" : ""}`}
            >
              <span className="text-xs tracking-wide">
                {showMIDIActivity ? "MIDI ACTIVITY ON" : "MIDI ACTIVITY OFF"}
              </span>
            </Button>

            <Button onClick={addInitializingDevice} className="channel-button" disabled={showInitializingDevice}>
              <span className="text-xs tracking-wide">ADD NEW DEVICE</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Demo container */}
      <div className="flex-1 flex">
        <div className="max-w-screen-lg mx-auto w-full flex my-8">
          {/* Device rack with connected devices */}
          <div className="w-full max-w-md border-2 border-[#3a2a30] rounded-sm overflow-hidden">
            <div className="p-4 border-b border-[#3a2a30] relative overflow-hidden flex justify-between items-center">
              <div className="absolute inset-0 diagonal-stripes opacity-20"></div>
              <h2 className="text-sm font-medium text-[#f0e6c8] uppercase tracking-wider relative z-20">DEVICE RACK</h2>
            </div>

            <div className="divide-y divide-[#3a2a30] relative z-10">
              {showInitializingDevice && (
                <DeviceInitializing
                  deviceName="Elektron Digitakt"
                  isNew={true}
                  onInitialized={() => setShowInitializingDevice(false)}
                />
              )}

              {activeDevices.map((device) => (
                <div key={device.id} className="transition-all duration-300 animate-slideIn">
                  <DeviceCard
                    device={device}
                    useSingleIndicator={useSingleIndicator}
                    onConfigClick={() => console.log(`Configure ${device.name}`)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="ml-8 flex-1">
            <div className="p-6 bg-[#2a1a20] border border-[#3a2a30] rounded-sm">
              <h2 className="text-sm font-medium text-[#f0e6c8] uppercase tracking-wider mb-4">Connected Devices</h2>
              <div className="text-sm text-[#a09080] space-y-4">
                <p>This demo shows the Device Rack with connected hardware devices:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Prophet 5:</strong> Analog Polysynth
                  </li>
                  <li>
                    <strong>Minimoog Model D:</strong> Analog Monosynth
                  </li>
                  <li>
                    <strong>Analog Rytm MKII:</strong> Drum Machine
                  </li>
                  <li>
                    <strong>Analog Four MKII:</strong> Analog Synth
                  </li>
                  <li>
                    <strong>Analog Heat +FX:</strong> Analog Effects
                  </li>
                </ul>
                <p className="mt-4">Use the controls above to:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Toggle between single and dual MIDI indicators</li>
                  <li>Turn MIDI activity simulation on/off</li>
                  <li>Add a new device (Elektron Digitakt) with initialization animation</li>
                </ul>
                <p className="mt-4">The power switches on each device can be toggled to connect/disconnect them.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
