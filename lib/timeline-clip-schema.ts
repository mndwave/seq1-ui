export interface TimelineClip {
  id: string
  name: string
  start: number // Start position in beats
  length: number // Length in beats
  color: string // Color is now required
}

export interface LoopRegion {
  startBar: number
  endBar: number
}
