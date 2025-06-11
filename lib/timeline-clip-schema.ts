import { z } from "zod"

export const timelineClipSchema = z.object({
  id: z.string().uuid().or(z.string().min(1)), // Allow UUID or any non-empty string for temp IDs
  name: z.string().min(1, "Clip name cannot be empty."),
  start: z.number().min(0, "Start position must be non-negative."),
  length: z.number().positive("Length must be a positive number."),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code (e.g., #RRGGBB)."),
})

export type TimelineClip = z.infer<typeof timelineClipSchema>

export const loopRegionSchema = z.object({
  startBar: z.number().min(0),
  endBar: z.number().positive(),
})

export type LoopRegion = z.infer<typeof loopRegionSchema>

// Ensure the interface (if used elsewhere directly) matches the Zod schema
export interface ITimelineClip {
  id: string
  name: string
  start: number
  length: number
  color: string
}

export interface ILoopRegion {
  startBar: number
  endBar: number
}
