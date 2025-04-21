"use client"

import { generateDistinctColor } from "@/lib/color-utils"
import type { TimelineClip } from "@/lib/timeline-clip-schema"

/**
 * Creates a new timeline clip with a unique ID and color.
 * @param {Partial<TimelineClip>} overrides - Optional overrides for the default clip properties.
 * @returns {TimelineClip} A new timeline clip.
 */
export const createClip = (overrides: Partial<TimelineClip> = {}): TimelineClip => {
  const newColor = overrides.color || generateDistinctColor([]) // Ensure a color is always assigned

  const newClip: TimelineClip = {
    id: `clip-${Date.now()}`,
    name: `Section`,
    start: 0,
    length: 16,
    color: newColor,
    ...overrides,
  }

  return newClip
}
