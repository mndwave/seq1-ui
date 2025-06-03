/**
 * SEQ1 UI Version Management - Bitcoin Blockheight
 * 
 * This module handles version management using Bitcoin blockheight as the version string.
 * This aligns system versioning with the Bitcoin consensus clock.
 */

// Global version storage for Bitcoin blockheight
let CURRENT_VERSION = "[unknown]"

export async function fetchBitcoinBlockheight(): Promise<string> {
  /**
   * Fetch current Bitcoin blockheight for version display.
   * 
   * Returns version string in format: "[850129]"
   * Falls back to "[unknown]" on any failure.
   */
  
  const endpoints = [
    "https://blockstream.info/api/blocks/tip/height",
    "https://mempool.space/api/blocks/tip/height"
  ]
  
  console.log("🪙 Fetching Bitcoin blockheight for version...")
  
  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Trying ${endpoint}`)
      const response = await fetch(endpoint, { 
        method: 'GET',
        cache: 'no-cache',
        headers: {
          'Accept': 'text/plain'
        }
      })
      
      if (response.ok) {
        const blockheight = (await response.text()).trim()
        if (/^\d+$/.test(blockheight)) {
          const version = `[${blockheight}]`
          CURRENT_VERSION = version
          console.log(`✅ Bitcoin blockheight fetched: ${version}`)
          
          // Store in localStorage for persistence
          if (typeof window !== 'undefined') {
            localStorage.setItem('seq1_version', version)
            localStorage.setItem('seq1_version_timestamp', Date.now().toString())
          }
          
          return version
        } else {
          console.warn(`⚠️ Invalid blockheight format: ${blockheight}`)
        }
      }
    } catch (error) {
      console.warn(`❌ Failed to fetch blockheight from ${endpoint}:`, error)
      continue
    }
  }
  
  // All endpoints failed - try to load from localStorage as fallback
  if (typeof window !== 'undefined') {
    const storedVersion = localStorage.getItem('seq1_version')
    const storedTimestamp = localStorage.getItem('seq1_version_timestamp')
    
    if (storedVersion && storedTimestamp) {
      const age = Date.now() - parseInt(storedTimestamp)
      // Use stored version if less than 1 hour old
      if (age < 60 * 60 * 1000) {
        CURRENT_VERSION = storedVersion
        console.log(`📦 Using cached blockheight version: ${storedVersion}`)
        return storedVersion
      }
    }
  }
  
  // Ultimate fallback
  CURRENT_VERSION = "[unknown]"
  console.error("❌ Failed to fetch Bitcoin blockheight from all endpoints, using fallback")
  return CURRENT_VERSION
}

export function getCurrentVersion(): string {
  /**
   * Get the current version string (Bitcoin blockheight format).
   * 
   * Priority:
   * 1. Environment variable NEXT_PUBLIC_SEQ1_VERSION (build-time injection)
   * 2. Runtime fetched blockheight
   * 3. Fallback "[unknown]"
   */
  
  // Check for build-time injected version first
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SEQ1_VERSION) {
    return process.env.NEXT_PUBLIC_SEQ1_VERSION
  }
  
  return CURRENT_VERSION
}

export function initializeVersionSystem(): void {
  /**
   * Initialize the version system on app startup.
   * This should be called early in the app lifecycle.
   */
  
  if (typeof window === 'undefined') return // Skip on server-side
  
  // Fetch blockheight on startup (non-blocking)
  fetchBitcoinBlockheight().catch(error => {
    console.warn("Version system initialization failed:", error)
  })
  
  // Log version info to console
  setTimeout(() => {
    const version = getCurrentVersion()
    console.log(`🪙 SEQ1 UI Version: ${version}`)
    console.log(`📅 Bitcoin Consensus Clock: ${version.replace(/[\[\]]/g, '')}`)
    console.log(`🔗 Chain = Clock = Version = Trust`)
  }, 1000)
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  // Initialize after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeVersionSystem)
  } else {
    initializeVersionSystem()
  }
} 