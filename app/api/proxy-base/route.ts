import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get API URL from server-side environment variable
    const apiUrl = process.env.SEQ1_API_URL

    if (!apiUrl) {
      return NextResponse.json({ error: "API URL not configured" }, { status: 500 })
    }

    // Return the base URL (without exposing the API key)
    return NextResponse.json({
      baseUrl: apiUrl,
    })
  } catch (error) {
    console.error("Error getting proxy base URL:", error)
    return NextResponse.json(
      {
        error: "Error getting proxy base URL",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
