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
  isTransportApiAvailable,
  type TransportState,
} from "@/lib/api/transport-api"

export function useTransport() {
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
  const [isOffline, setIsOffline] = useState(false)
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null)

  // Check if API is available
  const checkApiAvailability = useCallback(async () => {
    try {
      const available = await isTransportApiAvailable()
      setApiAvailable(available)
      if (!available) {
        setIsOffline(true)
        setError("Transport API is not available")
      } else {
        setIsOffline(false)
        setError(null)
      }
    } catch (err) {
      setApiAvailable(false)
      setIsOffline(true)
      setError("Failed to check API availability")
    }
  }, [])

  // Fetch transport state
  const fetchTransportState = useCallback(async () => {
    try {
      setIsLoading(true)
      const state = await getTransportState()
      setTransportState(state)
      setError(null)
      setIsOffline(false)
      setApiAvailable(true)
    } catch (err) {
      console.warn("Failed to fetch transport state, using default:", err)
      // Don't set error state, just use default values
      setIsOffline(true)
      setApiAvailable(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load transport state on mount
  useEffect(() => {
    // Check API availability first
    checkApiAvailability().then(() => {
      // Then fetch transport state
      fetchTransportState()
    })

    // Set up polling for transport state updates (only if API is available)
    const intervalId = setInterval(() => {
      if (transportState.isPlaying && !isOffline && apiAvailable) {
        fetchTransportState()
      }
    }, 1000) // Poll every second when playing and online

    return () => clearInterval(intervalId)
  }, [fetchTransportState, checkApiAvailability, transportState.isPlaying, isOffline, apiAvailable])

  // Toggle play/pause
  const togglePlayback = useCallback(async () => {
    try {
      const newState = transportState.isPlaying ? await stopPlayback() : await startPlayback()
      setTransportState(newState)
      setError(null)
    } catch (err) {
      console.warn("Failed to toggle playback via API, updating local state:", err)
      // Update local state to provide immediate feedback
      setTransportState((prev) => ({
        ...prev,
        isPlaying: !prev.isPlaying,
      }))
    }
  }, [transportState.isPlaying])

  // Set playhead position
  const seekPlayhead = useCallback(async (position: number) => {
    try {
      const newState = await setPlayheadPosition(position)
      setTransportState(newState)
      setError(null)
    } catch (err) {
      console.warn("Failed to set playhead position via API, updating local state:", err)
      // Update local state to provide immediate feedback
      setTransportState((prev) => ({
        ...prev,
        playheadPosition: position,
      }))
    }
  }, [])

  // Toggle loop state
  const toggleLooping = useCallback(async () => {
    try {
      const newState = await updateLoopState(!transportState.isLooping)
      setTransportState(newState)
      setError(null)
    } catch (err) {
      console.warn("Failed to toggle looping via API, updating local state:", err)
      // Update local state to provide immediate feedback
      setTransportState((prev) => ({
        ...prev,
        isLooping: !prev.isLooping,
      }))
    }
  }, [transportState.isLooping])

  // Set loop region
  const setLoopRegion = useCallback(
    async (loopRegion: { startBar: number; endBar: number } | null) => {
      try {
        const newState = await updateLoopState(transportState.isLooping, loopRegion)
        setTransportState(newState)
        setError(null)
      } catch (err) {
        console.warn("Failed to set loop region via API, updating local state:", err)
        // Update local state to provide immediate feedback
        setTransportState((prev) => ({
          ...prev,
          loopRegion,
        }))
      }
    },
    [transportState.isLooping],
  )

  // Set BPM
  const setBpm = useCallback(async (bpm: number) => {
    try {
      const newState = await updateBpm(bpm)
      setTransportState(newState)
      setError(null)
    } catch (err) {
      console.warn("Failed to set BPM via API, updating local state:", err)
      // Update local state to provide immediate feedback
      setTransportState((prev) => ({
        ...prev,
        bpm,
      }))
    }
  }, [])

  // Set time signature
  const setTimeSignature = useCallback(async (timeSignature: string) => {
    try {
      const newState = await updateTimeSignature(timeSignature)
      setTransportState(newState)
      setError(null)
    } catch (err) {
      console.warn("Failed to set time signature via API, updating local state:", err)
      // Update local state to provide immediate feedback
      setTransportState((prev) => ({
        ...prev,
        timeSignature,
      }))
    }
  }, [])

  return {
    transportState,
    isLoading,
    error,
    isOffline,
    apiAvailable,
    togglePlayback,
    seekPlayhead,
    toggleLooping,
    setLoopRegion,
    setBpm,
    setTimeSignature,
    refreshTransportState: fetchTransportState,
    checkApiAvailability,
  }
}
