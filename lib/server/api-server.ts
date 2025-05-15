"use server"

/**
 * Server-side API utilities
 * These functions are only used on the server and have access to server-side environment variables
 */

/**
 * Get the API URL from environment variables
 */
export async function getApiUrl(): Promise<string> {
  const apiUrl = process.env.SEQ1_API_URL

  if (!apiUrl) {
    throw new Error("SEQ1_API_URL environment variable is not set")
  }

  return apiUrl
}

/**
 * Get the API key from environment variables
 */
export async function getApiKey(): Promise<string> {
  const apiKey = process.env.SEQ1_API_KEY

  if (!apiKey) {
    throw new Error("SEQ1_API_KEY environment variable is not set")
  }

  return apiKey
}

/**
 * Make an authenticated API request from the server
 */
export async function makeApiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const apiUrl = await getApiUrl()
  const apiKey = await getApiKey()

  const url = `${apiUrl}${endpoint}`

  // Set up headers
  const headers = new Headers(options.headers)
  headers.set("Content-Type", "application/json")
  headers.set("Authorization", `Bearer ${apiKey}`)

  // Make the request
  const response = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  })

  // Parse the response
  let data
  try {
    data = await response.json()
  } catch (e) {
    throw new Error("Invalid JSON response from API")
  }

  // Check if the response is an error
  if (!response.ok) {
    throw new Error(data.message || "An error occurred")
  }

  // Return the data
  return data
}
