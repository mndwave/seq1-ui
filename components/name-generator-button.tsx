"use client"

import { Wand2 } from "lucide-react"

interface NameGeneratorButtonProps {
  onClick: () => void
  className?: string
}

export default function NameGeneratorButton({ onClick, className = "" }: NameGeneratorButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`vintage-button px-2 py-1 flex items-center rounded-sm transition-all duration-200 hover:bg-[#3a2a30] ${className}`}
      title="Generate random name"
    >
      <Wand2 size={12} className="mr-1" />
      <span className="text-xs tracking-wide">GENERATE</span>
    </button>
  )
}
