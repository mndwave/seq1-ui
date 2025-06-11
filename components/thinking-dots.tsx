"use client"

import { useEffect, useState } from "react"

export default function ThinkingDots({ className = "" }: { className?: string }) {
  const [dots, setDots] = useState(".")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return "."
        return prev + "."
      })
    }, 400)

    return () => clearInterval(interval)
  }, [])

  return <div className={`text-sm text-[#50dc64] font-mono ${className}`}>THINKING{dots}</div>
}
