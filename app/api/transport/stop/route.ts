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

export async function POST() {
  try {
    // Update the playing state
    global.transportState.isPlaying = false

    return NextResponse.json(global.transportState)
  } catch (error) {
    console.error("Error stopping playback:", error)
    return NextResponse.json({ error: "Failed to stop playback" }, { status: 500 })
  }
}
