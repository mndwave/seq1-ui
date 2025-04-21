/**
 * MIDI Service for SEQ1
 *
 * Handles WebMIDI access, permissions, and device management
 */

// Define types for MIDI state
export interface MIDIConnectionState {
  supported: boolean
  permissionState: "granted" | "denied" | "prompt" | "unsupported"
  devices: MIDIInput[] | null
  outputs: MIDIOutput[] | null
  error: string | null
  isInitializing: boolean
}

// Create a class to handle MIDI functionality
export class MIDIService {
  private static instance: MIDIService
  private midiAccess: MIDIAccess | null = null
  private connectionState: MIDIConnectionState = {
    supported: false,
    permissionState: "unsupported",
    devices: null,
    outputs: null,
    error: null,
    isInitializing: false,
  }
  private stateChangeCallbacks: ((state: MIDIConnectionState) => void)[] = []
  private hasAttemptedInitialization = false

  // Singleton pattern
  public static getInstance(): MIDIService {
    if (!MIDIService.instance) {
      MIDIService.instance = new MIDIService()
    }
    return MIDIService.instance
  }

  private constructor() {
    // Check if WebMIDI is supported
    this.connectionState.supported = typeof navigator !== "undefined" && "requestMIDIAccess" in navigator

    // If we're in the browser and MIDI is supported, check permission state
    if (typeof window !== "undefined" && this.connectionState.supported) {
      this.checkPermissionState()
    }
  }

  /**
   * Check the current permission state for MIDI access
   */
  private async checkPermissionState() {
    try {
      // Use Permissions API if available
      if ("permissions" in navigator) {
        const permissionStatus = await navigator.permissions.query({ name: "midi" as PermissionName })
        this.connectionState.permissionState = permissionStatus.state as "granted" | "denied" | "prompt"

        // Listen for permission changes
        permissionStatus.addEventListener("change", () => {
          this.connectionState.permissionState = permissionStatus.state as "granted" | "denied" | "prompt"
          this.notifyStateChange()

          // If permission was granted, initialize MIDI
          if (permissionStatus.state === "granted" && !this.midiAccess) {
            this.initializeMIDI()
          }
        })

        // If permission is already granted, initialize MIDI
        if (permissionStatus.state === "granted" && !this.hasAttemptedInitialization) {
          this.hasAttemptedInitialization = true
          this.initializeMIDI()
        }
      } else {
        // If Permissions API is not available, set to prompt
        this.connectionState.permissionState = "prompt"
      }
    } catch (error) {
      console.warn("Could not check MIDI permission state:", error)
      // Default to 'prompt' if we can't determine
      this.connectionState.permissionState = "prompt"
    }

    this.notifyStateChange()
  }

  /**
   * Request MIDI access from the browser
   */
  public async requestMIDIAccess(sysex = false): Promise<boolean> {
    if (!this.connectionState.supported) {
      this.connectionState.error = "WebMIDI is not supported in this browser"
      this.notifyStateChange()
      return false
    }

    // Set initializing state
    this.connectionState.isInitializing = true
    this.notifyStateChange()

    try {
      this.midiAccess = await navigator.requestMIDIAccess({ sysex })

      // Update connection state
      this.connectionState.permissionState = "granted"
      this.connectionState.error = null
      this.connectionState.isInitializing = false

      // Set up device lists
      this.updateDeviceLists()

      // Listen for device connection/disconnection
      this.midiAccess.addEventListener("statechange", this.handleStateChange.bind(this))

      this.notifyStateChange()
      return true
    } catch (error) {
      console.error("Error accessing MIDI devices:", error)
      this.connectionState.error = error instanceof Error ? error.message : "Failed to access MIDI devices"
      this.connectionState.permissionState = "denied"
      this.connectionState.isInitializing = false
      this.notifyStateChange()
      return false
    }
  }

  /**
   * Handle MIDI state changes (device connect/disconnect)
   */
  private handleStateChange(event: MIDIConnectionEvent) {
    console.log("MIDI state change:", event)
    this.updateDeviceLists()
    this.notifyStateChange()
  }

  /**
   * Update the lists of MIDI inputs and outputs
   */
  private updateDeviceLists() {
    if (!this.midiAccess) return

    // Convert Maps to arrays for easier consumption
    this.connectionState.devices = Array.from(this.midiAccess.inputs.values())
    this.connectionState.outputs = Array.from(this.midiAccess.outputs.values())
  }

  /**
   * Subscribe to MIDI state changes
   */
  public subscribe(callback: (state: MIDIConnectionState) => void): () => void {
    this.stateChangeCallbacks.push(callback)

    // Immediately notify with current state
    callback({ ...this.connectionState })

    // Return unsubscribe function
    return () => {
      this.stateChangeCallbacks = this.stateChangeCallbacks.filter((cb) => cb !== callback)
    }
  }

  /**
   * Notify all subscribers of state changes
   */
  private notifyStateChange() {
    const state = { ...this.connectionState }
    this.stateChangeCallbacks.forEach((callback) => callback(state))
  }

  /**
   * Initialize MIDI if permission is already granted
   */
  private async initializeMIDI() {
    try {
      this.connectionState.isInitializing = true
      this.notifyStateChange()

      this.midiAccess = await navigator.requestMIDIAccess()
      this.updateDeviceLists()
      this.midiAccess.addEventListener("statechange", this.handleStateChange.bind(this))

      this.connectionState.isInitializing = false
      this.notifyStateChange()
    } catch (error) {
      console.error("Error initializing MIDI:", error)
      this.connectionState.isInitializing = false
      this.connectionState.error = error instanceof Error ? error.message : "Failed to initialize MIDI"
      this.notifyStateChange()
    }
  }

  /**
   * Get the current MIDI state
   */
  public getState(): MIDIConnectionState {
    return { ...this.connectionState }
  }

  /**
   * Send a MIDI message to a specific output
   */
  public sendMIDIMessage(outputId: string, message: number[]): boolean {
    if (!this.midiAccess) return false

    const output = this.midiAccess.outputs.get(outputId)
    if (!output) return false

    try {
      output.send(message)
      return true
    } catch (error) {
      console.error("Error sending MIDI message:", error)
      return false
    }
  }
}

// Export a singleton instance
export const midiService = MIDIService.getInstance()
