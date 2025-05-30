"use client"

import { useState, useEffect, useCallback } from "react"
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

  const fetchTransportState = useCallback(async () => {
    if (!isAuthenticated) {
      console.log("🔴 HOOK (useTransport): Skipping fetchTransportState, user not authenticated.")
      setTransportState({
        // Reset to default if not authenticated
        playheadPosition: 0,
        isPlaying: false,
        isLooping: false,
        loopRegion: null,
        bpm: 120,
        timeSignature: "4/4",
      })
      setError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      console.log("🔴 HOOK (useTransport): Fetching transport state (User Authenticated)...")
      const state = await TransportAPI.getState() // Correct: Uses TransportAPI.getState()
      if (state) {
        setTransportState(state)
        console.log("🔴 HOOK (useTransport): Transport state fetched successfully:", state)
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
      let errorMessage = "Failed to fetch transport state"
      if (err instanceof Error) errorMessage = `${errorMessage}: ${err.message}`
      else if (typeof err === "string") errorMessage = `${errorMessage}: ${err}`
      else if (err && err.message) errorMessage = `${errorMessage}: ${err.message}`
      console.error("🔴 HOOK (useTransport): Transport state fetch failed:", errorMessage, err)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

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
    if (!isAuthLoading) {
      if (isAuthenticated) {
        fetchTransportState()
      } else {
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
      }
    }

    const handleApiTransportUpdate = (newState: TransportState) => {
      if (isAuthenticated) {
        setTransportState(newState)
      }
    }

    if (isAuthenticated) {
      apiClient.on("transport-update", handleApiTransportUpdate)
    }

    const pollInterval = 1000
    let intervalId: NodeJS.Timeout | null = null

    if (isAuthenticated && transportState.isPlaying) {
      intervalId = setInterval(() => {
        fetchTransportState().catch((err) => console.error("🔴 HOOK (useTransport): Polling fetch failed:", err))
      }, pollInterval)
    }

    return () => {
      apiClient.off("transport-update", handleApiTransportUpdate)
      if (intervalId) clearInterval(intervalId)
    }
  }, [fetchTransportState, isAuthenticated, isAuthLoading, transportState.isPlaying])

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
      ? fetchTransportState
      : async () => {
          console.warn("🔴 HOOK (useTransport): Cannot refresh transport state - User not authenticated.")
          setError("Authentication required to refresh transport state.")
        },
  }
}
