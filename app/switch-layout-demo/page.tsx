"use client"

import { useState } from "react"
import SwitchLayoutVariations from "@/components/switch-layout-variations"

export default function SwitchLayoutDemo() {
  const [selectedVariation, setSelectedVariation] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#1a1015] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#3a2a30] bg-[#2a1a20]">
        <div className="max-w-screen-lg mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold italic text-[#f0e6c8] font-poppins">SEQ1 Switch Layout Options</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#a09080]">
              {selectedVariation ? `Selected: Variation ${selectedVariation}` : "Select a layout variation"}
            </span>
          </div>
        </div>
      </div>

      {/* Demo container */}
      <div className="flex-1 flex">
        <div className="max-w-screen-lg mx-auto w-full flex flex-col md:flex-row my-8 px-4">
          {/* Layout variations */}
          <div className="w-full max-w-2xl">
            <SwitchLayoutVariations onSelect={setSelectedVariation} />
          </div>

          {/* Instructions */}
          <div className="md:ml-8 flex-1 mt-8 md:mt-0">
            <div className="p-6 bg-[#2a1a20] border border-[#3a2a30] rounded-sm">
              <h2 className="text-sm font-medium text-[#f0e6c8] uppercase tracking-wider mb-4">About These Layouts</h2>
              <div className="text-sm text-[#a09080] space-y-4">
                <p>
                  These layout variations explore different ways to arrange the MIDI indicator and power switch in the
                  device card.
                </p>

                <h3 className="text-xs font-medium text-[#f0e6c8] uppercase tracking-wider mt-6 mb-2">
                  Variation 1: Current Layout
                </h3>
                <p>
                  The current layout with improved alignment between the MIDI indicator and power switch. The slight
                  misalignment creates an organic feel that matches vintage hardware.
                </p>

                <h3 className="text-xs font-medium text-[#f0e6c8] uppercase tracking-wider mt-6 mb-2">
                  Variation 2: Labeled Switch
                </h3>
                <p>
                  A smaller power switch with a "POWER" label underneath, matching the style of the MIDI indicator. This
                  creates better visual balance and clearer labeling.
                </p>

                <h3 className="text-xs font-medium text-[#f0e6c8] uppercase tracking-wider mt-6 mb-2">
                  Variation 3: Balanced Indicators
                </h3>
                <p>
                  Both indicators have the same visual treatment with labels, creating a more consistent interface. The
                  power switch is simplified but maintains its distinctive red glow.
                </p>

                <h3 className="text-xs font-medium text-[#f0e6c8] uppercase tracking-wider mt-6 mb-2">
                  Variation 4: Minimalist
                </h3>
                <p>
                  Removes the MIDI indicator entirely, focusing solely on the power switch. This creates a cleaner
                  interface but loses the MIDI activity feedback.
                </p>

                <p className="mt-6">Click on a variation to select it and see how it would look in context.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
