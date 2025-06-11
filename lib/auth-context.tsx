"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode, useMemo } from "react"
import { authManager, type User as AuthManagerUser } from "./auth-manager" // Using the singleton
import { apiClient } from "./api-client" // For listening to events
import {
  nostrStorage,
  generateNostrKeypair,
  decodeNsec,
  createAuthEventForNip07Login, // This line should now correctly resolve
  type NostrKeypair,
} from "./nostr-utils" // Assuming these are still relevant for key gen/nsec login
import { useToast } from "@/hooks/use-toast"
import { nip19, getPublicKey as getHexPublicKey, type Event as NostrToolsEvent, type EventTemplate } from "nostr-tools"
import config from "./config"

const DEBUG = process.env.NODE_ENV === "development" || config.DEBUG_MODE

function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log("[AuthContext]", ...args)
  }
}

// Re-export User type from AuthManager for convenience if needed by consumers
export type User = AuthManagerUser

// Define the shape of the context
interface AuthContextType {
  isAuthenticated: boolean
  isAnonymous: boolean
  user: User | null
  isLoading: boolean // For initial auth check and ongoing operations
  isAuthManagerInitialized: boolean // Specifically for the initial checkAuthStatus
  loginWithNostrExtension: () => Promise<{ success: boolean; user?: User; error?: string }>
  loginWithNsec: (nsec: string) => Promise<{ success: boolean; user?: User; error?: string }>
  generateAndStoreKeys: () => Promise<{ success: boolean; keys?: NostrKeypair; error?: string }>
  logout: () => Promise<void>
  signEventWithUserKey: (eventTemplate: Omit<EventTemplate, "pubkey" | "id" | "sig">) => Promise<NostrToolsEvent | null>
  // Add other methods if needed, e.g., for specific registration or challenge authentication
  // For now, assuming loginWithNostrExtension handles the NIP-07 challenge flow internally.
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// NIP-07 window.nostr event template type
interface Nip07EventTemplate {
  kind: number
  created_at: number
  tags: string[][]
  content: string
  pubkey: string // NIP-07 signEvent expects pubkey in the template
}

declare global {
  interface Window {
    nostr?: {
      getPublicKey(): Promise<string>
      signEvent(event: Nip07EventTemplate): Promise<NostrToolsEvent> // nostr-tools Event
      nip04?: {
        encrypt(pubkey: string, plaintext: string): Promise<string>
        decrypt(pubkey: string, ciphertext: string): Promise<string>
      }
    }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(authManager.currentUser)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authManager.isAuthenticated)
  const [isAnonymous, setIsAnonymous] = useState<boolean>(authManager.isAnonymous)
  const [isLoading, setIsLoading] = useState<boolean>(false) // For specific operations
  const [isAuthManagerInitialized, setIsAuthManagerInitialized] = useState<boolean>(false)
  const { toast } = useToast()

  // Effect for initial auth status check
  useEffect(() => {
    debugLog("AuthProvider mounted. Initializing auth status...")
    setIsLoading(true) // General loading for app init
    authManager
      .checkAuthStatus()
      .then(() => {
        debugLog("Initial auth status check complete.")
        setUser(authManager.currentUser)
        setIsAuthenticated(authManager.isAuthenticated)
        setIsAnonymous(authManager.isAnonymous)
      })
      .catch((error) => {
        console.error("Error during initial auth status check:", error)
        // Still update state based on what authManager might have settled on
        setUser(authManager.currentUser)
        setIsAuthenticated(authManager.isAuthenticated)
        setIsAnonymous(authManager.isAnonymous)
      })
      .finally(() => {
        setIsLoading(false)
        setIsAuthManagerInitialized(true)
        debugLog(
          `Auth initialized: isAuthenticated=${authManager.isAuthenticated}, isAnonymous=${authManager.isAnonymous}, user=`,
          authManager.currentUser,
        )
      })
  }, [])

  // Effect for listening to apiClient events
  useEffect(() => {
    const handleStateChange = () => {
      debugLog("Auth state change detected from apiClient event.")
      setUser(authManager.currentUser) // authManager's listeners should update its currentUser
      setIsAuthenticated(authManager.isAuthenticated)
      setIsAnonymous(authManager.isAnonymous)
    }

    // These events are now emitted by apiClient and handled by authManager internally to update its state.
    // We listen to them to update AuthContext's state for React's reactivity.
    apiClient.on("token-set", handleStateChange)
    apiClient.on("token-cleared", handleStateChange)
    apiClient.on("anonymous-session-created", handleStateChange) // For isAnonymous status
    apiClient.on("anonymous-session-cleared", handleStateChange)
    apiClient.on("session-expired", handleStateChange) // Anonymous session window expired
    apiClient.on("trial-expired", handleStateChange) // Total trial expired

    // Cleanup listeners
    return () => {
      apiClient.off("token-set", handleStateChange)
      apiClient.off("token-cleared", handleStateChange)
      apiClient.off("anonymous-session-created", handleStateChange)
      apiClient.off("anonymous-session-cleared", handleStateChange)
      apiClient.off("session-expired", handleStateChange)
      apiClient.off("trial-expired", handleStateChange)
    }
  }, []) // No dependencies, runs once to set up listeners

  const generateAndStoreKeys = useCallback(async (): Promise<{
    success: boolean
    keys?: NostrKeypair
    error?: string
  }> => {
    setIsLoading(true)
    try {
      const newKeypair = generateNostrKeypair()
      nostrStorage.storeKeys(newKeypair) // Store locally (e.g., localStorage via nostr-utils)
      // This action doesn't log the user in with the backend, just creates local keys.
      // The user would then need to use these keys (e.g., via loginWithNsec)
      toast({ title: "Success", description: "Creative Keys generated and stored locally." })
      setIsLoading(false)
      return { success: true, keys: newKeypair }
    } catch (e: any) {
      console.error("Error generating keys:", e)
      toast({ title: "Error", description: e.message || "Failed to generate keys.", variant: "destructive" })
      setIsLoading(false)
      return { success: false, error: e.message }
    }
  }, [toast])

  const loginWithNsec = useCallback(
    async (nsec: string): Promise<{ success: boolean; user?: User; error?: string }> => {
      setIsLoading(true)
      const privateKeyHex = decodeNsec(nsec)
      if (!privateKeyHex) {
        toast({ title: "Error", description: "Invalid Private Creative Key format.", variant: "destructive" })
        setIsLoading(false)
        return { success: false, error: "Invalid Private Creative Key format." }
      }
      try {
        const publicKeyHex = getHexPublicKey(privateKeyHex)
        // For NSEC login, we need to create a NIP-07 like challenge/response
        // The backend /api/auth/nostr should issue a challenge if it receives just a pubkey,
        // or accept a pre-signed auth event.
        // Let's assume a NIP-07 like flow:
        // 1. Client: "I want to login as pubkey X" (or this is implicit if NSEC is directly used for auth event)
        // 2. Server: "OK, sign this challenge: Y" (This step is often skipped if client sends full auth event)
        // 3. Client: Signs challenge Y with private key for X, sends signed event.
        // 4. Server: Verifies signature, logs in user, returns JWT.

        // Simplified: create an auth event directly using the NSEC's private key
        // This assumes the backend /api/auth/nostr can handle such an event directly for login.
        // The challenge content can be a server-defined string or a well-known one.
        // For simplicity, let's use a client-generated "challenge" which is just the login intent.
        const challenge = `Login to SEQ1: ${new Date().toISOString()}`
        const authEvent = createAuthEventForNip07Login(challenge, privateKeyHex, publicKeyHex) // Use the new util

        const loggedInUser = await authManager.loginWithNostr(authEvent) // authManager calls apiClient.nostrLogin
        toast({ title: "Login Successful", description: "Welcome to your Studio!" })
        setIsLoading(false)
        return { success: true, user: loggedInUser }
      } catch (e: any) {
        console.error("Error logging in with NSEC:", e)
        toast({
          title: "Login Failed",
          description: e.message || "Private Creative Key login failed.",
          variant: "destructive",
        })
        setIsLoading(false)
        return { success: false, error: e.message }
      }
    },
    [toast],
  )

  const loginWithNostrExtension = useCallback(async (): Promise<{
    success: boolean
    user?: User
    error?: string
  }> => {
    if (!window.nostr) {
      toast({ title: "Error", description: "Nostr extension (like NIP-07) not found.", variant: "destructive" })
      return { success: false, error: "Nostr extension not found." }
    }
    setIsLoading(true)
    try {
      const publicKeyHex = await window.nostr.getPublicKey()
      if (!publicKeyHex) throw new Error("Failed to get public key from extension.")

      // Similar to NSEC login, create a NIP-07 auth event
      // The challenge could be fetched from server or be client-generated for login intent.
      const challenge = `Login to SEQ1 via Extension: ${new Date().toISOString()}`
      const eventTemplateForExtension: Nip07EventTemplate = {
        kind: 22242, // NIP-07 auth kind
        created_at: Math.floor(Date.now() / 1000),
        tags: [["challenge", challenge]], // Standard NIP-07 challenge tag
        content: "", // Content is often empty for NIP-07 auth
        pubkey: publicKeyHex,
      }
      const signedAuthEvent = await window.nostr.signEvent(eventTemplateForExtension)

      let loggedInUser: User
      if (authManager.isAnonymous && apiClient.sessionId) {
        // If anonymous, try to upgrade the session
        debugLog("Attempting to upgrade anonymous session with extension login...")
        loggedInUser = await authManager.upgradeAnonymousSessionWithNostr(signedAuthEvent)
        toast({ title: "Studio Session Secured!", description: "Your anonymous session is now fully yours." })
      } else {
        // If not anonymous or no session ID, perform a fresh login
        debugLog("Performing fresh login with extension...")
        loggedInUser = await authManager.loginWithNostr(signedAuthEvent)
        toast({ title: "Login Successful", description: "Welcome back to your Studio!" })
      }

      setIsLoading(false)
      return { success: true, user: loggedInUser }
    } catch (e: any) {
      console.error("Error with Nostr extension login:", e)
      toast({ title: "Login Failed", description: e.message || "Extension login failed.", variant: "destructive" })
      setIsLoading(false)
      return { success: false, error: e.message }
    }
  }, [toast])

  const logout = useCallback(async () => {
    setIsLoading(true)
    debugLog("useAuth: logout called")
    authManager.logout() // This clears token in apiClient, which triggers event listeners
    // State updates (isAuthenticated, user, isAnonymous) will happen via the event listeners.
    toast({ title: "Signed Out", description: "You have been signed out of your Studio." })
    setIsLoading(false)
  }, [toast])

  const signEventWithUserKey = useCallback(
    async (eventTemplate: Omit<EventTemplate, "pubkey" | "id" | "sig">): Promise<NostrToolsEvent | null> => {
      if (!isAuthenticated || !user?.npub) {
        // User here is from AuthContext state, which should be up-to-date
        toast({ title: "Error", description: "User not authenticated.", variant: "destructive" })
        return null
      }

      // Determine if using extension or local NSEC (from stored keys, if that's a pattern)
      // For simplicity, this example assumes if extension was used for login, it's preferred for signing.
      // A more robust implementation might check how the user is currently "logged in"
      // (e.g., a flag on the user object or a separate state in AuthContext).

      // This part needs to align with how the user authenticated.
      // If loginWithNostrExtension was used, window.nostr should be available.
      // If loginWithNsec was used, we'd need the private key.
      // The current authManager doesn't store the private key after login for security.
      // So, this function is more practical if the user logged in via extension.

      // Let's assume for now: if window.nostr and user has a pubkey, try extension.
      // This is a simplification. A real app might need more context on how the user is "sessioned".
      const currentUserNpub = user.npub
      const currentUserHexPubkey = nip19.decode(currentUserNpub).data as string

      if (window.nostr) {
        debugLog("Attempting to sign event with Nostr extension.")
        try {
          const eventForExtensionSign: Nip07EventTemplate = {
            kind: eventTemplate.kind,
            pubkey: currentUserHexPubkey,
            tags: eventTemplate.tags || [],
            content: eventTemplate.content || "",
            created_at: eventTemplate.created_at || Math.floor(Date.now() / 1000),
          }
          return await window.nostr.signEvent(eventForExtensionSign)
        } catch (error: any) {
          console.error("Error signing event with extension:", error)
          toast({
            title: "Signing Error",
            description: error.message || "Failed to sign event with extension.",
            variant: "destructive",
          })
          return null
        }
      } else {
        // Fallback to NSEC if stored (nostrStorage.getStoredKeys())
        // This implies the user might have generated keys or logged in with NSEC,
        // and we have access to the private key.
        const storedKeys = nostrStorage.getStoredKeys()
        if (storedKeys && storedKeys.privateKeyHex) {
          debugLog("Attempting to sign event with stored private key.")
          try {
            const fullEventTemplate: EventTemplate = {
              ...eventTemplate,
              pubkey: currentUserHexPubkey, // Ensure pubkey is set from the authenticated user
              created_at: eventTemplate.created_at || Math.floor(Date.now() / 1000),
              tags: eventTemplate.tags || [],
              content: eventTemplate.content || "",
            }
            // Need to import finalizeEvent from nostr-tools
            // const { finalizeEvent } = await import("nostr-tools"); // Dynamic import if heavy
            // For now, assuming it's statically imported in nostr-utils or here.
            // This part is tricky if finalizeEvent is not readily available or if nostr-tools is large.
            // Let's assume nostr-utils provides a wrapper or re-exports it.
            // For this example, let's assume a direct import of finalizeEvent.
            const { finalizeEvent: nostrToolsFinalizeEvent } = await import("nostr-tools") // If not already available
            return nostrToolsFinalizeEvent(fullEventTemplate, storedKeys.privateKeyHex)
          } catch (error: any) {
            console.error("Error signing event with stored private key:", error)
            toast({
              title: "Signing Error",
              description: error.message || "Failed to sign event with stored key.",
              variant: "destructive",
            })
            return null
          }
        } else {
          toast({
            title: "Cannot Sign Event",
            description: "No available method to sign (Nostr extension or local private key not found/set up).",
            variant: "destructive",
          })
          return null
        }
      }
    },
    [isAuthenticated, user, toast],
  )

  // Memoize the context value to prevent unnecessary re-renders of consumers
  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      isAnonymous,
      user,
      isLoading: isLoading || !isAuthManagerInitialized, // Combined loading state
      isAuthManagerInitialized,
      loginWithNostrExtension,
      loginWithNsec,
      generateAndStoreKeys,
      logout,
      signEventWithUserKey,
    }),
    [
      isAuthenticated,
      isAnonymous,
      user,
      isLoading,
      isAuthManagerInitialized,
      loginWithNostrExtension,
      loginWithNsec,
      generateAndStoreKeys,
      logout,
      signEventWithUserKey,
    ],
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
