// lib/project-menu-constants.ts

/**
 * Defines action IDs for operations that are always free and do not require authentication.
 * These should match the `actionId` in `DirectProjectMenu`'s `menuItems`.
 */
export const FREE_OPERATIONS: string[] = [
  "new", // Corresponds to "NEW PROJECT"
  "about", // Corresponds to "ABOUT SEQ1"
  // Other potential free actions if they were menu items:
  // "transportControls", // Example: Play, Stop, Record if they were menu items
  // "deviceControl",     // Example: Interacting with a connected device parameter
]

/**
 * Defines action IDs for operations that require user authentication (a valid JWT).
 * These should match the `actionId` in `DirectProjectMenu`'s `menuItems`.
 */
export const AUTH_REQUIRED_OPERATIONS: string[] = [
  "open", // Corresponds to "OPEN PROJECT"
  "save", // Corresponds to "SAVE"
  "saveAs", // Corresponds to "SAVE AS..."
  "export", // Corresponds to "EXPORT ALS"
  "import", // Corresponds to "IMPORT ALS"
  "account", // Corresponds to "YOUR STUDIO" (accessing account settings)
  // "collaboration", // Example if collaboration features were added
]

/**
 * Conceptual rules for anonymous session timers.
 * The practical implementation of warnings and expiry is handled by:
 * - `SEQ1APIClient` (managing `SESSION_DURATION` from `config.TRIAL_DURATION`)
 * - `SessionManager` (dispatching warning and expiry events)
 */
export const TIMER_RULES = {
  /** Total free trial time allowed for an anonymous session EVER (e.g., 3 hours). */
  TOTAL_FREE_TIME: 3 * 60 * 60 * 1000, // Example: 3 hours in milliseconds

  /** If true, the timer does not reset upon signup; usage is cumulative until conversion. */
  NEVER_RESET: true,

  /**
   * Defines moments or user actions that might trigger a conversion prompt (signup/login)
   * if the user is anonymous.
   */
  CONVERSION_MOMENTS: [
    "SAVE_ATTEMPT", // User tries to save work
    "EXPORT_ATTEMPT", // User tries to export
    "TIMER_WARNING", // Automated warning when nearing session/trial limit
    "SESSION_TIMEOUT", // Automated event when session/trial limit is reached
    "FEATURE_ACCESS_DENIED", // User tries to access a premium feature
  ],
}

/**
 * Specific operation identifiers used when calling `sessionManager.showAuthRequired`.
 * These help `AuthManagerModal` display context-specific messages.
 * It's good practice to keep these consistent with `AUTH_REQUIRED_OPERATIONS` where applicable,
 * but they can also be more granular.
 */
export const AUTH_CONTEXT_OPERATIONS = {
  NEW_PROJECT: "NEW_PROJECT", // Though 'new' is free, this is for consistency if it ever changed
  OPEN_PROJECT: "OPEN_PROJECT",
  SAVE: "SAVE",
  SAVE_AS: "SAVE_AS",
  EXPORT_ALS: "EXPORT_ALS",
  IMPORT_ALS: "IMPORT_ALS",
  ACCOUNT_ACCESS: "ACCOUNT_ACCESS",
  SECURE_SESSION_BUTTON: "SECURE_SESSION_BUTTON", // For the generic "Secure Your Session" button
  // Add more specific contexts as needed
  GLOBAL_TRANSPORT_SAVE: "GLOBAL_TRANSPORT_SAVE", // Example: If save is triggered from transport
}
