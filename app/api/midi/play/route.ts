import type { NextRequest } from "next/server"

// Get the API key from environment variables (server-side only)
const API_KEY = process.env.SEQ1_API_KEY || ""
const API_BASE_URL = process.env.NEXT_PUBLIC_SEQ1_API_URL || "https://api.seq1.net"

export async function POST(request: NextRequest) {
  try {
    const { midiBase64, deviceId } = await request.json()

    // If no device ID is provided, just return success
    if (!deviceId) {
      return Response.json({ success: true })
    }

    // Send the MIDI data to the device using the server-side API key
    const response = await fetch(`${API_BASE_URL}/api/midi/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ deviceId, midiData: midiBase64 }),
    })

    const data = await response.json()

    if (!response.ok) {
      return Response.json(
        { success: false, message: data.message || "Failed to send MIDI data" },
        { status: response.status },
      )
    }

    return Response.json(data)
  } catch (error: any) {
    console.error("Error in MIDI play API route:", error)
    return Response.json({ success: false, message: error.message || "An error occurred" }, { status: 500 })
  }
}
