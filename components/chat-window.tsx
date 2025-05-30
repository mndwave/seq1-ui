"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"
import VersionIndicator from "./version-indicator"

// Add these imports at the top of the file
// Add this import at the top of the file
import { ChatAPI, TransportAPI } from "@/lib/api-services"
import MiniMoogPreset from "./minimoog-preset"

// Add a new message type for synth presets
// Update the Message interface to include a new type for synth presets
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
export default function ChatWindow({
  isHardwareConnected = false,
  selectedDeviceId = null,
  selectedClipId = null,
}: ChatWindowProps) {
  // Update the welcome message to be more CRT-like
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Welcome to SEQ1. Connect your MIDI hardware to get started.",
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Check if both device and clip are selected
    if (!selectedDeviceId || !selectedClipId) {
      // Show a temporary error message in the chat
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "Please select both a device and a clip to compose.",
        sender: "assistant",
        type: "config",
      }
      setMessages([...messages, errorMessage])
      return
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
    }

    setMessages([...messages, newMessage])
    setInput("")

    // Simulate AI thinking
    setIsThinking(true)

    // Check if the user is requesting a synth preset
    if (input.toLowerCase().includes("synth-preset") || input.toLowerCase().includes("synth preset")) {
      // Wait a moment to simulate processing
      setTimeout(() => {
        setIsThinking(false)

        // Create a synth preset message
        const presetMessage: Message = {
          id: Date.now().toString(),
          content: "Here's a synth preset for your Minimoog Model D:",
          sender: "assistant",
          type: "synth-preset",
          presetName: "70s Violin Lead",
        }

        setMessages((prev) => [...prev, presetMessage])
      }, 1500)

      return
    }

    try {
      // Send the message to the API with device and clip context
      const { response, midiClip, responseData } = await ChatAPI.sendMessage(input)

      // Process the MIDI if hardware is connected
      if (isHardwareConnected && midiClip) {
        try {
          await TransportAPI.playMidiClip(midiClip.id, selectedDeviceId) // Assuming midiClip has an id property
        } catch (midiError) {
          console.error("Error playing MIDI clip:", midiError)
        }
      }

      // Add the response to the chat
      setIsThinking(false)
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: "assistant",
        type: "patch", // You might want to determine this based on the response
      }

      setMessages((prev) => [...prev, responseMessage])

      // Inside your handleSubmit function or wherever you process API responses

      // When receiving a synth preset from the API
      if (responseData?.type === "synth-preset" && responseData.preset) {
        // The preset data comes from the API as a SynthPresetSchema object
        const presetMessage: Message = {
          id: Date.now().toString(),
          content: "Here's a synth preset for your device:",
          sender: "assistant",
          type: "synth-preset",
          presetData: responseData.preset, // Store the preset data in the message
        }

        setMessages((prev) => [...prev, presetMessage])
      }
    } catch (error) {
      console.error("Error processing chat:", error)
      setIsThinking(false)

      // Add an error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error processing your request. Please try again.",
        sender: "assistant",
      }

      setMessages((prev) => [...prev, errorMessage])
    }
  }

  // Function to create a test synth preset message
  const createTestSynthPreset = () => {
    const presetMessage: Message = {
      id: Date.now().toString(),
      content: "Here's a synth preset for your Minimoog Model D:",
      sender: "assistant",
      type: "synth-preset",
      presetName: "70s Violin Lead",
    }

    setMessages((prev) => [...prev, presetMessage])
  }

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
          <div className="relative animate-fadeIn max-w-3xl">
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
