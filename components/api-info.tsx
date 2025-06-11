// Example structure - adapt to your actual component
"use client"

import type React from "react"
import { useEnv } from "@/lib/env-provider" // Assuming EnvProvider is set up

const ApiInfo: React.FC = () => {
  const { config, isLoaded } = useEnv()

  if (!isLoaded || !config) {
    return <div>Loading API info...</div>
  }

  return (
    <div className="p-4 border rounded-lg shadow-sm bg-card text-card-foreground">
      <h2 className="text-xl font-semibold mb-2">API Information</h2>
      <p>
        <strong>API URL:</strong> {config.SEQ1_API_URL || "Not configured"}
      </p>
      <p>
        <strong>App URL:</strong> {config.NEXT_PUBLIC_APP_URL || "Not configured"}
      </p>
      <p>
        <strong>Bitcoin Blockheight:</strong> {config.NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT || "N/A"}
      </p>
      {/* Add other relevant info here */}
    </div>
  )
}

export default ApiInfo
