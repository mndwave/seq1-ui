import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { MIDIProvider } from "@/components/midi-provider"
import { MenuProvider } from "@/lib/menu-context"
import { LogoAnimationProvider } from "@/lib/logo-animation-context"
import { AuthProvider } from "@/lib/auth-context"
import { WebSocketProvider } from "@/lib/websocket-context"
import GlobalMenu from "@/components/global-menu"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import { Poppins, Space_Mono } from "next/font/google"
import AuthErrorHandler from "@/components/auth/auth-error-handler"
import { FontLoader } from "@/components/font-loader"

// Keep Poppins configuration exactly as it was
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

// Ensure Space Mono is properly configured
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
  preload: true,
})

export const metadata: Metadata = {
  title: "SEQ1 | AI-Powered Hardware Sequencer",
  description:
    "A new type of DAW that harnesses AI with human emotion. Connect your hardware synths and create music that adapts to your creative direction.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
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
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* Add preconnect for Google Fonts to improve loading performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className={cn("min-h-screen bg-background antialiased", poppins.variable, spaceMono.variable)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
          <LogoAnimationProvider>
            <MIDIProvider>
              <AuthProvider>
                <WebSocketProvider>
                  <MenuProvider>
                    <FontLoader />
                    <AuthErrorHandler />
                    {children}
                    <GlobalMenu />
                  </MenuProvider>
                </WebSocketProvider>
              </AuthProvider>
            </MIDIProvider>
          </LogoAnimationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
