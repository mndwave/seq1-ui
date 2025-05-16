import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiTestRunner } from "@/components/api-test-runner"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "SEQ1 | API Test Suite",
  description: "Test and verify SEQ1 API endpoints and functionality",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
}

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

        <TabsContent value="all" className="transition-all duration-300 ease-in-out">
          <ApiTestRunner category="all" />
        </TabsContent>

        <TabsContent value="system" className="transition-all duration-300 ease-in-out">
          <ApiTestRunner category="system" />
        </TabsContent>

        <TabsContent value="transport" className="transition-all duration-300 ease-in-out">
          <ApiTestRunner category="transport" />
        </TabsContent>

        <TabsContent value="timeline" className="transition-all duration-300 ease-in-out">
          <ApiTestRunner category="timeline" />
        </TabsContent>

        <TabsContent value="account" className="transition-all duration-300 ease-in-out">
          <ApiTestRunner category="account" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
