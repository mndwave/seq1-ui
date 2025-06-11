"use client"

import React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"
import VersionIndicator from "./version-indicator"

// Add these imports at the top of the file
import { ChatAPI, TransportAPI } from "@/lib/api-services"
import MiniMoogPreset from "./minimoog-preset"

// Add a new message type for synth presets
interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  type?: "midi" | "patch" | "config" | "synth-preset"
  presetName?: string // Add this for synth preset messages
  presetData?: any // Store the preset data in the message
}

// Update the ChatWindowProps interface to include device and clip context
interface ChatWindowProps {
  isHardwareConnected?: boolean
  selectedDeviceId?: string | null
  selectedClipId?: string | null
}

// Update the component signature to accept the new props
const ChatWindowComponent: React.FC<ChatWindowProps> = ({
  isHardwareConnected = false,
  selectedDeviceId = null,
  selectedClipId = null,
}) => {
  // Update the welcome message to be more CRT-like
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "SEQ1 initialized. Express your intention.",
      sender: "assistant",
    },
  ])
  const [input, setInput] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [barHeights, setBarHeights] = useState<number[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Initialize and animate bar heights for the thinking indicator
  useEffect(() => {
    if (isThinking) {
      // Initialize bar heights
      setBarHeights(
        Array(16)
          .fill(0)
          .map(() => Math.random() * 0.6 + 0.2),
      )

      // Animate bar heights
      const interval = setInterval(() => {
        setBarHeights((prev) => prev.map(() => Math.random() * 0.6 + 0.2))
      }, 250) // Slower update for a more relaxed feel

      return () => clearInterval(interval)
    }
  }, [isThinking])

  // Replace the handleSubmit function with this updated version
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const currentInput = input.trim() // Capture input before clearing

      // Clear input immediately
      setInput("") // <<<< MOVE THIS LINE UP

      if (!currentInput) return

      const newMessage: Message = {
        id: Date.now().toString(),
        content: currentInput,
        sender: "user",
      }
      setMessages((prevMessages) => [...prevMessages, newMessage])

      if (!selectedDeviceId || !selectedClipId) {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "To shape sound, first select a Device and a Clip.",
          sender: "assistant",
          type: "config",
        }
        setMessages((prevMessages) => [...prevMessages, errorMessage])
        return
      }

      setIsThinking(true) // setIsThinking after input is cleared and basic checks are done

      try {
        const { response, midiClip, responseData } = await ChatAPI.sendMessage(
          currentInput,
          selectedClipId,
          selectedDeviceId,
        )

        if (isHardwareConnected && midiClip && selectedDeviceId) {
          // Ensure selectedDeviceId is present
          try {
            await TransportAPI.playMidiClip(midiClip.id, selectedDeviceId)
          } catch (midiError) {
            console.error("Error playing MIDI clip:", midiError)
            // Optionally add a user-facing message for MIDI playback error
          }
        }

        const assistantResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: response,
          sender: "assistant",
          type: responseData?.type === "synth-preset" ? "patch" : "patch", // Or determine type more dynamically
        }
        setMessages((prev) => [...prev, assistantResponse])

        if (responseData?.type === "synth-preset" && responseData.preset) {
          const presetMessage: Message = {
            id: (Date.now() + 2).toString(), // Ensure unique ID
            content: "Synth preset generated:", // Adjusted content
            sender: "assistant",
            type: "synth-preset",
            presetName: responseData.preset.name || "Generated Preset", // Use preset name if available
            presetData: responseData.preset,
          }
          setMessages((prev) => [...prev, presetMessage])
        }
      } catch (error) {
        console.error("Error processing chat:", error)
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "A momentary lapse in the sequence. Please try your command again.",
          sender: "assistant",
        }
        setMessages((prev) => [...prev, errorMessage])
      } finally {
        setIsThinking(false)
      }
    },
    // Ensure `input` is in the dependency array if it wasn't, though `currentInput` captures its value.
    // The main dependencies are `selectedDeviceId`, `selectedClipId`, `isHardwareConnected`.
    // `setMessages`, `setIsThinking`, `setInput` are stable.
    [input, isHardwareConnected, selectedDeviceId, selectedClipId, setMessages, setIsThinking, setInput],
  )

  // Function to create a test synth preset message
  const createTestSynthPreset = useCallback(() => {
    const presetMessage: Message = {
      id: Date.now().toString(),
      content: "Here's a synth preset for your Minimoog Model D:",
      sender: "assistant",
      type: "synth-preset",
      presetName: "70s Violin Lead",
    }

    setMessages((prev) => [...prev, presetMessage])
  }, [setMessages])

  // In the getMessageBorderColor function, add a case for synth-preset
  const getMessageBorderColor = (type?: string) => {
    switch (type) {
      case "midi":
        return "border-[#4287f5]"
      case "patch":
        return "border-[#f5d742]"
      case "config":
        return "border-[#a09080]"
      case "synth-preset":
        return "border-[#f5a623]"
      default:
        return "border-transparent"
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1a1015] relative screen-shadow" style={{ zIndex: 10 }}>
      {/* Background pattern */}
      <div className="absolute inset-0 diagonal-stripes opacity-10"></div>

      <div
        ref={messagesContainerRef}
        role="log"
        aria-live="polite"
        className="flex-1 overflow-y-auto p-4 space-y-6 relative z-1"
      >
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`relative transition-all duration-500 ${
              index === messages.length - 1 && message.sender === "assistant" ? "animate-fadeIn" : ""
            }`}
          >
            {/* Sender label */}
            <div
              className={cn(
                "text-xs mb-1 tracking-wide",
                message.sender === "user" ? "text-[#a09080] text-right" : "text-[#7a9e9f]",
              )}
            >
              {message.sender === "user" ? "YOU" : "SEQ1"}
            </div>

            {/* Message bubble with vintage hardware-style border */}
            <div
              className={cn(
                "max-w3xl p-4 relative transition-all duration-300",
                message.sender === "user" ? "bg-[#2a1a20] ml-auto" : "bg-[#1a1015]",
                message.sender === "assistant" ? "crt-flicker" : "",
              )}
              style={{
                boxShadow: `inset 0 0 0 1px rgba(240, 230, 200, 0.1), 
        inset 0 0 0 2px rgba(58, 42, 48, 0.8)`,
                borderLeft: message.type
                  ? `2px solid ${getMessageBorderColor(message.type).replace("border-", "")}`
                  : "none",
              }}
            >
              {message.type === "synth-preset" ? (
                <>
                  <p className="text-sm text-[#f0e6c8] mb-4">{message.content}</p>
                  <MiniMoogPreset presetName={message.presetName || "Preset"} />
                </>
              ) : (
                <p className="text-sm text-[#f0e6c8]">{message.content}</p>
              )}
            </div>
          </div>
        ))}

        {/* Thinking animation - just the waveform without the chat bubble */}
        {isThinking && (
          <div
            className="relative animate-fadeIn max-w-3xl"
            aria-label="SEQ1 is processing your request"
            aria-live="assertive" // Or polite, depending on desired intrusiveness
            aria-busy="true"
            role="status"
          >
            {/* Audio meter visualization in cream color - smaller size */}
            <div className="h-6 flex items-center space-x-[1px] my-3 pl-4">
              {barHeights.map((height, index) => (
                <div
                  key={index}
                  className="w-[2px] rounded-sm transition-all duration-300 ease-out"
                  style={{
                    height: `${height * 100}%`,
                    backgroundColor: "#f0e6c8", // Cream color
                    opacity: 0.6 + height * 0.4,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-[#3a2a30] bg-[#2a1a20] relative">
        <div className="absolute inset-0 dot-pattern opacity-10"></div>
        <form onSubmit={handleSubmit} className="flex items-center relative z-10">
          <label htmlFor="chat-input" className="sr-only">
            Chat Input
          </label>
          <input
            type="text"
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ENTER COMMAND OR INTENTION..."
            className="flex-1 bg-[#1a1015] border border-[#3a2a30] rounded-sm px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4287f5] text-[#f0e6c8] tracking-wide transition-all duration-200 focus:border-[#4287f5]"
            aria-label="Chat input for commands or messages"
          />
          <button
            type="submit"
            aria-label="Transmit message"
            className="ml-2 relative px-5 py-2 overflow-hidden group bg-[#f0e6c8] rounded-sm text-[#2a1a20] hover:bg-[#fff] transition-all duration-300"
            style={{
              boxShadow: "0 2px 0 #3a2a30, inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 4px 8px rgba(0, 0, 0, 0.3)",
            }}
          >
            {/* Button texture overlay */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-b from-white/20 to-transparent opacity-50"></span>

            {/* Subtle noise texture */}
            <span className="absolute inset-0 w-full h-full dot-pattern opacity-10"></span>

            {/* Button text with shadow for depth */}
            <span
              className="relative flex items-center justify-center text-xs font-bold tracking-wide"
              style={{ textShadow: "0 1px 0 rgba(255, 255, 255, 0.4)" }}
            >
              TRANSMIT <Send size={14} className="ml-1.5" />
            </span>

            {/* Button press effect */}
            <span className="absolute bottom-0 left-0 right-0 h-1 bg-[#3a2a30] opacity-20 group-active:h-0 transition-all duration-150"></span>
            <span className="absolute inset-0 w-full h-full bg-[#2a1a20] opacity-0 group-active:opacity-5 group-active:translate-y-px transition-all duration-150"></span>
          </button>
        </form>

        {/* Version indicator */}
        <VersionIndicator />
      </div>
    </div>
  )
}

const ChatWindow = React.memo(ChatWindowComponent)

export default ChatWindow
