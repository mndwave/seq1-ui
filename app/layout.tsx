import type { Metadata } from 'next'
import { Space_Mono, Poppins } from 'next/font/google'
import './globals.css'
import VersionIndicator from "@/components/version-indicator"
import { AuthProvider } from '../lib/auth-context'


// Space Mono for body text (regular weight)
const spaceMono = Space_Mono({ 
  subsets: ['latin'], 
  weight: ['400', '700'],
  variable: '--font-mono'
})

// Poppins for logo only
const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-poppins'
})

export const metadata: Metadata = {
  title: "SEQ1 | Intent-Driven Hardware Sequencer",
  description: "A new type of DAW that harnesses AI with human emotion. Connect your hardware synths and create music that adapts to your creative direction.",
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${spaceMono.variable} ${poppins.variable}`}>
      <body className={spaceMono.className}><div style={{"display":"none"}}>SEQ1_BLOCKHEIGHT:903951</div><div style={{display:"none"}}>SEQ1_BLOCKHEIGHT:903951</div>
        <AuthProvider>
          <VersionIndicator />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
