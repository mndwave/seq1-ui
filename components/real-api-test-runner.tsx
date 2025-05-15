"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Loader2, CheckCircle, XCircle, FileText, AlertTriangle } from "lucide-react"
import {
  realApiTests,
  runAllRealApiTests,
  runRealApiTestsByCategory,
  type RealApiTestResult,
} from "@/lib/real-api-tests"
import { useEnv } from "@/lib/env-provider"

interface RealApiTestRunnerProps {
  category: string
}

export function RealApiTestRunner({ category }: RealApiTestRunnerProps) {
  const [results, setResults] = useState<RealApiTestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [summary, setSummary] = useState({ total: 0, success: 0, failed: 0 })
  const [testStartTime, setTestStartTime] = useState<Date | null>(null)
  const [testEndTime, setTestEndTime] = useState<Date | null>(null)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const env = useEnv()

  // Get tests for the selected category
  const tests = category === "all" ? realApiTests : realApiTests.filter((test) => test.category === category)

  // Toggle expanded state for an item
  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Run all tests
  const runTests = async () => {
    setIsRunning(true)
    setTestStartTime(new Date())

    try {
      // Run tests based on category
      const testResults = category === "all" ? await runAllRealApiTests() : await runRealApiTestsByCategory(category)

      // Update results
      setResults(testResults)

      // Update summary
      const successCount = testResults.filter((r) => r.success).length
      setSummary({
        total: testResults.length,
        success: successCount,
        failed: testResults.length - successCount,
      })
    } catch (error) {
      console.error("Error running tests:", error)
    } finally {
      setTestEndTime(new Date())
      setIsRunning(false)
    }
  }

  // Export test results
  const exportResults = () => {
    if (results.length === 0) return

    const now = new Date()
    const fileName = `seq1-real-api-test-${now.toISOString().replace(/[:.]/g, "-")}.txt`

    // Build report content
    let report = "SEQ1 REAL API TEST REPORT\n"
    report += "========================\n\n"
    report += `Date: ${now.toISOString()}\n`

    if (env.isLoaded) {
      report += `REST API URL: ${env.apiUrl}\n`
      report += `WebSocket URL: ${env.wsUrl}\n`
    }

    report += `Category: ${category}\n\n`

    // Add summary
    report += "SUMMARY\n"
    report += "-------\n"
    report += `Total Tests: ${summary.total}\n`
    report += `Successful: ${summary.success}\n`
    report += `Failed: ${summary.failed}\n\n`

    // Add test results
    report += "TEST RESULTS\n"
    report += "-----------\n\n"

    results.forEach((result) => {
      report += `Test: ${result.name}\n`
      report += `Endpoint: ${result.endpoint}\n`
      report += `Success: ${result.success}\n`
      report += `Duration: ${result.duration}ms\n`
      report += `Timestamp: ${result.timestamp}\n`

      if (result.status) {
        report += `Status: ${result.status}\n`
      }

      if (result.success && result.response) {
        report += "\nResponse:\n"
        report += typeof result.response === "object" ? JSON.stringify(result.response, null, 2) : result.response
        report += "\n"
      }

      if (!result.success && result.error) {
        report += "\nError:\n"
        report += typeof result.error === "object" ? JSON.stringify(result.error, null, 2) : result.error
        report += "\n"
      }

      report += "\n" + "-".repeat(50) + "\n\n"
    })

    // Add environment info
    report += "ENVIRONMENT INFO\n"
    report += "---------------\n"
    report += `Browser: ${navigator.userAgent}\n`
    report += `Time: ${now.toISOString()}\n`

    if (env.isLoaded) {
      report += `REST API URL: ${env.apiUrl}\n`
      report += `WebSocket URL: ${env.wsUrl}\n`
    }

    // Create and download file
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
    <div className="space-y-4">
      <div className="bg-red-900/30 border border-red-500 p-4 rounded-md text-white">
        <div className="flex items-center mb-2">
          <AlertTriangle className="h-5 w-5 mr-2 text-red-400" />
          <h3 className="text-lg font-semibold">Server-Side API Testing Mode</h3>
        </div>
        <p className="text-sm">This mode uses server-side proxies to make authenticated API calls to your backend.</p>
        {env.isLoaded && (
          <div className="mt-2 space-y-2">
            <div>
              <span className="text-sm font-semibold">REST API URL:</span>
              <code className="block bg-black/30 p-2 rounded mt-1 text-red-200 font-mono text-sm">{env.apiUrl}</code>
            </div>
            <div>
              <span className="text-sm font-semibold">WebSocket URL:</span>
              <code className="block bg-black/30 p-2 rounded mt-1 text-red-200 font-mono text-sm">{env.wsUrl}</code>
            </div>
          </div>
        )}
        <p className="text-sm mt-2">If tests succeed when your API is offline, there is a configuration issue.</p>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">
            {category === "all" ? "All API Tests" : `${category.charAt(0).toUpperCase() + category.slice(1)} Tests`}
          </h2>
          <p className="text-sm text-gray-400">{tests.length} tests available</p>
        </div>

        <div className="flex gap-2">
          {results.length > 0 && !isRunning && (
            <Button onClick={exportResults} variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Export Results
            </Button>
          )}

          <Button onClick={runTests} disabled={isRunning} className="min-w-[120px]">
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              "Run Tests"
            )}
          </Button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="bg-gray-800 p-4 rounded-md flex gap-4 text-white">
          <div>
            <span className="text-sm font-medium">Total:</span>
            <span className="ml-2 font-bold">{summary.total}</span>
          </div>
          <div>
            <span className="text-sm font-medium">Success:</span>
            <span className="ml-2 font-bold text-green-500">{summary.success}</span>
          </div>
          <div>
            <span className="text-sm font-medium">Failed:</span>
            <span className="ml-2 font-bold text-red-500">{summary.failed}</span>
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
      )}

      <Accordion type="multiple" className="space-y-2">
        {tests.map((test) => {
          const result = results.find((r) => r.name === test.name)

          return (
            <AccordionItem
              key={test.id}
              value={test.id}
              className={`border rounded-md ${
                result
                  ? result.success
                    ? "border-green-500 bg-green-900/30 text-white"
                    : "border-red-500 bg-red-900/30 text-white"
                  : "border-gray-700 bg-gray-800 text-white"
              }`}
            >
              <AccordionTrigger className="px-4 py-2 hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    {isRunning && !result && <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-500" />}
                    {result?.success && <CheckCircle className="mr-2 h-4 w-4 text-green-500" />}
                    {result && !result.success && <XCircle className="mr-2 h-4 w-4 text-red-500" />}
                    {!isRunning && !result && <div className="w-4 h-4 mr-2" />}
                    <span>{test.name}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {test.isWebSocket && (
                      <Badge variant="outline" className="bg-purple-900/30 text-purple-300 border-purple-500">
                        WebSocket
                      </Badge>
                    )}
                    {result?.duration && (
                      <Badge variant="outline" className="ml-2">
                        {result.duration}ms
                      </Badge>
                    )}
                    {result && (
                      <Badge variant={result.success ? "success" : "destructive"}>
                        {result.success ? "Success" : "Failed"}
                      </Badge>
                    )}
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-4 py-2">
                <div className="mb-2 text-sm text-gray-400">{test.description}</div>

                <div className="bg-gray-900 p-3 rounded-md border border-gray-700 mb-3">
                  <div className="flex justify-between">
                    <div className="font-semibold text-white">Endpoint:</div>
                    <div className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-300 font-mono">{test.method}</div>
                  </div>
                  <div className="font-mono text-sm text-gray-300 mt-1">
                    {env.isLoaded ? (test.isWebSocket ? env.wsUrl : env.apiUrl) : "Loading..."}
                    {test.endpoint}
                  </div>
                </div>

                {test.body && (
                  <div className="bg-gray-900 p-3 rounded-md border border-gray-700 mb-3">
                    <div className="font-semibold text-white mb-1">Request Body:</div>
                    <pre className="text-xs overflow-auto max-h-[200px] bg-gray-950 p-2 rounded text-gray-300">
                      {JSON.stringify(test.body, null, 2)}
                    </pre>
                  </div>
                )}

                {result && (
                  <>
                    {result.success ? (
                      <div className="bg-green-900/30 p-3 rounded-md border border-green-500 mt-3">
                        <div className="font-semibold text-green-300 mb-1">Response:</div>
                        <pre className="text-xs overflow-auto max-h-[300px] bg-black/30 p-2 rounded text-green-200">
                          {typeof result.response === "object"
                            ? JSON.stringify(result.response, null, 2)
                            : result.response}
                        </pre>
                      </div>
                    ) : (
                      <div className="bg-red-900/30 p-3 rounded-md border border-red-500 mt-3">
                        <div className="font-semibold text-red-300 mb-1">Error:</div>
                        <pre className="text-xs overflow-auto max-h-[300px] bg-black/30 p-2 rounded text-red-200">
                          {typeof result.error === "object" ? JSON.stringify(result.error, null, 2) : result.error}
                        </pre>
                      </div>
                    )}

                    {result.headers && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(test.id)}
                        className="mt-2 text-xs"
                      >
                        {expandedItems[test.id] ? "Hide Headers" : "Show Headers"}
                      </Button>
                    )}

                    {result.headers && expandedItems[test.id] && (
                      <div className="bg-gray-900 p-3 rounded-md border border-gray-700 mt-2">
                        <div className="font-semibold text-white mb-1">Response Headers:</div>
                        <pre className="text-xs overflow-auto max-h-[200px] bg-gray-950 p-2 rounded text-gray-300">
                          {JSON.stringify(result.headers, null, 2)}
                        </pre>
                      </div>
                    )}

                    <div className="text-xs text-gray-400 mt-2">
                      Test executed at: {new Date(result.timestamp).toLocaleString()}
                    </div>
                  </>
                )}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}
