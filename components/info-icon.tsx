"use client"

import { Info } from "lucide-react"

interface InfoIconProps {
  size?: number
  className?: string
  onClick?: () => void
}

export default function InfoIcon({ size = 16, className = "", onClick }: InfoIconProps) {
  return (
    <div className={`inline-flex items-center justify-center ${onClick ? "cursor-pointer" : ""}`} onClick={onClick}>
      <Info size={size} className={`info-icon-pulse ${className}`} />
    </div>
  )
}
