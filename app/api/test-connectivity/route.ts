import { type NextRequest, NextResponse } from "next/server"
import { getApiUrl } from "@/lib/server/api-server"

export async function GET(request: NextRequest) {
  try {
    // Get the API URL from the server configuration
    const apiUrl = await getApiUrl()

    // Make a real request to the API health endpoint
    const response = await fetch(`${apiUrl}/api/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SEQ1_API_KEY}`,
      },
      next: { revalidate: 0 }, // Don't cache the response
    })

    if (!response.ok) {
      throw new Error(`API health check failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: "API connectivity test successful",
      apiUrl: apiUrl,
      details: data,
    })
  } catch (error) {
    console.error("API connectivity test failed:", error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
