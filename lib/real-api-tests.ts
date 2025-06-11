/**
 * COMPREHENSIVE REAL API TESTS
 * Tests for ALL endpoints in the SEQ1 API Interface Declaration
 * NO MOCKING - Direct API calls only
 */

// Interface for test results
export interface RealApiTestResult {
  success: boolean
  name: string
  endpoint: string
  duration: number
  timestamp: string
  response?: any
  error?: any
  status?: number
  headers?: Record<string, string>
}

// Interface for a test definition
export interface RealApiTest {
  id: string
  name: string
  category: string
  description: string
  endpoint: string
  method: string
  body?: any
  headers?: Record<string, string>
  requiresAuth?: boolean
  isWebSocket?: boolean
}

/**
 * Make a direct API call to the real backend
 */
export async function makeRealApiCall(test: RealApiTest): Promise<RealApiTestResult> {
  const startTime = performance.now()
  const timestamp = new Date().toISOString()

  let url: string

  if (test.isWebSocket) {
    url = `/api/ws-proxy-test${test.endpoint}`
    console.log(`🔴 REAL API TEST: Testing WebSocket connection via proxy`)
  } else {
    url = `/api/proxy${test.endpoint}`
    console.log(`🔴 REAL API TEST: Making ${test.method} request to ${test.endpoint} via proxy`)
  }

  try {
    const headers = new Headers({
      "Content-Type": "application/json",
      ...test.headers,
    })

    const options: RequestInit = {
      method: test.method,
      headers,
      cache: "no-store",
      next: { revalidate: 0 },
    }

    if (test.method !== "GET" && test.body) {
      options.body = JSON.stringify(test.body)
    }

    const response = await fetch(url, options)
    const endTime = performance.now()

    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    let data
    try {
      data = await response.json()
    } catch (e) {
      data = await response.text()
    }

    console.log(`🔴 REAL API TEST RESPONSE: ${response.status} ${response.statusText}`, data)

    if (response.ok) {
      return {
        success: true,
        name: test.name,
        endpoint: test.endpoint,
        duration: Math.round(endTime - startTime),
        timestamp,
        response: data,
        status: response.status,
        headers: responseHeaders,
      }
    } else {
      return {
        success: false,
        name: test.name,
        endpoint: test.endpoint,
        duration: Math.round(endTime - startTime),
        timestamp,
        error: {
          status: response.status,
          statusText: response.statusText,
          data,
        },
        status: response.status,
        headers: responseHeaders,
      }
    }
  } catch (error) {
    const endTime = performance.now()
    console.error(`🔴 REAL API TEST ERROR:`, error)

    return {
      success: false,
      name: test.name,
      endpoint: test.endpoint,
      duration: Math.round(endTime - startTime),
      timestamp,
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        type: error instanceof Error ? error.constructor.name : typeof error,
      },
    }
  }
}

// COMPREHENSIVE API TESTS - ALL ENDPOINTS FROM API DECLARATION
export const realApiTests: RealApiTest[] = [
  // AUTHENTICATION ENDPOINTS
  {
    id: "auth-login",
    name: "Login with Nostr",
    category: "authentication",
    description: "Authenticate user with Nostr credentials",
    endpoint: "/api/auth/login",
    method: "POST",
    body: {
      privateKey: "nsec1test...",
      useExtension: false,
    },
  },
  {
    id: "auth-signup",
    name: "Create Nostr Identity",
    category: "authentication",
    description: "Create new Nostr identity",
    endpoint: "/api/auth/signup",
    method: "POST",
    body: {
      username: "testuser",
      displayName: "Test User",
      email: "test@example.com",
    },
  },
  {
    id: "auth-logout",
    name: "Logout",
    category: "authentication",
    description: "Invalidate current session",
    endpoint: "/api/auth/logout",
    method: "POST",
    requiresAuth: true,
  },
  {
    id: "auth-session",
    name: "Check Session",
    category: "authentication",
    description: "Check current authentication status",
    endpoint: "/api/auth/session",
    method: "GET",
  },

  // TRANSPORT ENDPOINTS
  {
    id: "transport-get-state",
    name: "Get Transport State",
    category: "transport",
    description: "Get current transport state",
    endpoint: "/api/transport",
    method: "GET",
    requiresAuth: true,
  },
  {
    id: "transport-play",
    name: "Start Playback",
    category: "transport",
    description: "Start transport playback",
    endpoint: "/api/transport/play",
    method: "POST",
    requiresAuth: true,
  },
  {
    id: "transport-stop",
    name: "Stop Playback",
    category: "transport",
    description: "Stop transport playback",
    endpoint: "/api/transport/stop",
    method: "POST",
    requiresAuth: true,
  },
  {
    id: "transport-playhead",
    name: "Set Playhead Position",
    category: "transport",
    description: "Set playhead position",
    endpoint: "/api/transport/playhead",
    method: "POST",
    body: { position: 16 },
    requiresAuth: true,
  },
  {
    id: "transport-loop",
    name: "Set Loop State",
    category: "transport",
    description: "Toggle loop state or set loop region",
    endpoint: "/api/transport/loop",
    method: "POST",
    body: {
      isLooping: true,
      loopRegion: { startBar: 4, endBar: 8 },
    },
    requiresAuth: true,
  },
  {
    id: "transport-bpm",
    name: "Update BPM",
    category: "transport",
    description: "Update BPM",
    endpoint: "/api/transport/bpm",
    method: "POST",
    body: { bpm: 128 },
    requiresAuth: true,
  },
  {
    id: "transport-time-signature",
    name: "Update Time Signature",
    category: "transport",
    description: "Update time signature",
    endpoint: "/api/transport/time-signature",
    method: "POST",
    body: { timeSignature: "4/4" },
    requiresAuth: true,
  },

  // HISTORY ENDPOINTS
  {
    id: "history-undo",
    name: "Undo Action",
    category: "transport",
    description: "Undo last action",
    endpoint: "/api/history/undo",
    method: "POST",
    requiresAuth: true,
  },
  {
    id: "history-redo",
    name: "Redo Action",
    category: "transport",
    description: "Redo last undone action",
    endpoint: "/api/history/redo",
    method: "POST",
    requiresAuth: true,
  },

  // TIMELINE/CLIPS ENDPOINTS
  {
    id: "clips-get-all",
    name: "Get All Clips",
    category: "timeline",
    description: "Get all timeline clips",
    endpoint: "/api/clips",
    method: "GET",
    requiresAuth: true,
  },
  {
    id: "clips-create",
    name: "Create Clip",
    category: "timeline",
    description: "Create a new timeline clip",
    endpoint: "/api/clips",
    method: "POST",
    body: {
      name: "Test Section",
      start: 0,
      length: 16,
      color: "#4287f5",
    },
    requiresAuth: true,
  },
  {
    id: "clips-update",
    name: "Update Clip",
    category: "timeline",
    description: "Update an existing clip",
    endpoint: "/api/clips/test-clip-id",
    method: "PATCH",
    body: {
      name: "Updated Section",
      length: 24,
    },
    requiresAuth: true,
  },
  {
    id: "clips-delete",
    name: "Delete Clip",
    category: "timeline",
    description: "Delete a clip",
    endpoint: "/api/clips/test-clip-id",
    method: "DELETE",
    requiresAuth: true,
  },
  {
    id: "clips-reorder",
    name: "Reorder Clips",
    category: "timeline",
    description: "Reorder clips",
    endpoint: "/api/clips/reorder",
    method: "POST",
    body: {
      orderedIds: ["clip-1", "clip-2", "clip-3"],
    },
    requiresAuth: true,
  },
  {
    id: "clips-get-content",
    name: "Get Clip MIDI Content",
    category: "timeline",
    description: "Get MIDI content for a specific clip",
    endpoint: "/api/clips/test-clip-id/content",
    method: "GET",
    requiresAuth: true,
  },
  {
    id: "clips-update-content",
    name: "Update Clip MIDI Content",
    category: "timeline",
    description: "Update MIDI content for a specific clip",
    endpoint: "/api/clips/test-clip-id/content",
    method: "PUT",
    body: {
      midiData: "base64_encoded_test_data",
      notes: [
        { pitch: 60, start: 0, duration: 1, velocity: 100 },
        { pitch: 64, start: 1, duration: 1, velocity: 100 },
      ],
    },
    requiresAuth: true,
  },

  // DEVICE RACK ENDPOINTS
  {
    id: "devices-get-all",
    name: "Get All Devices",
    category: "devices",
    description: "Get all connected devices",
    endpoint: "/api/devices",
    method: "GET",
    requiresAuth: true,
  },
  {
    id: "devices-add",
    name: "Add Device",
    category: "devices",
    description: "Add a new device",
    endpoint: "/api/devices",
    method: "POST",
    body: {
      name: "Test Synth",
      type: "synth",
      manufacturer: "Test Manufacturer",
      midiInputId: "input-test",
      midiOutputId: "output-test",
      icon: "synth",
    },
    requiresAuth: true,
  },
  {
    id: "devices-update",
    name: "Update Device",
    category: "devices",
    description: "Update device configuration",
    endpoint: "/api/devices/test-device-id",
    method: "PATCH",
    body: {
      name: "Updated Test Synth",
      midiInputId: "input-updated",
    },
    requiresAuth: true,
  },
  {
    id: "devices-delete",
    name: "Remove Device",
    category: "devices",
    description: "Remove a device",
    endpoint: "/api/devices/test-device-id",
    method: "DELETE",
    requiresAuth: true,
  },

  // MIDI ENDPOINTS
  {
    id: "midi-get-ports",
    name: "Get MIDI Ports",
    category: "devices",
    description: "Get available MIDI ports",
    endpoint: "/api/midi/ports",
    method: "GET",
    requiresAuth: true,
  },
  {
    id: "midi-send",
    name: "Send MIDI Message",
    category: "devices",
    description: "Send MIDI message to a device",
    endpoint: "/api/midi/send",
    method: "POST",
    body: {
      deviceId: "test-device-id",
      midiData: "base64_encoded_midi_data",
    },
    requiresAuth: true,
  },

  // SYNTH PRESETS ENDPOINTS
  {
    id: "presets-get",
    name: "Get Device Presets",
    category: "devices",
    description: "Get available presets for a device",
    endpoint: "/api/devices/test-device-id/presets",
    method: "GET",
    requiresAuth: true,
  },
  {
    id: "presets-create",
    name: "Create Preset",
    category: "devices",
    description: "Create a new preset",
    endpoint: "/api/devices/test-device-id/presets",
    method: "POST",
    body: {
      name: "Test Preset",
      category: "Lead",
      parameters: {
        oscillator1: { waveform: "sawtooth", octave: 0 },
        filter: { cutoff: 0.7, resonance: 0.3 },
      },
    },
    requiresAuth: true,
  },
  {
    id: "presets-apply",
    name: "Apply Preset",
    category: "devices",
    description: "Apply a preset to a device",
    endpoint: "/api/devices/test-device-id/presets/test-preset-id",
    method: "PUT",
    requiresAuth: true,
  },

  // CHAT/PROMPT ENDPOINTS
  {
    id: "chat-send-message",
    name: "Send Chat Message",
    category: "chat",
    description: "Send a chat message to the AI orchestration engine",
    endpoint: "/api/chat",
    method: "POST",
    body: {
      prompt: "Create a funky bassline in C minor",
      device_id: "test-device-id",
      clip_id: "test-clip-id",
      context: {
        bpm: 120,
        key: "C minor",
        emotionalState: "energetic",
      },
    },
    requiresAuth: true,
  },
  {
    id: "chat-synth-preset",
    name: "Generate Synth Preset",
    category: "chat",
    description: "Generate a synth preset based on description",
    endpoint: "/api/chat/synth-preset",
    method: "POST",
    body: {
      prompt: "Create a warm pad sound with slow attack",
      device_id: "test-device-id",
    },
    requiresAuth: true,
  },
  {
    id: "chat-emotional-state",
    name: "Update Emotional State",
    category: "chat",
    description: "Update the emotional state context for the AI",
    endpoint: "/api/chat/emotional-state",
    method: "POST",
    body: {
      emotionalState: "melancholic",
      intensity: 0.7,
    },
    requiresAuth: true,
  },
  {
    id: "chat-history",
    name: "Get Chat History",
    category: "chat",
    description: "Get chat history",
    endpoint: "/api/chat/history",
    method: "GET",
    requiresAuth: true,
  },

  // PROJECT MANAGEMENT ENDPOINTS
  {
    id: "projects-get-all",
    name: "Get All Projects",
    category: "projects",
    description: "Get all user projects",
    endpoint: "/api/projects",
    method: "GET",
    requiresAuth: true,
  },
  {
    id: "projects-create",
    name: "Create Project",
    category: "projects",
    description: "Create a new project",
    endpoint: "/api/projects",
    method: "POST",
    body: {
      name: "test_project",
      bpm: 120,
      timeSignature: "4/4",
    },
    requiresAuth: true,
  },
  {
    id: "projects-get-details",
    name: "Get Project Details",
    category: "projects",
    description: "Get project details",
    endpoint: "/api/projects/test-project-id",
    method: "GET",
    requiresAuth: true,
  },
  {
    id: "projects-update",
    name: "Update Project",
    category: "projects",
    description: "Update project details",
    endpoint: "/api/projects/test-project-id",
    method: "PUT",
    body: {
      name: "updated_project_name",
      bpm: 130,
    },
    requiresAuth: true,
  },
  {
    id: "projects-delete",
    name: "Delete Project",
    category: "projects",
    description: "Delete a project",
    endpoint: "/api/projects/test-project-id",
    method: "DELETE",
    requiresAuth: true,
  },
  {
    id: "projects-export",
    name: "Export Project",
    category: "projects",
    description: "Export project to Ableton Live format",
    endpoint: "/api/projects/test-project-id/export",
    method: "POST",
    body: {
      format: "als",
      includeAudio: true,
    },
    requiresAuth: true,
  },
  {
    id: "projects-import",
    name: "Import Project",
    category: "projects",
    description: "Import project from Ableton Live format",
    endpoint: "/api/projects/import",
    method: "POST",
    requiresAuth: true,
  },

  // ACCOUNT MANAGEMENT ENDPOINTS
  {
    id: "account-get-info",
    name: "Get Account Info",
    category: "account",
    description: "Get account information",
    endpoint: "/api/account",
    method: "GET",
    requiresAuth: true,
  },
  {
    id: "account-update",
    name: "Update Account",
    category: "account",
    description: "Update account information",
    endpoint: "/api/account",
    method: "PATCH",
    body: {
      displayName: "Updated Name",
      about: "New bio information",
      website: "https://newsite.com",
    },
    requiresAuth: true,
  },
  {
    id: "account-profile-picture",
    name: "Update Profile Picture",
    category: "account",
    description: "Update profile picture",
    endpoint: "/api/account/profile-picture",
    method: "POST",
    requiresAuth: true,
  },
  {
    id: "account-delete",
    name: "Delete Account",
    category: "account",
    description: "Delete account",
    endpoint: "/api/account",
    method: "DELETE",
    body: {
      confirmation: "DELETE MY ACCOUNT",
    },
    requiresAuth: true,
  },

  // BILLING ENDPOINTS
  {
    id: "billing-get-info",
    name: "Get Billing Info",
    category: "billing",
    description: "Get billing information",
    endpoint: "/api/billing",
    method: "GET",
    requiresAuth: true,
  },
  {
    id: "billing-top-up",
    name: "Top Up Account",
    category: "billing",
    description: "Add hours to account",
    endpoint: "/api/billing/top-up",
    method: "POST",
    body: {
      amount: 10,
      currency: "usd",
      paymentMethod: "lightning",
    },
    requiresAuth: true,
  },
  {
    id: "billing-payment-history",
    name: "Get Payment History",
    category: "billing",
    description: "Get payment history",
    endpoint: "/api/billing/payment-history",
    method: "GET",
    requiresAuth: true,
  },

  // REFERRALS ENDPOINTS
  {
    id: "referrals-get-info",
    name: "Get Referral Info",
    category: "referrals",
    description: "Get referral information",
    endpoint: "/api/referrals",
    method: "GET",
    requiresAuth: true,
  },
  {
    id: "referrals-claim",
    name: "Claim Referral Code",
    category: "referrals",
    description: "Claim a referral code",
    endpoint: "/api/referrals/claim",
    method: "POST",
    body: {
      code: "SEQ1-XYZ789",
    },
    requiresAuth: true,
  },

  // WEBSOCKET TEST
  {
    id: "websocket-connection",
    name: "WebSocket Connection",
    category: "websocket",
    description: "Test WebSocket connection to the API",
    endpoint: "/ws/session",
    method: "GET",
    isWebSocket: true,
    requiresAuth: true,
  },
]

// Function to run a specific test
export async function runRealApiTest(testId: string): Promise<RealApiTestResult> {
  const test = realApiTests.find((t) => t.id === testId)
  if (!test) {
    throw new Error(`Test with ID ${testId} not found`)
  }

  return await makeRealApiCall(test)
}

// Function to run all tests
export async function runAllRealApiTests(): Promise<RealApiTestResult[]> {
  const results: RealApiTestResult[] = []

  for (const test of realApiTests) {
    const result = await makeRealApiCall(test)
    results.push(result)

    // Small delay between tests
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  return results
}

// Function to run tests by category
export async function runRealApiTestsByCategory(category: string): Promise<RealApiTestResult[]> {
  const categoryTests = realApiTests.filter((t) => t.category === category)
  const results: RealApiTestResult[] = []

  for (const test of categoryTests) {
    const result = await makeRealApiCall(test)
    results.push(result)

    // Small delay between tests
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  return results
}
