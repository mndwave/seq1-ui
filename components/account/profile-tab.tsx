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
  const { user, saveUserProfile } = useAuth()
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
      const success = await saveUserProfile({
        username: profileData.username,
        displayName: profileData.displayName,
      })

      if (success) {
        setSaveSuccess(true)
        setTimeout(() => {
          setSaveSuccess(false)
        }, 3000)
      }
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
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              name="displayName"
              value={profileData.displayName}
              onChange={handleChange}
              placeholder="Your display name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={profileData.username}
              onChange={handleChange}
              placeholder="username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              value={profileData.website}
              onChange={handleChange}
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="about">About</Label>
            <textarea
              id="about"
              name="about"
              value={profileData.about}
              onChange={handleChange}
              placeholder="Tell us about yourself"
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
