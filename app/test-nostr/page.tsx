"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestNostrPage() {
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [headers, setHeaders] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchNostrFile = async () => {
      try {
        // Use the current domain to test
        const domain = window.location.origin
        const response = await fetch(`${domain}/.well-known/nostr.json`)

        // Get headers
        const headerObj: Record<string, string> = {}
        response.headers.forEach((value, key) => {
          headerObj[key] = value
        })
        setHeaders(headerObj)

        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
        }

        const text = await response.text()
        setFileContent(text)

        // Try parsing to validate JSON
        JSON.parse(text)
      } catch (err: any) {
        setError(`Error: ${err.message}`)
      }
    }

    fetchNostrFile()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Nostr.json File Test</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="p-4 bg-red-100 text-red-800 rounded-md">{error}</div>
          ) : fileContent ? (
            <div>
              <h3 className="font-bold mb-2">File Content:</h3>
              <pre className="p-4 bg-gray-100 rounded-md overflow-auto">{fileContent}</pre>
            </div>
          ) : (
            <div>Loading...</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Response Headers</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-gray-100 rounded-md overflow-auto">
            {Object.entries(headers).map(([key, value]) => (
              <div key={key}>
                <strong>{key}:</strong> {value}
              </div>
            ))}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
