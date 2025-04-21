"use client"

import { useState, useEffect } from "react"
import { X, Plus, Search } from "lucide-react"

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
    out: false
  }
  isManuallyAdded?: boolean
}

interface AddDeviceModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (device: Device) => void
}

// Updated list of available devices with more realistic synthesizers and drum machines
const availableDevices = [
  { id: "d1", name: "Prophet 5", type: "Analog Polysynth" },
  { id: "d2", name: "Minimoog Model D", type: "Analog Monosynth" },
  { id: "d3", name: "Analog Rytm MKII", type: "Drum Machine" },
  { id: "d4", name: "Analog Four MKII", type: "Analog Synth" },
  { id: "d5", name: "Analog Heat +FX", type: "Analog Effects" },
  { id: "d6", name: "Moog Subsequent 37", type: "Analog Synth" },
  { id: "d7", name: "Elektron Digitone", type: "FM Synth" },
  { id: "d8", name: "Elektron Digitakt", type: "Digital Drum Machine" },
  { id: "d9", name: "Roland TR-8S", type: "Drum Machine" },
  { id: "d10", name: "Roland Jupiter-X", type: "Digital Synth" },
  { id: "d11", name: "Arturia MatrixBrute", type: "Analog Synth" },
  { id: "d12", name: "Korg Prologue", type: "Analog Polysynth" },
  { id: "d13", name: "Moog Grandmother", type: "Semi-Modular Synth" },
  { id: "d14", name: "Moog Matriarch", type: "Semi-Modular Synth" },
  { id: "d15", name: "Sequential Prophet-6", type: "Analog Polysynth" },
  { id: "d16", name: "Dave Smith OB-6", type: "Analog Polysynth" },
  { id: "d17", name: "Novation Summit", type: "Hybrid Polysynth" },
  { id: "d18", name: "Arturia PolyBrute", type: "Analog Polysynth" },
  { id: "d19", name: "Waldorf Quantum", type: "Hybrid Synth" },
  { id: "d20", name: "Make Noise 0-Coast", type: "Semi-Modular Synth" },
]

// Mock data for available MIDI ports
const availablePorts = [
  { id: "p1", name: "MIDI 1" },
  { id: "p2", name: "MIDI 2" },
  { id: "p3", name: "MIDI 3" },
  { id: "p4", name: "MIDI 4" },
  { id: "p5", name: "USB MIDI 1" },
  { id: "p6", name: "USB MIDI 2" },
]

export default function AddDeviceModal({ isOpen, onClose, onAdd }: AddDeviceModalProps) {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [selectedPort, setSelectedPort] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredDevices, setFilteredDevices] = useState(availableDevices)

  // Filter devices when search query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredDevices(availableDevices)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = availableDevices.filter(
        (device) => device.name.toLowerCase().includes(query) || device.type.toLowerCase().includes(query),
      )
      setFilteredDevices(filtered)
    }
  }, [searchQuery])

  // Reset search and selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("")
      setSelectedDevice(null)
      setSelectedPort(null)
      setFilteredDevices(availableDevices)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleAdd = () => {
    if (selectedDevice && selectedPort) {
      const deviceInfo = availableDevices.find((d) => d.id === selectedDevice)
      const portInfo = availablePorts.find((p) => p.id === selectedPort)

      if (deviceInfo && portInfo) {
        const newDevice: Device = {
          id: `new-${Date.now()}`,
          name: deviceInfo.name,
          type: deviceInfo.type,
          port: portInfo.name,
          isConnected: true,
          hasPatches: false,
          midiActivity: { in: false, out: false },
          isManuallyAdded: true, // Mark as manually added
        }

        onAdd(newDevice)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-96 bg-[#2a1a20] border-2 border-[#3a2a30] relative">
        {/* Modal header with vintage hardware styling */}
        <div className="bg-[#3a2a30] px-4 py-2 flex justify-between items-center">
          <h3 className="text-[#f0e6c8] text-sm tracking-wide">ADD DEVICE</h3>
          <button onClick={onClose} className="text-[#a09080] hover:text-[#f0e6c8]">
            <X size={16} />
          </button>
        </div>

        {/* Modal content */}
        <div className="p-4 space-y-4">
          {/* Device selection with search */}
          <div className="space-y-1">
            <label className="text-xs text-[#a09080] tracking-wide">SELECT DEVICE</label>

            {/* Search input */}
            <div className="relative mb-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search devices..."
                className="w-full bg-[#1a1015] border border-[#3a2a30] rounded-sm pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#4287f5] text-[#f0e6c8] tracking-wide"
              />
              <Search size={14} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-[#a09080]" />
            </div>

            {/* Device list */}
            <div className="max-h-40 overflow-y-auto bg-[#1a1015] border border-[#3a2a30] rounded-sm">
              {filteredDevices.length > 0 ? (
                filteredDevices.map((device) => (
                  <div
                    key={device.id}
                    className={`px-3 py-2 border-b border-[#3a2a30] last:border-b-0 cursor-pointer ${
                      selectedDevice === device.id ? "bg-[#3a2a30]" : "hover:bg-[#2a1a20]"
                    }`}
                    onClick={() => setSelectedDevice(device.id)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#f0e6c8] tracking-wide">{device.name}</span>
                      <span className="text-xs text-[#a09080]">{device.type}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-[#a09080] text-sm">No devices match your search</div>
              )}
            </div>

            {/* Search results count */}
            <div className="text-[10px] text-[#a09080] mt-1">
              {filteredDevices.length} {filteredDevices.length === 1 ? "device" : "devices"} found
            </div>
          </div>

          {/* MIDI port selection */}
          <div className="space-y-1">
            <label className="text-xs text-[#a09080] tracking-wide">SELECT MIDI PORT</label>
            <div className="max-h-32 overflow-y-auto bg-[#1a1015] border border-[#3a2a30] rounded-sm">
              {availablePorts.map((port) => (
                <div
                  key={port.id}
                  className={`px-3 py-2 border-b border-[#3a2a30] last:border-b-0 cursor-pointer ${
                    selectedPort === port.id ? "bg-[#3a2a30]" : "hover:bg-[#2a1a20]"
                  }`}
                  onClick={() => setSelectedPort(port.id)}
                >
                  <span className="text-sm text-[#f0e6c8] tracking-wide">{port.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end space-x-2 pt-2">
            <button
              className={`channel-button ${selectedDevice && selectedPort ? "active" : ""} flex items-center px-3 py-1.5`}
              onClick={handleAdd}
              disabled={!selectedDevice || !selectedPort}
            >
              <Plus size={14} className="mr-1.5" />
              <span className="text-xs tracking-wide">ADD DEVICE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
