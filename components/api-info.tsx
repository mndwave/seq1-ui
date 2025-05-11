"use client"

import { useState, useEffect } from "react"

export function ApiInfo() {
  const [apiUrl, setApiUrl] = useState<string>("")

  useEffect(() => {
    // This is a simple way to get the API URL from the api-client.ts file
    // In a real implementation, you might want to expose this through a context or config
    import("@/lib/api-client").then((module) => {
      // @ts-ignore - We're accessing a private variable
      setApiUrl(module.API_BASE_URL || "Unknown")
    })
  }, [])

  if (!apiUrl) return null

  return (
    <div className="fixed bottom-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded z-50">API: {apiUrl}</div>
  )
}
