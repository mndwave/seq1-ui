"use client"

import { Label } from "@/components/ui/label"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Trash2, ShieldAlert } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { deleteAccount } from "@/lib/api/account-api"
import { useAuth } from "@/lib/auth-context" // To log out user after deletion

interface DangerZoneTabProps {
  onAccountDeleted: () => void // Callback to close modal, trigger logout etc.
}

export default function DangerZoneTab({ onAccountDeleted }: DangerZoneTabProps) {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const { logout } = useAuth() // Get logout function from AuthContext

  const handleDeleteRequest = () => {
    setShowConfirmation(true)
    setError(null) // Clear previous errors
  }

  const handleCancelDelete = () => {
    setShowConfirmation(false)
    setConfirmText("")
    setError(null)
  }

  const handleConfirmDelete = async () => {
    if (confirmText !== "DELETE MY STUDIO") {
      setError("Please type DELETE MY STUDIO to confirm.")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      const response = await deleteAccount() // API call

      if (response.success) {
        toast({
          title: "Studio Presence Deleted",
          description: "Your SEQ1 account and associated data have been permanently removed.",
          variant: "default", // Or a success variant if you have one
        })
        await logout() // Log out the user from the client-side
        onAccountDeleted() // Close modal, redirect, etc.
      } else {
        setError(response.error || "Failed to delete your studio presence. Please try again.")
        toast({
          title: "Deletion Failed",
          description: response.error || "An unexpected error occurred.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error deleting account:", err)
      const message = err instanceof Error ? err.message : "An unknown error occurred."
      setError(`An unexpected error occurred: ${message}`)
      toast({
        title: "Deletion Error",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Alert variant="destructive" className="bg-red-900/10 border-red-700/40">
        <ShieldAlert className="h-5 w-5 text-red-400" />
        <AlertTitle className="text-red-300">Critical Action Zone</AlertTitle>
        <AlertDescription className="text-red-400/80">
          Actions in this section are irreversible and will result in permanent data loss. Proceed with extreme caution.
        </AlertDescription>
      </Alert>

      {!showConfirmation ? (
        <div className="border border-red-700/40 rounded-md p-4 bg-[#2a1a20]">
          <h3 className="text-lg font-medium text-[#f0e6c8] mb-1 flex items-center">
            <Trash2 size={18} className="mr-2 text-red-400" />
            Delete Your SEQ1 Studio Presence
          </h3>
          <p className="text-sm text-[#a09080] mb-4">
            This will permanently erase your SEQ1 account, including all projects, settings, and accumulated Studio
            Time. Your underlying Creative Identity (Nostr keys) will remain yours and unaffected, as it exists
            independently of SEQ1. This action cannot be undone.
          </p>
          <Button
            variant="destructive"
            onClick={handleDeleteRequest}
            className="bg-red-700 hover:bg-red-600 text-white"
          >
            Request Studio Deletion
          </Button>
        </div>
      ) : (
        <div className="border border-red-700/40 rounded-md p-4 bg-[#2a1a20]">
          <h3 className="text-lg font-medium text-red-300 mb-2 flex items-center">
            <AlertTriangle size={20} className="mr-2" />
            Confirm Permanent Deletion
          </h3>
          <p className="text-sm text-[#a09080] mb-4">
            You are about to permanently delete your entire SEQ1 studio presence. This includes:
          </p>
          <ul className="list-disc list-inside text-sm text-[#a09080] mb-4 pl-4 space-y-1">
            <li>All your saved projects and creative work within SEQ1.</li>
            <li>Your account settings and preferences.</li>
            <li>Any remaining Studio Time or referral credits.</li>
          </ul>
          <p className="text-sm text-[#a09080] mb-4">
            Your Creative Identity (Nostr keys) will <span className="font-semibold text-yellow-400">not</span> be
            deleted from your possession, but its link to SEQ1 data will be severed.
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="confirmDelete" className="block text-xs text-[#a09080] mb-1">
                To confirm, type <strong className="text-red-300">DELETE MY STUDIO</strong> in the box below:
              </Label>
              <Input
                id="confirmDelete"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE MY STUDIO"
                className="w-full bg-[#3a2a30] border-[#4a3a40] rounded px-3 py-2 text-sm text-[#f0e6c8] focus:border-red-500"
              />
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-900/30">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={handleCancelDelete}
                className="w-full sm:w-auto border-[#4a3a40] text-[#a09080] hover:bg-[#4a3a40] hover:text-[#f0e6c8]"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={isProcessing || confirmText !== "DELETE MY STUDIO"}
                className="w-full sm:w-auto flex-grow bg-red-700 hover:bg-red-600 text-white"
              >
                {isProcessing ? "Deleting..." : "Yes, Permanently Delete My Studio"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
