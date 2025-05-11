import * as apiClient from "@/lib/api-client"

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

// Get account info
export async function getAccountInfo(): Promise<AccountInfo> {
  try {
    return await apiClient.getAccountInfo()
  } catch (error) {
    console.error("Error getting account info:", error)
    throw error
  }
}

// Top up account
export async function topUpAccount(request: TopUpRequest): Promise<TopUpResponse> {
  try {
    return await apiClient.topUpAccount(request.amount, request.currency, request.paymentMethod)
  } catch (error) {
    console.error("Error topping up account:", error)
    throw error
  }
}

// Claim referral code
export async function claimReferralCode(code: string): Promise<ReferralResponse> {
  try {
    return await apiClient.claimReferralCode(code)
  } catch (error) {
    console.error("Error claiming referral code:", error)
    throw error
  }
}

// Delete account
export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
  try {
    return await apiClient.deleteAccount("DELETE MY ACCOUNT")
  } catch (error) {
    console.error("Error deleting account:", error)
    throw error
  }
}
