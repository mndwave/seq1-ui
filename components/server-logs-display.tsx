"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Copy, ChevronUp, ChevronDown } from "lucide-react"

interface ServerLogsDisplayProps {
  refreshTrigger: number
  includeInReport: (logs: string) => void
}

export function ServerLogsDisplay({ refreshTrigger, includeInReport }: ServerLogsDisplayProps) {
  const [logs, setLogs] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)
  const logsRef = useRef<HTMLPreElement>(null)

  // Fetch logs from the server
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

      // Pass logs to parent component for inclusion in report
      includeInReport(text)

      // Scroll to bottom of logs
      if (logsRef.current) {
        logsRef.current.scrollTop = logsRef.current.scrollHeight
      }
    } catch (error) {
      console.error("Error fetching logs:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch logs")
      setLogs("")
      includeInReport("")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch logs when component mounts or refreshTrigger changes
  useEffect(() => {
    fetchLogs()
  }, [refreshTrigger])

  // Copy logs to clipboard
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

  // Toggle expanded state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  // Highlight errors and warnings in logs
  const highlightLogs = (text: string) => {
    if (!text) return null

    // Split by lines to process each line
    return text.split("\n").map((line, index) => {
      // Highlight error lines
      if (
        line.includes("ERROR") ||
        line.includes("Traceback") ||
        line.includes("Exception") ||
        line.includes("FATAL")
      ) {
        return (
          <div key={index} className="text-red-400">
            {line}
          </div>
        )
      }

      // Highlight warning lines
      if (line.includes("WARNING") || line.includes("WARN")) {
        return (
          <div key={index} className="text-yellow-400">
            {line}
          </div>
        )
      }

      // Regular lines
      return (
        <div key={index} className="text-gray-300">
          {line}
        </div>
      )
    })
  }

  return (
    <div className="mt-8 border border-gray-700 rounded-md bg-gray-900">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={toggleExpanded} className="mr-2">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <h3 className="text-lg font-semibold">Server Logs</h3>
          {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin text-gray-400" />}
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

      {isExpanded && (
        <div className="p-4">
          {error ? (
            <div className="bg-red-900/30 p-3 rounded-md border border-red-500 text-red-200">{error}</div>
          ) : logs ? (
            <pre
              ref={logsRef}
              className="font-mono text-xs whitespace-pre-wrap bg-gray-950 p-4 rounded-md overflow-auto max-h-[400px]"
            >
              {highlightLogs(logs)}
            </pre>
          ) : (
            <div className="text-gray-400 italic">{isLoading ? "Loading logs..." : "No logs available"}</div>
          )}
        </div>
      )}
    </div>
  )
}
