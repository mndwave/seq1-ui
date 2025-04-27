"use client"

import { useState } from "react"
import DeviceRack from "@/components/device-rack"
import { devices } from "@/lib/mock-data"

export default function ProphetDemo() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [hardwareConnected, setHardwareConnected] = useState(true)

  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDeviceId(deviceId)
  }

  return (
    <div className="flex h-screen bg-[#1a1015] text-[#f0e6c8]">
      <DeviceRack
        devices={devices}
        useSingleIndicator={false}
        onHardwareConnectionChange={setHardwareConnected}
        selectedDeviceId={selectedDeviceId}
        onDeviceSelect={handleDeviceSelect}
      />

      <div className="flex-1 p-8 flex flex-col">
        <h1 className="text-2xl font-bold mb-6">Device Details</h1>

        {selectedDeviceId ? (
          <div className="inset-panel p-6">
            <div className="absolute inset-0 dot-pattern opacity-10"></div>
            <div className="relative z-10">
              {devices.find((d) => d.id === selectedDeviceId)?.name && (
                <>
                  <h2 className="text-xl mb-4">{devices.find((d) => d.id === selectedDeviceId)?.name}</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[#a09080]">Type</p>
                      <p>{devices.find((d) => d.id === selectedDeviceId)?.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#a09080]">Port</p>
                      <p>{devices.find((d) => d.id === selectedDeviceId)?.port}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[#a09080]">Patches</p>
                      <p>
                        {devices.find((d) => d.id === selectedDeviceId)?.hasPatches
                          ? `Yes (${devices.find((d) => d.id === selectedDeviceId)?.patchCount})`
                          : "No"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-[#a09080]">Added</p>
                      <p>
                        {devices.find((d) => d.id === selectedDeviceId)?.isManuallyAdded ? "Manually" : "Auto-detected"}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-[#a09080] mt-12">
            <p>Select a device from the rack to view details</p>
          </div>
        )}
      </div>
    </div>
  )
}
