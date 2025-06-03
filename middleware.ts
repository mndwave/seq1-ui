import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Handle .well-known/nostr.json requests
  if (request.nextUrl.pathname === "/.well-known/nostr.json") {
    // Clone the response
    const response = NextResponse.next()

    // Add the CORS headers
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS")
    response.headers.set(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    )
    response.headers.set("Content-Type", "application/json; charset=utf-8")
    response.headers.set("Cache-Control", "public, max-age=3600")

    return response
  }

  // For all other requests, continue normally
  return NextResponse.next()
}

// Only run middleware on specific routes
export const config = {
  matcher: ["/.well-known/:path*"],
}
