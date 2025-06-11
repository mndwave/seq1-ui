import { NextResponse } from "next/server"
import { getCanonicalEnvironmentConfig, getVersionString } from "@/lib/canonical-env-validator"

export async function GET() {
  // Ensure this is only run on the server if it needs to access server-only env vars directly.
  // getCanonicalEnvironmentConfig already handles resolution.
  const config = getCanonicalEnvironmentConfig()

  // Selectively expose what's safe and useful for the client via this API route.
  // Avoid exposing SEQ1_API_KEY here.
  const clientSafeEnv = {
    NODE_ENV: process.env.NODE_ENV,
    SEQ1_API_URL: config.SEQ1_API_URL, // This is the resolved one, safe for client
    NEXT_PUBLIC_APP_URL: config.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT: config.NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT,
    APP_VERSION: getVersionString(config.NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT),
    // Add other NEXT_PUBLIC_ variables if they are numerous and client needs them this way
    // For example, if you had NEXT_PUBLIC_FEATURE_FLAG_X
  }

  return NextResponse.json(clientSafeEnv)
}
