"use client"

import { useState, useEffect } from "react"

export default function VersionIndicator() {
  const [blockheight, setBlockheight] = useState<string>("loading...")

  useEffect(() => {
    // Use ONLY the build-time environment variable (static deployment blockheight)
    const deploymentBlockheight = process.env.NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT
    
    if (deploymentBlockheight && deploymentBlockheight !== "undefined") {
      setBlockheight(deploymentBlockheight)
    } else {
      // Fallback only if env var is missing (shouldn't happen in production)
      setBlockheight("903183")
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
