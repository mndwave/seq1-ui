"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useMenu } from "@/lib/menu-context"

export default function GlobalMenu() {
  const { isMenuOpen, menuItems, menuPosition, closeMenu } = useMenu()
  const menuRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  // Set mounted state after component mounts (for SSR compatibility)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu()
      }
    }

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMenuOpen, closeMenu])

  if (!isMenuOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 2147483646 }}>
      <div
        ref={menuRef}
        className="absolute pointer-events-auto bg-[#2a1a20] border-2 border-[#3a2a30] w-64 py-1 animate-menuReveal shadow-xl"
        style={{
          top: `${menuPosition.top}px`,
          left: `${menuPosition.left}px`,
          width: "240px", // Fixed width to match calculation in button
          zIndex: 2147483647,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div className="bg-[#3a2a30] px-4 py-2">
          <h3 className="text-[#f0e6c8] text-sm tracking-wide">PROJECT MENU</h3>
        </div>

        <div className="p-2">
          {menuItems.map((item, index) => (
            <div key={item.id}>
              <div
                className="w-full text-left px-4 py-2 text-xs flex items-center rounded-sm relative group"
                role="menuitem"
              >
                <span className="mr-3 text-[#a09080] opacity-50">{item.icon}</span>
                <span className="text-[#a09080]">{item.label}</span>
                <div className="ml-2 px-1.5 py-0.5 text-[8px] bg-[#3a2a30] text-[#f0e6c8] rounded-sm tracking-wider inline-block">
                  <div className="absolute inset-0 dot-pattern opacity-10"></div>
                  COMING SOON
                </div>
              </div>
              {item.dividerAfter && <div className="border-t border-[#3a2a30] my-2"></div>}
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  )
}
