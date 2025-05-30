import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import type { TimelineClip } from "@/lib/timeline-clip-schema"

// Mock database / state
// IMPORTANT: In a stateless environment (like Vercel serverless functions),
// this in-memory 'clips' array will reset on each invocation or across different instances,
// which can lead to inconsistencies if the client expects state to persist.
let clips: TimelineClip[] = [
  { id: "clip-1", name: "Alpha Section", start: 0, length: 16, color: "#FF6B6B" },
  { id: "clip-2", name: "Beta Section", start: 16, length: 32, color: "#4ECDC4" },
  { id: "clip-3", name: "Gamma Section", start: 48, length: 16, color: "#45B7D1" },
]

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderedIds } = body as { orderedIds: string[] }

    if (!Array.isArray(orderedIds) || !orderedIds.every((id) => typeof id === "string")) {
      return NextResponse.json({ error: "Invalid input: orderedIds must be an array of strings." }, { status: 400 })
    }

    const currentClipsMap = new Map(clips.map((clip) => [clip.id, clip]))
    const reorderedClips: TimelineClip[] = []

    // Validate that all orderedIds correspond to existing clips
    for (const id of orderedIds) {
      if (!currentClipsMap.has(id)) {
        console.error(
          `Reorder failed: Clip with id "${id}" not found in current server state. Current clip IDs: [${clips.map((c) => c.id).join(", ")}]`,
        )
        return NextResponse.json({ error: `Clip with id "${id}" not found.` }, { status: 400 })
      }
      reorderedClips.push(currentClipsMap.get(id)!)
    }

    // Validate that all existing clips are accounted for in orderedIds
    if (reorderedClips.length !== clips.length) {
      console.error(
        `Reorder failed: Mismatch in clip count. Expected ${clips.length} clips based on server state, but received ${orderedIds.length} IDs resulting in ${reorderedClips.length} clips. Current clip IDs: [${clips.map((c) => c.id).join(", ")}]. Ordered IDs received: [${orderedIds.join(", ")}]`,
      )
      return NextResponse.json(
        {
          error:
            "Reorder failed due to mismatch in clip count. Ensure all current clips are included in the new order.",
        },
        { status: 400 },
      )
    }

    // Update the server's state
    clips = reorderedClips

    // Revalidate the path if you're using Next.js caching and server components
    // that depend on this data.
    revalidatePath("/")
    revalidatePath("/api/clips") // If you have a GET endpoint for clips

    console.log("Successfully reordered clips. New order:", clips.map((c) => c.id).join(", "))
    return NextResponse.json({ clips })
  } catch (error) {
    let errorMessage = "Failed to reorder clips due to an unexpected server error."
    let errorDetails = {}

    if (error instanceof SyntaxError) {
      errorMessage = "Invalid JSON payload provided."
      console.error("Error in /api/clips/reorder (SyntaxError):", error.message)
    } else if (error instanceof Error) {
      errorMessage = error.message
      console.error("Error in /api/clips/reorder (Error):", error.message, error.stack)
    } else {
      console.error("Unknown error in /api/clips/reorder:", error)
    }

    errorDetails = error instanceof Error ? { name: error.name, stack: error.stack } : { rawError: String(error) }

    return NextResponse.json({ error: errorMessage, details: errorDetails }, { status: 500 })
  }
}

// GET method to see current order (for debugging purposes)
export async function GET() {
  return NextResponse.json({ clips })
}
