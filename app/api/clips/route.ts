import { NextResponse } from "next/server"
import type { TimelineClip } from "@/lib/timeline-clip-schema"

// In-memory store for clips (would be replaced with a database in production)
let clips: TimelineClip[] = []

export async function GET() {
  try {
    // Return clips sorted by start position
    return NextResponse.json(clips.sort((a, b) => a.start - b.start))
  } catch (error) {
    console.error("Error fetching clips:", error)
    return NextResponse.json({ error: "Failed to fetch clips" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const clipData = await request.json()

    // Validate required fields
    if (!clipData.name || clipData.start === undefined || !clipData.length || !clipData.color) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create new clip with generated ID
    const newClip: TimelineClip = {
      id: `clip-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: clipData.name,
      start: clipData.start,
      length: clipData.length,
      color: clipData.color,
    }

    // Add to store
    clips.push(newClip)

    return NextResponse.json(newClip, { status: 201 })
  } catch (error) {
    console.error("Error creating clip:", error)
    return NextResponse.json({ error: "Failed to create clip" }, { status: 500 })
  }
}

// Helper function to clear all clips (for testing)
export async function DELETE() {
  try {
    clips = []
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error clearing clips:", error)
    return NextResponse.json({ error: "Failed to clear clips" }, { status: 500 })
  }
}
