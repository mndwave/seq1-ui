"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, UserPlus, HardDrive } from "lucide-react"

interface SessionSaveModalProps {
  isOpen: boolean
  onClose: () => void
  onSaveToDevice: () => void
  onUpgradeAccount: () => void
}

export default function SessionSaveModal({ isOpen, onClose, onSaveToDevice, onUpgradeAccount }: SessionSaveModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#2E2027] border-[#4A3B41] text-neutral-200">
        <DialogHeader>
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-6 w-6 text-yellow-400" />
            <DialogTitle className="text-xl font-semibold text-neutral-100">Save Your Work</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-neutral-300">
            Your current session is about to end. Save your work to this device or secure your session by upgrading your
            account to prevent data loss.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <p className="text-xs text-neutral-400">
            Saving to device is a temporary measure. For permanent storage and access across devices, please upgrade
            your account.
          </p>
        </div>
        <DialogFooter className="sm:justify-center space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onSaveToDevice}
            className="w-full sm:w-auto channel-button border-neutral-600 hover:bg-neutral-700 hover:text-neutral-100"
          >
            <HardDrive className="mr-2 h-4 w-4" />
            Save to Device
          </Button>
          <Button
            type="button"
            onClick={onUpgradeAccount}
            className="w-full sm:w-auto channel-button active bg-blue-500 hover:bg-blue-600 text-white"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Upgrade Account
          </Button>
        </DialogFooter>
        <DialogClose asChild>
          <button onClick={onClose} className="sr-only">
            Close
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}
