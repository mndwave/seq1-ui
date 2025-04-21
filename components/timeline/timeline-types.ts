/**
 * Core types for the timeline component
 */

/**
 * Represents a section in the timeline
 */
export interface TimelineSection {
  /** Unique identifier for the section */
  id: string
  /** Display name of the section */
  name: string
  /** Length of the section in bars */
  length: number
  /** Color of the section */
  color?: string
  /** Flag to track if the section is new */
  isNew?: boolean
  /** Flag to track if the section is moving */
  isMoving?: boolean
}

export interface LoopRegion {
  startBar: number
  endBar: number
}

/**
 * Props for the Timeline component
 */
export interface TimelineProps {
  /** Callback when a section is selected */
  onSectionSelect?: (sectionId: string) => void
  /** Whether the timeline is currently playing */
  isPlaying?: boolean
  isLooping?: boolean
  onLoopChange?: (isLooping: boolean) => void
  /** Additional CSS classes */
  className?: string
  /** ID of the selected device */
  selectedDeviceId?: string | null
  /** Initial sections to populate the timeline with */
  initialSections?: any[]
  loopRegion: LoopRegion | null
  setLoopRegion: (loopRegion: LoopRegion | null) => void
}

/**
 * Animation state for buttons
 */
export type ButtonAnimationState = {
  [key: string]: { action: "copy" | "delete" | "add"; state: "grow" | "shrink" }
}
