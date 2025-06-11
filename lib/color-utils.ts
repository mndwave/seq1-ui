/**
 * Color utilities for generating vibrant, neon colors for timeline clips
 */

// Convert hex to HSL
export function hexToHSL(hex: string): [number, number, number] {
  // Remove the # if present
  hex = hex.replace(/^#/, "")

  // Parse the hex values
  const r = Number.parseInt(hex.substring(0, 2), 16) / 255
  const g = Number.parseInt(hex.substring(2, 4), 16) / 255
  const b = Number.parseInt(hex.substring(4, 6), 16) / 255

  // Find the min and max values to calculate the lightness
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)

  // Calculate lightness
  const l = (max + min) / 2

  let h = 0
  let s = 0

  if (max !== min) {
    // Calculate saturation
    s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min)

    // Calculate hue
    if (max === r) {
      h = (g - b) / (max - min) + (g < b ? 6 : 0)
    } else if (max === g) {
      h = (b - r) / (max - min) + 2
    } else {
      h = (r - g) / (max - min) + 4
    }
    h /= 6
  }

  // Convert to degrees, and percentages
  return [h * 360, s * 100, l * 100]
}

// Convert HSL to hex
export function hslToHex(h: number, s: number, l: number): string {
  // Ensure h is between 0 and 360
  h = ((h % 360) + 360) % 360

  // Convert s and l to fractions
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2

  let r = 0,
    g = 0,
    b = 0

  if (h >= 0 && h < 60) {
    ;[r, g, b] = [c, x, 0]
  } else if (h >= 60 && h < 120) {
    ;[r, g, b] = [x, c, 0]
  } else if (h >= 120 && h < 180) {
    ;[r, g, b] = [0, c, x]
  } else if (h >= 180 && h < 240) {
    ;[r, g, b] = [0, x, c]
  } else if (h >= 240 && h < 300) {
    ;[r, g, b] = [x, 0, c]
  } else {
    ;[r, g, b] = [c, 0, x]
  }

  // Convert to hex
  const toHex = (value: number) => {
    const hex = Math.round((value + m) * 255).toString(16)
    return hex.length === 1 ? "0" + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// Calculate the hue distance between two colors
export function hueDistance(hue1: number, hue2: number): number {
  const diff = Math.abs(hue1 - hue2)
  return Math.min(diff, 360 - diff)
}

// Generate a vibrant neon color
export function generateNeonColor(): string {
  // Generate a random hue (0-360)
  const hue = Math.floor(Math.random() * 360)

  // Use high saturation (80-100%) and higher lightness (65-85%) for brighter neon effect
  const saturation = 80 + Math.floor(Math.random() * 20)
  const lightness = 65 + Math.floor(Math.random() * 20)

  return hslToHex(hue, saturation, lightness)
}

// Generate a color that's sufficiently distant from previous colors
export function generateDistinctColor(previousColors: string[] = []): string {
  // Minimum hue distance we want between colors (in degrees)
  const MIN_HUE_DISTANCE = 60

  // Maximum attempts to find a distinct color
  const MAX_ATTEMPTS = 30

  // Convert previous colors to HSL
  const previousHSLs = previousColors.map(hexToHSL)

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // Instead of using generateRetroColor, use our new neon color generator
    const newColor = generateNeonColor()
    const [newHue] = hexToHSL(newColor)

    // Check if this color is distinct enough from all previous colors
    let isDistinct = true

    for (const [prevHue] of previousHSLs) {
      if (hueDistance(newHue, prevHue) < MIN_HUE_DISTANCE) {
        isDistinct = false
        break
      }
    }

    if (isDistinct || previousColors.length === 0) {
      return newColor
    }
  }

  // If we couldn't find a distinct color after MAX_ATTEMPTS, just return a random one
  return generateNeonColor()
}

// Predefined vibrant neon color palette
export const VIBRANT_PALETTE = [
  "#FF00FF", // Magenta
  "#00FFFF", // Cyan
  "#FF3131", // Neon Red
  "#39FF14", // Neon Green
  "#FF9933", // Bright Orange
  "#FF1493", // Deep Pink
  "#00FF00", // Lime
  "#FF00BF", // Hot Pink
  "#FFA500", // Orange
  "#14F0F0", // Bright Turquoise
  "#CCFF00", // Electric Lime
  "#FF6EC7", // Hot Pink
  "#FD5DA8", // Flamingo Pink
  "#C875C4", // Orchid
  "#F433FF", // Bright Purple
  "#FFFF00", // Yellow
  "#FF5F1F", // Bright Orange Red
  "#19FFAA", // Bright Mint
  "#0099FF", // Bright Blue
  "#FF3377", // Raspberry
  "#47FF47", // Bright Green
  "#FF007F", // Rose
  "#00FF7F", // Spring Green
  "#FF77FF", // Light Magenta
]

// Function to get a random vibrant color from our palette
export function getRandomVibrantColor(): string {
  return VIBRANT_PALETTE[Math.floor(Math.random() * VIBRANT_PALETTE.length)]
}

// Function to get a vibrant color within a specific hue range
function getVibrantColorInRange(hueRange: [number, number]): string {
  let hue = Math.random() * (hueRange[1] - hueRange[0]) + hueRange[0]
  hue = ((hue % 360) + 360) % 360 // Ensure hue is within 0-360
  const saturation = 90 + Math.floor(Math.random() * 10) // High saturation
  const lightness = 50 + Math.floor(Math.random() * 20) // Medium-high lightness
  return hslToHex(hue, saturation, lightness)
}

// Function to get a vibrant color with preference for specific hue ranges
export function getColorFromCategory(
  category: "pink" | "orange" | "neon" | "blue" | "green" | "purple" | "yellow",
): string {
  switch (category) {
    case "pink":
      return getVibrantColorInRange([320, 350])
    case "orange":
      return getVibrantColorInRange([15, 40])
    case "neon":
      // Neon can be any hue but with max saturation and high lightness
      return hslToHex(Math.random() * 360, 100, 65)
    case "blue":
      return getVibrantColorInRange([180, 240])
    case "green":
      return getVibrantColorInRange([90, 150])
    case "purple":
      return getVibrantColorInRange([250, 290])
    case "yellow":
      return getVibrantColorInRange([40, 70])
    default:
      return generateNeonColor()
  }
}

// Get a balanced set of vibrant colors with more emphasis on pinks and neons
export function getBalancedVibrantColors(count: number): string[] {
  const categories: Array<"pink" | "orange" | "neon" | "blue" | "green" | "purple" | "yellow"> = [
    "pink",
    "pink", // Doubled "pink" to increase its likelihood
    "pink", // Tripled "pink" to further increase its likelihood
    "neon",
    "neon", // Doubled "neon" to increase its likelihood
    "neon", // Tripled "neon" to further increase its likelihood
    "orange",
    "blue",
    "purple",
  ]

  const colors: string[] = []

  // First, get one color from each category to ensure variety
  for (let i = 0; i < Math.min(count, categories.length); i++) {
    colors.push(getColorFromCategory(categories[i]))
  }

  // If we need more colors, generate random ones with sufficient distance
  while (colors.length < count) {
    colors.push(generateDistinctColor(colors))
  }

  return colors
}
