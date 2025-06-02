"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  UserPlus,
  Copy,
  Download,
  Check,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Key,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react"
import DraggableModal from "@/components/draggable-modal"
import type { NostrKeypair } from "@/lib/nostr-utils" // Assuming this type is exported

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginClick: () => void
  onAuthComplete?: () => void | Promise<void>  // Add optional auth completion callback
}

export default function SignupModal({ isOpen, onClose, onLoginClick, onAuthComplete }: SignupModalProps) {
  const { generateAndStoreKeys, registerIdentity, isLoading: authIsLoading } = useAuth()
  const [step, setStep] = useState(1)
  const [generatedKeys, setGeneratedKeys] = useState<NostrKeypair | null>(null)

  const [nsecCopied, setNsecCopied] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState(false) // For temporary visual feedback on copy
  const [nsecDownloaded, setNsecDownloaded] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [isGeneratingKeys, setIsGeneratingKeys] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [showPrivateKey, setShowPrivateKey] = useState(false)

  const [timeLeftToHideKey, setTimeLeftToHideKey] = useState(30)
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null)

  const currentLoading = authIsLoading || isGeneratingKeys || isRegistering

  const resetLocalState = useCallback(() => {
    setStep(1)
    setGeneratedKeys(null)
    setNsecCopied(false)
    setCopyFeedback(false)
    setNsecDownloaded(false)
    setError(null)
    setIsGeneratingKeys(false)
    setIsRegistering(false)
    setShowPrivateKey(false)
    setTimeLeftToHideKey(30)
    if (autoHideTimerRef.current) {
      clearInterval(autoHideTimerRef.current)
      autoHideTimerRef.current = null
    }
  }, [])

  const handleGenerateKeys = useCallback(
    async (forceRegenerate = false) => {
      if (generatedKeys && !forceRegenerate) return // Don't regenerate if keys already exist unless forced

      setIsGeneratingKeys(true)
      setError(null)
      setShowPrivateKey(false) // Hide any previous key
      const result = await generateAndStoreKeys()
      if (result.success && result.keys) {
        setGeneratedKeys(result.keys)
        setNsecCopied(false) // Reset confirmations for new keys
        setNsecDownloaded(false)
      } else {
        setError(result.error || "Failed to generate keys. Please try again.")
        setGeneratedKeys(null)
      }
      setIsGeneratingKeys(false)
    },
    [generateAndStoreKeys, generatedKeys],
  )

  // Auto-generate keys when step 2 is reached, if not already generated
  useEffect(() => {
    if (isOpen && step === 2 && !generatedKeys && !isGeneratingKeys) {
      handleGenerateKeys()
    }
  }, [isOpen, step, generatedKeys, isGeneratingKeys, handleGenerateKeys])

  // Reset modal state when it's closed
  useEffect(() => {
    if (!isOpen) {
      resetLocalState()
    }
  }, [isOpen, resetLocalState])

  // Timer effect for auto-hiding private key
  useEffect(() => {
    if (showPrivateKey && generatedKeys) {
      setTimeLeftToHideKey(30) // Reset timer
      if (autoHideTimerRef.current) clearInterval(autoHideTimerRef.current)
      autoHideTimerRef.current = setInterval(() => {
        setTimeLeftToHideKey((prev) => {
          if (prev <= 1) {
            setShowPrivateKey(false)
            if (autoHideTimerRef.current) clearInterval(autoHideTimerRef.current)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (autoHideTimerRef.current) clearInterval(autoHideTimerRef.current)
    }
    return () => {
      if (autoHideTimerRef.current) clearInterval(autoHideTimerRef.current)
    }
  }, [showPrivateKey, generatedKeys])

  const togglePrivateKeyVisibility = () => setShowPrivateKey(!showPrivateKey)

  const copyNsecKey = () => {
    if (!generatedKeys?.nsec) return
    if (!showPrivateKey) setShowPrivateKey(true) // Reveal if hidden
    navigator.clipboard.writeText(generatedKeys.nsec)
    setNsecCopied(true) // Permanent confirmation
    setCopyFeedback(true) // Temporary visual feedback
    setTimeout(() => setCopyFeedback(false), 2000)
  }

  const downloadNsecKey = () => {
    if (!generatedKeys) return
    const content =
      `SEQ1 NOSTR PRIVATE KEY (NSEC) - KEEP THIS SAFE AND PRIVATE\n\n` +
      `Private Key (nsec): ${generatedKeys.nsec}\n` +
      `Public Key (npub): ${generatedKeys.npub}\n\n` +
      `WARNING: Anyone with access to this private key can control your SEQ1 account.\n` +
      `Store it securely and never share it with anyone. This key is not recoverable if lost.`
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    // Include part of pubkey in filename for uniqueness if multiple keys are downloaded
    link.download = `seq1-nostr-private-key-${generatedKeys.publicKeyHex.slice(0, 8)}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setNsecDownloaded(true)
  }

  const handleFinishSignupAndRegister = async () => {
    if (!generatedKeys || (!nsecCopied && !nsecDownloaded)) {
      setError("Please confirm you have saved your private key by copying or downloading it.")
      return
    }
    setIsRegistering(true)
    setError(null)

    const registrationResult = await registerIdentity() // This uses keys from nostrStorage (set by generateAndStoreKeys)

    if (registrationResult.success) {
      // AuthProvider's generateAndStoreKeys already set the user in context
      resetLocalState()
      onClose() // Close modal on successful registration
      // Call auth completion callback if provided
      if (onAuthComplete) {
        await onAuthComplete()
      }
    } else {
      setError(registrationResult.error || "Failed to register identity with the server. Your keys are saved locally.")
    }
    setIsRegistering(false)
  }

  const handleCloseModal = () => {
    resetLocalState()
    onClose()
  }

  const renderStepContent = () => {
    switch (step) {
      case 1: // Information about Nostr keys
        return (
          <div className="space-y-4">
            <p className="text-sm text-[#a09080]">
              SEQ1 uses Nostr for sovereignty. Full control through cryptographic keys.
            </p>
            <div className="bg-[#1a1015] border border-[#3a2a30] p-2.5 rounded-sm space-y-2">
              <div className="flex items-start space-x-2.5">
                <div className="w-7 h-7 rounded-full bg-[#4287f5] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Key size={14} className="text-[#1a1015]" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[#f0e6c8]">Your Keys</h4>
                  <p className="text-xs text-[#a09080] mt-0.5">
                    <span className="text-[#f5a623]">Private key (nsec)</span> — your access.
                    <br /><span className="text-[#4287f5]">Public key (npub)</span> — your identity.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#1a1015] border border-[#f5a623] p-2.5 rounded-sm">
              <p className="text-xs text-[#f5a623] font-medium">CRITICAL: SAVE YOUR PRIVATE KEY</p>
              <p className="text-xs text-[#f0e6c8] mt-0.5">
                We'll generate your unique private key. You{" "}
                <span className="underline">must save this key</span> securely.
              </p>
              <p className="text-xs text-[#a09080] mt-0.5">
                Loss means permanent account loss. We cannot recover it.
              </p>
            </div>
            <div className="flex justify-between pt-1">
              <button
                className="channel-button flex items-center px-3 py-1.5"
                onClick={onLoginClick}
                disabled={currentLoading}
              >
                <span className="text-xs tracking-wide">I ALREADY HAVE A KEY</span>
              </button>
              <button
                className="channel-button active flex items-center px-3 py-1.5"
                onClick={() => {
                  setStep(2)
                  // Keys will be auto-generated if step 2 is reached and keys are null
                }}
                disabled={currentLoading}
              >
                <span className="text-xs tracking-wide">UNDERSTOOD, GENERATE KEYS</span>
                <ChevronRight size={14} className="ml-1" />
              </button>
            </div>
          </div>
        )

      case 2: // Key generation, display, and backup confirmation
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-[#f0e6c8]">Your New Nostr Keys</h3>
              <p className="text-sm text-[#a09080]">
                Save your <span className="font-semibold text-[#f5a623]">Private Key (nsec)</span> securely. This is
                your only way to access your account.
              </p>
            </div>

            {isGeneratingKeys && !generatedKeys && (
              <p className="text-center text-[#a09080] py-4">Generating your unique keys...</p>
            )}

            {generatedKeys && (
              <>
                {/* Private Key Display */}
                <div className="bg-[#1a1015] border border-[#3a2a30] p-2.5 rounded-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-[#f5a623] font-semibold">PRIVATE KEY (NSEC) - SECRET!</span>
                    <div className="flex items-center space-x-2">
                      {showPrivateKey && (
                        <span className="text-[10px] text-[#a09080]">Hides in {timeLeftToHideKey}s</span>
                      )}
                      <button
                        onClick={togglePrivateKeyVisibility}
                        className="text-[#f5a623] hover:text-[#f7b84a]"
                        title={showPrivateKey ? "Hide Private Key" : "Show Private Key"}
                      >
                        {showPrivateKey ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button
                        onClick={copyNsecKey}
                        className="text-[#4287f5] hover:text-[#50a0ff]"
                        title="Copy NSEC to Clipboard"
                      >
                        {copyFeedback ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                      <button
                        onClick={downloadNsecKey}
                        className="text-[#4287f5] hover:text-[#50a0ff]"
                        title="Download NSEC as File"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="bg-[#0f0a0c] rounded-sm p-2 min-h-[60px] flex items-center break-all relative">
                    <code
                      className={`text-xs font-mono w-full ${showPrivateKey ? "text-[#f5a623]" : "text-transparent select-none blur-sm transition-all duration-150"}`}
                    >
                      {generatedKeys.nsec}
                    </code>
                    {!showPrivateKey && (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-[#a09080] pointer-events-none">
                        Click <Eye size={12} className="inline mx-1" /> to reveal private key
                      </div>
                    )}
                  </div>
                </div>

                {/* Public Key Display */}
                <div className="bg-[#1a1015] border border-[#3a2a30] p-2.5 rounded-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-[#4287f5] font-semibold">PUBLIC KEY (NPUB) - SHAREABLE</span>
                    <button
                      onClick={() => generatedKeys?.npub && navigator.clipboard.writeText(generatedKeys.npub)}
                      className="text-[#4287f5] hover:text-[#50a0ff]"
                      title="Copy NPUB to Clipboard"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <div className="bg-[#0f0a0c] rounded-sm p-2 min-h-[60px] flex items-center break-all">
                    <code className="text-xs text-[#4287f5] font-mono w-full">{generatedKeys.npub}</code>
                  </div>
                </div>

                {/* Regenerate Keys Button */}
                <button
                  onClick={() => handleGenerateKeys(true)} // Pass true to force regeneration
                  disabled={currentLoading}
                  className="w-full text-xs text-[#a09080] hover:text-[#f0e6c8] py-1.5 rounded-sm border border-transparent hover:border-[#3a2a30] flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={12} className={isGeneratingKeys ? "animate-spin" : ""} />
                  <span>{isGeneratingKeys ? "Generating..." : "Generate New Keys (current will be lost)"}</span>
                </button>

                {/* Confirmation Checkboxes */}
                <div className="bg-[#1a1015] border border-[#f5a623] p-2.5 rounded-sm space-y-1.5">
                  <p className="text-xs text-[#f5a623] font-medium">CONFIRMATION REQUIRED</p>
                  <p className="text-xs text-[#f0e6c8]">
                    I understand that if I lose my private key (nsec), I will lose access to my account permanently.
                    SEQ1 cannot recover it.
                  </p>
                  <label className="flex items-center space-x-2 text-xs text-[#f0e6c8] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={nsecCopied}
                      onChange={() => setNsecCopied(!nsecCopied)}
                      className="form-checkbox bg-[#0f0a0c] border-[#3a2a30] text-[#4287f5] focus:ring-0 rounded-sm accent-[#4287f5]"
                    />
                    <span>I have COPIED my private key to a secure password manager or file.</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs text-[#f0e6c8] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={nsecDownloaded}
                      onChange={() => setNsecDownloaded(!nsecDownloaded)}
                      className="form-checkbox bg-[#0f0a0c] border-[#3a2a30] text-[#4287f5] focus:ring-0 rounded-sm accent-[#4287f5]"
                    />
                    <span>I have DOWNLOADED my private key file and stored it safely.</span>
                  </label>
                </div>
              </>
            )}

            {error && (
              <div className="flex items-start space-x-2 text-[#dc5050] text-xs p-2 bg-[#2a1a20] border border-[#dc5050] rounded-sm">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-between pt-1">
              <button
                className="channel-button flex items-center px-3 py-1.5 disabled:opacity-50"
                onClick={() => setStep(1)}
                disabled={currentLoading}
              >
                <ChevronLeft size={14} className="mr-1" />
                <span className="text-xs tracking-wide">BACK</span>
              </button>
              <button
                className={`channel-button active flex items-center px-3 py-1.5 disabled:opacity-50`}
                onClick={handleFinishSignupAndRegister}
                disabled={!generatedKeys || (!nsecCopied && !nsecDownloaded) || currentLoading}
              >
                <span className="text-xs tracking-wide">
                  {isRegistering ? "REGISTERING..." : "FINISH SIGNUP & LOGIN"}
                </span>
              </button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={handleCloseModal} // Use custom close handler to reset state
      title="CREATE SEQ1 NOSTR ACCOUNT"
      icon={<UserPlus size={16} className="text-[#a09080]" />}
      width="w-[480px]" // Slightly wider for more content
    >
      {renderStepContent()}
    </DraggableModal>
  )
}
