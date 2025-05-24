import { makeApiRequest } from "@/lib/server/api-server"

// Define the timeline section type
export type TimelineSection = {
  id: string
  name: string
  start: number
  length: number
  color: string
}

/**
 * Get all timeline clips - NO FALLBACKS
 */
export async function getTimelineClips(): Promise<TimelineSection[]> {
  console.log("🔴 DIRECT API CALL: Fetching timeline clips from API...")
  const response = await makeApiRequest<{ clips: TimelineSection[] }>("/api/clips")
  console.log("🔴 DIRECT API RESPONSE: Timeline clips:", response)
  return response.clips || response
}

/**
 * Create a new timeline clip - NO FALLBACKS
 */
export async function createTimelineClip(clip: Omit<TimelineSection, "id">): Promise<TimelineSection> {
  console.log("🔴 DIRECT API CALL: Creating timeline clip:", clip)
  const response = await makeApiRequest<TimelineSection>("/api/clips", {
    method: "POST",
    body: JSON.stringify(clip),
  })
  console.log("🔴 DIRECT API RESPONSE: Clip created:", response)
  return response
}

/**
 * Update an existing timeline clip - NO FALLBACKS
 */
export async function updateTimelineClip(id: string, updates: Partial<TimelineSection>): Promise<TimelineSection> {
  console.log("🔴 DIRECT API CALL: Updating timeline clip:", id, updates)
  const response = await makeApiRequest<TimelineSection>(`/api/clips/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  })
  console.log("🔴 DIRECT API RESPONSE: Clip updated:", response)
  return response
}

/**
 * Delete a timeline clip - NO FALLBACKS
 */
export async function deleteTimelineClip(id: string): Promise<{ success: boolean }> {
  console.log("🔴 DIRECT API CALL: Deleting timeline clip:", id)
  const response = await makeApiRequest<{ success: boolean }>(`/api/clips/${id}`, {
    method: "DELETE",
  })
  console.log("🔴 DIRECT API RESPONSE: Clip deleted:", response)
  return response
}

/**
 * Reorder timeline clips - NO FALLBACKS
 */
export async function reorderTimelineClips(orderedIds: string[]): Promise<TimelineSection[]> {
  console.log("🔴 DIRECT API CALL: Reordering timeline clips:", orderedIds)
  const response = await makeApiRequest<{ clips: TimelineSection[] }>("/api/clips/reorder", {
    method: "POST",
    body: JSON.stringify({ orderedIds }),
  })
  console.log("🔴 DIRECT API RESPONSE: Clips reordered:", response)
  return response.clips || response
}
