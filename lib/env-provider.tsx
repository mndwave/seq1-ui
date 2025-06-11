"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useMemo } from "react"
import { getCanonicalEnvironmentConfig } from "@/lib/canonical-env-validator"
import { validateEnvironment } from "@/lib/env-validator" // For explicit validation call

type CanonicalConfig = ReturnType<typeof getCanonicalEnvironmentConfig>

interface EnvContextType {
  config: CanonicalConfig | null
  isLoaded: boolean
}

const EnvContext = createContext<EnvContextType | undefined>(undefined)

export const EnvProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<CanonicalConfig | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Perform validation once on client mount if in dev or forced
    if (
      process.env.NODE_ENV === "development" ||
      process.env.VALIDATE_ENV_FORCE === "true" ||
      process.env.NEXT_PUBLIC_VALIDATE_ENV === "true"
    ) {
      validateEnvironment()
    }

    const loadedConfig = getCanonicalEnvironmentConfig()
    setConfig(loadedConfig)
    setIsLoaded(true)
  }, [])

  const value = useMemo(() => ({ config, isLoaded }), [config, isLoaded])

  return <EnvContext.Provider value={value}>{children}</EnvContext.Provider>
}

export const useEnv = (): EnvContextType => {
  const context = useContext(EnvContext)
  if (context === undefined) {
    throw new Error("useEnv must be used within an EnvProvider")
  }
  return context
}

// Helper to get a specific config value, especially useful for components
// that might render before the context is fully loaded, providing a fallback.
export const useEnvConfig = <K extends keyof CanonicalConfig>(key: K): CanonicalConfig[K] | undefined => {
  const { config, isLoaded } = useEnv()
  if (!isLoaded || !config) {
    // Attempt to get a synchronous fallback if needed, or return undefined
    // This is tricky because getCanonicalEnvironmentConfig() reads process.env which might not be ideal to call repeatedly.
    // For initial render, it might be better to handle loading state in the component.
    return undefined
  }
  return config[key]
}
