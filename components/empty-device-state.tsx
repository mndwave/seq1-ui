"use client"

import { Plus, HardDrive, Cable } from "lucide-react"

/**
 * Props for the EmptyDeviceState component
 */
interface EmptyDeviceStateProps {
  /** Callback function when the Add Device button is clicked */
  onAddDevice: () => void
}

/**
 * EmptyDeviceState component
 *
 * Displays a helpful message and button when no devices are connected
 * Maintains the vintage hardware aesthetic while guiding users
 */
export default function EmptyDeviceState({ onAddDevice }: EmptyDeviceStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      {/* Background texture */}
      <div className="absolute inset-0 dot-pattern opacity-10"></div>

      {/* Content with relative positioning to appear above the background */}
      <div className="relative z-10 max-w-xs">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <HardDrive size={48} className="text-[#3a2a30]" />
            <Cable size={32} className="text-[#3a2a30] absolute -bottom-2 -right-2 transform rotate-45" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-[#f0e6c8] uppercase tracking-wider mb-3">No Devices Connected</h3>

        {/* Description */}
        <p className="text-xs text-[#a09080] mb-6">
          Connect hardware devices to SEQ1 to start creating music. Add your synthesizers, drum machines, and effects
          processors.
        </p>

        {/* Inset panel with instructions */}
        <div className="inset-panel p-4 mb-6">
          <div className="text-xs text-[#a09080] text-left space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-[#f0e6c8] mb-2">Quick Start:</p>
            <p>1. Click ADD DEVICE below</p>
            <p>2. Select your hardware from the list</p>
            <p>3. Choose the appropriate MIDI port</p>
          </div>
        </div>

        {/* Add device button */}
        <button
          onClick={onAddDevice}
          className="vintage-button-active px-4 py-2 flex items-center justify-center mx-auto transition-all duration-200 hover:brightness-110"
          aria-label="Add device"
        >
          <Plus size={14} className="mr-2" />
          <span className="text-xs tracking-wide">ADD DEVICE</span>
        </button>
      </div>
    </div>
  )
}
