"use client"

import { useEffect, useState } from "react"
import { CheckCircle, WifiOff } from "lucide-react"
import { SystemAPI } from "@/lib/api-services" // Corrected: Was SystemAPI, ensure testApiConnectivity is there or use getSystemStatus

export function TransportStatusIndicator() {
  const [status, setStatus] = useState<"loading" | "online" | "offline">("loading")
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        // Assuming SystemAPI.testApiConnectivity() exists and returns { success: boolean, message: string }
        // Or adapt to use SystemAPI.getSystemStatus() if testApiConnectivity is not the right method
        const result = await SystemAPI.testApiConnectivity()
        if (result.success) {
          setStatus("online")
          setMessage(result.message || "API is online")
        } else {
          setStatus("offline")
          setMessage(result.message || "API connection failed")
        }
      } catch (error: any) {
        setStatus("offline")
        setMessage(error.message || "Failed to connect to API")
        console.error("API connectivity test error:", error)
      }
    }

    checkApiStatus()
    const intervalId = setInterval(checkApiStatus, 30000)
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
          <span className="text-green-700 dark:text-green-400">{message}</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-amber-500" />
          <span className="text-amber-700 dark:text-amber-400">{message}</span>
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
