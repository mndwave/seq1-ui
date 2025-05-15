import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    apiUrl: process.env.NEXT_PUBLIC_SEQ1_API_URL || "Not configured",
    apiKeyConfigured: process.env.SEQ1_API_KEY ? "Yes (hidden)" : "No",
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
}
