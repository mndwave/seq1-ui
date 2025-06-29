"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface BoldthingsHighlightedTypewriterProps {
  text: string
  word_to_highlight: string
  className?: string
  typewriter_speed?: number
  typewriter_start_delay?: number
  highlight_delay?: number
  highlight_step_duration?: number
  highlight_color?: string
}

export function BoldthingsHighlightedTypewriter({
  text,
  word_to_highlight,
  className = "",
  typewriter_speed = 35,
  typewriter_start_delay = 2500,
  highlight_delay = 7500,
  highlight_step_duration = 80,
  highlight_color = "rgba(64, 224, 208, 0.3)"
}: BoldthingsHighlightedTypewriterProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [highlightedWord, setHighlightedWord] = useState("")
  const [isHighlighting, setIsHighlighting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(true)
      let currentIndex = 0
      
      const typeInterval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1))
          currentIndex++
        } else {
          clearInterval(typeInterval)
          setIsTyping(false)
          
          // Start highlight animation
          setTimeout(() => {
            setIsHighlighting(true)
            let highlightIndex = 0
            
            const highlightInterval = setInterval(() => {
              if (highlightIndex < word_to_highlight.length) {
                setHighlightedWord(word_to_highlight.slice(0, highlightIndex + 1))
                highlightIndex++
              } else {
                clearInterval(highlightInterval)
              }
            }, highlight_step_duration)
          }, highlight_delay - typewriter_start_delay)
        }
      }, typewriter_speed)
      
      return () => clearInterval(typeInterval)
    }, typewriter_start_delay)
    
    return () => clearTimeout(timer)
  }, [text, word_to_highlight, typewriter_speed, typewriter_start_delay, highlight_delay, highlight_step_duration])

  const renderTextWithHighlight = () => {
    if (!isHighlighting) return displayedText
    
    const parts = displayedText.split(word_to_highlight)
    if (parts.length === 1) return displayedText
    
    return (
      <>
        {parts[0]}
        <span 
          className="animate-pulse"
          style={{
            backgroundColor: highlight_color,
            borderRadius: "1px",
            transform: "skew(-2deg, 0.5deg)",
            opacity: 0.9
          }}
        >
          {highlightedWord}
        </span>
        {parts[1]}
      </>
    )
  }

  return (
    <div className={cn("font-mono", className)}>
      {renderTextWithHighlight()}
      {isTyping && <span className="animate-pulse">|</span>}
    </div>
  )
}
