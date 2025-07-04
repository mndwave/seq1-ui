import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fix: Call correct backend endpoint with /api prefix
    const response = await fetch('http://127.0.0.1:5000/api/clips', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 401) {
      // Return empty clips array for anonymous users
      return NextResponse.json({
        clips: [],
        count: 0
      });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Clips API error:', error);
    // Return empty clips array on error
    return NextResponse.json({
      clips: [],
      count: 0
    });
  }
}
