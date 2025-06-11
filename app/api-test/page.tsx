"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { apiClient, getSystemStatus } from "@/lib/api-client" // createLegacyWebSocket removed
import {
  getTransportState,
  startPlayback,
  stopPlayback,
  setPlayheadPosition,
  updateLoopState,
  updateBpm,
  updateTimeSignature,
} from "@/lib/api/transport-api" // Correct import for transport functions
import { type TimelineClip, timelineClipSchema } from "@/lib/timeline-clip-schema"
import { getClips, createClip, updateClip, deleteClip, reorderClips, clearAllClips } from "@/lib/api/timeline-api"
import { useToast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"

// Ensure User type is defined or imported if needed by apiClient responses
// For example, if nostrLogin or convertToRegisteredUser returns a User object
// that you want to type here.
// import type { User } from "@/lib/auth-manager"; // Or wherever User is defined

function ApiTestPage() {
  const [apiResponse, setApiResponse] = useState<string>("")
  const [wsMessages, setWsMessages] = useState<string[]>([])
  const [wsInput, setWsInput] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [mounted, setMounted] = useState(false)
  const [wsClient, setWsClient] = useState<any>(null)
  const { toast } = useToast()

  // Transport state inputs
  const [playheadPos, setPlayheadPos] = useState<string>("0")
  const [loopingActive, setLoopingActive] = useState<boolean>(false)
  const [loopStart, setLoopStart] = useState<string>("1")
  const [loopEnd, setLoopEnd] = useState<string>("5")
  const [currentBpm, setCurrentBpm] = useState<string>("120")
  const [currentTimeSig, setCurrentTimeSig] = useState<string>("4/4")

  // Clip state inputs
  const [clipIdToUpdate, setClipIdToUpdate] = useState<string>("")
  const [clipName, setClipName] = useState<string>("New Clip")
  const [clipStart, setClipStart] = useState<string>("0")
  const [clipLength, setClipLength] = useState<string>("4")
  const [clipColor, setClipColor] = useState<string>("#FF5733")
  const [clipIdsToReorder, setClipIdsToReorder] = useState<string>("") // comma-separated

  // Initialize client-side only components
  useEffect(() => {
    setMounted(true)
    // Load WebSocket client only on client side
    import("@/lib/websocket-manager").then(({ wsClient: ws }) => {
      setWsClient(ws)
    })
  }, [])

  const handleApiResponse = (response: any, title: string) => {
    const formattedResponse = JSON.stringify(response, null, 2)
    setApiResponse(formattedResponse)
    toast({
      title: title,
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{formattedResponse}</code>
        </pre>
      ),
    })
    console.log(title, response)
  }

  const handleError = (error: any, title: string) => {
    const errorMessage = error.message || "An unknown error occurred"
    setApiResponse(errorMessage + (error.errorData ? `\n${JSON.stringify(error.errorData, null, 2)}` : ""))
    toast({
      title: `Error: ${title}`,
      description: errorMessage,
      variant: "destructive",
    })
    console.error(title, error)
  }

  const makeRequest = async (requestFn: () => Promise<any>, title: string) => {
    setIsLoading(true)
    try {
      const result = await requestFn()
      handleApiResponse(result, title)
    } catch (error) {
      handleError(error, title)
    } finally {
      setIsLoading(false)
    }
  }

  // WebSocket connection and message handling - only run on client
  useEffect(() => {
    if (!mounted || !wsClient) return

    if (!wsClient.isConnected()) {
      wsClient.connect()
    }

    const messageListener = (data: any) => {
      const message = typeof data === "string" ? data : JSON.stringify(data)
      setWsMessages((prev) => [...prev, `Received: ${message}`])
    }
    const errorListener = (error: Event) => {
      setWsMessages((prev) => [...prev, `Error: ${JSON.stringify(error)}`])
    }
    const openListener = () => {
      setWsMessages((prev) => [...prev, "WebSocket Connected via wsClient"])
    }
    const closeListener = () => {
      setWsMessages((prev) => [...prev, "WebSocket Disconnected via wsClient"])
    }

    wsClient.on("message", messageListener)
    wsClient.on("error", errorListener)
    wsClient.on("open", openListener)
    wsClient.on("close", closeListener)

    return () => {
      wsClient.off("message", messageListener)
      wsClient.off("error", errorListener)
      wsClient.off("open", openListener)
      wsClient.off("close", closeListener)
      // wsClient.disconnect(); // Optional: disconnect on component unmount
    }
  }, [mounted, wsClient])

  const sendWsMessage = () => {
    if (!mounted || !wsClient) {
      toast({ title: "WebSocket not loaded", variant: "destructive" })
      return
    }
    if (wsInput.trim() && wsClient.isConnected()) {
      wsClient.send(wsInput)
      setWsMessages((prev) => [...prev, `Sent: ${wsInput}`])
      setWsInput("")
    } else {
      toast({ title: "WebSocket not connected or message empty.", variant: "destructive" })
    }
  }

  // Don't render anything until mounted to prevent SSR issues
  if (!mounted) {
    return <div>Loading...</div>
  }

  // --- Test Functions ---

  // System
  const testGetSystemStatus = () => makeRequest(getSystemStatus, "Get System Status")

  // Transport
  const testGetTransportState = () => makeRequest(getTransportState, "Get Transport State")
  const testStartPlayback = () => makeRequest(startPlayback, "Start Playback")
  const testStopPlayback = () => makeRequest(stopPlayback, "Stop Playback")
  const testSetPlayhead = () =>
    makeRequest(() => setPlayheadPosition(Number.parseFloat(playheadPos)), "Set Playhead Position")
  const testToggleLoop = () =>
    makeRequest(() => {
      const region = loopingActive ? { startBar: Number.parseInt(loopStart), endBar: Number.parseInt(loopEnd) } : null
      return updateLoopState(loopingActive, region)
    }, "Update Loop State")
  const testSetBpm = () => makeRequest(() => updateBpm(Number.parseInt(currentBpm)), "Set BPM")
  const testSetTimeSig = () => makeRequest(() => updateTimeSignature(currentTimeSig), "Set Time Signature")

  // Clips
  const testGetClips = () => makeRequest(getClips, "Get Clips")
  const testCreateClip = () => {
    const newClipData = {
      name: clipName,
      start: Number.parseFloat(clipStart),
      length: Number.parseFloat(clipLength),
      color: clipColor,
    }
    try {
      const validatedClip = timelineClipSchema.omit({ id: true }).parse(newClipData) as Omit<TimelineClip, "id">
      return makeRequest(() => createClip(validatedClip), "Create Clip")
    } catch (e: any) {
      handleError(e, "Create Clip Validation Error")
    }
  }
  const testUpdateClip = () => {
    if (!clipIdToUpdate) {
      handleError({ message: "Clip ID to update is required." }, "Update Clip")
      return
    }
    const updatedClipData = {
      id: clipIdToUpdate,
      name: clipName,
      start: Number.parseFloat(clipStart),
      length: Number.parseFloat(clipLength),
      color: clipColor,
    }
    try {
      const validatedClip = timelineClipSchema.parse(updatedClipData) as TimelineClip
      return makeRequest(() => updateClip(clipIdToUpdate, validatedClip), "Update Clip")
    } catch (e: any) {
      handleError(e, "Update Clip Validation Error")
    }
  }
  const testDeleteClip = () => {
    if (!clipIdToUpdate) {
      handleError({ message: "Clip ID to delete is required." }, "Delete Clip")
      return
    }
    return makeRequest(() => deleteClip(clipIdToUpdate), "Delete Clip")
  }
  const testReorderClips = () => {
    const ids = clipIdsToReorder
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id)
    if (ids.length === 0) {
      handleError({ message: "Please provide comma-separated clip IDs to reorder." }, "Reorder Clips")
      return
    }
    return makeRequest(() => reorderClips(ids), "Reorder Clips")
  }
  const testClearAllClips = () => makeRequest(clearAllClips, "Clear All Clips")

  // Anonymous Session
  const testCreateAnonSession = () => makeRequest(() => apiClient.createAnonymousSession(), "Create Anonymous Session")
  const testGetAnonSessionStatus = () => {
    if (!apiClient.sessionId) {
      handleError({ message: "No anonymous session ID available. Create one first." }, "Get Anonymous Session Status")
      return
    }
    return makeRequest(() => apiClient.getAnonymousSessionStatus(), "Get Anonymous Session Status")
  }
  const testAnonHeartbeat = () => {
    if (!apiClient.sessionId) {
      handleError({ message: "No anonymous session ID available. Create one first." }, "Anonymous Session Heartbeat")
      return
    }
    return makeRequest(
      () => apiClient.updateAnonymousSessionHeartbeat(30, { customData: "test" }),
      "Anonymous Session Heartbeat",
    )
  }

  // Auth
  const testNostrLogin = async () => {
    // This is a placeholder for actual NIP-07 signing
    if (typeof window.nostr === "undefined") {
      handleError({ message: "Nostr extension (window.nostr) not found." }, "Nostr Login")
      return
    }
    try {
      setIsLoading(true)
      // @ts-ignore
      const pubkey = await window.nostr.getPublicKey()
      const event = {
        kind: 22242, // Example kind for login, adjust as per your backend
        created_at: Math.floor(Date.now() / 1000),
        tags: [["p", pubkey]],
        content: "SEQ1 Login Challenge", // Replace with actual challenge if used
        pubkey: pubkey,
      }
      // @ts-ignore
      const signedEvent = await window.nostr.signEvent(event)
      const response = await apiClient.nostrLogin(signedEvent)
      handleApiResponse(response, "Nostr Login")
    } catch (error) {
      handleError(error, "Nostr Login")
    } finally {
      setIsLoading(false)
    }
  }

  const testConvertToRegistered = async () => {
    if (!apiClient.sessionId) {
      handleError({ message: "No anonymous session ID. Create one first." }, "Convert To Registered User")
      return
    }
    if (typeof window.nostr === "undefined") {
      handleError({ message: "Nostr extension (window.nostr) not found." }, "Convert To Registered User")
      return
    }
    try {
      setIsLoading(true)
      // @ts-ignore
      const pubkey = await window.nostr.getPublicKey()
      // Create a dummy signed event or use a real one if your backend expects it for conversion
      const event = {
        // This structure depends on what your backend /api/auth/upgrade-session expects
        kind: 1,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: `Upgrading session for ${pubkey}`,
        pubkey: pubkey,
      }
      // @ts-ignore
      const signedEventForConversion = await window.nostr.signEvent(event)

      const response = await apiClient.convertToRegisteredUser(pubkey, true, { nostr_event: signedEventForConversion })
      handleApiResponse(response, "Convert To Registered User")
    } catch (error) {
      handleError(error, "Convert To Registered User")
    } finally {
      setIsLoading(false)
    }
  }

  const testFetchMe = () => {
    if (!apiClient.token) {
      handleError({ message: "Not authenticated. Log in first." }, "Fetch Me (/api/auth/me)")
      return
    }
    return makeRequest(() => apiClient.directRequest("/api/auth/me"), "Fetch Me (/api/auth/me)")
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">SEQ1 API Test Page</h1>

      <Card>
        <CardHeader>
          <CardTitle>API Response</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea value={apiResponse} readOnly rows={10} placeholder="API responses will appear here..." />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System & Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={testGetSystemStatus} disabled={isLoading} className="w-full">
              Get System Status
            </Button>
            <Button onClick={testCreateAnonSession} disabled={isLoading} className="w-full">
              Create Anonymous Session
            </Button>
            <Button onClick={testGetAnonSessionStatus} disabled={isLoading || !apiClient.sessionId} className="w-full">
              Get Anonymous Session Status
            </Button>
            <Button onClick={testAnonHeartbeat} disabled={isLoading || !apiClient.sessionId} className="w-full">
              Anonymous Session Heartbeat
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={testNostrLogin} disabled={isLoading} className="w-full">
              Nostr Login (NIP-07)
            </Button>
            <Button onClick={testConvertToRegistered} disabled={isLoading || !apiClient.sessionId} className="w-full">
              Convert Anonymous to Registered (NIP-07)
            </Button>
            <Button onClick={testFetchMe} disabled={isLoading || !apiClient.token} className="w-full">
              Fetch Me (/api/auth/me)
            </Button>
            <Button
              onClick={() => {
                apiClient.clearToken()
                toast({ title: "Token Cleared" })
              }}
              disabled={isLoading}
              className="w-full"
            >
              Clear Token (Logout Sim)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>WebSocket Test (via wsClient)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex space-x-2">
              <Input value={wsInput} onChange={(e) => setWsInput(e.target.value)} placeholder="Message to send" />
              <Button onClick={sendWsMessage} disabled={!wsClient.isConnected()}>
                Send
              </Button>
            </div>
            <Button onClick={() => wsClient.connect()} disabled={wsClient.isConnected()} className="w-full">
              Connect WS
            </Button>
            <Button onClick={() => wsClient.disconnect()} disabled={!wsClient.isConnected()} className="w-full">
              Disconnect WS
            </Button>
            <Textarea value={wsMessages.join("\n")} readOnly rows={5} placeholder="WebSocket messages..." />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Transport Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button onClick={testGetTransportState} disabled={isLoading}>
                Get State
              </Button>
              <Button onClick={testStartPlayback} disabled={isLoading}>
                Play
              </Button>
              <Button onClick={testStopPlayback} disabled={isLoading}>
                Stop
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="playhead">Playhead Position</Label>
              <Input
                id="playhead"
                value={playheadPos}
                onChange={(e) => setPlayheadPos(e.target.value)}
                placeholder="e.g., 0"
              />
              <Button onClick={testSetPlayhead} disabled={isLoading}>
                Set Playhead
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch id="loop-active" checked={loopingActive} onCheckedChange={setLoopingActive} />
                <Label htmlFor="loop-active">Loop Active</Label>
              </div>
              <Label htmlFor="loopStart">Loop Start Bar</Label>
              <Input
                id="loopStart"
                value={loopStart}
                onChange={(e) => setLoopStart(e.target.value)}
                placeholder="e.g., 1"
                disabled={!loopingActive}
              />
              <Label htmlFor="loopEnd">Loop End Bar</Label>
              <Input
                id="loopEnd"
                value={loopEnd}
                onChange={(e) => setLoopEnd(e.target.value)}
                placeholder="e.g., 5"
                disabled={!loopingActive}
              />
              <Button onClick={testToggleLoop} disabled={isLoading}>
                Set Loop
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bpm">BPM</Label>
              <Input
                id="bpm"
                value={currentBpm}
                onChange={(e) => setCurrentBpm(e.target.value)}
                placeholder="e.g., 120"
              />
              <Button onClick={testSetBpm} disabled={isLoading}>
                Set BPM
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timesig">Time Signature</Label>
              <Input
                id="timesig"
                value={currentTimeSig}
                onChange={(e) => setCurrentTimeSig(e.target.value)}
                placeholder="e.g., 4/4"
              />
              <Button onClick={testSetTimeSig} disabled={isLoading}>
                Set Time Signature
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Timeline Clips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={testGetClips} disabled={isLoading}>
                Get All Clips
              </Button>
              <Button onClick={testClearAllClips} variant="destructive" disabled={isLoading}>
                Clear All Clips (DEV)
              </Button>
            </div>
            <div className="space-y-2 border p-4 rounded-md">
              <h4 className="font-semibold">Create/Update Clip:</h4>
              <Label htmlFor="clipIdUpdate">Clip ID (for Update/Delete)</Label>
              <Input
                id="clipIdUpdate"
                value={clipIdToUpdate}
                onChange={(e) => setClipIdToUpdate(e.target.value)}
                placeholder="Existing clip ID"
              />
              <Label htmlFor="clipName">Name</Label>
              <Input id="clipName" value={clipName} onChange={(e) => setClipName(e.target.value)} />
              <Label htmlFor="clipStart">Start (numeric, e.g. beats or bars)</Label>
              <Input id="clipStart" value={clipStart} onChange={(e) => setClipStart(e.target.value)} />
              <Label htmlFor="clipLength">Length (numeric)</Label>
              <Input id="clipLength" value={clipLength} onChange={(e) => setClipLength(e.target.value)} />
              <Label htmlFor="clipColor">Color (hex)</Label>
              <Input id="clipColor" value={clipColor} onChange={(e) => setClipColor(e.target.value)} />
              <div className="flex space-x-2">
                <Button onClick={testCreateClip} disabled={isLoading}>
                  Create Clip
                </Button>
                <Button onClick={testUpdateClip} disabled={isLoading || !clipIdToUpdate}>
                  Update Clip
                </Button>
                <Button onClick={testDeleteClip} variant="outline" disabled={isLoading || !clipIdToUpdate}>
                  Delete Clip
                </Button>
              </div>
            </div>
            <div className="space-y-2 border p-4 rounded-md">
              <h4 className="font-semibold">Reorder Clips:</h4>
              <Label htmlFor="clipReorderIds">Clip IDs (comma-separated in new order)</Label>
              <Input
                id="clipReorderIds"
                value={clipIdsToReorder}
                onChange={(e) => setClipIdsToReorder(e.target.value)}
                placeholder="id1,id3,id2"
              />
              <Button onClick={testReorderClips} disabled={isLoading}>
                Reorder Clips
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ApiTestPage
