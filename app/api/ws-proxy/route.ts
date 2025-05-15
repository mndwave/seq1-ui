import { NextResponse } from "next/server"

export function GET() {
  // This route will be upgraded to a WebSocket connection by middleware
  // For now, return a message indicating this is a WebSocket endpoint
  return NextResponse.json({
    error: "This endpoint is meant to be used as a WebSocket connection",
    message: "Please use a WebSocket client to connect to this endpoint",
  })
}

export const dynamic = "force-dynamic"
