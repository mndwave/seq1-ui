"use client"

import { useEffect } from "react"

export function FontPreload() {
  useEffect(() => {
    // This forces the browser to load the font immediately
    document.documentElement.classList.add("font-loaded")

    // Add a small script to check if the font is loaded
    const checkFontLoaded = () => {
      if (document.fonts.check('1em "Space Mono"')) {
        document.documentElement.classList.add("space-mono-loaded")
      } else {
        setTimeout(checkFontLoaded, 100)
      }
    }

    checkFontLoaded()
  }, [])

  return null
}
