/**
 * SEQ1 NOSTR Security Module
 * 
 * CRITICAL SECURITY PRINCIPLES:
 * - NEVER generate NOSTR keys server-side - SECURITY VIOLATION
 * - ALWAYS generate nsec/npub pairs in browser using nostr-tools
 * - ONLY send npub (public key) to server, nsec stays client-side
 * - STORE nsec securely in browser with encryption consideration
 */

import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools';

export interface NostrKeypair {
  privateKeyHex: string;
  publicKeyHex: string;
  nsec: string;
  npub: string;
  created: string;
}

/**
 * Generate NOSTR keypair CLIENT-SIDE ONLY
 * This function ensures keys are generated in the browser, never on server
 */
export const generateNostrKeypair = (): NostrKeypair => {
  console.log('🔐 Generating NOSTR keypair CLIENT-SIDE...');
  
  const privateKeyHex = generateSecretKey();
  const publicKeyHex = getPublicKey(privateKeyHex);
  const nsec = nip19.nsecEncode(privateKeyHex);
  const npub = nip19.npubEncode(publicKeyHex);
  
  console.log('✅ NOSTR keypair generated safely in browser');
  
  return {
    privateKeyHex: Buffer.from(privateKeyHex).toString('hex'),
    publicKeyHex: Buffer.from(publicKeyHex).toString('hex'),
    nsec,
    npub,
    created: new Date().toISOString()
  };
};

/**
 * Secure NOSTR Storage - handles encryption and browser storage
 * TODO: Implement encryption before localStorage for production
 */
export class SecureNostrStorage {
  private static readonly STORAGE_KEY = 'seq1_nostr_keys';
  
  /**
   * Store NOSTR keys securely in browser
   * WARNING: Currently using localStorage - needs encryption for production
   */
  static storeKeys(keypair: NostrKeypair): void {
    console.log('💾 Storing NOSTR keys securely...');
    
    // TODO: Implement encryption before storage
    const keyData = {
      nsec: keypair.nsec,
      npub: keypair.npub,
      created: keypair.created
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(keyData));
    console.log('✅ NOSTR keys stored (npub:', keypair.npub.substring(0, 20) + '...)');
  }
  
  /**
   * Retrieve stored NOSTR keys from browser
   */
  static getStoredKeys(): { nsec: string; npub: string; created: string } | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return null;
    
    try {
      const parsed = JSON.parse(stored);
      console.log('🔓 Retrieved stored NOSTR keys (npub:', parsed.npub?.substring(0, 20) + '...)');
      return parsed;
    } catch (error) {
      console.error('❌ Error parsing stored NOSTR keys:', error);
      return null;
    }
  }
  
  /**
   * Clear stored NOSTR keys (logout)
   */
  static clearKeys(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️ NOSTR keys cleared from storage');
  }
}

/**
 * NOSTR Authentication Flow States
 */
export enum NostrAuthState {
  ANONYMOUS = 'anonymous',
  GENERATING_KEYS = 'generating_keys',
  KEYS_GENERATED = 'keys_generated',
  AUTHENTICATING = 'authenticating',
  AUTHENTICATED = 'authenticated',
  ERROR = 'error'
}

/**
 * NOSTR Authentication Manager
 * Handles the complete authentication flow
 */
export class NostrAuthManager {
  /**
   * Create new NOSTR identity and authenticate with server
   * Flow: Generate keys → Store securely → Send npub to server → Get JWT
   */
  static async createNewIdentity(): Promise<{ npub: string; jwt?: string }> {
    console.log('🆕 Creating new NOSTR identity...');
    
    // Generate keypair CLIENT-SIDE
    const keypair = generateNostrKeypair();
    
    // Store securely in browser
    SecureNostrStorage.storeKeys(keypair);
    
    // Send ONLY npub to server for registration
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/nostr/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          npub: keypair.npub,
          // NEVER send nsec or privateKeyHex to server
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ NOSTR identity registered with server');
        return { npub: keypair.npub, jwt: data.jwt };
      } else {
        console.error('❌ Failed to register NOSTR identity with server');
        return { npub: keypair.npub };
      }
    } catch (error) {
      console.error('❌ Error registering NOSTR identity:', error);
      return { npub: keypair.npub };
    }
  }
  
  /**
   * Login with existing NOSTR keys
   * Flow: Load stored keys → Sign challenge → Send signed event → Get JWT
   */
  static async loginWithStoredKeys(): Promise<{ success: boolean; jwt?: string }> {
    console.log('🔑 Logging in with stored NOSTR keys...');
    
    const storedKeys = SecureNostrStorage.getStoredKeys();
    if (!storedKeys) {
      console.log('❌ No stored NOSTR keys found');
      return { success: false };
    }
    
    // TODO: Implement challenge signing
    // For now, just send npub for basic authentication
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/nostr/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          npub: storedKeys.npub,
          // TODO: Add signed challenge
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ NOSTR login successful');
        return { success: true, jwt: data.jwt };
      } else {
        console.error('❌ NOSTR login failed');
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Error during NOSTR login:', error);
      return { success: false };
    }
  }
} 