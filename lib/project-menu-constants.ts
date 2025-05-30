// Constants for Project Menu Auth Gates
export const FREE_OPERATIONS: string[] = [
  "new", // Assuming 'NEW_PROJECT' maps to 'new' action id
  "about", // Assuming 'ABOUT_SEQ1' maps to 'about' action id
  // Add other client-side representations of free operations if needed
  // e.g., 'TRANSPORT_CONTROLS', 'DEVICE_CONTROL', etc. if they are menu actions
]

export const AUTH_REQUIRED_OPERATIONS: string[] = [
  "open", // 'OPEN_PROJECT'
  "save", // 'SAVE'
  "saveAs", // 'SAVE_AS'
  "export", // 'EXPORT_ALS' - Note: document uses 'EXPORT_ALS', menu uses 'export'
  "import", // 'IMPORT_ALS' - Note: document uses 'IMPORT_ALS', menu uses 'import'
  "account", // 'ACCOUNT_ACCESS'
  // 'COLLABORATION' // Not in current DirectProjectMenu items
]

// TIMER_RULES are mostly for conceptual understanding or server-side enforcement.
// Client-side, SESSION_DURATION in SEQ1APIClient and warning logic in SessionManager implement parts of this.
export const TIMER_RULES = {
  TOTAL_FREE_TIME: 3 * 60 * 60 * 1000, // 3 hours EVER
  NEVER_RESET: true, // Timer persists through signup
  CONVERSION_MOMENTS: [
    "SAVE_ATTEMPT", // "I love this track!"
    "TIMER_WARNING", // "5 minutes left!"
    "SESSION_TIMEOUT", // "Time's up!"
  ],
}
