"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { LogIn, AlertCircle, Key, Zap, Eye, EyeOff } from "lucide-react"
import DraggableModal from "@/components/draggable-modal"
import { Button } from "@/components/ui/button" // Using shadcn Button
import { Input } from "@/components/ui/input" // Using shadcn Input

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSignupClick: () => void
}

export default function LoginModal({ isOpen, onClose, onSignupClick }: LoginModalProps) {
  const { loginWithNsec, loginWithExtension, isLoading, isAuthenticated, user } = useAuth()
  const [nsecKey, setNsecKey] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isNsecLoading, setIsNsecLoading] = useState(false)
  const [isExtensionLoading, setIsExtensionLoading] = useState(false)
  const [hasExtension, setHasExtension] = useState(false)
  const [showNsec, setShowNsec] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && window.nostr) {
      setHasExtension(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      // onClose(); // Optionally close if already authenticated
    }
  }, [isAuthenticated, isOpen, onClose])

  const handleNsecLogin = async () => {
    if (!nsecKey.trim()) {
      setError("Private Creative Key (nsec) is required.")
      return
    }
    if (!nsecKey.startsWith("nsec1")) {
      setError("Invalid NSEC format. It should start with 'nsec1'.")
      return
    }

    setError(null)
    setIsNsecLoading(true)
    const result = await loginWithNsec(nsecKey)
    if (result.success) {
      setNsecKey("")
      onClose()
    } else {
      setError(result.error || "Login failed. Please check your Creative Key or network connection.")
    }
    setIsNsecLoading(false)
  }

  const handleExtensionLogin = async () => {
    if (!hasExtension) {
      setError("Nostr browser extension (e.g., Alby, nos2x) not found. Please install one or use your Creative Key.")
      return
    }
    setError(null)
    setIsExtensionLoading(true)
    const result = await loginWithExtension()
    if (result.success) {
      onClose()
    } else {
      setError(result.error || "Extension login failed. Ensure it's unlocked and permissions are granted for SEQ1.")
    }
    setIsExtensionLoading(false)
  }

  const currentLoading = isLoading || isNsecLoading || isExtensionLoading

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title="Access Your Studio"
      icon={<LogIn size={16} className="text-[#a09080]" />}
      width="w-[450px]"
    >
      <div className="space-y-5">
        <div className="space-y-1">
          <h3 className="text-lg font-medium text-[#f0e6c8]">Welcome Back, Creator!</h3>
          <p className="text-sm text-[#a09080]">
            {isAuthenticated && user
              ? `Authenticated as ${user.npub.slice(0, 10)}...${user.npub.slice(-4)}`
              : "Use your Creative Identity to unlock your SEQ1 studio."}
          </p>
        </div>

        {isAuthenticated ? (
          <div className="text-center py-4">
            <p className="text-green-400 font-semibold">You are already signed in to your Studio.</p>
            <Button onClick={onClose} className="mt-4 text-xs">
              Close
            </Button>
          </div>
        ) : (
          <>
            {hasExtension && (
              <div className="space-y-1">
                <label className="text-xs text-[#a09080] tracking-wide font-medium">RECOMMENDED: USE EXTENSION</label>
                <Button
                  onClick={handleExtensionLogin}
                  disabled={currentLoading}
                  className="w-full bg-[#4287f5] hover:bg-[#5497ff] text-white py-3 text-sm font-medium disabled:opacity-60"
                >
                  <Zap size={16} className="mr-2" />
                  {isExtensionLoading ? "Connecting Extension..." : "Access with Browser Extension"}
                </Button>
                <p className="text-[11px] text-[#a09080] mt-1 text-center">
                  Uses a Nostr extension like <span className="text-[#f0e6c8] font-medium">Alby</span> or{" "}
                  <span className="text-[#f0e6c8] font-medium">NOS2X</span>. Secure and easy.
                </p>
              </div>
            )}

            <div className="relative flex items-center justify-center my-3">
              <div className="flex-grow h-px bg-[#3a2a30]"></div>
              <span className="px-3 text-xs text-[#a09080] bg-[#22151a]">
                {hasExtension ? "OR" : "Login with your Creative Key"}
              </span>
              <div className="flex-grow h-px bg-[#3a2a30]"></div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="nsec-input" className="text-xs text-[#a09080] tracking-wide font-medium">
                  PRIVATE CREATIVE KEY (NSEC)
                </label>
                <Key size={14} className="text-[#a09080]" />
              </div>
              <div className="relative">
                <Input
                  id="nsec-input"
                  type={showNsec ? "text" : "password"}
                  value={nsecKey}
                  onChange={(e) => setNsecKey(e.target.value)}
                  placeholder="nsec1..."
                  className="w-full bg-[#1a1015] border-[#3a2a30] pr-10 text-sm focus:ring-offset-0 focus:ring-1 focus:ring-[#4287f5] text-[#f0e6c8] tracking-wide"
                  disabled={currentLoading}
                  aria-label="Private Creative Key Input"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => setShowNsec(!showNsec)}
                  className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-[#a09080] hover:text-[#f0e6c8]"
                  aria-label={showNsec ? "Hide Private Key" : "Show Private Key"}
                >
                  {showNsec ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              <p className="text-[11px] text-[#a09080] mt-1">
                Paste your secret Private Creative Key. <span className="font-medium">Keep this key confidential.</span>
              </p>
            </div>

            {error && (
              <div className="flex items-start space-x-2 text-red-400 text-xs p-2.5 bg-[#2a1a20] border border-red-500/50 rounded-sm">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-center pt-3 gap-3 sm:gap-2">
              <Button
                variant="outline"
                className="w-full sm:w-auto text-xs"
                onClick={onSignupClick}
                disabled={currentLoading}
              >
                Create New Creative ID
              </Button>

              <Button
                className="w-full sm:w-auto text-xs bg-[#4CAF50] hover:bg-[#5cb85c] text-white disabled:opacity-60"
                onClick={handleNsecLogin}
                disabled={currentLoading || !nsecKey.trim()}
              >
                {isNsecLoading ? "Accessing..." : "Access with Key"}
              </Button>
            </div>
          </>
        )}
      </div>
    </DraggableModal>
  )
}
