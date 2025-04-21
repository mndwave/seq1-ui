"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { UserPlus, Copy, Download, Check, AlertCircle, ChevronRight, ChevronLeft, Key } from "lucide-react"
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
  const [username, setUsername] = useState("")
  // Remove this line
  const [keyCopied, setKeyCopied] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState(false)
  const [keyDownloaded, setKeyDownloaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

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
      setUsername("")
      setKeyCopied(false)
      setCopyFeedback(false)
      setKeyDownloaded(false)
      setError(null)
    }
  }, [isOpen])

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

  const copyPrivateKey = () => {
    if (!keys) return

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

    // Set keyDownloaded to true without affecting keyCopied state
    setKeyDownloaded(true)

    // Remove the setTimeout that was resetting keyCopied
    // The original code might have had this, but we're making sure it's not there
  }

  const handleCreateProfile = async () => {
    if (!username.trim()) {
      setError("Username is required")
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const success = await saveUserProfile({
        username,
        // Use username as the display name too
        displayName: username,
      })

      if (success) {
        onClose()
      } else {
        setError("Failed to create profile. Please try again.")
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
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-[#f0e6c8]">Welcome to SEQ1</h3>
              <p className="text-sm text-[#a09080]">
                SEQ1 uses Nostr for authentication, a decentralized protocol that gives you complete control over your
                identity.
              </p>
            </div>

            {/* Extension signup option */}
            <div className="bg-[#1a1015] border border-[#3a2a30] p-3 rounded-sm">
              <p className="text-xs text-[#f5a623] font-medium">NEW TO NOSTR?</p>
              <p className="text-xs text-[#f0e6c8] mt-1">
                We'll help you create a new Nostr identity that you can use with SEQ1 and other Nostr applications.
              </p>
              <p className="text-xs text-[#a09080] mt-1">
                If you already have a Nostr account through Alby or NOS2X, you can go back and use the "Login" option
                instead.
              </p>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="flex-grow h-px bg-[#3a2a30]"></div>
              <span className="px-4 text-xs text-[#a09080]">OR</span>
              <div className="flex-grow h-px bg-[#3a2a30]"></div>
            </div>

            <div className="inset-panel p-4 space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#4287f5] flex items-center justify-center flex-shrink-0">
                  <Key size={16} className="text-[#1a1015]" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[#f0e6c8]">How Nostr Authentication Works</h4>
                  <p className="text-xs text-[#a09080] mt-1">
                    Instead of a username and password, you'll use a cryptographic key pair:
                  </p>
                  <ul className="text-xs text-[#a09080] mt-2 space-y-1 list-disc pl-4">
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

            <div className="bg-[#1a1015] border border-[#3a2a30] p-3 rounded-sm">
              <p className="text-xs text-[#f5a623] font-medium">IMPORTANT</p>
              <p className="text-xs text-[#f0e6c8] mt-1">
                In the next step, we'll generate your private key. You{" "}
                <span className="underline">must save this key</span> somewhere secure.
              </p>
              <p className="text-xs text-[#a09080] mt-1">
                If you lose your private key, you'll lose access to your SEQ1 account permanently.
              </p>
            </div>

            <div className="flex justify-between pt-2">
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
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-[#f0e6c8]">Save Your Private Key</h3>
              <p className="text-sm text-[#a09080]">
                This is your private key. Save it securely - it's the only way to access your account.
              </p>
            </div>

            {/* Private key display */}
            <div className="bg-[#1a1015] border border-[#3a2a30] p-3 rounded-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-[#a09080]">PRIVATE KEY (SECRET)</span>
                <div className="flex space-x-2">
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
              <div className="bg-[#0f0a0c] p-2 rounded-sm overflow-x-auto">
                <code className="text-xs text-[#f5a623] font-mono break-all">{keys?.nsec || "Generating..."}</code>
              </div>
              <p className="text-[10px] text-[#a09080] mt-2">
                This key is like a master password. Never share it with anyone.
              </p>
            </div>

            {/* Public key display */}
            <div className="bg-[#1a1015] border border-[#3a2a30] p-3 rounded-sm">
              <div className="flex justify-between items-center mb-2">
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
              <div className="bg-[#0f0a0c] p-2 rounded-sm overflow-x-auto">
                <code className="text-xs text-[#4287f5] font-mono break-all">{keys?.npub || "Generating..."}</code>
              </div>
              <p className="text-[10px] text-[#a09080] mt-2">
                This is your public identifier on Nostr. It's safe to share.
              </p>
            </div>

            {/* Confirmation checkboxes */}
            <div className="bg-[#1a1015] border border-[#f5a623] p-3 rounded-sm">
              <p className="text-xs text-[#f5a623] font-medium mb-2">CONFIRMATION REQUIRED</p>
              <p className="text-xs text-[#f0e6c8]">
                Before continuing, please confirm you've saved your private key. Without it, you'll permanently lose
                access to your account.
              </p>

              <div className="flex items-center mt-3">
                <div
                  className={`w-4 h-4 border ${keyDownloaded ? "bg-[#4287f5] border-[#4287f5]" : "border-[#3a2a30]"} flex items-center justify-center`}
                >
                  {keyDownloaded && <Check size={12} className="text-[#1a1015]" />}
                </div>
                <span className="text-xs text-[#f0e6c8] ml-2">I've downloaded my private key</span>
              </div>

              <div className="flex items-center mt-2">
                <div
                  className={`w-4 h-4 border ${keyCopied ? "bg-[#4287f5] border-[#4287f5]" : "border-[#3a2a30]"} flex items-center justify-center`}
                >
                  {keyCopied && <Check size={12} className="text-[#1a1015]" />}
                </div>
                <span className="text-xs text-[#f0e6c8] ml-2">I've copied my private key to a secure location</span>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button className="channel-button flex items-center px-3 py-1.5" onClick={() => setStep(1)}>
                <ChevronLeft size={14} className="mr-1" />
                <span className="text-xs tracking-wide">BACK</span>
              </button>

              <button
                className={`channel-button ${keyCopied || keyDownloaded ? "active" : ""} flex items-center px-3 py-1.5`}
                onClick={() => setStep(3)}
                disabled={!keyCopied && !keyDownloaded}
              >
                <span className="text-xs tracking-wide">CONTINUE</span>
                <ChevronRight size={14} className="ml-1" />
              </button>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-[#f0e6c8]">Create Your Profile</h3>
              <p className="text-sm text-[#a09080]">Choose a username for your SEQ1 account.</p>
            </div>

            {/* Username input */}
            <div className="space-y-1">
              <label className="text-xs text-[#a09080] tracking-wide">USERNAME</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter a username"
                className="w-full bg-[#1a1015] border border-[#3a2a30] rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4287f5] text-[#f0e6c8] tracking-wide"
              />
              <p className="text-[10px] text-[#a09080] mt-1">This will be your identifier in SEQ1</p>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start space-x-2 text-[#dc5050] text-xs">
                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button className="channel-button flex items-center px-3 py-1.5" onClick={() => setStep(2)}>
                <ChevronLeft size={14} className="mr-1" />
                <span className="text-xs tracking-wide">BACK</span>
              </button>

              <button
                className="channel-button active flex items-center px-3 py-1.5"
                onClick={handleCreateProfile}
                disabled={isLoading}
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
      width="w-[500px]"
    >
      {/* Progress indicator with muted colors */}
      <div className="flex items-center justify-center mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full ${
                s === step
                  ? "bg-[#a09080]" // Current step - muted gold/tan
                  : s < step
                    ? "bg-[#3a2a30]" // Completed step - deep muted purple
                    : "bg-[#2a1a20]" // Future step - darker background
              } border ${s <= step ? "border-[#f0e6c8]" : "border-[#3a2a30]"}`}
            />
            {s < 3 && (
              <div
                className={`w-12 h-0.5 ${
                  s < step ? "bg-[#3a2a30]" : "bg-[#2a1a20]"
                } ${s < step ? "border-b border-[#f0e6c8]/20" : ""}`}
              />
            )}
          </div>
        ))}
      </div>

      {renderStepContent()}
    </DraggableModal>
  )
}
