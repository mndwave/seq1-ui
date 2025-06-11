import { apiClient } from "@/lib/api-client"
import type { TimelineClip } from "@/lib/timeline-clip-schema" // Using ITimelineSection to avoid conflict if TimelineSection type is also defined here

// Ensure TimelineSection type is compatible with TimelineClip
export type TimelineSection = TimelineClip

/**
 * Get all timeline clips
 */
export async function getTimelineClips(): Promise<TimelineSection[]> {
  console.log("[TimelineAPI] Fetching timeline clips...")
  try {
    const response = await apiClient.request<any>("/api/clips") // Use any for flexible checking
    console.log("[TimelineAPI] Timeline clips response received:", response)

    if (Array.isArray(response)) {
      return response as TimelineSection[]
    }
    if (response && typeof response === "object" && Array.isArray(response.clips)) {
      return response.clips as TimelineSection[]
    }
    console.warn("[TimelineAPI] Unexpected response format for clips. Expected an array or { clips: array }.", response)
    return []
  } catch (error) {
    console.error("[TimelineAPI] Error fetching timeline clips:", error)
    throw error
  }
}

/**
 * Create a new timeline clip
 */
export async function createTimelineClip(clip: Omit<TimelineSection, "id">): Promise<TimelineSection> {
  console.log("[TimelineAPI] Creating timeline clip:", clip)
  const response = await apiClient.request<TimelineSection>("/api/clips", {
    method: "POST",
    body: JSON.stringify(clip),
  })
  console.log("[TimelineAPI] Clip created response:", response)
  return response
}

/**
 * Update an existing timeline clip
 */
export async function updateTimelineClip(id: string, updates: Partial<TimelineSection>): Promise<TimelineSection> {
  console.log("[TimelineAPI] Updating timeline clip:", id, updates)
  const response = await apiClient.request<TimelineSection>(`/api/clips/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  })
  console.log("[TimelineAPI] Clip updated response:", response)
  return response
}

/**
 * Delete a timeline clip
 */
export async function deleteTimelineClip(id: string): Promise<{ success: boolean }> {
  console.log("[TimelineAPI] Deleting timeline clip:", id)
  const response = await apiClient.request<{ success: boolean }>(`/api/clips/${id}`, {
    method: "DELETE",
  })
  console.log("[TimelineAPI] Clip deleted response:", response)
  return response
}

/**
 * Reorder timeline clips
 */
export async function reorderTimelineClips(orderedIds: string[]): Promise<TimelineSection[]> {
  console.log("[TimelineAPI] Reordering timeline clips:", orderedIds)
  try {
    const response = await apiClient.request<any>("/api/clips/reorder", {
      method: "POST",
      body: JSON.stringify({ orderedIds }),
    })
    console.log("[TimelineAPI] Clips reordered response:", response)
    if (Array.isArray(response)) {
      return response as TimelineSection[]
    }
    if (response && Array.isArray(response.clips)) {
      return response.clips as TimelineSection[]
    }
    console.warn("[TimelineAPI] Unexpected response format for reordered clips:", response)
    return []
  } catch (error) {
    console.error("[TimelineAPI] Error reordering timeline clips:", error)
    throw error
  }
}

/**
 * Clear all timeline clips (Development/Testing Utility)
 */
export async function clearAllTimelineClips(): Promise<{ success: boolean; message?: string }> {
  console.log("[TimelineAPI] Clearing all timeline clips...")
  try {
    const response = await apiClient.request<{ success: boolean; message?: string }>("/api/clips/all", {
      // Assuming a DELETE endpoint for clearing all
      method: "DELETE",
    })
    console.log("[TimelineAPI] Clear all clips response:", response)
    return response
  } catch (error) {
    console.error("[TimelineAPI] Error clearing all timeline clips:", error)
    throw error // Re-throw to be handled by the caller
  }
}

// --- Aliases to satisfy build errors ---
/** @deprecated Prefer getTimelineClips */
export const getClips = getTimelineClips
/** @deprecated Prefer createTimelineClip */
export const createClip = createTimelineClip
/** @deprecated Prefer updateTimelineClip */
export const updateClip = updateTimelineClip
/** @deprecated Prefer deleteTimelineClip */
export const deleteClip = deleteTimelineClip
/** @deprecated Prefer reorderTimelineClips */
export const reorderClips = reorderTimelineClips
/** @deprecated Prefer clearAllTimelineClips */
export const clearAllClips = clearAllTimelineClips
// --- End Aliases ---
