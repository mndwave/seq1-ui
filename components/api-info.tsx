"use client"

import { useState, useEffect } from "react"
import { getSystemStatus } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"

export function ApiInfo() {
  const [apiUrl, setApiUrl] = useState<string>("")
  const [apiStatus, setApiStatus] = useState<string>("Checking...")
  const [authStatus, setAuthStatus] = useState<string>("Not authenticated")
  const [wsUrl, setWsUrl] = useState<string>("")
  const [lastChecked, setLastChecked] = useState<string>("")

  useEffect(() => {
    // Get the API URL from the proxy-base endpoint
    fetch("/api/proxy-base")
      .then((res) => res.json())
      .then((data) => {
        if (data.baseUrl) {
          setApiUrl(data.baseUrl)

          // Convert HTTP URL to WebSocket URL
          const wsBaseUrl = data.baseUrl.replace("https://", "wss://").replace("http://", "ws://")
          setWsUrl(wsBaseUrl)
        }
      })
      .catch((error) => {
        console.error("Error fetching API URL:", error)
        setApiUrl("Error fetching API URL")
      })

    // Check authentication status
    import("@/lib/api-client").then((module) => {
      setAuthStatus(module.isAuthenticated() ? "JWT Authenticated" : "Not authenticated")
    })

    // Check the API status
    const checkStatus = async () => {
      try {
        const status = await getSystemStatus()
        setApiStatus(status.status || "Online")
        setLastChecked(new Date().toLocaleTimeString())
      } catch (error) {
        setApiStatus("Offline")
        setLastChecked(new Date().toLocaleTimeString())
      }
    }

    checkStatus()

    // Set up interval to check status every 30 seconds
    const interval = setInterval(checkStatus, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gray-800 text-white p-4 rounded-md border border-gray-700 mb-6">
      <h2 className="text-lg font-semibold mb-2 text-white">API Connection Info</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-300">API URL:</span>
            <span className="text-sm font-mono">{apiUrl}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-300">WebSocket URL:</span>
            <span className="text-sm font-mono">{wsUrl}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-300">Last Checked:</span>
            <span className="text-sm">{lastChecked}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-300">API Status:</span>
            <Badge variant={apiStatus === "Online" ? "success" : "destructive"} className="text-xs">
              {apiStatus}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-300">Auth Status:</span>
            <Badge variant={authStatus.includes("Authenticated") ? "success" : "default"} className="text-xs">
              {authStatus}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-300">Environment:</span>
            <Badge variant="outline" className="text-xs">
              {process.env.NODE_ENV}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
