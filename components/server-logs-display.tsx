"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Copy, RefreshCw, ChevronDown, ChevronUp } from "lucide-react"

interface ServerLogsDisplayProps {
  refreshTrigger?: number
  includeInReport?: (logs: string) => void
}

export function ServerLogsDisplay({ refreshTrigger, includeInReport }: ServerLogsDisplayProps) {
  const [logs, setLogs] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const logsRef = useRef<HTMLPreElement>(null)

  const fetchLogs = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/debug/fly-logs")

      if (!response.ok) {
        throw new Error(`Failed to fetch logs: ${response.status} ${response.statusText}`)
      }

      const text = await response.text()
      setLogs(text)

      // If includeInReport callback is provided, call it with the logs
      if (includeInReport) {
        includeInReport(text)
      }
    } catch (err) {
      console.error("Error fetching server logs:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch server logs")
      setLogs("")

      // If includeInReport callback is provided, call it with the error
      if (includeInReport) {
        includeInReport(`Server logs unavailable: ${err instanceof Error ? err.message : "Unknown error"}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch logs when the component mounts or when refreshTrigger changes
  useEffect(() => {
    fetchLogs()
  }, [refreshTrigger])

  // Scroll to bottom of logs when they update
  useEffect(() => {
    if (logsRef.current && logs) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight
    }
  }, [logs])

  const copyLogs = () => {
    navigator.clipboard
      .writeText(logs)
      .then(() => {
        // Could add a toast notification here
        console.log("Logs copied to clipboard")
      })
      .catch((err) => {
        console.error("Failed to copy logs:", err)
      })
  }

  // Function to highlight error and warning lines
  const highlightLogs = (logText: string) => {
    if (!logText) return null

    return logText.split("\n").map((line, index) => {
      const isError = line.includes("ERROR") || line.includes("Traceback") || line.includes("Exception")
      const isWarning = line.includes("WARNING") || line.includes("WARN")

      const className = isError ? "text-red-500" : isWarning ? "text-yellow-500" : ""

      return (
        <div key={index} className={className}>
          {line}
        </div>
      )
    })
  }

  return (
    <div className="mt-8 border border-gray-700 rounded-md bg-gray-900">
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={() => setIsVisible(!isVisible)} className="mr-2">
            {isVisible ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span className="ml-2">Server Logs</span>
          </Button>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyLogs} disabled={!logs || isLoading}>
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>

          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {isVisible && (
        <div className="p-0">
          {error ? (
            <div className="p-4 text-red-500 bg-red-900/20">{error}</div>
          ) : logs ? (
            <pre
              ref={logsRef}
              className="p-4 text-xs font-mono overflow-auto bg-gray-950 text-gray-300 max-h-[400px] whitespace-pre-wrap"
            >
              {highlightLogs(logs)}
            </pre>
          ) : (
            <div className="p-4 text-gray-400">{isLoading ? "Loading logs..." : "No logs available"}</div>
          )}
        </div>
      )}
    </div>
  )
}
