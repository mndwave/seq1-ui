import * as serverApi from "@/lib/server/api-server"

// Define the timeline section type
export type TimelineSection = {
  id: string
  name: string
  start: number
  length: number
  color: string
}

// Mock data for fallback
const MOCK_SECTIONS: TimelineSection[] = [
  {
    id: "mock-1",
    name: "Demo Section 01",
    start: 0,
    length: 16,
    color: "#FF5555",
  },
  {
    id: "mock-2",
    name: "Demo Section 02",
    start: 16,
    length: 16,
    color: "#55FF55",
  },
]

/**
 * Get all timeline clips
 */
export async function getTimelineClips(): Promise<TimelineSection[]> {
  try {
    console.log("Fetching timeline clips from API...")
    const response = await serverApi.getTimelineClipsServer()
    console.log("Timeline clips response:", response)
    return response
  } catch (error) {
    console.error("Error getting timeline clips:", error)
    console.log("Using mock timeline clips as fallback")
    return MOCK_SECTIONS
  }
}

/**
 * Create a new timeline clip
 */
export async function createTimelineClip(clip: Omit<TimelineSection, "id">): Promise<TimelineSection> {
  try {
    return await serverApi.createTimelineClipServer(clip)
  } catch (error) {
    console.error("Error creating timeline clip:", error)
    throw new Error("Failed to create timeline clip")
  }
}

/**
 * Update an existing timeline clip
 */
export async function updateTimelineClip(id: string, updates: Partial<TimelineSection>): Promise<TimelineSection> {
  try {
    return await serverApi.updateTimelineClipServer(id, updates)
  } catch (error) {
    console.error("Error updating timeline clip:", error)
    throw new Error("Failed to update timeline clip")
  }
}

/**
 * Delete a timeline clip
 */
export async function deleteTimelineClip(id: string): Promise<{ success: boolean }> {
  try {
    return await serverApi.deleteTimelineClipServer(id)
  } catch (error) {
    console.error("Error deleting timeline clip:", error)
    throw new Error("Failed to delete timeline clip")
  }
}

/**
 * Reorder timeline clips
 */
export async function reorderTimelineClips(orderedIds: string[]): Promise<TimelineSection[]> {
  try {
    return await serverApi.reorderTimelineClipsServer(orderedIds)
  } catch (error) {
    console.error("Error reordering timeline clips:", error)
    throw new Error("Failed to reorder timeline clips")
  }
}
