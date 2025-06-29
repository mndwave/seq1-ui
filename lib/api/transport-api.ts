/**
 * CANONICAL TRANSPORT API - Direct connection to comprehensive backend
 */

import { canonicalApi } from './canonical-client'

export interface TransportState {
  playheadPosition: number
  isPlaying: boolean
  isLooping: boolean
  loopRegion: { startBar: number; endBar: number } | null
  bpm: number
  timeSignature: string
}

export async function getTransportStatus(): Promise<TransportState | null> {
  console.log('🎵 CANONICAL API: Fetching transport status...')
  const response = await canonicalApi.transportStatus()
  
  if (response.error) {
    console.error('🚨 Transport status error:', response.error)
    if (response.status === 401) throw new Error('AUTHENTICATION_REQUIRED')
    return null
  }
  
  return response.data as TransportState
}

export async function startPlayback(): Promise<TransportState | null> {
  console.log('🎵 CANONICAL API: Starting playback...')
  const response = await canonicalApi.transportPlay()
  
  if (response.error) {
    console.error('🚨 Playback start error:', response.error)
    if (response.status === 401) throw new Error('AUTHENTICATION_REQUIRED')
    return null
  }
  
  return response.data as TransportState
}

export async function stopPlayback(): Promise<TransportState | null> {
  console.log('🎵 CANONICAL API: Stopping playback...')
  const response = await canonicalApi.transportStop()
  
  if (response.error) {
    console.error('🚨 Playback stop error:', response.error)
    if (response.status === 401) throw new Error('AUTHENTICATION_REQUIRED')
    return null
  }
  
  return response.data as TransportState
}
