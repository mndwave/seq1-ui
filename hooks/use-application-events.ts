"use client"

// hooks/use-application-events.ts
import { useState, useEffect, useCallback } from "react"
import { wsClient } from "@/lib/websocket-manager" // Corrected import
import { stateManager, type AppState } from "@/lib/state-manager" // Corrected import
import {
  TransportAPI,
  DeviceAPI,
  ChatAPI,
  // ProjectAPI is not used in these specific hooks from doc 04, but could be added later
} from "@/lib/api-services" // Corrected import
import type { ChatMessageState } from "@/lib/state-manager" // Assuming ChatMessageState is exported

// Define a type for the payload of the 'status' event from wsClient
interface WebSocketStatusPayload {
  status: "disconnected" | "connected" | "connecting" | "error"
  reason?: string
  code?: number
  wasClean?: boolean
  attempt?: number
  event?: Event // For 'error' status
}

// Main WebSocket events hook
export function useWebSocketEvents() {
  const [connectionStatus, setConnectionStatus] = useState<WebSocketStatusPayload["status"]>(wsClient.getStatus())
  // Initialize state from stateManager, ensuring it's the correct type
  const [appState, setAppState] = useState<AppState>(stateManager.getState())

  useEffect(() => {
    // Attempt to connect WebSocket if not already connected or connecting
    // This should ideally be triggered by auth state (e.g., user logs in)
    // For now, connecting on mount as per document's implication
    if (wsClient.getStatus() === "disconnected") {
      wsClient.connect()
    }

    // Subscribe to connection status
    const unsubscribeStatus = wsClient.subscribe("status", (data) => {
      const payload = data as WebSocketStatusPayload // Type assertion
      setConnectionStatus(payload.status)
    })

    // Subscribe to transport events
    // Assuming 'transport' events from WebSocket contain partial TransportState
    const unsubscribeTransport = wsClient.subscribe("transport", (data) => {
      stateManager.setState("transport", data as Partial<AppState["transport"]>)
    })

    // Subscribe to device events
    // Assuming 'devices' event payload is { devices: DeviceState[] }
    const unsubscribeDevices = wsClient.subscribe("devices", (data) => {
      const payload = data as { devices?: AppState["devices"] } // Type assertion
      stateManager.setState("devices", payload.devices || [])
    })

    // Subscribe to chat events
    // Assuming 'chat' event payload is a single new ChatMessageState
    const unsubscribeChat = wsClient.subscribe("chat_message", (data) => {
      // Assuming event name is 'chat_message' for a single new message
      const newMessage = data as ChatMessageState
      const currentState = stateManager.getState()
      // Avoid adding duplicates if message already exists (e.g. from optimistic update)
      if (!currentState.chat.messages.find((m) => m.id === newMessage.id && m.timestamp === newMessage.timestamp)) {
        stateManager.setState("chat", {
          messages: [...currentState.chat.messages, newMessage],
          isLoading: false, // Reset isLoading if this message confirms a sent one
        })
      }
    })

    // Subscribe to all state changes from stateManager
    const unsubscribeState = stateManager.subscribe(setAppState)

    // Cleanup
    return () => {
      unsubscribeStatus()
      unsubscribeTransport()
      unsubscribeDevices()
      unsubscribeChat()
      unsubscribeState()
      // Consider if wsClient.disconnect() should always be called on unmount.
      // If this hook is used in a top-level component, it might disconnect prematurely.
      // Document implies disconnect on unmount of this hook's usage.
      // wsClient.disconnect(); // Potentially move disconnect to app-level logic (e.g. on logout)
    }
  }, [])

  return {
    connectionStatus,
    state: appState, // Use the state from stateManager via local React state
    wsClient, // Expose wsClient if direct sending is needed from components
  }
}

// Transport control hooks
export function useTransport() {
  const { state: appState } = useWebSocketEvents() // Get the full app state

  const play = useCallback(async () => {
    try {
      await TransportAPI.play()
      // Optimistic update or rely on WebSocket event
      // stateManager.setState('transport', { isPlaying: true });
    } catch (error) {
      console.error("Failed to play:", error)
      // Potentially show error to user
    }
  }, [])

  const stop = useCallback(async () => {
    try {
      await TransportAPI.stop()
      // Optimistic update or rely on WebSocket event
      // stateManager.setState('transport', { isPlaying: false });
    } catch (error) {
      console.error("Failed to stop:", error)
    }
  }, [])

  const setBPM = useCallback(async (bpm: number) => {
    try {
      await TransportAPI.setBPM(bpm)
      // Optimistic update or rely on WebSocket event
      // stateManager.setState('transport', { bpm });
    } catch (error) {
      console.error("Failed to set BPM:", error)
    }
  }, [])

  const setTimeSignature = useCallback(async (numerator: number, denominator: number) => {
    try {
      await TransportAPI.setTimeSignature(numerator, denominator)
      // Optimistic update or rely on WebSocket event
      // stateManager.setState('transport', { timeSignature: `${numerator}/${denominator}` });
    } catch (error) {
      console.error("Failed to set time signature:", error)
    }
  }, [])

  const setPlayheadPosition = useCallback(async (position: number) => {
    try {
      await TransportAPI.setPlayheadPosition(position)
    } catch (error) {
      console.error("Failed to set playhead position:", error)
    }
  }, [])

  return {
    ...appState.transport,
    play,
    stop,
    setBPM,
    setTimeSignature,
    setPlayheadPosition,
  }
}

// Device management hooks
export function useDevices() {
  const { state: appState } = useWebSocketEvents()

  const connectDevice = useCallback(async (deviceId: string) => {
    try {
      await DeviceAPI.connectDevice(deviceId)
    } catch (error) {
      console.error("Failed to connect device:", deviceId, error)
    }
  }, [])

  const disconnectDevice = useCallback(async (deviceId: string) => {
    try {
      await DeviceAPI.disconnectDevice(deviceId)
    } catch (error) {
      console.error("Failed to disconnect device:", deviceId, error)
    }
  }, [])

  const scanDevices = useCallback(async () => {
    try {
      await DeviceAPI.scanDevices()
    } catch (error) {
      console.error("Failed to scan devices:", error)
    }
  }, [])

  const sendMIDI = useCallback(async (deviceId: string, message: any) => {
    try {
      await DeviceAPI.sendMIDI(deviceId, message)
    } catch (error) {
      console.error("Failed to send MIDI to device:", deviceId, error)
    }
  }, [])

  return {
    devices: appState.devices,
    connectDevice,
    disconnectDevice,
    scanDevices,
    sendMIDI,
  }
}

// Chat hooks
interface TempChatMessage extends ChatMessageState {
  isTemp?: boolean
}

export function useChat() {
  const { state: appState } = useWebSocketEvents()

  const sendMessage = useCallback(async (content: string) => {
    const tempId = `temp_${Date.now()}` // More robust temp ID
    const tempMessage: TempChatMessage = {
      id: tempId,
      content,
      sender: "user", // Assuming 'sender' instead of 'role' as per ChatMessageState
      timestamp: new Date().toISOString(),
      isTemp: true,
    }

    try {
      // Optimistic update
      const currentState = stateManager.getState()
      stateManager.setState("chat", {
        messages: [...currentState.chat.messages, tempMessage],
        isLoading: true,
      })

      const actualMessage = await ChatAPI.sendMessage(content)

      // Replace temp message with actual message from server
      const finalState = stateManager.getState()
      stateManager.setState("chat", {
        messages: finalState.chat.messages.map((m) => (m.id === tempId ? actualMessage : m)),
        isLoading: false,
      })
    } catch (error) {
      console.error("Failed to send message:", error)
      // Remove temp message on error
      const currentState = stateManager.getState()
      stateManager.setState("chat", {
        messages: currentState.chat.messages.filter((m) => m.id !== tempId),
        isLoading: false,
      })
    }
  }, [])

  const clearHistory = useCallback(async () => {
    try {
      await ChatAPI.clearHistory()
      stateManager.setState("chat", {
        messages: [],
        isLoading: false,
      })
    } catch (error) {
      console.error("Failed to clear chat history:", error)
    }
  }, [])

  const loadHistory = useCallback(async (limit = 50) => {
    try {
      stateManager.setState("chat", { isLoading: true })
      const messages = await ChatAPI.getChatHistory(limit)
      stateManager.setState("chat", { messages, isLoading: false })
    } catch (error) {
      console.error("Failed to load chat history:", error)
      stateManager.setState("chat", { isLoading: false }) // Ensure loading is reset
    }
  }, [])

  return {
    messages: appState.chat.messages as TempChatMessage[], // Cast for isTemp property
    isLoading: appState.chat.isLoading,
    sendMessage,
    clearHistory,
    loadHistory,
  }
}
