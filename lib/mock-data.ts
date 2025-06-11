// lib/mock-data.ts

export interface MockDevice {
  id: string
  name: string
  type: "Synthesizer" | "Drum Machine" | "Audio Interface" | "MIDI Controller" | "Effect Pedal"
  status: "connected" | "disconnected" | "error" | "initializing"
  vendor?: string
  version?: string
  imageUrl?: string
}

export const devices: MockDevice[] = [
  {
    id: "synth-001",
    name: "Cosmic Wave Weaver",
    type: "Synthesizer",
    status: "connected",
    vendor: "Galaxy Sounds",
    version: "1.2.3",
    imageUrl: "/placeholder.svg?width=100&height=100",
  },
  {
    id: "drum-002",
    name: "Rhythm King 9000",
    type: "Drum Machine",
    status: "disconnected",
    vendor: "BeatMakers Inc.",
    version: "2.0.1",
    imageUrl: "/placeholder.svg?width=100&height=100",
  },
  {
    id: "audio-003",
    name: "Clarity Hub A4",
    type: "Audio Interface",
    status: "error",
    vendor: "PurePath Audio",
    version: "3.1.0",
    imageUrl: "/placeholder.svg?width=100&height=100",
  },
  {
    id: "midi-004",
    name: "NoteStream 49",
    type: "MIDI Controller",
    status: "initializing",
    vendor: "KeyPlay Dynamics",
    version: "1.0.0",
    imageUrl: "/placeholder.svg?width=100&height=100",
  },
]

export const samplePresets = [
  { id: "preset-1", name: "Ambient Pad", deviceId: "synth-001", category: "Pad" },
  { id: "preset-2", name: "Punchy Kick", deviceId: "drum-002", category: "Kick" },
  { id: "preset-3", name: "Warm Lead", deviceId: "synth-001", category: "Lead" },
]
