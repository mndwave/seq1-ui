"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
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
import MndwaveButton from "@/components/mndwave-button"

interface GlobalTransportProps {
  onToggleEmptyDeviceRack?: () => void
  onLoopChange?: (isLooping: boolean) => void
}

function GlobalTransport({ onToggleEmptyDeviceRack, onLoopChange }: GlobalTransportProps) {
  const { transportState, togglePlayback, toggleLooping, setBpm, setTimeSignature } = useTransport()
  const { isPlaying, isLooping, bpm, timeSignature } = transportState || {}

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

  const [history, setHistory] = useState({
    canUndo: false,
    canRedo: false,
  })

  const [projectState, setProjectState] = useState({
    name: "UNTITLED PROJECT",
    hasBeenSaved: false,
    showSaveSuccess: false,
  })

  const { hasLogoAnimationPlayed, setLogoAnimationPlayed } = useLogoAnimation()
  const [logoAnimationComplete, setLogoAnimationComplete] = useState(hasLogoAnimationPlayed)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setHistory({ canUndo: true, canRedo: false })
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined
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
      interval = setInterval(pulseLogo, 35000)
      return () => clearInterval(interval)
    }
  }, [logoAnimationComplete])

  const handleLogoAnimationComplete = () => {
    setLogoAnimationPlayed()
    setLogoAnimationComplete(true)
  }

  const handleLoopToggle = useCallback(async () => {
    if (toggleLooping) {
      const newTransportState = await toggleLooping()
      if (onLoopChange && newTransportState) {
        onLoopChange(newTransportState.isLooping)
      }
    }
  }, [toggleLooping, onLoopChange])

  const handleBpmSave = useCallback(
    async (newBpm: number) => {
      if (setBpm) {
        await setBpm(newBpm)
        setModals((prev: typeof modals) => ({ ...prev, bpm: false }))
      }
    },
    [setBpm],
  )

  const handleTimeSignatureSave = useCallback(
    async (newTimeSignature: string) => {
      if (setTimeSignature) {
        await setTimeSignature(newTimeSignature)
        setModals((prev: typeof modals) => ({ ...prev, timeSignature: false }))
      }
    },
    [setTimeSignature],
  )

  const closeAllModals = useCallback(() => {
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
  }, [])

  const openModal = useCallback((modalName: keyof typeof modals) => {
    setModals((prev: typeof modals) => {
      const newState = { ...prev }
      Object.keys(newState).forEach((key) => {
        ;(newState as any)[key as keyof typeof modals] = false
      })
      newState[modalName] = true
      return newState
    })
  }, [])

  const handleSaveSuccess = useCallback(() => {
    setProjectState((prev: typeof projectState) => ({ ...prev, showSaveSuccess: true }))
    setTimeout(() => {
      setProjectState((prev: typeof projectState) => ({ ...prev, showSaveSuccess: false }))
    }, 2000)
  }, [])

  const handleMenuAction = useCallback(
    (action: ProjectAction) => {
      switch (action) {
        case "new":
          openModal("newProject")
          break
        case "open":
          openModal("open")
          break
        case "save":
          if (projectState.hasBeenSaved) {
            handleSaveSuccess()
            console.log("Project saved (simulated)")
          } else {
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
    },
    [openModal, projectState.hasBeenSaved, handleSaveSuccess],
  )

  const handleSaveComplete = useCallback(
    (filename: string, isSaveAs = false) => {
      setProjectState({
        name: filename.toUpperCase(),
        hasBeenSaved: true,
        showSaveSuccess: true,
      })
      setTimeout(() => {
        setProjectState((prev) => ({ ...prev, showSaveSuccess: false }))
      }, 2000)
      closeAllModals()
      console.log(`Project ${isSaveAs ? "saved as" : "saved"}: ${filename} (simulated)`)
    },
    [closeAllModals],
  )

  const handleUndo = useCallback(() => {
    if (!history.canUndo) return
    console.log("Undo action")
    setHistory({ canUndo: false, canRedo: true })
  }, [history.canUndo])

  const handleRedo = useCallback(() => {
    if (!history.canRedo) return
    console.log("Redo action")
    setHistory({ canUndo: true, canRedo: false })
  }, [history.canRedo])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.key === "E" && onToggleEmptyDeviceRack) {
        onToggleEmptyDeviceRack()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onToggleEmptyDeviceRack])

  const currentBpm = bpm ?? 120
  const currentTimeSignature = timeSignature ?? "4/4"
  const currentIsPlaying = isPlaying ?? false
  const currentIsLooping = isLooping ?? false

  return (
    <div className="h-16 border-b border-[#3a2a30] flex items-center px-4 bg-[#2a1a20] relative z-20" ref={modalRef}>
      <div className="flex-1 flex items-center justify-between relative z-10">
        <div className="flex items-center">
          <div className="mr-8 relative isolate" style={{ pointerEvents: "auto", cursor: "default", zIndex: 25 }}>
            <AnimatedLogo
              className="seq1-logo-glow"
              onAnimationComplete={handleLogoAnimationComplete}
              skipAnimation={hasLogoAnimationPlayed}
            />
          </div>
          <div className="flex space-x-3 relative" style={{ zIndex: 15 }}>
            <button
              onClick={togglePlayback}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none button-tactile relative",
                currentIsPlaying
                  ? "bg-[#1a1015] border border-[#3a2a30]"
                  : "bg-[#2a1a20] hover:bg-[#3a2a30] border border-[#3a2a30]",
              )}
              style={{ zIndex: 15 }}
              aria-label={currentIsPlaying ? "Pause transport" : "Play transport"}
              aria-pressed={currentIsPlaying}
              disabled={!togglePlayback}
            >
              <div
                className={cn(
                  "absolute inset-0 rounded-full",
                  currentIsPlaying
                    ? "bg-[#1a1015] border border-[#3a2a30] shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]"
                    : "",
                )}
              />
              {currentIsPlaying && (
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    boxShadow: "0 0 8px rgba(80, 220, 100, 0.4), inset 0 0 4px rgba(80, 220, 100, 0.3)",
                    pointerEvents: "none",
                    zIndex: 5,
                  }}
                />
              )}
              <Play
                size={20}
                className={cn(
                  "relative z-10 transition-all duration-300",
                  currentIsPlaying ? "text-[#50dc64] transform scale-[0.95] animate-play-pulse" : "text-gray-400",
                )}
              />
            </button>
            <button
              onClick={handleLoopToggle}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none button-tactile",
                "bg-[#2a1a20] hover:bg-[#3a2a30] border border-[#3a2a30]",
              )}
              aria-label="Toggle loop"
              aria-pressed={currentIsLooping}
              disabled={!toggleLooping}
            >
              <Repeat
                size={20}
                className={cn(
                  "relative z-10 transition-colors duration-300",
                  currentIsLooping ? "text-[#4287f5] transform scale-[0.95]" : "text-gray-400",
                )}
              />
            </button>
          </div>
          <div className="ml-6 flex space-x-2">
            <button
              onClick={() => openModal("bpm")}
              className={`segmented-display rounded-sm text-sm tracking-wide px-3 py-1 hover:bg-[#e0d6b8] transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-[#3a2a30]`}
              aria-label={`Change BPM, current value ${currentBpm}`}
            >
              <span className="text-[#2a1a20]">{currentBpm} BPM</span>
            </button>
            <button
              onClick={() => openModal("timeSignature")}
              className={`segmented-display rounded-sm text-sm tracking-wide px-3 py-1 hover:bg-[#e0d6b8] transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-[#3a2a30]`}
              aria-label={`Change time signature, current value ${currentTimeSignature.replace("/", " ")}`}
            >
              <span className="text-[#2a1a20]">{currentTimeSignature}</span>
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 mr-1">
            <button
              onClick={handleUndo}
              className="transition-all duration-300 p-1 focus:outline-none focus-visible:outline-none"
              disabled={!history.canUndo}
              aria-label="Undo last action"
              title="Undo"
              style={{ WebkitTapHighlightColor: "transparent" }} // Corrected to PascalCase
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={cn(
                  "transition-colors duration-300",
                  history.canUndo ? "text-[#4287f5]" : "text-gray-400 opacity-50",
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
            <button
              onClick={handleRedo}
              className="transition-all duration-300 p-1 focus:outline-none focus-visible:outline-none"
              disabled={!history.canRedo}
              aria-label="Redo last undone action"
              title="Redo"
              style={{ WebkitTapHighlightColor: "transparent" }} // Corrected to PascalCase
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={cn(
                  "transition-colors duration-300",
                  history.canRedo ? "text-[#4287f5]" : "text-gray-400 opacity-50",
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
          <div className="flex items-center relative">
            <MndwaveButton />
            <DirectProjectMenu onAction={handleMenuAction} />
            {projectState.showSaveSuccess && (
              <div className="absolute -top-2 -right-2 bg-[#50dc64] rounded-full p-1 animate-fadeOut z-10">
                <Check size={12} className="text-[#1a1015]" />
              </div>
            )}
          </div>
        </div>
      </div>

      <SaveModal
        isOpen={modals.save}
        onClose={closeAllModals}
        onSave={(filename) => handleSaveComplete(filename, false)}
        isFirstSave={!projectState.hasBeenSaved}
        projectName={projectState.name}
      />
      <SaveAsModal
        isOpen={modals.saveAs}
        onClose={closeAllModals}
        onSave={(filename) => handleSaveComplete(filename, true)}
      />
      <OpenModal isOpen={modals.open} onClose={closeAllModals} />
      <ExportModal isOpen={modals.export} onClose={closeAllModals} />
      <BpmModal 
        isOpen={modals.bpm} 
        onClose={() => setModals((prev: typeof modals) => ({ ...prev, bpm: false }))} 
        currentBpm={currentBpm} 
        onSave={handleBpmSave} 
      />
      <TimeSignatureModal
        isOpen={modals.timeSignature}
        onClose={() => setModals((prev: typeof modals) => ({ ...prev, timeSignature: false }))}
        currentTimeSignature={currentTimeSignature}
        onSave={handleTimeSignatureSave}
      />
      <NewProjectModal isOpen={modals.newProject} onClose={closeAllModals} />
      <CloseProjectModal isOpen={modals.closeProject} onClose={closeAllModals} />
    </div>
  )
}

const MemoizedGlobalTransport = React.memo(GlobalTransport)
export default MemoizedGlobalTransport
