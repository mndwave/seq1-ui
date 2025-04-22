"use client"

import type React from "react"

import { useEffect, useRef } from "react"

interface DomToSVGProps {
  targetRef: React.RefObject<HTMLElement>
}

export default function DomToSVG({ targetRef }: DomToSVGProps) {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    // Dynamically import the dom-to-svg library
    import("dom-to-svg")
      .then(({ default: domtosvg }) => {
        // Set up event listener for export
        const handleExport = (event: CustomEvent) => {
          if (!targetRef.current) return

          try {
            // Get computed styles
            const styles = window.getComputedStyle(targetRef.current)
            const width = Number.parseInt(styles.width)
            const height = Number.parseInt(styles.height)

            // Convert DOM to SVG
            const svgDocument = domtosvg.elementToSVG(targetRef.current, {
              computedStyles: true,
              fonts: true,
              inlineResources: true,
            })

            // Set viewBox and dimensions
            const svgElement = svgDocument.documentElement
            svgElement.setAttribute("width", width.toString())
            svgElement.setAttribute("height", height.toString())
            svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`)

            // Convert to string
            const serializer = new XMLSerializer()
            const svgString = serializer.serializeToString(svgDocument)

            // Create a blob and download
            const blob = new Blob([svgString], { type: "image/svg+xml" })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.download = event.detail?.filename || "export.svg"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
          } catch (error) {
            console.error("SVG export failed:", error)
            alert("SVG export failed. Please try again.")
          }
        }

        // Add event listener
        window.addEventListener("export-svg", handleExport as EventListener)

        // Clean up
        return () => {
          window.removeEventListener("export-svg", handleExport as EventListener)
        }
      })
      .catch((error) => {
        console.error("Failed to load dom-to-svg:", error)
      })

    return () => {
      // Cleanup
    }
  }, [targetRef])

  return null
}
