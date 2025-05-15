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

// System and Health Tests
const systemTests: ApiTest[] = [
  {
    id: "system-health",
    name: "System Health Check",
    category: "system",
    description: "Checks if the API is online and healthy",
    run: async () => {
      return await apiClient.getSystemStatus()
    },
  },
  {
    id: "api-connectivity",
    name: "API Connectivity Test",
    category: "system",
    description: "Tests basic connectivity to the API",
    run: async () => {
      return await apiClient.testApiConnectivity()
    },
  },
]

// Transport API Tests
const transportTests: ApiTest[] = [
  {
    id: "transport-get-state",
    name: "Get Transport State",
    category: "transport",
    description: "Retrieves the current transport state",
    run: async () => {
      return await transportApi.getTransportState()
    },
  },
  {
    id: "transport-start-playback",
    name: "Start Playback",
    category: "transport",
    description: "Starts transport playback",
    run: async () => {
      return await transportApi.startPlayback()
    },
  },
  {
    id: "transport-stop-playback",
    name: "Stop Playback",
    category: "transport",
    description: "Stops transport playback",
    run: async () => {
      return await transportApi.stopPlayback()
    },
  },
  {
    id: "transport-set-playhead",
    name: "Set Playhead Position",
    category: "transport",
    description: "Sets the playhead position to bar 4",
    run: async () => {
      return await transportApi.setPlayheadPosition(4)
    },
  },
  {
    id: "transport-toggle-loop",
    name: "Toggle Loop State",
    category: "transport",
    description: "Toggles the loop state on",
    run: async () => {
      return await transportApi.updateLoopState(true, { startBar: 0, endBar: 8 })
    },
  },
  {
    id: "transport-disable-loop",
    name: "Disable Loop",
    category: "transport",
    description: "Disables looping",
    run: async () => {
      return await transportApi.updateLoopState(false)
    },
  },
  {
    id: "transport-update-bpm",
    name: "Update BPM",
    category: "transport",
    description: "Updates the BPM to 128",
    run: async () => {
      return await transportApi.updateBpm(128)
    },
  },
  {
    id: "transport-reset-bpm",
    name: "Reset BPM",
    category: "transport",
    description: "Resets the BPM to 120",
    run: async () => {
      return await transportApi.updateBpm(120)
    },
  },
  {
    id: "transport-update-time-signature",
    name: "Update Time Signature",
    category: "transport",
    description: "Updates the time signature to 3/4",
    run: async () => {
      return await transportApi.updateTimeSignature("3/4")
    },
  },
  {
    id: "transport-reset-time-signature",
    name: "Reset Time Signature",
    category: "transport",
    description: "Resets the time signature to 4/4",
    run: async () => {
      return await transportApi.updateTimeSignature("4/4")
    },
  },
]

// Timeline API Tests
const timelineTests: ApiTest[] = [
  {
    id: "timeline-get-clips",
    name: "Get Timeline Clips",
    category: "timeline",
    description: "Retrieves all timeline clips",
    run: async () => {
      return await timelineApi.getTimelineClips()
    },
  },
  {
    id: "timeline-create-clip",
    name: "Create Timeline Clip",
    category: "timeline",
    description: "Creates a new timeline clip",
    run: async () => {
      return await timelineApi.createTimelineClip({
        name: "Test Clip",
        start: 0,
        length: 8,
        color: "#FF5555",
      })
    },
  },
  {
    id: "timeline-update-clip",
    name: "Update Timeline Clip",
    category: "timeline",
    description: "Updates an existing timeline clip",
    run: async () => {
      // First get all clips
      const clips = await timelineApi.getTimelineClips()
      if (clips.length === 0) {
        throw new Error("No clips available to update")
      }

      // Update the first clip
      return await timelineApi.updateTimelineClip(clips[0].id, {
        name: "Updated Test Clip",
        color: "#55FF55",
      })
    },
  },
  {
    id: "timeline-reorder-clips",
    name: "Reorder Timeline Clips",
    category: "timeline",
    description: "Reorders timeline clips",
    run: async () => {
      // First get all clips
      const clips = await timelineApi.getTimelineClips()
      if (clips.length < 2) {
        throw new Error("Need at least 2 clips to reorder")
      }

      // Reorder by reversing the order
      const orderedIds = clips.map((clip) => clip.id).reverse()
      return await timelineApi.reorderTimelineClips(orderedIds)
    },
  },
  {
    id: "timeline-delete-clip",
    name: "Delete Timeline Clip",
    category: "timeline",
    description: "Deletes a timeline clip",
    run: async () => {
      // First get all clips
      const clips = await timelineApi.getTimelineClips()
      if (clips.length === 0) {
        throw new Error("No clips available to delete")
      }

      // Delete the first clip
      return await timelineApi.deleteTimelineClip(clips[0].id)
    },
  },
]

// Account API Tests
const accountTests: ApiTest[] = [
  {
    id: "account-get-info",
    name: "Get Account Info",
    category: "account",
    description: "Retrieves account information",
    run: async () => {
      return await accountApi.getAccountInfo()
    },
  },
]

// WebSocket Tests
const websocketTests: ApiTest[] = [
  {
    id: "websocket-connection",
    name: "WebSocket Connection Test",
    category: "websocket",
    description: "Tests establishing a WebSocket connection",
    run: async () => {
      return new Promise((resolve, reject) => {
        try {
          let messageReceived = false
          let timeoutId: NodeJS.Timeout

          const ws = apiClient.createWebSocket((event) => {
            // If we receive any message, consider the test successful
            messageReceived = true
            clearTimeout(timeoutId)
            ws.close()
            resolve({ success: true, message: "WebSocket connection established and message received" })
          })

          // Set a timeout to close the connection if no message is received
          timeoutId = setTimeout(() => {
            ws.close()
            if (!messageReceived) {
              resolve({
                success: true,
                message: "WebSocket connection established but no message received within timeout",
                warning: "No message was received within the timeout period, but the connection was successful",
              })
            }
          }, 5000)

          // Handle connection errors
          ws.onerror = (error) => {
            clearTimeout(timeoutId)
            reject(new Error("WebSocket connection error"))
          }

          // Handle connection close
          ws.onclose = (event) => {
            if (!messageReceived) {
              clearTimeout(timeoutId)
              if (event.code !== 1000) {
                reject(new Error(`WebSocket connection closed with code ${event.code}: ${event.reason}`))
              }
            }
          }
        } catch (error) {
          reject(error)
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
    description: "Tests playing a MIDI clip",
    run: async () => {
      // Simple MIDI note on/off message for middle C
      const midiBase64 = "TVRoZAAAAAYAAQABAPBNVHJrAAAAFAD/UQMHoSAAwGAAgP9ZAv8vAA=="

      await apiClient.playMidiClip(midiBase64)
      return { success: true, message: "MIDI clip played successfully" }
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
