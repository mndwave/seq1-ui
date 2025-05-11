"use client"

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react"
import { createWebSocket, isAuthenticated } from "@/lib/api-client"

interface WebSocketContextType {
  lastMessage: any | null
  connected: boolean
  sendMessage: (message: any) => void
}

// Create the context with default values
const WebSocketContext = createContext<WebSocketContextType>({
  lastMessage: null,
  connected: false,
  sendMessage: () => {},
})

// Provider component
export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [lastMessage, setLastMessage] = useState<any | null>(null)
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)

  // Set up WebSocket connection
  useEffect(() => {
    // Only connect if the user is authenticated
    if (!isAuthenticated()) {
      return
    }

    // Handle incoming messages
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        setLastMessage(data)
      } catch (error) {
        console.error("Error parsing WebSocket message:", error)
      }
    }

    // Create WebSocket connection
    try {
      wsRef.current = createWebSocket(handleMessage)

      // Update connection status
      wsRef.current.onopen = () => {
        setConnected(true)
      }

      wsRef.current.onclose = () => {
        setConnected(false)
      }
    } catch (error) {
      console.error("Error creating WebSocket connection:", error)
    }

    // Clean up on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  // Listen for auth changes
  useEffect(() => {
    const handleAuthExpired = () => {
      // Close the WebSocket connection if it exists
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      setConnected(false)
    }

    window.addEventListener("seq1:auth:expired", handleAuthExpired)

    return () => {
      window.removeEventListener("seq1:auth:expired", handleAuthExpired)
    }
  }, [])

  // Send a message through the WebSocket
  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    } else {
      console.error("WebSocket not connected")
    }
  }

  return (
    <WebSocketContext.Provider
      value={{
        lastMessage,
        connected,
        sendMessage,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  )
}

// Custom hook for using WebSocket context
export function useWebSocket() {
  return useContext(WebSocketContext)
}
