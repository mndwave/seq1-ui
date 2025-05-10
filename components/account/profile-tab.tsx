"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { AccountInfo } from "@/lib/api/account-api"
import { Copy, Save } from "lucide-react"

interface ProfileTabProps {
  accountInfo: AccountInfo
  onUpdate: () => void
}

export default function ProfileTab({ accountInfo, onUpdate }: ProfileTabProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    displayName: accountInfo.displayName || "",
    username: accountInfo.username || "",
    website: accountInfo.website || "",
    about: accountInfo.about || "",
  })
  const [copied, setCopied] = useState(false)
  const aboutRef = useRef<HTMLTextAreaElement>(null)

  // Initialize the about field height
  useEffect(() => {
    if (aboutRef.current) {
      aboutRef.current.style.height = "32px"
      if (formData.about) {
        // If there's content, set the height to fit the content
        aboutRef.current.style.height = "auto"
        aboutRef.current.style.height = `${aboutRef.current.scrollHeight}px`
      }
    }
  }, [formData.about])

  const handleAboutChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setIsEditing(true)

    // Auto-resize the textarea
    e.target.style.height = "32px"
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      // In a real implementation, this would upload the image to Nostr
      // For now, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // After successful upload, refresh account info
      onUpdate()
    } catch (error) {
      console.error("Error uploading profile picture:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      // In a real implementation, this would save to the backend
      // For now, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      // After successful save, refresh account info
      onUpdate()
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving profile:", error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-3 text-sm">
      <div className="flex items-start gap-4">
        {/* Added mt-4 to move the avatar down and center it vertically */}
        <div className="relative flex-shrink-0 mt-4">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-[#2a1a20] flex items-center justify-center border-2 border-[#3a2a30]">
            <img
              src={accountInfo.profilePicture || "/default.jpg"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <label
            htmlFor="profile-upload"
            className="absolute top-0 right-0 bg-[#3a2a30] text-[#f0e6c8] p-1 rounded-full cursor-pointer hover:bg-[#4a3a40] border border-[#4a3a40]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </label>
          <input
            id="profile-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
        </div>

        <div className="flex-1 space-y-2">
          <div>
            <label className="block text-xs text-[#a09080] mb-0.5">Display Name</label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              placeholder="Your display name"
              className="w-full bg-[#2a1a20] border border-[#3a2a30] rounded px-2 py-1.5 text-xs text-[#f0e6c8]"
            />
          </div>

          <div>
            <label className="block text-xs text-[#a09080] mb-0.5">Username</label>
            <div className="flex">
              <span className="bg-[#2a1a20] border border-[#3a2a30] border-r-0 rounded-l px-2 py-1.5 text-[#a09080] text-xs">
                @
              </span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="username"
                className="flex-1 bg-[#2a1a20] border border-[#3a2a30] rounded-r px-2 py-1.5 text-xs text-[#f0e6c8]"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs text-[#a09080] mb-0.5">Website</label>
        <input
          type="text"
          name="website"
          value={formData.website}
          onChange={handleInputChange}
          placeholder="https://yourwebsite.com"
          className="w-full bg-[#2a1a20] border border-[#3a2a30] rounded px-2 py-1.5 text-xs text-[#f0e6c8]"
        />
      </div>

      <div>
        <label className="block text-xs text-[#a09080] mb-0.5">About</label>
        <textarea
          ref={aboutRef}
          name="about"
          value={formData.about}
          onChange={handleAboutChange}
          placeholder="Tell us about yourself"
          className="w-full bg-[#2a1a20] border border-[#3a2a30] rounded px-2 py-1.5 text-xs text-[#f0e6c8] overflow-hidden"
          style={{ resize: "none" }}
        ></textarea>
      </div>

      <div className="pt-2 border-t border-[#3a2a30]">
        <div className="flex justify-between items-center mb-0.5">
          <label className="text-xs text-[#a09080]">Nostr Public Key</label>
        </div>
        <div className="flex">
          <input
            type="text"
            value={accountInfo.npub}
            readOnly
            className="flex-1 bg-[#2a1a20] border border-[#3a2a30] border-r-0 rounded-l px-2 py-1.5 text-xs text-[#a09080] font-mono overflow-hidden text-ellipsis"
          />
          <button
            onClick={() => copyToClipboard(accountInfo.npub)}
            className="bg-[#3a2a30] border border-[#3a2a30] rounded-r px-2 py-1.5 text-xs text-[#f0e6c8] hover:bg-[#4a3a40] flex items-center gap-1 whitespace-nowrap"
          >
            {copied ? "Copied!" : "Copy"}
            <Copy size={12} />
          </button>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={!isEditing}
          className={`px-3 py-1.5 text-white text-xs rounded flex items-center gap-1 ${
            isEditing ? "bg-[#4287f5] hover:bg-[#3277e5]" : "bg-[#3a3a3a] cursor-not-allowed"
          }`}
        >
          <Save size={12} />
          Save Changes
        </button>
      </div>
    </div>
  )
}
