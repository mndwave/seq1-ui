"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

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
          <CardDescription>Testing NIP-05 implementation with hex public keys</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="p-4 bg-red-100 text-red-800 rounded-md">{error}</div>
          ) : fileContent ? (
            <div>
              <h3 className="font-bold mb-2">File Content:</h3>
              <pre className="p-4 bg-gray-100 rounded-md overflow-auto">{fileContent}</pre>

              <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
                <h4 className="font-bold">NIP-05 Format Check</h4>
                <p>NIP-05 requires hex-encoded public keys (not bech32 npub format).</p>
                <p className="mt-2">Example of correct format:</p>
                <pre className="bg-gray-100 p-2 mt-1 rounded">
                  {`{
  "names": {
    "username": "2af00a5a89cab5c913ff461be86add21025ba6fe66dfd9d0e82b9488cb8d2f3d"
  }
}`}
                </pre>
              </div>
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
