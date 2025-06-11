"use client"

import config from "@/lib/config" // Use the centralized config
import { useEffect, useState } from "react"

const VersionIndicator = () => {
  const [blockheight, setBlockheight] = useState<string>("")

  useEffect(() => {
    // Extract just the blockheight number
    const height = config.NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT || "899250"
    setBlockheight(height)
  }, [])

  if (!blockheight || blockheight.includes("undefined")) {
    return null
  }

  return (
    <div
      className="fixed bottom-2 right-2 text-xs bg-neutral-600 text-neutral-300 px-1.5 py-0.5 rounded-sm shadow-sm"
      aria-label={`Current version: SEQ1 ${blockheight}`}
      title={`SEQ1 Version ${blockheight}`}
    >
      {blockheight}
    </div>
  )
}

export default VersionIndicator
