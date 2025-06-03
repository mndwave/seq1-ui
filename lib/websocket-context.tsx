"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { SEQ1WebSocket } from "@/lib/websocket-manager"

// Define the WebSocket context type
interface WebSocketContextType {
  isConnected: boolean
  lastMessage: any | null
  sendMessage: (message: any) => void
}

// Create the WebSocket context
const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  lastMessage: null,
  sendMessage: () => {},
})

// Provider component that manages the WebSocket connection
export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [wsClient] = useState(() => new SEQ1WebSocket())
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<any | null>(null)

  // Initialize the WebSocket connection
  useEffect(() => {
    // Set up event handlers for the WebSocket client
    const unsubscribeStatus = wsClient.subscribe("status", (data: any) => {
      setIsConnected(data.status === "connected")
    })

    // Subscribe to all messages
    const unsubscribeMessage = wsClient.subscribe("*", (data: any) => {
      setLastMessage(data)
    })

    // Connect the WebSocket
    wsClient.connect()

    // Clean up on unmount
    return () => {
      unsubscribeStatus()
      unsubscribeMessage()
      wsClient.disconnect()
    }
  }, [wsClient])

  // Function to send a message through the WebSocket
  const sendMessage = (message: any) => {
    // If message is already an object with type and payload, use it directly
    if (typeof message === 'object' && message.type) {
      wsClient.send(message.type, message.payload || {})
    } else {
      // For simple messages, wrap them with a generic type
      wsClient.send('message', message)
    }
  }

  return (
    <WebSocketContext.Provider value={{ isConnected, lastMessage, sendMessage }}>{children}</WebSocketContext.Provider>
  )
}

// Hook to use the WebSocket context
export function useWebSocket() {
  return useContext(WebSocketContext)
}
