"use client"

import { useState } from "react"

export default function LogoComparison() {
  const [showOutline, setShowOutline] = useState(true)

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-[#1a1015] min-h-screen">
      <div className="flex flex-col md:flex-row gap-8 items-center justify-center mb-8">
        <div className="flex flex-col items-center">
          <h2 className="text-sm text-[#a09080] mb-4">Current Logo</h2>
          <h1 className="text-2xl font-semibold italic text-[#f0e6c8] font-poppins">SEQ1</h1>
        </div>

        <div className="flex flex-col items-center">
          <h2 className="text-sm text-[#a09080] mb-4">Outline Logo</h2>
          <h1
            className="text-2xl font-semibold italic font-poppins"
            style={{
              color: "transparent",
              WebkitTextStroke: "1px #f0e6c8",
              textShadow: "none",
            }}
          >
            SEQ1
          </h1>
        </div>
      </div>

      <div className="mt-8 p-6 border border-[#3a2a30] rounded-sm">
        <h3 className="text-sm text-[#a09080] mb-4">Preview in Context</h3>
        <div className="h-16 border-b border-[#3a2a30] flex items-center px-4 bg-[#2a1a20] relative overflow-hidden">
          <div className="absolute inset-0 diagonal-stripes opacity-20"></div>
          <div className="flex-1 flex items-center justify-between relative z-10">
            <div className="flex items-center">
              <h1
                className="text-2xl font-semibold italic font-poppins mr-8 transition-all duration-300 hover:text-white"
                style={
                  showOutline
                    ? {
                        color: "transparent",
                        WebkitTextStroke: "1px #f0e6c8",
                        textShadow: "none",
                      }
                    : {
                        color: "#f0e6c8",
                      }
                }
              >
                SEQ1
              </h1>
              <div className="flex space-x-3">
                {/* Placeholder buttons */}
                <div className="w-12 h-12 rounded-full bg-[#2a1a20]"></div>
                <div className="w-12 h-12 rounded-full bg-[#2a1a20]"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setShowOutline(!showOutline)}
            className="channel-button active flex items-center px-3 py-1.5"
          >
            <span className="text-xs tracking-wide">{showOutline ? "SHOW FILLED" : "SHOW OUTLINE"}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
