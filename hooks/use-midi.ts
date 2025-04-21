"use client"

import { useState, useEffect } from "react"
import { midiService, type MIDIConnectionState } from "@/lib/midi-service"

/**
 * React hook for using WebMIDI in components
 */
export function useMIDI() {
  const [midiState, setMidiState] = useState<MIDIConnectionState>(midiService.getState())

  useEffect(() => {
    // Subscribe to MIDI state changes
    const unsubscribe = midiService.subscribe(setMidiState)
    return unsubscribe
  }, [])

  /**
   * Request MIDI access from the browser
   */
  const requestAccess = async (sysex = false) => {
    return await midiService.requestMIDIAccess(sysex)
  }

  /**
   * Send a MIDI message to a specific output
   */
  const sendMessage = (outputId: string, message: number[]) => {
    return midiService.sendMIDIMessage(outputId, message)
  }

  return {
    ...midiState,
    requestAccess,
    sendMessage,
    isReady: midiState.permissionState === "granted" && midiState.devices !== null && !midiState.isInitializing,
  }
}
