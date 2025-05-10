"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { UserPlus, Copy, Download, Check, AlertCircle, ChevronRight, ChevronLeft, Key, Eye, EyeOff } from "lucide-react"
import DraggableModal from "@/components/draggable-modal"
import { nip19 } from "nostr-tools"

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginClick: () => void
}

export default function SignupModal({ isOpen, onClose, onLoginClick }: SignupModalProps) {
  const { signup, saveUserProfile } = useAuth()
  const [step, setStep] = useState(1)
  const [keys, setKeys] = useState<{ privateKey: string; publicKey: string; nsec: string; npub: string } | null>(null)
  const [keyCopied, setKeyCopied] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState(false)
  const [keyDownloaded, setKeyDownloaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Generate keys when modal opens
  useEffect(() => {
    if (isOpen && !keys) {
      generateKeys()
    }
  }, [isOpen])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1)
      setKeys(null)
      setKeyCopied(false)
      setCopyFeedback(false)
      setKeyDownloaded(false)
      setError(null)
      setShowPrivateKey(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isOpen])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Handle timer for auto-hiding
  useEffect(() => {
    if (showPrivateKey) {
      setTimeLeft(30)

      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setShowPrivateKey(false)
            if (timerRef.current) {
              clearInterval(timerRef.current)
              timerRef.current = null
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [showPrivateKey])

  const generateKeys = async () => {
    try {
      setIsLoading(true)
      const { privateKey, publicKey } = await signup()

      // Encode keys to user-friendly format
      const nsec = nip19.nsecEncode(privateKey)
      const npub = nip19.npubEncode(publicKey)

      setKeys({ privateKey, publicKey, nsec, npub })
    } catch (error) {
      console.error("Error generating keys:", error)
      setError("Failed to generate keys. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const togglePrivateKeyVisibility = () => {
    setShowPrivateKey(!showPrivateKey)
  }

  const copyPrivateKey = () => {
    if (!keys) return

    // Show the key if it's currently hidden
    if (!showPrivateKey) {
      setShowPrivateKey(true)
    }

    navigator.clipboard.writeText(keys.nsec)
    setKeyCopied(true) // This stays true permanently for the checkbox
    setCopyFeedback(true) // This is just for the temporary visual feedback

    // Reset only the visual feedback after 3 seconds
    setTimeout(() => {
      setCopyFeedback(false)
    }, 3000)
  }

  const downloadPrivateKey = () => {
    if (!keys) return

    const element = document.createElement("a")
    const file = new Blob(
      [
        `SEQ1 NOSTR PRIVATE KEY - KEEP THIS SAFE AND PRIVATE\n\n` +
          `Private Key (nsec): ${keys.nsec}\n` +
          `Public Key (npub): ${keys.npub}\n\n` +
          `WARNING: Anyone with access to this private key can control your SEQ1 account.\n` +
          `Store it securely and never share it with anyone.`,
      ],
      { type: "text/plain" },
    )

    element.href = URL.createObjectURL(file)
    element.download = "seq1-nostr-key.txt"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    setKeyDownloaded(true)
  }

  const handleCreateAccount = async () => {
    if (!keys) return

    setIsLoading(true)
    setError(null)

    try {
      // Generate a default username based on the public key
      const defaultUsername = `user${keys.publicKey.slice(0, 5)}`

      // Save profile with default values
      const success = await saveUserProfile({
        username: defaultUsername,
        displayName: "SEQ1 User",
      })

      if (success) {
        onClose()
      } else {
        setError("Failed to create account. Please try again.")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <p className="text-sm text-[#a09080]">
              SEQ1 uses Nostr for authentication, a decentralized protocol that gives you complete control over your
              identity.
            </p>

            <div className="bg-[#1a1015] border border-[#3a2a30] p-2.5 rounded-sm">
              <div className="flex items-start space-x-2.5">
                <div className="w-7 h-7 rounded-full bg-[#4287f5] flex items-center justify-center flex-shrink-0">
                  <Key size={14} className="text-[#1a1015]" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[#f0e6c8]">How Nostr Authentication Works</h4>
                  <p className="text-xs text-[#a09080] mt-0.5">
                    Instead of a username and password, you'll use a cryptographic key pair:
                  </p>
                  <ul className="text-xs text-[#a09080] mt-1 space-y-0.5 list-disc pl-4">
                    <li>
                      Your <span className="text-[#4287f5]">public key</span> is your identity (like a username)
                    </li>
                    <li>
                      Your <span className="text-[#f5a623]">private key</span> is your password (keep it secret!)
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1015] border border-[#3a2a30] p-2.5 rounded-sm">
              <p className="text-xs text-[#f5a623] font-medium">IMPORTANT</p>
              <p className="text-xs text-[#f0e6c8] mt-0.5">
                In the next step, we'll generate your private key. You{" "}
                <span className="underline">must save this key</span> somewhere secure.
              </p>
              <p className="text-xs text-[#a09080] mt-0.5">
                If you lose your private key, you'll lose access to your SEQ1 account permanently.
              </p>
            </div>

            <div className="flex justify-between pt-1">
              <button className="channel-button flex items-center px-3 py-1.5" onClick={onLoginClick}>
                <span className="text-xs tracking-wide">I ALREADY HAVE A KEY</span>
              </button>

              <button className="channel-button active flex items-center px-3 py-1.5" onClick={() => setStep(2)}>
                <span className="text-xs tracking-wide">CONTINUE</span>
                <ChevronRight size={14} className="ml-1" />
              </button>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-[#f0e6c8]">Save Your Private Key</h3>
              <p className="text-sm text-[#a09080]">
                This is your private key. Save it securely - it's the only way to access your account.
              </p>
            </div>

            {/* Private key display with blur/reveal functionality */}
            <div className="bg-[#1a1015] border border-[#3a2a30] p-2.5 rounded-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-[#a09080]">PRIVATE KEY (SECRET)</span>
                <div className="flex space-x-2">
                  <button
                    onClick={togglePrivateKeyVisibility}
                    className="text-[#f5a623] hover:text-[#f7b84a] transition-colors"
                    title={showPrivateKey ? "Hide private key" : "Show private key"}
                  >
                    {showPrivateKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    onClick={copyPrivateKey}
                    className="text-[#4287f5] hover:text-[#50a0ff] transition-colors"
                    title="Copy to clipboard"
                  >
                    {copyFeedback ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                  <button
                    onClick={downloadPrivateKey}
                    className="text-[#4287f5] hover:text-[#50a0ff] transition-colors"
                    title="Download as file"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
              {/* Fixed height container to match public key container */}
              <div
                className="bg-[#0f0a0c] rounded-sm overflow-hidden relative flex items-center"
                style={{ height: "60px" }}
              >
                {!showPrivateKey ? (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <p className="text-xs text-[#a09080]">
                      Click the <Eye size={12} className="inline mx-1" /> icon to reveal
                    </p>
                  </div>
                ) : (
                  <code className="text-xs text-[#f5a623] font-mono break-all p-2 w-full">
                    {keys?.nsec || "Generating..."}
                  </code>
                )}
              </div>
              <p className="text-[10px] text-[#a09080] mt-1">
                This key is like a master password. Never share it with anyone.
              </p>
            </div>

            {/* Public key display */}
            <div className="bg-[#1a1015] border border-[#3a2a30] p-2.5 rounded-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-[#a09080]">PUBLIC KEY (SHAREABLE)</span>
                <button
                  onClick={() => {
                    if (keys) navigator.clipboard.writeText(keys.npub)
                  }}
                  className="text-[#4287f5] hover:text-[#50a0ff] transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy size={14} />
                </button>
              </div>
              <div className="bg-[#0f0a0c] rounded-sm overflow-hidden flex items-center" style={{ height: "60px" }}>
                <code className="text-xs text-[#4287f5] font-mono break-all p-2 w-full">
                  {keys?.npub || "Generating..."}
                </code>
              </div>
              <p className="text-[10px] text-[#a09080] mt-1">
                This is your public identifier on Nostr. It's safe to share.
              </p>
            </div>

            {/* Confirmation checkboxes - order swapped */}
            <div className="bg-[#1a1015] border border-[#f5a623] p-2.5 rounded-sm">
              <p className="text-xs text-[#f5a623] font-medium mb-1">CONFIRMATION REQUIRED</p>
              <p className="text-xs text-[#f0e6c8]">
                Before continuing, please confirm you've saved your private key. Without it, you'll permanently lose
                access to your account.
              </p>

              {/* Copied checkbox - now first */}
              <div className="flex items-center mt-2">
                <div
                  className={`w-4 h-4 border ${keyCopied ? "bg-[#4287f5] border-[#4287f5]" : "border-[#3a2a30]"} flex items-center justify-center`}
                >
                  {keyCopied && <Check size={12} className="text-[#1a1015]" />}
                </div>
                <span className="text-xs text-[#f0e6c8] ml-2">I've copied my private key to a secure location</span>
              </div>

              {/* Downloaded checkbox - now second */}
              <div className="flex items-center mt-1.5">
                <div
                  className={`w-4 h-4 border ${keyDownloaded ? "bg-[#4287f5] border-[#4287f5]" : "border-[#3a2a30]"} flex items-center justify-center`}
                >
                  {keyDownloaded && <Check size={12} className="text-[#1a1015]" />}
                </div>
                <span className="text-xs text-[#f0e6c8] ml-2">I've downloaded my private key</span>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start space-x-2 text-[#dc5050] text-xs">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-between pt-1">
              <button className="channel-button flex items-center px-3 py-1.5" onClick={() => setStep(1)}>
                <ChevronLeft size={14} className="mr-1" />
                <span className="text-xs tracking-wide">BACK</span>
              </button>

              <button
                className={`channel-button ${keyCopied || keyDownloaded ? "active" : ""} flex items-center px-3 py-1.5`}
                onClick={handleCreateAccount}
                disabled={(!keyCopied && !keyDownloaded) || isLoading}
              >
                <span className="text-xs tracking-wide">{isLoading ? "CREATING..." : "CREATE ACCOUNT"}</span>
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
      onClose={onClose}
      title="CREATE SEQ1 ACCOUNT"
      icon={<UserPlus size={16} className="text-[#a09080]" />}
      width="w-[450px]"
    >
      {renderStepContent()}
    </DraggableModal>
  )
}
