"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BillingTab from "./billing-tab"
import ReferralTab from "./referral-tab"
import { getAccountInfo, type AccountInfo } from "@/lib/api/account-api"

interface TimeoutModalProps {
  isOpen: boolean
}

export default function TimeoutModal({ isOpen }: TimeoutModalProps) {
  const [activeTab, setActiveTab] = useState("billing")
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Set mounted state after component mounts (for SSR compatibility)
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadAccountInfo()
    }
  }, [isOpen])

  const loadAccountInfo = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const info = await getAccountInfo()
      // Override hours remaining to 0 for this modal
      info.hoursRemaining = 0
      setAccountInfo(info)
    } catch (err) {
      console.error("Failed to load account info:", err)
      setError("Failed to load account information. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const refreshAccountInfo = () => {
    loadAccountInfo()
  }

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-[#2a1a20] border-2 border-[#3a2a30] w-[600px] max-w-[90vw] max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="bg-red-900/30 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={24} className="text-red-300 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-[#f0e6c8] text-xl font-medium">Creative Time Depleted</h2>
              <p className="text-[#a09080] mt-1">You've used your 5 free hours. Add time to continue creating.</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse text-[#f0e6c8]">Loading account information...</div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-red-500">{error}</div>
              <button
                onClick={loadAccountInfo}
                className="ml-4 px-3 py-1 bg-[#3a2a30] text-[#f0e6c8] text-xs rounded hover:bg-[#4a3a40]"
              >
                Retry
              </button>
            </div>
          ) : accountInfo ? (
            <Tabs defaultValue="billing" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="billing">Add Time</TabsTrigger>
                <TabsTrigger value="referral">Use Referral</TabsTrigger>
              </TabsList>

              <TabsContent value="billing">
                <BillingTab accountInfo={accountInfo} onUpdate={refreshAccountInfo} />
              </TabsContent>

              <TabsContent value="referral">
                <ReferralTab accountInfo={accountInfo} onUpdate={refreshAccountInfo} />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex justify-center items-center h-64">
              <div className="text-[#f0e6c8]">No account information available.</div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
