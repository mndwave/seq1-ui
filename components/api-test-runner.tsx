"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Loader2, CheckCircle, XCircle, FileText } from "lucide-react"
import { apiTests } from "@/lib/api-tests"

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
  errorDetails?: {
    message?: string
    stack?: string
    code?: string
    type?: string
    request?: any
    response?: any
    context?: any
  }
  response?: any
  timestamp?: Date
  requestDetails?: {
    url?: string
    method?: string
    headers?: Record<string, string>
    body?: any
  }
  responseDetails?: {
    status?: number
    statusText?: string
    headers?: Record<string, string>
    size?: number
    timing?: {
      start: number
      end: number
      duration: number
    }
  }
}

export function ApiTestRunner({ category }: ApiTestRunnerProps) {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [summary, setSummary] = useState({ total: 0, success: 0, failed: 0 })
  const [testStartTime, setTestStartTime] = useState<Date | null>(null)
  const [testEndTime, setTestEndTime] = useState<Date | null>(null)
  const [expandedErrors, setExpandedErrors] = useState<Record<string, boolean>>({})

  // Filter tests by category
  const tests = category === "all" ? apiTests : apiTests.filter((test) => test.category === category)

  // Initialize results
  useEffect(() => {
    setResults(
      tests.map((test) => ({
        id: test.id,
        name: test.name,
        category: test.category,
        description: test.description,
        status: "pending",
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

  // Extract all properties from an error object
  const extractErrorDetails = (error: any): Record<string, any> => {
    if (!error) return {}

    // Start with an empty object
    const details: Record<string, any> = {}

    // If it's not an object, just return the error as a string
    if (typeof error !== "object") {
      return { value: String(error) }
    }

    // Extract all properties from the error object
    try {
      // Get all properties including non-enumerable ones
      const propertyNames = new Set([...Object.getOwnPropertyNames(error), ...Object.keys(error)])

      // Add each property to the details object
      for (const prop of propertyNames) {
        try {
          const value = error[prop]
          // Skip functions and circular references
          if (typeof value !== "function") {
            details[prop] = value
          }
        } catch (e) {
          details[`${prop}_error`] = "Could not access property"
        }
      }

      // Special handling for response objects
      if (error.response) {
        try {
          details.responseStatus = error.response.status
          details.responseStatusText = error.response.statusText

          // Try to get response data
          if (error.response.data) {
            details.responseData = error.response.data
          }

          // Try to get headers
          if (error.response.headers) {
            details.responseHeaders = error.response.headers
          }
        } catch (e) {
          details.responseError = "Could not extract response details"
        }
      }

      // Special handling for request objects
      if (error.request) {
        try {
          details.requestUrl = error.request.url || error.request._url
          details.requestMethod = error.request.method
          details.requestHeaders = error.request.headers
        } catch (e) {
          details.requestError = "Could not extract request details"
        }
      }

      // Special handling for axios errors
      if (error.config) {
        try {
          details.requestConfig = {
            url: error.config.url,
            method: error.config.method,
            headers: error.config.headers,
            data: error.config.data,
          }
        } catch (e) {
          details.configError = "Could not extract request config"
        }
      }
    } catch (e) {
      details.extractionError = "Error extracting properties"
    }

    return details
  }

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true)
    const startTime = new Date()
    setTestStartTime(startTime)
    setTestEndTime(null)

    // Reset results
    setResults(
      tests.map((test) => ({
        id: test.id,
        name: test.name,
        category: test.category,
        description: test.description,
        status: "pending",
      })),
    )

    let successCount = 0
    let failedCount = 0

    // Run tests sequentially
    for (const test of tests) {
      // Update status to running
      setResults((prev) => prev.map((r) => (r.id === test.id ? { ...r, status: "running" } : r)))

      try {
        // Capture request details
        const requestDetails: any = {
          testId: test.id,
          testName: test.name,
          startTime: new Date().toISOString(),
        }

        // Start timing
        const testStartTime = performance.now()

        // Run the test
        const response = await test.run()

        // End timing
        const testEndTime = performance.now()
        const timestamp = new Date()

        // Capture response details
        const responseDetails = {
          status: 200, // Assuming success
          timing: {
            start: testStartTime,
            end: testEndTime,
            duration: Math.round(testEndTime - testStartTime),
          },
        }

        // Update result with success
        setResults((prev) =>
          prev.map((r) =>
            r.id === test.id
              ? {
                  ...r,
                  status: "success",
                  duration: Math.round(testEndTime - testStartTime),
                  response,
                  timestamp,
                  requestDetails,
                  responseDetails,
                }
              : r,
          ),
        )

        successCount++
      } catch (error: any) {
        const timestamp = new Date()

        // Extract as much information as possible from the error
        const errorMessage = error instanceof Error ? error.message : String(error)
        const errorStack = error instanceof Error ? error.stack : undefined
        const errorType = error instanceof Error ? error.constructor.name : typeof error

        // Extract all properties from the error object
        const errorDetails = extractErrorDetails(error)

        console.error(`Test failed: ${test.name}`, error, errorDetails)

        // Update result with detailed error information
        setResults((prev) =>
          prev.map((r) =>
            r.id === test.id
              ? {
                  ...r,
                  status: "error",
                  error: errorMessage,
                  errorDetails: {
                    message: errorMessage,
                    stack: errorStack,
                    type: errorType,
                    ...errorDetails,
                  },
                  timestamp,
                }
              : r,
          ),
        )

        failedCount++
      }

      // Small delay between tests to avoid overwhelming the API
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    const endTime = new Date()
    setTestEndTime(endTime)

    setSummary({
      total: tests.length,
      success: successCount,
      failed: failedCount,
    })

    setIsRunning(false)
  }

  // Generate and download the test report
  const exportTestReport = () => {
    if (results.length === 0 || !testStartTime) return

    const now = new Date()
    const formattedDate = now.toISOString().replace(/[:.]/g, "-").slice(0, 19)
    const fileName = `seq1-api-test-report-${formattedDate}.txt`

    // Generate report header
    let report = "SEQ1 API TEST REPORT\n"
    report += "===================\n\n"
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
        report += `Description: ${result.description}\n`
        report += `Status: ${result.status.toUpperCase()}\n`

        if (result.timestamp) {
          report += `Timestamp: ${result.timestamp.toLocaleString()}\n`
        }

        if (result.duration !== undefined) {
          report += `Duration: ${result.duration}ms\n`
        }

        if (result.requestDetails) {
          report += "\nREQUEST DETAILS:\n"
          report += "---------------\n"
          report += JSON.stringify(result.requestDetails, null, 2) + "\n"
        }

        if (result.responseDetails) {
          report += "\nRESPONSE DETAILS:\n"
          report += "----------------\n"
          report += JSON.stringify(result.responseDetails, null, 2) + "\n"
        }

        if (result.status === "error") {
          report += "\nERROR DETAILS:\n"
          report += "-------------\n"
          report += `Message: ${result.error}\n`

          if (result.errorDetails) {
            report += "\nFull Error Information:\n"
            report += JSON.stringify(result.errorDetails, null, 2) + "\n"

            if (result.errorDetails.stack) {
              report += "\nStack Trace:\n"
              report += result.errorDetails.stack + "\n"
            }
          }
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

    // Add section specifically for failed tests for quick reference
    const failedTests = results.filter((r) => r.status === "error")
    if (failedTests.length > 0) {
      report += "\nFAILED TESTS SUMMARY\n"
      report += "===================\n\n"

      failedTests.forEach((result) => {
        report += `Test: ${result.name}\n`
        report += `Category: ${result.category}\n`
        report += `Error: ${result.error}\n`

        if (result.errorDetails) {
          report += "\nDetailed Error Information:\n"
          report += JSON.stringify(result.errorDetails, null, 2) + "\n"
        }

        report += "\n" + "".padEnd(50, "-") + "\n\n"
      })
    }

    // Add environment information
    report += "\nENVIRONMENT INFORMATION\n"
    report += "======================\n\n"
    report += `User Agent: ${navigator.userAgent}\n`
    report += `Window Size: ${window.innerWidth}x${window.innerHeight}\n`
    report += `API URL: ${process.env.NEXT_PUBLIC_SEQ1_API_URL || "Not available"}\n`
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
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">
            {category === "all" ? "All API Tests" : `${category.charAt(0).toUpperCase() + category.slice(1)} API Tests`}
          </h2>
          <p className="text-sm text-gray-500">{tests.length} tests available</p>
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
            className={`border rounded-md ${
              result.status === "error"
                ? "border-red-500 bg-red-900/30 text-white"
                : result.status === "success"
                  ? "border-green-500 bg-green-900/30 text-white"
                  : "border-gray-700 bg-gray-800 text-white"
            }`}
          >
            <AccordionTrigger className="px-4 py-2 hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  {result.status === "running" && <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-500" />}
                  {result.status === "success" && <CheckCircle className="mr-2 h-4 w-4 text-green-500" />}
                  {result.status === "error" && <XCircle className="mr-2 h-4 w-4 text-red-500" />}
                  {result.status === "pending" && <div className="w-4 h-4 mr-2" />}
                  <span>{result.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  {result.duration && (
                    <Badge variant="outline" className="ml-2">
                      {result.duration}ms
                    </Badge>
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

            <AccordionContent className="px-4 py-2">
              <div className="mb-2 text-sm text-gray-400">{result.description}</div>

              {result.status === "error" && (
                <div className="space-y-3">
                  <div className="bg-red-900/30 p-3 rounded-md mb-3 border border-red-500">
                    <div className="font-semibold text-red-300 mb-1">Error:</div>
                    <div className="text-red-200 font-mono text-sm whitespace-pre-wrap">
                      {typeof result.error === "object" ? JSON.stringify(result.error, null, 2) : result.error}
                    </div>
                  </div>

                  {result.errorDetails && (
                    <div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleErrorExpansion(result.id)}
                        className="mb-2 text-xs"
                      >
                        {expandedErrors[result.id] ? "Hide Detailed Error Info" : "Show Detailed Error Info"}
                      </Button>

                      {expandedErrors[result.id] && (
                        <div className="bg-gray-900 p-3 rounded-md border border-gray-700 mt-2">
                          <div className="font-semibold mb-1 text-white">Full Error Details:</div>

                          {result.errorDetails.type && (
                            <div className="mb-2">
                              <span className="text-gray-400 text-xs">Error Type: </span>
                              <span className="text-white text-xs">{result.errorDetails.type}</span>
                            </div>
                          )}

                          {result.errorDetails.stack && (
                            <div className="mb-3">
                              <div className="text-gray-400 text-xs mb-1">Stack Trace:</div>
                              <pre className="text-xs overflow-auto max-h-[200px] bg-gray-950 p-2 rounded text-gray-300">
                                {result.errorDetails.stack}
                              </pre>
                            </div>
                          )}

                          <div className="mb-2">
                            <div className="text-gray-400 text-xs mb-1">All Error Properties:</div>
                            <pre className="text-xs overflow-auto max-h-[300px] bg-gray-950 p-2 rounded text-gray-300">
                              {JSON.stringify(result.errorDetails, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {result.status === "success" && result.response && (
                <div className="bg-gray-800 p-3 rounded-md border border-gray-700">
                  <div className="font-semibold mb-1 text-white">Response:</div>
                  <pre className="text-sm overflow-auto max-h-[300px] text-gray-300">
                    {JSON.stringify(result.response, null, 2)}
                  </pre>
                </div>
              )}

              {result.requestDetails && (
                <div className="mt-3 bg-gray-800 p-3 rounded-md border border-gray-700">
                  <div className="font-semibold mb-1 text-white">Request Details:</div>
                  <pre className="text-xs overflow-auto max-h-[200px] text-gray-300">
                    {JSON.stringify(result.requestDetails, null, 2)}
                  </pre>
                </div>
              )}

              {result.responseDetails && (
                <div className="mt-3 bg-gray-800 p-3 rounded-md border border-gray-700">
                  <div className="font-semibold mb-1 text-white">Response Details:</div>
                  <pre className="text-xs overflow-auto max-h-[200px] text-gray-300">
                    {JSON.stringify(result.responseDetails, null, 2)}
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
    </div>
  )
}
