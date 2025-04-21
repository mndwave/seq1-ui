"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { LogIn, AlertCircle, Key } from "lucide-react"
import DraggableModal from "@/components/draggable-modal"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSignupClick: () => void
}

export default function LoginModal({ isOpen, onClose, onSignupClick }: LoginModalProps) {
  const { login, loginWithExtension } = useAuth()
  const [privateKey, setPrivateKey] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [extensionLoading, setExtensionLoading] = useState(false)

  const handleLogin = async () => {
    if (!privateKey.trim()) {
      setError("Private key is required")
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const success = await login(privateKey)
      if (success) {
        setPrivateKey("")
        onClose()
      } else {
        setError("Invalid private key. Please check and try again.")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExtensionLogin = async () => {
    setError(null)
    setExtensionLoading(true)

    try {
      // Check if nostr extension is available
      if (!window.nostr) {
        setError("No Nostr extension found. Please install Alby or NOS2X.")
        return
      }

      const success = await loginWithExtension()
      if (success) {
        onClose()
      } else {
        setError("Failed to login with extension. Please try again or use your private key.")
      }
    } catch (err) {
      setError("An error occurred with the extension. Please try again.")
      console.error(err)
    } finally {
      setExtensionLoading(false)
    }
  }

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
          <p className="text-sm text-[#a09080]">Login to access your SEQ1 account and projects.</p>
        </div>

        {/* Extension login option */}
        <div className="space-y-1">
          <label className="text-xs text-[#a09080] tracking-wide">RECOMMENDED</label>
          <button
            onClick={handleExtensionLogin}
            disabled={extensionLoading}
            className="w-full bg-[#4287f5] hover:bg-[#5497ff] text-white py-3 rounded-sm transition-colors flex items-center justify-center"
          >
            <span className="text-sm font-medium">{extensionLoading ? "Connecting..." : "Login with Extension"}</span>
          </button>
          <p className="text-[10px] text-[#a09080] mt-1 text-center">
            We support <span className="text-[#f0e6c8]">Alby</span> and <span className="text-[#f0e6c8]">NOS2X</span>{" "}
            browser extensions
          </p>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="flex-grow h-px bg-[#3a2a30]"></div>
          <span className="px-4 text-xs text-[#a09080]">OR</span>
          <div className="flex-grow h-px bg-[#3a2a30]"></div>
        </div>

        {/* Private key input */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs text-[#a09080] tracking-wide">PRIVATE KEY</label>
            <div className="w-5 h-5 rounded-full bg-[#3a2a30] flex items-center justify-center">
              <Key size={12} className="text-[#a09080]" />
            </div>
          </div>
          <input
            type="password"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder="nsec1..."
            className="w-full bg-[#1a1015] border border-[#3a2a30] rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4287f5] text-[#f0e6c8] tracking-wide"
          />
          <p className="text-[10px] text-[#a09080] mt-1">
            Your private key starts with "nsec" and should be kept secret
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-start space-x-2 text-[#dc5050] text-xs">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-between pt-2">
          <button className="channel-button flex items-center px-3 py-1.5" onClick={onSignupClick}>
            <span className="text-xs tracking-wide">CREATE ACCOUNT</span>
          </button>

          <button
            className="channel-button active flex items-center px-3 py-1.5"
            onClick={handleLogin}
            disabled={isLoading}
          >
            <span className="text-xs tracking-wide">{isLoading ? "LOGGING IN..." : "LOGIN"}</span>
          </button>
        </div>
      </div>
    </DraggableModal>
  )
}
