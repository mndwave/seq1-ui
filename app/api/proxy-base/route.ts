import { NextResponse } from "next/server"

export async function GET() {
  // Get the API URL from the server-side environment variable
  const apiUrl = process.env.SEQ1_API_URL

  if (!apiUrl) {
    return NextResponse.json({ error: "API URL not configured" }, { status: 500 })
  }

  // Return just the base URL without any sensitive information
  return NextResponse.json({ baseUrl: apiUrl })
}
