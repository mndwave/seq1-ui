"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Music, Sparkles, Heart, X } from "lucide-react"

interface GentleInviteProps {
  isVisible: boolean
  activeTimeMinutes: number
  featuresExplored: number
  creativeMoments: number
  onCreateAccount: () => void
  onDismiss: () => void
  className?: string
}

/**
 * Gentle Invite Component
 * Celebrates creative achievements and gently invites users to save their work
 * NO time pressure, NO threatening language
 */
export default function GentleInvite({ 
  isVisible,
  activeTimeMinutes,
  featuresExplored,
  creativeMoments,
  onCreateAccount,
  onDismiss,
  className = "" 
}: GentleInviteProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isVisible) return null

  const achievements = [
    { icon: Music, text: `${creativeMoments} creative moments`, color: "text-purple-400" },
    { icon: Sparkles, text: `${featuresExplored} features explored`, color: "text-blue-400" },
    { icon: Heart, text: `${activeTimeMinutes} minutes of music`, color: "text-pink-400" }
  ]

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}>
      <Card className="bg-[#2a1f25] border-[#3a2a30] p-6 max-w-md mx-4 relative">
        {/* Close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="absolute top-2 right-2 text-[#8a7a85] hover:text-[#f0e6c8]"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-2xl mb-2">🎨</div>
          <h3 className="text-xl font-semibold text-[#f0e6c8] mb-2">
            You're creating something beautiful
          </h3>
          <p className="text-[#8a7a85] text-sm">
            Your musical journey is taking shape. Want to save your progress?
          </p>
        </div>

        {/* Achievements */}
        <div className="space-y-3 mb-6">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon
            return (
              <div key={index} className="flex items-center gap-3">
                <Icon className={`h-5 w-5 ${achievement.color}`} />
                <span className="text-[#f0e6c8] text-sm">{achievement.text}</span>
              </div>
            )
          })}
        </div>

        {/* Benefits (not features) */}
        <div className="bg-[#1a1015] rounded-lg p-4 mb-6">
          <h4 className="text-[#f0e6c8] font-medium mb-3">Save your creative work:</h4>
          <ul className="space-y-2 text-sm text-[#8a7a85]">
            <li>• Keep all your musical ideas safe</li>
            <li>• Continue where you left off</li>
            <li>• Share your creations with others</li>
            <li>• Access advanced creative tools</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={onCreateAccount}
            className="flex-1 bg-[#6b4e71] hover:bg-[#7a5a81] text-[#f0e6c8]"
          >
            Save My Work
          </Button>
          <Button
            variant="outline"
            onClick={onDismiss}
            className="border-[#3a2a30] text-[#8a7a85] hover:text-[#f0e6c8] hover:bg-[#3a2a30]"
          >
            Keep Exploring
          </Button>
        </div>

        {/* Gentle note */}
        <p className="text-xs text-[#6a5a65] text-center mt-4">
          No pressure - you can always create an account later
        </p>
      </Card>
    </div>
  )
} 