"use client"

import type React from "react"

import { useState } from "react"
import type { AccountInfo } from "@/lib/api/account-api"
import { Info } from "lucide-react"

interface NostrIdentityTabProps {
  accountInfo: AccountInfo
  onUpdate: () => void
}

export default function NostrIdentityTab({ accountInfo, onUpdate }: NostrIdentityTabProps) {
  const [isUploading, setIsUploading] = useState(false)

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

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-[#3a2a30] flex items-center justify-center">
            {accountInfo.profilePicture ? (
              <img
                src={accountInfo.profilePicture || "/placeholder.svg"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={48} className="text-[#a09080]" />
            )}
          </div>
          <div className="mt-2">
            <label
              htmlFor="profile-upload"
              className="block w-full text-center px-2 py-1 bg-[#3a2a30] text-[#f0e6c8] text-xs rounded cursor-pointer hover:bg-[#4a3a40]"
            >
              {isUploading ? "Uploading..." : "Change Picture"}
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
          <div className="mt-1 text-[10px] text-[#a09080] text-center">Published to Nostr</div>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-xs text-[#a09080] mb-1">Nostr Public Key (npub)</label>
            <div className="flex items-center">
              <input
                type="text"
                value={accountInfo.npub}
                readOnly
                className="w-full bg-[#3a2a30] border border-[#4a3a40] rounded px-3 py-2 text-sm text-[#f0e6c8]"
              />
              <button
                onClick={() => navigator.clipboard.writeText(accountInfo.npub)}
                className="ml-2 px-3 py-2 bg-[#3a2a30] text-[#f0e6c8] text-xs rounded hover:bg-[#4a3a40]"
              >
                Copy
              </button>
            </div>
          </div>

          {accountInfo.nprofile && (
            <div>
              <label className="block text-xs text-[#a09080] mb-1">Nostr Profile (nprofile)</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={accountInfo.nprofile}
                  readOnly
                  className="w-full bg-[#3a2a30] border border-[#4a3a40] rounded px-3 py-2 text-sm text-[#f0e6c8]"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(accountInfo.nprofile || "")}
                  className="ml-2 px-3 py-2 bg-[#3a2a30] text-[#f0e6c8] text-xs rounded hover:bg-[#4a3a40]"
                >
                  Copy
                </button>
              </div>
            </div>
          )}

          <div className="bg-[#3a2a30] p-3 rounded flex items-start gap-3 text-xs text-[#a09080]">
            <Info size={16} className="text-[#a09080] mt-0.5 flex-shrink-0" />
            <div>
              <p>
                Your Nostr identity is used across the SEQ1 ecosystem. Profile pictures are published to your Nostr
                profile and not stored on SEQ1 servers.
              </p>
              <p className="mt-2">Future updates will allow editing your NIP-05 identifier directly from SEQ1.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Import the User icon at the top of the file
import { User } from "lucide-react"
