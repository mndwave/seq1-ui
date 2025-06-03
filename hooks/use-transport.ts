"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { TransportAPI } from "@/lib/api-services" // Correct: Uses TransportAPI
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import type { TransportState as APITransportState } from "@/lib/api/transport-api" // Assuming this type is correct

export interface TransportState extends APITransportState {}

export const useTransport = () => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()

  const [transportState, setTransportState] = useState<TransportState>({
    playheadPosition: 0,
    isPlaying: false,
    isLooping: false,
    loopRegion: null,
    bpm: 120,
    timeSignature: "4/4",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Add refs to prevent infinite loops
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const retryCountRef = useRef(0)
  const lastFetchTimeRef = useRef(0)
  const mountedRef = useRef(true)

  // Maximum retry attempts before giving up
  const MAX_RETRIES = 3
  const FETCH_DEBOUNCE_MS = 1000 // Minimum time between fetches
  const RETRY_DELAY_MS = 5000 // Delay before retry on error

  const fetchTransportState = useCallback(async (forceRefresh = false) => {
    // Prevent fetch if not authenticated
    if (!isAuthenticated) {
      console.log("🔴 HOOK (useTransport): Skipping fetchTransportState, user not authenticated.")
      setTransportState({
        playheadPosition: 0,
        isPlaying: false,
        isLooping: false,
        loopRegion: null,
        bpm: 120,
        timeSignature: "4/4",
      })
      setError(null)
      setIsLoading(false)
      retryCountRef.current = 0
      return
    }

    // Debounce: prevent too frequent fetches
    const now = Date.now()
    if (!forceRefresh && (now - lastFetchTimeRef.current) < FETCH_DEBOUNCE_MS) {
      return
    }
    lastFetchTimeRef.current = now

    // Check if component is still mounted
    if (!mountedRef.current) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log("🔴 HOOK (useTransport): Fetching transport state (User Authenticated)...")
      
      // Add timeout to the API call
      const fetchPromise = TransportAPI.getState()
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), 5000) // 5 second timeout
      })
      
      const state = await Promise.race([fetchPromise, timeoutPromise])
      
      if (!mountedRef.current) return // Check if still mounted after async operation
      
      if (state) {
        setTransportState(state)
        console.log("🔴 HOOK (useTransport): Transport state fetched successfully:", state)
        retryCountRef.current = 0 // Reset retry count on success
      } else {
        console.warn("🔴 HOOK (useTransport): Fetched transport state is null/undefined, resetting to default.")
        setTransportState({
          playheadPosition: 0,
          isPlaying: false,
          isLooping: false,
          loopRegion: null,
          bpm: 120,
          timeSignature: "4/4",
        })
      }
    } catch (err: any) {
      if (!mountedRef.current) return
      
      retryCountRef.current++
      
      let errorMessage = "Failed to fetch transport state"
      if (err instanceof Error) errorMessage = `${errorMessage}: ${err.message}`
      else if (typeof err === "string") errorMessage = `${errorMessage}: ${err}`
      else if (err && err.message) errorMessage = `${errorMessage}: ${err.message}`
      
      console.error("🔴 HOOK (useTransport): Transport state fetch failed:", errorMessage, err)
      
      // Only set error if we've exceeded max retries
      if (retryCountRef.current >= MAX_RETRIES) {
        setError(errorMessage)
        console.error(`🔴 HOOK (useTransport): Max retries (${MAX_RETRIES}) exceeded, giving up`)
      } else {
        console.warn(`🔴 HOOK (useTransport): Retry attempt ${retryCountRef.current}/${MAX_RETRIES} in ${RETRY_DELAY_MS}ms`)
        // Schedule a retry with exponential backoff
        if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current)
        fetchTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current && isAuthenticated) {
            fetchTransportState(true)
          }
        }, RETRY_DELAY_MS * retryCountRef.current)
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [isAuthenticated]) // Only depend on isAuthenticated

  const createApiCaller = useCallback(
    async <TArgs extends any[], TResult extends TransportState | void>(
      actionName: string,
      apiMethod: (...args: TArgs) => Promise<TResult>,
      ...args: TArgs
    ): Promise<TResult | void> => {
      if (!isAuthenticated) {
        const authError = `Authentication required to ${actionName}.`
        console.warn("🔴 HOOK (useTransport):", authError)
        setError(authError)
        return
      }
      setError(null)
      setIsLoading(true)
      try {
        console.log(`🔴 HOOK (useTransport): Calling ${actionName}...`, args)
        const result = await apiMethod(...args)
        if (result) {
          // Check if result is not void
          setTransportState(result as TransportState) // Update state only if result is TransportState
        }
        console.log(`🔴 HOOK (useTransport): ${actionName} successful:`, result)
        return result
      } catch (err: any) {
        const errorMessage = err.message || `Failed to ${actionName}`
        console.error(`🔴 HOOK (useTransport): ${actionName} failed:`, errorMessage, err)
        setError(errorMessage)
        throw err // Re-throw to allow components to handle if needed
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated],
  )

  const togglePlayback = useCallback(
    () => createApiCaller("toggle playback", TransportAPI.togglePlayback),
    [createApiCaller],
  )
  const seekPlayhead = useCallback(
    (position: number) => createApiCaller("seek playhead", TransportAPI.setPlayheadPosition, position),
    [createApiCaller],
  )
  const toggleLooping = useCallback(
    () => createApiCaller("toggle looping", TransportAPI.toggleLooping),
    [createApiCaller],
  )
  const setLoopRegion = useCallback(
    (region: { startBar: number; endBar: number } | null) =>
      createApiCaller("set loop region", TransportAPI.setLoopRegion, region),
    [createApiCaller],
  )
  const setBpm = useCallback(
    (newBpm: number) => createApiCaller("set BPM", TransportAPI.setBpm, newBpm),
    [createApiCaller],
  )
  const setTimeSignature = useCallback(
    (newTimeSignature: string) =>
      createApiCaller("set time signature", TransportAPI.setTimeSignature, newTimeSignature),
    [createApiCaller],
  )

  useEffect(() => {
    mountedRef.current = true // Set mounted on mount

    // Clear any existing timeouts
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current)
      fetchTimeoutRef.current = null
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }

    // Only fetch if auth is not loading
    if (!isAuthLoading) {
      if (isAuthenticated) {
        // Initial fetch with a small delay to prevent rapid calls
        fetchTimeoutRef.current = setTimeout(() => {
          if (mountedRef.current) {
            fetchTransportState(true)
          }
        }, 100)
      } else {
        // Reset state when not authenticated
        setTransportState({
          playheadPosition: 0,
          isPlaying: false,
          isLooping: false,
          loopRegion: null,
          bpm: 120,
          timeSignature: "4/4",
        })
        setError(null)
        setIsLoading(false)
        retryCountRef.current = 0
      }
    }

    const handleApiTransportUpdate = (newState: TransportState) => {
      if (isAuthenticated && mountedRef.current) {
        setTransportState(newState)
      }
    }

    // Set up event listener only if authenticated
    if (isAuthenticated) {
      apiClient.on("transport-update", handleApiTransportUpdate)
    }

    // Set up polling only if playing and authenticated
    const pollInterval = 5000 // Reduce polling frequency to 5 seconds
    if (isAuthenticated && transportState.isPlaying) {
      pollIntervalRef.current = setInterval(() => {
        if (mountedRef.current && isAuthenticated) {
          fetchTransportState(false).catch((err) => {
            console.error("🔴 HOOK (useTransport): Polling fetch failed:", err)
          })
        }
      }, pollInterval)
    }

    // Cleanup function
    return () => {
      mountedRef.current = false // Mark as unmounted
      
      // Clean up timeouts and intervals
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
        fetchTimeoutRef.current = null
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
      
      // Remove event listener
      apiClient.off("transport-update", handleApiTransportUpdate)
    }
  }, [isAuthenticated, isAuthLoading, fetchTransportState]) // Stable dependencies

  return {
    transportState,
    isLoading: isLoading || isAuthLoading,
    error,
    togglePlayback,
    seekPlayhead,
    toggleLooping,
    setLoopRegion,
    setBpm,
    setTimeSignature,
    refreshTransportState: isAuthenticated
      ? () => fetchTransportState(true)
      : async () => {
          console.warn("🔴 HOOK (useTransport): Cannot refresh transport state - User not authenticated.")
          setError("Authentication required to refresh transport state.")
        },
  }
}
