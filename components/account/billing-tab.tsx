"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { type AccountInfo, topUpAccount, type TopUpRequest } from "@/lib/api/account-api"
import { Zap, Bitcoin, Hourglass, CheckCircle, AlertCircle } from "lucide-react"
import Image from "next/image" // For placeholder QR

interface BillingTabProps {
  accountInfo: AccountInfo
  onUpdate: () => void // To refresh account info after successful top-up
}

const PRICING_PER_HOUR_USD = 0.35 // $0.35 per hour
const MIN_HOURS = 10
const DEFAULT_HOURS = 20
const MAX_HOURS = 500

export default function BillingTab({ accountInfo, onUpdate }: BillingTabProps) {
  const [hoursToPurchase, setHoursToPurchase] = useState(DEFAULT_HOURS)
  const [paymentMethod, setPaymentMethod] = useState<"lightning" | "onchain">("lightning")
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentRequest, setPaymentRequest] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { toast } = useToast()

  const usdCost = (hoursToPurchase * PRICING_PER_HOUR_USD).toFixed(2)

  useEffect(() => {
    // Reset payment state if hours or method change
    setPaymentRequest(null)
    setError(null)
    setSuccessMessage(null)
  }, [hoursToPurchase, paymentMethod])

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = Number.parseInt(e.target.value, 10)
    if (isNaN(value)) value = MIN_HOURS
    if (value < MIN_HOURS) value = MIN_HOURS
    if (value > MAX_HOURS) value = MAX_HOURS
    setHoursToPurchase(value)
  }

  const handleTopUp = async () => {
    setIsProcessing(true)
    setError(null)
    setSuccessMessage(null)
    setPaymentRequest(null)

    const topUpPayload: TopUpRequest = {
      amount: hoursToPurchase, // API expects amount in hours
      currency: "usd", // We calculate USD, API might handle conversion or expect hours
      paymentMethod: paymentMethod,
    }

    try {
      const response = await topUpAccount(topUpPayload)
      if (response.success && response.paymentRequest) {
        setPaymentRequest(response.paymentRequest)
        setSuccessMessage(`Invoice created for ${hoursToPurchase} Creative Hours. Please complete the payment.`)
        toast({
          title: "Invoice Created",
          description: "Scan the QR code or use the payment request string.",
        })
        // Note: Actual crediting of hours would happen after webhook confirmation from payment gateway
        // For now, we can optimistically call onUpdate or wait for a real confirmation.
        // Let's assume a webhook would trigger onUpdate.
      } else {
        setError(response.error || "Failed to create payment request.")
        toast({
          title: "Error",
          description: response.error || "Could not initiate top-up.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Top-up error:", err)
      const message = err instanceof Error ? err.message : "An unexpected error occurred."
      setError(message)
      toast({
        title: "Top-up Failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#2a1a20] border-[#3a2a30]">
        <CardHeader>
          <CardTitle className="text-[#f0e6c8] text-lg flex items-center">
            <Hourglass size={20} className="mr-2 text-yellow-400" />
            Your Current Studio Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-yellow-400">
            {accountInfo.hoursRemaining.toFixed(2)} <span className="text-lg font-normal text-[#a09080]">hours</span>
          </p>
          <p className="text-xs text-[#a09080] mt-1">
            Includes {accountInfo.hoursFromReferrals.toFixed(2)} hours earned from referrals.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-[#2a1a20] border-[#3a2a30]">
        <CardHeader>
          <CardTitle className="text-[#f0e6c8] text-lg">Add More Studio Time</CardTitle>
          <CardDescription className="text-[#a09080]">
            Fuel your creativity. Each hour is ${PRICING_PER_HOUR_USD}. Pay with Bitcoin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="hours" className="text-sm text-[#f0e6c8]">
              Creative Hours to Add ({MIN_HOURS}-{MAX_HOURS})
            </Label>
            <Input
              id="hours"
              type="number"
              value={hoursToPurchase}
              onChange={handleHoursChange}
              min={MIN_HOURS}
              max={MAX_HOURS}
              className="mt-1 bg-[#3a2a30] border-[#4a3a40] text-[#f0e6c8]"
            />
            <p className="text-sm text-yellow-400 mt-2">
              Total Cost: <span className="font-semibold">${usdCost}</span>
            </p>
          </div>

          <div>
            <Label className="text-sm text-[#f0e6c8]">Payment Method</Label>
            <RadioGroup
              defaultValue="lightning"
              value={paymentMethod}
              onValueChange={(value: "lightning" | "onchain") => setPaymentMethod(value)}
              className="mt-1 grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="lightning" id="lightning" className="peer sr-only" />
                <Label
                  htmlFor="lightning"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-[#3a2a30] p-3 hover:bg-[#4a3a40] hover:text-accent-foreground peer-data-[state=checked]:border-yellow-400 [&:has([data-state=checked])]:border-yellow-400 cursor-pointer"
                >
                  <Zap size={24} className="mb-2 text-yellow-400" />
                  Lightning (Instant)
                </Label>
              </div>
              <div>
                <RadioGroupItem value="onchain" id="onchain" className="peer sr-only" />
                <Label
                  htmlFor="onchain"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-[#3a2a30] p-3 hover:bg-[#4a3a40] hover:text-accent-foreground peer-data-[state=checked]:border-yellow-400 [&:has([data-state=checked])]:border-yellow-400 cursor-pointer"
                >
                  <Bitcoin size={24} className="mb-2 text-yellow-400" />
                  Bitcoin (On-Chain)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-4">
          <Button
            onClick={handleTopUp}
            disabled={isProcessing || hoursToPurchase < MIN_HOURS}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
          >
            {isProcessing
              ? "Processing..."
              : `Get ${hoursToPurchase} Hours via ${paymentMethod === "lightning" ? "Lightning" : "Bitcoin"}`}
          </Button>

          {error && (
            <div className="text-red-400 text-sm p-3 bg-red-900/20 border border-red-900/30 rounded-md w-full flex items-start">
              <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}
          {successMessage &&
            !paymentRequest && ( // Show general success if no QR needed yet
              <div className="text-green-400 text-sm p-3 bg-green-900/20 border border-green-900/30 rounded-md w-full flex items-start">
                <CheckCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
                {successMessage}
              </div>
            )}

          {paymentRequest && (
            <div className="w-full p-4 bg-[#3a2a30] rounded-md space-y-3 text-center">
              <p className="text-sm text-[#f0e6c8]">Scan the QR code or copy the payment request below.</p>
              <div className="flex justify-center">
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentRequest)}`}
                  alt={`${paymentMethod} Payment QR Code`}
                  width={200}
                  height={200}
                  className="rounded-md border border-[#4a3a40]"
                />
              </div>
              <Input
                type="text"
                readOnly
                value={paymentRequest}
                className="bg-[#2a1a20] border-[#4a3a40] text-[#f0e6c8] text-xs text-center"
                onFocus={(e) => e.target.select()}
              />
              <p className="text-xs text-[#a09080]">
                This window will update automatically after payment confirmation. You can also refresh your studio time
                manually later.
              </p>
              <Button
                onClick={onUpdate}
                variant="outline"
                size="sm"
                className="mt-2 border-[#4a3a40] text-[#a09080] hover:bg-[#4a3a40] hover:text-[#f0e6c8]"
              >
                Check Payment Status / Refresh Time
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
      <p className="text-xs text-center text-[#a09080] mt-4">
        All payments are final. Studio Time is non-refundable. SEQ1 is currently in active development; features and
        pricing are subject to change.
      </p>
    </div>
  )
}
