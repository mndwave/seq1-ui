import type React from "react"
import "@/app/globals.css"
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
import { Poppins, Space_Mono } from "next/font/google"
import ApiErrorHandler from "@/components/api-error-handler"

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

// Update the metadata section with a more fitting title and description
export const metadata: Metadata = {
  title: "SEQ1 | Intent-Driven Hardware Sequencer",
  description:
    "A new type of DAW that harnesses AI with human emotion. Connect your hardware synths and create music that adapts to your creative direction.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Simple, direct favicon reference */}
        <link rel="icon" href="/seq1-correct-favicon.png" />
      </head>
      <body className={cn("min-h-screen bg-background font-mono antialiased", poppins.variable, spaceMono.variable)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
          <EnvProvider>
            <LogoAnimationProvider>
              <MIDIProvider>
                <AuthProvider>
                  <WebSocketProvider>
                    <MenuProvider>
                      <ApiErrorHandler />
                      {children}
                      <GlobalMenu />
                    </MenuProvider>
                  </WebSocketProvider>
                </AuthProvider>
              </MIDIProvider>
            </LogoAnimationProvider>
          </EnvProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
