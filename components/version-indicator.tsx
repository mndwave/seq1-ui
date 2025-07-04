"use client"

import { useState, useEffect } from "react"

export default function VersionIndicator() {
  const [blockheight, setBlockheight] = useState<string>("loading...")

  useEffect(() => {
    // CANONICAL BLOCKHEIGHT DETECTION - read from DOM
    const extractCanonicalBlockheight = (): string | null => {
      // Method 1: Look for hidden div with canonical format
      const elements = document.querySelectorAll('div')
      for (const element of elements) {
        const match = element.textContent?.match(/SEQ1_BLOCKHEIGHT:(\d+)/)
        if (match) {
          return match[1]
        }
      }
      
      // Method 2: Scan entire document for canonical pattern
      const bodyText = document.body.textContent || document.body.innerText || ''
      const match = bodyText.match(/SEQ1_BLOCKHEIGHT:(\d+)/)
      if (match) {
        return match[1]
      }
      
      return null
    }
    
    // Try canonical detection first
    const canonicalBlockheight = extractCanonicalBlockheight()
    
    if (canonicalBlockheight) {
      setBlockheight(canonicalBlockheight)
    } else {
      // Fallback to environment variable if canonical method fails
      const envBlockheight = process.env.NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT
      if (envBlockheight && envBlockheight !== "undefined") {
        setBlockheight(envBlockheight)
      } else {
        // Last resort fallback
        setBlockheight("903951")
      }
    }
  }, [])

  return (
    <div className="fixed bottom-2 right-3 pointer-events-none z-10" aria-hidden="true">
      <div className="inline-flex items-center bg-[#3a2a30] border border-[#4a3a40] rounded-sm px-2 py-1">
        <span className="text-[8px] text-[#f0e6c8] font-medium tracking-wider">
          SEQ1 [{blockheight}]
        </span>
      </div>
    </div>
  )
}
