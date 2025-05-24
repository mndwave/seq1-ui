"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Copy, RefreshCw, ChevronDown, ChevronUp, AlertCircle } from "lucide-react"

interface ServerLogsDisplayProps {
  refreshTrigger: number
  includeInReport?: (logs: string) => void
}

export function ServerLogsDisplay({ refreshTrigger, includeInReport }: ServerLogsDisplayProps) {
  const [logs, setLogs] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)
  const [isCopied, setIsCopied] = useState(false)
  const [isUnavailable, setIsUnavailable] = useState(false)

  // Fetch logs when the component mounts or refreshTrigger changes
  useEffect(() => {
    fetchLogs()
  }, [refreshTrigger])

  // Pass logs to parent component for report inclusion
  useEffect(() => {
    if (includeInReport) {
      if (logs) {
        includeInReport(logs)
      } else if (error) {
        includeInReport(`Server logs unavailable: ${error}`)
      }
    }
  }, [logs, error, includeInReport])

  // Fetch logs from the server
  const fetchLogs = async () => {
    setIsLoading(true)
    setError(null)
    setIsUnavailable(false)

    try {
      const response = await fetch("/debug/fly-logs")

      if (response.status === 503) {
        const errorMessage = await response.text()
        setError(errorMessage)
        setIsUnavailable(true)
        setLogs("")
        return
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.status} ${response.statusText}`)
      }

      const data = await response.text()
      setLogs(data)
      setError(null)
      setIsUnavailable(false)
    } catch (err) {
      console.warn("Error fetching logs:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch server logs"
      setError(errorMessage)
      setIsUnavailable(true)
      setLogs("")
    } finally {
      setIsLoading(false)
    }
  }

  // Copy logs to clipboard
  const copyLogs = () => {
    if (logs) {
      navigator.clipboard.writeText(logs)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  // Toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  // Highlight error and warning lines
  const highlightLogLine = (line: string) => {
    if (line.includes("ERROR") || line.includes("Traceback") || line.includes("Exception")) {
      return "text-red-400"
    } else if (line.includes("WARNING")) {
      return "text-yellow-400"
    }
    return ""
  }

  // Format logs with syntax highlighting
  const formattedLogs = logs
    ? logs.split("\n").map((line, index) => (
        <div key={index} className={`${highlightLogLine(line)}`}>
          {line}
        </div>
      ))
    : []

  return (
    <div className="mt-8 border border-gray-700 rounded-md bg-gray-800 transition-all duration-300 ease-in-out">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold text-white">Server Logs</h3>
          {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin text-blue-500" />}
          {isUnavailable && <AlertCircle className="ml-2 h-4 w-4 text-yellow-500" />}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyLogs}
            disabled={!logs || isLoading}
            className="text-xs flex items-center gap-1"
          >
            <Copy className="h-3 w-3" />
            {isCopied ? "Copied!" : "Copy"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={isLoading}
            className="text-xs flex items-center gap-1"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleExpanded} className="text-xs">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {error ? (
          <div className="p-4">
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Server Logs Unavailable</span>
            </div>
            <div className="text-gray-300 text-sm">{error}</div>
            {isUnavailable && (
              <div className="mt-3 text-xs text-gray-400">
                To enable server logs, implement the <code>/api/logs</code> endpoint on your API server.
              </div>
            )}
          </div>
        ) : logs ? (
          <pre className="p-4 overflow-auto font-mono text-xs text-gray-300 max-h-[500px]">{formattedLogs}</pre>
        ) : (
          <div className="p-4 text-gray-400">No logs available. Click "Refresh" to fetch logs.</div>
        )}
      </div>
    </div>
  )
}
