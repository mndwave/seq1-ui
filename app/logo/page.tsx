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

  const svgRef = useRef<SVGSVGElement>(null)
  const logoRef = useRef<HTMLHeadingElement>(null)

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
    if (!svgRef.current) return

    // Clone the SVG element
    const svgElement = svgRef.current.cloneNode(true) as SVGElement

    // Set viewBox and dimensions
    svgElement.setAttribute("width", "500")
    svgElement.setAttribute("height", "300")
    svgElement.setAttribute("viewBox", "0 0 500 300")

    // Create a group for the logo and text
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g")

    // Add the logo elements
    while (svgElement.firstChild) {
      group.appendChild(svgElement.firstChild)
    }

    // Add the subheading text
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
    text.setAttribute("x", "250")
    text.setAttribute("y", `${180 + topSpacing * 4}`) // Adjust y position based on top spacing
    text.setAttribute("text-anchor", "middle")
    text.setAttribute("font-family", "Poppins, sans-serif")
    text.setAttribute("font-size", "24")
    text.setAttribute("font-weight", fontWeight.toString())
    text.setAttribute("font-style", "italic")
    text.setAttribute("letter-spacing", `${letterSpacing * 0.01}em`)
    text.setAttribute("fill", "#f0e6c8")
    text.textContent = subheadingText

    group.appendChild(text)
    svgElement.appendChild(group)

    // Convert SVG to string
    const serializer = new XMLSerializer()
    let svgString = serializer.serializeToString(svgElement)

    // Add namespace
    svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"')

    // Add CSS
    const style = document.createElementNS("http://www.w3.org/2000/svg", "style")
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;1,100;1,200;1,300;1,400;1,500;1,600&display=swap');
    `
    svgElement.insertBefore(style, svgElement.firstChild)

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
