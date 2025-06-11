"use client"

import React from "react"
import { WifiOff, RefreshCw } from "lucide-react"

interface ApiConnectionErrorProps {
  onRetry?: () => void
  message?: string
  title?: string
}

const ApiConnectionError: React.FC<ApiConnectionErrorProps> = ({
  onRetry,
  message = "SEQ1 is currently unable to connect. Please check your internet connection or try again shortly.",
  title = "Connection Issue",
}) => {
  return (
    <div
      className="flex flex-col items-center justify-center h-full text-center p-4 bg-[#1a1015] text-[#a09080]"
      role="alert"
      aria-live="assertive"
    >
      <WifiOff size={48} className="mb-4 text-[#dc5050]" />
      <h2 className="text-xl font-semibold text-[#f0e6c8] mb-2">{title}</h2>
      <p className="text-sm mb-6 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="channel-button active flex items-center px-4 py-2 text-xs tracking-wide"
          aria-label="Retry connection"
        >
          <RefreshCw size={14} className="mr-2" />
          Retry
        </button>
      )}
      <p className="text-xs mt-4">
        If the problem persists, please visit our support page or check our status updates.
      </p>
    </div>
  )
}

export default React.memo(ApiConnectionError)
