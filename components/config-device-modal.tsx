"use client"

import { useState, useEffect } from "react"
import { X, Trash2 } from "lucide-react"

interface Device {
  id: string
  name: string
  type: string
  port: string
  isConnected: boolean
  hasPatches: boolean
  patchCount?: number
  midiActivity?: {
    in: boolean
    out: boolean
  }
  isManuallyAdded?: boolean
}

interface ConfigDeviceModalProps {
  isOpen: boolean
  onClose: () => void
  device: Device | null
  onUpdate: (device: Device) => void
  onDelete?: (deviceId: string) => void
}

// Mock data for available MIDI ports
const availablePorts = [
  { id: "p1", name: "MIDI 1" },
  { id: "p2", name: "MIDI 2" },
  { id: "p3", name: "MIDI 3" },
  { id: "p4", name: "MIDI 4" },
  { id: "p5", name: "USB MIDI 1" },
  { id: "p6", name: "USB MIDI 2" },
]

export default function ConfigDeviceModal({ isOpen, onClose, device, onUpdate, onDelete }: ConfigDeviceModalProps) {
  const [port, setPort] = useState("")

  useEffect(() => {
    if (device) {
      setPort(device.port)
    }
  }, [device])

  if (!isOpen || !device) return null

  const handleUpdate = () => {
    if (device) {
      const updatedDevice: Device = {
        ...device,
        port,
      }

      onUpdate(updatedDevice)
    }
  }

  const handleDelete = () => {
    if (device && onDelete) {
      onDelete(device.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-80 bg-[#2a1a20] border-2 border-[#3a2a30] relative">
        {/* Modal header with vintage hardware styling */}
        <div className="bg-[#3a2a30] px-4 py-2 flex justify-between items-center">
          <h3 className="text-[#f0e6c8] text-sm tracking-wide">CONFIGURE DEVICE</h3>
          <button onClick={onClose} className="text-[#a09080] hover:text-[#f0e6c8]">
            <X size={16} />
          </button>
        </div>

        {/* Modal content */}
        <div className="p-4 space-y-6">
          {/* Device name (read-only) */}
          <div className="space-y-1">
            <label className="text-xs text-[#a09080] tracking-wide">DEVICE NAME</label>
            <div className="w-full bg-[#1a1015] border border-[#3a2a30] rounded-sm px-3 py-1.5 text-sm text-[#f0e6c8] tracking-wide">
              {device.name}
            </div>
          </div>

          {/* MIDI port selection */}
          <div className="space-y-1">
            <label className="text-xs text-[#a09080] tracking-wide">MIDI PORT</label>
            <select
              value={port}
              onChange={(e) => setPort(e.target.value)}
              className="w-full bg-[#1a1015] border border-[#3a2a30] rounded-sm px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4287f5] text-[#f0e6c8] tracking-wide"
            >
              {availablePorts.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between pt-2">
            <button
              className="channel-button flex items-center px-3 py-1.5 bg-[#3a2030] hover:bg-[#4a3040]"
              onClick={handleDelete}
            >
              <Trash2 size={14} className="mr-1.5" />
              <span className="text-xs tracking-wide">REMOVE</span>
            </button>

            <button className="channel-button active flex items-center px-3 py-1.5" onClick={handleUpdate}>
              <span className="text-xs tracking-wide">UPDATE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
