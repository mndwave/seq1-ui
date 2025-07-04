export const VERSION_INFO = {
  BITCOIN_BLOCKHEIGHT: '903386',
  DEPLOYMENT_TIMESTAMP: '2025-06-30T11:04:52.991177',
  COMMIT_HASH: 'REAL_DEPLOYMENT_903386', 
  DEPLOYMENT_TYPE: 'LIVE_SITE_UPDATE'
};

export default VERSION_INFO;

// Make blockheight globally available for detection
if (typeof window !== 'undefined') {
  window.NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT = '903386';
}

// MISSING FUNCTION IMPLEMENTATION - CRITICAL FIX
export async function fetchBitcoinBlockheight(): Promise<string> {
  try {
    const response = await fetch('https://blockchain.info/q/getblockcount');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const blockheight = await response.text();
    return `[${blockheight.trim()}]`;
  } catch (error) {
    console.error('Failed to fetch Bitcoin blockheight:', error);
    return `[${VERSION_INFO.BITCOIN_BLOCKHEIGHT}]`; // Fallback to hardcoded
  }
}

export function getCurrentVersion(): string {
  // Try environment variable first
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT) {
    return `[${process.env.NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT}]`;
  }
  
  // Try window global (client-side)
  if (typeof window !== 'undefined' && window.NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT) {
    return `[${window.NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT}]`;
  }
  
  // Return hardcoded version as fallback
  return `[${VERSION_INFO.BITCOIN_BLOCKHEIGHT}]`;
}
