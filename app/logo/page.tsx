"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import Script from "next/script"

export default function LogoGenerator() {
  const [isOutline, setIsOutline] = useState(true)
  const [glowAmount, setGlowAmount] = useState(0)
  const [subheadingText, setSubheadingText] = useState("www.seq1.net")
  const [logoWidth, setLogoWidth] = useState(0)
  const [isExporting, setIsExporting] = useState(false)

  // New state variables for subheading customization
  const [letterSpacing, setLetterSpacing] = useState(2) // 0-30 range (0.00em to 0.30em)
  const [fontWeight, setFontWeight] = useState(300) // 100-600 range
  const [topSpacing, setTopSpacing] = useState(3) // 0-10 range (0px to 40px)

  const logoRef = useRef<HTMLHeadingElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const exportRef = useRef<HTMLDivElement>(null)

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

  // Function to export the logo as PNG
  const exportPNG = async () => {
    if (!exportRef.current) {
      console.error("Export reference not found")
      return
    }

    setIsExporting(true)

    try {
      // Dynamically import html2canvas
      const html2canvas = (await import("html2canvas")).default

      // Set a scale for high resolution
      const scale = 4 // Increase for higher resolution

      // Options for html2canvas
      const options = {
        scale: scale, // Set the scale option
        useCORS: true, // Enable CORS to load images from different origins
        backgroundColor: null, // Make background transparent
        logging: false, // Disable logging
      }

      // Render the container to a canvas
      const canvas = await html2canvas(exportRef.current, options)

      // Convert canvas to a data URL
      const dataURL = canvas.toDataURL("image/png")

      // Create a download link
      const link = document.createElement("a")
      link.href = dataURL
      link.download = "seq1-logo.png" // Filename for the downloaded image

      // Append the link to the document, trigger the download, and remove the link
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      const url = window.URL.createObjectURL(new Blob()) // Declare url here
      URL.revokeObjectURL(url)

      console.log("PNG export completed")
    } catch (error) {
      console.error("PNG export failed:", error)
      alert("PNG export failed. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1015] text-white flex flex-col items-center py-12 px-4">
      {/* Load Poppins font */}
      <Script
        id="load-poppins"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
           if (!document.getElementById('poppins-font')) {
             const link = document.createElement('link');
             link.id = 'poppins-font';
             link.rel = 'stylesheet';
             link.href = 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;1,100;1,200;1,300;1,400;1,500;1,600&display=swap';
             document.head.appendChild(link);
           }
         `,
        }}
      />

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
                className="text-9xl font-semibold italic font-poppins tracking-wide"
                style={{
                  color: isOutline ? "transparent" : "#f0e6c8",
                  WebkitTextStroke: isOutline ? "1.5px #f0e6c8" : "0.5px #f0e6c8",
                  textShadow: "none",
                  letterSpacing: "0.05em",
                }}
              >
                SEQ1
              </h1>
            </div>
            <div
              className="text-center font-poppins italic text-3xl"
              style={{
                color: "#f0e6c8",
                width: `${logoWidth}px`,
                margin: "0 auto",
                marginTop: `${topSpacing * 12}px`,
                letterSpacing: `${letterSpacing * 0.02}em`,
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
            <Button
              onClick={exportPNG}
              className="w-full mt-6 bg-white text-black hover:bg-gray-200"
              disabled={isExporting}
            >
              {isExporting ? "Exporting..." : "Export High-Res PNG"}
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden export container */}
      <div className="fixed left-[-9999px] top-[-9999px]">
        <div
          ref={exportRef}
          className="flex flex-col items-center justify-center p-8"
          style={{ background: "transparent", minWidth: "2000px", minHeight: "1125px" }}
        >
          <div
            style={{
              filter:
                glowAmount > 0
                  ? `drop-shadow(0 0 ${glowAmount / 10}px rgba(240, 230, 200, ${glowAmount / 100}))`
                  : "none",
            }}
          >
            <div className="flex items-center justify-center">
              <h1
                className="font-semibold italic font-poppins tracking-wide"
                style={{
                  color: isOutline ? "transparent" : "#f0e6c8",
                  WebkitTextStroke: isOutline ? "1.5px #f0e6c8" : "0.5px #f0e6c8",
                  textShadow: "none",
                  letterSpacing: "0.05em",
                  fontSize: `${100 + glowAmount}px`, // Linear scaling for logo size
                }}
              >
                SEQ1
              </h1>
            </div>
            <div
              className="text-center font-poppins italic"
              style={{
                color: "#f0e6c8",
                width: `${logoWidth}px`,
                margin: "0 auto",
                marginTop: `${topSpacing * 12}px`,
                letterSpacing: `${letterSpacing * 0.02}em`,
                fontWeight: fontWeight,
                fontSize: `${24 + glowAmount * 0.5}px`, // Linear scaling for subheading size
              }}
            >
              {subheadingText}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
