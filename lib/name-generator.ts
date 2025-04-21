/**
 * Generates creative project names in the style of electronic music hardware
 */

// Arrays of words to combine for project names
const adjectives = [
  "ANALOG",
  "DIGITAL",
  "DEEP",
  "DARK",
  "BRIGHT",
  "COSMIC",
  "ELECTRIC",
  "GLITCH",
  "HARMONIC",
  "HYPER",
  "LIQUID",
  "LUNAR",
  "MODULAR",
  "NEURAL",
  "ORBITAL",
  "PHASE",
  "PULSE",
  "QUANTUM",
  "RESONANT",
  "SOLAR",
  "SPECTRAL",
  "STATIC",
  "SYNTH",
  "TECHNIC",
  "TONAL",
  "VAPOR",
  "WAVE",
  "ACID",
  "AMBIENT",
  "BASS",
  "BEAT",
  "CYBER",
  "DRIFT",
  "ECHO",
  "FLUX",
  "GROOVE",
  "HAZE",
]

const nouns = [
  "DREAM",
  "WAVE",
  "BEAT",
  "PULSE",
  "DRIFT",
  "FLOW",
  "ECHO",
  "FIELD",
  "GRID",
  "LOOP",
  "MODE",
  "NODE",
  "PATH",
  "PHASE",
  "REALM",
  "SCAPE",
  "SHIFT",
  "SPACE",
  "VOID",
  "ZONE",
  "AURA",
  "FLUX",
  "FORM",
  "GATE",
  "HAZE",
  "MAZE",
  "MIST",
  "PEAK",
  "RAIN",
  "RIFT",
  "RISE",
  "SCAN",
  "TIDE",
  "TONE",
  "VEIL",
  "VIBE",
  "WARP",
  "BLUR",
  "CORE",
  "EDGE",
]

// Numbers to potentially append
const numbers = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "1", "2", "3", "4", "5", "6", "7", "8", "9"]

/**
 * Generates a random project name
 * @returns A randomly generated project name
 */
export function generateProjectName(): string {
  // Different patterns for variety
  const pattern = Math.floor(Math.random() * 5)

  switch (pattern) {
    case 0:
      // ADJECTIVE_NOUN (e.g., ANALOG_DREAM)
      return `${getRandomItem(adjectives)} ${getRandomItem(nouns)}`

    case 1:
      // NOUN_NUMBER (e.g., PULSE_03)
      return `${getRandomItem(nouns)} ${getRandomItem(numbers)}`

    case 2:
      // ADJECTIVE_NOUN_NUMBER (e.g., DEEP_WAVE_2)
      return `${getRandomItem(adjectives)} ${getRandomItem(nouns)} ${getRandomItem(numbers)}`

    case 3:
      // ADJECTIVE_ADJECTIVE_NOUN (e.g., COSMIC_ANALOG_DRIFT)
      return `${getRandomItem(adjectives)} ${getRandomItem(adjectives)} ${getRandomItem(nouns)}`

    case 4:
      // NOUN_NOUN (e.g., PULSE_FIELD)
      return `${getRandomItem(nouns)} ${getRandomItem(nouns)}`

    default:
      return `${getRandomItem(adjectives)} ${getRandomItem(nouns)}`
  }
}

/**
 * Gets a random item from an array
 * @param array The array to select from
 * @returns A random item from the array
 */
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}
