"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { type AccountInfo, claimReferralCode } from "@/lib/api/account-api"
import { Copy, Gift, Users, CheckCircle, AlertCircle, ExternalLink } from "lucide-react"

interface ReferralTabProps {
  accountInfo: AccountInfo
  onUpdate: () => void // To refresh account info after successful claim
}

export default function ReferralTab({ accountInfo, onUpdate }: ReferralTabProps) {
  const [claimCode, setClaimCode] = useState("")
  const [isProcessingClaim, setIsProcessingClaim] = useState(false)
  const [claimError, setClaimError] = useState<string | null>(null)
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState(false)
  const { toast } = useToast()

  const referralLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://seq1.city"}/?ref=${accountInfo.referralCode}`

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(accountInfo.referralCode)
    setCopiedCode(true)
    toast({ title: "Copied!", description: "Your referral code is copied to clipboard." })
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleCopyReferralLink = () => {
    navigator.clipboard.writeText(referralLink)
    toast({ title: "Copied!", description: "Your referral link is copied to clipboard." })
  }

  const handleClaimReferralCode = async () => {
    if (!claimCode.trim()) {
      setClaimError("Please enter a referral code to claim.")
      return
    }

    setIsProcessingClaim(true)
    setClaimError(null)
    setClaimSuccess(null)

    try {
      const response = await claimReferralCode(claimCode.trim())
      if (response.success) {
        const successMsg = `Successfully claimed code! ${response.hoursAdded || 0} Creative Hours added to your studio.`
        setClaimSuccess(successMsg)
        toast({ title: "Referral Claimed!", description: successMsg })
        setClaimCode("")
        onUpdate() // Refresh account info
      } else {
        setClaimError(response.error || "Failed to claim referral code. It might be invalid or already used.")
        toast({
          title: "Claim Failed",
          description: response.error || "Could not claim the referral code.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error claiming referral code:", err)
      const message = err instanceof Error ? err.message : "An unexpected error occurred."
      setClaimError(message)
      toast({
        title: "Claim Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsProcessingClaim(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#2a1a20] border-[#3a2a30]">
        <CardHeader>
          <CardTitle className="text-[#f0e6c8] text-lg flex items-center">
            <Gift size={20} className="mr-2 text-pink-400" />
            Share SEQ1, Earn Studio Time
          </CardTitle>
          <CardDescription className="text-[#a09080]">
            Invite fellow creators to SEQ1. When they sign up using your code, you both get{" "}
            <span className="font-semibold text-pink-300">3 free Creative Hours</span>. There's no limit to how much
            Studio Time you can earn!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="referralCode" className="text-sm text-[#f0e6c8]">
              Your Unique Referral Code
            </Label>
            <div className="flex mt-1">
              <Input
                id="referralCode"
                type="text"
                value={accountInfo.referralCode}
                readOnly
                className="flex-1 bg-[#3a2a30] border-[#4a3a40] text-[#f0e6c8] rounded-r-none focus:ring-0 focus:ring-offset-0"
              />
              <Button
                onClick={handleCopyReferralCode}
                variant="outline"
                className="rounded-l-none border-[#4a3a40] bg-[#3a2a30] text-[#a09080] hover:bg-[#4a3a40] hover:text-[#f0e6c8]"
              >
                <Copy size={16} className="mr-2" />
                {copiedCode ? "Copied!" : "Copy Code"}
              </Button>
            </div>
          </div>
          <div>
            <Label htmlFor="referralLink" className="text-sm text-[#f0e6c8]">
              Your Referral Link
            </Label>
            <div className="flex mt-1">
              <Input
                id="referralLink"
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 bg-[#3a2a30] border-[#4a3a40] text-[#f0e6c8] rounded-r-none focus:ring-0 focus:ring-offset-0 text-xs"
              />
              <Button
                onClick={handleCopyReferralLink}
                variant="outline"
                className="rounded-l-none border-[#4a3a40] bg-[#3a2a30] text-[#a09080] hover:bg-[#4a3a40] hover:text-[#f0e6c8]"
              >
                <ExternalLink size={16} className="mr-2" />
                Copy Link
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-[#3a2a30]/50 p-4 rounded-b-md">
          <div className="flex items-center space-x-4">
            <Users size={24} className="text-pink-400" />
            <div>
              <p className="text-xl font-bold text-[#f0e6c8]">{accountInfo.referralCount || 0}</p>
              <p className="text-xs text-[#a09080]">Successful Referrals</p>
            </div>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <Hourglass size={24} className="text-yellow-400" />
            <div>
              <p className="text-xl font-bold text-[#f0e6c8]">{accountInfo.hoursFromReferrals.toFixed(2)}</p>
              <p className="text-xs text-[#a09080]">Hours Earned</p>
            </div>
          </div>
        </CardFooter>
      </Card>

      <Card className="bg-[#2a1a20] border-[#3a2a30]">
        <CardHeader>
          <CardTitle className="text-[#f0e6c8] text-lg">Got a Referral Code?</CardTitle>
          <CardDescription className="text-[#a09080]">
            Enter a code someone shared with you to claim your bonus Creative Hours.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="claimCode" className="text-sm text-[#f0e6c8]">
              Enter Code
            </Label>
            <div className="flex mt-1">
              <Input
                id="claimCode"
                type="text"
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                placeholder="FRIENDLYCODE123"
                className="flex-1 bg-[#3a2a30] border-[#4a3a40] text-[#f0e6c8] rounded-r-none"
                disabled={isProcessingClaim}
              />
              <Button
                onClick={handleClaimReferralCode}
                disabled={isProcessingClaim || !claimCode.trim()}
                className="rounded-l-none bg-pink-500 hover:bg-pink-600 text-white"
              >
                {isProcessingClaim ? "Claiming..." : "Claim Hours"}
              </Button>
            </div>
          </div>
          {claimError && (
            <div className="text-red-400 text-sm p-3 bg-red-900/20 border border-red-900/30 rounded-md flex items-start">
              <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
              {claimError}
            </div>
          )}
          {claimSuccess && (
            <div className="text-green-400 text-sm p-3 bg-green-900/20 border border-green-900/30 rounded-md flex items-start">
              <CheckCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
              {claimSuccess}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
