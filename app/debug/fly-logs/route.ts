import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Attempt to fetch real logs from your server
    // This assumes you have a real logging service to connect to

    // Replace this with your actual log fetching logic
    const response = await fetch(process.env.SEQ1_API_URL + "/api/logs", {
      headers: {
        Authorization: `Bearer ${process.env.SEQ1_API_KEY}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 }, // Don't cache the response
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch logs: ${response.status} ${response.statusText}`)
    }

    const logs = await response.text()

    return new NextResponse(logs, {
      headers: {
        "Content-Type": "text/plain",
      },
    })
  } catch (error) {
    console.error("Error fetching logs:", error)
    return new NextResponse(`Error fetching server logs: ${error instanceof Error ? error.message : String(error)}`, {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    })
  }
}
