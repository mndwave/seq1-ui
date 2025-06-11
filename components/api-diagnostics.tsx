"use client"

import { useState, useEffect } from "react"
import * as apiClient from "@/lib/api-client"

export function ApiDiagnostics() {
  const [isVisible, setIsVisible] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<{
    success: boolean
    message: string
    details?: any
    timestamp: string
  } | null>(null)
  const [apiUrl, setApiUrl] = useState<string>("")

  // Run the test when the component is mounted
  useEffect(() => {
    // Get API URL from the proxy-base endpoint
    fetch("/api/proxy-base")
      .then((res) => res.json())
      .then((data) => {
        if (data.baseUrl) {
          setApiUrl(data.baseUrl)
        }
      })
      .catch((error) => {
        console.error("Error fetching API URL:", error)
      })

    const runTest = async () => {
      setIsRunning(true)
      try {
        const result = await apiClient.testApiConnectivity()
        setResults({
          ...result,
          timestamp: new Date().toISOString(),
        })
      } catch (error) {
        setResults({
          success: false,
          message: "Error running test",
          details: error,
          timestamp: new Date().toISOString(),
        })
      } finally {
        setIsRunning(false)
      }
    }

    // Run the test immediately
    runTest()

    // Listen for network errors
    const handleNetworkError = (event: CustomEvent) => {
      setIsVisible(true)
      setResults({
        success: false,
        message: event.detail?.message || "Network error occurred",
        details: event.detail?.originalError,
        timestamp: new Date().toISOString(),
      })
    }

    window.addEventListener("seq1:api:network-error", handleNetworkError as EventListener)

    return () => {
      window.removeEventListener("seq1:api:network-error", handleNetworkError as EventListener)
    }
  }, [])

  const runTest = async () => {
    setIsRunning(true)
    try {
      const result = await apiClient.testApiConnectivity()
      setResults({
        ...result,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      setResults({
        success: false,
        message: "Error running test",
        details: error,
        timestamp: new Date().toISOString(),
      })
    } finally {
      setIsRunning(false)
    }
  }

  if (!isVisible && (results?.success || !results)) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg max-w-md">
      <div className="flex justify-between items-start">
        <strong className="font-bold">API Connectivity Issue</strong>
        <button onClick={() => setIsVisible(false)} className="ml-4 text-red-700 hover:text-red-900">
          ×
        </button>
      </div>
      <div className="mt-2">
        <p className="text-sm">{results?.message || "Testing API connectivity..."}</p>
        {apiUrl && (
          <p className="text-xs mt-1">
            API URL: <span className="font-mono">{apiUrl}</span>
          </p>
        )}
        {results?.details && (
          <details className="mt-2">
            <summary className="text-sm cursor-pointer">View Details</summary>
            <pre className="mt-2 text-xs bg-red-50 p-2 rounded overflow-auto max-h-40">
              {JSON.stringify(results.details, null, 2)}
            </pre>
          </details>
        )}
        <div className="mt-3 flex space-x-2">
          <button
            onClick={runTest}
            disabled={isRunning}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
          >
            {isRunning ? "Testing..." : "Test Connection"}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
          >
            Reload Page
          </button>
        </div>
        <p className="text-xs mt-2">
          Last checked: {results?.timestamp ? new Date(results.timestamp).toLocaleTimeString() : "Never"}
        </p>
      </div>
    </div>
  )
}
