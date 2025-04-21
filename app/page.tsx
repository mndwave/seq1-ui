"use client"

import { useState, useEffect } from "react"
import DeviceRack from "@/components/device-rack"
import GlobalTransport from "@/components/global-transport"
import ChatWindow from "@/components/chat-window"
import SmallScreenMessage from "@/components/small-screen-message"
import EarlyAccessAnnouncement from "@/components/early-access-announcement"
import AppLoader from "@/components/app-loader"
import TimelineContainer from "@/components/timeline/timeline-container"
import { devices } from "@/lib/mock-data"

export default function Home() {
  // Set to true to use the single DATA indicator, false for separate IN/OUT indicators
  const useSingleDataIndicator = true
  const [showEmptyDeviceRack, setShowEmptyDeviceRack] = useState(false)
  const [isSmallScreen, setIsSmallScreen] = useState(false)
  // Track if hardware is connected - this would be determined by your MIDI state in a real implementation
  const [isHardwareConnected, setIsHardwareConnected] = useState(true) // Set to true for testing
  // State for the early access announcement
  const [showAnnouncement, setShowAnnouncement] = useState(true)
  // State to track if the app is mounted
  const [isMounted, setIsMounted] = useState(false)
  // State to track if timeline is visible
  const [showTimeline, setShowTimeline] = useState(true)
  // State to track selected device for timeline
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  // State to track if looping is enabled
  const [isLooping, setIsLooping] = useState(true)

  // Set mounted state after component mounts
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1024)
    }

    // Initial check
    checkScreenSize()

    // Add resize listener
    window.addEventListener("resize", checkScreenSize)

    // Cleanup
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  // Don't render anything until mounted to prevent hydration issues
  if (!isMounted) {
    return null
  }

  if (isSmallScreen) {
    return (
      <>
        <SmallScreenMessage />
        <EarlyAccessAnnouncement isOpen={showAnnouncement} onClose={() => setShowAnnouncement(false)} />
      </>
    )
  }

  return (
    <>
      <AppLoader />
      <div className="desktop-ui">
        <main className="flex flex-col h-screen bg-[#1a1015] text-[#f0e6c8] overflow-hidden">
          <GlobalTransport
            onToggleEmptyDeviceRack={() => {
              setShowEmptyDeviceRack(!showEmptyDeviceRack)
            }}
            isHardwareConnected={isHardwareConnected}
            onLoopChange={setIsLooping}
          />
          <div className="flex flex-1 overflow-hidden border-t border-[#3a2a30]">
            <DeviceRack
              devices={showEmptyDeviceRack ? [] : devices}
              useSingleIndicator={useSingleDataIndicator}
              onHardwareConnectionChange={setIsHardwareConnected}
              onDeviceSelect={setSelectedDeviceId}
              selectedDeviceId={selectedDeviceId}
            />
            <ChatWindow isHardwareConnected={isHardwareConnected} />
          </div>

          {/* Timeline component - now spans full width with proper height */}
          {showTimeline && (
            <TimelineContainer
              className="h-20 border-t border-[#3a2a30]"
              selectedDeviceId={selectedDeviceId}
              onLoopChange={setIsLooping}
            />
          )}

          {/* Early Access Announcement - visible on all screen sizes */}
          <EarlyAccessAnnouncement isOpen={showAnnouncement} onClose={() => setShowAnnouncement(false)} />
        </main>
      </div>
    </>
  )
}
