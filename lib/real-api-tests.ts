/**
 * REAL API TESTS
 * This file contains tests that make direct API calls to the real backend
 * with absolutely no mocking, caching, or simulation.
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
 * This bypasses all Next.js API routes and makes a direct fetch to the API
 */
export async function makeRealApiCall(test: RealApiTest): Promise<RealApiTestResult> {
  const startTime = performance.now()
  const timestamp = new Date().toISOString()

  // For all requests, we now use the server proxy
  // This ensures we're using the server-side API URL and API key
  let url: string

  if (test.isWebSocket) {
    // For WebSocket tests, use the WebSocket proxy
    url = `/api/ws-proxy-test${test.endpoint}`
    console.log(`🔴 REAL API TEST: Testing WebSocket connection via proxy`)
  } else {
    // For all other tests, use the API proxy
    url = `/api/proxy${test.endpoint}`
    console.log(`🔴 REAL API TEST: Making ${test.method} request to ${test.endpoint} via proxy`)
  }

  try {
    // Prepare headers
    const headers = new Headers({
      "Content-Type": "application/json",
      ...test.headers,
    })

    // Prepare request options
    const options: RequestInit = {
      method: test.method,
      headers,
      // Ensure no caching
      cache: "no-store",
      next: { revalidate: 0 },
    }

    // Add body for non-GET requests
    if (test.method !== "GET" && test.body) {
      options.body = JSON.stringify(test.body)
    }

    // Make the actual API call
    const response = await fetch(url, options)
    const endTime = performance.now()

    // Get response headers
    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    // Try to parse JSON response
    let data
    try {
      data = await response.json()
    } catch (e) {
      // If response is not JSON, get text
      data = await response.text()
    }

    // Log the result
    console.log(`🔴 REAL API TEST RESPONSE: ${response.status} ${response.statusText}`, data)

    // Return success or error based on status code
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

// Define the real API tests
export const realApiTests: RealApiTest[] = [
  // System tests
  {
    id: "system-health",
    name: "System Health Check",
    category: "system",
    description: "Checks if the API is online and healthy",
    endpoint: "/api/health",
    method: "GET",
  },

  // Transport tests
  {
    id: "transport-get-state",
    name: "Get Transport State",
    category: "transport",
    description: "Gets the current transport state",
    endpoint: "/api/transport",
    method: "GET",
    requiresAuth: true,
  },
  {
    id: "transport-start-playback",
    name: "Start Playback",
    category: "transport",
    description: "Starts transport playback",
    endpoint: "/api/transport/play",
    method: "POST",
    requiresAuth: true,
  },
  {
    id: "transport-stop-playback",
    name: "Stop Playback",
    category: "transport",
    description: "Stops transport playback",
    endpoint: "/api/transport/stop",
    method: "POST",
    requiresAuth: true,
  },
  {
    id: "transport-set-playhead",
    name: "Set Playhead Position",
    category: "transport",
    description: "Sets the playhead position",
    endpoint: "/api/transport/playhead",
    method: "POST",
    body: { position: 4 },
    requiresAuth: true,
  },
  {
    id: "transport-update-bpm",
    name: "Update BPM",
    category: "transport",
    description: "Updates the BPM",
    endpoint: "/api/transport/bpm",
    method: "POST",
    body: { bpm: 128 },
    requiresAuth: true,
  },

  // Timeline tests
  {
    id: "timeline-get-clips",
    name: "Get Timeline Clips",
    category: "timeline",
    description: "Gets all timeline clips",
    endpoint: "/api/clips",
    method: "GET",
    requiresAuth: true,
  },

  // Account tests
  {
    id: "account-get-info",
    name: "Get Account Info",
    category: "account",
    description: "Gets account information",
    endpoint: "/api/account",
    method: "GET",
    requiresAuth: true,
  },

  // WebSocket test
  {
    id: "websocket-connection",
    name: "WebSocket Connection",
    category: "websocket",
    description: "Tests WebSocket connection to the API",
    endpoint: "/", // WebSocket root endpoint
    method: "GET",
    isWebSocket: true,
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
