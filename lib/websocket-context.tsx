"use client"

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react"
import { useEnv } from "@/lib/env-provider"

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
  const env = useEnv()

  // Set up WebSocket connection
  useEffect(() => {
    // Don't try to connect until environment variables are loaded
    if (!env.isLoaded) return

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
      // Use the WebSocket proxy instead of connecting directly
      const wsProxyUrl = window.location.protocol.replace("http", "ws") + "//" + window.location.host + "/api/ws-proxy"
      console.log("Creating WebSocket connection to proxy:", wsProxyUrl)

      wsRef.current = new WebSocket(wsProxyUrl)

      // Update connection status
      wsRef.current.onopen = () => {
        setConnected(true)
        console.log("WebSocket connected")
      }

      wsRef.current.onmessage = handleMessage

      wsRef.current.onclose = () => {
        setConnected(false)
        console.log("WebSocket disconnected")
      }

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error)
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
  }, [env.isLoaded])

  // Listen for auth changes
  useEffect(() => {
    const handleAuthError = () => {
      // Close the WebSocket connection if it exists
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      setConnected(false)
    }

    window.addEventListener("seq1:auth:error", handleAuthError)

    return () => {
      window.removeEventListener("seq1:auth:error", handleAuthError)
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
