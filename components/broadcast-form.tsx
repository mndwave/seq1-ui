"use client"

import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"

interface BroadcastFormProps {
  title: string
  content: string
  effectIntensity: number
  flickerIntensity: number
  glitchIntensity: number
  onUpdate: (values: {
    title: string
    content: string
    effectIntensity: number
    flickerIntensity: number
    glitchIntensity: number
  }) => void
}

export default function BroadcastForm({
  title,
  content,
  effectIntensity,
  flickerIntensity,
  glitchIntensity,
  onUpdate,
}: BroadcastFormProps) {
  const [values, setValues] = useState({
    title,
    content,
    effectIntensity,
    flickerIntensity,
    glitchIntensity,
  })

  // Update parent component when values change
  useEffect(() => {
    onUpdate(values)
  }, [values, onUpdate])

  // Update local state when props change
  useEffect(() => {
    setValues({
      title,
      content,
      effectIntensity,
      flickerIntensity,
      glitchIntensity,
    })
  }, [title, content, effectIntensity, flickerIntensity, glitchIntensity])

  const handleChange = (field: string, value: any) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="bg-[#2a1a20] border border-[#3a2a30] p-4 h-full overflow-y-auto">
      <h2 className="text-sm font-medium text-[#f0e6c8] uppercase tracking-wider mb-4">Broadcast Settings</h2>

      {/* Title input */}
      <div className="mb-4">
        <label className="block text-xs text-[#a09080] mb-1">TRANSMISSION TITLE</label>
        <input
          type="text"
          value={values.title}
          onChange={(e) => handleChange("title", e.target.value)}
          className="w-full bg-[#1a1015] border border-[#3a2a30] rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4287f5] text-[#f0e6c8] tracking-wide"
          placeholder="TRANSMISSION INCOMING"
        />
      </div>

      {/* Content textarea */}
      <div className="mb-4">
        <label className="block text-xs text-[#a09080] mb-1">BROADCAST CONTENT</label>
        <textarea
          value={values.content}
          onChange={(e) => handleChange("content", e.target.value)}
          className="w-full bg-[#1a1015] border border-[#3a2a30] rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4287f5] text-[#f0e6c8] tracking-wide font-mono h-40"
          placeholder="Enter your broadcast message here..."
        />
      </div>

      {/* Effect sliders */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="flex justify-between text-xs text-[#a09080] mb-1">
            <span>CRT EFFECT INTENSITY</span>
            <span>{values.effectIntensity}%</span>
          </label>
          <Slider
            value={[values.effectIntensity]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value) => handleChange("effectIntensity", value[0])}
            className="py-2"
          />
        </div>

        <div>
          <label className="flex justify-between text-xs text-[#a09080] mb-1">
            <span>FLICKER INTENSITY</span>
            <span>{values.flickerIntensity}%</span>
          </label>
          <Slider
            value={[values.flickerIntensity]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value) => handleChange("flickerIntensity", value[0])}
            className="py-2"
          />
        </div>

        <div>
          <label className="flex justify-between text-xs text-[#a09080] mb-1">
            <span>GLITCH INTENSITY</span>
            <span>{values.glitchIntensity}%</span>
          </label>
          <Slider
            value={[values.glitchIntensity]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value) => handleChange("glitchIntensity", value[0])}
            className="py-2"
          />
        </div>
      </div>
    </div>
  )
}
