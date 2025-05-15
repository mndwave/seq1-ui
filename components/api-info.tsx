"use client"

import { useState, useEffect } from "react"
import { getSystemStatus } from "@/lib/api-client"

export function ApiInfo() {
  const [apiUrl, setApiUrl] = useState<string>("")
  const [apiStatus, setApiStatus] = useState<string>("Checking...")
  const [authStatus, setAuthStatus] = useState<string>("Not authenticated")

  useEffect(() => {
    // Get the API URL from the api-client.ts file
    import("@/lib/api-client").then((module) => {
      // @ts-ignore - We're accessing a private variable
      setApiUrl(module.API_BASE_URL || "Unknown")

      // Check authentication status
      setAuthStatus(module.isAuthenticated() ? "JWT Authenticated" : "Not authenticated")
    })

    // Check the API status
    const checkStatus = async () => {
      try {
        const status = await getSystemStatus()
        setApiStatus(status.status || "Online")
      } catch (error) {
        setApiStatus("Offline")
      }
    }

    checkStatus()
  }, [])

  return (
    <div className="fixed bottom-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded z-50 flex gap-2">
      <div>API: {apiUrl}</div>
      <div>|</div>
      <div>
        Status: <span className={apiStatus === "Online" ? "text-green-400" : "text-red-400"}>{apiStatus}</span>
      </div>
      <div>|</div>
      <div>
        Auth:{" "}
        <span className={authStatus.includes("Authenticated") ? "text-green-400" : "text-yellow-400"}>
          {authStatus}
        </span>
      </div>
    </div>
  )
}
