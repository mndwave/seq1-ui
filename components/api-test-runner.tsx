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
  response?: any
  timestamp?: Date
}

export function ApiTestRunner({ category }: ApiTestRunnerProps) {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [summary, setSummary] = useState({ total: 0, success: 0, failed: 0 })
  const [testStartTime, setTestStartTime] = useState<Date | null>(null)
  const [testEndTime, setTestEndTime] = useState<Date | null>(null)

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
        const testStartTime = performance.now()
        const response = await test.run()
        const testEndTime = performance.now()
        const timestamp = new Date()

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
                }
              : r,
          ),
        )

        successCount++
      } catch (error) {
        const timestamp = new Date()
        // Update result with error
        setResults((prev) =>
          prev.map((r) =>
            r.id === test.id
              ? {
                  ...r,
                  status: "error",
                  error: error instanceof Error ? error.message : String(error),
                  timestamp,
                }
              : r,
          ),
        )

        failedCount++
        console.error(`Test failed: ${test.name}`, error)
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

        if (result.status === "error" && result.error) {
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

    // Add section specifically for failed tests for quick reference
    const failedTests = results.filter((r) => r.status === "error")
    if (failedTests.length > 0) {
      report += "\nFAILED TESTS SUMMARY\n"
      report += "===================\n\n"

      failedTests.forEach((result) => {
        report += `Test: ${result.name}\n`
        report += `Category: ${result.category}\n`
        report += `Error: ${typeof result.error === "object" ? JSON.stringify(result.error, null, 2) : result.error}\n`
        report += "\n" + "".padEnd(50, "-") + "\n\n"
      })
    }

    // Add environment information
    report += "\nENVIRONMENT INFORMATION\n"
    report += "======================\n\n"
    report += `User Agent: ${navigator.userAgent}\n`
    report += `Window Size: ${window.innerWidth}x${window.innerHeight}\n`
    report += `API URL: ${process.env.NEXT_PUBLIC_SEQ1_API_URL || "Not available"}\n`

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
                <div className="bg-red-900/30 p-3 rounded-md mb-3 border border-red-500">
                  <div className="font-semibold text-red-300 mb-1">Error:</div>
                  <div className="text-red-200 font-mono text-sm whitespace-pre-wrap">
                    {typeof result.error === "object" ? JSON.stringify(result.error, null, 2) : result.error}
                  </div>
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
