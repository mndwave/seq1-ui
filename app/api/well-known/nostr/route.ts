import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    // Path to the nostr.json file in the public directory
    const filePath = path.join(process.cwd(), "public", ".well-known", "nostr.json")

    // Read the file
    const fileContent = fs.readFileSync(filePath, "utf8")
    const jsonContent = JSON.parse(fileContent)

    // Return the file content with appropriate headers
    return NextResponse.json(jsonContent, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("Error serving nostr.json:", error)
    return NextResponse.json({ error: "Failed to serve nostr.json" }, { status: 500 })
  }
}
