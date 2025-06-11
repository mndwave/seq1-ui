// lib/config.ts
import {
  getCanonicalEnvironmentConfig,
  TRIAL_DURATION_HOURS as CANONICAL_TRIAL_DURATION_HOURS,
  getVersionString as getCanonicalVersionString,
} from "./canonical-env-validator"

const envConfig = getCanonicalEnvironmentConfig()

const config = {
  // Canonical Environment Variables
  SEQ1_API_URL: envConfig.SEQ1_API_URL,
  SEQ1_API_KEY: envConfig.SEQ1_API_KEY, // Note: This will be 'development-key-placeholder' on client-side unless proxied
  NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT: envConfig.NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT,

  // Derived values
  APP_VERSION_STRING: getCanonicalVersionString(envConfig.NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT),
  TRIAL_DURATION: CANONICAL_TRIAL_DURATION_HOURS, // Hours

  // Other constants (can be expanded)
  HEARTBEAT_INTERVAL_MS: 30000, // 30 seconds
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
}

export default config
