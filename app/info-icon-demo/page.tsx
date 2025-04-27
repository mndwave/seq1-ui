"use client"

import { useState } from "react"
import InfoIcon from "@/components/info-icon"
import AboutModal from "@/components/about-modal"

export default function InfoIconDemo() {
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#1a1015] flex flex-col items-center justify-center p-4">
      <div className="bg-[#2a1a20] border border-[#3a2a30] rounded-md p-6 max-w-md w-full">
        <h1 className="text-[#f0e6c8] text-xl mb-6 flex items-center gap-2">
          Info Icon Demo
          <InfoIcon onClick={() => setIsAboutModalOpen(true)} />
        </h1>

        <p className="text-[#a09080] mb-4">
          This demo showcases the pulsing info icon that resembles a distant boat at sea with a soft, warm glow.
        </p>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 bg-[#3a2a30] p-3 rounded">
            <InfoIcon size={20} />
            <span className="text-[#f0e6c8]">Default size (20px)</span>
          </div>

          <div className="flex items-center gap-3 bg-[#3a2a30] p-3 rounded">
            <InfoIcon size={24} />
            <span className="text-[#f0e6c8]">Medium size (24px)</span>
          </div>

          <div className="flex items-center gap-3 bg-[#3a2a30] p-3 rounded">
            <InfoIcon size={32} />
            <span className="text-[#f0e6c8]">Large size (32px)</span>
          </div>
        </div>
      </div>

      <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
    </div>
  )
}
