"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DraggableModal from "@/components/draggable-modal"
import { User, CreditCard, Users, AlertTriangle } from "lucide-react"
import NostrIdentityTab from "./nostr-identity-tab"
import BillingTab from "./billing-tab"
import ReferralTab from "./referral-tab"
import DangerZoneTab from "./danger-zone-tab"
import { getAccountInfo, type AccountInfo } from "@/lib/api/account-api"

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const [activeTab, setActiveTab] = useState("identity")
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  if (!isOpen) return null

  return (
    <DraggableModal isOpen={isOpen} onClose={onClose} title="Account" icon={<User size={16} />} width="w-[600px]">
      <div className="p-4">
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
          <Tabs defaultValue="identity" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="identity" className="flex items-center gap-2">
                <User size={14} />
                <span>Identity</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard size={14} />
                <span>Billing</span>
              </TabsTrigger>
              <TabsTrigger value="referral" className="flex items-center gap-2">
                <Users size={14} />
                <span>Referrals</span>
              </TabsTrigger>
              <TabsTrigger value="danger" className="flex items-center gap-2">
                <AlertTriangle size={14} />
                <span>Danger Zone</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="identity">
              <NostrIdentityTab accountInfo={accountInfo} onUpdate={refreshAccountInfo} />
            </TabsContent>

            <TabsContent value="billing">
              <BillingTab accountInfo={accountInfo} onUpdate={refreshAccountInfo} />
            </TabsContent>

            <TabsContent value="referral">
              <ReferralTab accountInfo={accountInfo} onUpdate={refreshAccountInfo} />
            </TabsContent>

            <TabsContent value="danger">
              <DangerZoneTab onAccountDeleted={onClose} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex justify-center items-center h-64">
            <div className="text-[#f0e6c8]">No account information available.</div>
          </div>
        )}
      </div>
    </DraggableModal>
  )
}
