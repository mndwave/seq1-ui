import { ExternalLink } from "lucide-react"

interface SocialTuningPromptProps {
  variant?: "full" | "compact"
  className?: string
}

export function SocialTuningPrompt({ variant = "full", className = "" }: SocialTuningPromptProps) {
  if (variant === "compact") {
    return (
      <div className={`p-2 bg-[#1a1015] border border-[#3a2a30] rounded-sm ${className}`}>
        <div className="text-[10px] text-[#a09080] leading-relaxed">
          <p>
            Share your music on Nostr with <span className="text-[#f0e6c8] font-medium">#SEQ1</span> to help the system
            learn your unique sound.{" "}
            <a
              href="https://primal.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#4287f5] hover:underline inline-flex items-center"
            >
              Try Primal
              <ExternalLink size={8} className="ml-0.5" />
            </a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`p-3 bg-[#1a1015] border border-[#3a2a30] rounded-sm ${className}`}>
      <div className="text-xs text-[#a09080] leading-relaxed">
        <p className="font-medium mb-1.5">Want SEQ1 to learn your sound?</p>
        <p>
          Share your music on Nostr with <span className="text-[#f0e6c8] font-medium">#SEQ1</span> — the system will
          self-optimize around your taste, emotion, and expression.
        </p>
        <p className="my-1.5">No opt-in. No feed. Just feedback.</p>
        <p className="italic">Tune the system to you.</p>
        <div className="mt-2 text-right">
          <a
            href="https://primal.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4287f5] hover:underline inline-flex items-center text-[10px]"
          >
            Get started with Primal
            <ExternalLink size={10} className="ml-0.5" />
          </a>
        </div>
      </div>
    </div>
  )
}
