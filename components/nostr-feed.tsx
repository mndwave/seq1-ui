"use client"

import { useState, useEffect } from "react"
import { formatRelativeTime } from "@/lib/nostr-utils" // Corrected: Import from nostr-utils
import type { NostrNote } from "@/lib/nostr-utils"
import { getMockNotes } from "@/lib/nostr-client" // Assuming this provides mock data
import ThinkingDots from "./thinking-dots"

interface NostrFeedProps {
  pubkey: string
  onNotesLoaded?: (notes: NostrNote[]) => void
}

export default function NostrFeed({ pubkey, onNotesLoaded }: NostrFeedProps) {
  const [notes, setNotes] = useState<NostrNote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [barHeights, setBarHeights] = useState<number[]>([])
  const [usingMockData, setUsingMockData] = useState(false) // To indicate if mock data is used
  const [loadAttempt, setLoadAttempt] = useState(0)

  // Initialize and animate bar heights for the thinking indicator
  useEffect(() => {
    if (isLoading) {
      setBarHeights(
        Array(16)
          .fill(0)
          .map(() => Math.random() * 0.6 + 0.2),
      )
      const interval = setInterval(() => {
        setBarHeights((prev) => prev.map(() => Math.random() * 0.6 + 0.2))
      }, 250)
      return () => clearInterval(interval)
    }
  }, [isLoading])

  useEffect(() => {
    const loadNotes = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // For now, directly use mock data as per the original component logic
        const mockNotes = getMockNotes(pubkey, 5) // Assuming getMockNotes is synchronous
        setNotes(mockNotes)
        setUsingMockData(true) // Indicate that mock data is being used

        if (onNotesLoaded) {
          onNotesLoaded(mockNotes)
        }
      } catch (err) {
        console.error("Error loading notes:", err)
        setError("Failed to load MNDWAVE updates. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    loadNotes()
  }, [pubkey, onNotesLoaded, loadAttempt]) // loadAttempt to allow retrying

  const handleRetry = () => {
    setLoadAttempt((prev) => prev + 1)
  }

  if (isLoading) {
    return (
      <div className="relative animate-fadeIn max-w-3xl">
        <div className="text-xs mb-1 tracking-wide text-[#7a9e9f]">SEQ1</div>
        <div
          className="max-w-3xl p-4 relative transition-all duration-300 bg-[#1a1015]"
          style={{ boxShadow: `inset 0 0 0 1px rgba(240, 230, 200, 0.1), inset 0 0 0 2px rgba(58, 42, 48, 0.8)` }}
        >
          <div className="flex items-center mb-2">
            <p className="text-sm text-[#f0e6c8] mr-2">Connecting to MNDWAVE feed</p>
            <ThinkingDots />
          </div>
          <div className="h-8 flex items-center space-x-[2px] my-4">
            {barHeights.map((height, index) => (
              <div
                key={index}
                className="w-[3px] rounded-sm transition-all duration-300 ease-out"
                style={{ height: `${height * 100}%`, backgroundColor: "#f0e6c8", opacity: 0.6 + height * 0.4 }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="relative transition-all duration-500">
        <div className="text-xs mb-1 tracking-wide text-[#7a9e9f]">SEQ1</div>
        <div
          className="max-w-3xl p-4 relative transition-all duration-300 bg-[#1a1015] crt-flicker"
          style={{ boxShadow: `inset 0 0 0 1px rgba(240, 230, 200, 0.1), inset 0 0 0 2px rgba(58, 42, 48, 0.8)` }}
        >
          <p className="text-sm text-[#f0e6c8] mb-3">{error}</p>
          <button onClick={handleRetry} className="text-xs text-[#4287f5] hover:text-[#50a0ff] transition-colors">
            Try again
          </button>
          {usingMockData && ( // Show this only if an error occurs while mock data is active
            <p className="text-xs text-[#a09080] mt-3">Displaying example content due to a connection issue.</p>
          )}
        </div>
      </div>
    )
  }

  if (notes.length === 0 && !isLoading) {
    // Ensure not to show "no updates" while loading
    return (
      <div className="relative transition-all duration-500">
        <div className="text-xs mb-1 tracking-wide text-[#7a9e9f]">SEQ1</div>
        <div
          className="max-w-3xl p-4 relative transition-all duration-300 bg-[#1a1015] crt-flicker"
          style={{ boxShadow: `inset 0 0 0 1px rgba(240, 230, 200, 0.1), inset 0 0 0 2px rgba(58, 42, 48, 0.8)` }}
        >
          <p className="text-sm text-[#f0e6c8]">No updates available at this time.</p>
          <button
            onClick={handleRetry}
            className="text-xs text-[#4287f5] hover:text-[#50a0ff] transition-colors mt-3 block"
          >
            Check for updates
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {usingMockData && ( // Consistently show this message if mock data is active
        <div className="relative transition-all duration-500 animate-fadeIn">
          <div className="text-xs mb-1 tracking-wide text-[#7a9e9f]">SEQ1</div>
          <div
            className="max-w-3xl p-4 relative transition-all duration-300 bg-[#1a1015] border-l-2 border-[#f5a623]"
            style={{ boxShadow: `inset 0 0 0 1px rgba(240, 230, 200, 0.1), inset 0 0 0 2px rgba(58, 42, 48, 0.8)` }}
          >
            <p className="text-sm text-[#f5a623]">
              <strong>Note:</strong> Currently showing example content.
            </p>
          </div>
        </div>
      )}
      {notes.map((note) => (
        <div key={note.id} className="relative transition-all duration-500 animate-fadeIn">
          <div className="text-xs mb-1 tracking-wide text-[#7a9e9f]">SEQ1</div>
          <div
            className="max-w-3xl p-4 relative transition-all duration-300 bg-[#1a1015] crt-flicker"
            style={{ boxShadow: `inset 0 0 0 1px rgba(240, 230, 200, 0.1), inset 0 0 0 2px rgba(58, 42, 48, 0.8)` }}
          >
            <p className="text-sm text-[#f0e6c8]">{note.content.replace("[MOCK DATA] ", "")}</p>
            <div className="mt-2 text-xs text-[#a09080]">{formatRelativeTime(note.created_at)}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
