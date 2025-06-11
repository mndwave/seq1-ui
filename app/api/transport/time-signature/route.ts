import { NextResponse } from "next/server"

// Reference to the in-memory store
declare global {
  var transportState: {
    playheadPosition: number
    isPlaying: boolean
    isLooping: boolean
    loopRegion: { startBar: number; endBar: number } | null
    bpm: number
    timeSignature: string
  }
}

// Initialize global state if not already set
if (!global.transportState) {
  global.transportState = {
    playheadPosition: 0,
    isPlaying: false,
    isLooping: false,
    loopRegion: null,
    bpm: 120,
    timeSignature: "4/4",
  }
}

export async function POST(request: Request) {
  try {
    const { timeSignature } = await request.json()

    if (typeof timeSignature !== "string" || !timeSignature.match(/^\d+\/\d+$/)) {
      return NextResponse.json({ error: "Invalid time signature format" }, { status: 400 })
    }

    // Update the time signature
    global.transportState.timeSignature = timeSignature

    return NextResponse.json(global.transportState)
  } catch (error) {
    console.error("Error updating time signature:", error)
    return NextResponse.json({ error: "Failed to update time signature" }, { status: 500 })
  }
}
