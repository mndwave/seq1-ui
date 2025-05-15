import { NextResponse } from "next/server"
import * as serverApi from "@/lib/server/api-server"

export async function GET() {
  try {
    // Check API health
    const apiHealth = await serverApi.checkApiHealth()

    // Return the health status
    return NextResponse.json({
      success: apiHealth.success,
      message: apiHealth.message,
      details: {
        apiUrl: process.env.NEXT_PUBLIC_SEQ1_API_URL || "https://api.seq1.net",
        apiHealth: apiHealth.success ? "Online" : "Offline",
        serverTime: new Date().toISOString(),
        hasApiKey: !!process.env.SEQ1_API_KEY,
      },
    })
  } catch (error) {
    console.error("Health check error:", error)

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        details: {
          apiUrl: process.env.NEXT_PUBLIC_SEQ1_API_URL || "https://api.seq1.net",
          apiHealth: "Error",
          serverTime: new Date().toISOString(),
          hasApiKey: !!process.env.SEQ1_API_KEY,
        },
      },
      { status: 500 },
    )
  }
}
