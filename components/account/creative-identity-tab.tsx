"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Eye, EyeOff, AlertTriangle, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CreativeIdentityTab() {
  const { user, keys, generateAndStoreKeys, registerIdentity } = useAuth() // Assuming keys (nsec, npub) are available
  const { toast } = useToast()

  const [currentNpub, setCurrentNpub] = useState("")
  const [currentNsec, setCurrentNsec] = useState("")
  const [showNsec, setShowNsec] = useState(false)
  const [timeLeftToHideKey, setTimeLeftToHideKey] = useState(30)
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user?.npub) {
      setCurrentNpub(user.npub)
    }
    if (keys?.nsec) {
      setCurrentNsec(keys.nsec)
    }
  }, [user, keys])

  useEffect(() => {
    if (showNsec && currentNsec) {
      setTimeLeftToHideKey(30) // Reset timer
      if (autoHideTimerRef.current) clearInterval(autoHideTimerRef.current)
      autoHideTimerRef.current = setInterval(() => {
        setTimeLeftToHideKey((prev) => {
          if (prev <= 1) {
            setShowNsec(false)
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
  }, [showNsec, currentNsec])

  const handleCopy = (text: string | undefined, type: "Public ID" | "Private Key") => {
    if (text) {
      navigator.clipboard.writeText(text)
      toast({
        title: `${type} Copied`,
        description: `${type} has been copied to your clipboard.`,
      })
    } else {
      toast({
        title: "Copy Failed",
        description: `${type} is not available to copy.`,
        variant: "destructive",
      })
    }
  }

  const toggleNsecVisibility = () => {
    if (!currentNsec) {
      toast({
        title: "Private Key Not Available",
        description: "Your Private Creative Key is not currently loaded in the browser.",
        variant: "destructive",
      })
      return
    }
    setShowNsec(!showNsec)
  }

  const downloadNsecKeyFile = () => {
    if (!currentNsec || !currentNpub) {
      toast({
        title: "Key Not Available",
        description: "Private Key is not available for download.",
        variant: "destructive",
      })
      return
    }
    const content =
      `SEQ1 Studio Signature - PRIVATE CREATIVE KEY (NSEC) - BACKUP\n` +
      `=============================================================\n\n` +
      `IMPORTANT: Keep this file and its contents SECRET and SAFE.\n` +
      `This is your unique digital signature for accessing your SEQ1 studio and projects.\n\n` +
      `Private Creative Key (nsec): ${currentNsec}\n` +
      `Public Creative ID (npub): ${currentNpub}\n\n` +
      `WARNING:\n` +
      `- Anyone with this Private Creative Key can access your SEQ1 account.\n` +
      `- Store it in a secure password manager or encrypted storage.\n` +
      `- SEQ1 CANNOT recover this key if you lose it. Loss of this key means permanent loss of access.\n\n` +
      `Backup Generated: ${new Date().toISOString()}\n`
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `SEQ1_Creative_Private_Key_BACKUP_${currentNpub.slice(0, 12)}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast({
      title: "Private Key File Downloaded",
      description: "Store it securely. This is a critical backup.",
    })
  }

  // Placeholder for a more complex "Change Identity" flow
  const handleChangeIdentity = async () => {
    setError(null)
    setIsLoading(true)
    toast({
      title: "Changing Identity...",
      description:
        "This feature (generating new keys and re-registering) is complex and requires careful implementation.",
    })
    // This would involve:
    // 1. Strong warnings about losing access to data associated with the OLD identity if not migrated.
    // 2. Generating new keys: const result = await generateAndStoreKeys(true); // true to overwrite
    // 3. If successful, new keys are in nostrStorage.
    // 4. Re-registering with the new identity: await registerIdentity();
    // 5. Guiding user to update any external services/relays if they used the old npub.
    // For now, this is a placeholder.
    setTimeout(() => {
      setIsLoading(false)
      setError("Changing Creative Identity is an advanced feature currently under review for safe implementation.")
    }, 2000)
  }

  if (!user) {
    return (
      <div className="p-4 text-center text-[#a09080]">
        <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-yellow-500" />
        Secure your session to manage your Creative Identity.
      </div>
    )
  }

  return (
    <div className="space-y-6 p-1">
      <div>
        <h3 className="text-lg font-medium text-[#f0e6c8]">Your Creative Identity</h3>
        <p className="text-sm text-[#a09080]">
          This is your unique digital signature for SEQ1. It secures your access and identifies you in the creative
          network.
        </p>
      </div>

      <div className="space-y-4 bg-[#1a1015] border border-[#3a2a30] p-4 rounded-md">
        <div className="space-y-1">
          <label htmlFor="npub-display" className="text-xs font-medium text-[#4287f5]">
            Public Creative ID (npub) - Shareable
          </label>
          <div className="flex items-center space-x-2">
            <Input
              id="npub-display"
              readOnly
              value={currentNpub}
              className="bg-[#0f0a0c] border-[#302028] text-[#f0e6c8] font-mono text-xs"
              placeholder="npub1..."
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopy(currentNpub, "Public ID")}
              aria-label="Copy Public Creative ID"
              className="text-[#a09080] hover:text-[#f0e6c8]"
            >
              <Copy size={16} />
            </Button>
          </div>
          <p className="text-[11px] text-[#a09080]">This is your unique public identifier. You can share it freely.</p>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label htmlFor="nsec-display" className="text-xs font-medium text-[#f5a623]">
              Private Creative Key (nsec) - Secret!
            </label>
            {showNsec && currentNsec && (
              <span className="text-[10px] text-[#a09080]">Hides in {timeLeftToHideKey}s</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Input
              id="nsec-display"
              readOnly
              type={showNsec ? "text" : "password"}
              value={currentNsec}
              className="bg-[#0f0a0c] border-[#302028] text-[#f0e6c8] font-mono text-xs"
              placeholder="nsec1..."
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleNsecVisibility}
              aria-label={showNsec ? "Hide Private Key" : "Show Private Key"}
              className="text-[#a09080] hover:text-[#f0e6c8]"
            >
              {showNsec ? <EyeOff size={16} /> : <Eye size={16} />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopy(currentNsec, "Private Key")}
              disabled={!showNsec}
              aria-label="Copy Private Creative Key"
              className="text-[#a09080] hover:text-[#f0e6c8] disabled:opacity-50"
            >
              <Copy size={16} />
            </Button>
          </div>
          {!currentNsec && (
            <p className="text-xs text-[#a09080] mt-1">
              Your Private Creative Key is not currently loaded in this browser session for security. It was provided
              during signup.
            </p>
          )}
          {currentNsec && (
            <p className="text-[11px] text-[#a09080] mt-1">
              This key grants full access to your account.{" "}
              <span className="font-semibold">Keep it secret and secure.</span>
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={downloadNsecKeyFile}
          disabled={!currentNsec || !currentNpub}
          className="text-xs w-full sm:w-auto"
        >
          <Download size={14} className="mr-2" />
          Download Private Key Backup File
        </Button>
      </div>

      <div className="border-t border-[#3a2a30] pt-6 space-y-4">
        <div className="flex items-start space-x-3 bg-[#2a1a20] border border-[#f5a623] p-3 rounded-md">
          <AlertTriangle size={28} className="text-[#f5a623] flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-sm font-medium text-[#f5a623]">Advanced: Changing Your Creative Identity</h4>
            <p className="text-xs text-[#f0e6c8] mt-1">
              Changing your Creative Identity (generating new keys) is a significant step. It means your current Public
              ID (npub) will no longer be associated with your account, and you'll need to use the new Private Key for
              access.
            </p>
            <p className="text-xs text-[#a09080] mt-1">
              This action cannot be undone. Ensure you understand the implications before proceeding. Data associated
              with your old identity may not be automatically migrated.
            </p>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleChangeIdentity}
              disabled={isLoading}
              className="text-xs mt-3"
            >
              {isLoading ? "Processing..." : "I Understand, Generate New Creative Identity"}
            </Button>
          </div>
        </div>
        {error && (
          <div className="text-red-400 text-xs p-2 bg-[#2a1a20] border border-red-500/50 rounded-sm flex items-center space-x-2">
            <AlertTriangle size={14} /> <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  )
}
