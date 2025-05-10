"use client"

import { useState } from "react"
import AccountModal from "@/components/account/account-modal"
import TimeoutModal from "@/components/account/timeout-modal"

export default function AccountDemo() {
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [showTimeoutModal, setShowTimeoutModal] = useState(false)

  return (
    <div className="min-h-screen bg-[#1a0a10] flex flex-col items-center justify-center p-4">
      <h1 className="text-[#f0e6c8] text-2xl font-bold mb-8">SEQ1 Account System Demo</h1>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <button
          onClick={() => setShowAccountModal(true)}
          className="bg-[#3a2a30] hover:bg-[#4a3a40] text-[#f0e6c8] py-3 px-6 rounded font-medium"
        >
          Open Account Modal
        </button>

        <button
          onClick={() => setShowTimeoutModal(true)}
          className="bg-red-900/30 hover:bg-red-900/50 text-red-200 py-3 px-6 rounded font-medium"
        >
          Simulate Timeout Modal
        </button>
      </div>

      {showAccountModal && <AccountModal isOpen={showAccountModal} onClose={() => setShowAccountModal(false)} />}

      <TimeoutModal isOpen={showTimeoutModal} />
    </div>
  )
}
