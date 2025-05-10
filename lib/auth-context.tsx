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
import { generateSecretKey, getPublicKey, nip19 } from "nostr-tools"

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
        // Check local storage for saved key (encrypted in production)
        const savedKey = localStorage.getItem("seq1_nostr_key")
        if (savedKey) {
          const success = await login(savedKey)
          if (!success) {
            localStorage.removeItem("seq1_nostr_key")
          }
        }
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkExistingSession()
  }, [])

  // Login with private key
  const login = async (privateKey: string): Promise<boolean> => {
    try {
      setIsLoading(true)

      // Validate private key format
      if (!privateKey.startsWith("nsec") && !privateKey.match(/^[0-9a-f]{64}$/)) {
        throw new Error("Invalid private key format")
      }

      // Convert nsec to hex if needed
      const hexPrivateKey = privateKey.startsWith("nsec") ? (nip19.decode(privateKey).data as string) : privateKey

      // Get public key from private key
      const publicKey = getPublicKey(hexPrivateKey)
      const npub = nip19.npubEncode(publicKey)

      // Fetch user profile from relays (simplified for now)
      // In a real implementation, we would fetch profile data from relays
      const userProfile = {
        pubkey: publicKey,
        npub,
        username: "user" + publicKey.slice(0, 5),
        displayName: "SEQ1 User",
      }

      // Save user to state
      setUser(userProfile)

      // Save key to local storage (would be encrypted in production)
      localStorage.setItem("seq1_nostr_key", hexPrivateKey)

      return true
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
    setUser(null)
    localStorage.removeItem("seq1_nostr_key")
  }

  // Save user profile
  const saveUserProfile = async (profile: {
    username: string
    displayName?: string
    avatar?: string
  }): Promise<boolean> => {
    try {
      if (!user) return false

      // In a real implementation, we would publish profile data to relays
      // For now, just update local state
      setUser({
        ...user,
        ...profile,
      })

      return true
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

      // Encode public key to npub format
      const npub = nip19.npubEncode(publicKey)

      // Fetch user profile from relays (simplified for now)
      // In a real implementation, we would fetch profile data from relays
      const userProfile = {
        pubkey: publicKey,
        npub,
        username: "user" + publicKey.slice(0, 5),
        displayName: "SEQ1 User",
      }

      // Save user to state
      setUser(userProfile)

      return true
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
