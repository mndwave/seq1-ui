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
import { authManager } from "@/lib/auth-manager" // Import authManager

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
  const [appState, setAppState] = useState<AppState>(stateManager.getState())
  const [isAuthInitialized, setIsAuthInitialized] = useState(authManager.isInitialized())

  useEffect(() => {
    // Listener for authManager initialization
    const handleAuthInit = () => setIsAuthInitialized(true)
    authManager.on("init-complete", handleAuthInit)

    // Listener for authManager auth changes to potentially trigger ws connection/disconnection
    // This is now handled more directly within AuthManager itself.
    // However, we still need to know when it's appropriate to subscribe to wsClient events.
    // Subscriptions should ideally only happen when wsClient is expected to be active.

    return () => {
      authManager.off("init-complete", handleAuthInit)
    }
  }, [])

  useEffect(() => {
    // Only set up WebSocket subscriptions if authentication is initialized and a token might exist.
    // AuthManager now handles the actual connect/disconnect calls.
    // This hook subscribes to an already managed wsClient.

    if (!isAuthInitialized) {
      // If auth isn't initialized, wsClient might not be (and shouldn't be) connected.
      // Clear previous subscriptions if any, or wait.
      // For simplicity, we'll only subscribe when auth is ready.
      return
    }

    // Subscribe to connection status
    const unsubscribeStatus = wsClient.subscribe("status", (data) => {
      const payload = data as WebSocketStatusPayload // Type assertion
      setConnectionStatus(payload.status)
    })

    // Subscribe to transport events
    const unsubscribeTransport = wsClient.subscribe("transport", (data) => {
      stateManager.setState("transport", data as Partial<AppState["transport"]>)
    })

    // Subscribe to device events
    const unsubscribeDevices = wsClient.subscribe("devices", (data) => {
      const payload = data as { devices?: AppState["devices"] } // Type assertion
      stateManager.setState("devices", payload.devices || [])
    })

    // Subscribe to chat events
    const unsubscribeChat = wsClient.subscribe("chat_message", (data) => {
      const newMessage = data as ChatMessageState
      const currentState = stateManager.getState()
      if (!currentState.chat.messages.find((m) => m.id === newMessage.id && m.timestamp === newMessage.timestamp)) {
        stateManager.setState("chat", {
          messages: [...currentState.chat.messages, newMessage],
          isLoading: false,
        })
      }
    })

    // Subscribe to all state changes from stateManager
    const unsubscribeState = stateManager.subscribe(setAppState)

    // Cleanup subscriptions when the hook unmounts or dependencies change
    return () => {
      unsubscribeStatus()
      unsubscribeTransport()
      unsubscribeDevices()
      unsubscribeChat()
      unsubscribeState()
    }
  }, [isAuthInitialized]) // Re-run effect if auth initialization status changes

  return {
    connectionStatus,
    state: appState,
    wsClient, // Expose wsClient if direct sending is needed from components
  }
}

// Transport control hooks (no changes needed here for wsClient lifecycle)
export function useTransport() {
  const { state: appState } = useWebSocketEvents() // Get the full app state

  const play = useCallback(async () => {
    try {
      await TransportAPI.play()
    } catch (error) {
      console.error("Failed to play:", error)
    }
  }, [])

  const stop = useCallback(async () => {
    try {
      await TransportAPI.stop()
    } catch (error) {
      console.error("Failed to stop:", error)
    }
  }, [])

  const setBPM = useCallback(async (bpm: number) => {
    try {
      await TransportAPI.setBPM(bpm)
    } catch (error) {
      console.error("Failed to set BPM:", error)
    }
  }, [])

  const setTimeSignature = useCallback(async (numerator: number, denominator: number) => {
    try {
      await TransportAPI.setTimeSignature(numerator, denominator)
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

// Device management hooks (no changes needed here)
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

// Chat hooks (no changes needed here)
interface TempChatMessage extends ChatMessageState {
  isTemp?: boolean
}

export function useChat() {
  const { state: appState } = useWebSocketEvents()

  const sendMessage = useCallback(async (content: string) => {
    const tempId = `temp_${Date.now()}`
    const tempMessage: TempChatMessage = {
      id: tempId,
      content,
      sender: "user",
      timestamp: new Date().toISOString(),
      isTemp: true,
    }

    try {
      const currentState = stateManager.getState()
      stateManager.setState("chat", {
        messages: [...currentState.chat.messages, tempMessage],
        isLoading: true,
      })

      const actualMessage = await ChatAPI.sendMessage(content)

      const finalState = stateManager.getState()
      stateManager.setState("chat", {
        messages: finalState.chat.messages.map((m) => (m.id === tempId ? actualMessage : m)),
        isLoading: false,
      })
    } catch (error) {
      console.error("Failed to send message:", error)
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
      stateManager.setState("chat", { isLoading: false })
    }
  }, [])

  return {
    messages: appState.chat.messages as TempChatMessage[],
    isLoading: appState.chat.isLoading,
    sendMessage,
    clearHistory,
    loadHistory,
  }
}
