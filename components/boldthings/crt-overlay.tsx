"use client"

import { cn } from "@/lib/utils"

interface BoldthingsCRTOverlayProps {
  children?: React.ReactNode
  scanline_intensity?: number
  flicker_intensity?: number
  glow_intensity?: number
  className?: string
}

export function BoldthingsCRTOverlay({
  children,
  scanline_intensity = 0.3,
  flicker_intensity = 0.1,
  glow_intensity = 0.2,
  className = ""
}: BoldthingsCRTOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      
      {/* CRT Scanlines */}
      <div 
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, ${scanline_intensity}) 2px,
            rgba(0, 0, 0, ${scanline_intensity}) 4px
          )`,
          opacity: 0.7
        }}
      />
      
      {/* CRT Glow */}
      <div 
        className="absolute inset-0 pointer-events-none z-5"
        style={{
          boxShadow: `inset 0 0 ${30 * glow_intensity}px rgba(122, 158, 159, ${glow_intensity})`,
          background: `radial-gradient(circle at center, transparent 50%, rgba(0, 0, 0, ${glow_intensity * 0.5}) 100%)`
        }}
      />
      
      {/* CRT Flicker Animation */}
      <div 
        className="absolute inset-0 pointer-events-none z-15"
        style={{
          background: `rgba(255, 255, 255, ${flicker_intensity * 0.1})`,
          animation: "crt-flicker 8s ease-in-out infinite"
        }}
      />
      
      {/* Moving Scanline */}
      <div 
        className="absolute left-0 right-0 h-[2px] pointer-events-none z-20"
        style={{
          background: `rgba(255, 255, 255, ${glow_intensity * 0.5})`,
          boxShadow: `0 0 ${5 * glow_intensity}px rgba(122, 158, 159, 0.5)`,
          animation: "moving-scanline 3s linear infinite"
        }}
      />
      
      <style jsx>{`
        @keyframes moving-scanline {
          0% { top: -5%; }
          100% { top: 105%; }
        }
        @keyframes crt-flicker {
          0%, 100% { opacity: 1; }
          3% { opacity: 0.98; }
          6% { opacity: 0.95; }
          7% { opacity: 0.9; }
          9% { opacity: 0.98; }
          48% { opacity: 0.98; }
          50% { opacity: 0.95; }
          57% { opacity: 0.92; }
          83% { opacity: 0.95; }
          87% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
