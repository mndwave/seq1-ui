import { NextRequest } from "next/server"
import { proxyRequest } from "@/lib/proxy-helper"

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params
  return await proxyRequest(request, resolvedParams.path, "GET")
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params
  return await proxyRequest(request, resolvedParams.path, "POST")
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params
  return await proxyRequest(request, resolvedParams.path, "PUT")
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params
  return await proxyRequest(request, resolvedParams.path, "DELETE")
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params
  return await proxyRequest(request, resolvedParams.path, "PATCH")
}
