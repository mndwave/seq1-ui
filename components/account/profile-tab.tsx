"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getAccountInfo } from "@/lib/api/account-api"
import { useAuth } from "@/lib/auth-context"
import ThinkingDots from "@/components/thinking-dots"

export default function ProfileTab() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [profileData, setProfileData] = useState({
    displayName: "",
    username: "",
    website: "",
    about: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const accountInfo = await getAccountInfo()
        setProfileData({
          displayName: accountInfo.displayName || "",
          username: accountInfo.username || "",
          website: accountInfo.website || "",
          about: accountInfo.about || "",
        })
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveSuccess(false)

    try {
      // TODO: Implement actual profile save API call
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-[400px]">
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <ThinkingDots />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Name */}
          <div className="mb-4">
            <label className="block text-xs text-[#a09080] uppercase tracking-wide mb-2">Display Name</label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={profileData.displayName}
              onChange={handleChange}
              placeholder="Artist name"
              className="w-full bg-[#1a1015] border border-[#3a2a30] rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4287f5] text-[#f0e6c8] tracking-wide"
            />
            <p className="text-xs text-[#a09080] mt-1">Your public name across SEQ1</p>
          </div>

          {/* Username */}
          <div className="mb-4">
            <label className="block text-xs text-[#a09080] uppercase tracking-wide mb-2">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={profileData.username}
              onChange={handleChange}
              placeholder="handle"
              className="w-full bg-[#1a1015] border border-[#3a2a30] rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4287f5] text-[#f0e6c8] tracking-wide"
            />
            <p className="text-xs text-[#a09080] mt-1">Your @seq1.net identity</p>
          </div>

          {/* Website */}
          <div className="mb-4">
            <label className="block text-xs text-[#a09080] uppercase tracking-wide mb-2">Website</label>
            <input
              type="url"
              id="website"
              name="website"
              value={profileData.website}
              onChange={handleChange}
              placeholder="your-site.com"
              className="w-full bg-[#1a1015] border border-[#3a2a30] rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4287f5] text-[#f0e6c8] tracking-wide"
            />
          </div>

          {/* Bio */}
          <div className="mb-6">
            <label className="block text-xs text-[#a09080] uppercase tracking-wide mb-2">Bio</label>
            <textarea
              id="about"
              name="about"
              value={profileData.about}
              onChange={handleChange}
              placeholder="Your story"
              className="h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
            {saveSuccess && <span className="text-sm text-green-500">Profile updated successfully!</span>}
          </div>
        </form>
      )}
    </div>
  )
}
