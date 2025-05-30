"use client"

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react"
import {
  nostrStorage,
  generateNostrKeypair,
  createAuthEvent,
  decodeNsec,
  type StoredNostrKeypair,
  type NostrKeypair,
} from "./nostr-utils"
import { useToast } from "@/hooks/use-toast"
import {
  nip19,
  getPublicKey as getHexPublicKey,
  type Event as NostrToolsEvent,
  type EventTemplate,
  finalizeEvent,
} from "nostr-tools" // Ensure finalizeEvent is imported

// Define the Nostr user type for the context
export interface NostrAuthUser extends StoredNostrKeypair {
  displayName?: string
  isExtensionLogin: boolean
}

interface AuthContextType {
  isAuthenticated: boolean
  user: NostrAuthUser | null
  isLoading: boolean
  generateAndStoreKeys: () => Promise<{ success: boolean; keys?: NostrKeypair; error?: string }>
  loginWithNsec: (nsec: string) => Promise<{ success: boolean; error?: string }>
  loginWithExtension: () => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  registerIdentity: () => Promise<{ success: boolean; error?: string }>
  authenticateChallenge: (challenge: string) => Promise<{ success: boolean; error?: string }>
  getNostrAuthHeaders: () => Record<string, string>
  signEventWithUserKey: (eventTemplate: Omit<EventTemplate, "pubkey" | "id" | "sig">) => Promise<NostrToolsEvent | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const apiClient = {
  request: async (endpoint: string, options: RequestInit = {}) => {
    const defaultHeaders = {
      "Content-Type": "application/json",
      ...options.headers,
    }
    const targetUrl = `/api/proxy${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`
    console.log(
      `API Client Request: ${options.method || "GET"} to ${targetUrl}`,
      options.body ? { body: options.body } : {},
    ) // Added log

    const response = await fetch(targetUrl, {
      ...options,
      headers: defaultHeaders,
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(errorData.message || `API request failed: ${response.status}`)
    }
    return response.json()
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<NostrAuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const loadUser = useCallback(() => {
    setIsLoading(true)
    const storedKeys = nostrStorage.getStoredKeys()
    if (storedKeys) {
      setUser({ ...storedKeys, isExtensionLogin: false, displayName: "Nostr User" })
      setIsLoading(false)
      return true
    }
    const extensionNpub = localStorage.getItem("seq1_npub_extension")
    if (extensionNpub) {
      try {
        const decoded = nip19.decode(extensionNpub)
        if (decoded.type === "npub") {
          setUser({
            nsec: "N/A (Extension)",
            npub: extensionNpub,
            privateKeyHex: "N/A (Extension)",
            publicKeyHex: decoded.data as string,
            created: new Date().toISOString(),
            isExtensionLogin: true,
            displayName: "Nostr Extension User",
          })
        }
      } catch (e) {
        console.error("Error decoding extension npub:", e)
        localStorage.removeItem("seq1_npub_extension")
      }
    }
    setIsLoading(false)
    return false
  }, [])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const generateAndStoreKeys = async (): Promise<{ success: boolean; keys?: NostrKeypair; error?: string }> => {
    try {
      const newKeypair = generateNostrKeypair()
      nostrStorage.storeKeys(newKeypair)
      setUser({ ...newKeypair, created: new Date().toISOString(), isExtensionLogin: false, displayName: "Nostr User" })
      localStorage.removeItem("seq1_npub_extension")
      toast({ title: "Success", description: "NOSTR keys generated and stored." })
      return { success: true, keys: newKeypair }
    } catch (e: any) {
      console.error("Error generating keys:", e)
      toast({ title: "Error", description: e.message || "Failed to generate keys.", variant: "destructive" })
      return { success: false, error: e.message }
    }
  }

  const loginWithNsec = async (nsec: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    const privateKeyHex = decodeNsec(nsec)
    if (!privateKeyHex) {
      toast({ title: "Error", description: "Invalid NSEC format.", variant: "destructive" })
      setIsLoading(false)
      return { success: false, error: "Invalid NSEC format." }
    }
    try {
      const publicKeyHex = getHexPublicKey(privateKeyHex)
      const keypair: NostrKeypair = {
        nsec,
        npub: nip19.npubEncode(publicKeyHex), // npubEncode expects hex public key
        privateKeyHex,
        publicKeyHex,
      }
      nostrStorage.storeKeys(keypair)
      setUser({ ...keypair, created: new Date().toISOString(), isExtensionLogin: false, displayName: "Nostr User" })
      localStorage.removeItem("seq1_npub_extension")
      toast({ title: "Success", description: "Logged in with NSEC." })
      setIsLoading(false)
      return { success: true }
    } catch (e: any) {
      console.error("Error logging in with NSEC:", e)
      toast({ title: "Error", description: e.message || "NSEC login failed.", variant: "destructive" })
      setIsLoading(false)
      return { success: false, error: e.message }
    }
  }

  const loginWithExtension = async (): Promise<{ success: boolean; error?: string }> => {
    if (!window.nostr) {
      toast({ title: "Error", description: "Nostr extension not found.", variant: "destructive" })
      return { success: false, error: "Nostr extension not found." }
    }
    setIsLoading(true)
    try {
      const publicKeyHex = await window.nostr.getPublicKey()
      if (!publicKeyHex) throw new Error("Failed to get public key from extension.")
      const npub = nip19.npubEncode(publicKeyHex)
      nostrStorage.clearKeys()
      localStorage.setItem("seq1_npub_extension", npub)
      setUser({
        nsec: "N/A (Extension)",
        npub,
        privateKeyHex: "N/A (Extension)",
        publicKeyHex,
        created: new Date().toISOString(),
        isExtensionLogin: true,
        displayName: "Nostr Extension User",
      })
      toast({ title: "Success", description: "Logged in with Nostr extension." })
      setIsLoading(false)
      return { success: true }
    } catch (e: any) {
      console.error("Error with Nostr extension login:", e)
      toast({ title: "Error", description: e.message || "Extension login failed.", variant: "destructive" })
      setIsLoading(false)
      return { success: false, error: e.message }
    }
  }

  const logout = async () => {
    nostrStorage.clearKeys()
    localStorage.removeItem("seq1_npub_extension")
    setUser(null)
    toast({ title: "Logged Out", description: "You have been logged out." })
  }

  const registerIdentity = async (): Promise<{ success: boolean; error?: string }> => {
    const publicData = nostrStorage.getPublicData()
    if (!publicData) {
      toast({ title: "Error", description: "No NOSTR keys found to register.", variant: "destructive" })
      return { success: false, error: "No NOSTR keys found" }
    }
    setIsLoading(true)
    try {
      await apiClient.request("/api/auth/nostr/register", {
        method: "POST",
        body: JSON.stringify({
          npub: publicData.npub,
          publicKeyHex: publicData.publicKeyHex,
        }),
      })
      toast({ title: "Success", description: "Nostr identity registered with server." })
      setIsLoading(false)
      return { success: true }
    } catch (e: any) {
      console.error("Error registering Nostr identity:", e)
      toast({ title: "Error", description: e.message || "Failed to register identity.", variant: "destructive" })
      setIsLoading(false)
      return { success: false, error: e.message }
    }
  }

  const authenticateChallenge = async (challenge: string): Promise<{ success: boolean; error?: string }> => {
    const keys = nostrStorage.getStoredKeys()
    let signedChallengeEvent: NostrToolsEvent | null = null

    if (user?.isExtensionLogin && window.nostr) {
      if (!user.publicKeyHex) return { success: false, error: "Extension user public key not found." }
      const authTemplateForExtension: Nip07EventTemplate = {
        // Use specific type for NIP-07
        kind: 22242,
        content: challenge,
        tags: [],
        created_at: Math.floor(Date.now() / 1000),
        pubkey: user.publicKeyHex,
      }
      signedChallengeEvent = await window.nostr.signEvent(authTemplateForExtension)
    } else if (keys) {
      signedChallengeEvent = createAuthEvent(challenge, keys.privateKeyHex)
    } else {
      toast({ title: "Error", description: "No NOSTR keys found for authentication.", variant: "destructive" })
      return { success: false, error: "No NOSTR keys found" }
    }

    if (!signedChallengeEvent) {
      toast({ title: "Error", description: "Failed to sign challenge.", variant: "destructive" })
      return { success: false, error: "Failed to sign challenge." }
    }

    setIsLoading(true)
    try {
      await apiClient.request("/api/auth/nostr/verify", {
        method: "POST",
        body: JSON.stringify({
          npub: user?.npub || keys?.npub,
          signedChallenge: signedChallengeEvent,
        }),
      })
      toast({ title: "Success", description: "Successfully authenticated with server." })
      setIsLoading(false)
      return { success: true }
    } catch (e: any) {
      console.error("Error authenticating with Nostr challenge:", e)
      toast({ title: "Error", description: e.message || "Challenge authentication failed.", variant: "destructive" })
      setIsLoading(false)
      return { success: false, error: e.message }
    }
  }

  const getNostrAuthHeaders = (): Record<string, string> => {
    const publicData = nostrStorage.getPublicData()
    return publicData ? { "X-Nostr-Pubkey": publicData.npub } : {}
  }

  const signEventWithUserKey = async (
    eventTemplate: Omit<EventTemplate, "pubkey" | "id" | "sig">, // nostr-tools EventTemplate (v1)
  ): Promise<NostrToolsEvent | null> => {
    if (!user || !user.publicKeyHex) {
      toast({ title: "Error", description: "User not authenticated or public key missing.", variant: "destructive" })
      return null
    }

    try {
      if (user.isExtensionLogin && window.nostr) {
        const eventForExtensionSign: Nip07EventTemplate = {
          kind: eventTemplate.kind,
          pubkey: user.publicKeyHex,
          tags: eventTemplate.tags || [],
          content: eventTemplate.content || "",
          created_at: eventTemplate.created_at || Math.floor(Date.now() / 1000),
        }
        return await window.nostr.signEvent(eventForExtensionSign)
      } else if (user.privateKeyHex && user.privateKeyHex !== "N/A (Extension)") {
        const templateForLocalSign: EventTemplate = {
          // nostr-tools v1 EventTemplate
          kind: eventTemplate.kind,
          tags: eventTemplate.tags || [],
          content: eventTemplate.content || "",
          created_at: eventTemplate.created_at || Math.floor(Date.now() / 1000),
        }
        return finalizeEvent(templateForLocalSign, user.privateKeyHex)
      } else {
        toast({
          title: "Error",
          description: "Cannot sign event: No private key or extension.",
          variant: "destructive",
        })
        return null
      }
    } catch (error: any) {
      console.error("Error signing event:", error)
      toast({ title: "Error", description: error.message || "Failed to sign event.", variant: "destructive" })
      return null
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        isLoading,
        generateAndStoreKeys,
        loginWithNsec,
        loginWithExtension,
        logout,
        registerIdentity,
        authenticateChallenge,
        getNostrAuthHeaders,
        signEventWithUserKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

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
      signEvent(event: Nip07EventTemplate): Promise<NostrToolsEvent>
      nip04?: {
        encrypt(pubkey: string, plaintext: string): Promise<string>
        decrypt(pubkey: string, ciphertext: string): Promise<string>
      }
    }
  }
}
