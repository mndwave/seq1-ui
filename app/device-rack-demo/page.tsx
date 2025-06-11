"use client"

import { useState } from "react"
import DeviceRack from "@/components/device-rack"
import { devices } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"

export default function DeviceRackDemo() {
  const [showDevices, setShowDevices] = useState(false)

  return (
    <div className="min-h-screen bg-[#1a1015] flex flex-col">
      {/* Header with controls */}
      <div className="p-4 border-b border-[#3a2a30] bg-[#2a1a20]">
        <div className="max-w-screen-lg mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold italic text-[#f0e6c8] font-poppins">SEQ1 Device Rack Demo</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#a09080]">
              {showDevices ? "Showing populated state" : "Showing empty state"}
            </span>
            <Button onClick={() => setShowDevices(!showDevices)} className="channel-button active">
              <span className="text-xs tracking-wide">{showDevices ? "SHOW EMPTY STATE" : "SHOW POPULATED STATE"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Demo container */}
      <div className="flex-1 flex">
        <div className="max-w-screen-lg mx-auto w-full flex my-8">
          {/* Device rack with conditional devices */}
          <div className="w-full max-w-md border-2 border-[#3a2a30] rounded-sm overflow-hidden">
            <DeviceRack devices={showDevices ? devices : []} />
          </div>

          {/* Instructions */}
          <div className="ml-8 flex-1">
            <div className="p-6 bg-[#2a1a20] border border-[#3a2a30] rounded-sm">
              <h2 className="text-sm font-medium text-[#f0e6c8] uppercase tracking-wider mb-4">About This Demo</h2>
              <div className="text-sm text-[#a09080] space-y-4">
                <p>This demo shows the Device Rack component in both its empty and populated states.</p>
                <p>
                  The empty state provides guidance for new users who haven't connected any devices yet, while the
                  populated state shows how the rack looks with connected devices.
                </p>
                <p>Use the toggle button above to switch between the two states.</p>
                <p>
                  In the empty state, clicking the "ADD DEVICE" button will open the Add Device modal, just as it would
                  in the actual application.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
