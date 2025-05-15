import { NextResponse } from "next/server"
import { getApiUrl } from "@/lib/server/api-server"

export async function GET() {
  try {
    // Get the API URL from the server
    const apiUrl = await getApiUrl()

    // Test basic connectivity to the API
    const response = await fetch(`${apiUrl}/api/health`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Add a timeout to prevent long waits
      signal: AbortSignal.timeout(5000),
    })

    // Get the response data
    let data
    try {
      data = await response.json()
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: "API returned invalid JSON response",
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          error: String(error),
        },
        { status: 500 },
      )
    }

    // Check if the response is successful
    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: "Successfully connected to API",
        apiUrl,
        status: response.status,
        data,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: `API returned error status: ${response.status}`,
          apiUrl,
          status: response.status,
          statusText: response.statusText,
          data,
        },
        { status: response.status },
      )
    }
  } catch (error: any) {
    // Detailed error information
    const errorDetails: Record<string, any> = {
      message: error.message || "Unknown error",
      name: error.name,
      stack: error.stack,
    }

    // Check for specific error types
    if (error.name === "AbortError") {
      errorDetails.reason = "Request timed out after 5 seconds"
    } else if (error.name === "TypeError" && error.message === "Failed to fetch") {
      errorDetails.reason = "Network error: Failed to fetch. The API server may be unreachable."
    }

    // Return detailed error response
    return NextResponse.json(
      {
        success: false,
        message: errorDetails.message,
        error: errorDetails,
      },
      { status: 500 },
    )
  }
}
