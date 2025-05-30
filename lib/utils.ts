import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(date: Date | string | number): string {
  const timeMs = typeof date === "string" || typeof date === "number" ? new Date(date).getTime() : date.getTime()
  const deltaSeconds = Math.round((timeMs - Date.now()) / 1000)

  const cutoffs = [
    { threshold: 60, divisor: 1, unit: "second" },
    { threshold: 3600, divisor: 60, unit: "minute" },
    { threshold: 86400, divisor: 3600, unit: "hour" },
    { threshold: 2592000, divisor: 86400, unit: "day" }, // 30 days
    { threshold: 31536000, divisor: 2592000, unit: "month" }, // 12 months
    { threshold: Number.POSITIVE_INFINITY, divisor: 31536000, unit: "year" },
  ]

  const { threshold, divisor, unit } =
    cutoffs.find((c) => Math.abs(deltaSeconds) < c.threshold) || cutoffs[cutoffs.length - 1]

  const value = Math.round(Math.abs(deltaSeconds) / divisor)
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

  return rtf.format(deltaSeconds < 0 ? -value : value, unit as Intl.RelativeTimeFormatUnit)
}

// Other utility functions can be added here
