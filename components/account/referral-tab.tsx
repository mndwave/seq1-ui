"use client"

import { useState } from "react"
import { type AccountInfo, claimReferralCode } from "@/lib/api/account-api"
import { Copy, AlertCircle, Check } from "lucide-react"

interface ReferralTabProps {
  accountInfo: AccountInfo
  onUpdate: () => void
}

export default function ReferralTab({ accountInfo, onUpdate }: ReferralTabProps) {
  const [referralCode, setReferralCode] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(accountInfo.referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClaimReferralCode = async () => {
    if (!referralCode.trim()) {
      setError("Please enter a referral code")
      return
    }

    try {
      setIsProcessing(true)
      setError(null)
      setSuccess(null)

      const response = await claimReferralCode(referralCode.trim())

      if (response.success) {
        setSuccess(`Successfully claimed referral code! ${response.hoursAdded} hours have been added to your account.`)
        setReferralCode("")
        // After successful claim, refresh account info
        onUpdate()
      } else {
        setError(response.error || "Failed to claim referral code")
      }
    } catch (error) {
      console.error("Error claiming referral code:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4 text-sm">
      <div className="bg-[#3a2a30] p-3 rounded">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-[#f0e6c8] text-sm font-medium">Your Referrals</h3>
            <p className="text-[#a09080] text-xs mt-0.5">Share SEQ1 and earn creative time</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-[#f0e6c8]">{accountInfo.referralCount || 0}</div>
            <div className="text-[#a09080] text-xs mt-0.5">Successful referrals</div>
          </div>
        </div>
      </div>

      <div className="border border-[#3a2a30] rounded p-3">
        <h3 className="text-[#f0e6c8] text-xs font-medium mb-2">Your Referral Code</h3>

        <div className="space-y-3">
          <div className="flex">
            <input
              type="text"
              value={accountInfo.referralCode}
              readOnly
              className="flex-1 bg-[#2a1a20] border border-[#3a2a30] border-r-0 rounded-l px-2 py-1.5 text-xs text-[#f0e6c8]"
            />
            <button
              onClick={handleCopyReferralCode}
              className="bg-[#3a2a30] border border-[#3a2a30] rounded-r px-2 py-1.5 text-xs text-[#f0e6c8] hover:bg-[#4a3a40] flex items-center gap-1 whitespace-nowrap"
            >
              {copied ? "Copied!" : "Copy"}
              <Copy size={12} />
            </button>
          </div>

          <div className="bg-[#2a1a20] p-2 rounded text-xs text-[#f0e6c8]">
            <p>
              When someone enters your code, you both get <span className="font-medium">3 hours free</span>.
            </p>
            <p className="mt-0.5 text-[#a09080]">There's no limit to how much time you can earn.</p>
          </div>
        </div>
      </div>

      <div className="border border-[#3a2a30] rounded p-3">
        <h3 className="text-[#f0e6c8] text-xs font-medium mb-2">Have a Referral Code?</h3>

        <div className="space-y-3">
          <div className="flex">
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="Enter referral code"
              className="flex-1 bg-[#2a1a20] border border-[#3a2a30] border-r-0 rounded-l px-2 py-1.5 text-xs text-[#f0e6c8]"
            />
            <button
              onClick={handleClaimReferralCode}
              disabled={isProcessing || !referralCode.trim()}
              className="bg-[#3a2a30] border border-[#3a2a30] rounded-r px-2 py-1.5 text-xs text-[#f0e6c8] hover:bg-[#4a3a40] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isProcessing ? "Processing..." : "Claim"}
            </button>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-900/30 text-red-200 p-2 rounded text-xs flex items-start gap-1.5">
              <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
              <div>{error}</div>
            </div>
          )}

          {success && (
            <div className="bg-green-900/20 border border-green-900/30 text-green-200 p-2 rounded text-xs flex items-start gap-1.5">
              <Check size={12} className="mt-0.5 flex-shrink-0" />
              <div>{success}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
