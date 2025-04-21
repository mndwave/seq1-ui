"use client"

import ChatSynthPresetDemo from "@/components/chat-synth-preset-demo"

export default function SynthPresetDemoPage() {
  return (
    <div className="min-h-screen bg-[#1a1015] p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-semibold italic text-[#f0e6c8] font-poppins mb-6">SEQ1 Synth Preset Demo</h1>

        <ChatSynthPresetDemo />
      </div>
    </div>
  )
}
