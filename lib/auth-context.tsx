"use client"

// Add the window.nostr type definition after the directive
declare global {
  interface Window {
    nostr?: {
      getPublicKey: () => Promise<string>
      signEvent: (event: any) => Promise<any>
      getRelays: () => Promise<Record<string, { read: boolean; write: boolean }>>
      nip04?: {
        encrypt: (pubkey: string, plaintext: string) => Promise<string>
        decrypt: (pubkey: string, ciphertext: string) => Promise<string>
      }
    }
  }
}

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { generateSecretKey, getPublicKey } from "nostr-tools"
import * as apiClient from "@/lib/api-client"

// Define types for our auth context
export interface NostrUser {
  pubkey: string
  npub: string // Encoded public key (user-friendly format)
  username?: string
  displayName?: string
  avatar?: string
}

interface AuthContextType {
  user: NostrUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (privateKey: string) => Promise<boolean>
  loginWithExtension: () => Promise<boolean>
  signup: () => Promise<{ privateKey: string; publicKey: string }>
  logout: () => void
  saveUserProfile: (profile: { username: string; displayName?: string; avatar?: string }) => Promise<boolean>
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  loginWithExtension: async () => false,
  signup: async () => ({ privateKey: "", publicKey: "" }),
  logout: () => {},
  saveUserProfile: async () => false,
})

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<NostrUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        // Check if API is authenticated
        if (apiClient.isAuthenticated()) {
          // Get account info
          try {
            const accountInfo = await apiClient.getAccountInfo()
            if (accountInfo) {
              setUser({
                pubkey: accountInfo.npub || "default-npub",
                npub: accountInfo.npub || "default-npub",
                username: accountInfo.username || "user",
                displayName: accountInfo.displayName || "SEQ1 User",
                avatar: accountInfo.profilePicture || "/default.jpg",
              })
            }
          } catch (error) {
            console.error("Error fetching account info:", error)
          }
        }
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkExistingSession()

    // Listen for auth error events
    const handleAuthError = (event: CustomEvent) => {
      console.error("Authentication error:", event.detail?.message)
      setUser(null)
    }

    window.addEventListener("seq1:auth:error", handleAuthError as EventListener)

    return () => {
      window.removeEventListener("seq1:auth:error", handleAuthError as EventListener)
    }
  }, [])

  // Login with private key
  const login = async (privateKey: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      // Validate private key format
      if (!privateKey.startsWith("nsec") && !privateKey.match(/^[0-9a-f]{64}$/)) {
        throw new Error("Invalid private key format")
      }

      // With X-API-Key authentication, we don't need to login with a private key
      // Instead, we'll just fetch the account info to verify authentication
      try {
        const accountInfo = await apiClient.getAccountInfo()
        if (accountInfo) {
          setUser({
            pubkey: accountInfo.npub || "default-npub",
            npub: accountInfo.npub || "default-npub",
            username: accountInfo.username || "user",
            displayName: accountInfo.displayName || "SEQ1 User",
            avatar: accountInfo.profilePicture || "/default.jpg",
          })
          return true
        }
      } catch (error) {
        console.error("Error fetching account info:", error)
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Generate new keypair for signup
  const signup = async (): Promise<{ privateKey: string; publicKey: string }> => {
    try {
      // Generate new keypair using the correct function name
      const privateKey = generateSecretKey() // Changed from generatePrivateKey to generateSecretKey
      const publicKey = getPublicKey(privateKey)

      // Return the keys for the user to save
      return {
        privateKey,
        publicKey,
      }
    } catch (error) {
      console.error("Signup error:", error)
      throw error
    }
  }

  // Logout user
  const logout = () => {
    // With X-API-Key authentication, we don't need to logout
    // Just clear the user state
    setUser(null)
  }

  // Save user profile
  const saveUserProfile = async (profile: {
    username: string
    displayName?: string
    avatar?: string
  }): Promise<boolean> => {
    try {
      if (!user) return false

      // Call the API to update the profile
      const response = await apiClient.updateAccountInfo(profile)

      if (response.success) {
        // Update the local state
        setUser({
          ...user,
          username: profile.username,
          displayName: profile.displayName || user.displayName,
          avatar: profile.avatar || user.avatar,
        })
        return true
      }

      return false
    } catch (error) {
      console.error("Save profile error:", error)
      return false
    }
  }

  // Add a new function to handle extension login
  const loginWithExtension = async (): Promise<boolean> => {
    try {
      setIsLoading(true)

      // Check if nostr extension is available
      if (!window.nostr) {
        throw new Error("No Nostr extension found. Please install Alby or NOS2X.")
      }

      // Request public key from extension
      const publicKey = await window.nostr.getPublicKey()
      if (!publicKey) {
        throw new Error("Failed to get public key from extension.")
      }

      // With X-API-Key authentication, we don't need to login with an extension
      // Instead, we'll just fetch the account info to verify authentication
      try {
        const accountInfo = await apiClient.getAccountInfo()
        if (accountInfo) {
          setUser({
            pubkey: accountInfo.npub || "default-npub",
            npub: accountInfo.npub || "default-npub",
            username: accountInfo.username || "user",
            displayName: accountInfo.displayName || "SEQ1 User",
            avatar: accountInfo.profilePicture || "/default.jpg",
          })
          return true
        }
      } catch (error) {
        console.error("Error fetching account info:", error)
      }

      return false
    } catch (error) {
      console.error("Extension login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginWithExtension,
        signup,
        logout,
        saveUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook for using auth context
export function useAuth() {
  return useContext(AuthContext)
}
