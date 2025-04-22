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
    const { position } = await request.json()

    if (typeof position !== "number" || position < 0) {
      return NextResponse.json({ error: "Invalid position value" }, { status: 400 })
    }

    // Update the playhead position
    global.transportState.playheadPosition = position

    return NextResponse.json(global.transportState)
  } catch (error) {
    console.error("Error setting playhead position:", error)
    return NextResponse.json({ error: "Failed to set playhead position" }, { status: 500 })
  }
}
