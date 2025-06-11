"use client"

// lib/global-event-handlers.ts
import { wsClient } from "@/lib/websocket-manager" // Corrected import
import { stateManager } from "@/lib/state-manager" // Corrected import
import { TransportAPI, ProjectAPI } from "@/lib/api-services" // Corrected import
import { batchUpdater } from "@/lib/performance-utils" // Corrected import
import { authManager } from "@/lib/auth-manager" // To check if user is authenticated for save

// MIDI input handler
interface MIDIMessageEvent {
  data: Uint8Array // Standard MIDI message format
  timeStamp: number
}

export function handleMIDIInput(event: MIDIMessageEvent): void {
  if (!event.data || event.data.length === 0) return

  const [status, note, velocity] = event.data

  // Send to WebSocket for real-time processing
  wsClient.send("midi_input", {
    status,
    note,
    velocity,
    timestamp: event.timeStamp, // Use original event timestamp
  })

  // Update local state via batchUpdater
  // Example: update a 'lastMidiInput' field in a 'midi' domain of AppState
  // This requires 'midi' domain to be added to AppState and stateManager
  // For now, let's assume it updates a generic part of the state or a specific one if defined.
  // If you add a 'midi' domain to AppState:
  // stateManager.setState('midi', { lastMidiInput: { status, note, velocity, timestamp: Date.now() } });
  // Using batchUpdater as per document:
  batchUpdater.add({
    // Assuming a 'lastMidiInput' at the root of AppState for simplicity,
    // or adjust path as needed e.g. { midi: { lastMidiInput: ... } }
    lastMidiInput: {
      // This key needs to be part of AppState definition
      status,
      note,
      velocity,
      timestamp: Date.now(),
    },
  } as any) // Cast as any if 'lastMidiInput' is not yet in AppState
}

// Keyboard shortcuts handler
export function handleKeyboardShortcuts(event: KeyboardEvent): void {
  const { key, ctrlKey, metaKey, shiftKey } = event
  const cmdKey = ctrlKey || metaKey // Standard check for Cmd on Mac or Ctrl on Win/Linux

  // Define shortcuts as an object for clarity
  const shortcuts: Record<string, () => void> = {
    " ": () => {
      // Spacebar for play/stop
      event.preventDefault()
      const { isPlaying } = stateManager.getState().transport
      if (isPlaying) {
        TransportAPI.stop().catch((err) => console.error("Shortcut: Failed to stop transport", err))
      } else {
        TransportAPI.play().catch((err) => console.error("Shortcut: Failed to play transport", err))
      }
    },
    s: () => {
      // Cmd/Ctrl + S for save
      if (cmdKey && !shiftKey) {
        // Ensure it's just Cmd/Ctrl + S, not with Shift
        event.preventDefault()
        // Trigger save:
        // This should ideally use ProjectAPI.saveProject if current project context is available.
        // wsClient.send('save_project', {}) is a generic way if backend handles context.
        // Let's assume we need to save the current project from stateManager.
        const currentProject = stateManager.getState().projects.current
        if (currentProject && currentProject.id) {
          // Check if user is authenticated (JWT token)
          if (authManager.isAuthenticated) {
            // Assuming authManager is available and updated
            // Assuming project data needs to be fetched or is already in a savable format
            const projectDataToSave = {
              /* ... collect current project data ... */
            }
            console.log(`Shortcut: Attempting to save project ${currentProject.id}`)
            ProjectAPI.saveProject(currentProject.id, projectDataToSave)
              .then(() => console.log(`Shortcut: Project ${currentProject.id} saved.`))
              .catch((err) => console.error(`Shortcut: Failed to save project ${currentProject.id}`, err))
          } else {
            console.log("Shortcut: Save attempt failed, user not authenticated.")
            // Optionally trigger auth modal here
            // sessionManager.showAuthRequired("SAVE_PROJECT_SHORTCUT", "Please sign in to save your project.");
          }
        } else {
          console.log("Shortcut: No current project to save or project ID missing.")
          // Optionally trigger "Save As" flow or a notification
        }
      }
    },
    // Add more shortcuts here
    // Example: Cmd/Ctrl + Z for undo (would require undo/redo logic)
    // "z": () => {
    //   if (cmdKey && !shiftKey) {
    //     event.preventDefault();
    //     wsClient.send('undo_action', {});
    //   }
    // },
  }

  const handler = shortcuts[key.toLowerCase()] // Use toLowerCase for case-insensitivity if needed
  if (handler) {
    handler()
  }
}

// Window focus/blur handlers
export function handleWindowFocus(): void {
  console.log("Window focused")
  // Reconnect WebSocket if needed and not explicitly disconnected
  if (wsClient.getStatus() === "disconnected" && !wsClient["explicitDisconnect"]) {
    // Accessing private-like prop, better to add a getter if needed
    console.log("Attempting to reconnect WebSocket on window focus.")
    wsClient.connect()
  }

  // Refresh transport state (or other critical states)
  TransportAPI.getState()
    .then((transportState) => {
      stateManager.setState("transport", transportState)
      console.log("Transport state refreshed on window focus.")
    })
    .catch((err) => console.error("Failed to refresh transport state on window focus:", err))

  // Potentially refresh other states like device list, chat history if stale
}

export function handleWindowBlur(): void {
  console.log("Window blurred")
  // Optional: Pause transport on window blur
  // const { isPlaying } = stateManager.getState().transport;
  // if (isPlaying) {
  //   TransportAPI.stop().catch(err => console.error("Failed to stop transport on window blur:", err));
  //   console.log("Transport stopped on window blur (optional).");
  // }
}

// Example of how these might be attached globally (e.g., in a top-level component or App.tsx)
// useEffect(() => {
//   window.addEventListener('focus', handleWindowFocus);
//   window.addEventListener('blur', handleWindowBlur);
//   window.addEventListener('keydown', handleKeyboardShortcuts);
//   // For MIDI, you'd attach to specific MIDI input devices via Web MIDI API
//   // navigator.requestMIDIAccess?.().then(midiAccess => {
//   //   midiAccess.inputs.forEach(input => {
//   //     input.onmidimessage = handleMIDIInput;
//   //   });
//   // });

//   return () => {
//     window.removeEventListener('focus', handleWindowFocus);
//     window.removeEventListener('blur', handleWindowBlur);
//     window.removeEventListener('keydown', handleKeyboardShortcuts);
//     // MIDI cleanup
//   };
// }, []);
