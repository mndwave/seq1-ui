import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Proxy to backend API
    const response = await fetch('http://localhost:5000/transport/status', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 401) {
      // Return default state for anonymous users
      return NextResponse.json({
        status: 'stopped',
        isPlaying: false,
        isLooping: false,
        bpm: 120,
        timeSignature: '4/4',
        playheadPosition: 0
      });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Return default state on error
    return NextResponse.json({
      status: 'stopped',
      isPlaying: false,
      isLooping: false,
      bpm: 120,
      timeSignature: '4/4',
      playheadPosition: 0
    });
  }
}
