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
  ShieldCheck,
  Save,
  AlertTriangle,
} from "lucide-react"
import DraggableModal from "@/components/draggable-modal"
import type { NostrKeypair } from "@/lib/nostr-utils"
import { Button } from "@/components/ui/button" // Using shadcn Button for consistency
import { Checkbox } from "@/components/ui/checkbox" // Using shadcn Checkbox
import { Input } from "@/components/ui/input" // Using shadcn Input

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginClick: () => void
}

export default function SignupModal({ isOpen, onClose, onLoginClick }: SignupModalProps) {
  const { generateAndStoreKeys, registerIdentity, isLoading: authIsLoading } = useAuth()
  const [step, setStep] = useState(1)
  const [generatedKeys, setGeneratedKeys] = useState<NostrKeypair | null>(null)

  const [nsecCopied, setNsecCopied] = useState(false)
  const [nsecDownloaded, setNsecDownloaded] = useState(false)
  const [understandRisk, setUnderstandRisk] = useState(false)

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
    setNsecDownloaded(false)
    setUnderstandRisk(false)
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
      if (generatedKeys && !forceRegenerate && !isGeneratingKeys) return

      setIsGeneratingKeys(true)
      setError(null)
      setShowPrivateKey(false)
      setNsecCopied(false)
      setNsecDownloaded(false)
      setUnderstandRisk(false)

      const result = await generateAndStoreKeys()
      if (result.success && result.keys) {
        setGeneratedKeys(result.keys)
      } else {
        setError(result.error || "Failed to generate Creative Keys. Please try again.")
        setGeneratedKeys(null)
      }
      setIsGeneratingKeys(false)
    },
    [generateAndStoreKeys, generatedKeys, isGeneratingKeys],
  )

  useEffect(() => {
    if (isOpen && step === 2 && !generatedKeys && !isGeneratingKeys) {
      handleGenerateKeys()
    }
  }, [isOpen, step, generatedKeys, isGeneratingKeys, handleGenerateKeys])

  useEffect(() => {
    if (!isOpen) {
      resetLocalState()
    }
  }, [isOpen, resetLocalState])

  useEffect(() => {
    if (showPrivateKey && generatedKeys) {
      setTimeLeftToHideKey(30)
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

  const togglePrivateKeyVisibility = () => {
    setShowPrivateKey(!showPrivateKey)
    if (!showPrivateKey) setTimeLeftToHideKey(30) // Reset timer when showing
  }

  const copyToClipboard = (text: string, type: "nsec" | "npub") => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        if (type === "nsec") setNsecCopied(true)
        // Could add toast feedback here
      })
      .catch((err) => {
        setError(`Failed to copy ${type === "nsec" ? "Private Key" : "Public ID"}. Please copy manually.`)
      })
  }

  const downloadNsecKeyFile = () => {
    if (!generatedKeys) return
    const content =
      `SEQ1 Studio - NOSTR PRIVATE KEY (NSEC)\n` +
      `==========================================\n\n` +
      `IMPORTANT: Keep this file and its contents SECRET and SAFE.\n` +
      `This is your Nostr private key for accessing your SEQ1 studio and projects.\n\n` +
      `Private Key (nsec): ${generatedKeys.nsec}\n` +
      `Public Key (npub): ${generatedKeys.npub}\n\n` +
      `WARNING:\n` +
      `- Anyone with this Private Key can access your SEQ1 account.\n` +
      `- Store it in a secure password manager or encrypted storage.\n` +
      `- SEQ1 CANNOT recover this key if you lose it. Loss of this key means permanent loss of access.\n\n` +
      `Generated: ${new Date().toISOString()}\n`
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `SEQ1_Nostr_Private_Key_${generatedKeys.publicKeyHex.slice(0, 8)}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setNsecDownloaded(true)
  }

  const handleFinishSignupAndRegister = async () => {
    if (!generatedKeys || (!nsecCopied && !nsecDownloaded) || !understandRisk) {
      setError("Please save your Private Key and confirm you understand the risks before proceeding.")
      return
    }
    setIsRegistering(true)
    setError(null)

    const registrationResult = await registerIdentity()

    if (registrationResult.success) {
      resetLocalState()
      onClose()
    } else {
      setError(
        registrationResult.error ||
          "Failed to register your Nostr Identity. Your keys are saved locally. Please try accessing with them or contact support.",
      )
    }
    setIsRegistering(false)
  }

  const handleCloseModal = () => {
    resetLocalState()
    onClose()
  }

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <p className="text-sm text-[#a09080]">
              SEQ1 uses a <span className="font-semibold text-[#f0e6c8]">Nostr Identity</span> for secure,
              decentralized access to your studio. It's like your unique digital signature for your musical work.
            </p>
            <div className="bg-[#1a1015] border border-[#3a2a30] p-3 rounded-sm space-y-2">
              <div className="flex items-start space-x-3">
                <Key size={20} className="text-[#4287f5] flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-medium text-[#f0e6c8]">Your Nostr Keys</h4>
                  <p className="text-xs text-[#a09080] mt-0.5">
                    You'll get a <span className="text-[#f5a623] font-semibold">Private Key (nsec)</span> –
                    this is your secret master key. Keep it ultra-safe!
                    <br />
                    And a <span className="text-[#4287f5] font-semibold">Public Key (npub)</span> – this is your
                    shareable identifier.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-[#2a1a20] border border-[#f5a623] p-3 rounded-sm">
              <div className="flex items-center space-x-2">
                <AlertTriangle size={20} className="text-[#f5a623] flex-shrink-0" />
                <h4 className="text-sm font-medium text-[#f5a623]">CRITICAL: Secure Your Private Key!</h4>
              </div>
              <p className="text-xs text-[#f0e6c8] mt-1.5">
                In the next step, we'll generate your unique Private Key. You{" "}
                <span className="underline font-semibold">MUST</span> save this key securely. Think of it like the keys
                to your entire studio.
              </p>
              <p className="text-xs text-[#a09080] mt-1">
                If you lose your Private Key, you'll{" "}
                <span className="font-semibold text-[#f5a623]">permanently lose access</span> to your SEQ1 account and
                all your work.
                <span className="font-semibold"> SEQ1 cannot recover it for you.</span>
              </p>
            </div>
            <div className="flex justify-between items-center pt-2">
              <Button variant="outline" onClick={onLoginClick} disabled={currentLoading} className="text-xs px-3 py-1.5 h-8">
                I Have a Nostr Identity
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={currentLoading}
                className="text-xs px-3 py-1.5 h-8 bg-[#4287f5] hover:bg-[#5497ff] text-white"
              >
                Generate My Nostr Keys <ChevronRight size={12} className="ml-1 inline" />
              </Button>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-medium text-[#f0e6c8]">Your New Nostr Identity</h3>
              <p className="text-sm text-[#a09080]">
                This is your unique <span className="font-semibold text-[#f5a623]">Private Key (nsec)</span>.
                Guard it carefully – it's your master key to SEQ1.
              </p>
            </div>

            {isGeneratingKeys && !generatedKeys && (
              <div className="text-center text-[#a09080] py-6">
                <RefreshCw size={20} className="animate-spin inline mr-2" />
                Crafting your unique Nostr Keys...
              </div>
            )}

            {generatedKeys && (
              <>
                <div className="bg-[#1a1015] border border-[#f5a623] p-3 rounded-sm">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-[#f5a623] font-semibold">
                      PRIVATE KEY (NSEC) - KEEP SECRET!
                    </span>
                    <div className="flex items-center space-x-2">
                      {showPrivateKey && (
                        <span className="text-[10px] text-[#a09080]">Hides in {timeLeftToHideKey}s</span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={togglePrivateKeyVisibility}
                        title={showPrivateKey ? "Hide Key" : "Show Key"}
                        className="h-6 w-6 text-[#f5a623] hover:text-[#f7b84a]"
                      >
                        {showPrivateKey ? <EyeOff size={14} /> : <Eye size={14} />}
                      </Button>
                    </div>
                  </div>
                  <div className="relative">
                    <Input
                      type={showPrivateKey ? "text" : "password"}
                      readOnly
                      value={generatedKeys.nsec}
                      className={`text-xs font-mono w-full pr-20 ${showPrivateKey ? "text-[#f5a623]" : "text-transparent blur-sm select-none"} bg-[#0f0a0c] border-[#3a2a30] focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-[#f5a623]`}
                      aria-label="Private Key"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(generatedKeys.nsec, "nsec")}
                        title="Copy Private Key"
                        className="h-6 w-6 text-[#a09080] hover:text-[#f0e6c8]"
                      >
                        {nsecCopied && showPrivateKey ? (
                          <Check size={14} className="text-green-400" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={downloadNsecKeyFile}
                        title="Download Private Key File"
                        className="h-6 w-6 text-[#a09080] hover:text-[#f0e6c8]"
                      >
                        <Download size={14} />
                      </Button>
                    </div>
                    {!showPrivateKey && (
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-[#a09080] pointer-events-none">
                        Click <Eye size={12} className="inline mx-1" /> to reveal and save your Private Key
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#1a1015] border border-[#3a2a30] p-3 rounded-sm">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-[#4287f5] font-semibold">PUBLIC KEY (NPUB) - SHAREABLE</span>
                  </div>
                  <div className="relative">
                    <Input
                      type="text"
                      readOnly
                      value={generatedKeys.npub}
                      className="text-xs font-mono w-full pr-10 text-[#4287f5] bg-[#0f0a0c] border-[#3a2a30] focus-visible:ring-offset-0 focus-visible:ring-1"
                      aria-label="Public Key"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(generatedKeys.npub, "npub")}
                      title="Copy Public Key"
                      className="absolute inset-y-0 right-0 flex items-center pr-2 h-full w-10 text-[#a09080] hover:text-[#f0e6c8]"
                    >
                      <Copy size={14} />
                    </Button>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => handleGenerateKeys(true)}
                  disabled={currentLoading}
                  className="w-full text-xs text-[#a09080] hover:text-[#f0e6c8]"
                >
                  <RefreshCw size={12} className={`mr-1.5 ${isGeneratingKeys ? "animate-spin" : ""}`} />
                  {isGeneratingKeys ? "Generating..." : "Generate New Nostr Keys (current ones will be lost)"}
                </Button>

                <div className="bg-[#2a1a20] border border-[#f5a623] p-3 rounded-sm space-y-2.5">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck size={18} className="text-[#f5a623] flex-shrink-0" />
                    <h4 className="text-sm font-medium text-[#f5a623]">Confirm Secure Backup</h4>
                  </div>
                  <p className="text-xs text-[#f0e6c8]">
                    Your Private Key is your responsibility. Please confirm you've saved it securely.
                  </p>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 text-xs text-[#f0e6c8] cursor-pointer">
                      <Checkbox
                        id="cb-copied"
                        checked={nsecCopied}
                        onCheckedChange={(checked) => setNsecCopied(!!checked)}
                        className="border-[#a09080]"
                      />
                      <span>
                        I have <span className="font-semibold">COPIED</span> my Private Key to a secure
                        password manager or offline storage.
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs text-[#f0e6c8] cursor-pointer">
                      <Checkbox
                        id="cb-downloaded"
                        checked={nsecDownloaded}
                        onCheckedChange={(checked) => setNsecDownloaded(!!checked)}
                        className="border-[#a09080]"
                      />
                      <span>
                        I have <span className="font-semibold">DOWNLOADED</span> the Private Key file and
                        stored it safely.
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs text-[#f0e6c8] cursor-pointer">
                      <Checkbox
                        id="cb-understand"
                        checked={understandRisk}
                        onCheckedChange={(checked) => setUnderstandRisk(!!checked)}
                        className="border-[#a09080]"
                      />
                      <span>
                        I understand if I lose this key,{" "}
                        <span className="font-semibold text-[#f5a623]">
                          I lose access to my SEQ1 account permanently
                        </span>
                        .
                      </span>
                    </label>
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="flex items-start space-x-2 text-red-400 text-xs p-2.5 bg-[#2a1a20] border border-red-500/50 rounded-sm">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 gap-3">
              <Button variant="outline" onClick={() => setStep(1)} disabled={currentLoading} className="text-xs px-3 py-1.5 h-8">
                <ChevronLeft size={12} className="mr-1 inline" /> Back
              </Button>
              <Button
                onClick={handleFinishSignupAndRegister}
                disabled={!generatedKeys || !nsecCopied || !nsecDownloaded || !understandRisk || currentLoading}
                className="text-xs px-3 py-1.5 h-8 bg-[#4CAF50] hover:bg-[#5cb85c] text-white flex-shrink-0"
              >
                {isRegistering ? "Securing Identity..." : "Complete Setup"}
                {isRegistering ? (
                  <RefreshCw size={12} className="ml-1.5 inline animate-spin" />
                ) : (
                  <Save size={12} className="ml-1.5 inline" />
                )}
              </Button>
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
      onClose={handleCloseModal}
      title="Establish Your Nostr Identity"
      icon={<UserPlus size={16} className="text-[#a09080]" />}
      width="w-[520px]"
    >
      {renderStepContent()}
    </DraggableModal>
  )
}
