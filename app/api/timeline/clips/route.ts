import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Proxy to backend API
    const response = await fetch('http://localhost:5000/clips', {
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
    // Return empty clips array on error
    return NextResponse.json({
      clips: [],
      count: 0
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Proxy to backend API
    const response = await fetch('http://localhost:5000/clips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    if (response.status === 401) {
      return NextResponse.json(
        { error: 'Authentication required' }, 
        { status: 401 }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create clip' }, 
      { status: 500 }
    );
  }
}
