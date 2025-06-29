"use client"

import { useState } from "react"
import { ChevronDown, AlertCircle, Check, Zap, Activity, Copy } from "lucide-react"
import { topUpAccount, type TopUpRequest } from "@/lib/api/account-api"
import type { AccountInfo } from "@/lib/api/account-api"
import { cn } from "@/lib/utils"
import { BoldthingsVintageButton } from "@/components/boldthings/vintage-button"

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
  const [copiedField, setCopiedField] = useState<string | null>(null)

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

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
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
  const progressColor = hoursPercentage > 50 ? "var(--seq1-pulse)" : 
                       hoursPercentage > 20 ? "var(--seq1-warning)" : "var(--seq1-danger)"

  return (
    <div className="space-y-6">
      {/* Enhanced Hours Display */}
      <div className="payment-container">
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-3">
            <h3 className="seq1-heading text-lg">Creative Hours</h3>
            <div className="flex items-center space-x-2">
              <Activity size={16} className="text-[var(--seq1-neural)]" />
              <span className="seq1-caption">Live Balance</span>
            </div>
          </div>
          
          <div className="relative">
            <div className="bg-[var(--seq1-core)] rounded-lg p-4 border border-[var(--seq1-border)]">
              <div className="flex justify-between items-center mb-2">
                <span className="seq1-body">Hours Remaining</span>
                <span className="seq1-heading text-2xl" style={{ color: progressColor }}>
                  {accountInfo.hoursRemaining.toFixed(1)}
                </span>
              </div>
              
              {/* Enhanced Progress Bar */}
              <div className="relative h-2 bg-[var(--seq1-void)] rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${hoursPercentage}%`,
                    background: `linear-gradient(90deg, ${progressColor}, ${progressColor}dd)`,
                    boxShadow: `0 0 10px ${progressColor}40`
                  }}
                />
                
                {/* Pulse effect for low hours */}
                {hoursPercentage < 20 && (
                  <div 
                    className="absolute inset-y-0 left-0 rounded-full animate-pulse"
                    style={{ 
                      width: `${hoursPercentage}%`,
                      background: progressColor,
                      opacity: 0.5
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Payment Form */}
      <div className="payment-container">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center space-x-3 mb-4">
            <Zap className="icon-abstract" size={20} />
            <h3 className="seq1-heading text-lg">Add Creative Hours</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="seq1-caption block mb-2">Amount</label>
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.00"
                className="w-full bg-[var(--seq1-core)] border border-[var(--seq1-border)] rounded-lg px-4 py-3 text-[var(--seq1-text-primary)] placeholder-[var(--seq1-text-muted)] focus:border-[var(--seq1-neural)] focus:ring-1 focus:ring-[var(--seq1-neural)] transition-all duration-200"
              />
            </div>

            <div>
              <label className="seq1-caption block mb-2">Currency</label>
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as "sats" | "usd")}
                  className="w-full bg-[var(--seq1-core)] border border-[var(--seq1-border)] rounded-lg px-4 py-3 text-[var(--seq1-text-primary)] appearance-none focus:border-[var(--seq1-neural)] focus:ring-1 focus:ring-[var(--seq1-neural)] transition-all duration-200"
                >
                  <option value="sats">Satoshis</option>
                  <option value="usd">USD</option>
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-[var(--seq1-text-secondary)]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="seq1-caption block mb-2">Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPaymentMethod("lightning")}
                className={cn(
                  "p-3 rounded-lg border transition-all duration-200 flex items-center justify-center space-x-2",
                  paymentMethod === "lightning"
                    ? "bg-[var(--seq1-neural)] border-[var(--seq1-neural)] text-white"
                    : "bg-[var(--seq1-surface)] border-[var(--seq1-border)] text-[var(--seq1-text-secondary)] hover:border-[var(--seq1-neural)]"
                )}
              >
                <Zap size={16} />
                <span>Lightning</span>
              </button>
              
              <button
                onClick={() => setPaymentMethod("onchain")}
                className={cn(
                  "p-3 rounded-lg border transition-all duration-200 flex items-center justify-center space-x-2",
                  paymentMethod === "onchain"
                    ? "bg-[var(--seq1-warning)] border-[var(--seq1-warning)] text-white"
                    : "bg-[var(--seq1-surface)] border-[var(--seq1-border)] text-[var(--seq1-text-secondary)] hover:border-[var(--seq1-warning)]"
                )}
              >
                <Activity size={16} />
                <span>On-chain</span>
              </button>
            </div>
          </div>

          {/* Hours Calculation Display */}
          <div className="bg-[var(--seq1-core)] p-4 rounded-lg border border-[var(--seq1-border)]">
            <div className="flex justify-between items-center">
              <span className="seq1-body">Hours to add:</span>
              <span className="seq1-heading text-xl text-[var(--seq1-pulse)]">
                {calculateHours().toFixed(2)} hrs
              </span>
            </div>
            <div className="flex justify-between items-center mt-2 text-sm">
              <span className="text-[var(--seq1-text-muted)]">Rate:</span>
              <span className="text-[var(--seq1-text-muted)]">${hourlyRate.toFixed(2)}/hr</span>
            </div>
          </div>

          {/* Payment Method Warning */}
          {paymentMethod === "onchain" && currency === "sats" && (
            <div className="flex items-start gap-3 p-3 bg-[var(--seq1-warning)]20 border border-[var(--seq1-warning)]40 rounded-lg">
              <AlertCircle size={16} className="text-[var(--seq1-warning)] mt-0.5 flex-shrink-0" />
              <div className="text-sm text-[var(--seq1-warning)]">
                Minimum on-chain payment is 20,000 sats due to network fees
              </div>
            </div>
          )}

          {/* Enhanced Generate Button */}
          <button
            onClick={handleTopUp}
            disabled={isProcessing || !amount}
            className={cn(
              "w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed",
              "relative overflow-hidden",
              isProcessing && "animate-pulse"
            )}
          >
            {isProcessing && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
            )}
            
            <div className="relative z-10 flex items-center justify-center space-x-2">
              {isProcessing ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  <span>Generating Payment...</span>
                </>
              ) : (
                <>
                  <Zap size={18} />
                  <span>Generate Payment Request</span>
                </>
              )}
            </div>
          </button>

          {/* Error Display */}
          {error && (
            <div className="bg-[var(--seq1-danger)]20 border border-[var(--seq1-danger)]40 text-[var(--seq1-danger)] p-4 rounded-lg flex items-start gap-3">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <div className="seq1-body">{error}</div>
            </div>
          )}

          {/* Success Display */}
          {success && (
            <div className="bg-[var(--seq1-pulse)]20 border border-[var(--seq1-pulse)]40 text-[var(--seq1-pulse)] p-4 rounded-lg flex items-start gap-3">
              <Check size={16} className="mt-0.5 flex-shrink-0" />
              <div className="seq1-body">{success}</div>
            </div>
          )}

          {/* Enhanced Payment Request Display */}
          {paymentRequest && (
            <div className="lightning-invoice">
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="seq1-heading text-lg">
                    {paymentMethod === "lightning" ? "⚡ Lightning Invoice" : "₿ Bitcoin Address"}
                  </h4>
                  <button
                    onClick={() => handleCopy(paymentRequest, "main")}
                    className={cn(
                      "btn-secondary px-4 py-2 flex items-center space-x-2",
                      copiedField === "main" && "bg-[var(--seq1-pulse)] text-white"
                    )}
                  >
                    {copiedField === "main" ? (
                      <>
                        <Check size={14} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Enhanced QR Code Display */}
                <div className="bg-white p-6 rounded-lg mb-4 flex justify-center">
                  <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-lg">
                    <svg viewBox="0 0 100 100" width="80%" height="80%">
                      {/* Enhanced QR Code placeholder with pattern */}
                      <defs>
                        <pattern id="qr-pattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                          <rect x="0" y="0" width="5" height="5" fill="#000" />
                          <rect x="5" y="5" width="5" height="5" fill="#000" />
                        </pattern>
                      </defs>
                      <rect x="10" y="10" width="80" height="80" fill="url(#qr-pattern)" />
                      {/* Corner markers */}
                      <rect x="15" y="15" width="15" height="15" fill="#000" />
                      <rect x="70" y="15" width="15" height="15" fill="#000" />
                      <rect x="15" y="70" width="15" height="15" fill="#000" />
                    </svg>
                  </div>
                </div>

                {/* Enhanced Payment String Display */}
                <div className="flex">
                  <input
                    type="text"
                    value={paymentRequest}
                    readOnly
                    className="flex-1 bg-[var(--seq1-void)] border border-[var(--seq1-border)] border-r-0 rounded-l-lg px-4 py-3 text-[var(--seq1-text-muted)] font-mono text-sm overflow-hidden"
                    style={{ fontSize: '11px' }}
                  />
                  <button
                    onClick={() => handleCopy(paymentRequest, "input")}
                    className={cn(
                      "border border-[var(--seq1-border)] rounded-r-lg px-4 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-2",
                      copiedField === "input" 
                        ? "bg-[var(--seq1-pulse)] text-white border-[var(--seq1-pulse)]"
                        : "bg-[var(--seq1-surface)] text-[var(--seq1-text-primary)] hover:bg-[var(--seq1-accent)]"
                    )}
                  >
                    {copiedField === "input" ? <Check size={14} /> : <Copy size={14} />}
                    <span className="hidden sm:inline">
                      {copiedField === "input" ? "Copied" : "Copy"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
