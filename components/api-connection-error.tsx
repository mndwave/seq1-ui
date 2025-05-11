"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"

export function ApiConnectionError() {
  const { apiConnected, testApiConnectivity } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    // Only show the error if the API is not connected
    setIsVisible(!apiConnected)
  }, [apiConnected])

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await testApiConnectivity()
    } finally {
      setIsRetrying(false)
    }
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">API Connection Error</h2>
        <p className="mb-4">Unable to connect to the SEQ1 API. This could be due to:</p>
        <ul className="list-disc pl-5 mb-4">
          <li>Network connectivity issues</li>
          <li>The API server may be down or unreachable</li>
          <li>CORS (Cross-Origin Resource Sharing) issues</li>
          <li>Firewall or security settings blocking the request</li>
        </ul>
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isRetrying ? "Retrying..." : "Retry Connection"}
          </button>
        </div>
      </div>
    </div>
  )
}
