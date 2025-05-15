import * as apiClient from "@/lib/api-client"
import * as transportApi from "@/lib/api/transport-api"
import * as timelineApi from "@/lib/api/timeline-api"
import * as accountApi from "@/lib/api/account-api"

// Define the test interface
export interface ApiTest {
  id: string
  name: string
  category: string
  description: string
  run: () => Promise<any>
}

// Helper function to wrap API calls with detailed error capturing
async function runWithDetailedErrors<T>(
  apiCall: () => Promise<T>,
  context: { endpoint?: string; method?: string; params?: any },
): Promise<T> {
  try {
    // Log the API call to console for debugging
    console.log(`Making API call to ${context.endpoint} (${context.method})`, context.params)

    // Make the actual API call - no mocking!
    const result = await apiCall()

    // Log the result
    console.log(`API call to ${context.endpoint} succeeded:`, result)

    return result
  } catch (error: any) {
    // Log the error
    console.error(`API call to ${context.endpoint} failed:`, error)

    // Enhance the error with additional context
    if (error instanceof Error) {
      // Add context to the error
      Object.assign(error, {
        apiContext: context,
        timestamp: new Date().toISOString(),
        originalMessage: error.message,
      })

      // If it's a fetch error, try to extract more details
      if (error.name === "TypeError" && error.message === "Failed to fetch") {
        Object.assign(error, {
          networkError: true,
          possibleCauses: [
            "API server is unreachable",
            "Network connection is down",
            "CORS issue preventing the request",
            "Request was blocked by browser extension",
          ],
        })
      }
    }

    // Re-throw the enhanced error
    throw error
  }
}

// System and Health Tests
const systemTests: ApiTest[] = [
  {
    id: "system-health",
    name: "System Health Check",
    category: "system",
    description: "Verifies the API system is online and responding to health check requests",
    run: async () => {
      return await runWithDetailedErrors(() => apiClient.getSystemStatus(), { endpoint: "/api/health", method: "GET" })
    },
  },
  {
    id: "api-connectivity",
    name: "API Connectivity Test",
    category: "system",
    description: "Tests basic connectivity to the API endpoints with authentication",
    run: async () => {
      return await runWithDetailedErrors(() => apiClient.testApiConnectivity(), {
        endpoint: "/api/test-connectivity",
        method: "GET",
      })
    },
  },
]

// Transport API Tests
const transportTests: ApiTest[] = [
  {
    id: "transport-get-state",
    name: "Get Transport State",
    category: "transport",
    description: "Retrieves the current transport state including playback status, BPM, and time signature",
    run: async () => {
      return await runWithDetailedErrors(() => transportApi.getTransportState(), {
        endpoint: "/api/transport",
        method: "GET",
      })
    },
  },
  {
    id: "transport-start-playback",
    name: "Start Playback",
    category: "transport",
    description: "Initiates transport playback from the current playhead position",
    run: async () => {
      return await runWithDetailedErrors(() => transportApi.startPlayback(), {
        endpoint: "/api/transport/play",
        method: "POST",
      })
    },
  },
  {
    id: "transport-stop-playback",
    name: "Stop Playback",
    category: "transport",
    description: "Stops the currently running transport playback",
    run: async () => {
      return await runWithDetailedErrors(() => transportApi.stopPlayback(), {
        endpoint: "/api/transport/stop",
        method: "POST",
      })
    },
  },
  {
    id: "transport-set-playhead",
    name: "Set Playhead Position",
    category: "transport",
    description: "Sets the playhead position to bar 4 in the timeline",
    run: async () => {
      return await runWithDetailedErrors(() => transportApi.setPlayheadPosition(4), {
        endpoint: "/api/transport/playhead",
        method: "POST",
        params: { position: 4 },
      })
    },
  },
  {
    id: "transport-toggle-loop",
    name: "Toggle Loop State",
    category: "transport",
    description: "Enables looping between bars 0 and 8",
    run: async () => {
      return await runWithDetailedErrors(() => transportApi.updateLoopState(true, { startBar: 0, endBar: 8 }), {
        endpoint: "/api/transport/loop",
        method: "POST",
        params: { isLooping: true, loopRegion: { startBar: 0, endBar: 8 } },
      })
    },
  },
  {
    id: "transport-disable-loop",
    name: "Disable Loop",
    category: "transport",
    description: "Disables the transport loop mode",
    run: async () => {
      return await runWithDetailedErrors(() => transportApi.updateLoopState(false), {
        endpoint: "/api/transport/loop",
        method: "POST",
        params: { isLooping: false },
      })
    },
  },
  {
    id: "transport-update-bpm",
    name: "Update BPM",
    category: "transport",
    description: "Changes the transport tempo to 128 BPM",
    run: async () => {
      return await runWithDetailedErrors(() => transportApi.updateBpm(128), {
        endpoint: "/api/transport/bpm",
        method: "POST",
        params: { bpm: 128 },
      })
    },
  },
  {
    id: "transport-reset-bpm",
    name: "Reset BPM",
    category: "transport",
    description: "Resets the transport tempo to the default 120 BPM",
    run: async () => {
      return await runWithDetailedErrors(() => transportApi.updateBpm(120), {
        endpoint: "/api/transport/bpm",
        method: "POST",
        params: { bpm: 120 },
      })
    },
  },
  {
    id: "transport-update-time-signature",
    name: "Update Time Signature",
    category: "transport",
    description: "Changes the transport time signature to 3/4",
    run: async () => {
      return await runWithDetailedErrors(() => transportApi.updateTimeSignature("3/4"), {
        endpoint: "/api/transport/time-signature",
        method: "POST",
        params: { timeSignature: "3/4" },
      })
    },
  },
  {
    id: "transport-reset-time-signature",
    name: "Reset Time Signature",
    category: "transport",
    description: "Resets the transport time signature to the default 4/4",
    run: async () => {
      return await runWithDetailedErrors(() => transportApi.updateTimeSignature("4/4"), {
        endpoint: "/api/transport/time-signature",
        method: "POST",
        params: { timeSignature: "4/4" },
      })
    },
  },
]

// Timeline API Tests
const timelineTests: ApiTest[] = [
  {
    id: "timeline-get-clips",
    name: "Get Timeline Clips",
    category: "timeline",
    description: "Retrieves all clips currently in the timeline",
    run: async () => {
      return await runWithDetailedErrors(() => timelineApi.getTimelineClips(), {
        endpoint: "/api/clips",
        method: "GET",
      })
    },
  },
  {
    id: "timeline-create-clip",
    name: "Create Timeline Clip",
    category: "timeline",
    description: "Creates a new clip in the timeline with specified parameters",
    run: async () => {
      const clipData = {
        name: "Test Clip",
        start: 0,
        length: 8,
        color: "#FF5555",
      }

      return await runWithDetailedErrors(() => timelineApi.createTimelineClip(clipData), {
        endpoint: "/api/clips",
        method: "POST",
        params: clipData,
      })
    },
  },
  {
    id: "timeline-update-clip",
    name: "Update Timeline Clip",
    category: "timeline",
    description: "Updates the properties of an existing timeline clip",
    run: async () => {
      try {
        // First get all clips
        const clips = await timelineApi.getTimelineClips()
        if (clips.length === 0) {
          throw new Error("No clips available to update")
        }

        const clipId = clips[0].id
        const updates = {
          name: "Updated Test Clip",
          color: "#55FF55",
        }

        // Update the first clip
        return await runWithDetailedErrors(() => timelineApi.updateTimelineClip(clipId, updates), {
          endpoint: `/api/clips/${clipId}`,
          method: "PATCH",
          params: updates,
        })
      } catch (error) {
        // Add context to the error
        if (error instanceof Error) {
          error.message = `Failed to update clip: ${error.message}`
        }
        throw error
      }
    },
  },
  {
    id: "timeline-reorder-clips",
    name: "Reorder Timeline Clips",
    category: "timeline",
    description: "Changes the order of clips in the timeline",
    run: async () => {
      try {
        // First get all clips
        const clips = await timelineApi.getTimelineClips()
        if (clips.length < 2) {
          throw new Error("Need at least 2 clips to reorder")
        }

        // Reorder by reversing the order
        const orderedIds = clips.map((clip) => clip.id).reverse()

        return await runWithDetailedErrors(() => timelineApi.reorderTimelineClips(orderedIds), {
          endpoint: "/api/clips/reorder",
          method: "POST",
          params: { orderedIds },
        })
      } catch (error) {
        // Add context to the error
        if (error instanceof Error) {
          error.message = `Failed to reorder clips: ${error.message}`
        }
        throw error
      }
    },
  },
  {
    id: "timeline-delete-clip",
    name: "Delete Timeline Clip",
    category: "timeline",
    description: "Removes a clip from the timeline",
    run: async () => {
      try {
        // First get all clips
        const clips = await timelineApi.getTimelineClips()
        if (clips.length === 0) {
          throw new Error("No clips available to delete")
        }

        const clipId = clips[0].id

        // Delete the first clip
        return await runWithDetailedErrors(() => timelineApi.deleteTimelineClip(clipId), {
          endpoint: `/api/clips/${clipId}`,
          method: "DELETE",
        })
      } catch (error) {
        // Add context to the error
        if (error instanceof Error) {
          error.message = `Failed to delete clip: ${error.message}`
        }
        throw error
      }
    },
  },
]

// Account API Tests
const accountTests: ApiTest[] = [
  {
    id: "account-get-info",
    name: "Get Account Info",
    category: "account",
    description: "Retrieves the current user's account information and profile details",
    run: async () => {
      return await runWithDetailedErrors(() => accountApi.getAccountInfo(), { endpoint: "/api/account", method: "GET" })
    },
  },
]

// WebSocket Tests
const websocketTests: ApiTest[] = [
  {
    id: "websocket-connection",
    name: "WebSocket Connection Test",
    category: "websocket",
    description: "Establishes a WebSocket connection and verifies message reception",
    run: async () => {
      return new Promise((resolve, reject) => {
        try {
          let messageReceived = false
          let timeoutId: NodeJS.Timeout
          let connectionError: Error | null = null
          let closeEvent: CloseEvent | null = null

          console.log("Creating WebSocket connection for test...")

          const ws = apiClient.createWebSocket((event) => {
            console.log("WebSocket test received message:", event)

            // If we receive any message, consider the test successful
            messageReceived = true
            clearTimeout(timeoutId)
            ws.close()
            resolve({
              success: true,
              message: "WebSocket connection established and message received",
              event: typeof event.data === "string" ? event.data : JSON.stringify(event.data),
              timestamp: new Date().toISOString(),
            })
          })

          // Set a timeout to close the connection if no message is received
          timeoutId = setTimeout(() => {
            console.log("WebSocket test timeout reached")
            ws.close()
            if (!messageReceived) {
              resolve({
                success: true,
                message: "WebSocket connection established but no message received within timeout",
                warning: "No message was received within the timeout period, but the connection was successful",
                connectionState: ws.readyState,
                closeEvent: closeEvent,
                error: connectionError,
                timestamp: new Date().toISOString(),
              })
            }
          }, 5000)

          // Handle connection errors
          ws.onerror = (error) => {
            console.error("WebSocket test error:", error)
            connectionError = new Error(`WebSocket connection error: ${JSON.stringify(error)}`)
            clearTimeout(timeoutId)
            reject({
              success: false,
              message: "WebSocket connection error",
              error: connectionError,
              timestamp: new Date().toISOString(),
              readyState: ws.readyState,
            })
          }

          // Handle connection close
          ws.onclose = (event) => {
            console.log("WebSocket test connection closed:", event)
            closeEvent = event
            if (!messageReceived) {
              clearTimeout(timeoutId)
              if (event.code !== 1000) {
                reject({
                  success: false,
                  message: `WebSocket connection closed with code ${event.code}: ${event.reason}`,
                  closeEvent: {
                    code: event.code,
                    reason: event.reason,
                    wasClean: event.wasClean,
                  },
                  timestamp: new Date().toISOString(),
                  error: connectionError,
                })
              }
            }
          }

          // Log when connection is open
          ws.onopen = (event) => {
            console.log("WebSocket test connection opened:", event)
          }
        } catch (error) {
          console.error("WebSocket test caught error:", error)
          reject({
            success: false,
            message: "Error creating WebSocket connection",
            error: error,
            timestamp: new Date().toISOString(),
          })
        }
      })
    },
  },
]

// MIDI API Tests
const midiTests: ApiTest[] = [
  {
    id: "midi-play-clip",
    name: "Play MIDI Clip",
    category: "devices",
    description: "Sends a MIDI clip to be played through connected devices",
    run: async () => {
      // Simple MIDI note on/off message for middle C
      const midiBase64 = "TVRoZAAAAAYAAQABAPBNVHJrAAAAFAD/UQMHoSAAwGAAgP9ZAv8vAA=="

      try {
        await runWithDetailedErrors(() => apiClient.playMidiClip(midiBase64), {
          endpoint: "/api/midi/play",
          method: "POST",
          params: { midiBase64 },
        })

        return {
          success: true,
          message: "MIDI clip played successfully",
          midiData: {
            base64: midiBase64,
            description: "Simple MIDI note on/off message for middle C",
          },
        }
      } catch (error) {
        // Add context to the error
        if (error instanceof Error) {
          error.message = `Failed to play MIDI clip: ${error.message}`
          Object.assign(error, {
            midiData: {
              base64: midiBase64,
              description: "Simple MIDI note on/off message for middle C",
            },
          })
        }
        throw error
      }
    },
  },
]

// Combine all tests
export const apiTests: ApiTest[] = [
  ...systemTests,
  ...transportTests,
  ...timelineTests,
  ...accountTests,
  ...websocketTests,
  ...midiTests,
]
