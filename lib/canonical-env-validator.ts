/**
 * Canonical Environment Variable Validator (as per Doc 15 & Prompt 16 updates)
 * Validates canonical SEQ1 environment variables.
 * Prioritizes NEXT_PUBLIC_ prefixed variables for client-side availability.
 * Provides default fallbacks for development if variables are missing,
 * but will throw an error during server-side build/runtime if critical ones are absent in production.
 */

interface CanonicalEnvironmentConfig {
  SEQ1_API_URL: string // Resolved API URL (preferring NEXT_PUBLIC_ for client)
  SEQ1_API_KEY: string // Server-side API Key
  NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT: string
  NEXT_PUBLIC_APP_URL: string // New: For the application's public URL
}

export function validateCanonicalEnvironment(): CanonicalEnvironmentConfig {
  // Client-side available versions
  const nextPublicApiUrl = process.env.NEXT_PUBLIC_SEQ1_API_URL
  const nextPublicAppUrl = process.env.NEXT_PUBLIC_APP_URL
  const blockheight = process.env.NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT

  // Server-side specific versions (should not be exposed to client without NEXT_PUBLIC_)
  const serverApiUrl = process.env.SEQ1_API_URL
  const apiKey = process.env.SEQ1_API_KEY

  const missingServerSideVars: string[] = []
  const isProduction = process.env.NODE_ENV === "production"
  const isServer = typeof window === "undefined"

  // Determine the API URL to use
  // On the server, prefer NEXT_PUBLIC_ if available, then serverApiUrl.
  // On the client, only NEXT_PUBLIC_ is available.
  const resolvedApiUrl = nextPublicApiUrl || serverApiUrl

  if (isServer) {
    if (!resolvedApiUrl && isProduction) {
      // If no API URL is found on the server in production, it's an error.
      missingServerSideVars.push("SEQ1_API_URL or NEXT_PUBLIC_SEQ1_API_URL")
    }
    if (!apiKey && isProduction) {
      missingServerSideVars.push("SEQ1_API_KEY")
    }
  } else {
    // Client-side checks
    if (!nextPublicApiUrl && isProduction) {
      // This shouldn't happen if next.config.mjs is set up, but good to note.
      console.warn("NEXT_PUBLIC_SEQ1_API_URL is not set for client in production.")
    }
  }

  if (!nextPublicAppUrl && isProduction) {
    // APP_URL is important for various links and metadata.
    // Allow fallback for dev, but warn/error for prod.
    if (isServer) {
      missingServerSideVars.push("NEXT_PUBLIC_APP_URL")
    } else {
      console.warn("NEXT_PUBLIC_APP_URL is not set for client in production.")
    }
  }

  if (missingServerSideVars.length > 0 && isProduction && isServer) {
    throw new Error(`Missing required canonical server-side environment variables: ${missingServerSideVars.join(", ")}`)
  }

  return {
    SEQ1_API_URL: resolvedApiUrl || "https://api.seq1.net", // Fallback
    SEQ1_API_KEY: apiKey || "development-key-placeholder", // Fallback, server should not rely on this in prod
    NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT: blockheight || "899175", // Default
    NEXT_PUBLIC_APP_URL: nextPublicAppUrl || "http://localhost:3000", // Fallback
  }
}

// This function is the primary way to get the validated & defaulted config.
export function getCanonicalEnvironmentConfig(): CanonicalEnvironmentConfig {
  return validateCanonicalEnvironment()
}

// Constants that were previously environment variables or derived from them
export const TRIAL_DURATION_HOURS = 3 // Hardcoded as per docs
export const getVersionString = (blockheight: string | undefined | null): string =>
  `SEQ1 ${blockheight || getCanonicalEnvironmentConfig().NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT || "N/A"}`
