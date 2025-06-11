"use client"

import { useEffect } from "react"
import { applyAppropriateFont } from "@/lib/font-utils"

export function FontLoader() {
  useEffect(() => {
    // Add a class to the document to indicate that we're checking fonts
    document.documentElement.classList.add("fonts-loading")

    // Check if Space Mono is loaded
    const checkSpaceMonoLoaded = () => {
      if (document.fonts.check('1em "Space Mono"')) {
        document.documentElement.classList.add("space-mono-loaded")
        document.documentElement.classList.remove("fonts-loading")
        applyFontsToElements()
      } else {
        setTimeout(checkSpaceMonoLoaded, 100)
      }
    }

    // Apply fonts to all elements
    const applyFontsToElements = () => {
      const elements = document.querySelectorAll(
        "button, input, textarea, select, p, span, div, h1, h2, h3, h4, h5, h6",
      )

      elements.forEach((el) => {
        if (el instanceof HTMLElement) {
          applyAppropriateFont(el)
        }
      })
    }

    checkSpaceMonoLoaded()

    // Create a MutationObserver to watch for new elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              applyAppropriateFont(node)

              // Also check children
              const children = node.querySelectorAll(
                "button, input, textarea, select, p, span, div, h1, h2, h3, h4, h5, h6",
              )
              children.forEach((child) => {
                if (child instanceof HTMLElement) {
                  applyAppropriateFont(child)
                }
              })
            }
          })
        }
      })
    })

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })

    // Cleanup
    return () => {
      observer.disconnect()
    }
  }, [])

  return null
}
