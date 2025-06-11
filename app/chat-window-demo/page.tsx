"use client"

import { useState, useEffect, useRef } from "react"
import { createLegacyWebSocket } from "@/lib/api-client"

const ChatWindowDemo = () => {
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState<string>("")
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      setMessages((prevMessages) => [...prevMessages, `Received: ${event.data}`])
    }

    ws.current = createLegacyWebSocket(handleMessage)

    if (ws.current) {
      ws.current.onopen = () => {
        setMessages((prevMessages) => [...prevMessages, "Connected to WebSocket"])
      }

      ws.current.onclose = () => {
        setMessages((prevMessages) => [...prevMessages, "Disconnected from WebSocket"])
      }

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error)
        setMessages((prevMessages) => [...prevMessages, `WebSocket error: ${error}`])
      }
    } else {
      console.warn("Failed to create WebSocket for chat demo.")
    }

    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [])

  const sendMessage = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(input)
      setMessages((prevMessages) => [...prevMessages, `Sent: ${input}`])
      setInput("")
    } else {
      setMessages((prevMessages) => [...prevMessages, "Not connected to WebSocket"])
    }
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1 style={{ marginBottom: "20px" }}>Chat Window Demo</h1>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          marginBottom: "20px",
          height: "300px",
          overflowY: "scroll",
        }}
      >
        {messages.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
      <div style={{ display: "flex" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, padding: "8px", marginRight: "10px" }}
        />
        <button
          onClick={sendMessage}
          style={{ padding: "8px 12px", backgroundColor: "#4CAF50", color: "white", border: "none", cursor: "pointer" }}
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatWindowDemo
