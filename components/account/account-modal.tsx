"use client"

import DraggableModal from "@/components/draggable-modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProfileTab from "./profile-tab"
import CreativeIdentityTab from "./creative-identity-tab" // Updated import
import BillingTab from "./billing-tab"
import DangerZoneTab from "./danger-zone-tab"
import ReferralTab from "./referral-tab"
import { User, CreditCard, AlertTriangle, Briefcase, KeyRound, GiftIcon } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: "profile" | "identity" | "billing" | "referrals" | "danger"
}

export default function AccountModal({ isOpen, onClose, initialTab = "profile" }: AccountModalProps) {
  const { user } = useAuth()

  const modalTitle = user ? `Your Studio Settings` : "Account Settings"

  const accountInfo = null // Placeholder, replace with actual account info fetching logic
  const refreshAccountInfo = () => {} // Placeholder, replace with actual refresh logic

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      icon={<Briefcase size={16} className="text-[#a09080]" />}
      width="w-full max-w-2xl" // Responsive width
    >
      <div className="p-0.5">
        {" "}
        {/* Reduced padding for Tabs component to fit better */}
        <Tabs defaultValue={initialTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 mb-2 bg-[#22151a] p-1 h-auto">
            <TabsTrigger
              value="profile"
              className="text-xs px-2 py-1.5 data-[state=active]:bg-[#3a2a30] data-[state=active]:text-[#f0e6c8]"
            >
              <User size={14} className="mr-1.5 hidden sm:inline" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="identity"
              className="text-xs px-2 py-1.5 data-[state=active]:bg-[#3a2a30] data-[state=active]:text-[#f0e6c8]"
            >
              <KeyRound size={14} className="mr-1.5 hidden sm:inline" />
              Creative ID
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="text-xs px-2 py-1.5 data-[state=active]:bg-[#3a2a30] data-[state=active]:text-[#f0e6c8]"
            >
              <CreditCard size={14} className="mr-1.5 hidden sm:inline" />
              Studio Access
            </TabsTrigger>
            <TabsTrigger
              value="referrals"
              className="text-xs px-2 py-1.5 data-[state=active]:bg-[#3a2a30] data-[state=active]:text-[#f0e6c8]"
            >
              <GiftIcon size={14} className="mr-1.5 hidden sm:inline" />
              Referrals
            </TabsTrigger>
            <TabsTrigger
              value="danger"
              className="text-xs px-2 py-1.5 data-[state=active]:bg-[#3a2a30] data-[state=active]:text-red-400 text-red-500/80 hover:text-red-500"
            >
              <AlertTriangle size={14} className="mr-1.5 hidden sm:inline" />
              Danger Zone
            </TabsTrigger>
          </TabsList>

          <div className="mt-2 max-h-[65vh] overflow-y-auto px-1 py-1 rounded-md bg-[#22151a]">
            <TabsContent value="profile" className="p-3">
              <ProfileTab />
            </TabsContent>
            <TabsContent value="identity" className="p-3">
              <CreativeIdentityTab />
            </TabsContent>
            <TabsContent value="billing" className="p-3">
              <BillingTab accountInfo={accountInfo} onUpdate={refreshAccountInfo} />
            </TabsContent>
            <TabsContent value="referrals" className="p-3">
              <ReferralTab accountInfo={accountInfo} onUpdate={refreshAccountInfo} />
            </TabsContent>
            <TabsContent value="danger" className="p-3">
              <DangerZoneTab
                onAccountDeleted={() => {
                  onClose() // Close the modal
                  // The logout is handled within DangerZoneTab itself now
                }}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </DraggableModal>
  )
}
