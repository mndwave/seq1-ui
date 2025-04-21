/**
 * Core types used throughout the SEQ1 application
 */

/**
 * Represents a hardware device connected to SEQ1
 */
export interface Device {
  /** Unique identifier for the device */
  id: string
  /** Display name of the device */
  name: string
  /** Category of the device (e.g., "Analog Polysynth") */
  type: string
  /** MIDI port the device is connected to */
  port: string
  /** Whether the device is currently connected */
  isConnected: boolean
  /** Whether the device has patch storage capabilities */
  hasPatches: boolean
  /** Number of patches if applicable */
  patchCount?: number
  /** Current MIDI activity status */
  midiActivity?: {
    in: boolean
    out: boolean
  }
  /** Whether the device was manually added or auto-detected */
  isManuallyAdded?: boolean
}

/**
 * Message in the chat interface
 */
export interface Message {
  /** Unique identifier for the message */
  id: string
  /** Content of the message */
  content: string
  /** Who sent the message */
  sender: "user" | "assistant"
  /** Optional type for styling and categorization */
  type?: "midi" | "patch" | "config"
}

/**
 * Animation states for the SEQ1 logo
 */
export type LogoAnimationState = "outline" | "pulsing" | "warming"

/**
 * Project menu actions
 */
export type ProjectAction = "new" | "open" | "save" | "saveAs" | "export" | "close"
