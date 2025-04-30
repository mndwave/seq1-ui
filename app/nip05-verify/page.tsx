"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function NIP05VerifyPage() {
  const [identifier, setIdentifier] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const verifyNIP05 = async () => {
    if (!identifier || !identifier.includes("@")) {
      setError("Please enter a valid NIP-05 identifier (format: name@domain)")
      return
    }

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const [name, domain] = identifier.split("@")
      const url = `https://${domain}/.well-known/nostr.json?name=${name}`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.names && data.names[name]) {
        setResult({
          name,
          domain,
          pubkey: data.names[name],
          verified: true,
        })
      } else {
        setResult({
          name,
          domain,
          verified: false,
          reason: "Name not found in the domain's nostr.json file",
        })
      }
    } catch (err: any) {
      setError(`Verification failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>NIP-05 Verification</CardTitle>
          <CardDescription>Verify a NIP-05 identifier (e.g., kyle@seq1.net)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input placeholder="name@domain" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
            <Button onClick={verifyNIP05} disabled={loading}>
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </div>

          {error && <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">{error}</div>}

          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <h3 className="font-bold mb-2">{result.verified ? "✅ Verified" : "❌ Not Verified"}</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>Name:</strong> {result.name}
                </p>
                <p>
                  <strong>Domain:</strong> {result.domain}
                </p>
                {result.pubkey && (
                  <p className="break-all">
                    <strong>Public Key:</strong> {result.pubkey}
                  </p>
                )}
                {result.reason && (
                  <p>
                    <strong>Reason:</strong> {result.reason}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-gray-500">
          NIP-05 is a Nostr protocol for verifying identities using DNS.
        </CardFooter>
      </Card>
    </div>
  )
}
