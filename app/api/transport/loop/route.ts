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
    const { isLooping, loopRegion } = await request.json()

    // Update loop state
    if (typeof isLooping === "boolean") {
      global.transportState.isLooping = isLooping
    }

    // Update loop region if provided
    if (loopRegion) {
      // Validate loop region
      if (
        typeof loopRegion.startBar !== "number" ||
        typeof loopRegion.endBar !== "number" ||
        loopRegion.startBar < 0 ||
        loopRegion.endBar <= loopRegion.startBar
      ) {
        return NextResponse.json({ error: "Invalid loop region" }, { status: 400 })
      }

      global.transportState.loopRegion = loopRegion
    } else if (loopRegion === null) {
      // Clear loop region if explicitly set to null
      global.transportState.loopRegion = null
    }

    return NextResponse.json(global.transportState)
  } catch (error) {
    console.error("Error updating loop state:", error)
    return NextResponse.json({ error: "Failed to update loop state" }, { status: 500 })
  }
}
