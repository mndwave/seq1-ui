/**
 * Simplified JWT Authentication System
 * 
 * This replaces the complex dual auth system with a clean JWT-only approach
 * that properly integrates with the backend API endpoints.
 */

import { apiClient } from "./api-client"

interface User {
  npub: string
  displayName: string
  username: string
  profilePicture?: string
  hoursRemaining?: number
  referralCode?: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
}

class SimpleAuth {
  private state: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null
  }

  private listeners: Set<(state: AuthState) => void> = new Set()

  constructor() {
    this.loadFromStorage()
  }

  private loadFromStorage() {
    if (typeof window === "undefined") return

    const token = localStorage.getItem("seq1_jwt_token")
    const userData = localStorage.getItem("seq1_user_data")

    if (token && userData) {
      try {
        const user = JSON.parse(userData)
        this.state = {
          isAuthenticated: true,
          user,
          token
        }
        apiClient.setToken(token)
      } catch (error) {
        console.error("Failed to load auth state:", error)
        this.clearStorage()
      }
    }
  }

  private saveToStorage() {
    if (typeof window === "undefined") return

    if (this.state.token && this.state.user) {
      localStorage.setItem("seq1_jwt_token", this.state.token)
      localStorage.setItem("seq1_user_data", JSON.stringify(this.state.user))
    } else {
      this.clearStorage()
    }
  }

  private clearStorage() {
    if (typeof window === "undefined") return
    
    localStorage.removeItem("seq1_jwt_token")
    localStorage.removeItem("seq1_user_data")
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state))
  }

  // Subscribe to auth state changes
  subscribe(listener: (state: AuthState) => void) {
    this.listeners.add(listener)
    listener(this.state) // Call immediately with current state
    
    return () => {
      this.listeners.delete(listener)
    }
  }

  // Get current auth state
  getState(): AuthState {
    return { ...this.state }
  }

  get isAuthenticated(): boolean {
    return this.state.isAuthenticated
  }

  get user(): User | null {
    return this.state.user
  }

  // Check auth status with backend
  async checkAuthStatus(): Promise<boolean> {
    if (!this.state.token) {
      return false
    }

    try {
      const user = await apiClient.directRequest<User>("/api/account")
      this.state = {
        isAuthenticated: true,
        user,
        token: this.state.token
      }
      this.saveToStorage()
      this.notifyListeners()
      return true
    } catch (error) {
      console.log("Auth check failed:", error)
      this.logout()
      return false
    }
  }

  // Login with existing Nostr key
  async login(npub: string, signedChallenge?: any): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.directRequest<{
        success: boolean
        user: User
        token: string
      }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          npub,
          signedChallenge
        })
      })

      if (response.success) {
        this.state = {
          isAuthenticated: true,
          user: response.user,
          token: response.token
        }
        
        apiClient.setToken(response.token)
        this.saveToStorage()
        this.notifyListeners()
        
        // Dispatch global event for compatibility
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("seq1:auth:loggedIn", { detail: { user: response.user } }))
        }
        
        return { success: true }
      }
      
      return { success: false, error: "Login failed" }
    } catch (error: any) {
      console.error("Login error:", error)
      return { success: false, error: error.message || "Login failed" }
    }
  }

  // Signup with new Nostr key
  async signup(data: {
    npub: string
    username: string
    displayName: string
    email?: string
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.directRequest<{
        success: boolean
        user: User
        token: string
      }>("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(data)
      })

      if (response.success) {
        this.state = {
          isAuthenticated: true,
          user: response.user,
          token: response.token
        }
        
        apiClient.setToken(response.token)
        this.saveToStorage()
        this.notifyListeners()
        
        // Dispatch global event for compatibility
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("seq1:auth:loggedIn", { detail: { user: response.user } }))
        }
        
        return { success: true }
      }
      
      return { success: false, error: "Signup failed" }
    } catch (error: any) {
      console.error("Signup error:", error)
      return { success: false, error: error.message || "Signup failed" }
    }
  }

  // Logout
  logout() {
    this.state = {
      isAuthenticated: false,
      user: null,
      token: null
    }
    
    apiClient.clearToken()
    this.clearStorage()
    this.notifyListeners()
    
    // Dispatch global event for compatibility
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("seq1:auth:loggedOut"))
    }
  }
}

// Export singleton instance
export const simpleAuth = new SimpleAuth()

// React hook for using auth state
export function useSimpleAuth() {
  const [authState, setAuthState] = React.useState<AuthState>(simpleAuth.getState())

  React.useEffect(() => {
    return simpleAuth.subscribe(setAuthState)
  }, [])

  return {
    ...authState,
    login: simpleAuth.login.bind(simpleAuth),
    signup: simpleAuth.signup.bind(simpleAuth),
    logout: simpleAuth.logout.bind(simpleAuth),
    checkAuthStatus: simpleAuth.checkAuthStatus.bind(simpleAuth)
  }
}

// Add React import for the hook
import React from "react" 