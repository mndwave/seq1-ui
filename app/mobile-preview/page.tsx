"use client"

import { useState } from "react"
import SmallScreenMessage from "@/components/small-screen-message"
import EarlyAccessAnnouncement from "@/components/early-access-announcement"

export default function MobilePreviewPage() {
  const [showAnnouncement, setShowAnnouncement] = useState(true)

  return (
    <>
      <SmallScreenMessage />
      <EarlyAccessAnnouncement isOpen={showAnnouncement} onClose={() => setShowAnnouncement(false)} />

      {/* Add a button to reopen the modal after closing for testing */}
      {!showAnnouncement && (
        <button
          onClick={() => setShowAnnouncement(true)}
          className="fixed bottom-4 right-4 bg-[#f0e6c8] text-[#2a1a20] px-4 py-2 rounded-sm text-xs font-bold z-[2147483648]"
        >
          REOPEN MODAL
        </button>
      )}
    </>
  )
}
