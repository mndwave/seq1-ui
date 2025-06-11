"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"
import VersionIndicator from "./version-indicator"

interface Message {
  id: string
  content: string
  sender: "user" | "assistant"
  type?: "midi" | "patch" | "config"
}

// Update the interface to include context parameters
interface ChatWindowDemoProps {
  isThinking: boolean
  showCRTEffect: boolean
  messageType: "normal" | "midi" | "patch" | "config"
  selectedDeviceId?: string | null
  selectedClipId?: string | null
  onThinkingComplete?: () => void
  onMessageSent?: () => void
}

export default function ChatWindowDemo({
  isThinking,
  showCRTEffect,
  messageType,
  selectedDeviceId = null,
  selectedClipId = null,
  onThinkingComplete,
  onMessageSent,
}: ChatWindowDemoProps) {
  // Initial welcome message
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Welcome to SEQ1. Type a message to get started.",
      sender: "assistant",
    },
  ])
  const [input, setInput] = useState("")
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

  // Update the generateResponse function to include context
  const generateResponse = (
    userMessage: string,
    type: "normal" | "midi" | "patch" | "config",
    deviceId?: string | null,
    clipId?: string | null,
  ) => {
    let responseContent = ""
    let responseType = undefined

    // Create a context string for the response
    const contextStr = deviceId && clipId ? ` for ${deviceId} in clip ${clipId}` : ""

    switch (type) {
      case "midi":
        responseContent = `I've detected MIDI activity on your Prophet 5${contextStr}. It looks like you're sending notes on channel 1. Would you like me to analyze the pattern?`
        responseType = "midi"
        break
      case "patch":
        responseContent = `I've created a new patch for your Analog Four MKII${contextStr} based on your description. It has a deep bass with subtle modulation and a touch of resonance. You can find it in the SEQ1 library.`
        responseType = "patch"
        break
      case "config":
        responseContent = `I've updated your device configuration${contextStr}. The Minimoog Model D is now set to receive on MIDI channel 3 and the Prophet 5 is set to channel 1.`
        responseType = "config"
        break
      default:
        responseContent = `I understand you're asking about "${userMessage}"${contextStr}. Let me help you with that. SEQ1 can assist with your hardware setup, patch creation, and musical ideas.`
    }

    return {
      id: (Date.now() + 1).toString(),
      content: responseContent,
      sender: "assistant",
      type: responseType,
    }
  }

  // Update the handleSubmit function to call onMessageSent
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Check if both device and clip are selected for context routing
    if (!selectedDeviceId || !selectedClipId) {
      // Add a message indicating the need for context selection
      const contextMessage: Message = {
        id: Date.now().toString(),
        content: "Please select both a device and a clip to compose.",
        sender: "assistant",
        type: "config",
      }
      setMessages([...messages, contextMessage])
      return
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
    }

    setMessages([...messages, newMessage])
    setInput("")

    // Notify parent component that a message was sent
    if (onMessageSent) {
      onMessageSent()
    }

    // Simulate AI response after a delay
    setTimeout(() => {
      if (onThinkingComplete) {
        onThinkingComplete()
      }

      // Generate a response that includes the context information
      const responseMessage = generateResponse(input, messageType, selectedDeviceId, selectedClipId)
      setMessages((prev) => [...prev, responseMessage])
    }, 2500) // Increased delay to show thinking animation longer
  }

  const getMessageBorderColor = (type?: string) => {
    switch (type) {
      case "midi":
        return "border-[#4287f5]"
      case "patch":
        return "border-[#f5d742]"
      case "config":
        return "border-[#a09080]"
      default:
        return "border-transparent"
    }
  }

  return (
    <div
      className="flex-1 flex flex-col h-[600px] bg-[#1a1015] relative scanlines screen-shadow"
      style={{ zIndex: 10 }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 diagonal-stripes opacity-10"></div>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-6 relative z-1">
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
                message.sender === "user" ? "text-[#a09080] text-right" : "seq1-label",
              )}
            >
              {message.sender === "user" ? "YOU" : "SEQ1"}
            </div>

            {/* Message bubble with vintage hardware-style border */}
            <div
              className={cn(
                "max-w-3xl p-4 relative transition-all duration-300",
                message.sender === "user" ? "bg-[#2a1a20] ml-auto" : "bg-[#1a1015]",
                message.sender === "assistant" && showCRTEffect ? "crt-flicker" : "",
              )}
              style={{
                boxShadow: `inset 0 0 0 1px rgba(240, 230, 200, 0.1), 
                       inset 0 0 0 2px rgba(58, 42, 48, 0.8)`,
                borderLeft: message.type
                  ? `2px solid ${getMessageBorderColor(message.type).replace("border-", "")}`
                  : "none",
              }}
            >
              <p className="text-sm text-[#f0e6c8]">{message.content}</p>
            </div>
          </div>
        ))}

        {/* Thinking animation - just the waveform without the chat bubble */}
        {isThinking && (
          <div className="relative animate-fadeIn max-w-3xl">
            {/* Audio meter visualization in cream color */}
            <div className="h-8 flex items-center space-x-[2px] my-4">
              {barHeights.map((height, index) => (
                <div
                  key={index}
                  className="w-[3px] rounded-sm transition-all duration-300 ease-out"
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
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="TYPE A COMMAND OR MESSAGE..."
            className="flex-1 bg-[#1a1015] border border-[#3a2a30] rounded-sm px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4287f5] text-[#f0e6c8] tracking-wide transition-all duration-200 focus:border-[#4287f5]"
          />
          <button
            type="submit"
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
              SEND <Send size={14} className="ml-1.5" />
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
