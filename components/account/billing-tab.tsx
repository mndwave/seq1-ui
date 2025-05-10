"use client"

import type React from "react"

import { useState } from "react"
import { type AccountInfo, topUpAccount, type TopUpRequest } from "@/lib/api/account-api"
import { AlertCircle, Check, ChevronDown } from "lucide-react"

interface BillingTabProps {
  accountInfo: AccountInfo
  onUpdate: () => void
}

export default function BillingTab({ accountInfo, onUpdate }: BillingTabProps) {
  const [amount, setAmount] = useState("")
  const [currency, setCurrency] = useState<"sats" | "usd">("sats")
  const [paymentMethod, setPaymentMethod] = useState<"lightning" | "onchain">("lightning")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [paymentRequest, setPaymentRequest] = useState<string | null>(null)

  const hourlyRate = 0.35 // $0.35 per hour
  const maxHours = 100 // Maximum hours for the progress bar

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, "")
    setAmount(value)
  }

  const calculateHours = () => {
    if (!amount) return 0

    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount)) return 0

    if (currency === "usd") {
      return numAmount / hourlyRate
    } else {
      // Convert sats to USD (approximate)
      const usdAmount = numAmount / 100000 // Very rough approximation
      return usdAmount / hourlyRate
    }
  }

  const handleTopUp = async () => {
    try {
      setIsProcessing(true)
      setError(null)
      setSuccess(null)
      setPaymentRequest(null)

      const numAmount = Number.parseFloat(amount)
      if (isNaN(numAmount) || numAmount <= 0) {
        setError("Please enter a valid amount")
        return
      }

      // Check minimum for on-chain
      if (currency === "sats" && paymentMethod === "onchain" && numAmount < 20000) {
        setError("Minimum on-chain payment is 20,000 sats")
        return
      }

      const request: TopUpRequest = {
        amount: numAmount,
        currency,
        paymentMethod,
      }

      const response = await topUpAccount(request)

      if (response.success) {
        setSuccess(`Successfully generated payment request for ${response.hoursAdded?.toFixed(2)} hours`)
        setPaymentRequest(response.paymentRequest || null)
        // After successful top-up, refresh account info
        onUpdate()
      } else {
        setError(response.error || "Failed to process payment")
      }
    } catch (error) {
      console.error("Error processing top-up:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Calculate percentage for progress bar
  const hoursPercentage = Math.min((accountInfo.hoursRemaining / maxHours) * 100, 100)

  return (
    <div className="space-y-4 text-sm">
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-[#f0e6c8] text-sm font-medium">Creative Time</h3>
          <div className="text-right">
            <div className="text-base font-bold text-[#f0e6c8]">{accountInfo.hoursRemaining.toFixed(1)} hrs</div>
          </div>
        </div>

        <div className="h-2.5 bg-[#2a1a20] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#f0e6c8] to-[#e0d6b8]"
            style={{ width: `${hoursPercentage}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-xs text-[#a09080] mt-0.5">
          <span>0 hrs</span>
          <span>{maxHours} hrs</span>
        </div>
      </div>

      <div className="border border-[#3a2a30] rounded p-2.5">
        <h3 className="text-[#f0e6c8] text-xs font-medium mb-2">Add Creative Time</h3>

        <div className="space-y-2.5">
          {/* Changed from grid to flex with gap for better spacing control */}
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs text-[#a09080] mb-0.5">Amount</label>
              <div className="flex">
                <input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder={currency === "sats" ? "10000" : "5.00"}
                  className="flex-1 bg-[#2a1a20] border border-[#3a2a30] border-r-0 rounded-l px-2 py-1.5 text-xs text-[#f0e6c8]"
                />
                <div className="relative">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as "sats" | "usd")}
                    className="bg-[#3a2a30] border border-[#3a2a30] rounded-r pl-2 pr-6 py-1.5 text-xs text-[#f0e6c8] appearance-none"
                  >
                    <option value="sats">Sats</option>
                    <option value="usd">USD</option>
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-[#f0e6c8]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs text-[#a09080] mb-0.5">Payment Method</label>
              <div className="relative">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as "lightning" | "onchain")}
                  className="w-full bg-[#2a1a20] border border-[#3a2a30] rounded pl-2 pr-6 py-1.5 text-xs text-[#f0e6c8] appearance-none"
                >
                  <option value="lightning">Lightning</option>
                  <option value="onchain">On-chain Bitcoin</option>
                </select>
                <ChevronDown
                  size={12}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-[#a09080]"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#2a1a20] p-2 rounded">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[#a09080]">Hours to add:</span>
              <span className="text-xs font-medium text-[#f0e6c8]">{calculateHours().toFixed(2)} hrs</span>
            </div>
            <div className="flex justify-between items-center mt-0.5">
              <span className="text-xs text-[#a09080]">Rate:</span>
              <span className="text-xs text-[#a09080]">${hourlyRate.toFixed(2)}/hr</span>
            </div>
          </div>

          {paymentMethod === "onchain" && currency === "sats" && (
            <div className="flex items-start gap-1.5 text-xs text-[#a09080]">
              <AlertCircle size={12} className="text-[#a09080] mt-0.5 flex-shrink-0" />
              <div>Minimum on-chain payment is 20,000 sats</div>
            </div>
          )}

          <button
            onClick={handleTopUp}
            disabled={isProcessing || !amount}
            className="w-full bg-[#3a2a30] hover:bg-[#4a3a40] text-[#f0e6c8] py-1.5 rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : "Generate Payment Request"}
          </button>

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

          {paymentRequest && (
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-[#f0e6c8]">
                  {paymentMethod === "lightning" ? "Lightning Invoice" : "Bitcoin Address"}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(paymentRequest)}
                  className="text-xs bg-[#3a2a30] text-[#f0e6c8] px-1.5 py-0.5 rounded hover:bg-[#4a3a40]"
                >
                  Copy
                </button>
              </div>

              {/* QR Code */}
              <div className="bg-white p-3 rounded flex justify-center mb-2">
                <div className="w-32 h-32 bg-[#f0f0f0] flex items-center justify-center">
                  <svg viewBox="0 0 100 100" width="100%" height="100%">
                    <rect x="10" y="10" width="80" height="80" fill="#000" />
                    <rect x="20" y="20" width="60" height="60" fill="#fff" />
                    <rect x="30" y="30" width="40" height="40" fill="#000" />
                    {/* This is a placeholder for a real QR code */}
                  </svg>
                </div>
              </div>

              <div className="flex">
                <input
                  type="text"
                  value={paymentRequest}
                  readOnly
                  className="flex-1 bg-[#2a1a20] border border-[#3a2a30] border-r-0 rounded-l px-2 py-1.5 text-xs text-[#a09080] font-mono overflow-hidden text-ellipsis"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(paymentRequest)}
                  className="bg-[#3a2a30] border border-[#3a2a30] rounded-r px-2 py-1.5 text-xs text-[#f0e6c8] hover:bg-[#4a3a40] flex items-center gap-1 whitespace-nowrap"
                >
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
