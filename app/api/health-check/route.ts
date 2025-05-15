import { NextResponse } from "next/server"
import { getApiUrl } from "@/lib/server/api-server"

export async function GET() {
  try {
    // Get the API URL from environment variables
    const apiUrl = await getApiUrl()

    // Make a request to the API health endpoint
    const response = await fetch(`${apiUrl}/api/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`API health check failed with status: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: "API is healthy",
      apiUrl: apiUrl.replace(/\/+$/, ""), // Remove trailing slashes
      status: data.status || "unknown",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("API health check error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "API health check failed",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
