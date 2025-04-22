"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import Slider from "@/components/synth-controls/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function LogoGenerator() {
  const [isOutline, setIsOutline] = useState(true)
  const [glowAmount, setGlowAmount] = useState(0)
  const [subheadingText, setSubheadingText] = useState("www.seq1.net")
  const [logoWidth, setLogoWidth] = useState(0)

  // New state variables for subheading customization
  const [letterSpacing, setLetterSpacing] = useState(2) // 0-30 range (0.00em to 0.30em)
  const [fontWeight, setFontWeight] = useState(300) // 100-600 range
  const [topSpacing, setTopSpacing] = useState(3) // 0-10 range (0px to 40px)

  const logoRef = useRef<HTMLHeadingElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Get logo width after render and when outline changes
  useEffect(() => {
    if (logoRef.current) {
      // Use setTimeout to ensure the text has rendered with the correct style
      setTimeout(() => {
        const width = logoRef.current?.offsetWidth || 0
        setLogoWidth(width)
      }, 50)
    }
  }, [isOutline]) // Re-measure when outline changes which affects width

  // Function to export the logo as SVG
  const exportSVG = () => {
    if (!containerRef.current) return

    // Create a new SVG element
    const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svgElement.setAttribute("width", "500")
    svgElement.setAttribute("height", "300")
    svgElement.setAttribute("viewBox", "0 0 500 300")
    svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg")

    // Add style for fonts
    const style = document.createElementNS("http://www.w3.org/2000/svg", "style")
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;1,100;1,200;1,300;1,400;1,500;1,600&display=swap');
    `
    svgElement.appendChild(style)

    // Create a group for centering
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g")
    group.setAttribute("transform", "translate(250, 150)")

    // Create the logo text
    const logoText = document.createElementNS("http://www.w3.org/2000/svg", "text")
    logoText.setAttribute("x", "0")
    logoText.setAttribute("y", "0")
    logoText.setAttribute("text-anchor", "middle")
    logoText.setAttribute("font-family", "Poppins, sans-serif")
    logoText.setAttribute("font-size", "70")
    logoText.setAttribute("font-weight", "600")
    logoText.setAttribute("font-style", "italic")
    logoText.setAttribute("letter-spacing", "0.05em")

    if (isOutline) {
      logoText.setAttribute("fill", "transparent")
      logoText.setAttribute("stroke", "#f0e6c8")
      logoText.setAttribute("stroke-width", "1")
    } else {
      logoText.setAttribute("fill", "#f0e6c8")
      logoText.setAttribute("stroke", "#f0e6c8")
      logoText.setAttribute("stroke-width", "0.5")
    }

    logoText.textContent = "SEQ1"

    // Create the subheading text
    const subheadingElement = document.createElementNS("http://www.w3.org/2000/svg", "text")
    subheadingElement.setAttribute("x", "0")
    subheadingElement.setAttribute("y", `${topSpacing * 4 + 40}`)
    subheadingElement.setAttribute("text-anchor", "middle")
    subheadingElement.setAttribute("font-family", "Poppins, sans-serif")
    subheadingElement.setAttribute("font-size", "24")
    subheadingElement.setAttribute("font-weight", fontWeight.toString())
    subheadingElement.setAttribute("font-style", "italic")
    subheadingElement.setAttribute("letter-spacing", `${letterSpacing * 0.01}em`)
    subheadingElement.setAttribute("fill", "#f0e6c8")
    subheadingElement.textContent = subheadingText

    // Add glow filter if needed
    if (glowAmount > 0) {
      const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs")
      const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter")
      filter.setAttribute("id", "glow")
      filter.setAttribute("x", "-50%")
      filter.setAttribute("y", "-50%")
      filter.setAttribute("width", "200%")
      filter.setAttribute("height", "200%")

      const feGaussianBlur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur")
      feGaussianBlur.setAttribute("stdDeviation", `${glowAmount / 10}`)
      feGaussianBlur.setAttribute("result", "blur")

      const feFlood = document.createElementNS("http://www.w3.org/2000/svg", "feFlood")
      feFlood.setAttribute("flood-color", "#f0e6c8")
      feFlood.setAttribute("flood-opacity", `${glowAmount / 100}`)
      feFlood.setAttribute("result", "color")

      const feComposite = document.createElementNS("http://www.w3.org/2000/svg", "feComposite")
      feComposite.setAttribute("in", "color")
      feComposite.setAttribute("in2", "blur")
      feComposite.setAttribute("operator", "in")
      feComposite.setAttribute("result", "glow")

      const feMerge = document.createElementNS("http://www.w3.org/2000/svg", "feMerge")
      const feMergeNode1 = document.createElementNS("http://www.w3.org/2000/svg", "feMergeNode")
      feMergeNode1.setAttribute("in", "glow")
      const feMergeNode2 = document.createElementNS("http://www.w3.org/2000/svg", "feMergeNode")
      feMergeNode2.setAttribute("in", "SourceGraphic")

      feMerge.appendChild(feMergeNode1)
      feMerge.appendChild(feMergeNode2)

      filter.appendChild(feGaussianBlur)
      filter.appendChild(feFlood)
      filter.appendChild(feComposite)
      filter.appendChild(feMerge)

      defs.appendChild(filter)
      svgElement.appendChild(defs)

      group.setAttribute("filter", "url(#glow)")
    }

    // Assemble the SVG
    group.appendChild(logoText)
    group.appendChild(subheadingElement)
    svgElement.appendChild(group)

    // Convert SVG to string
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svgElement)

    // Convert to data URL
    const svgBlob = new Blob([svgString], { type: "image/svg+xml" })
    const url = URL.createObjectURL(svgBlob)

    // Create download link
    const link = document.createElement("a")
    link.href = url
    link.download = "seq1-logo.svg"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[#1a1015] text-white flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8">
        {/* Logo Preview - Left Column */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 bg-[#15090f] rounded-lg">
          <div
            ref={containerRef}
            className={`relative ${glowAmount > 0 ? "filter" : ""}`}
            style={{
              filter:
                glowAmount > 0
                  ? `drop-shadow(0 0 ${glowAmount / 10}px rgba(240, 230, 200, ${glowAmount / 100}))`
                  : "none",
            }}
          >
            <div className="flex items-center justify-center">
              <h1
                ref={logoRef}
                className="text-7xl font-semibold italic font-poppins tracking-wide"
                style={{
                  color: isOutline ? "transparent" : "#f0e6c8",
                  WebkitTextStroke: isOutline ? "1px #f0e6c8" : "0.5px #f0e6c8",
                  textShadow: "none",
                  letterSpacing: "0.05em",
                }}
              >
                SEQ1
              </h1>
            </div>
            <div
              className="text-center font-poppins italic text-lg"
              style={{
                color: "#f0e6c8",
                width: `${logoWidth}px`,
                margin: "0 auto",
                marginTop: `${topSpacing * 4}px`,
                letterSpacing: `${letterSpacing * 0.01}em`,
                fontWeight: fontWeight,
              }}
            >
              {subheadingText}
            </div>
          </div>
        </div>

        {/* Controls - Right Column */}
        <div className="w-full md:w-1/2 p-6 bg-[#15090f] rounded-lg">
          <div className="space-y-6">
            {/* Logo Controls */}
            <div className="pb-4 border-b border-gray-800">
              <h3 className="text-sm font-medium mb-4">Logo Settings</h3>

              <div className="flex justify-between items-center mb-4">
                <Label htmlFor="outline-toggle" className="text-sm">
                  Style
                </Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">Filled</span>
                  <Switch id="outline-toggle" checked={isOutline} onCheckedChange={setIsOutline} />
                  <span className="text-xs text-gray-400">Outline</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Label htmlFor="glow-slider" className="text-sm w-24">
                  Glow
                </Label>
                <div className="flex-1">
                  <Slider
                    name="Glow"
                    value={glowAmount}
                    min={0}
                    max={100}
                    orientation="horizontal"
                    size="sm"
                    readOnly={false}
                    onChange={setGlowAmount}
                  />
                </div>
                <span className="text-xs text-gray-400 w-8 text-right">{glowAmount}%</span>
              </div>
            </div>

            {/* Subheading Controls */}
            <div>
              <h3 className="text-sm font-medium mb-4">Subheading</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subheading" className="text-sm">
                    Text
                  </Label>
                  <Input
                    id="subheading"
                    value={subheadingText}
                    onChange={(e) => setSubheadingText(e.target.value)}
                    className="bg-gray-900 border-gray-700"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Label htmlFor="letter-spacing-slider" className="text-sm w-24">
                    Letter Spacing
                  </Label>
                  <div className="flex-1">
                    <Slider
                      name="Letter Spacing"
                      value={letterSpacing}
                      min={0}
                      max={30}
                      orientation="horizontal"
                      size="sm"
                      readOnly={false}
                      onChange={setLetterSpacing}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-12 text-right">{letterSpacing * 0.01}em</span>
                </div>

                <div className="flex items-center gap-4">
                  <Label htmlFor="font-weight-slider" className="text-sm w-24">
                    Weight
                  </Label>
                  <div className="flex-1">
                    <Slider
                      name="Font Weight"
                      value={fontWeight}
                      min={100}
                      max={600}
                      step={100}
                      orientation="horizontal"
                      size="sm"
                      readOnly={false}
                      onChange={setFontWeight}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-12 text-right">{fontWeight}</span>
                </div>

                <div className="flex items-center gap-4">
                  <Label htmlFor="top-spacing-slider" className="text-sm w-24">
                    Top Spacing
                  </Label>
                  <div className="flex-1">
                    <Slider
                      name="Top Spacing"
                      value={topSpacing}
                      min={0}
                      max={10}
                      orientation="horizontal"
                      size="sm"
                      readOnly={false}
                      onChange={setTopSpacing}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-12 text-right">{topSpacing * 4}px</span>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <Button onClick={exportSVG} className="w-full mt-6 bg-white text-black hover:bg-gray-200">
              Export SVG
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
