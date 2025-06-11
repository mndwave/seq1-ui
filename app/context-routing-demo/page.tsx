"use client"

import { useState } from "react"
import ChatWindow from "@/components/chat-window"
import DeviceRack from "@/components/device-rack"
import TimelineContainer from "@/components/timeline/timeline-container"
import type { Device } from "@/lib/types"

// Sample devices for the demo
const sampleDevices: Device[] = [
  {
    id: "prophet5-uuid",
    name: "Prophet 5",
    type: "Analog Polysynth",
    port: "MIDI Port 1",
    isConnected: true,
    hasPatches: true,
    patchCount: 128,
    midiActivity: { in: false, out: false },
  },
  {
    id: "minimoog-uuid",
    name: "Minimoog Model D",
    type: "Analog Monosynth",
    port: "MIDI Port 2",
    isConnected: true,
    hasPatches: false,
    midiActivity: { in: false, out: false },
  },
]

export default function ContextRoutingDemo() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null)
  const [isHardwareConnected, setIsHardwareConnected] = useState(true)

  // Handler for when a clip is selected in the timeline
  const handleClipSelect = (clipId: string) => {
    setSelectedClipId(clipId)
  }

  // Handler for when a device is selected in the device rack
  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDeviceId(deviceId)
  }

  return (
    <div className="flex flex-col h-screen bg-[#1a1015]">
      <div className="flex-1 flex">
        {/* Device Rack */}
        <DeviceRack
          devices={sampleDevices}
          onHardwareConnectionChange={setIsHardwareConnected}
          selectedDeviceId={selectedDeviceId}
          onDeviceSelect={handleDeviceSelect}
        />

        {/* Chat Window */}
        <ChatWindow
          isHardwareConnected={isHardwareConnected}
          selectedDeviceId={selectedDeviceId}
          selectedClipId={selectedClipId}
        />
      </div>

      {/* Timeline */}
      <div className="h-64 border-t border-[#3a2a30]">
        <TimelineContainer selectedDeviceId={selectedDeviceId} onClipSelect={handleClipSelect} />
      </div>
    </div>
  )
}
