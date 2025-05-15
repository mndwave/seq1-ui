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
  const [isOffline, setIsOffline] = useState(false)

  // Fetch transport state
  const fetchTransportState = useCallback(async () => {
    try {
      setIsLoading(true)
      const state = await getTransportState()
      setTransportState(state)
      setError(null)
      setIsOffline(false)
    } catch (err) {
      console.error("Failed to fetch transport state:", err)
      setError("Failed to load transport state")
      setIsOffline(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load transport state on mount
  useEffect(() => {
    fetchTransportState()

    // Set up polling for transport state updates
    const intervalId = setInterval(() => {
      if (transportState.isPlaying && !isOffline) {
        fetchTransportState()
      }
    }, 1000) // Poll every second when playing and online

    return () => clearInterval(intervalId)
  }, [fetchTransportState, transportState.isPlaying, isOffline])

  // Toggle play/pause
  const togglePlayback = useCallback(async () => {
    try {
      const newState = transportState.isPlaying ? await stopPlayback() : await startPlayback()
      setTransportState(newState)
      setError(null)
    } catch (err) {
      console.error("Failed to toggle playback:", err)
      setError("Failed to toggle playback")
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
      console.error("Failed to set playhead position:", err)
      setError("Failed to set playhead position")
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
      console.error("Failed to toggle looping:", err)
      setError("Failed to toggle looping")
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
        console.error("Failed to set loop region:", err)
        setError("Failed to set loop region")
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
      console.error("Failed to set BPM:", err)
      setError("Failed to set BPM")
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
      console.error("Failed to set time signature:", err)
      setError("Failed to set time signature")
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
    togglePlayback,
    seekPlayhead,
    toggleLooping,
    setLoopRegion,
    setBpm,
    setTimeSignature,
    refreshTransportState: fetchTransportState,
  }
}
