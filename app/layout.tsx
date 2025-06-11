import type React from "react"
import "@/app/globals.css" // Original import
import { ThemeProvider } from "@/components/theme-provider"
import { MIDIProvider } from "@/components/midi-provider"
import { MenuProvider } from "@/lib/menu-context"
import { LogoAnimationProvider } from "@/lib/logo-animation-context"
import { AuthProvider } from "@/lib/auth-context"
import { WebSocketProvider } from "@/lib/websocket-context"
import { EnvProvider } from "@/lib/env-provider"
import GlobalMenu from "@/components/global-menu"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import { Poppins, Space_Mono } from "next/font/google" // Original font imports
import ApiErrorHandler from "@/components/api-error-handler"
import SessionEventHandler from "@/components/session-event-handler" // Added for session save modal
import { Toaster } from "@/components/ui/toaster" // Added for shadcn/ui toasts

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "SEQ1 | Where Music Becomes Intention", // Restored original metadata
  description: "Enter a new dimension of sound. SEQ1 is a creative instrument for intent-driven music production.", // Restored original metadata
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-mono antialiased", // Restored original body classes
          poppins.variable, // Apply Poppins CSS variable
          spaceMono.variable, // Apply Space Mono CSS variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false} // Restored original ThemeProvider props
          forcedTheme="dark" // Restored original ThemeProvider props
        >
          <EnvProvider>
            <LogoAnimationProvider>
              <MIDIProvider>
                <AuthProvider>
                  <WebSocketProvider>
                    <MenuProvider>
                      <ApiErrorHandler />
                      <SessionEventHandler /> {/* Integrated SessionEventHandler */}
                      {children}
                      <GlobalMenu />
                    </MenuProvider>
                  </WebSocketProvider>
                </AuthProvider>
              </MIDIProvider>
            </LogoAnimationProvider>
          </EnvProvider>
          <Toaster /> {/* Added Toaster for shadcn/ui toasts */}
        </ThemeProvider>
      </body>
    </html>
  )
}
