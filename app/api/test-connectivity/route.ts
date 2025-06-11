import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get API URL from server-side environment variable
    const apiUrl = process.env.SEQ1_API_URL

    if (!apiUrl) {
      return NextResponse.json({ error: "API URL not configured" }, { status: 500 })
    }

    // Get API key from server-side environment variable
    const apiKey = process.env.SEQ1_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Test the API connection
    const healthEndpoint = `${apiUrl}/api/health`

    const response = await fetch(healthEndpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        message: `API returned status ${response.status}`,
        endpoint: healthEndpoint.replace(apiKey, "[REDACTED]"), // Don't expose the API key
      })
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: "Successfully connected to API",
      data,
      endpoint: healthEndpoint.replace(apiKey, "[REDACTED]"), // Don't expose the API key
    })
  } catch (error) {
    console.error("API connectivity test error:", error)
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : String(error),
    })
  }
}
