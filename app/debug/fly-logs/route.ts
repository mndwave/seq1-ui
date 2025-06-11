import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Check if we have the required environment variables
    if (!process.env.SEQ1_API_URL || !process.env.SEQ1_API_KEY) {
      return new NextResponse("Server logs unavailable: API configuration missing", {
        status: 503,
        headers: {
          "Content-Type": "text/plain",
        },
      })
    }

    // Attempt to fetch real logs from your server
    const response = await fetch(process.env.SEQ1_API_URL + "/api/logs", {
      headers: {
        Authorization: `Bearer ${process.env.SEQ1_API_KEY}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 }, // Don't cache the response
    })

    if (response.status === 405) {
      return new NextResponse("Server logs unavailable: /api/logs endpoint not implemented on API server", {
        status: 503,
        headers: {
          "Content-Type": "text/plain",
        },
      })
    }

    if (response.status === 404) {
      return new NextResponse("Server logs unavailable: /api/logs endpoint not found on API server", {
        status: 503,
        headers: {
          "Content-Type": "text/plain",
        },
      })
    }

    if (!response.ok) {
      return new NextResponse(
        `Server logs unavailable: API server returned ${response.status} ${response.statusText}`,
        {
          status: 503,
          headers: {
            "Content-Type": "text/plain",
          },
        },
      )
    }

    const logs = await response.text()

    return new NextResponse(logs, {
      headers: {
        "Content-Type": "text/plain",
      },
    })
  } catch (error) {
    console.warn("Server logs unavailable:", error)
    return new NextResponse(
      `Server logs unavailable: ${error instanceof Error ? error.message : "Connection failed"}`,
      {
        status: 503,
        headers: {
          "Content-Type": "text/plain",
        },
      },
    )
  }
}
