"use client"

import { useState, useEffect, useCallback } from "react"
import {
  getTransportState,
  startPlayback,
  stopPlayback,
  setPlayheadPosition,
  updateLoopState,
  updateBpm,
  updateTimeSignature,
  type TransportState as APITransportState,
} from "@/lib/api/transport-api" // Direct import of new API functions
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"

// Helper function to ensure the transport state has valid defaults
const ensureValidTransportStateDefaults = (state?: Partial<APITransportState> | null): TransportState => {
  const defaults: TransportState = {
    playheadPosition: 0,
    isPlaying: false,
    isLooping: false,
    loopRegion: null,
    bpm: 120,
    timeSignature: "4/4",
  }

  if (!state) {
    return defaults
  }

  return {
    playheadPosition: state.playheadPosition ?? defaults.playheadPosition,
    isPlaying: state.isPlaying ?? defaults.isPlaying,
    isLooping: state.isLooping ?? defaults.isLooping,
    loopRegion: state.loopRegion === undefined ? defaults.loopRegion : state.loopRegion,
    bpm: state.bpm ?? defaults.bpm,
    timeSignature:
      typeof state.timeSignature === "string" && state.timeSignature.trim() !== ""
        ? state.timeSignature
        : defaults.timeSignature,
  }
}

export interface TransportState extends APITransportState {}

export const useTransport = () => {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth()

  const [transportState, setTransportState] = useState<TransportState>(
    ensureValidTransportStateDefaults(null), // Initialize with defaults
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const _fetchTransportState = useCallback(async () => {
    if (!isAuthenticated) {
      console.log("HOOK (useTransport): Skipping fetchTransportState, user not authenticated.")
      setTransportState(ensureValidTransportStateDefaults(null)) // Reset to default
      setError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      console.log("HOOK (useTransport): Fetching transport state (User Authenticated)...")
      const rawState = await getTransportState() // Uses updated API
      const validatedState = ensureValidTransportStateDefaults(rawState)
      setTransportState(validatedState)
      console.log(
        "HOOK (useTransport): Transport state fetched successfully. Raw:",
        rawState,
        "Validated:",
        validatedState,
      )
    } catch (err: any) {
      let errorMessage = "Failed to fetch transport state"
      if (err instanceof Error) errorMessage = `${errorMessage}: ${err.message}`
      else if (typeof err === "string") errorMessage = `${errorMessage}: ${err}`
      else if (err && err.message) errorMessage = `${errorMessage}: ${err.message}`
      console.error("HOOK (useTransport): Transport state fetch failed:", errorMessage, err)
      setError(errorMessage)
      // Optionally, reset to defaults on fetch error if desired
      // setTransportState(ensureValidTransportStateDefaults(null));
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  const createApiCaller = useCallback(
    async <TArgs extends any[], TResult extends APITransportState | void>(
      actionName: string,
      apiMethod: (...args: TArgs) => Promise<TResult>,
      ...args: TArgs
    ): Promise<void> => {
      // Return type changed to Promise<void> as state is set internally
      if (!isAuthenticated) {
        const authError = `Authentication required to ${actionName}.`
        console.warn("HOOK (useTransport):", authError)
        setError(authError)
        return
      }
      setError(null)
      setIsLoading(true)
      try {
        console.log(`HOOK (useTransport): Calling ${actionName}...`, args)
        const result = await apiMethod(...args)
        if (result && typeof result === "object") {
          // Check if result is not void and is an object (TransportState)
          const validatedResult = ensureValidTransportStateDefaults(result as APITransportState)
          setTransportState(validatedResult)
          console.log(`HOOK (useTransport): ${actionName} successful. Raw:`, result, "Validated:", validatedResult)
        } else {
          // If API returns void or not an object, fetch the latest state
          console.log(`HOOK (useTransport): ${actionName} returned void or non-object, fetching latest state.`)
          await _fetchTransportState()
        }
      } catch (err: any) {
        const errorMessage = err.message || `Failed to ${actionName}`
        console.error(`HOOK (useTransport): ${actionName} failed:`, errorMessage, err)
        setError(errorMessage)
        // Do not re-throw, let the hook manage its error state
      } finally {
        setIsLoading(false)
      }
    },
    [isAuthenticated, _fetchTransportState],
  )

  const togglePlayback = useCallback(async () => {
    if (!isAuthenticated) return
    const action = transportState.isPlaying ? stopPlayback : startPlayback
    const actionName = transportState.isPlaying ? "stop playback" : "start playback"
    return createApiCaller(actionName, action)
  }, [createApiCaller, transportState.isPlaying, isAuthenticated])

  const seekPlayhead = useCallback(
    (position: number) => createApiCaller("seek playhead", setPlayheadPosition, position),
    [createApiCaller],
  )

  const toggleLooping = useCallback(async () => {
    if (!isAuthenticated) return
    // The updateLoopState API expects the new state, not just a toggle.
    // We get the current state and invert isLooping.
    // If loopRegion is null and we are turning looping ON, we might want to set a default loopRegion.
    // For now, we just toggle isLooping and pass the current loopRegion.
    // A more sophisticated implementation might involve opening a modal to define loopRegion if it's null.
    return createApiCaller("toggle looping", updateLoopState, !transportState.isLooping, transportState.loopRegion)
  }, [createApiCaller, transportState.isLooping, transportState.loopRegion, isAuthenticated])

  const setLoopRegion = useCallback(
    (region: { startBar: number; endBar: number } | null) => {
      // When setting a loop region, isLooping should typically become true.
      // If region is null, isLooping should become false.
      const newIsLooping = region !== null
      return createApiCaller("set loop region", updateLoopState, newIsLooping, region)
    },
    [createApiCaller],
  )

  const setBpm = useCallback((newBpm: number) => createApiCaller("set BPM", updateBpm, newBpm), [createApiCaller])

  const setTimeSignature = useCallback(
    (newTimeSignature: string) => createApiCaller("set time signature", updateTimeSignature, newTimeSignature),
    [createApiCaller],
  )

  // Effect for initial fetch and auth changes
  useEffect(() => {
    if (!isAuthLoading) {
      if (isAuthenticated) {
        _fetchTransportState()
      } else {
        setTransportState(ensureValidTransportStateDefaults(null)) // Reset to default
        setError(null)
        setIsLoading(false)
      }
    }
  }, [isAuthenticated, isAuthLoading, _fetchTransportState])

  // Effect for WebSocket updates
  useEffect(() => {
    const handleApiTransportUpdate = (newStateFromEvent: Partial<APITransportState> | null) => {
      if (isAuthenticated) {
        console.log("HOOK (useTransport): Received transport-update event", newStateFromEvent)
        const validatedState = ensureValidTransportStateDefaults(newStateFromEvent)
        setTransportState(validatedState)
      }
    }

    if (isAuthenticated) {
      apiClient.on("transport-update", handleApiTransportUpdate)
      console.log("HOOK (useTransport): Subscribed to transport-update event.")
    }

    return () => {
      apiClient.off("transport-update", handleApiTransportUpdate)
      console.log("HOOK (useTransport): Unsubscribed from transport-update event.")
    }
  }, [isAuthenticated]) // Re-subscribe if auth state changes

  // Effect for playhead polling when playing (fallback or primary if WS is not for playhead)
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (isAuthenticated && transportState.isPlaying) {
      // This polling is a fallback. If WebSocket 'transport-update' events are frequent
      // and include playheadPosition, this might be redundant or even conflicting.
      // Consider if WS updates are sufficient for playhead.
      // For now, assuming polling is desired for smoother UI updates of playhead.
      console.log("HOOK (useTransport): Starting playhead polling.")
      intervalId = setInterval(async () => {
        // Only update playhead position from a lighter fetch if available,
        // or merge with current state to avoid overwriting other rapidly changing states.
        // For simplicity, we refetch the whole state, but a dedicated playhead endpoint would be better.
        try {
          const rawState = await getTransportState() // Or a lighter getPlayheadPosition() API call
          if (rawState) {
            setTransportState((prevState) =>
              ensureValidTransportStateDefaults({
                ...prevState, // Keep local optimistic updates for other fields
                playheadPosition: rawState.playheadPosition, // Only update playhead from poll
                isPlaying: rawState.isPlaying, // Also update isPlaying, as polling stops if it becomes false
              }),
            )
          }
        } catch (pollError) {
          console.error("HOOK (useTransport): Playhead polling fetch failed:", pollError)
          // Optionally handle polling errors, e.g., stop polling after N failures
        }
      }, 1000) // Poll every second
    } else {
      if (intervalId) {
        console.log("HOOK (useTransport): Stopping playhead polling.")
        clearInterval(intervalId)
      }
    }

    return () => {
      if (intervalId) {
        console.log("HOOK (useTransport): Clearing playhead polling interval on unmount/re-effect.")
        clearInterval(intervalId)
      }
    }
  }, [isAuthenticated, transportState.isPlaying]) // Rerun if auth or playing state changes

  const refreshTransportState = useCallback(() => {
    if (!isAuthenticated) {
      console.warn("HOOK (useTransport): Cannot refresh transport state - User not authenticated.")
      setError("Authentication required to refresh transport state.")
      return Promise.resolve() // Return a resolved promise
    }
    return _fetchTransportState()
  }, [_fetchTransportState, isAuthenticated])

  return {
    transportState,
    isLoading: isLoading || isAuthLoading, // Combine general loading with auth loading
    error,
    togglePlayback,
    seekPlayhead,
    toggleLooping,
    setLoopRegion,
    setBpm,
    setTimeSignature,
    refreshTransportState,
  }
}
