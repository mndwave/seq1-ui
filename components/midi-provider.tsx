"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { midiService, type MIDIConnectionState } from "@/lib/midi-service"

// Create context
const MIDIContext = createContext<
  MIDIConnectionState & {
    requestAccess: (sysex?: boolean) => Promise<boolean>
    sendMessage: (outputId: string, message: number[]) => boolean
  }
>({
  supported: false,
  permissionState: "unsupported",
  devices: null,
  outputs: null,
  error: null,
  requestAccess: async () => false,
  sendMessage: () => false,
})

export function MIDIProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MIDIConnectionState>(midiService.getState())

  useEffect(() => {
    return midiService.subscribe(setState)
  }, [])

  const requestAccess = async (sysex = false) => {
    return await midiService.requestMIDIAccess(sysex)
  }

  const sendMessage = (outputId: string, message: number[]) => {
    return midiService.sendMIDIMessage(outputId, message)
  }

  return <MIDIContext.Provider value={{ ...state, requestAccess, sendMessage }}>{children}</MIDIContext.Provider>
}

// Export the context hook
export const useMIDIContext = () => useContext(MIDIContext)
