"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, ImageIcon, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ProfileTab() {
  const { user, updateProfile } = useAuth() // Assuming updateProfile exists in AuthContext
  const { toast } = useToast()

  const [creatorName, setCreatorName] = useState("")
  const [email, setEmail] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setCreatorName(user.name || "")
      setEmail(user.email || "")
      setAvatarUrl(user.profilePictureUrl || "")
    }
  }, [user])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // Assuming updateProfile takes an object with new profile data
      // and AuthContext handles the actual API call and updates the user state.
      if (updateProfile) {
        await updateProfile({
          name: creatorName,
          email: email,
          profilePictureUrl: avatarUrl,
        })
        toast({
          title: "Profile Updated",
          description: "Your creator profile has been successfully updated.",
        })
      } else {
        throw new Error("Profile update function not available.")
      }
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Could not update your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return <p className="text-center text-[#a09080]">Secure your session to manage your Creator Profile.</p>
  }

  return (
    <form onSubmit={handleProfileUpdate} className="space-y-6 p-1">
      <div>
        <h3 className="text-lg font-medium text-[#f0e6c8]">Your Creator Profile</h3>
        <p className="text-sm text-[#a09080]">
          Customize how you appear in the SEQ1 community. This information helps personalize your experience.
        </p>
      </div>

      <div className="space-y-4 bg-[#1a1015] border border-[#3a2a30] p-4 rounded-md">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Avatar className="h-24 w-24 ring-2 ring-[#3a2a30]">
            <AvatarImage src={avatarUrl || "/abstract-profile.png"} alt={creatorName || "Creator"} />
            <AvatarFallback className="bg-[#2a1a20] text-[#f0e6c8]">
              {creatorName ? creatorName.substring(0, 2).toUpperCase() : <User size={32} />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-grow space-y-1 w-full">
            <label htmlFor="avatarUrl" className="text-xs font-medium text-[#a09080]">
              Studio Avatar URL
            </label>
            <div className="flex items-center space-x-2">
              <ImageIcon size={16} className="text-[#a09080] flex-shrink-0" />
              <Input
                id="avatarUrl"
                type="url"
                placeholder="https://example.com/your-avatar.png"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="bg-[#0f0a0c] border-[#302028] text-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="creatorName" className="text-xs font-medium text-[#a09080]">
            Creator Name / Studio Name
          </label>
          <div className="flex items-center space-x-2">
            <User size={16} className="text-[#a09080] flex-shrink-0" />
            <Input
              id="creatorName"
              placeholder="Your Artist Name"
              value={creatorName}
              onChange={(e) => setCreatorName(e.target.value)}
              className="bg-[#0f0a0c] border-[#302028] text-sm"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="text-xs font-medium text-[#a09080]">
            Contact Email (Optional, Kept Private)
          </label>
          <div className="flex items-center space-x-2">
            <Mail size={16} className="text-[#a09080] flex-shrink-0" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#0f0a0c] border-[#302028] text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={isLoading} className="text-xs bg-[#4CAF50] hover:bg-[#5cb85c] text-white">
          {isLoading ? "Saving..." : "Save Profile Changes"}
          <Save size={14} className="ml-2" />
        </Button>
      </div>
    </form>
  )
}
