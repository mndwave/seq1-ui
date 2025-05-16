"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

// Define the authentication context type
interface AuthContextType {
  isAuthenticated: boolean
  user: any | null
  login: (credentials: { email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
}

// Create the authentication context
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  logout: async () => {},
  isLoading: true,
})

// Provider component that manages authentication state
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Use the proxy endpoint to check authentication
        const response = await fetch("/api/proxy/api/auth/session")

        if (response.ok) {
          const data = await response.json()
          setIsAuthenticated(true)
          setUser(data)
        } else {
          setIsAuthenticated(false)
          setUser(null)
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true)

    try {
      // Use the proxy endpoint to login
      const response = await fetch("/api/proxy/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      })

      if (response.ok) {
        const data = await response.json()
        setIsAuthenticated(true)
        setUser(data)
      } else {
        const error = await response.json()
        throw new Error(error.message || "Login failed")
      }
    } catch (error) {
      console.error("Error logging in:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    setIsLoading(true)

    try {
      // Use the proxy endpoint to logout
      await fetch("/api/proxy/api/auth/logout", {
        method: "POST",
      })

      setIsAuthenticated(false)
      setUser(null)
    } catch (error) {
      console.error("Error logging out:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading }}>{children}</AuthContext.Provider>
  )
}

// Hook to use the authentication context
export function useAuth() {
  return useContext(AuthContext)
}
