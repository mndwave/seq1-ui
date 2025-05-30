"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { LogIn, AlertCircle, Key, Zap } from "lucide-react" // Zap for extension
import DraggableModal from "@/components/draggable-modal"

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

  useEffect(() => {
    if (typeof window !== "undefined" && window.nostr) {
      setHasExtension(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      // Already authenticated, perhaps close modal or show a message
      // For now, let's assume it closes if auth state changes elsewhere.
      // Or, we can explicitly close it:
      // onClose();
    }
  }, [isAuthenticated, isOpen, onClose])

  const handleNsecLogin = async () => {
    if (!nsecKey.trim()) {
      setError("NSEC private key is required.")
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
      setError(result.error || "Login failed. Please check your NSEC key.")
    }
    setIsNsecLoading(false)
  }

  const handleExtensionLogin = async () => {
    if (!hasExtension) {
      setError("Nostr browser extension (e.g., Alby, nos2x) not found.")
      return
    }
    setError(null)
    setIsExtensionLoading(true)
    const result = await loginWithExtension()
    if (result.success) {
      onClose()
    } else {
      setError(result.error || "Extension login failed.")
    }
    setIsExtensionLoading(false)
  }

  const currentLoading = isLoading || isNsecLoading || isExtensionLoading

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title="LOGIN TO SEQ1"
      icon={<LogIn size={16} className="text-[#a09080]" />}
      width="w-[450px]"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-[#f0e6c8]">Welcome Back</h3>
          <p className="text-sm text-[#a09080]">
            {isAuthenticated && user
              ? `Logged in as ${user.npub.slice(0, 10)}...`
              : "Login to access your SEQ1 account using Nostr."}
          </p>
        </div>

        {isAuthenticated ? (
          <div className="text-center py-4">
            <p className="text-green-400">You are already logged in.</p>
            <button onClick={onClose} className="mt-4 channel-button active px-4 py-2">
              Close
            </button>
          </div>
        ) : (
          <>
            {hasExtension && (
              <div className="space-y-1">
                <label className="text-xs text-[#a09080] tracking-wide">RECOMMENDED</label>
                <button
                  onClick={handleExtensionLogin}
                  disabled={currentLoading}
                  className="w-full bg-[#4287f5] hover:bg-[#5497ff] text-white py-3 rounded-sm transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  <Zap size={16} className="mr-2" />
                  <span className="text-sm font-medium">
                    {isExtensionLoading ? "Connecting..." : "Login with Browser Extension"}
                  </span>
                </button>
                <p className="text-[10px] text-[#a09080] mt-1 text-center">
                  Uses a Nostr extension like <span className="text-[#f0e6c8]">Alby</span> or{" "}
                  <span className="text-[#f0e6c8]">NOS2X</span>.
                </p>
              </div>
            )}

            <div className="relative flex items-center justify-center">
              <div className="flex-grow h-px bg-[#3a2a30]"></div>
              <span className="px-4 text-xs text-[#a09080]">{hasExtension ? "OR" : "Login with NSEC"}</span>
              <div className="flex-grow h-px bg-[#3a2a30]"></div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="nsec-input" className="text-xs text-[#a09080] tracking-wide">
                  NOSTR PRIVATE KEY (NSEC)
                </label>
                <div className="w-5 h-5 rounded-full bg-[#3a2a30] flex items-center justify-center">
                  <Key size={12} className="text-[#a09080]" />
                </div>
              </div>
              <input
                id="nsec-input"
                type="password"
                value={nsecKey}
                onChange={(e) => setNsecKey(e.target.value)}
                placeholder="nsec1..."
                className="w-full bg-[#1a1015] border border-[#3a2a30] rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4287f5] text-[#f0e6c8] tracking-wide"
                disabled={currentLoading}
              />
              <p className="text-[10px] text-[#a09080] mt-1">
                Paste your <span className="text-[#f0e6c8]">nsec</span> key. It should be kept secret.
              </p>
            </div>

            {error && (
              <div className="flex items-start space-x-2 text-[#dc5050] text-xs p-2 bg-[#2a1a20] border border-[#dc5050] rounded-sm">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button
                className="channel-button flex items-center px-3 py-1.5 disabled:opacity-50"
                onClick={onSignupClick}
                disabled={currentLoading}
              >
                <span className="text-xs tracking-wide">CREATE ACCOUNT</span>
              </button>

              <button
                className="channel-button active flex items-center px-3 py-1.5 disabled:opacity-50"
                onClick={handleNsecLogin}
                disabled={currentLoading || !nsecKey.trim()}
              >
                <span className="text-xs tracking-wide">{isNsecLoading ? "LOGGING IN..." : "LOGIN WITH NSEC"}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </DraggableModal>
  )
}
