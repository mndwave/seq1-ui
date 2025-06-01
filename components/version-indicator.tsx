"use client"

import { useState, useEffect } from "react"

export default function VersionIndicator() {
  const [blockheight, setBlockheight] = useState<string>("999999")

  // Function to get current bitcoin blockheight
  const getBlockheight = async (): Promise<string> => {
    try {
      // Try multiple APIs for reliability
      const apis = [
        "https://blockstream.info/api/blocks/tip/height",
        "https://blockchain.info/q/getblockcount", 
        "https://mempool.space/api/blocks/tip/height"
      ]

      for (const api of apis) {
        try {
          const response = await fetch(api, { 
            signal: AbortSignal.timeout(5000) // 5 second timeout
          })
          if (response.ok) {
            const height = await response.text()
            return height.trim()
          }
        } catch (err) {
          console.warn(`Failed to fetch from ${api}:`, err)
        }
      }
      
      // Fallback to static high number if all APIs fail
      return "999999"
    } catch (error) {
      console.warn("All blockheight APIs failed:", error)
      return "999999"
    }
  }

  // Update blockheight on mount and periodically
  useEffect(() => {
    const updateBlockheight = async () => {
      const height = await getBlockheight()
      setBlockheight(height)
    }

    // Initial fetch
    updateBlockheight()

    // Update every 10 minutes (blocks are ~10 min on average)
    const interval = setInterval(updateBlockheight, 10 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed bottom-2 right-3 pointer-events-none z-50" aria-hidden="true">
      <div className="inline-flex items-center bg-[#3a2a30] border border-[#4a3a40] rounded-sm px-2 py-1">
        <span className="text-[8px] text-[#f0e6c8] font-medium tracking-wider">
          SEQ1 [{blockheight}]
        </span>
      </div>
    </div>
  )
}
