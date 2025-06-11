"use client"

import type React from "react" // Ensure React is imported for type React
import { useState } from "react"
import type { AccountInfo } from "@/lib/api/account-api"
import { Info, User, UploadCloud } from "lucide-react" // Added UploadCloud

interface NostrIdentityTabProps {
  accountInfo: AccountInfo
  onUpdate: () => void
}

export default function NostrIdentityTab({ accountInfo, onUpdate }: NostrIdentityTabProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [npubCopySuccess, setNpubCopySuccess] = useState(false)
  const [nprofileCopySuccess, setNprofileCopySuccess] = useState(false)

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

  const copyToClipboard = (text: string, type: "npub" | "nprofile") => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === "npub") setNpubCopySuccess(true)
      else setNprofileCopySuccess(true)
      setTimeout(() => {
        if (type === "npub") setNpubCopySuccess(false)
        else setNprofileCopySuccess(false)
      }, 2000)
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start gap-6">
        <div className="relative text-center sm:text-left">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-[#3a2a30] flex items-center justify-center mx-auto sm:mx-0">
            {accountInfo.profilePicture ? (
              <img
                src={accountInfo.profilePicture || "/placeholder.svg?width=96&height=96&query=Nostr+Profile+Avatar"}
                alt="Your Creative ID Picture"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={48} className="text-[#a09080]" />
            )}
          </div>
          <div className="mt-2">
            <label
              htmlFor="profile-upload"
              className="block w-full text-center px-2 py-1.5 bg-[#3a2a30] text-[#f0e6c8] text-xs rounded cursor-pointer hover:bg-[#4a3a40] transition-colors flex items-center justify-center gap-1.5"
              aria-disabled={isUploading}
            >
              <UploadCloud size={12} />
              {isUploading ? "Publishing..." : "Change Picture"}
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
          {/* Updated language "Published to Nostr" */}
          <div className="mt-1 text-[10px] text-[#a09080] text-center">Published to Nostr</div>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            {/* Updated label "Nostr Public Key (npub)" */}
            <label htmlFor="npub-input" className="block text-xs text-[#a09080] mb-1">
              Nostr Public Key (npub)
            </label>
            <div className="flex items-center">
              <input
                id="npub-input"
                type="text"
                value={accountInfo.npub}
                readOnly
                className="w-full bg-[#3a2a30] border border-[#4a3a40] rounded-l px-3 py-2 text-sm text-[#f0e6c8] font-mono"
                aria-label="Nostr Public Key"
              />
              <button
                onClick={() => copyToClipboard(accountInfo.npub, "npub")}
                className="px-3 py-2 bg-[#3a2a30] text-[#f0e6c8] text-xs rounded-r border border-l-0 border-[#4a3a40] hover:bg-[#4a3a40] transition-colors"
                aria-label="Copy Nostr Public Key"
              >
                {npubCopySuccess ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {accountInfo.nprofile && (
            <div>
              {/* Updated label "Nostr Profile (nprofile)" */}
              <label htmlFor="nprofile-input" className="block text-xs text-[#a09080] mb-1">
                Nostr Profile (nprofile)
              </label>
              <div className="flex items-center">
                <input
                  id="nprofile-input"
                  type="text"
                  value={accountInfo.nprofile}
                  readOnly
                  className="w-full bg-[#3a2a30] border border-[#4a3a40] rounded-l px-3 py-2 text-sm text-[#f0e6c8] font-mono"
                  aria-label="Nostr Profile ID"
                />
                <button
                  onClick={() => copyToClipboard(accountInfo.nprofile || "", "nprofile")}
                  className="px-3 py-2 bg-[#3a2a30] text-[#f0e6c8] text-xs rounded-r border border-l-0 border-[#4a3a40] hover:bg-[#4a3a40] transition-colors"
                  aria-label="Copy Nostr Profile ID"
                >
                  {nprofileCopySuccess ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}

          <div className="bg-[#3a2a30] p-3 rounded flex items-start gap-3 text-xs text-[#a09080]">
            <Info size={16} className="text-[#a09080] mt-0.5 flex-shrink-0" />
            <div>
              {/* Updated informational text */}
              <p>
                Your Creative ID (Nostr) is your passport across the SEQ1 ecosystem and beyond. Profile pictures are
                published to your Nostr profile, not stored on SEQ1 servers.
              </p>
              <p className="mt-2">Future updates will allow managing your NIP-05 identifier directly from SEQ1.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
