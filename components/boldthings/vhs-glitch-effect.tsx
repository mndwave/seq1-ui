"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface BoldthingsVHSGlitchProps {
  children: React.ReactNode
  trigger_probability?: number
  check_interval?: [number, number]
  duration?: [number, number]
  intensity_levels?: ("low" | "medium" | "high")[]
  className?: string
}

export function BoldthingsVHSGlitch({
  children,
  trigger_probability = 0.04,
  check_interval = [2000, 5000],
  duration = [200, 800],
  intensity_levels = ["low", "medium", "high"],
  className = ""
}: BoldthingsVHSGlitchProps) {
  const [isGlitching, setIsGlitching] = useState(false)
  const [glitchType, setGlitchType] = useState<"horizontal" | "vertical" | "color" | "flicker" | "noise">("horizontal")
  const [intensity, setIntensity] = useState<"low" | "medium" | "high">("low")

  useEffect(() => {
    const checkForGlitch = () => {
      if (Math.random() < trigger_probability) {
        const types: ("horizontal" | "vertical" | "color" | "flicker" | "noise")[] = 
          ["horizontal", "vertical", "color", "flicker", "noise"]
        setGlitchType(types[Math.floor(Math.random() * types.length)])
        setIntensity(intensity_levels[Math.floor(Math.random() * intensity_levels.length)])
        setIsGlitching(true)
        
        const glitchDuration = duration[0] + Math.random() * (duration[1] - duration[0])
        setTimeout(() => setIsGlitching(false), glitchDuration)
      }
      
      const nextCheck = check_interval[0] + Math.random() * (check_interval[1] - check_interval[0])
      setTimeout(checkForGlitch, nextCheck)
    }
    
    const initialDelay = Math.random() * check_interval[1]
    setTimeout(checkForGlitch, initialDelay)
  }, [trigger_probability, check_interval, duration, intensity_levels])

  const getGlitchStyles = () => {
    if (!isGlitching) return {}
    
    const intensityMultiplier = intensity === "low" ? 1 : intensity === "medium" ? 2 : 3
    
    switch (glitchType) {
      case "horizontal":
        return {
          transform: `translateX(${(Math.random() - 0.5) * 10 * intensityMultiplier}px)`,
          filter: "blur(0.5px)"
        }
      case "vertical":
        return {
          transform: `translateY(${(Math.random() - 0.5) * 6 * intensityMultiplier}px)`,
          filter: "blur(0.3px)"
        }
      case "color":
        return {
          textShadow: `${2 * intensityMultiplier}px 0 0 rgba(255,0,0,0.5), ${-2 * intensityMultiplier}px 0 0 rgba(0,255,255,0.5)`
        }
      case "flicker":
        return {
          opacity: 0.3 + Math.random() * 0.7
        }
      case "noise":
        return {
          filter: `contrast(${100 + 50 * intensityMultiplier}%) brightness(${100 + 30 * intensityMultiplier}%)`
        }
      default:
        return {}
    }
  }

  return (
    <div 
      className={cn("transition-all duration-75", className)}
      style={getGlitchStyles()}
    >
      {children}
    </div>
  )
}
