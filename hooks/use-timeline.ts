"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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

  // Add refs to prevent infinite loops and manage timeouts
  const mountedRef = useRef(true)
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)
  const lastFetchTimeRef = useRef(0)

  // Constants for debouncing and retry logic
  const MAX_RETRIES = 3
  const FETCH_DEBOUNCE_MS = 1000
  const RETRY_DELAY_MS = 3000
  const API_TIMEOUT_MS = 10000

  // Constants
  const DEFAULT_CLIP_LENGTH = 16 // 4 bars * 4 beats per bar

  // Create a default clip with timeout and error handling
  const createDefaultClip = useCallback(async () => {
    if (!mountedRef.current) return null

    try {
      setError(null)
      
      // Get a vibrant color for the default clip
      const colors = getBalancedVibrantColors(1)

      // Add timeout to the API call
      const createPromise = createTimelineClip({
        name: "Section 01",
        start: 4, // Start at bar 1 (beat 4)
        length: DEFAULT_CLIP_LENGTH, // 4 bars (16 beats)
        color: colors[0],
      })

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Create clip timeout")), API_TIMEOUT_MS)
      })

      const defaultClip = await Promise.race([createPromise, timeoutPromise])

      if (mountedRef.current) {
        setClips([defaultClip])
        return defaultClip
      }
    } catch (err: any) {
      console.error("Failed to create default clip:", err)
      if (mountedRef.current) {
        setError("Failed to create default clip")
      }
      throw err
    }
  }, [])

  // Fetch all clips with timeout and retry logic
  const fetchClips = useCallback(async (forceRefresh = false) => {
    // Debounce: prevent too frequent fetches
    const now = Date.now()
    if (!forceRefresh && (now - lastFetchTimeRef.current) < FETCH_DEBOUNCE_MS) {
      return
    }
    lastFetchTimeRef.current = now

    if (!mountedRef.current) return

    try {
      setIsLoading(true)
      setError(null)

      // Add timeout to the fetch
      const fetchPromise = getTimelineClips()
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Fetch clips timeout")), API_TIMEOUT_MS)
      })

      const fetchedClips = await Promise.race([fetchPromise, timeoutPromise])

      if (!mountedRef.current) return

      // If no clips exist and we haven't initialized yet, create a default clip
      if (fetchedClips.length === 0 && !isInitialized) {
        await createDefaultClip()
        setIsInitialized(true)
      } else {
        setClips(fetchedClips)
        setIsInitialized(true)
      }

      retryCountRef.current = 0 // Reset retry count on success
      setError(null)
    } catch (err: any) {
      if (!mountedRef.current) return

      retryCountRef.current++
      console.error("Failed to fetch timeline clips:", err)

      // Only set error if we've exceeded max retries
      if (retryCountRef.current >= MAX_RETRIES) {
        setError("Failed to load timeline data")
        console.error(`Timeline fetch: Max retries (${MAX_RETRIES}) exceeded`)
      } else {
        console.warn(`Timeline fetch: Retry attempt ${retryCountRef.current}/${MAX_RETRIES} in ${RETRY_DELAY_MS}ms`)
        // Schedule a retry
        if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current)
        fetchTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            fetchClips(true)
          }
        }, RETRY_DELAY_MS * retryCountRef.current)
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [createDefaultClip, isInitialized])

  // Load clips on mount with controlled initialization
  useEffect(() => {
    mountedRef.current = true

    // Clear any existing timeouts
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current)
      fetchTimeoutRef.current = null
    }

    // Initial fetch with a small delay to prevent rapid calls
    fetchTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        fetchClips(true)
      }
    }, 100)

    // Cleanup function
    return () => {
      mountedRef.current = false
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
        fetchTimeoutRef.current = null
      }
    }
  }, []) // Empty dependency array - only run on mount

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
