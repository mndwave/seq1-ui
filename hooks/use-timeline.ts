"use client"

import { useState, useEffect, useCallback } from "react"
import type { TimelineClip } from "@/lib/timeline-clip-schema"
import {
  getTimelineClips,
  createTimelineClip,
  updateTimelineClip,
  deleteTimelineClip,
  reorderTimelineClips,
} from "@/lib/api/timeline-api"
import { generateDistinctColor, getBalancedVibrantColors } from "@/lib/color-utils"

export function useTimeline() {
  const [clips, setClips] = useState<TimelineClip[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Constants
  const DEFAULT_CLIP_LENGTH = 16 // 4 bars * 4 beats per bar

  // Create a default clip
  const createDefaultClip = useCallback(async () => {
    try {
      // Get a vibrant color for the default clip
      const colors = getBalancedVibrantColors(1)

      // Create a default clip starting at bar 1 (beat 4) with length of 4 bars
      const defaultClip = await createTimelineClip({
        name: "Section 01",
        start: 4, // Start at bar 1 (beat 4)
        length: DEFAULT_CLIP_LENGTH, // 4 bars (16 beats)
        color: colors[0],
      })

      setClips([defaultClip])
      return defaultClip
    } catch (err) {
      console.error("Failed to create default clip:", err)
      setError("Failed to create default clip")
      throw err
    }
  }, [])

  // Fetch all clips
  const fetchClips = useCallback(async () => {
    try {
      setIsLoading(true)
      const fetchedClips = await getTimelineClips()

      // If no clips exist and we haven't initialized yet, create a default clip
      if (fetchedClips.length === 0 && !isInitialized) {
        await createDefaultClip()
        setIsInitialized(true)
      } else {
        setClips(fetchedClips)
        setIsInitialized(true)
      }

      setError(null)
    } catch (err) {
      console.error("Failed to fetch timeline clips:", err)
      setError("Failed to load timeline data")
    } finally {
      setIsLoading(false)
    }
  }, [createDefaultClip, isInitialized])

  // Load clips on mount
  useEffect(() => {
    fetchClips()
  }, [fetchClips])

  // Create a new clip
  const createClip = useCallback(
    async (name: string, start: number, length: number, color?: string) => {
      try {
        // Generate a color if not provided
        const clipColor = color || generateDistinctColor(clips.map((c) => c.color))

        const newClip = await createTimelineClip({
          name,
          start,
          length,
          color: clipColor,
        })

        // Update local state with the new clip
        setClips((prev) => [...prev, newClip])

        // Return the newly created clip
        return newClip
      } catch (err) {
        console.error("Failed to create clip:", err)
        setError("Failed to create new clip")
        throw err
      }
    },
    [clips],
  )

  // Update a clip
  const updateClip = useCallback(
    async (id: string, updates: Partial<Omit<TimelineClip, "id">>) => {
      try {
        // Update local state optimistically
        setClips((prev) => prev.map((clip) => (clip.id === id ? { ...clip, ...updates } : clip)))

        // Call API to persist changes
        const updatedClip = await updateTimelineClip(id, updates)
        return updatedClip
      } catch (err) {
        console.error(`Failed to update clip ${id}:`, err)
        setError(`Failed to update clip`)

        // Revert local state on error
        fetchClips()
        throw err
      }
    },
    [fetchClips],
  )

  // Delete a clip
  const deleteClip = useCallback(
    async (id: string) => {
      try {
        // Update local state optimistically
        setClips((prev) => prev.filter((clip) => clip.id !== id))

        // If the deleted clip was selected, clear selection
        if (selectedClipId === id) {
          setSelectedClipId(null)
        }

        // Call API to persist deletion
        await deleteTimelineClip(id)

        // If we deleted the last clip, create a default one
        const remainingClips = clips.filter((clip) => clip.id !== id)
        if (remainingClips.length === 0) {
          await createDefaultClip()
        }
      } catch (err) {
        console.error(`Failed to delete clip ${id}:`, err)
        setError(`Failed to delete clip`)

        // Revert local state on error
        fetchClips()
        throw err
      }
    },
    [fetchClips, selectedClipId, clips, createDefaultClip],
  )

  // Reorder clips
  const reorderClips = useCallback(
    async (orderedIds: string[]) => {
      try {
        // Get current clips map for reordering
        const clipsMap = new Map(clips.map((clip) => [clip.id, clip]))

        // Create reordered array for optimistic update
        const reordered = orderedIds.filter((id) => clipsMap.has(id)).map((id) => clipsMap.get(id)!)

        // Update local state optimistically
        setClips(reordered)

        // Call API to persist reordering
        await reorderTimelineClips(orderedIds)
      } catch (err) {
        console.error("Failed to reorder clips:", err)
        setError("Failed to reorder clips")

        // Revert local state on error
        fetchClips()
        throw err
      }
    },
    [clips, fetchClips],
  )

  return {
    clips,
    isLoading,
    error,
    selectedClipId,
    setSelectedClipId,
    fetchClips,
    createClip,
    updateClip,
    deleteClip,
    reorderClips,
    createDefaultClip,
  }
}
