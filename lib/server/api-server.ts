"use server"

/**
 * Server-side API utilities for SEQ1
 */

/**
 * Get the API URL from environment variables
 */
export async function getApiUrl(): Promise<string> {
  return process.env.NEXT_PUBLIC_SEQ1_API_URL || "https://api.seq1.net"
}
