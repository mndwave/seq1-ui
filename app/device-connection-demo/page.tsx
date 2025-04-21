"use client"

import { useState } from "react"
import DeviceRack from "@/components/device-rack"
import { devices } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import MIDIPermissionRequest from "@/components/midi-permission-request"
import DeviceInitializingMIDI from "@/components/device-initializing-midi"
import DeviceInitializing from "@/components/device-initializing"
import { Info, XCircle } from "lucide-react"
import DeviceCard from "@/components/device-card"

export default function DeviceConnectionDemo() {
  const [viewState, setViewState] = useState<
    "empty" | "permission-request" | "initializing" | "connected" | "denied" | "unsupported"
  >("permission-request")
  const [useSingleIndicator, setUseSingleIndicator] = useState(true)
  const [showInitializingDevice, setShowInitializingDevice] = useState(false)

  // Mock function for permission granted callback
  const handlePermissionGranted = () => {
    setViewState("initializing")

    // After a delay, show connected state
    setTimeout(() => {
      setViewState("connected")
    }, 3000)
  }

  // Add a device that's initializing
  const addInitializingDevice = () => {
    setShowInitializingDevice(true)

    // Auto-remove after initialization completes
    setTimeout(() => {
      setShowInitializingDevice(false)
    }, 6000) // 6 seconds total (5s initialization + 1s fade)
  }

  return (
    <div className="min-h-screen bg-[#1a1015] flex flex-col">
      {/* Header with controls */}
      <div className="p-4 border-b border-[#3a2a30] bg-[#2a1a20]">
        <div className="max-w-screen-lg mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-xl font-semibold italic text-[#f0e6c8] font-poppins">SEQ1 Device Connection Demo</h1>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => setViewState("permission-request")}
              className={`channel-button ${viewState === "permission-request" ? "active" : ""}`}
            >
              <span className="text-xs tracking-wide">PERMISSION REQUEST</span>
            </Button>

            <Button
              onClick={() => setViewState("denied")}
              className={`channel-button ${viewState === "denied" ? "active" : ""}`}
            >
              <span className="text-xs tracking-wide">PERMISSION DENIED</span>
            </Button>

            <Button
              onClick={() => setViewState("unsupported")}
              className={`channel-button ${viewState === "unsupported" ? "active" : ""}`}
            >
              <span className="text-xs tracking-wide">UNSUPPORTED</span>
            </Button>

            <Button
              onClick={() => setViewState("initializing")}
              className={`channel-button ${viewState === "initializing" ? "active" : ""}`}
            >
              <span className="text-xs tracking-wide">INITIALIZING</span>
            </Button>

            <Button
              onClick={() => setViewState("connected")}
              className={`channel-button ${viewState === "connected" ? "active" : ""}`}
            >
              <span className="text-xs tracking-wide">CONNECTED</span>
            </Button>

            <Button
              onClick={() => setViewState("empty")}
              className={`channel-button ${viewState === "empty" ? "active" : ""}`}
            >
              <span className="text-xs tracking-wide">EMPTY</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setUseSingleIndicator(!useSingleIndicator)}
              className={`channel-button ${useSingleIndicator ? "active" : ""}`}
            >
              <span className="text-xs tracking-wide">
                {useSingleIndicator ? "SINGLE INDICATOR" : "DUAL INDICATORS"}
              </span>
            </Button>

            {viewState === "connected" && (
              <Button onClick={addInitializingDevice} className="channel-button">
                <span className="text-xs tracking-wide">ADD INITIALIZING DEVICE</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Demo container */}
      <div className="flex-1 flex">
        <div className="max-w-screen-lg mx-auto w-full flex my-8">
          {/* Device rack with conditional content */}
          <div className="w-full max-w-md border-2 border-[#3a2a30] rounded-sm overflow-hidden">
            <div className="p-4 border-b border-[#3a2a30] relative overflow-hidden flex justify-between items-center">
              <div className="absolute inset-0 diagonal-stripes opacity-20"></div>
              <h2 className="text-sm font-medium text-[#f0e6c8] uppercase tracking-wider relative z-20">DEVICE RACK</h2>
            </div>

            <div className="divide-y divide-[#3a2a30] relative z-10">
              {viewState === "permission-request" && (
                <MIDIPermissionRequest onPermissionGranted={handlePermissionGranted} />
              )}

              {viewState === "denied" && (
                <div className="p-6 relative inset-panel">
                  <div className="absolute inset-0 dot-pattern opacity-10"></div>
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <Info size={48} className="text-[#f5a623] mb-4" />
                    <h3 className="text-sm font-medium text-[#f0e6c8] uppercase tracking-wider mb-2">
                      LET'S CONNECT YOUR HARDWARE
                    </h3>
                    <p className="text-xs text-[#f0e6c8] mb-4 max-w-md mx-auto">
                      SEQ1 needs permission to access your MIDI devices to work properly.
                    </p>
                    <p className="text-xs text-[#a09080] mb-4 max-w-md mx-auto">
                      To enable this feature, click the lock/site settings icon in your browser's address bar, find
                      "MIDI devices" and change it to "Allow".
                    </p>
                    <div className="flex justify-center">
                      <button
                        className="relative px-5 py-2.5 overflow-hidden group bg-[#f0e6c8] rounded-sm text-[#2a1a20] hover:bg-[#fff] transition-all duration-300"
                        style={{
                          boxShadow:
                            "0 2px 0 #3a2a30, inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 4px 8px rgba(0, 0, 0, 0.3)",
                        }}
                      >
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent opacity-50"></span>
                        <span className="absolute inset-0 w-full h-full dot-pattern opacity-10"></span>
                        <span
                          className="relative flex items-center justify-center text-xs font-bold tracking-wide"
                          style={{ textShadow: "0 1px 0 rgba(255, 255, 255, 0.4)" }}
                        >
                          REFRESH & CONNECT
                        </span>
                        <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#3a2a30] opacity-20 group-active:h-0 transition-all duration-150"></span>
                        <span className="absolute inset-0 w-full h-full bg-[#2a1a20] opacity-0 group-active:opacity-5 group-active:translate-y-px transition-all duration-150"></span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {viewState === "unsupported" && (
                <div className="p-6 relative inset-panel">
                  <div className="absolute inset-0 dot-pattern opacity-10"></div>
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <XCircle size={48} className="text-[#dc5050] mb-4" />
                    <h3 className="text-sm font-medium text-[#f0e6c8] uppercase tracking-wider mb-2">
                      WebMIDI Not Supported
                    </h3>
                    <p className="text-xs text-[#a09080] mb-4 max-w-md mx-auto">
                      Your browser doesn't support WebMIDI, which is required to connect to hardware devices.
                    </p>
                    <p className="text-xs text-[#a09080] max-w-md mx-auto">
                      Please use Chrome, Edge, or Opera to use SEQ1's MIDI features.
                    </p>
                  </div>
                </div>
              )}

              {viewState === "initializing" && <DeviceInitializingMIDI />}

              {viewState === "connected" && (
                <div className="flex flex-col w-full">
                  {showInitializingDevice && (
                    <DeviceInitializing
                      deviceName="Prophet 5"
                      isNew={true}
                      onInitialized={() => setShowInitializingDevice(false)}
                    />
                  )}
                  <div className="p-2 bg-[#2a1a20] text-[#f0e6c8] text-xs border-b border-[#3a2a30]">
                    <div className="flex justify-between items-center">
                      <span>Connected Devices: {devices.length}</span>
                      <span className="text-[#50dc64]">● MIDI Active</span>
                    </div>
                  </div>
                  {devices.map((device, index) => (
                    <div key={device.id} className="border-b border-[#3a2a30] last:border-b-0">
                      <DeviceCard
                        device={device}
                        useSingleIndicator={useSingleIndicator}
                        onConfigClick={() => console.log(`Configure ${device.name}`)}
                      />
                    </div>
                  ))}
                </div>
              )}

              {viewState === "empty" && <DeviceRack devices={[]} useSingleIndicator={useSingleIndicator} />}
            </div>
          </div>

          {/* Instructions */}
          <div className="ml-8 flex-1">
            <div className="p-6 bg-[#2a1a20] border border-[#3a2a30] rounded-sm">
              <h2 className="text-sm font-medium text-[#f0e6c8] uppercase tracking-wider mb-4">About This Demo</h2>
              <div className="text-sm text-[#a09080] space-y-4">
                <p>This demo shows the different states of the Device Rack component:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Permission Request:</strong> Initial state asking for MIDI access
                  </li>
                  <li>
                    <strong>Permission Denied:</strong> When the user has denied MIDI access
                  </li>
                  <li>
                    <strong>Unsupported:</strong> When the browser doesn't support WebMIDI
                  </li>
                  <li>
                    <strong>Initializing:</strong> When MIDI is being initialized
                  </li>
                  <li>
                    <strong>Connected:</strong> When devices are connected
                  </li>
                  <li>
                    <strong>Empty:</strong> When no devices are connected
                  </li>
                </ul>
                <p>
                  Use the buttons above to switch between different states and toggle between single and dual MIDI
                  indicators.
                </p>
                <p>
                  In the "Connected" state, you can also add an initializing device to see how it appears in the rack.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
