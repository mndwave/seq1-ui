"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiTestRunner } from "@/components/api-test-runner"
import { ApiInfo } from "@/components/api-info"

export default function ApiTestPage() {
  return (
    <div className="container mx-auto py-8 max-w-6xl bg-gray-950 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">SEQ1 API Test Suite</h1>
      <p className="text-gray-400 mb-8">
        This page tests all API endpoints to identify potential issues. Check server logs for detailed error
        information.
      </p>

      <ApiInfo />

      <Tabs defaultValue="all" className="mt-6">
        <TabsList className="grid grid-cols-6 mb-4">
          <TabsTrigger value="all">All Tests</TabsTrigger>
          <TabsTrigger value="transport">Transport</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="websocket">WebSocket</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ApiTestRunner category="all" />
        </TabsContent>

        <TabsContent value="transport">
          <ApiTestRunner category="transport" />
        </TabsContent>

        <TabsContent value="timeline">
          <ApiTestRunner category="timeline" />
        </TabsContent>

        <TabsContent value="devices">
          <ApiTestRunner category="devices" />
        </TabsContent>

        <TabsContent value="account">
          <ApiTestRunner category="account" />
        </TabsContent>

        <TabsContent value="websocket">
          <ApiTestRunner category="websocket" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
