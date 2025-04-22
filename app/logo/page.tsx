"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"

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
    // Create SVG paths for the SEQ1 logo
    // These are vector paths that represent the SEQ1 text
    const seq1Paths = [
      // S path
      "M45.5,36.8c-3.8,2.2-8.2,3.3-13.2,3.3c-7.5,0-13.5-2-18-6.1c-4.5-4-6.8-9.5-6.8-16.3c0-6.9,2.3-12.4,6.9-16.5 C18.9,0.7,24.9-1,32.3-1c4.9,0,9.3,1,13.2,3v10.6c-3.9-3-8.2-4.5-12.9-4.5c-4.2,0-7.6,1.3-10.1,3.9c-2.5,2.6-3.8,6.1-3.8,10.4 c0,4.3,1.2,7.7,3.7,10.2c2.5,2.5,5.8,3.8,10,3.8c4.8,0,9.1-1.5,13.1-4.5V36.8z",
      // E path
      "M83.5,39.3H54.8V-0.2h28.7v8.9H65.9v6.2h16.4v8.9H65.9v6.6h17.6V39.3z",
      // Q path
      "M123.2,39.3h-11.1l-3.8-9.8H93.1l-3.8,9.8H78.2L94.7-0.2h11.9L123.2,39.3z M105.4,20.6l-5.1-13.7l-5.1,13.7H105.4z M107.1,31.4 c2.9,0,5.3-1,7.2-2.9c1.9-1.9,2.9-4.3,2.9-7.2c0-2.8-1-5.2-2.9-7.1c-1.9-1.9-4.3-2.9-7.2-2.9c-2.8,0-5.2,1-7.1,2.9 c-1.9,1.9-2.9,4.3-2.9,7.1c0,2.9,1,5.3,2.9,7.2C101.9,30.4,104.3,31.4,107.1,31.4z",
      // 1 path
      "M150.2,39.3h-11.1V8.7h-10.4V-0.2h31.9v8.9h-10.4V39.3z",
    ]

    // Create a new SVG document
    const svgNamespace = "http://www.w3.org/2000/svg"
    const svgDoc = document.implementation.createDocument(svgNamespace, "svg", null)
    const svg = svgDoc.documentElement

    // Set SVG attributes
    svg.setAttribute("width", "300")
    svg.setAttribute("height", "200")
    svg.setAttribute("viewBox", "0 0 300 200")
    svg.setAttribute("xmlns", svgNamespace)

    // Create a group for the logo
    const logoGroup = document.createElementNS(svgNamespace, "g")
    logoGroup.setAttribute("transform", "translate(75, 80) scale(0.8)")

    // Create paths for each letter
    seq1Paths.forEach((pathData) => {
      const path = document.createElementNS(svgNamespace, "path")
      path.setAttribute("d", pathData)

      if (isOutline) {
        path.setAttribute("fill", "none")
        path.setAttribute("stroke", "#f0e6c8")
        path.setAttribute("stroke-width", "2")
      } else {
        path.setAttribute("fill", "#f0e6c8")
      }

      logoGroup.appendChild(path)
    })

    // Create the subheading text
    const subheadingElement = document.createElementNS(svgNamespace, "text")
    subheadingElement.setAttribute("x", "150")
    subheadingElement.setAttribute("y", `${120 + topSpacing * 4}`)
    subheadingElement.setAttribute("text-anchor", "middle")
    subheadingElement.setAttribute("font-family", "Arial, sans-serif") // Using standard font
    subheadingElement.setAttribute("font-size", "16")
    subheadingElement.setAttribute("font-weight", fontWeight.toString())
    subheadingElement.setAttribute("font-style", "italic")
    subheadingElement.setAttribute("letter-spacing", `${letterSpacing * 0.01}em`)
    subheadingElement.setAttribute("fill", "#f0e6c8")
    subheadingElement.textContent = subheadingText

    // Add glow filter if needed
    if (glowAmount > 0) {
      const defs = document.createElementNS(svgNamespace, "defs")
      const filter = document.createElementNS(svgNamespace, "filter")
      filter.setAttribute("id", "glow")
      filter.setAttribute("x", "-50%")
      filter.setAttribute("y", "-50%")
      filter.setAttribute("width", "200%")
      filter.setAttribute("height", "200%")

      const feGaussianBlur = document.createElementNS(svgNamespace, "feGaussianBlur")
      feGaussianBlur.setAttribute("stdDeviation", `${glowAmount / 10}`)
      feGaussianBlur.setAttribute("result", "blur")

      const feFlood = document.createElementNS(svgNamespace, "feFlood")
      feFlood.setAttribute("flood-color", "#f0e6c8")
      feFlood.setAttribute("flood-opacity", `${glowAmount / 100}`)
      feFlood.setAttribute("result", "color")

      const feComposite = document.createElementNS(svgNamespace, "feComposite")
      feComposite.setAttribute("in", "color")
      feComposite.setAttribute("in2", "blur")
      feComposite.setAttribute("operator", "in")
      feComposite.setAttribute("result", "glow")

      const feMerge = document.createElementNS(svgNamespace, "feMerge")
      const feMergeNode1 = document.createElementNS(svgNamespace, "feMergeNode")
      feMergeNode1.setAttribute("in", "glow")
      const feMergeNode2 = document.createElementNS(svgNamespace, "feMergeNode")
      feMergeNode2.setAttribute("in", "SourceGraphic")

      feMerge.appendChild(feMergeNode1)
      feMerge.appendChild(feMergeNode2)

      filter.appendChild(feGaussianBlur)
      filter.appendChild(feFlood)
      filter.appendChild(feComposite)
      filter.appendChild(feMerge)

      defs.appendChild(filter)
      svg.appendChild(defs)

      logoGroup.setAttribute("filter", "url(#glow)")
    }

    // Add elements to SVG
    svg.appendChild(logoGroup)
    svg.appendChild(subheadingElement)

    // Convert SVG to string
    const serializer = new XMLSerializer()
    const svgString = serializer.serializeToString(svg)

    // Create a blob and download
    const blob = new Blob([svgString], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
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

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="glow-slider" className="text-sm">
                    Glow
                  </Label>
                  <span className="text-xs text-gray-400">{glowAmount}%</span>
                </div>
                <Slider
                  id="glow-slider"
                  value={[glowAmount]}
                  min={0}
                  max={100}
                  step={1}
                  className="py-4"
                  onValueChange={(value) => setGlowAmount(value[0])}
                />
              </div>
            </div>

            {/* Subheading Controls */}
            <div>
              <h3 className="text-sm font-medium mb-4">Subheading</h3>

              <div className="space-y-6">
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

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="letter-spacing-slider" className="text-sm">
                      Letter Spacing
                    </Label>
                    <span className="text-xs text-gray-400">{letterSpacing * 0.01}em</span>
                  </div>
                  <Slider
                    id="letter-spacing-slider"
                    value={[letterSpacing]}
                    min={0}
                    max={30}
                    step={1}
                    className="py-4"
                    onValueChange={(value) => setLetterSpacing(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="font-weight-slider" className="text-sm">
                      Weight
                    </Label>
                    <span className="text-xs text-gray-400">{fontWeight}</span>
                  </div>
                  <Slider
                    id="font-weight-slider"
                    value={[fontWeight]}
                    min={100}
                    max={600}
                    step={100}
                    className="py-4"
                    onValueChange={(value) => setFontWeight(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="top-spacing-slider" className="text-sm">
                      Top Spacing
                    </Label>
                    <span className="text-xs text-gray-400">{topSpacing * 4}px</span>
                  </div>
                  <Slider
                    id="top-spacing-slider"
                    value={[topSpacing]}
                    min={0}
                    max={10}
                    step={1}
                    className="py-4"
                    onValueChange={(value) => setTopSpacing(value[0])}
                  />
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
