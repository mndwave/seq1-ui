"use client"

import { useState } from "react"
import BroadcastDisplay from "@/components/broadcast-display"
import BroadcastForm from "@/components/broadcast-form"
import BroadcastInterrupted from "@/components/broadcast-interrupted"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import "./broadcast.css"

export default function BroadcastToolPage() {
  const [broadcastSettings, setBroadcastSettings] = useState({
    title: "TRANSMISSION INCOMING",
    content:
      "THIS PROJECT IS SO F'ING EARLY\n\nWe're streaming live from the lab, working on new sounds and exploring the boundaries of what's possible.\n\nStay tuned as we venture into the unknown.",
    effectIntensity: 50,
    flickerIntensity: 30,
    glitchIntensity: 20,
  })

  const [interruptedSettings, setInterruptedSettings] = useState({
    message: "WE'LL BE BACK SOON",
    showStatic: true,
  })

  const handleInterruptedSettingsChange = (field: string, value: any) => {
    setInterruptedSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="min-h-screen bg-[#1a1015] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#3a2a30] bg-[#2a1a20]">
        <div className="max-w-screen-lg mx-auto">
          <h1 className="text-xl font-semibold italic text-[#f0e6c8] font-poppins">SEQ1 Broadcast Tool</h1>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">
        <div className="max-w-screen-lg mx-auto">
          <Tabs defaultValue="normal" className="w-full">
            <TabsList className="mb-6 bg-[#2a1a20] border border-[#3a2a30]">
              <TabsTrigger
                value="normal"
                className="data-[state=active]:bg-[#3a2a30] data-[state=active]:text-[#f0e6c8]"
              >
                Normal Broadcast
              </TabsTrigger>
              <TabsTrigger
                value="interrupted"
                className="data-[state=active]:bg-[#3a2a30] data-[state=active]:text-[#f0e6c8]"
              >
                Interrupted Broadcast
              </TabsTrigger>
            </TabsList>

            <TabsContent value="normal" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Broadcast display */}
                <div className="lg:col-span-1">
                  <BroadcastDisplay
                    title={broadcastSettings.title}
                    content={broadcastSettings.content}
                    effectIntensity={broadcastSettings.effectIntensity}
                    flickerIntensity={broadcastSettings.flickerIntensity}
                    glitchIntensity={broadcastSettings.glitchIntensity}
                    className="w-full h-auto"
                  />
                  <div className="mt-2 text-xs text-[#a09080] text-center">
                    This is how your broadcast will appear during streaming
                  </div>
                </div>

                {/* Settings form */}
                <div className="lg:col-span-1">
                  <BroadcastForm
                    title={broadcastSettings.title}
                    content={broadcastSettings.content}
                    effectIntensity={broadcastSettings.effectIntensity}
                    flickerIntensity={broadcastSettings.flickerIntensity}
                    glitchIntensity={broadcastSettings.glitchIntensity}
                    logoAnimationFrequency={broadcastSettings.logoAnimationFrequency}
                    onUpdate={setBroadcastSettings}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="interrupted" className="mt-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Broadcast interrupted display */}
                <div className="lg:col-span-1">
                  <BroadcastInterrupted
                    message={interruptedSettings.message}
                    showStatic={interruptedSettings.showStatic}
                    className="w-full h-auto"
                  />
                </div>

                {/* Settings form */}
                <div className="lg:col-span-1">
                  <div className="bg-[#2a1a20] border border-[#3a2a30] p-4 h-full overflow-y-auto">
                    <h2 className="text-sm font-medium text-[#f0e6c8] uppercase tracking-wider mb-4">
                      Interrupted Broadcast Settings
                    </h2>

                    {/* Message input */}
                    <div className="mb-4">
                      <label className="block text-xs text-[#a09080] mb-1">MESSAGE</label>
                      <input
                        type="text"
                        value={interruptedSettings.message}
                        onChange={(e) => handleInterruptedSettingsChange("message", e.target.value)}
                        className="w-full bg-[#1a1015] border border-[#3a2a30] rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4287f5] text-[#f0e6c8] tracking-wide"
                        placeholder="WE'LL BE BACK SOON"
                      />
                    </div>

                    {/* Toggle options */}
                    <div className="space-y-3 mt-6">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-[#a09080]">SHOW STATIC NOISE</label>
                        <div
                          className={`w-10 h-5 rounded-full relative cursor-pointer ${interruptedSettings.showStatic ? "bg-[#4287f5]" : "bg-[#3a2a30]"}`}
                          onClick={() => handleInterruptedSettingsChange("showStatic", !interruptedSettings.showStatic)}
                        >
                          <div
                            className={`absolute top-0.5 w-4 h-4 rounded-full bg-[#f0e6c8] transition-all ${
                              interruptedSettings.showStatic ? "left-5" : "left-0.5"
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
