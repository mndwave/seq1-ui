import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Get API URL from server-side environment variable
    const apiUrl = process.env.SEQ1_API_URL

    if (!apiUrl) {
      return NextResponse.json({ error: "API URL not configured" }, { status: 500 })
    }

    // Convert HTTP URL to WebSocket URL
    const wsUrl = apiUrl.replace("https://", "wss://").replace("http://", "ws://")

    // Get API key from server-side environment variable
    const apiKey = process.env.SEQ1_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Test the WebSocket connection
    return NextResponse.json({
      success: true,
      message: "WebSocket proxy test endpoint",
      wsUrl: wsUrl.replace(apiKey, "[REDACTED]"), // Don't expose the API key
    })
  } catch (error) {
    console.error("WebSocket proxy test error:", error)
    return NextResponse.json(
      {
        error: "WebSocket proxy test error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
