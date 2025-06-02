import { NextResponse } from "next/server"
import type { TimelineClip } from "@/lib/timeline-clip-schema"

// Reference to the in-memory store (would be a database query in production)
// This is just for the example - in a real app, you'd use a proper database
let timelineClips: TimelineClip[] = []

// Initialize if needed (this would be done differently in production)
if (!timelineClips.length) {
  timelineClips = []
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const updates = await request.json()

    // Find the clip
    const clipIndex = timelineClips.findIndex((clip) => clip.id === id)

    if (clipIndex === -1) {
      return NextResponse.json({ error: "Clip not found" }, { status: 404 })
    }

    // Update the clip
    const updatedClip = {
      ...timelineClips[clipIndex],
      ...updates,
    }

    timelineClips[clipIndex] = updatedClip

    return NextResponse.json(updatedClip)
  } catch (error) {
    console.error(`Error updating clip ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update clip" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Find and remove the clip
    const initialLength = timelineClips.length
    timelineClips = timelineClips.filter((clip) => clip.id !== id)

    if (timelineClips.length === initialLength) {
      return NextResponse.json({ error: "Clip not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(`Error deleting clip ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to delete clip" }, { status: 500 })
  }
}
