"use client"

import { useState } from "react"
import DeviceInitializing from "@/components/device-initializing"
import { Button } from "@/components/ui/button"

export default function DeviceInitializingDemo() {
  const [devices, setDevices] = useState<{ id: string; name: string; isNew: boolean }[]>([])
  const [demoCount, setDemoCount] = useState(0)

  const addNewDevice = () => {
    const id = `device-${Date.now()}`
    setDevices((prev) => [
      ...prev,
      {
        id,
        name: `Prophet ${Math.floor(Math.random() * 10) + 1}`,
        isNew: true,
      },
    ])

    // Auto-remove after initialization completes
    setTimeout(() => {
      setDevices((prev) => prev.filter((d) => d.id !== id))
    }, 6000) // 6 seconds total (5s initialization + 1s fade)
  }

  const addReconnectingDevice = () => {
    const id = `device-${Date.now()}`
    setDevices((prev) => [
      ...prev,
      {
        id,
        name: `Analog Rytm MK${Math.floor(Math.random() * 3) + 1}`,
        isNew: false,
      },
    ])

    // Auto-remove after initialization completes
    setTimeout(() => {
      setDevices((prev) => prev.filter((d) => d.id !== id))
    }, 6000) // 6 seconds total (5s initialization + 1s fade)
  }

  const startDemo = () => {
    setDemoCount((prev) => prev + 1)

    // Clear any existing devices
    setDevices([])

    // Add a new device
    addNewDevice()

    // Add a reconnecting device after 2 seconds
    setTimeout(() => {
      addReconnectingDevice()
    }, 2000)

    // Add another new device after 4 seconds
    setTimeout(() => {
      addNewDevice()
    }, 4000)
  }

  return (
    <div className="min-h-screen bg-[#1a1015] flex flex-col">
      {/* Header with controls */}
      <div className="p-4 border-b border-[#3a2a30] bg-[#2a1a20]">
        <div className="max-w-screen-lg mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold italic text-[#f0e6c8] font-poppins">SEQ1 Device Initializing Demo</h1>
          <div className="flex items-center gap-4">
            <Button onClick={startDemo} className="channel-button active">
              <span className="text-xs tracking-wide">START DEMO</span>
            </Button>
            <Button onClick={addNewDevice} className="channel-button">
              <span className="text-xs tracking-wide">ADD NEW DEVICE</span>
            </Button>
            <Button onClick={addReconnectingDevice} className="channel-button">
              <span className="text-xs tracking-wide">ADD RECONNECTING DEVICE</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Demo container */}
      <div className="flex-1 flex">
        <div className="max-w-screen-lg mx-auto w-full flex my-8">
          {/* Device rack with initializing devices */}
          <div className="w-full max-w-md border-2 border-[#3a2a30] rounded-sm overflow-hidden bg-[#2a1a20]">
            <div className="p-4 border-b border-[#3a2a30] relative overflow-hidden flex justify-between items-center">
              <div className="absolute inset-0 diagonal-stripes opacity-20"></div>
              <h2 className="text-sm font-medium text-[#f0e6c8] uppercase tracking-wider relative z-20">DEVICE RACK</h2>
            </div>

            <div className="divide-y divide-[#3a2a30] relative z-10">
              {devices.map((device) => (
                <div key={device.id} className="transition-all duration-500 animate-slideIn relative z-10">
                  <DeviceInitializing
                    deviceName={device.name}
                    isNew={device.isNew}
                    onInitialized={() => {
                      setDevices((prev) => prev.filter((d) => d.id !== device.id))
                    }}
                  />
                </div>
              ))}

              {devices.length === 0 && (
                <div className="p-8 text-center text-[#a09080]">
                  <p>No devices initializing</p>
                  <p className="text-xs mt-2">Click one of the buttons above to add a device</p>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="ml-8 flex-1">
            <div className="p-6 bg-[#2a1a20] border border-[#3a2a30] rounded-sm">
              <h2 className="text-sm font-medium text-[#f0e6c8] uppercase tracking-wider mb-4">About This Demo</h2>
              <div className="text-sm text-[#a09080] space-y-4">
                <p>
                  This demo shows the Device Initializing component that appears when a new device is detected or when a
                  device is reconnecting.
                </p>
                <p>The component includes:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>A status indicator (NEW or INIT)</li>
                  <li>Device name and status</li>
                  <li>Audio meter-like visualization</li>
                  <li>Progress bar showing initialization progress</li>
                  <li>Smooth fade-out transition when complete</li>
                </ul>
                <p>Use the buttons above to add devices in different states or start a demo sequence.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
