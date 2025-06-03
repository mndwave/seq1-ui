import { NextResponse } from 'next/server'
import { getCurrentVersion } from '@/lib/version'

export async function GET() {
  /**
   * Version endpoint - returns current Bitcoin blockheight version
   * 
   * This endpoint provides the current system version for monitoring
   * and integration purposes. Version format: "[blockheight]"
   */
  
  const version = getCurrentVersion()
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString()
  
  return NextResponse.json({
    version,
    name: "SEQ1 UI",
    description: "SEQ1 Music Production Interface",
    build_time: buildTime,
    version_format: "bitcoin_blockheight",
    consensus_clock: version.replace(/[\[\]]/g, ''),
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  })
} 