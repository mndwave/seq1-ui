'use client'

import { useState, useEffect } from 'react'
import { getCurrentVersion, fetchBitcoinBlockheight } from '@/lib/version'

export function VersionDisplay() {
  const [version, setVersion] = useState('[fetching...]')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function updateVersion() {
      try {
        // First try to get current version
        let currentVersion = getCurrentVersion()
        
        // If it's unknown or default, fetch fresh blockheight
        if (currentVersion === '[unknown]' || currentVersion === '[fetching...]') {
          currentVersion = await fetchBitcoinBlockheight()
        }
        
        setVersion(currentVersion.replace(/^\[/, '[UI: ').replace(/\]$/, ']'))
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to fetch version:', error)
        setVersion('[UI: error]')
        setIsLoading(false)
      }
    }

    updateVersion()

    // Update version every 10 minutes
    const interval = setInterval(updateVersion, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadingClass = isLoading ? 'animate-pulse' : ''

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
      <div className={`text-xs text-gray-400 font-mono bg-black/10 backdrop-blur px-2 py-1 rounded border border-gray-800 ${loadingClass}`}>
        {version}
      </div>
    </div>
  )
} 