// This file is imported in the layout to ensure environment variables are available
// It provides a fallback for any code that directly accesses process.env

// Create a global variable to store environment variables
declare global {
  interface Window {
    __SEQ1_ENV?: {
      apiUrl: string
      wsUrl: string
    }
  }
}

// Set default values
if (typeof window !== "undefined") {
  window.__SEQ1_ENV = {
    apiUrl: "https://api.seq1.net",
    wsUrl: "wss://api.seq1.net",
  }

  // Create process.env if it doesn't exist
  // @ts-ignore - Add a global polyfill for process.env
  window.process = window.process || {}
  // @ts-ignore - Add a global polyfill for process.env
  window.process.env = window.process.env || {}

  // Add NEXT_PUBLIC_SEQ1_API_URL to process.env
  Object.defineProperty(window.process.env, "NEXT_PUBLIC_SEQ1_API_URL", {
    get: () => window.__SEQ1_ENV?.apiUrl || "https://api.seq1.net",
  })
}

export {}
