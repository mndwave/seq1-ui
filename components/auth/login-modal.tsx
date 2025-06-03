"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { LogIn, AlertCircle, Key, Zap } from "lucide-react" // Zap for extension
import DraggableModal from "@/components/draggable-modal"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSignupClick: () => void
  onAuthComplete?: () => void | Promise<void>  // Add optional auth completion callback
}

export default function LoginModal({ 
  isOpen, 
  onClose, 
  onSignupClick,
  onAuthComplete 
}: LoginModalProps) {
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
      // Call auth completion callback if provided
      if (onAuthComplete) {
        await onAuthComplete()
      }
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
      // Call auth completion callback if provided
      if (onAuthComplete) {
        await onAuthComplete()
      }
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
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-[#f0e6c8]">Welcome Back, Creator!</h3>
          <p className="text-sm text-[#a09080]">
            {isAuthenticated && user
              ? `Authenticated as ${user.npub.slice(0, 10)}...${user.npub.slice(-4)}`
              : "Use your Creative Identity to unlock your SEQ1 studio."}
          </p>
        </div>

        {isAuthenticated ? (
          <div className="text-center py-4">
            <p className="text-green-400">You are already signed in to your Studio.</p>
            <button onClick={onClose} className="mt-4 channel-button active px-4 py-2">
              Close
            </button>
          </div>
        ) : (
          <>
            {hasExtension && (
              <div className="space-y-1">
                <label className="text-xs text-[#a09080] tracking-wide">RECOMMENDED: USE EXTENSION</label>
                <button
                  onClick={handleExtensionLogin}
                  disabled={currentLoading}
                  className="w-full bg-[#4287f5] hover:bg-[#5497ff] text-white py-3 rounded-sm transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  <Zap size={16} className="mr-2" />
                  <span className="text-sm font-medium">
                    {isExtensionLoading ? "Connecting Extension..." : "Access with Browser Extension"}
                  </span>
                </button>
                <p className="text-[10px] text-[#a09080] mt-1 text-center">
                  Uses a Nostr extension like <span className="text-[#f0e6c8]">Alby</span> or{" "}
                  <span className="text-[#f0e6c8]">NOS2X</span>. Secure and easy.
                </p>
              </div>
            )}

            <div className="relative flex items-center justify-center">
              <div className="flex-grow h-px bg-[#3a2a30]"></div>
              <span className="px-4 text-xs text-[#a09080]">{hasExtension ? "OR" : "Login with your Creative Key"}</span>
              <div className="flex-grow h-px bg-[#3a2a30]"></div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-[#a09080]">
                Paste your secret Private Creative Key. Keep this key confidential.
              </p>

              <div className="space-y-2">
                <label className="text-xs text-[#a09080] tracking-wide">PRIVATE CREATIVE KEY (NSEC)</label>
                <input
                  type="password"
                  value={nsecKey}
                  onChange={(e) => setNsecKey(e.target.value)}
                  placeholder="nsec1..."
                  className="w-full bg-[#1a1015] border border-[#3a2a30] rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4287f5] text-[#f0e6c8] tracking-wide font-mono"
                />
              </div>

              {error && (
                <div className="p-2 bg-red-900/20 border border-red-500/30 rounded-sm">
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <button 
                  className="channel-button flex items-center px-3 py-1.5" 
                  onClick={onSignupClick}
                  disabled={currentLoading}
                >
                  <span className="text-xs tracking-wide">Create New Creative ID</span>
                </button>

                <button
                  className={`channel-button flex items-center px-3 py-1.5 ${
                    nsecKey.trim() && !isLoading ? "active" : "opacity-50"
                  }`}
                  onClick={handleNsecLogin}
                  disabled={!nsecKey.trim() || isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin mr-1.5">
                        <LogIn size={14} />
                      </div>
                      <span className="text-xs tracking-wide">ACCESSING...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={14} className="mr-1.5" />
                      <span className="text-xs tracking-wide">Access with Key</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </DraggableModal>
  )
}
