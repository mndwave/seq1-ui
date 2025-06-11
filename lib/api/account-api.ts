import { makeApiRequest } from "@/lib/server/api-server"

export interface AccountInfo {
  npub: string
  nprofile?: string
  profilePicture?: string
  displayName?: string
  username?: string
  website?: string
  about?: string
  hoursRemaining: number
  hoursFromReferrals: number
  valueSaved: number
  referralCode: string
  referralCount: number
}

export interface TopUpRequest {
  amount: number
  currency: "sats" | "usd"
  paymentMethod: "lightning" | "onchain"
}

export interface TopUpResponse {
  success: boolean
  error?: string
  hoursAdded?: number
  paymentRequest?: string
}

export interface ReferralResponse {
  success: boolean
  error?: string
  hoursAdded?: number
}

// Get account info - NO FALLBACKS
export async function getAccountInfo(): Promise<AccountInfo> {
  console.log("🔴 DIRECT API CALL: Fetching account info...")
  const response = await makeApiRequest("/api/account", {
    method: "GET",
  })
  console.log("🔴 DIRECT API RESPONSE: Account info:", response)
  return response
}

// Top up account - NO FALLBACKS
export async function topUpAccount(request: TopUpRequest): Promise<TopUpResponse> {
  console.log("🔴 DIRECT API CALL: Topping up account:", request)
  const response = await makeApiRequest("/api/billing/top-up", {
    method: "POST",
    body: JSON.stringify(request),
  })
  console.log("🔴 DIRECT API RESPONSE: Account topped up:", response)
  return response
}

// Claim referral code - NO FALLBACKS
export async function claimReferralCode(code: string): Promise<ReferralResponse> {
  console.log("🔴 DIRECT API CALL: Claiming referral code:", code)
  const response = await makeApiRequest("/api/referrals/claim", {
    method: "POST",
    body: JSON.stringify({ code }),
  })
  console.log("🔴 DIRECT API RESPONSE: Referral claimed:", response)
  return response
}

// Delete account - NO FALLBACKS
export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
  console.log("🔴 DIRECT API CALL: Deleting account...")
  const response = await makeApiRequest("/api/account", {
    method: "DELETE",
    body: JSON.stringify({ confirmation: "DELETE MY ACCOUNT" }),
  })
  console.log("🔴 DIRECT API RESPONSE: Account deleted:", response)
  return response
}
