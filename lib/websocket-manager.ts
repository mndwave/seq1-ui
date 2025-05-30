// lib/websocket-manager.ts
const DEBUG = process.env.NODE_ENV === "development"

function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log("[SEQ1WebSocket]", ...args)
  }
}

type WebSocketStatus = "disconnected" | "connected" | "connecting" | "error"
type MessagePayload = Record<string, any> | string | number | boolean
type MessageHandler = (payload: MessagePayload) => void

export class SEQ1WebSocket {
  private ws: WebSocket | null
  private status: WebSocketStatus
  private listeners: Map<string, Set<MessageHandler>>
  private reconnectAttempts: number
  private maxReconnectAttempts: number
  private reconnectInterval: number
  private explicitDisconnect: boolean

  constructor() {
    this.ws = null
    this.status = "disconnected"
    this.listeners = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 3000 // 3 seconds
    this.explicitDisconnect = false
  }

  connect(): void {
    if (typeof window === "undefined") {
      debugLog("WebSocket connection attempt skipped in non-browser environment.")
      return
    }
    if (this.status === "connected" || this.status === "connecting") {
      debugLog("WebSocket already connected or connecting.")
      return
    }

    const token = localStorage.getItem("seq1_jwt_token")
    if (!token) {
      console.error("No JWT token available for WebSocket connection. Connection aborted.")
      this.status = "error" // Or 'disconnected' and don't attempt to connect
      this.emit("status", { status: this.status, reason: "No JWT token" })
      return
    }

    // As per document: wss://api.seq1.net/ws/session?token=${token}
    // This is a direct connection, not via the /api/ws-proxy
    // Ensure your backend at api.seq1.net supports this and handles CORS if necessary.
    const wsUrl = `wss://api.seq1.net/ws/session?token=${token}`
    debugLog(`Attempting to connect to WebSocket: ${wsUrl}`)
    this.status = "connecting"
    this.emit("status", { status: this.status })
    this.explicitDisconnect = false

    try {
      this.ws = new WebSocket(wsUrl)
    } catch (error) {
      console.error("Failed to create WebSocket instance:", error)
      this.status = "error"
      this.emit("status", { status: this.status, reason: "Failed to create WebSocket instance", error })
      this.attemptReconnect()
      return
    }

    this.ws.onopen = () => {
      debugLog("WebSocket connected successfully.")
      this.status = "connected"
      this.reconnectAttempts = 0
      this.emit("status", { status: "connected" })
    }

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data as string)
        debugLog("WebSocket message received:", message)
        this.handleMessage(message)
      } catch (error) {
        console.error("Failed to parse WebSocket message or handle it:", error)
        // Optionally emit an error event for this specific issue
        this.emit("message_error", { reason: "Failed to parse message", data: event.data, error })
      }
    }

    this.ws.onclose = (event: CloseEvent) => {
      debugLog(`WebSocket disconnected. Code: ${event.code}, Reason: ${event.reason}, WasClean: ${event.wasClean}`)
      this.status = "disconnected"
      this.emit("status", { status: "disconnected", code: event.code, reason: event.reason, wasClean: event.wasClean })
      if (!this.explicitDisconnect) {
        this.attemptReconnect()
      }
    }

    this.ws.onerror = (event: Event) => {
      // WebSocket 'error' events are usually followed by 'close'.
      // The 'error' event itself doesn't provide much detail, just that an error occurred.
      console.error("WebSocket error occurred.", event)
      this.status = "error" // Or 'connecting' if an immediate reconnect is attempted
      this.emit("status", { status: "error", event })
      // Reconnection is typically handled by onclose
    }
  }

  private handleMessage(message: { type: string; payload: MessagePayload }): void {
    const { type, payload } = message
    if (type) {
      this.emit(type, payload)
    } else {
      debugLog("Received message without type:", message)
      this.emit("untyped_message", message) // Emit as a generic message if no type
    }
  }

  send(type: string, payload: MessagePayload): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        const message = JSON.stringify({ type, payload })
        this.ws.send(message)
        debugLog("WebSocket message sent:", { type, payload })
        return true
      } catch (error) {
        console.error("Failed to stringify or send WebSocket message:", error)
        return false
      }
    } else {
      console.warn("WebSocket not open. Message not sent:", { type, payload })
      return false
    }
  }

  subscribe(type: string, handler: MessageHandler): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    const handlers = this.listeners.get(type)
    if (handlers) {
      handlers.add(handler)
      debugLog(`Subscribed to WebSocket message type: ${type}`)
    }

    return () => {
      const currentHandlers = this.listeners.get(type)
      if (currentHandlers) {
        currentHandlers.delete(handler)
        debugLog(`Unsubscribed from WebSocket message type: ${type}`)
        if (currentHandlers.size === 0) {
          this.listeners.delete(type)
        }
      }
    }
  }

  private emit(type: string, payload: MessagePayload): void {
    const handlers = this.listeners.get(type)
    if (handlers) {
      debugLog(`Emitting event type: ${type} to ${handlers.size} listeners.`)
      handlers.forEach((handler) => {
        try {
          handler(payload)
        } catch (error) {
          console.error(`Error in WebSocket message handler for type ${type}:`, error)
        }
      })
    }
  }

  private attemptReconnect(): void {
    if (this.explicitDisconnect) {
      debugLog("Explicit disconnect, no reconnection attempt.")
      return
    }
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1) // Exponential backoff
      debugLog(
        `Attempting to reconnect WebSocket (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay / 1000}s...`,
      )
      this.status = "connecting" // Show as connecting during attempts
      this.emit("status", { status: this.status, attempt: this.reconnectAttempts })
      setTimeout(() => {
        this.connect()
      }, delay)
    } else {
      console.warn(`Max WebSocket reconnection attempts (${this.maxReconnectAttempts}) reached.`)
      this.status = "disconnected" // Stay disconnected
      this.emit("status", { status: this.status, reason: "Max reconnection attempts reached" })
    }
  }

  disconnect(): void {
    debugLog("Explicit WebSocket disconnect requested.")
    this.explicitDisconnect = true
    this.reconnectAttempts = this.maxReconnectAttempts // Prevent auto-reconnect
    if (this.ws) {
      this.ws.close(1000, "Client initiated disconnect") // 1000 is normal closure
    }
    this.status = "disconnected"
    this.emit("status", { status: this.status, reason: "Client initiated disconnect" })
  }

  getStatus(): WebSocketStatus {
    return this.status
  }
}

// Export a singleton instance as per the document
export const wsClient = new SEQ1WebSocket()
