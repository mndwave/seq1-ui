"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createWebSocket } from "@/lib/api-client"

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
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<any | null>(null)

  // Initialize the WebSocket connection
  useEffect(() => {
    // Handler for WebSocket messages
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        setLastMessage(data)
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
        setLastMessage(event.data)
      }
    }

    // Create the WebSocket connection
    const ws = createWebSocket(handleMessage)

    // Set up event handlers
    ws.onopen = () => {
      console.log("WebSocket connected")
      setIsConnected(true)
    }

    ws.onclose = () => {
      console.log("WebSocket disconnected")
      setIsConnected(false)
    }

    // Store the WebSocket instance
    setSocket(ws)

    // Clean up on unmount
    return () => {
      ws.close()
    }
  }, [])

  // Function to send a message through the WebSocket
  const sendMessage = (message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(typeof message === "string" ? message : JSON.stringify(message))
    } else {
      console.error("WebSocket is not connected")
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
