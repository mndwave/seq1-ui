import { NextResponse } from "next/server"
import { getApiUrl } from "@/lib/server/api-server"

export async function GET() {
  try {
    const apiUrl = await getApiUrl()

    // Make a simple request to the API to test connectivity
    const response = await fetch(`${apiUrl}/health`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SEQ1_API_KEY}`,
      },
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: "API connectivity test successful",
      apiUrl: apiUrl.replace(/\/api$/, ""), // Remove /api suffix for display
      timestamp: new Date().toISOString(),
      statusCode: response.status,
      apiResponse: data,
    })
  } catch (error) {
    console.error("API connectivity test failed:", error)

    return NextResponse.json(
      {
        success: false,
        message: "API connectivity test failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
