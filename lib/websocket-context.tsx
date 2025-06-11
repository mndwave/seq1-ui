"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { wsClient } from "@/lib/websocket-manager" // Use the main wsClient
import type { MessagePayload } from "@/lib/websocket-manager" // Import type if needed

// Standard WebSocket close event codes
const NORMAL_CLOSURE_CODE = 1000

interface WebSocketContextValue {
  sendMessage: (type: string, payload: MessagePayload) => void // Updated signature
  lastMessage: { type: string; payload: MessagePayload } | null // To store typed messages
  isConnected: boolean
  connectionStatus: "disconnected" | "connecting" | "connected" | "error"
  connectionErrorDetails: { code?: number; reason?: string; message?: string } | null
  attemptReconnect: () => void
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined)

interface WebSocketProviderProps {
  children: React.ReactNode
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState<WebSocketContextValue["connectionStatus"]>(
    wsClient.getStatus(),
  )
  const [lastMessage, setLastMessage] = useState<{ type: string; payload: MessagePayload } | null>(null)
  const [connectionErrorDetails, setConnectionErrorDetails] =
    useState<WebSocketContextValue["connectionErrorDetails"]>(null)

  useEffect(() => {
    // Subscribe to wsClient status changes
    const unsubscribeStatus = wsClient.subscribe("status", (data: any) => {
      setConnectionStatus(data.status)
      if (data.status === "error" || (data.status === "disconnected" && data.reason)) {
        setConnectionErrorDetails({
          code: data.code,
          reason: data.reason,
          message: `WebSocket ${data.status}: ${data.reason || "An error occurred"} (Code: ${data.code || "N/A"})`,
        })
      } else if (data.status === "connected") {
        setConnectionErrorDetails(null)
      }
    })

    // Subscribe to all messages (or specific types if needed)
    // For simplicity, this example subscribes to a generic 'message' event
    // if wsClient were to emit one, or you'd subscribe to specific types.
    // Let's assume wsClient emits individual types, and we want to catch all for `lastMessage`.
    // This is a simplified approach; a real app might want more granular `lastMessage` logic.

    // A more robust way: subscribe to specific types you care about for `lastMessage`
    // For this example, let's make a generic handler that updates `lastMessage`
    // This requires wsClient to emit an event like 'any_message' or similar,
    // or for this provider to iterate over known types.
    // For now, we'll just show status. A full `lastMessage` for *any* type
    // would require modifying wsClient or subscribing to many types here.

    // Example: if you want to show the last 'transport' message
    const unsubscribeTransport = wsClient.subscribe("transport", (payload) => {
      setLastMessage({ type: "transport", payload })
    })
    // Add more subscriptions if needed for other types to update `lastMessage`

    return () => {
      unsubscribeStatus()
      unsubscribeTransport() // And others
    }
  }, [])

  const sendMessage = useCallback((type: string, payload: MessagePayload) => {
    if (wsClient.getStatus() === "connected") {
      wsClient.send(type, payload)
    } else {
      console.warn("WebSocketProvider: WebSocket is not connected. Message not sent:", { type, payload })
    }
  }, [])

  const attemptReconnect = useCallback(() => {
    // AuthManager is responsible for connect/disconnect.
    // A manual reconnect here might conflict if not coordinated.
    // If wsClient is disconnected due to auth, AuthManager should handle re-auth then connect.
    // If it's a transient network issue, wsClient's auto-reconnect will handle it.
    // This button might be more about re-triggering the auth flow if connection is persistently down.
    console.log(
      "WebSocketProvider: Manual reconnect attempt. wsClient's auto-reconnect or AuthManager should handle actual connection.",
    )
    // Forcing a status check or re-evaluation in AuthManager might be an option.
    // For now, this button might be less effective if wsClient is already retrying or needs re-auth.
    // A simple approach: if disconnected, try to trigger wsClient's connect,
    // which will check for token and connect if available.
    if (wsClient.getStatus() === "disconnected") {
      wsClient.connect() // This will check for token and connect if available.
    }
  }, [])

  return (
    <WebSocketContext.Provider
      value={{
        sendMessage,
        lastMessage,
        isConnected: connectionStatus === "connected",
        connectionStatus,
        connectionErrorDetails,
        attemptReconnect,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}

export const useWebSocket = (): WebSocketContextValue => {
  const context = useContext(WebSocketContext)
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider")
  }
  return context
}
