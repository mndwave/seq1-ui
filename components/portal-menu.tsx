"use client"

import { createPortal } from "react-dom"
import { useEffect, useState, ReactNode } from "react"

interface PortalMenuProps {
  isOpen: boolean
  triggerRef: React.RefObject<HTMLButtonElement>
  children: ReactNode
}

export default function PortalMenu({ isOpen, triggerRef, children }: PortalMenuProps) {
  const [mounted, setMounted] = useState(false)
  const [position, setPosition] = useState({ left: 0, top: 0 })

  return createPortal(
    <div
      className="fixed pointer-events-auto modal-content py-2 animate-menuReveal shadow-xl"
      style={{
        width: "280px",
        left: position.left,
        top: position.top,
        zIndex: 2147483647,
        transformOrigin: "top left",
        maxHeight: "calc(100vh - 100px)",
        overflowY: "auto",
      }}
    >
      {children}
    </div>,
    document.body
  )
}
