"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DraggableModal from "@/components/draggable-modal"
import { User, CreditCard, Users } from "lucide-react"
import { getAccountInfo, type AccountInfo } from "@/lib/api/account-api"
import ProfileTab from "./account/profile-tab"
import BillingTab from "./account/billing-tab"
import ReferralTab from "./account/referral-tab"

interface AccountModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: "profile" | "billing" | "referral"
  onAccountUpdate?: (newHours: number) => void
  disableClose?: boolean
  showOutOfHoursMessage?: boolean
}

export default function AccountModal({
  isOpen,
  onClose,
  initialTab = "profile",
  onAccountUpdate,
  disableClose = false,
  showOutOfHoursMessage = false,
}: AccountModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [previousTab, setPreviousTab] = useState(initialTab)
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [barHeights, setBarHeights] = useState<number[]>([])

  useEffect(() => {
    if (isOpen) {
      loadAccountInfo()
    }
  }, [isOpen])

  // Update active tab when initialTab prop changes
  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  // Initialize and animate bar heights for the thinking indicator
  useEffect(() => {
    if (isLoading) {
      // Initialize bar heights
      setBarHeights(
        Array(16)
          .fill(0)
          .map(() => Math.random() * 0.6 + 0.2),
      )

      // Animate bar heights
      const interval = setInterval(() => {
        setBarHeights((prev) => prev.map(() => Math.random() * 0.6 + 0.2))
      }, 250) // Slower update for a more relaxed feel

      return () => clearInterval(interval)
    }
  }, [isLoading])

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
    // Notify parent component about account update if callback exists
    if (accountInfo && onAccountUpdate) {
      onAccountUpdate(accountInfo.hoursRemaining)
    }
  }

  // Determine slide direction based on tab order
  const getSlideDirection = (tabValue: string) => {
    const tabOrder = ["profile", "billing", "referral"]
    const currentIndex = tabOrder.indexOf(activeTab)
    const tabIndex = tabOrder.indexOf(tabValue)

    // If moving from a higher index to lower (right to left)
    if (currentIndex > tabIndex) {
      return "slide-right"
    }
    // If moving from a lower index to higher (left to right)
    return "slide-left"
  }

  const handleTabChange = (value: string) => {
    setPreviousTab(activeTab)
    setActiveTab(value)
  }

  // Calculate the appropriate height based on active tab
  const getTabHeight = () => {
    switch (activeTab) {
      case "profile":
        return "380px"
      case "billing":
        return "340px" // Reduced from 420px
      case "referral":
        return "340px" // Reduced from 420px
      default:
        return "360px"
    }
  }

  if (!isOpen) return null

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title="ACCOUNT"
      icon={<User size={16} />}
      width="w-[550px]"
      disableClose={disableClose}
    >
      <div className="p-3">
        {showOutOfHoursMessage && (
          <div className="mb-4 bg-red-900/20 border border-red-900/30 text-red-200 p-3 rounded text-sm flex items-start gap-2">
            <div className="mt-0.5 flex-shrink-0">⚠️</div>
            <div>
              <p className="font-medium mb-1">You've run out of creative time</p>
              <p>Please add more hours to continue using SEQ1's creative features.</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col justify-center items-center h-40">
            {/* Waveform animation from chat window */}
            <div className="h-6 flex items-center space-x-[1px] my-3">
              {barHeights.map((height, index) => (
                <div
                  key={index}
                  className="w-[2px] rounded-sm transition-all duration-300 ease-out"
                  style={{
                    height: `${height * 100}%`,
                    backgroundColor: "#f0e6c8", // Cream color
                    opacity: 0.6 + height * 0.4,
                  }}
                />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-40">
            <div className="text-red-500 text-sm">{error}</div>
            <button
              onClick={loadAccountInfo}
              className="ml-3 px-2 py-1 bg-[#3a2a30] text-[#f0e6c8] text-xs rounded hover:bg-[#4a3a40]"
            >
              Retry
            </button>
          </div>
        ) : accountInfo ? (
          <Tabs defaultValue={initialTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="profile" className="flex items-center gap-1 text-xs">
                <User size={12} />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-1 text-xs">
                <CreditCard size={12} />
                <span>Billing</span>
              </TabsTrigger>
              <TabsTrigger value="referral" className="flex items-center gap-1 text-xs">
                <Users size={12} />
                <span>Referrals</span>
              </TabsTrigger>
            </TabsList>

            <div className="relative overflow-hidden">
              <TabsContent
                value="profile"
                className="transition-all duration-300 ease-in-out absolute w-full"
                style={{
                  transform: activeTab === "profile" ? "translateX(0)" : "translateX(-100%)",
                  opacity: activeTab === "profile" ? 1 : 0,
                  zIndex: activeTab === "profile" ? 1 : 0,
                }}
              >
                <ProfileTab accountInfo={accountInfo} onUpdate={refreshAccountInfo} />
              </TabsContent>

              <TabsContent
                value="billing"
                className="transition-all duration-300 ease-in-out absolute w-full"
                style={{
                  transform:
                    activeTab === "billing"
                      ? "translateX(0)"
                      : activeTab === "profile"
                        ? "translateX(100%)"
                        : "translateX(-100%)",
                  opacity: activeTab === "billing" ? 1 : 0,
                  zIndex: activeTab === "billing" ? 1 : 0,
                }}
              >
                <BillingTab accountInfo={accountInfo} onUpdate={refreshAccountInfo} />
              </TabsContent>

              <TabsContent
                value="referral"
                className="transition-all duration-300 ease-in-out absolute w-full"
                style={{
                  transform: activeTab === "referral" ? "translateX(0)" : "translateX(100%)",
                  opacity: activeTab === "referral" ? 1 : 0,
                  zIndex: activeTab === "referral" ? 1 : 0,
                }}
              >
                <ReferralTab accountInfo={accountInfo} onUpdate={refreshAccountInfo} />
              </TabsContent>

              {/* Dynamic spacer div based on active tab */}
              <div className="transition-all duration-300" style={{ height: getTabHeight() }}></div>
            </div>
          </Tabs>
        ) : (
          <div className="flex justify-center items-center h-40">
            <div className="text-[#f0e6c8] text-sm">No account information available.</div>
          </div>
        )}
      </div>
    </DraggableModal>
  )
}
