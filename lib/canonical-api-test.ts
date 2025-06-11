/**
 * Canonical API Connectivity Test (as per Doc 15)
 * Tests if the 3 canonical environment variables are properly configured and API is reachable.
 * This script is intended to be run in a Node.js environment (e.g., locally or in a CI/CD pipeline).
 */
import { getCanonicalEnvironmentConfig } from "./canonical-env-validator" // Corrected import path

export interface CanonicalConnectivityTestResult {
  success: boolean
  message: string
  details: {
    canonicalEnvironmentVariablesSourced: boolean
    apiConfig: {
      url: string | null
      keyProvided: boolean // Indicates if a non-placeholder key was found server-side
      blockheight: string | null
    }
    directApiHealthCheck: {
      reachable: boolean
      status?: number
      error?: string
    }
    proxyHealthCheck?: {
      // Assuming /api/proxy/health is a route in your Next.js app
      reachable: boolean
      status?: number
      error?: string
    }
  }
}

export async function testCanonicalApiConnectivity(): Promise<CanonicalConnectivityTestResult> {
  const result: CanonicalConnectivityTestResult = {
    success: false,
    message: "",
    details: {
      canonicalEnvironmentVariablesSourced: false,
      apiConfig: { url: null, keyProvided: false, blockheight: null },
      directApiHealthCheck: { reachable: false },
      proxyHealthCheck: { reachable: false }, // Initialize proxy check
    },
  }

  try {
    console.log("Attempting to load canonical environment config...")
    // This should be called where process.env has server-side variables (Node.js environment)
    const config = getCanonicalEnvironmentConfig() // Uses the validator

    result.details.apiConfig = {
      url: config.SEQ1_API_URL,
      // Check if API key is present and not one of the known placeholders
      keyProvided:
        !!config.SEQ1_API_KEY &&
        !config.SEQ1_API_KEY.includes("placeholder") &&
        config.SEQ1_API_KEY !== "development-key-placeholder" && // Check against dev placeholder too
        config.SEQ1_API_KEY !== "missing-server-api-key",
      blockheight: config.NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT,
    }
    result.details.canonicalEnvironmentVariablesSourced = true
    console.log("✅ Canonical environment variables loaded (or defaulted):", {
      API_URL: config.SEQ1_API_URL,
      API_KEY_PROVIDED_EFFECTIVELY_ON_SERVER: result.details.apiConfig.keyProvided, // This reflects server-side check
      BITCOIN_BLOCKHEIGHT: config.NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT,
    })

    if (!config.SEQ1_API_URL || !result.details.apiConfig.keyProvided) {
      // For a true server-side test, keyProvided should be true.
      console.warn("SEQ1_API_URL is missing or SEQ1_API_KEY is missing/placeholder on the server.")
      // Not throwing error here to allow other checks to run, but this is a failure condition for prod.
    }

    // Test: Direct API reachability (Health Check)
    if (config.SEQ1_API_URL && result.details.apiConfig.keyProvided) {
      const healthUrl = `${config.SEQ1_API_URL}/api/health` // Assuming /api/health endpoint
      console.log(`Attempting to reach direct API health endpoint: ${healthUrl}`)
      try {
        const response = await fetch(healthUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${config.SEQ1_API_KEY}`, // Use the actual key from server env
            "Content-Type": "application/json",
          },
        })
        result.details.directApiHealthCheck.reachable = response.ok
        result.details.directApiHealthCheck.status = response.status
        console.log(`${response.ok ? "✅" : "❌"} Direct API health check: Status ${response.status}`)
        if (!response.ok) {
          const errorBody = await response.text()
          console.error(`API Health Check Error: ${errorBody.slice(0, 500)}`)
          result.details.directApiHealthCheck.error = `Status ${response.status}. Body: ${errorBody.slice(0, 100)}`
        }
      } catch (error: any) {
        console.log("❌ Direct API not reachable:", error.message)
        result.details.directApiHealthCheck.error = error.message
      }
    } else {
      console.warn("Skipping direct API health check due to missing URL or API Key.")
    }

    // Test 4: Proxy working (if running within Next.js context or deployed app)
    try {
      const proxyBaseUrl =
        typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      const proxyHealthUrl = `${proxyBaseUrl}/api/proxy/health`
      console.log(`Attempting to reach proxy health endpoint: ${proxyHealthUrl}`)
      const response = await fetch(proxyHealthUrl, { method: "GET" })
      result.details.proxyHealthCheck.reachable = response.ok
      result.details.proxyHealthCheck.status = response.status
      console.log(`${response.ok ? "✅" : "❌"} Proxy health check: Status ${response.status}`)
      if (!response.ok) {
        const errorBody = await response.text()
        result.details.proxyHealthCheck.error = `Status ${response.status}. Body: ${errorBody.slice(0, 100)}`
      }
    } catch (error: any) {
      console.log("❌ Proxy not working or test environment cannot resolve relative path:", error.message)
      result.details.proxyHealthCheck.error = error.message
    }

    // Overall success
    result.success =
      result.details.canonicalEnvironmentVariablesSourced &&
      result.details.apiConfig.keyProvided && // Key must be effectively provided on server
      result.details.directApiHealthCheck.reachable &&
      !!result.details.apiConfig.blockheight && // Blockheight should be present
      result.details.proxyHealthCheck.reachable // Proxy should also work

    result.message = result.success
      ? "✅ Canonical API connectivity test passed."
      : "❌ Canonical API connectivity test failed. Check environment variables, network, and API health."
  } catch (error: any) {
    result.message = `❌ Canonical API connectivity test error: ${error.message}`
    console.error(result.message, error)
    result.details.canonicalEnvironmentVariablesSourced = false // Mark as false if config load fails
  }

  return result
}
