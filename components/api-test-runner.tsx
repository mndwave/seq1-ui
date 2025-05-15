"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { apiTests } from "@/lib/api-tests"

interface ApiTestRunnerProps {
  category: string
}

type TestStatus = "pending" | "running" | "success" | "error"

interface TestResult {
  id: string
  name: string
  status: TestStatus
  duration?: number
  error?: any
  response?: any
}

export function ApiTestRunner({ category }: ApiTestRunnerProps) {
  const [results, setResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [summary, setSummary] = useState({ total: 0, success: 0, failed: 0 })

  // Filter tests by category
  const tests = category === "all" ? apiTests : apiTests.filter((test) => test.category === category)

  // Initialize results
  useEffect(() => {
    setResults(
      tests.map((test) => ({
        id: test.id,
        name: test.name,
        status: "pending",
      })),
    )
  }, [category])

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true)

    // Reset results
    setResults(
      tests.map((test) => ({
        id: test.id,
        name: test.name,
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
        const startTime = performance.now()
        const response = await test.run()
        const endTime = performance.now()

        // Update result with success
        setResults((prev) =>
          prev.map((r) =>
            r.id === test.id
              ? {
                  ...r,
                  status: "success",
                  duration: Math.round(endTime - startTime),
                  response,
                }
              : r,
          ),
        )

        successCount++
      } catch (error) {
        // Update result with error
        setResults((prev) =>
          prev.map((r) =>
            r.id === test.id
              ? {
                  ...r,
                  status: "error",
                  error: error instanceof Error ? error.message : String(error),
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

    setSummary({
      total: tests.length,
      success: successCount,
      failed: failedCount,
    })

    setIsRunning(false)
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
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
