import { generateDistinctColor, VIBRANT_PALETTE } from "@/lib/color-utils"
import type { TimelineClip } from "@/lib/timeline-clip-schema"

// Replace the SECTION_COLORS constant with our VIBRANT_PALETTE
export const SECTION_COLORS = VIBRANT_PALETTE

/**
 * Gets a random item from an array
 * @param array The array to select from
 * @returns A random item from the array
 */
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Get a unique color for a new timeline section
 */
export const getUniqueColor = (sections: TimelineClip[], usedColorMap: Record<string, number>): string => {
  // Get all existing colors from sections
  const existingColors = sections.map((section) => section.color).filter(Boolean) as string[]

  // Generate a new vibrant color that's distinct from existing ones
  return generateDistinctColor(existingColors)
}

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
