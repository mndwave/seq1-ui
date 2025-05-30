"use client"

// lib/performance-utils.ts
import { useRef, useCallback, useEffect } from "react"
import { stateManager, type AppState } from "@/lib/state-manager" // Corrected import

// Debounced API calls / function calls
export function useDebouncedCallback<A extends any[]>(
  callback: (...args: A) => void,
  delay = 300,
): (...args: A) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return useCallback(
    (...args: A) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay],
  )
}

// Throttled API calls / function calls
export function useThrottledCallback<A extends any[]>(
  callback: (...args: A) => void,
  delay = 100, // Default delay for throttling
): (...args: A) => void {
  const lastCallTimeRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null) // For trailing call

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return useCallback(
    (...args: A) => {
      const now = Date.now()
      const remainingTime = delay - (now - lastCallTimeRef.current)

      if (remainingTime <= 0) {
        lastCallTimeRef.current = now
        callback(...args)
        if (timeoutRef.current) {
          // Clear any pending trailing call
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
      } else {
        // Optional: Implement a trailing call if desired
        // This means if calls are made during the throttle period,
        // the last one will execute after the delay.
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        timeoutRef.current = setTimeout(() => {
          lastCallTimeRef.current = Date.now()
          callback(...args)
          timeoutRef.current = null
        }, remainingTime)
      }
    },
    [callback, delay],
  )
}

// Batch state updates
// This class is designed to batch updates to the stateManager
type StateUpdateFunction = () => Partial<AppState> // A function that returns a partial state to merge

export class BatchUpdater {
  private delay: number
  private updates: Partial<AppState>[] // Store partial state objects
  private timeoutId: NodeJS.Timeout | null

  constructor(delay = 16) {
    // Default to roughly one frame
    this.delay = delay
    this.updates = []
    this.timeoutId = null
  }

  // Add a partial state object to be merged
  add(update: Partial<AppState>): void {
    this.updates.push(update)

    if (!this.timeoutId) {
      this.timeoutId = setTimeout(() => {
        this.flush()
      }, this.delay)
    }
  }

  // Add a function that produces a partial state object
  addFn(updateFn: StateUpdateFunction): void {
    // Immediately call the function to get the partial state
    // This ensures the state is captured at call time if needed,
    // though typically updateFn would be simple object returns.
    this.updates.push(updateFn())

    if (!this.timeoutId) {
      this.timeoutId = setTimeout(() => {
        this.flush()
      }, this.delay)
    }
  }

  flush(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }

    if (this.updates.length > 0) {
      const updatesToProcess = [...this.updates] // Create a copy
      this.updates = [] // Clear original array for new updates

      // Combine all updates into a single state change object
      // Later updates for the same key will overwrite earlier ones in the batch.
      const finalUpdate = updatesToProcess.reduce(
        (acc, currentUpdate) => {
          return { ...acc, ...currentUpdate }
        },
        {} as Partial<AppState>,
      )

      if (Object.keys(finalUpdate).length > 0) {
        stateManager.setState(finalUpdate)
      }
    }
  }
}

// Export a singleton instance as per the document
export const batchUpdater = new BatchUpdater()
