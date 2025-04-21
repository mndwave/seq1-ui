"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import ChatWindowDemo from "@/components/chat-window-demo"

export default function ChatDemoPage() {
  const [isThinking, setIsThinking] = useState(false)
  const [showCRTEffect, setShowCRTEffect] = useState(true)
  const [messageType, setMessageType] = useState<"normal" | "midi" | "patch" | "config">("normal")

  const toggleThinking = () => {
    setIsThinking(!isThinking)
  }

  return (
    <div className="min-h-screen bg-[#1a1015] flex flex-col">
      {/* Header with controls */}
      <div className="p-4 border-b border-[#3a2a30] bg-[#2a1a20]">
        <div className="max-w-screen-lg mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <h1 className="text-xl font-semibold italic text-[#f0e6c8] font-poppins">SEQ1 Chat Window Demo</h1>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={toggleThinking} className={`channel-button ${isThinking ? "active" : ""}`}>
              <span className="text-xs tracking-wide">{isThinking ? "STOP THINKING" : "SIMULATE THINKING"}</span>
            </Button>

            <Button
              onClick={() => setShowCRTEffect(!showCRTEffect)}
              className={`channel-button ${showCRTEffect ? "active" : ""}`}
            >
              <span className="text-xs tracking-wide">{showCRTEffect ? "CRT EFFECT ON" : "CRT EFFECT OFF"}</span>
            </Button>

            <div className="flex items-center space-x-2 ml-2">
              <span className="text-xs text-[#a09080]">Message Type:</span>
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value as any)}
                className="bg-[#2a1a20] border border-[#3a2a30] text-[#f0e6c8] text-xs px-2 py-1 rounded-sm"
              >
                <option value="normal">Normal</option>
                <option value="midi">MIDI</option>
                <option value="patch">Patch</option>
                <option value="config">Config</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Demo container */}
      <div className="flex-1 flex">
        <div className="max-w-screen-lg mx-auto w-full flex my-8">
          {/* Chat window */}
          <div className="w-full max-w-2xl border-2 border-[#3a2a30] rounded-sm overflow-hidden">
            <ChatWindowDemo
              isThinking={isThinking}
              showCRTEffect={showCRTEffect}
              messageType={messageType}
              onThinkingComplete={() => setIsThinking(false)}
              onMessageSent={() => setIsThinking(true)}
            />
          </div>

          {/* Instructions */}
          <div className="ml-8 flex-1">
            <div className="p-6 bg-[#2a1a20] border border-[#3a2a30] rounded-sm">
              <h2 className="text-sm font-medium text-[#f0e6c8] uppercase tracking-wider mb-4">Chat Window Demo</h2>
              <div className="text-sm text-[#a09080] space-y-4">
                <p>This demo shows the Chat Window component with full interactivity:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>Type and Send Messages:</strong> The input field is always enabled
                  </li>
                  <li>
                    <strong>Simulate Thinking:</strong> Shows the audio meter visualization
                  </li>
                  <li>
                    <strong>CRT Effect:</strong> Toggle the CRT flicker effect on/off
                  </li>
                  <li>
                    <strong>Message Types:</strong> Test different message styling
                  </li>
                </ul>
                <p className="mt-4">
                  When you send a message, the system will simulate a response after a short delay.
                </p>
                <p className="mt-4">Different message types have different colored borders:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    <strong>MIDI:</strong> Blue border - for MIDI-related messages
                  </li>
                  <li>
                    <strong>Patch:</strong> Yellow border - for patch/preset changes
                  </li>
                  <li>
                    <strong>Config:</strong> Gray border - for configuration messages
                  </li>
                  <li>
                    <strong>Normal:</strong> No border - for general conversation
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
