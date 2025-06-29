"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

// Define menu item type
type MenuItem = {
  id: string
  label: string
  icon: ReactNode
  action: () => void
  dividerAfter?: boolean
  disabled?: boolean
  comingSoon?: boolean
}

// Define context type
type MenuContextType = {
  isMenuOpen: boolean
  menuItems: MenuItem[]
  menuPosition: { top: number; left: number }
  openMenu: (items: MenuItem[], position: { top: number; left: number }) => void
  closeMenu: () => void
}

// Create context with default values
const MenuContext = createContext<MenuContextType>({
  isMenuOpen: false,
  menuItems: [],
  menuPosition: { top: 0, left: 0 },
  openMenu: () => {},
  closeMenu: () => {},
})

// Hook for using the menu context
export const useMenu = () => useContext(MenuContext)

// Provider component
export function MenuProvider({ children }: { children: ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })

  const openMenu = (items: MenuItem[], position: { top: number; left: number }) => {
    console.log("Opening menu with items:", items)
    setMenuItems(items)
    setMenuPosition(position)
    setIsMenuOpen(true)
  }

  const closeMenu = () => {
    console.log("Closing menu")
    setIsMenuOpen(false)
  }

  return (
    <MenuContext.Provider
      value={{
        isMenuOpen,
        menuItems,
        menuPosition,
        openMenu,
        closeMenu,
      }}
    >
      {children}
    </MenuContext.Provider>
  )
}
