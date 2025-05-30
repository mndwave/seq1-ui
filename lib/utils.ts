import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// The formatRelativeTime function has been moved to lib/nostr-utils.ts
// If it was here, it should be removed to avoid conflicts.
