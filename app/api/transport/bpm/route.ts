import { NextResponse } from "next/server"

// Reference to the in-memory store
declare global {
  // eslint-disable-next-line no-var
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
    const { bpm } = await request.json()

    if (typeof bpm !== "number" || bpm <= 0) {
      return NextResponse.json({ error: "Invalid BPM value" }, { status: 400 })
    }

    // Update the BPM
    global.transportState.bpm = bpm

    return NextResponse.json(global.transportState)
  } catch (error) {
    console.error("Error updating BPM:", error)
    return NextResponse.json({ error: "Failed to update BPM" }, { status: 500 })
  }
}
