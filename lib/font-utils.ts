/**
 * Utility functions for font handling
 */

/**
 * Determines if an element should use Space Mono font
 * @param element The DOM element to check
 * @returns boolean indicating if Space Mono should be used
 */
export function shouldUseSpaceMono(element: HTMLElement): boolean {
  // Check if element or any parent has the font-poppins class
  if (element.classList.contains("font-poppins") || element.closest(".font-poppins")) {
    return false
  }

  // Check if element is part of the SEQ1 logo
  if (element.classList.contains("seq1-logo") || element.classList.contains("seq1-brand")) {
    return false
  }

  // Default most elements to Space Mono
  return true
}

/**
 * Applies the appropriate font to an element
 * @param element The DOM element to apply font to
 */
export function applyAppropriateFont(element: HTMLElement): void {
  if (shouldUseSpaceMono(element)) {
    element.classList.add("font-mono")
    element.classList.remove("font-poppins")
  } else {
    element.classList.add("font-poppins")
    element.classList.remove("font-mono")
  }
}
