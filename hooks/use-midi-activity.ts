"use client"

import { useState, useEffect, useRef } from "react"
import { useWebSocket } from "@/lib/websocket-context"

interface MIDIActivityData {
  deviceId: string
  direction: "in" | "out"
  timestamp: number
}

interface DeviceMIDIActivity {
  [deviceId: string]: {
    in: boolean
    out: boolean
    lastActivity: number
  }
}

/**
 * Hook for monitoring real MIDI activity from backend
 */
export function useMIDIActivity() {
  const [midiActivity, setMidiActivity] = useState<DeviceMIDIActivity>({})
  const { isConnected, lastMessage } = useWebSocket()
  const activityTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Listen for MIDI activity messages from WebSocket
  useEffect(() => {
    if (!lastMessage || !isConnected) return

    // Check if this is a MIDI activity message
    if (lastMessage.event === "midi_activity" && lastMessage.data) {
      const { deviceId, direction, timestamp } = lastMessage.data

      // Clear any existing timeout for this device/direction
      const timeoutKey = `${deviceId}-${direction}`
      const existingTimeout = activityTimeouts.current.get(timeoutKey)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      // Update activity state
      setMidiActivity(prev => ({
        ...prev,
        [deviceId]: {
          ...prev[deviceId],
          [direction]: true,
          lastActivity: timestamp,
        }
      }))

      // Set timeout to clear activity indicator after 150ms (conventional MIDI indicator behavior)
      const timeout = setTimeout(() => {
        setMidiActivity(prev => ({
          ...prev,
          [deviceId]: {
            ...prev[deviceId],
            [direction]: false,
          }
        }))
        activityTimeouts.current.delete(timeoutKey)
      }, 150)

      activityTimeouts.current.set(timeoutKey, timeout)
    }
  }, [lastMessage, isConnected])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      activityTimeouts.current.forEach(timeout => clearTimeout(timeout))
      activityTimeouts.current.clear()
    }
  }, [])

  const getDeviceActivity = (deviceId: string) => {
    return midiActivity[deviceId] || { in: false, out: false, lastActivity: 0 }
  }

  return {
    midiActivity,
    getDeviceActivity,
    isMonitoring: isConnected,
  }
} 