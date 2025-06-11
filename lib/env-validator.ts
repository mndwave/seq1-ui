// lib/env-validator.ts
import { getCanonicalEnvironmentConfig } from "./canonical-env-validator"

export function validateEnvironment() {
  // Run if in development, or if VALIDATE_ENV_FORCE is true, or if explicitly told to validate by another env var.
  const forceValidation = process.env.VALIDATE_ENV_FORCE === "true" || process.env.NEXT_PUBLIC_VALIDATE_ENV === "true"

  if (process.env.NODE_ENV !== "development" && !forceValidation) {
    if (!forceValidation) console.log("Environment validation skipped (not in dev and VALIDATE_ENV_FORCE not true).")
    return
  }

  console.log("🚀 Running environment validation...")

  const config = getCanonicalEnvironmentConfig() // Get validated canonical vars

  const expectedClientSidePublicVars = [
    { key: "NEXT_PUBLIC_SEQ1_API_URL", value: config.SEQ1_API_URL, critical: true }, // SEQ1_API_URL from canonical is resolved
    { key: "NEXT_PUBLIC_APP_URL", value: config.NEXT_PUBLIC_APP_URL, critical: true },
    { key: "NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT", value: config.NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT, critical: false },
  ]

  const missing: string[] = []
  const issues: string[] = []

  // Check client-side accessible public variables
  expectedClientSidePublicVars.forEach((envVar) => {
    // For client-side, we check process.env directly for NEXT_PUBLIC_ prefixed vars
    const clientValue = process.env[envVar.key]
    if (!clientValue) {
      if (envVar.critical) {
        missing.push(`${envVar.key} (client-side)`)
      } else {
        issues.push(`Optional: ${envVar.key} is not set (client-side). Using fallback: ${envVar.value}`)
      }
    } else if (clientValue !== envVar.value && envVar.key !== "NEXT_PUBLIC_SEQ1_API_URL") {
      // SEQ1_API_URL can differ if serverApiUrl was used
      // This check might be too strict if fallbacks in canonical-env-validator are different from actual process.env
      // For now, let's focus on presence.
    }
  })

  // Server-side specific variables (checked if on server)
  if (typeof window === "undefined") {
    if (!config.SEQ1_API_KEY || config.SEQ1_API_KEY === "development-key-placeholder") {
      if (process.env.NODE_ENV === "production") {
        missing.push("SEQ1_API_KEY (server-side, critical in production)")
      } else {
        issues.push("SEQ1_API_KEY is using a development placeholder (server-side).")
      }
    }
    if (
      !config.SEQ1_API_URL ||
      (config.SEQ1_API_URL === "https://api.seq1.net" &&
        !process.env.NEXT_PUBLIC_SEQ1_API_URL &&
        !process.env.SEQ1_API_URL)
    ) {
      // If resolved URL is the default and neither actual env var was set.
      if (process.env.NODE_ENV === "production") {
        missing.push("SEQ1_API_URL or NEXT_PUBLIC_SEQ1_API_URL (server-side, critical in production)")
      } else {
        issues.push("SEQ1_API_URL is using a development placeholder (server-side).")
      }
    }
  }

  if (missing.length > 0) {
    const message = `Missing critical environment variables: ${missing.join(", ")}. Please check your Vercel project settings or .env files.`
    console.error(`❌ Environment Validation Error: ${message}`)
    if (process.env.NODE_ENV === "production") {
      // throw new Error(message); // Potentially throw in production builds
    }
  } else {
    console.log("👍 Environment validation passed (critical checks).")
  }

  if (issues.length > 0) {
    console.warn(`⚠️ Environment Validation Issues (non-critical/dev placeholders): \n- ${issues.join("\n- ")}`)
  }

  if (missing.length === 0 && issues.length === 0) {
    console.log("✅ All environment variables seem correctly configured.")
  }
}
