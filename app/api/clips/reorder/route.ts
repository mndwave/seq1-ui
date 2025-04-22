import { NextResponse } from "next/server"
import type { TimelineClip } from "@/lib/timeline-clip-schema"

// Reference to the in-memory store
declare global {
  var timelineClips: TimelineClip[]
}

export async function POST(request: Request) {
  try {
    const { orderedIds } = await request.json()

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: "orderedIds must be an array" }, { status: 400 })
    }

    // Create a map of the current clips
    const clipMap = new Map(global.timelineClips.map((clip) => [clip.id, clip]))

    // Validate all IDs exist
    for (const id of orderedIds) {
      if (!clipMap.has(id)) {
        return NextResponse.json({ error: `Clip with ID ${id} not found` }, { status: 404 })
      }
    }

    // Reorder clips based on the provided order
    // This is a simplified approach - in a real app, you might need to
    // recalculate start positions based on the new order
    const reorderedClips = orderedIds.map((id, index) => {
      const clip = clipMap.get(id)!

      // If this is not the first clip, position it after the previous clip
      if (index > 0) {
        const prevClip = clipMap.get(orderedIds[index - 1])!
        clip.start = prevClip.start + prevClip.length
      } else {
        // First clip starts at position 0
        clip.start = 0
      }

      return clip
    })

    // Update the global store
    global.timelineClips = reorderedClips

    return NextResponse.json(reorderedClips)
  } catch (error) {
    console.error("Error reordering clips:", error)
    return NextResponse.json({ error: "Failed to reorder clips" }, { status: 500 })
  }
}
