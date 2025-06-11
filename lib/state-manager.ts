// lib/state-manager.ts
const DEBUG = process.env.NODE_ENV === "development"

function debugLog(...args: any[]) {
  if (DEBUG) {
    console.log("[StateManager]", ...args)
  }
}

// Define more specific types for your state
interface TransportState {
  isPlaying: boolean
  bpm: number
  timeSignature: string // e.g., "4/4"
  position: number // e.g., in seconds or beats
}

interface DeviceState {
  id: string
  name: string
  connected: boolean
  // other device properties
}

interface ChatMessageState {
  id: string
  sender: string
  content: string
  timestamp: string
}

interface ChatState {
  messages: ChatMessageState[]
  isLoading: boolean
}

interface ProjectState {
  id: string | null
  name: string | null
  // other project properties
}

interface ProjectsState {
  current: ProjectState | null
  list: ProjectState[] // Assuming list items are also ProjectState or a summary
}

export interface AppState {
  transport: TransportState
  devices: DeviceState[]
  chat: ChatState
  projects: ProjectsState
  // Add other top-level state domains as needed
}

type StateListener = (newState: AppState) => void

export class StateManager {
  private state: AppState
  private listeners: Set<StateListener>

  constructor() {
    this.state = {
      transport: {
        isPlaying: false,
        bpm: 120,
        timeSignature: "4/4",
        position: 0,
      },
      devices: [],
      chat: {
        messages: [],
        isLoading: false,
      },
      projects: {
        current: null,
        list: [],
      },
    }
    this.listeners = new Set()
    debugLog("StateManager initialized with initial state:", this.state)
  }

  // Partial<AppState> allows updating only a part of the state
  // K extends keyof AppState allows type-safe updates for specific domains
  setState<K extends keyof AppState>(domain: K, domainState: Partial<AppState[K]>): void
  setState(newState: Partial<AppState>): void
  setState<K extends keyof AppState>(
    domainOrNewState: K | Partial<AppState>,
    domainState?: Partial<AppState[K]>,
  ): void {
    if (typeof domainOrNewState === "string" && domainState !== undefined) {
      const domain = domainOrNewState as K
      this.state = {
        ...this.state,
        [domain]: {
          ...this.state[domain],
          ...domainState,
        },
      }
      debugLog(`StateManager: Updated domain '${domain}'`, this.state[domain])
    } else {
      this.state = {
        ...this.state,
        ...(domainOrNewState as Partial<AppState>),
      }
      debugLog("StateManager: Updated state with partial object", domainOrNewState)
    }
    this.notifyListeners()
  }

  getState(): AppState {
    return this.state
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener)
    debugLog("StateManager: New listener subscribed. Total:", this.listeners.size)
    // Optionally, call the listener with the current state immediately upon subscription
    // listener(this.state);
    return () => {
      this.listeners.delete(listener)
      debugLog("StateManager: Listener unsubscribed. Total:", this.listeners.size)
    }
  }

  private notifyListeners(): void {
    debugLog(`StateManager: Notifying ${this.listeners.size} listeners.`)
    this.listeners.forEach((listener) => {
      try {
        listener(this.state)
      } catch (error) {
        console.error("Error in StateManager listener:", error)
      }
    })
  }
}

// Export a singleton instance as per the document
export const stateManager = new StateManager()
