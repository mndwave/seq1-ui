"use client"

import { useState } from "react"
import { useMIDI } from "@/hooks/use-midi"
import { CheckCircle2, XCircle, Info } from "lucide-react"

interface MIDIPermissionRequestProps {
  onPermissionGranted?: () => void
}

export default function MIDIPermissionRequest({ onPermissionGranted }: MIDIPermissionRequestProps) {
  const { supported, permissionState, requestAccess } = useMIDI()
  const [isRequesting, setIsRequesting] = useState(false)

  const handleRequestAccess = async () => {
    setIsRequesting(true)
    const success = await requestAccess()
    setIsRequesting(false)

    if (success && onPermissionGranted) {
      onPermissionGranted()
    }
  }

  if (!supported) {
    return (
      <div className="p-6 relative inset-panel">
        <div className="absolute inset-0 dot-pattern opacity-10"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <XCircle size={48} className="text-[#dc5050] mb-4" />
          <h3 className="text-sm font-medium text-[#f0e6c8] uppercase tracking-wider mb-2">WebMIDI Not Supported</h3>
          <p className="text-xs text-[#a09080] mb-4 max-w-md mx-auto">
            Your browser doesn't support WebMIDI, which is required to connect to hardware devices.
          </p>
          <p className="text-xs text-[#a09080] max-w-md mx-auto">
            Please use Chrome, Edge, or Opera to use SEQ1's MIDI features.
          </p>
        </div>
      </div>
    )
  }

  if (permissionState === "denied") {
    return (
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
            To enable this feature, click the lock/site settings icon in your browser's address bar, find "MIDI devices"
            and change it to "Allow".
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => window.location.reload()}
              className="relative px-5 py-2.5 overflow-hidden group bg-[#f0e6c8] rounded-sm text-[#2a1a20] hover:bg-[#fff] transition-all duration-300"
              style={{
                boxShadow: "0 2px 0 #3a2a30, inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 4px 8px rgba(0, 0, 0, 0.3)",
              }}
            >
              {/* Button texture overlay */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent opacity-50"></span>

              {/* Subtle noise texture */}
              <span className="absolute inset-0 w-full h-full dot-pattern opacity-10"></span>

              {/* Button text with shadow for depth */}
              <span
                className="relative flex items-center justify-center text-xs font-bold tracking-wide"
                style={{ textShadow: "0 1px 0 rgba(255, 255, 255, 0.4)" }}
              >
                REFRESH & CONNECT
              </span>

              {/* Button press effect */}
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#3a2a30] opacity-20 group-active:h-0 transition-all duration-150"></span>
              <span className="absolute inset-0 w-full h-full bg-[#2a1a20] opacity-0 group-active:opacity-5 group-active:translate-y-px transition-all duration-150"></span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (permissionState === "prompt" || permissionState === "unsupported") {
    return (
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
            To enable this feature, click the lock/site settings icon in your browser's address bar, find "MIDI devices"
            and change it to "Allow".
          </p>
          <div className="flex justify-center">
            <button
              onClick={handleRequestAccess}
              disabled={isRequesting}
              className="relative px-5 py-2.5 overflow-hidden group bg-[#f0e6c8] rounded-sm text-[#2a1a20] hover:bg-[#fff] transition-all duration-300"
              style={{
                boxShadow: "0 2px 0 #3a2a30, inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 4px 8px rgba(0, 0, 0, 0.3)",
              }}
            >
              {/* Button texture overlay */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent opacity-50"></span>

              {/* Subtle noise texture */}
              <span className="absolute inset-0 w-full h-full dot-pattern opacity-10"></span>

              {/* Button text with shadow for depth */}
              <span
                className="relative flex items-center justify-center text-xs font-bold tracking-wide"
                style={{ textShadow: "0 1px 0 rgba(255, 255, 255, 0.4)" }}
              >
                {isRequesting ? "REQUESTING ACCESS..." : "CONNECT DEVICES"}
              </span>

              {/* Button press effect */}
              <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#3a2a30] opacity-20 group-active:h-0 transition-all duration-150"></span>
              <span className="absolute inset-0 w-full h-full bg-[#2a1a20] opacity-0 group-active:opacity-5 group-active:translate-y-px transition-all duration-150"></span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Permission already granted
  return (
    <div className="p-6 relative inset-panel">
      <div className="absolute inset-0 dot-pattern opacity-10"></div>
      <div className="relative z-10 flex flex-col items-center text-center">
        <CheckCircle2 size={48} className="text-[#50dc64] mb-4" />
        <h3 className="text-sm font-medium text-[#f0e6c8] uppercase tracking-wider mb-2">MIDI Access Granted</h3>
        <p className="text-xs text-[#a09080] max-w-md mx-auto">
          SEQ1 has permission to access your MIDI devices. You can now connect and control your hardware.
        </p>
      </div>
    </div>
  )
}
