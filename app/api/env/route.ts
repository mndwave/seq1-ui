import { NextResponse } from "next/server"

export async function GET() {
  // Get the API URL from the server-side environment variable
  const apiUrl = process.env.SEQ1_API_URL || "https://api.seq1.net"

  // Return only the necessary environment variables
  // No sensitive information is exposed
  return NextResponse.json({
    apiUrl,
  })
}
