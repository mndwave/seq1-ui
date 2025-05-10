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

// Mock API function to get account info
export async function getAccountInfo(): Promise<AccountInfo> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 800))

  // Return mock data
  return {
    npub: "npub1abcdefghijklmnopqrstuvwxyz0123456789abcdefghijklmnopqrst",
    nprofile: "nprofile1qqsw3e...",
    profilePicture: "/default.jpg",
    displayName: "SEQ1 User",
    username: "user",
    website: "https://seq1.net",
    about: "Making music with SEQ1 #SEQ1",
    hoursRemaining: 4.5,
    hoursFromReferrals: 3,
    valueSaved: 1.05,
    referralCode: "SEQ1-ABC123",
    referralCount: 1,
  }
}

// Mock API function to top up account
export async function topUpAccount(request: TopUpRequest): Promise<TopUpResponse> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1200))

  // Calculate hours added
  const hourlyRate = 0.35 // $0.35 per hour
  let hoursAdded = 0

  if (request.currency === "usd") {
    hoursAdded = request.amount / hourlyRate
  } else {
    // Convert sats to USD (approximate)
    const usdAmount = request.amount / 100000 // Very rough approximation
    hoursAdded = usdAmount / hourlyRate
  }

  // Generate mock payment request
  const paymentRequest =
    request.paymentMethod === "lightning" ? "lnbc100u1p3hkzm2pp..." : "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"

  // Return success response
  return {
    success: true,
    hoursAdded,
    paymentRequest,
  }
}

// Mock API function to claim referral code
export async function claimReferralCode(code: string): Promise<ReferralResponse> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Check if code is valid (mock validation)
  if (code === "INVALID") {
    return {
      success: false,
      error: "Invalid referral code",
    }
  }

  if (code === "USED") {
    return {
      success: false,
      error: "This referral code has already been used",
    }
  }

  // Return success response
  return {
    success: true,
    hoursAdded: 3,
  }
}

// Mock API function to delete account
export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Return success response
  return {
    success: true,
  }
}
