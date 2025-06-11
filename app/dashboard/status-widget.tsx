"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { SystemAPI } from "@/lib/api-services"

interface StatusWidgetProps {
  title: string
}

interface SystemStatus {
  status: string
  message: string
}

const StatusWidget: React.FC<StatusWidgetProps> = ({ title }) => {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStatus = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await SystemAPI.getSystemStatus()
        setStatus(data)
      } catch (e: any) {
        setError(e.message || "Failed to fetch system status.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatus()

    const intervalId = setInterval(fetchStatus, 60000) // Refresh every 60 seconds

    return () => clearInterval(intervalId) // Cleanup on unmount
  }, [])

  return (
    <div className="border rounded p-4 shadow-md">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : status ? (
        <div>
          <p>Status: {status.status}</p>
          <p>Message: {status.message}</p>
        </div>
      ) : (
        <p>No status available.</p>
      )}
    </div>
  )
}

export default StatusWidget
