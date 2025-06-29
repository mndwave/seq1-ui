// Canonical SEQ1 Content Constants
// Shared between ABOUT modal and mobile landing to prevent drift

export const CANONICAL_SEQ1_DESCRIPTION = {
  primary: "SEQ1 is a new type of DAW that connects to your hardware synths and drum machines, harnessing the power of AI with human emotion.",
  secondary: "Adaptive and responsive to your creative direction, SEQ1 helps you create sequences, design patches, and explore new musical territories."
} as const

export const CANONICAL_MOBILE_CONTENT = {
  screenRequirement: {
    heading: "SEQ1 requires a larger screen to provide the optimal experience.",
    subtext: "Please use a device with a screen width of at least 1024px."
  },
  whatIsSeq1: {
    heading: "What is SEQ1?",
    description: `${CANONICAL_SEQ1_DESCRIPTION.primary}

${CANONICAL_SEQ1_DESCRIPTION.secondary}`
  },
  dmMndwave: {
    text: "DM MNDWAVE",
    url: "https://primal.net/mndwave"
  }
} as const 