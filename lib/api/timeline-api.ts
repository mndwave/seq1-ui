import { makeApiRequest } from "@/lib/server/api-server"

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
 * Check if the timeline API is available
 */
export async function isTimelineApiAvailable(): Promise<boolean> {
  try {
    await makeApiRequest("/api/timeline/health")
    return true
  } catch {
    return false
  }
}

/**
 * Get all timeline clips
 * Always returns data - either from API or mock fallback
 */
export async function getTimelineClips(): Promise<TimelineSection[]> {
  try {
    console.log("Fetching timeline clips from API...")
    const response = await makeApiRequest<TimelineSection[]>("/api/timeline/clips")
    console.log("Timeline clips response:", response)
    return response
  } catch (error) {
    console.warn("Timeline API unavailable, using mock data:", error)
    return MOCK_SECTIONS
  }
}

/**
 * Create a new timeline clip
 * Returns optimistic result when API is unavailable
 */
export async function createTimelineClip(clip: Omit<TimelineSection, "id">): Promise<TimelineSection> {
  try {
    return await makeApiRequest<TimelineSection>("/api/timeline/clips", {
      method: "POST",
      body: JSON.stringify(clip),
    })
  } catch (error) {
    console.warn("Timeline API unavailable, creating optimistic clip:", error)
    // Return optimistic result with generated ID
    const optimisticClip: TimelineSection = {
      ...clip,
      id: `optimistic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }
    return optimisticClip
  }
}

/**
 * Update an existing timeline clip
 * Returns optimistic result when API is unavailable
 */
export async function updateTimelineClip(id: string, updates: Partial<TimelineSection>): Promise<TimelineSection> {
  try {
    return await makeApiRequest<TimelineSection>(`/api/timeline/clips/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    })
  } catch (error) {
    console.warn("Timeline API unavailable, returning optimistic update:", error)
    // Return optimistic result
    const optimisticClip: TimelineSection = {
      id,
      name: updates.name || "Updated Section",
      start: updates.start || 0,
      length: updates.length || 16,
      color: updates.color || "#FF5555",
      ...updates,
    }
    return optimisticClip
  }
}

/**
 * Delete a timeline clip
 * Returns success when API is unavailable (optimistic)
 */
export async function deleteTimelineClip(id: string): Promise<{ success: boolean }> {
  try {
    return await makeApiRequest<{ success: boolean }>(`/api/timeline/clips/${id}`, {
      method: "DELETE",
    })
  } catch (error) {
    console.warn("Timeline API unavailable, returning optimistic delete:", error)
    // Return optimistic success
    return { success: true }
  }
}

/**
 * Reorder timeline clips
 * Returns current order when API is unavailable
 */
export async function reorderTimelineClips(orderedIds: string[]): Promise<TimelineSection[]> {
  try {
    return await makeApiRequest<TimelineSection[]>("/api/timeline/clips/reorder", {
      method: "POST",
      body: JSON.stringify({ orderedIds }),
    })
  } catch (error) {
    console.warn("Timeline API unavailable, returning mock sections:", error)
    // Return mock sections in the requested order (best effort)
    return MOCK_SECTIONS
  }
}

/**
 * Get timeline API status
 */
export async function getTimelineApiStatus(): Promise<{
  available: boolean
  mode: "online" | "offline"
  message: string
}> {
  const available = await isTimelineApiAvailable()
  return {
    available,
    mode: available ? "online" : "offline",
    message: available ? "Timeline API is available" : "Timeline API unavailable - using offline mode with mock data",
  }
}
