import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get API URL from server-side environment variable
    const apiUrl = process.env.SEQ1_API_URL

    if (!apiUrl) {
      return NextResponse.json({
        status: "warning",
        message: "API URL not configured",
        apiConfigured: false,
      })
    }

    // Get API key from server-side environment variable
    const apiKey = process.env.SEQ1_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        status: "warning",
        message: "API key not configured",
        apiConfigured: false,
      })
    }

    // Test the API connection
    try {
      const response = await fetch(`${apiUrl}/api/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        cache: "no-store",
      })

      if (!response.ok) {
        return NextResponse.json({
          status: "error",
          message: `API returned status ${response.status}`,
          apiConfigured: true,
          apiConnected: false,
        })
      }

      const data = await response.json()

      return NextResponse.json({
        status: "ok",
        message: "API is healthy",
        apiConfigured: true,
        apiConnected: true,
        data,
      })
    } catch (error) {
      return NextResponse.json({
        status: "error",
        message: error instanceof Error ? error.message : String(error),
        apiConfigured: true,
        apiConnected: false,
      })
    }
  } catch (error) {
    console.error("Health check error:", error)
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : String(error),
      apiConfigured: false,
      apiConnected: false,
    })
  }
}
