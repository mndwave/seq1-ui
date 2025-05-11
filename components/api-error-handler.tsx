"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export default function ApiErrorHandler() {
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleAuthError = (event: CustomEvent) => {
      if (event.detail && event.detail.message) {
        setError(event.detail.message)
        setIsOpen(true)
      }
    }

    window.addEventListener("seq1:auth:error", handleAuthError as EventListener)

    return () => {
      window.removeEventListener("seq1:auth:error", handleAuthError as EventListener)
    }
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Authentication Error</DialogTitle>
          <DialogDescription>{error || "There was an error authenticating with the SEQ1 API."}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
