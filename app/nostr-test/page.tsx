"use client"

import { useState, useEffect } from "react"

export default function NostrTest() {
  const [result, setResult] = useState<string>("")
  const [error, setError] = useState<string>("")

  // Directly fetch the nostr.json file
  const testNostrFile = async () => {
    try {
      const response = await fetch("/.well-known/nostr.json")
      const text = await response.text()

      // Show the raw text first to check for any hidden characters
      setResult(
        `Raw response text: ${JSON.stringify(text)}\n\nParsed JSON: ${JSON.stringify(JSON.parse(text), null, 2)}`,
      )
    } catch (err) {
      setError(`Error fetching nostr.json: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  useEffect(() => {
    testNostrFile()
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Nostr File Test</h1>

      {error && (
        <div className="bg-red-100 p-4 rounded mb-4">
          <pre className="text-red-700">{error}</pre>
        </div>
      )}

      {result && (
        <div className="bg-green-100 p-4 rounded">
          <pre className="whitespace-pre-wrap">{result}</pre>
        </div>
      )}

      <div className="mt-4">
        <button onClick={testNostrFile} className="px-4 py-2 bg-blue-500 text-white rounded">
          Refresh Test
        </button>
      </div>
    </div>
  )
}
