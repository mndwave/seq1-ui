import { NextResponse } from "next/server"

// In-memory store for transport state (would be replaced with a database in production)
// Initialize with default values
let transportState = {
  playheadPosition: 0, // Position in bars
  isPlaying: false,
  isLooping: false,
  loopRegion: null as { startBar: number; endBar: number } | null,
  bpm: 120,
  timeSignature: "4/4",
}

export async function GET() {
  try {
    return NextResponse.json(transportState)
  } catch (error) {
    console.error("Error fetching transport state:", error)
    return NextResponse.json({ error: "Failed to fetch transport state" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const updates = await request.json()

    // Update only the provided fields
    transportState = {
      ...transportState,
      ...updates,
    }

    return NextResponse.json(transportState)
  } catch (error) {
    console.error("Error updating transport state:", error)
    return NextResponse.json({ error: "Failed to update transport state" }, { status: 500 })
  }
}
