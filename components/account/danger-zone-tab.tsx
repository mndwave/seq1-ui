"use client"

import { useState } from "react"
import { deleteAccount } from "@/lib/api/account-api"
import { AlertTriangle, AlertCircle } from "lucide-react"

interface DangerZoneTabProps {
  onAccountDeleted: () => void
}

export default function DangerZoneTab({ onAccountDeleted }: DangerZoneTabProps) {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDeleteRequest = () => {
    setShowConfirmation(true)
  }

  const handleCancelDelete = () => {
    setShowConfirmation(false)
    setConfirmText("")
    setError(null)
  }

  const handleConfirmDelete = async () => {
    if (confirmText !== "DELETE") {
      setError("Please type DELETE to confirm")
      return
    }

    try {
      setIsProcessing(true)
      setError(null)

      const response = await deleteAccount()

      if (response.success) {
        // Account deleted successfully
        onAccountDeleted()
      } else {
        setError(response.error || "Failed to delete account")
      }
    } catch (error) {
      console.error("Error deleting account:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-red-900/20 border border-red-900/30 p-4 rounded">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-red-200 text-base font-medium">Danger Zone</h3>
            <p className="text-red-300/70 text-sm mt-1">Actions in this section cannot be undone</p>
          </div>
        </div>
      </div>

      {!showConfirmation ? (
        <div className="border border-red-900/30 rounded p-4">
          <h3 className="text-[#f0e6c8] text-base font-medium mb-2">Delete SEQ1 Account</h3>
          <p className="text-[#a09080] text-sm mb-4">
            This will permanently delete your SEQ1 account and remove all associated data. Your Nostr identity will
            remain intact, as it exists independently of SEQ1.
          </p>

          <button
            onClick={handleDeleteRequest}
            className="bg-red-900/30 hover:bg-red-900/50 text-red-200 py-2 px-4 rounded font-medium"
          >
            Delete Account
          </button>
        </div>
      ) : (
        <div className="border border-red-900/30 rounded p-4">
          <h3 className="text-red-200 text-base font-medium mb-2">Confirm Account Deletion</h3>
          <p className="text-[#a09080] text-sm mb-4">
            This will remove your data from SEQ1, not Nostr. All your creative time, projects, and settings will be
            permanently deleted.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[#a09080] mb-1">Type DELETE to confirm</label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-[#3a2a30] border border-[#4a3a40] rounded px-3 py-2 text-sm text-[#f0e6c8]"
              />
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-900/30 text-red-200 p-3 rounded text-sm flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <div>{error}</div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="bg-[#3a2a30] hover:bg-[#4a3a40] text-[#f0e6c8] py-2 px-4 rounded font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isProcessing || confirmText !== "DELETE"}
                className="bg-red-900/30 hover:bg-red-900/50 text-red-200 py-2 px-4 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Processing..." : "Permanently Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
