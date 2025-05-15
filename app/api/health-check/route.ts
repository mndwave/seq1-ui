import { NextResponse } from "next/server"
import { checkApiHealth } from "@/lib/server/api-server"

export async function GET() {
  try {
    const healthStatus = await checkApiHealth()
    return NextResponse.json(healthStatus)
  } catch (error: any) {
    console.error("Error checking API health:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "An error occurred while checking API health",
      },
      { status: 500 },
    )
  }
}
