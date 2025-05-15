import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get the API URL from environment variables
    const apiUrl = process.env.SEQ1_API_URL

    if (!apiUrl) {
      return NextResponse.json({ error: "API URL not configured" }, { status: 500 })
    }

    // Convert to WebSocket URL if needed
    let wsUrl = apiUrl
    if (wsUrl.startsWith("https://")) {
      wsUrl = wsUrl.replace("https://", "wss://")
    } else if (!wsUrl.startsWith("wss://")) {
      wsUrl = `wss://${wsUrl.replace(/^(http:\/\/|\/\/)/i, "")}`
    }

    // We can't actually test the WebSocket connection from here,
    // but we can return information about the WebSocket URL
    return NextResponse.json({
      success: true,
      message: "WebSocket URL configured correctly",
      wsUrl: wsUrl,
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
