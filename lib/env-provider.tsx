"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

// Define the environment variables we want to expose to the client
interface ClientEnv {
  apiUrl: string
  wsUrl: string
  isLoaded: boolean
}

// Create a context for the environment variables
const EnvContext = createContext<ClientEnv>({
  apiUrl: "",
  wsUrl: "",
  isLoaded: false,
})

// Provider component that fetches environment variables from the server
export function EnvProvider({ children }: { children: ReactNode }) {
  const [env, setEnv] = useState<ClientEnv>({
    apiUrl: "",
    wsUrl: "",
    isLoaded: false,
  })

  useEffect(() => {
    // Fetch environment variables from the server
    async function fetchEnv() {
      try {
        const response = await fetch("/api/env")
        const data = await response.json()

        if (data.apiUrl) {
          // Convert to WebSocket URL
          let wsUrl = data.apiUrl
          if (wsUrl.startsWith("https://")) {
            wsUrl = wsUrl.replace("https://", "wss://")
          } else if (!wsUrl.startsWith("wss://")) {
            wsUrl = `wss://${wsUrl.replace(/^(http:\/\/|\/\/)/i, "")}`
          }

          setEnv({
            apiUrl: data.apiUrl,
            wsUrl,
            isLoaded: true,
          })
        }
      } catch (error) {
        console.error("Failed to load environment variables:", error)
        // Set default values as fallback
        setEnv({
          apiUrl: "https://api.seq1.net",
          wsUrl: "wss://api.seq1.net",
          isLoaded: true,
        })
      }
    }

    fetchEnv()
  }, [])

  return <EnvContext.Provider value={env}>{children}</EnvContext.Provider>
}

// Hook to use the environment variables
export function useEnv() {
  return useContext(EnvContext)
}

// Remove the polyfill for process.env that references NEXT_PUBLIC_SEQ1_API_URL
