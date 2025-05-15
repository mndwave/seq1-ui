import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return await proxyRequest(request, params.path, "GET")
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return await proxyRequest(request, params.path, "POST")
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return await proxyRequest(request, params.path, "PUT")
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return await proxyRequest(request, params.path, "DELETE")
}

async function proxyRequest(request: NextRequest, pathSegments: string[], method: string) {
  try {
    // Get API URL and key from environment variables
    const apiUrl = process.env.SEQ1_API_URL || process.env.NEXT_PUBLIC_SEQ1_API_URL
    const apiKey = process.env.SEQ1_API_KEY

    if (!apiUrl) {
      return NextResponse.json({ error: "API URL not configured" }, { status: 500 })
    }

    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Reconstruct the path
    const path = pathSegments.join("/")
    const url = `${apiUrl}/api/${path}`

    console.log(`Proxying ${method} request to ${url}`)

    // Get request body if it exists
    let body = null
    if (method !== "GET" && method !== "HEAD") {
      try {
        body = await request.json()
      } catch (e) {
        // No body or not JSON
      }
    }

    // Forward the request to the API
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    })

    // Get response data
    let data
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.includes("application/json")) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    // Return the response
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Content-Type": contentType || "application/json",
      },
    })
  } catch (error) {
    console.error("API proxy error:", error)
    return NextResponse.json(
      {
        error: "API proxy error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
