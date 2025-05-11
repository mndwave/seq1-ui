import type { TimelineClip } from "@/lib/timeline-clip-schema"
import * as apiClient from "@/lib/api-client"

/**
 * Fetch all timeline clips
 * @returns Array of timeline clips sorted by position
 */
export async function getTimelineClips(): Promise<TimelineClip[]> {
  try {
    const response = await apiClient.getTimelineClips()
    return response.clips
  } catch (error) {
    console.error("Error fetching timeline clips:", error)
    throw error
  }
}

/**
 * Create a new timeline clip
 * @param clip The clip data to create
 * @returns The created clip with server-assigned ID
 */
export async function createTimelineClip(clip: Omit<TimelineClip, "id">): Promise<TimelineClip> {
  try {
    return await apiClient.createTimelineClip(clip)
  } catch (error) {
    console.error("Error creating timeline clip:", error)
    throw error
  }
}

/**
 * Update an existing timeline clip
 * @param id The ID of the clip to update
 * @param updates The properties to update
 * @returns The updated clip
 */
export async function updateTimelineClip(
  id: string,
  updates: Partial<Omit<TimelineClip, "id">>,
): Promise<TimelineClip> {
  try {
    return await apiClient.updateTimelineClip(id, updates)
  } catch (error) {
    console.error(`Error updating timeline clip ${id}:`, error)
    throw error
  }
}

/**
 * Delete a timeline clip
 * @param id The ID of the clip to delete
 * @returns Success status
 */
export async function deleteTimelineClip(id: string): Promise<{ success: boolean }> {
  try {
    return await apiClient.deleteTimelineClip(id)
  } catch (error) {
    console.error(`Error deleting timeline clip ${id}:`, error)
    throw error
  }
}

/**
 * Reorder timeline clips
 * @param orderedIds Array of clip IDs in their new order
 * @returns Updated array of clips
 */
export async function reorderTimelineClips(orderedIds: string[]): Promise<TimelineClip[]> {
  try {
    const response = await apiClient.reorderTimelineClips(orderedIds)
    return response.clips
  } catch (error) {
    console.error("Error reordering timeline clips:", error)
    throw error
  }
}
