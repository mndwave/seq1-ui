/**
 * Client-side utility for interacting with the SEQ1 API
 */

/**
 * Send a chat message to the SEQ1 orchestration engine
 * @param prompt The user's message or prompt
 * @returns The response and MIDI clip (base64 encoded)
 */
export async function sendChatMessage(prompt: string) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to process chat message")
    }

    return await response.json()
  } catch (error) {
    console.error("Error sending chat message:", error)
    throw error
  }
}

/**
 * Decode and play a base64-encoded MIDI clip
 * @param midiBase64 The base64-encoded MIDI data
 * @param deviceId Optional device ID to send the MIDI to
 */
export async function playMidiClip(midiBase64: string, deviceId?: string) {
  try {
    // In a real implementation, this would decode the MIDI and send it to the
    // appropriate device or Web MIDI API
    console.log(`Playing MIDI clip${deviceId ? ` on device ${deviceId}` : ""}`)

    // For now, we'll just log that we received the MIDI
    console.log("MIDI data received (base64):", midiBase64.substring(0, 50) + "...")

    // Mock successful playback
    return { success: true }
  } catch (error) {
    console.error("Error playing MIDI clip:", error)
    throw error
  }
}
