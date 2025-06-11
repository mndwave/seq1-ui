"use client"

import { useState, useEffect, useCallback } from "react"
import type { TimelineClip } from "@/lib/timeline-clip-schema"
import {
  getTimelineClips as apiGetTimelineClips,
  createTimelineClip as apiCreateTimelineClip,
  updateTimelineClip as apiUpdateTimelineClip,
  deleteTimelineClip as apiDeleteTimelineClip,
  reorderTimelineClips as apiReorderTimelineClips,
} from "@/lib/api/timeline-api" // Renamed imports to avoid conflict
import { generateDistinctColor, getBalancedVibrantColors } from "@/lib/color-utils"
import { apiClient } from "@/lib/api-client" // For WebSocket events
import { useAuth } from "@/lib/auth-context" // To check authentication status

export function useTimeline() {
  const [clips, setClips] = useState<TimelineClip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const { isAuthenticated, isAuthLoading } = useAuth()

  // Constants
  const DEFAULT_CLIP_LENGTH = 16 // 4 bars * 4 beats per bar

  // Create a default clip
  const createDefaultClip = useCallback(async () => {
    if (!isAuthenticated) {
      console.warn("[useTimeline] Not authenticated, cannot create default clip.")
      // Optionally set a specific state or error for unauthenticated default clip creation
      setClips([]) // Ensure clips are empty if we can't create a default one
      return null
    }
    try {
      console.log("[useTimeline] Creating default clip...")
      const colors = getBalancedVibrantColors(1)
      const defaultClipData = {
        name: "Section 01",
        start: 4,
        length: DEFAULT_CLIP_LENGTH,
        color: colors[0],
      }
      const newClip = await apiCreateTimelineClip(defaultClipData)
      setClips([newClip])
      console.log("[useTimeline] Default clip created:", newClip)
      return newClip
    } catch (err: any) {
      console.error("[useTimeline] Failed to create default clip:", err)
      setError(err.message || "Failed to create default clip")
      // Do not throw here, let the UI handle the error state
      return null
    }
  }, [isAuthenticated])

  // Fetch all clips
  const fetchClips = useCallback(async () => {
    if (!isAuthenticated) {
      console.warn("[useTimeline] Not authenticated, skipping fetchClips.")
      setClips([])
      setIsLoading(false)
      setIsInitialized(true) // Consider it initialized even if empty due to auth
      return
    }
    console.log("[useTimeline] Fetching clips...")
    setIsLoading(true)
    try {
      const fetchedClips = await apiGetTimelineClips()
      console.log("[useTimeline] Clips fetched:", fetchedClips)

      if (fetchedClips.length === 0 && !isInitialized) {
        console.log("[useTimeline] No clips found and not initialized, creating default clip.")
        await createDefaultClip() // This will set clips internally
      } else {
        setClips(fetchedClips)
      }
      setError(null)
    } catch (err: any) {
      console.error("[useTimeline] Failed to fetch timeline clips:", err)
      setError(err.message || "Failed to load timeline data")
      setClips([]) // Clear clips on error
    } finally {
      setIsLoading(false)
      setIsInitialized(true)
    }
  }, [isAuthenticated, isInitialized, createDefaultClip])

  // Load clips on mount or when authentication status changes
  useEffect(() => {
    if (!isAuthLoading) {
      fetchClips()
    }
  }, [fetchClips, isAuthenticated, isAuthLoading])

  // WebSocket event handlers
  useEffect(() => {
    if (!isAuthenticated) return // Only subscribe if authenticated

    const handleClipsUpdated = (updatedClips: TimelineClip[]) => {
      console.log("[useTimeline] WebSocket: timeline-clips-updated", updatedClips)
      setClips(updatedClips)
      setError(null) // Clear any previous errors
      setIsLoading(false) // Ensure loading is false
    }

    const handleClipAdded = (newClip: TimelineClip) => {
      console.log("[useTimeline] WebSocket: timeline-clip-added", newClip)
      setClips((prevClips) => {
        // Avoid duplicates if the clip somehow already exists
        if (prevClips.find((c) => c.id === newClip.id)) {
          return prevClips.map((c) => (c.id === newClip.id ? newClip : c))
        }
        return [...prevClips, newClip]
      })
    }

    const handleClipRemoved = (clipId: string) => {
      console.log("[useTimeline] WebSocket: timeline-clip-removed", clipId)
      setClips((prevClips) => prevClips.filter((clip) => clip.id !== clipId))
      if (selectedClipId === clipId) {
        setSelectedClipId(null)
      }
    }

    const handleClipUpdated = (updatedClip: TimelineClip) => {
      console.log("[useTimeline] WebSocket: timeline-clip-updated", updatedClip)
      setClips((prevClips) => prevClips.map((clip) => (clip.id === updatedClip.id ? updatedClip : clip)))
    }

    apiClient.on("timeline-clips-updated", handleClipsUpdated)
    apiClient.on("timeline-clip-added", handleClipAdded)
    apiClient.on("timeline-clip-removed", handleClipRemoved)
    apiClient.on("timeline-clip-updated", handleClipUpdated)

    return () => {
      apiClient.off("timeline-clips-updated", handleClipsUpdated)
      apiClient.off("timeline-clip-added", handleClipAdded)
      apiClient.off("timeline-clip-removed", handleClipRemoved)
      apiClient.off("timeline-clip-updated", handleClipUpdated)
    }
  }, [isAuthenticated, selectedClipId])

  // Create a new clip
  const createClip = useCallback(
    async (name: string, start: number, length: number, color?: string) => {
      if (!isAuthenticated) {
        setError("Authentication required to create clips.")
        return null
      }
      try {
        const clipColor = color || generateDistinctColor(clips.map((c) => c.color))
        const newClipData = { name, start, length, color: clipColor }
        console.log("[useTimeline] Creating clip:", newClipData)

        // Optimistic update (optional, but good for UX)
        // const tempId = `temp-${Date.now()}`;
        // const optimisticClip = { ...newClipData, id: tempId };
        // setClips((prev) => [...prev, optimisticClip]);

        const newClip = await apiCreateTimelineClip(newClipData)
        console.log("[useTimeline] Clip created via API:", newClip)

        // Replace optimistic update or add if not using optimistic
        // setClips((prev) => prev.map(c => c.id === tempId ? newClip : c));
        // If not using optimistic:
        setClips((prev) => [...prev, newClip]) // This might be handled by WebSocket too

        setError(null)
        return newClip
      } catch (err: any) {
        console.error("[useTimeline] Failed to create clip:", err)
        setError(err.message || "Failed to create new clip")
        // Revert optimistic update if used
        // setClips((prev) => prev.filter(c => c.id !== tempId));
        return null // Indicate failure
      }
    },
    [clips, isAuthenticated],
  )

  // Update a clip
  const updateClip = useCallback(
    async (id: string, updates: Partial<Omit<TimelineClip, "id">>) => {
      if (!isAuthenticated) {
        setError("Authentication required to update clips.")
        return null
      }
      const originalClips = [...clips] // Store for potential revert
      try {
        console.log(`[useTimeline] Updating clip ${id}:`, updates)
        // Optimistic update
        setClips((prev) => prev.map((clip) => (clip.id === id ? { ...clip, ...updates } : clip)))

        const updatedClip = await apiUpdateTimelineClip(id, updates)
        console.log("[useTimeline] Clip updated via API:", updatedClip)
        // If WebSocket doesn't handle this, ensure local state is accurate
        // setClips((prev) => prev.map((clip) => (clip.id === id ? updatedClip : clip)));
        setError(null)
        return updatedClip
      } catch (err: any) {
        console.error(`[useTimeline] Failed to update clip ${id}:`, err)
        setError(err.message || `Failed to update clip`)
        setClips(originalClips) // Revert optimistic update
        return null
      }
    },
    [clips, isAuthenticated],
  )

  // Delete a clip
  const deleteClip = useCallback(
    async (id: string) => {
      if (!isAuthenticated) {
        setError("Authentication required to delete clips.")
        return false // Indicate failure
      }
      const originalClips = [...clips]
      try {
        console.log(`[useTimeline] Deleting clip ${id}`)
        // Optimistic update
        setClips((prev) => prev.filter((clip) => clip.id !== id))
        if (selectedClipId === id) {
          setSelectedClipId(null)
        }

        await apiDeleteTimelineClip(id)
        console.log("[useTimeline] Clip deleted via API")

        // If we deleted the last clip, create a default one (if authenticated)
        const remainingClips = originalClips.filter((clip) => clip.id !== id)
        if (remainingClips.length === 1 && originalClips.length > 0) {
          // Check if it was the last one
          if (clips.length === 0) {
            // Check current state after optimistic update
            console.log("[useTimeline] Last clip deleted, creating default clip.")
            await createDefaultClip()
          }
        }
        setError(null)
        return true // Indicate success
      } catch (err: any) {
        console.error(`[useTimeline] Failed to delete clip ${id}:`, err)
        setError(err.message || `Failed to delete clip`)
        setClips(originalClips) // Revert optimistic update
        return false
      }
    },
    [clips, selectedClipId, isAuthenticated, createDefaultClip],
  )

  // Reorder clips
  const reorderClips = useCallback(
    async (orderedIds: string[]) => {
      if (!isAuthenticated) {
        setError("Authentication required to reorder clips.")
        return null
      }
      const originalClips = [...clips]
      try {
        console.log("[useTimeline] Reordering clips:", orderedIds)
        const clipsMap = new Map(clips.map((clip) => [clip.id, clip]))
        const reordered = orderedIds.filter((id) => clipsMap.has(id)).map((id) => clipsMap.get(id)!)
        setClips(reordered) // Optimistic update

        const updatedClips = await apiReorderTimelineClips(orderedIds)
        console.log("[useTimeline] Clips reordered via API:", updatedClips)
        // If WebSocket doesn't handle this, ensure local state is accurate
        // setClips(updatedClips);
        setError(null)
        return updatedClips
      } catch (err: any) {
        console.error("[useTimeline] Failed to reorder clips:", err)
        setError(err.message || "Failed to reorder clips")
        setClips(originalClips) // Revert optimistic update
        return null
      }
    },
    [clips, isAuthenticated],
  )

  return {
    clips,
    isLoading,
    error,
    selectedClipId,
    setSelectedClipId,
    fetchClips, // Expose for manual refresh if needed
    createClip,
    updateClip,
    deleteClip,
    reorderClips,
    createDefaultClip, // Expose if needed externally
    isInitialized,
  }
}
