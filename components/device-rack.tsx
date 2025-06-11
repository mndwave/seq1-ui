"use client"

import { Plus } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import AddDeviceModal from "./add-device-modal"
import ConfigDeviceModal from "./config-device-modal"
import DeviceCard from "./device-card"
import DeviceInitializing from "./device-initializing"
import DeviceInitializingMIDI from "./device-initializing-midi"
import EmptyDeviceState from "./empty-device-state"
import MIDIPermissionRequest from "@/components/midi-permission-request"
import { useMIDI } from "@/hooks/use-midi"
import type { Device } from "@/lib/types"

interface DeviceRackProps {
  devices: Device[]
  useSingleIndicator?: boolean
  onHardwareConnectionChange?: (isConnected: boolean) => void
  selectedDeviceId?: string | null
  onDeviceSelect?: (deviceId: string) => void
}

/**
 * DeviceRack component
 *
 * Displays a list of connected hardware devices in the left sidebar.
 * Shows an empty state with instructions when no devices are connected.
 * Provides functionality to add, configure, and remove devices.
 *
 * @param {Device[]} devices - Array of device objects to display
 * @param {boolean} useSingleIndicator - Whether to use a combined MIDI activity indicator
 */
export default function DeviceRack({
  devices: initialDevices,
  useSingleIndicator = false,
  onHardwareConnectionChange,
  selectedDeviceId,
  onDeviceSelect,
}: DeviceRackProps) {
  // Get MIDI state
  const { supported, permissionState, devices: midiDevices, isReady, isInitializing } = useMIDI()

  // Clone devices to allow for state updates
  const [devices, setDevices] = useState(() =>
    initialDevices.map((device) => ({
      ...device,
      midiActivity: { in: false, out: false },
    })),
  )
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [configModalOpen, setConfigModalOpen] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // State for initializing devices
  const [initializingDevices, setInitializingDevices] = useState<{ id: string; name: string; isNew: boolean }[]>([])

  // Simulate MIDI activity for demo purposes
  useEffect(() => {
    // Only simulate activity if we have MIDI permission
    if (permissionState !== "granted") return

    const interval = setInterval(() => {
      setDevices((currentDevices) =>
        currentDevices.map((device) => {
          if (!device.isConnected)
            return {
              ...device,
              midiActivity: { in: false, out: false },
            }

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
  }, [permissionState])

  const handleAddDevice = (newDevice: Device) => {
    // Add to initializing devices first
    const initializingId = `initializing-${Date.now()}`
    setInitializingDevices((prev) => [
      ...prev,
      {
        id: initializingId,
        name: newDevice.name,
        isNew: true,
      },
    ])

    // Close the modal
    setAddModalOpen(false)

    // After initialization completes, add to actual devices
    setTimeout(() => {
      setInitializingDevices((prev) => prev.filter((d) => d.id !== initializingId))
      setDevices((prev) => [...prev, { ...newDevice, isManuallyAdded: true }])
    }, 5000) // Simulate a 5 second initialization process
  }

  const handleConfigDevice = (device: Device) => {
    // Only allow configuring manually added devices
    if (device.isManuallyAdded) {
      setSelectedDevice(device)
      setConfigModalOpen(true)
    }
  }

  const handleUpdateDevice = (updatedDevice: Device) => {
    setDevices(devices.map((d) => (d.id === updatedDevice.id ? updatedDevice : d)))
    setConfigModalOpen(false)
    setSelectedDevice(null)
  }

  const handleDeleteDevice = (deviceId: string) => {
    setDevices(devices.filter((d) => d.id !== deviceId))
    setConfigModalOpen(false)
    setSelectedDevice(null)
  }

  const handleDeviceInitialized = (id: string) => {
    setInitializingDevices((prev) => prev.filter((d) => d.id !== id))
  }

  // Add effect to update hardware connection state when devices change
  useEffect(() => {
    // Consider hardware connected if we have permission and at least one connected device
    const hasConnectedDevices = devices.some((device) => device.isConnected)
    const isConnected = permissionState === "granted" && hasConnectedDevices

    if (onHardwareConnectionChange) {
      onHardwareConnectionChange(isConnected)
    }
  }, [devices, permissionState, onHardwareConnectionChange])

  // Determine if we should show the info box
  const showInfoBox = true

  return (
    <div
      ref={containerRef}
      className="w-1/3 border-r border-[#3a2a30] bg-[#2a1a20] overflow-y-auto relative flex flex-col"
    >
      <div className="p-4 border-b border-[#3a2a30] relative overflow-hidden flex justify-between items-center">
        <div className="absolute inset-0 diagonal-stripes opacity-20"></div>
        <h2 className="text-sm font-medium text-[#f0e6c8] uppercase tracking-wider relative z-20">DEVICE RACK</h2>
        {permissionState === "granted" && (
          <button
            onClick={() => setAddModalOpen(true)}
            className="relative z-20 vintage-button px-2 py-1 flex items-center rounded-sm transition-all duration-200"
          >
            <Plus size={14} className="mr-1" />
            <span className="text-xs tracking-wide">ADD</span>
          </button>
        )}
      </div>

      {/* Main content area with flex-1 to take available space */}
      <div className="flex-1 overflow-y-auto">
        {/* Show different content based on MIDI state */}
        {!supported || permissionState !== "granted" ? (
          <MIDIPermissionRequest />
        ) : isInitializing ? (
          <DeviceInitializingMIDI />
        ) : devices.length > 0 || initializingDevices.length > 0 ? (
          <div className="divide-y divide-[#3a2a30] relative z-10">
            {/* Initializing devices */}
            {initializingDevices.map((device, index) => (
              <div
                key={device.id}
                className="transition-all duration-500 animate-slideIn relative z-10"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <DeviceInitializing
                  deviceName={device.name}
                  isNew={device.isNew}
                  onInitialized={() => handleDeviceInitialized(device.id)}
                />
              </div>
            ))}

            {/* Connected devices */}
            {devices.map((device, index) => (
              <div
                key={device.id}
                className={`transition-all duration-300 animate-slideIn relative z-10`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <DeviceCard
                  device={device}
                  useSingleIndicator={useSingleIndicator}
                  onConfigClick={() => handleConfigDevice(device)}
                  isSelected={selectedDeviceId === device.id}
                  onSelect={() => onDeviceSelect && onDeviceSelect(device.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyDeviceState onAddDevice={() => setAddModalOpen(true)} />
        )}
      </div>

      {/* Info box at the bottom */}
      {/* <SEQ1InfoBox /> */}

      {/* Modals */}
      <AddDeviceModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} onAdd={handleAddDevice} />

      <ConfigDeviceModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
        device={selectedDevice}
        onUpdate={handleUpdateDevice}
        onDelete={handleDeleteDevice}
      />
    </div>
  )
}
