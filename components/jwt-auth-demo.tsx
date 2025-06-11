"use client"

import { useState, useEffect } from "react"
import { checkSession, getTransportState, getPublicTransportState } from "@/lib/api-client"

export default function JwtAuthDemo() {
  const [sessionData, setSessionData] = useState<any>(null)
  const [transportData, setTransportData] = useState<any>(null)
  const [publicTransportData, setPublicTransportData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [apiUrl, setApiUrl] = useState<string>("")

  // Get API URL on component mount
  useEffect(() => {
    async function fetchApiInfo() {
      try {
        // Fetch API info from the server
        const response = await fetch("/api/proxy-base")
        const data = await response.json()

        if (data.baseUrl) {
          setApiUrl(data.baseUrl)
        }
      } catch (error) {
        console.error("Error fetching API info:", error)
      }
    }

    fetchApiInfo()
    fetchPublicTransport()
  }, [])

  const checkAuth = async () => {
    setLoading(true)
    setError(null)

    try {
      const session = await checkSession()
      setSessionData(session)
    } catch (err: any) {
      setError(`Session check failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchTransport = async () => {
    setLoading(true)
    setError(null)

    try {
      const transport = await getTransportState()
      setTransportData(transport)
    } catch (err: any) {
      setError(`Transport fetch failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchPublicTransport = async () => {
    setLoading(true)
    setError(null)

    try {
      const transport = await getPublicTransportState()
      setPublicTransportData(transport)
    } catch (err: any) {
      setError(`Public transport fetch failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">SEQ1 JWT Authentication Demo</h1>

      {apiUrl && (
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">API Configuration</h2>
          <p className="text-sm">
            <span className="font-semibold">API URL:</span> {apiUrl}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <button
            onClick={checkAuth}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-4"
            disabled={loading}
          >
            {loading ? "Checking..." : "Check Session"}
          </button>

          {sessionData && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Session Data</h3>
              <pre className="bg-gray-900 p-3 rounded overflow-auto max-h-60 text-sm">
                {JSON.stringify(sessionData, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Authenticated API Test</h2>
          <button
            onClick={fetchTransport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mb-4"
            disabled={loading}
          >
            {loading ? "Fetching..." : "Fetch Transport (Authenticated)"}
          </button>

          {transportData && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Transport Data</h3>
              <pre className="bg-gray-900 p-3 rounded overflow-auto max-h-60 text-sm">
                {JSON.stringify(transportData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Public API Test</h2>
        <button
          onClick={fetchPublicTransport}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded mb-4"
          disabled={loading}
        >
          {loading ? "Fetching..." : "Fetch Public Transport"}
        </button>

        {publicTransportData && (
          <div className="mt-4">
            <h3 className="text-lg font-medium mb-2">Public Transport Data</h3>
            <pre className="bg-gray-900 p-3 rounded overflow-auto max-h-60 text-sm">
              {JSON.stringify(publicTransportData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-6 bg-red-900/50 border border-red-700 p-4 rounded-lg text-red-200">
          <h3 className="text-lg font-medium mb-2">Error</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}
