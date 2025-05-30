"use client"

import { useEffect, useState } from "react"
import { CheckCircle, WifiOff } from "lucide-react"
import { SystemAPI } from "@/lib/api-services"

export function TransportStatusIndicator() {
  const [status, setStatus] = useState<"loading" | "online" | "offline">("loading")
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const result = await SystemAPI.testApiConnectivity()
        if (result.success) {
          setStatus("online")
          setMessage("API is online")
        } else {
          setStatus("offline")
          setMessage(result.message)
        }
      } catch (error) {
        setStatus("offline")
        setMessage("Failed to connect to API")
        console.error("API connectivity test error:", error)
      }
    }

    checkApiStatus()

    // Check API status periodically
    const intervalId = setInterval(checkApiStatus, 30000) // Every 30 seconds

    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-sm shadow-md dark:bg-gray-800/90">
      {status === "loading" ? (
        <div className="animate-pulse flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-gray-400"></div>
          <span>Checking API status...</span>
        </div>
      ) : status === "online" ? (
        <>
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-green-700 dark:text-green-400">API Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-amber-500" />
          <span className="text-amber-700 dark:text-amber-400">Using Offline Mode</span>
          <button
            className="ml-2 text-xs underline text-blue-600 dark:text-blue-400"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </>
      )}
    </div>
  )
}
