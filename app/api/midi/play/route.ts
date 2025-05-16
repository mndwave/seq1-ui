import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json()
    const { midiBase64, deviceId } = body

    if (!midiBase64) {
      return NextResponse.json({ error: "Missing MIDI data" }, { status: 400 })
    }

    // Get API URL from server-side environment variable
    const apiUrl = process.env.SEQ1_API_URL

    if (!apiUrl) {
      return NextResponse.json({ error: "API URL not configured" }, { status: 500 })
    }

    // Get API key from server-side environment variable
    const apiKey = process.env.SEQ1_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Prepare request body
    const requestBody: any = {
      midi_base64: midiBase64,
    }

    // Add device ID if provided
    if (deviceId) {
      requestBody.device_id = deviceId
    }

    // Send request to API
    const response = await fetch(`${apiUrl}/api/midi/play`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    // Check response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        {
          error: "Failed to play MIDI clip",
          status: response.status,
          details: errorData,
        },
        { status: response.status },
      )
    }

    // Return success
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error playing MIDI clip:", error)
    return NextResponse.json(
      {
        error: "Error playing MIDI clip",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
