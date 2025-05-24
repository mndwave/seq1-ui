"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Loader2, CheckCircle, XCircle, FileText } from "lucide-react"
import { realApiTests, runRealApiTest } from "@/lib/real-api-tests"
import type { RealApiTestResult } from "@/lib/real-api-tests"
import { ServerLogsDisplay } from "@/components/server-logs-display"

interface ApiTestRunnerProps {
  category: string
}

type TestStatus = "pending" | "running" | "success" | "error"

interface TestResult {
  id: string
  name: string
  category: string
  description: string
  status: TestStatus
  duration?: number
  error?: any
  response?: any
  timestamp?: Date
  httpStatus?: number
  endpoint?: string
}

export function ApiTestRunner({ category }: ApiTestRunnerProps) {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [summary, setSummary] = useState({ total: 0, success: 0, failed: 0 })
  const [testStartTime, setTestStartTime] = useState<Date | null>(null)
  const [testEndTime, setTestEndTime] = useState<Date | null>(null)
  const [expandedErrors, setExpandedErrors] = useState<Record<string, boolean>>({})
  const [refreshLogsTrigger, setRefreshLogsTrigger] = useState(0)
  const [serverLogs, setServerLogs] = useState<string>("")

  // Filter tests by category - these are REAL API tests only
  const tests = category === "all" ? realApiTests : realApiTests.filter((test) => test.category === category)

  // Initialize results
  useEffect(() => {
    setResults(
      tests.map((test) => ({
        id: test.id,
        name: test.name,
        category: test.category,
        description: test.description,
        status: "pending",
        endpoint: test.endpoint,
      })),
    )
  }, [category])

  // Toggle error details expansion
  const toggleErrorExpansion = (id: string) => {
    setExpandedErrors((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Update server logs from the ServerLogsDisplay component
  const updateServerLogs = (logs: string) => {
    setServerLogs(logs)
  }

  // Run all tests - DIRECT API CALLS ONLY
  const runAllTests = async () => {
    setIsRunning(true)
    const startTime = new Date()
    setTestStartTime(startTime)
    setTestEndTime(null)

    // Refresh logs at the start of the test run
    setRefreshLogsTrigger((prev) => prev + 1)

    // Reset results
    setResults(
      tests.map((test) => ({
        id: test.id,
        name: test.name,
        category: test.category,
        description: test.description,
        status: "pending",
        endpoint: test.endpoint,
      })),
    )

    let successCount = 0
    let failedCount = 0

    // Run tests sequentially - REAL API CALLS ONLY
    for (const test of tests) {
      // Update status to running
      setResults((prev) => prev.map((r) => (r.id === test.id ? { ...r, status: "running" } : r)))

      try {
        console.log(`🔴 RUNNING REAL API TEST: ${test.name} -> ${test.endpoint}`)

        // Make DIRECT API call - no mocking, no fallbacks
        const result: RealApiTestResult = await runRealApiTest(test.id)

        console.log(`🔴 REAL API TEST RESULT:`, result)

        if (result.success) {
          // Update result with success
          setResults((prev) =>
            prev.map((r) =>
              r.id === test.id
                ? {
                    ...r,
                    status: "success",
                    duration: result.duration,
                    response: result.response,
                    timestamp: new Date(result.timestamp),
                    httpStatus: result.status,
                  }
                : r,
            ),
          )
          successCount++
        } else {
          // Update result with real error
          setResults((prev) =>
            prev.map((r) =>
              r.id === test.id
                ? {
                    ...r,
                    status: "error",
                    duration: result.duration,
                    error: result.error,
                    timestamp: new Date(result.timestamp),
                    httpStatus: result.status,
                  }
                : r,
            ),
          )
          failedCount++
        }
      } catch (error: any) {
        console.error(`🔴 REAL API TEST FAILED: ${test.name}`, error)

        // Update result with real error information
        setResults((prev) =>
          prev.map((r) =>
            r.id === test.id
              ? {
                  ...r,
                  status: "error",
                  error: error instanceof Error ? error.message : String(error),
                  timestamp: new Date(),
                }
              : r,
          ),
        )
        failedCount++
      }

      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    const endTime = new Date()
    setTestEndTime(endTime)

    setSummary({
      total: tests.length,
      success: successCount,
      failed: failedCount,
    })

    // Refresh logs after tests complete
    setRefreshLogsTrigger((prev) => prev + 1)

    setIsRunning(false)
  }

  // Generate and download the test report
  const exportTestReport = () => {
    if (results.length === 0 || !testStartTime) return

    const now = new Date()
    const formattedDate = now.toISOString().replace(/[:.]/g, "-").slice(0, 19)
    const fileName = `seq1-real-api-test-report-${formattedDate}.txt`

    // Generate report header
    let report = "SEQ1 REAL API TEST REPORT\n"
    report += "========================\n\n"
    report += "⚠️  DIRECT API CALLS ONLY - NO MOCK DATA ⚠️\n\n"
    report += `Date: ${now.toLocaleString()}\n`
    report += `Category: ${category === "all" ? "All Tests" : category.charAt(0).toUpperCase() + category.slice(1)}\n`
    report += `Test Start Time: ${testStartTime.toLocaleString()}\n`

    if (testEndTime) {
      report += `Test End Time: ${testEndTime.toLocaleString()}\n`
      const duration = (testEndTime.getTime() - testStartTime.getTime()) / 1000
      report += `Total Duration: ${duration.toFixed(2)} seconds\n`
    }

    report += "\nSUMMARY\n"
    report += "-------\n"
    report += `Total Tests: ${summary.total}\n`
    report += `Successful: ${summary.success}\n`
    report += `Failed: ${summary.failed}\n`

    // Group tests by category
    const categorizedResults: Record<string, TestResult[]> = {}
    results.forEach((result) => {
      if (!categorizedResults[result.category]) {
        categorizedResults[result.category] = []
      }
      categorizedResults[result.category].push(result)
    })

    // Generate detailed test results by category
    report += "\nDETAILED RESULTS\n"
    report += "===============\n\n"

    Object.entries(categorizedResults).forEach(([category, categoryResults]) => {
      report += `CATEGORY: ${category.toUpperCase()}\n`
      report += "".padEnd(category.length + 10, "=") + "\n\n"

      categoryResults.forEach((result) => {
        report += `Test: ${result.name}\n`
        report += `ID: ${result.id}\n`
        report += `Endpoint: ${result.endpoint}\n`
        report += `Description: ${result.description}\n`
        report += `Status: ${result.status.toUpperCase()}\n`

        if (result.httpStatus) {
          report += `HTTP Status: ${result.httpStatus}\n`
        }

        if (result.timestamp) {
          report += `Timestamp: ${result.timestamp.toLocaleString()}\n`
        }

        if (result.duration !== undefined) {
          report += `Duration: ${result.duration}ms\n`
        }

        if (result.status === "error") {
          report += "\nERROR DETAILS:\n"
          report += "-------------\n"
          report += typeof result.error === "object" ? JSON.stringify(result.error, null, 2) : result.error
          report += "\n"
        }

        if (result.status === "success" && result.response) {
          report += "\nRESPONSE:\n"
          report += "--------\n"
          report += typeof result.response === "object" ? JSON.stringify(result.response, null, 2) : result.response
          report += "\n"
        }

        report += "\n" + "".padEnd(50, "-") + "\n\n"
      })
    })

    // Add server logs section
    report += "\nSERVER LOGS\n"
    report += "===========\n\n"

    if (serverLogs) {
      report += serverLogs
    } else {
      report += "No server logs available.\n"
    }

    report += "\n" + "".padEnd(50, "-") + "\n\n"

    // Add environment information
    report += "\nENVIRONMENT INFORMATION\n"
    report += "======================\n\n"
    report += `User Agent: ${navigator.userAgent}\n`
    report += `Window Size: ${window.innerWidth}x${window.innerHeight}\n`
    report += `Date/Time: ${new Date().toISOString()}\n`
    report += `Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}\n`

    // Create and trigger download
    const blob = new Blob([report], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="transition-all duration-300 ease-in-out">
      <div className="bg-red-900/20 border border-red-500/50 rounded-md p-4 mb-4">
        <div className="flex items-center gap-2 text-red-300 font-semibold mb-2">
          <XCircle className="h-4 w-4" />
          DIRECT API TESTING MODE
        </div>
        <div className="text-red-200 text-sm">
          These tests make direct calls to your API server with no mock data or fallbacks. Tests will fail if your API
          server is not running or endpoints are not implemented.
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">
            {category === "all"
              ? "All Real API Tests"
              : `${category.charAt(0).toUpperCase() + category.slice(1)} Real API Tests`}
          </h2>
          <p className="text-sm text-gray-500">{tests.length} direct API tests available</p>
        </div>

        <div className="flex gap-2">
          {summary.total > 0 && !isRunning && (
            <Button onClick={exportTestReport} variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Export Report
            </Button>
          )}
          <Button onClick={runAllTests} disabled={isRunning} className="min-w-[120px]">
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              "Run All Tests"
            )}
          </Button>
        </div>
      </div>

      {isRunning || summary.total > 0 ? (
        <div className="bg-gray-800 p-4 rounded-md mb-4 flex gap-4 text-white">
          <div>
            <span className="text-sm font-medium">Total:</span>
            <span className="ml-2 font-bold">{summary.total}</span>
          </div>
          <div>
            <span className="text-sm font-medium">Success:</span>
            <span className="ml-2 font-bold text-green-600">{summary.success}</span>
          </div>
          <div>
            <span className="text-sm font-medium">Failed:</span>
            <span className="ml-2 font-bold text-red-600">{summary.failed}</span>
          </div>
          {testStartTime && testEndTime && (
            <div>
              <span className="text-sm font-medium">Duration:</span>
              <span className="ml-2 font-bold">
                {((testEndTime.getTime() - testStartTime.getTime()) / 1000).toFixed(2)}s
              </span>
            </div>
          )}
        </div>
      ) : null}

      <Accordion type="multiple" className="space-y-2">
        {results.map((result) => (
          <AccordionItem
            key={result.id}
            value={result.id}
            className={`border rounded-md transition-all duration-300 ease-in-out ${
              result.status === "error"
                ? "border-red-500 bg-red-900/30 text-white"
                : result.status === "success"
                  ? "border-green-500 bg-green-900/30 text-white"
                  : "border-gray-700 bg-gray-800 text-white"
            }`}
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center justify-between w-full ml-[-16px] pr-4">
                <div className="flex items-center">
                  {result.status === "running" && <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-500" />}
                  {result.status === "success" && <CheckCircle className="mr-2 h-4 w-4 text-green-500" />}
                  {result.status === "error" && <XCircle className="mr-2 h-4 w-4 text-red-500" />}
                  {result.status === "pending" && <div className="w-4 h-4 mr-2" />}
                  <div className="text-left">
                    <div>{result.name}</div>
                    <div className="text-xs text-gray-400">{result.endpoint}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {result.duration && (
                    <Badge variant="outline" className="ml-2">
                      {result.duration}ms
                    </Badge>
                  )}
                  {result.httpStatus && (
                    <Badge variant={result.httpStatus < 400 ? "success" : "destructive"}>{result.httpStatus}</Badge>
                  )}
                  <Badge
                    variant={
                      result.status === "success"
                        ? "success"
                        : result.status === "error"
                          ? "destructive"
                          : result.status === "running"
                            ? "default"
                            : "outline"
                    }
                  >
                    {result.status}
                  </Badge>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-4 py-2 transition-all duration-300 ease-in-out">
              <div className="mb-2 text-sm text-gray-400">{result.description}</div>

              {result.status === "error" && (
                <div className="space-y-3">
                  <div className="bg-red-900/30 p-3 rounded-md mb-3 border border-red-500">
                    <div className="font-semibold text-red-300 mb-1">Real API Error:</div>
                    <div className="text-red-200 font-mono text-sm whitespace-pre-wrap">
                      {typeof result.error === "object" ? JSON.stringify(result.error, null, 2) : result.error}
                    </div>
                  </div>
                </div>
              )}

              {result.status === "success" && result.response && (
                <div className="bg-gray-800 p-3 rounded-md border border-gray-700 transition-all duration-300 ease-in-out">
                  <div className="font-semibold mb-1 text-white">Real API Response:</div>
                  <pre className="text-sm overflow-auto max-h-[300px] text-gray-300">
                    {JSON.stringify(result.response, null, 2)}
                  </pre>
                </div>
              )}

              {result.timestamp && (
                <div className="mt-2 text-xs text-gray-400">Executed at: {result.timestamp.toLocaleString()}</div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Server Logs Display */}
      <ServerLogsDisplay refreshTrigger={refreshLogsTrigger} includeInReport={updateServerLogs} />
    </div>
  )
}
