import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RealApiTestRunner } from "@/components/real-api-test-runner"

export default function ApiTestPage() {
  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">SEQ1 API Test Suite</h1>
        <p className="text-gray-400">
          Test your SEQ1 API endpoints with direct API calls to verify connectivity and functionality.
        </p>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Tests</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="transport">Transport</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <RealApiTestRunner category="all" />
        </TabsContent>

        <TabsContent value="system">
          <RealApiTestRunner category="system" />
        </TabsContent>

        <TabsContent value="transport">
          <RealApiTestRunner category="transport" />
        </TabsContent>

        <TabsContent value="timeline">
          <RealApiTestRunner category="timeline" />
        </TabsContent>

        <TabsContent value="account">
          <RealApiTestRunner category="account" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
