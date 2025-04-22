"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Repeat, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import SaveModal from "./save-modal"
import SaveAsModal from "./save-as-modal"
import OpenModal from "./open-modal"
import ExportModal from "./export-export-modal"
import BpmModal from "./bpm-modal"
import TimeSignatureModal from "./time-signature-modal"
import NewProjectModal from "./new-project-modal"
import CloseProjectModal from "./close-project-modal"
import AnimatedLogo from "./animated-logo"
import DirectProjectMenu from "./direct-project-menu"
import type { ProjectAction } from "@/lib/types"
import { useLogoAnimation } from "@/lib/logo-animation-context"
import { useTransport } from "@/hooks/use-transport"
// Import the MndwaveButton component
import MndwaveButton from "@/components/mndwave-button"

// Update the GlobalTransport component to accept the hardware connection state
interface GlobalTransportProps {
  onToggleEmptyDeviceRack?: () => void
  isHardwareConnected?: boolean
  onLoopChange?: (isLooping: boolean) => void
}

/**
 * GlobalTransport component
 *
 * Main control bar for the SEQ1 application that includes:
 * - Animated logo
 * - Transport controls (play/loop)
 * - BPM and time signature controls
 * - Project menu
 * - Undo/Redo controls
 */
export default function GlobalTransport({
  onToggleEmptyDeviceRack,
  isHardwareConnected = false,
  onLoopChange,
}: GlobalTransportProps) {
  // Use the transport hook to get and update transport state
  const { transportState, togglePlayback, toggleLooping, setBpm, setTimeSignature } = useTransport()

  // Destructure transport state
  const { isPlaying, isLooping, bpm, timeSignature } = transportState

  // Consolidated modal state
  const [modals, setModals] = useState({
    save: false,
    saveAs: false,
    open: false,
    export: false,
    bpm: false,
    timeSignature: false,
    newProject: false,
    closeProject: false,
  })

  // History state for undo/redo
  const [history, setHistory] = useState({
    canUndo: false,
    canRedo: false,
  })

  // Project state
  const [projectState, setProjectState] = useState({
    name: "UNTITLED PROJECT",
    hasBeenSaved: false,
    showSaveSuccess: false,
  })

  // Inside the component, replace the logoAnimationComplete state with:
  const { hasLogoAnimationPlayed, setLogoAnimationPlayed } = useLogoAnimation()
  const [logoAnimationComplete, setLogoAnimationComplete] = useState(hasLogoAnimationPlayed)

  // Add a ref to the component
  const modalRef = useRef<HTMLDivElement>(null)

  // For demo purposes, we'll simulate history state changes
  // In a real implementation, this would be connected to actual state changes
  useEffect(() => {
    // Simulate history becoming available after a short delay
    const timer = setTimeout(() => {
      setHistory({ canUndo: true, canRedo: false })
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  // Update the useEffect for logo animation to be more subtle and valve-like
  useEffect(() => {
    // Only set up the interval if the initial animation has completed
    let interval: NodeJS.Timeout

    const pulseLogo = () => {
      if (modalRef.current) {
        const logo = modalRef.current.querySelector(".seq1-logo-glow")
        if (logo) {
          logo.classList.add("logo-pulse-highlight")
          setTimeout(() => {
            logo.classList.remove("logo-pulse-highlight")
          }, 2000)
        }
      }
    }

    if (logoAnimationComplete) {
      interval = setInterval(pulseLogo, 35000) // 35 seconds interval

      return () => clearInterval(interval)
    }
  }, [logoAnimationComplete])

  // Replace the handleLogoAnimationComplete function with:
  const handleLogoAnimationComplete = () => {
    setLogoAnimationPlayed()
    setLogoAnimationComplete(true)
  }

  /**
   * Handle loop toggle and notify parent component
   */
  const handleLoopToggle = async () => {
    // Toggle loop state via API
    await toggleLooping()

    // Notify parent component about loop state change if needed
    if (onLoopChange) {
      onLoopChange(!isLooping)
    }
  }

  /**
   * Updates BPM value
   */
  const handleBpmSave = async (newBpm: number) => {
    await setBpm(newBpm)
    closeAllModals()
  }

  /**
   * Updates time signature value
   */
  const handleTimeSignatureSave = async (newTimeSignature: string) => {
    await setTimeSignature(newTimeSignature)
    closeAllModals()
  }

  /**
   * Closes all modals
   */
  const closeAllModals = () => {
    setModals({
      save: false,
      saveAs: false,
      open: false,
      export: false,
      bpm: false,
      timeSignature: false,
      newProject: false,
      closeProject: false,
    })
  }

  /**
   * Opens a specific modal
   */
  const openModal = (modalName: keyof typeof modals) => {
    console.log(`Opening modal: ${modalName}`)

    // First close all modals
    const newModalState = {
      save: false,
      saveAs: false,
      open: false,
      export: false,
      bpm: false,
      timeSignature: false,
      newProject: false,
      closeProject: false,
    }

    // Then open the requested one
    newModalState[modalName] = true
    setModals(newModalState)
  }

  /**
   * Handles project menu actions
   */
  const handleMenuAction = (action: ProjectAction) => {
    console.log(`Menu action triggered: ${action}`)

    switch (action) {
      case "new":
        openModal("newProject")
        break
      case "open":
        openModal("open")
        break
      case "save":
        // If project has been saved before, show success indicator
        if (projectState.hasBeenSaved) {
          handleSaveSuccess()
        } else {
          // Otherwise show the save modal for first-time save
          openModal("save")
        }
        break
      case "saveAs":
        openModal("saveAs")
        break
      case "export":
        openModal("export")
        break
      case "close":
        openModal("closeProject")
        break
    }
  }

  /**
   * Handles successful save with visual feedback
   */
  const handleSaveSuccess = () => {
    // Show save success indicator
    setProjectState((prev) => ({
      ...prev,
      showSaveSuccess: true,
    }))

    // Hide it after 2 seconds
    setTimeout(() => {
      setProjectState((prev) => ({
        ...prev,
        showSaveSuccess: false,
      }))
    }, 2000)
  }

  /**
   * Handles save completion
   */
  const handleSaveComplete = (filename: string) => {
    setProjectState({
      name: filename,
      hasBeenSaved: true,
      showSaveSuccess: true,
    })

    // Hide success indicator after 2 seconds
    setTimeout(() => {
      setProjectState((prev) => ({
        ...prev,
        showSaveSuccess: false,
      }))
    }, 2000)

    closeAllModals()
  }

  /**
   * Handles undo action
   */
  const handleUndo = () => {
    if (!history.canUndo || !isHardwareConnected) return

    // In a real implementation, this would perform the actual undo
    console.log("Undo action")

    // For demo purposes, we'll simulate state changes
    setHistory({ canUndo: false, canRedo: true })
  }

  /**
   * Handles redo action
   */
  const handleRedo = () => {
    if (!history.canRedo || !isHardwareConnected) return

    // In a real implementation, this would perform the actual redo
    console.log("Redo action")

    // For demo purposes, we'll simulate state changes
    setHistory({ canUndo: true, canRedo: false })
  }

  // Add a keyboard shortcut for toggling the empty device rack (Alt+Shift+E)
  // This is a developer feature and won't be obvious to users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+Shift+E to toggle empty device rack
      if (e.altKey && e.shiftKey && e.key === "E" && onToggleEmptyDeviceRack) {
        onToggleEmptyDeviceRack()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onToggleEmptyDeviceRack])

  const [bpmModalOpen, setBpmModalOpen] = useState(false)
  const [timeSignatureModalOpen, setTimeSignatureModalOpen] = useState(false)

  return (
    <div className="h-16 border-b border-[#3a2a30] flex items-center px-4 bg-[#2a1a20] relative z-20" ref={modalRef}>
      <div className="flex-1 flex items-center justify-between relative z-10">
        <div className="flex items-center">
          {/* Ensure the AnimatedLogo component is using the skipAnimation prop correctly */}
          <AnimatedLogo
            className="mr-8 seq1-logo-glow"
            onAnimationComplete={handleLogoAnimationComplete}
            skipAnimation={hasLogoAnimationPlayed}
          />

          {/* Update the play and loop buttons to be disabled when hardware isn't connected */}
          <div className="flex space-x-3">
            {/* Play button - more tactile version */}
            <button
              onClick={togglePlayback}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none button-tactile",
                isPlaying
                  ? "bg-[#1a1015] border border-[#3a2a30]"
                  : "bg-[#2a1a20] hover:bg-[#3a2a30] border border-[#3a2a30]",
                !isHardwareConnected ? "opacity-50 cursor-not-allowed" : "",
              )}
              aria-label={isPlaying ? "Pause" : "Play"}
              aria-pressed={isPlaying}
              disabled={!isHardwareConnected}
            >
              {/* Button inset effect when active */}
              <div
                className={cn(
                  "absolute inset-0 rounded-full",
                  isPlaying ? "bg-[#1a1015] border border-[#3a2a30] shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]" : "",
                )}
              />

              {/* Subtle glow effect when active */}
              {isPlaying && (
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    boxShadow: "0 0 8px rgba(80, 220, 100, 0.4), inset 0 0 4px rgba(80, 220, 100, 0.3)",
                    pointerEvents: "none",
                    zIndex: 5,
                  }}
                />
              )}

              {/* Icon */}
              <Play
                size={20}
                className={cn(
                  "relative z-10 transition-all duration-300",
                  isPlaying ? "text-[#50dc64] transform scale-[0.95] animate-play-pulse" : "text-gray-400",
                )}
              />
            </button>

            {/* Loop button - more tactile version */}
            <button
              onClick={handleLoopToggle}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none button-tactile",
                "bg-[#2a1a20] hover:bg-[#3a2a30] border border-[#3a2a30]",
                !isHardwareConnected ? "opacity-50 cursor-not-allowed" : "",
              )}
              aria-label="Toggle Loop"
              aria-pressed={isLooping}
              disabled={!isHardwareConnected}
            >
              {/* Icon */}
              <Repeat
                size={20}
                className={cn(
                  "relative z-10 transition-colors duration-300",
                  isLooping ? "text-[#4287f5] transform scale-[0.95]" : "text-gray-400",
                )}
              />
            </button>
          </div>

          {/* Interactive BPM and time signature display */}
          {/* Update the BPM and time signature buttons to be disabled when hardware isn't connected */}
          <div className="ml-6 flex space-x-2">
            <button
              onClick={() => setBpmModalOpen(true)}
              className={`segmented-display rounded-sm text-sm tracking-wide px-3 py-1 hover:bg-[#e0d6b8] transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-[#3a2a30] ${!isHardwareConnected ? "opacity-50 cursor-not-allowed" : ""}`}
              aria-label="Change BPM"
              disabled={!isHardwareConnected}
            >
              <span className="text-[#2a1a20]">{bpm} BPM</span>
            </button>

            <button
              onClick={() => setTimeSignatureModalOpen(true)}
              className={`segmented-display rounded-sm text-sm tracking-wide px-3 py-1 hover:bg-[#e0d6b8] transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-[#3a2a30] ${!isHardwareConnected ? "opacity-50 cursor-not-allowed" : ""}`}
              aria-label="Change Time Signature"
              disabled={!isHardwareConnected}
            >
              <span className="text-[#2a1a20]">{timeSignature}</span>
            </button>
          </div>
        </div>

        {/* Right side controls: Undo/Redo and Project menu */}
        <div className="flex items-center space-x-4">
          {/* Undo/Redo buttons - just the icons that light up */}
          <div className="flex items-center space-x-3 mr-1">
            {/* Undo button - Bauhaus/brutalist style */}
            <button
              onClick={handleUndo}
              className="transition-all duration-300 p-1 focus:outline-none focus-visible:outline-none"
              disabled={!history.canUndo || !isHardwareConnected}
              aria-label="Undo"
              title="Undo"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {/* Custom geometric undo icon */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={cn(
                  "transition-colors duration-300",
                  history.canUndo && isHardwareConnected ? "text-[#4287f5]" : "text-gray-400 opacity-50",
                )}
              >
                <path
                  d="M9 14L4 9L9 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                />
                <path
                  d="M4 9H16C18.7614 9 21 11.2386 21 14C21 16.7614 18.7614 19 16 19H10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                />
              </svg>
            </button>

            {/* Redo button - Bauhaus/brutalist style */}
            <button
              onClick={handleRedo}
              className="transition-all duration-300 p-1 focus:outline-none focus-visible:outline-none"
              disabled={!history.canRedo || !isHardwareConnected}
              aria-label="Redo"
              title="Redo"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {/* Custom geometric redo icon */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={cn(
                  "transition-colors duration-300",
                  history.canRedo && isHardwareConnected ? "text-[#4287f5]" : "text-gray-400 opacity-50",
                )}
              >
                <path
                  d="M15 14L20 9L15 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                />
                <path
                  d="M20 9H8C5.23858 9 3 11.2386 3 14C3 16.7614 5.23858 19 8 19H14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="square"
                  strokeLinejoin="miter"
                />
              </svg>
            </button>
          </div>

          {/* Project menu button with save success indicator */}
          <div className="flex items-center">
            <MndwaveButton />
            <DirectProjectMenu onAction={handleMenuAction} />

            {/* Save success indicator */}
            {projectState.showSaveSuccess && (
              <div className="absolute -top-1 -right-1 bg-[#50dc64] rounded-full p-1 animate-fadeOut">
                <Check size={12} className="text-[#1a1015]" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <SaveModal
        isOpen={modals.save}
        onClose={closeAllModals}
        isFirstSave={!projectState.hasBeenSaved}
        projectName={projectState.name}
      />
      <SaveAsModal isOpen={modals.saveAs} onClose={closeAllModals} />
      <OpenModal isOpen={modals.open} onClose={closeAllModals} />
      <ExportModal isOpen={modals.export} onClose={closeAllModals} />
      <BpmModal isOpen={modals.bpm} onClose={closeAllModals} currentBpm={bpm} onSave={handleBpmSave} />
      <TimeSignatureModal
        isOpen={modals.timeSignature}
        onClose={closeAllModals}
        currentTimeSignature={timeSignature}
        onSave={handleTimeSignatureSave}
      />
      <NewProjectModal isOpen={modals.newProject} onClose={closeAllModals} />
      <CloseProjectModal isOpen={modals.closeProject} onClose={closeAllModals} />
    </div>
  )
}
