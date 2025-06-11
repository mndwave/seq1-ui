import { NextResponse } from "next/server"
import { upgradeWebSocket } from "next/server"

export const runtime = "edge"

export async function GET(request: Request) {
  // Get the API URL from the server-side environment variable
  const apiUrl = process.env.SEQ1_API_URL

  if (!apiUrl) {
    return new NextResponse("API URL not configured", { status: 500 })
  }

  // Convert HTTP URL to WebSocket URL
  const wsUrl = apiUrl.replace("https://", "wss://").replace("http://", "ws://")

  // Get the API key from the server-side environment variable
  const apiKey = process.env.SEQ1_API_KEY

  if (!apiKey) {
    return new NextResponse("API key not configured", { status: 500 })
  }

  // Create WebSocket URL with authentication
  const url = new URL(wsUrl)
  url.searchParams.append("api_key", apiKey)

  // Upgrade the connection to WebSocket
  const upgrade = request.headers.get("upgrade")
  if (!upgrade || upgrade !== "websocket") {
    return new NextResponse("Expected websocket", { status: 400 })
  }

  try {
    const { socket, response } = await new Promise<any>((resolve) => {
      // @ts-ignore - This is a hack to get the WebSocket working in Edge Runtime
      const { socket, response } = upgradeWebSocket(request)
      resolve({ socket, response })
    })

    // Create a WebSocket connection to the API
    const apiSocket = new WebSocket(url.toString())

    // Forward messages from the client to the API
    socket.onmessage = (event: MessageEvent) => {
      if (apiSocket.readyState === WebSocket.OPEN) {
        apiSocket.send(event.data)
      }
    }

    // Forward messages from the API to the client
    apiSocket.onmessage = (event: MessageEvent) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(event.data)
      }
    }

    // Handle socket close
    socket.onclose = () => {
      apiSocket.close()
    }

    // Handle API socket close
    apiSocket.onclose = () => {
      socket.close()
    }

    // Return the response
    return response
  } catch (error) {
    console.error("WebSocket proxy error:", error)
    return new NextResponse("WebSocket proxy error", { status: 500 })
  }
}
