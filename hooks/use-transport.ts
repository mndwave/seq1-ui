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

  // Fetch transport state - NO FALLBACKS
  const fetchTransportState = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      console.log("🔴 HOOK: Fetching transport state...")
      const state = await getTransportState()
      setTransportState(state)
      console.log("🔴 HOOK: Transport state fetched successfully:", state)
    } catch (err) {
      console.error("🔴 HOOK: Transport state fetch failed:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch transport state")
      throw err // Re-throw to let components handle the error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load transport state on mount - NO FALLBACKS
  useEffect(() => {
    fetchTransportState()

    // Set up polling for transport state updates when playing
    const intervalId = setInterval(() => {
      if (transportState.isPlaying) {
        fetchTransportState().catch(console.error)
      }
    }, 1000) // Poll every second when playing

    return () => clearInterval(intervalId)
  }, [fetchTransportState, transportState.isPlaying])

  // Toggle play/pause - NO FALLBACKS
  const togglePlayback = useCallback(async () => {
    try {
      setError(null)
      console.log("🔴 HOOK: Toggling playback...")
      const newState = transportState.isPlaying ? await stopPlayback() : await startPlayback()
      setTransportState(newState)
      console.log("🔴 HOOK: Playback toggled successfully:", newState)
    } catch (err) {
      console.error("🔴 HOOK: Playback toggle failed:", err)
      setError(err instanceof Error ? err.message : "Failed to toggle playback")
      throw err // Re-throw to let components handle the error
    }
  }, [transportState.isPlaying])

  // Set playhead position - NO FALLBACKS
  const seekPlayhead = useCallback(async (position: number) => {
    try {
      setError(null)
      console.log("🔴 HOOK: Seeking playhead to:", position)
      const newState = await setPlayheadPosition(position)
      setTransportState(newState)
      console.log("🔴 HOOK: Playhead seek successful:", newState)
    } catch (err) {
      console.error("🔴 HOOK: Playhead seek failed:", err)
      setError(err instanceof Error ? err.message : "Failed to set playhead position")
      throw err // Re-throw to let components handle the error
    }
  }, [])

  // Toggle loop state - NO FALLBACKS
  const toggleLooping = useCallback(async () => {
    try {
      setError(null)
      console.log("🔴 HOOK: Toggling loop state...")
      const newState = await updateLoopState(!transportState.isLooping)
      setTransportState(newState)
      console.log("🔴 HOOK: Loop toggle successful:", newState)
    } catch (err) {
      console.error("🔴 HOOK: Loop toggle failed:", err)
      setError(err instanceof Error ? err.message : "Failed to toggle looping")
      throw err // Re-throw to let components handle the error
    }
  }, [transportState.isLooping])

  // Set loop region - NO FALLBACKS
  const setLoopRegion = useCallback(
    async (loopRegion: { startBar: number; endBar: number } | null) => {
      try {
        setError(null)
        console.log("🔴 HOOK: Setting loop region:", loopRegion)
        const newState = await updateLoopState(transportState.isLooping, loopRegion)
        setTransportState(newState)
        console.log("🔴 HOOK: Loop region set successfully:", newState)
      } catch (err) {
        console.error("🔴 HOOK: Loop region set failed:", err)
        setError(err instanceof Error ? err.message : "Failed to set loop region")
        throw err // Re-throw to let components handle the error
      }
    },
    [transportState.isLooping],
  )

  // Set BPM - NO FALLBACKS
  const setBpm = useCallback(async (bpm: number) => {
    try {
      setError(null)
      console.log("🔴 HOOK: Setting BPM to:", bpm)
      const newState = await updateBpm(bpm)
      setTransportState(newState)
      console.log("🔴 HOOK: BPM set successfully:", newState)
    } catch (err) {
      console.error("🔴 HOOK: BPM set failed:", err)
      setError(err instanceof Error ? err.message : "Failed to set BPM")
      throw err // Re-throw to let components handle the error
    }
  }, [])

  // Set time signature - NO FALLBACKS
  const setTimeSignature = useCallback(async (timeSignature: string) => {
    try {
      setError(null)
      console.log("🔴 HOOK: Setting time signature to:", timeSignature)
      const newState = await updateTimeSignature(timeSignature)
      setTransportState(newState)
      console.log("🔴 HOOK: Time signature set successfully:", newState)
    } catch (err) {
      console.error("🔴 HOOK: Time signature set failed:", err)
      setError(err instanceof Error ? err.message : "Failed to set time signature")
      throw err // Re-throw to let components handle the error
    }
  }, [])

  return {
    transportState,
    isLoading,
    error,
    togglePlayback,
    seekPlayhead,
    toggleLooping,
    setLoopRegion,
    setBpm,
    setTimeSignature,
    refreshTransportState: fetchTransportState,
  }
}
