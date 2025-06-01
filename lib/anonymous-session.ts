/**
 * SEQ1 Anonymous Session System - IMMERSIVE EXPERIENCE
 * 
 * Philosophy:
 * - Seamless, unlimited creative experience
 * - No threatening timers or pressure
 * - Gentle conversion opportunities at natural moments
 * - Focus on musical creation, not time limits
 */

export interface AnonymousSession {
  session_id: string;
  created_at: string;
  active_time_seconds: number;
  session_data: Record<string, any>;
  features_explored: string[];
  creative_moments: number;
}

export interface SessionHeartbeat {
  session_id: string;
  active_time_seconds: number;
  session_data: Record<string, any>;
  timestamp: string;
}

/**
 * Anonymous Session Manager - IMMERSIVE APPROACH
 * Tracks engagement and creativity, not time limits
 */
export class AnonymousSessionManager {
  private static readonly HEARTBEAT_INTERVAL = 60000; // 1 minute (less frequent)
  private static readonly STORAGE_KEY = 'seq1_anonymous_session';
  
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private session: AnonymousSession | null = null;
  private startTime: number = Date.now();
  private activeTime: number = 0;
  private isActive: boolean = true;
  private creativeMoments: number = 0;
  
  /**
   * Create new anonymous session - NO TIME LIMITS
   */
  async createAnonymousSession(): Promise<AnonymousSession | null> {
    console.log('🎭 Creating immersive anonymous session...');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sessions/anonymous/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_agent: navigator.userAgent,
          session_data: { 
            theme: 'dark', 
            onboarding_completed: false,
            features_explored: [],
            creative_moments: 0,
            immersive_mode: true
          }
        })
      });
      
      if (response.ok) {
        const sessionData = await response.json();
        this.session = sessionData;
        this.saveSessionToStorage(sessionData);
        this.startHeartbeat();
        console.log('✅ Immersive session created:', sessionData.session_id);
        return sessionData;
      } else {
        console.error('❌ Failed to create anonymous session');
        return null;
      }
    } catch (error) {
      console.error('❌ Error creating anonymous session:', error);
      return null;
    }
  }
  
  /**
   * Load existing session from storage or create new one
   */
  async initializeSession(): Promise<AnonymousSession | null> {
    const storedSession = this.loadSessionFromStorage();
    
    if (storedSession) {
      console.log('🔄 Resuming immersive session');
      this.session = storedSession;
      this.startHeartbeat();
      return storedSession;
    } else {
      console.log('🎨 Starting new creative session');
      return await this.createAnonymousSession();
    }
  }
  
  /**
   * Send heartbeat - tracks engagement, not time pressure
   */
  private async sendHeartbeat(): Promise<boolean> {
    if (!this.session) return false;
    
    this.activeTime += AnonymousSessionManager.HEARTBEAT_INTERVAL / 1000;
    
    const heartbeat: SessionHeartbeat = {
      session_id: this.session.session_id,
      active_time_seconds: this.activeTime,
      session_data: {
        ...this.session.session_data,
        last_heartbeat: new Date().toISOString(),
        creative_moments: this.creativeMoments
      },
      timestamp: new Date().toISOString()
    };
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sessions/anonymous/${this.session.session_id}/heartbeat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(heartbeat)
        }
      );
      
      if (response.ok) {
        const updatedSession = await response.json();
        this.session = { ...this.session, ...updatedSession };
        if (this.session) {
          this.saveSessionToStorage(this.session);
        }
        console.log('💓 Engagement tracked');
        return true;
      } else {
        console.error('❌ Heartbeat failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending heartbeat:', error);
      return false;
    }
  }
  
  /**
   * Start engagement tracking (not time pressure)
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isActive) {
        this.sendHeartbeat();
      }
    }, AnonymousSessionManager.HEARTBEAT_INTERVAL);
    
    console.log('💓 Engagement tracking started');
  }
  
  /**
   * Stop engagement tracking
   */
  stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      console.log('💓 Engagement tracking stopped');
    }
  }
  
  /**
   * Get session insights (not time pressure)
   */
  getSessionInsights(): {
    isActive: boolean;
    activeTimeMinutes: number;
    featuresExplored: number;
    creativeMoments: number;
    shouldShowGentleInvite: boolean;
  } {
    if (!this.session) {
      return {
        isActive: false,
        activeTimeMinutes: 0,
        featuresExplored: 0,
        creativeMoments: 0,
        shouldShowGentleInvite: false
      };
    }
    
    const activeTimeMinutes = Math.round(this.activeTime / 60);
    const featuresExplored = this.session.features_explored?.length || 0;
    
    // Show gentle invite after meaningful engagement (not time pressure)
    const shouldShowGentleInvite = 
      this.creativeMoments >= 3 && // Had some creative moments
      featuresExplored >= 2 && // Explored multiple features
      activeTimeMinutes >= 10; // Spent meaningful time (not rushed)
    
    return {
      isActive: true, // Always active - no time limits
      activeTimeMinutes,
      featuresExplored,
      creativeMoments: this.creativeMoments,
      shouldShowGentleInvite
    };
  }
  
  /**
   * Track creative moments (not time pressure)
   */
  recordCreativeMoment(moment: string): void {
    this.creativeMoments++;
    console.log(`🎨 Creative moment: ${moment} (total: ${this.creativeMoments})`);
  }
  
  /**
   * Track feature exploration
   */
  recordFeatureExploration(feature: string): void {
    if (!this.session) return;
    
    if (!this.session.features_explored) {
      this.session.features_explored = [];
    }
    
    if (!this.session.features_explored.includes(feature)) {
      this.session.features_explored.push(feature);
      console.log(`🔍 Feature explored: ${feature}`);
    }
  }
  
  /**
   * Convert to authenticated user (gentle, not forced)
   */
  async convertToAuthenticated(npub: string, jwt: string): Promise<boolean> {
    if (!this.session) return false;
    
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sessions/anonymous/${this.session.session_id}/convert`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          },
          body: JSON.stringify({ 
            npub,
            session_insights: {
              active_time_minutes: Math.round(this.activeTime / 60),
              features_explored: this.session.features_explored?.length || 0,
              creative_moments: this.creativeMoments
            }
          })
        }
      );
      
      if (response.ok) {
        console.log('✅ Session converted to authenticated (seamlessly)');
        this.clearSession();
        return true;
      } else {
        console.error('❌ Failed to convert session');
        return false;
      }
    } catch (error) {
      console.error('❌ Error converting session:', error);
      return false;
    }
  }
  
  /**
   * Clear session
   */
  clearSession(): void {
    this.stopHeartbeat();
    this.session = null;
    localStorage.removeItem(AnonymousSessionManager.STORAGE_KEY);
    console.log('🗑️ Session cleared');
  }
  
  // Private helper methods
  private saveSessionToStorage(session: AnonymousSession): void {
    localStorage.setItem(AnonymousSessionManager.STORAGE_KEY, JSON.stringify(session));
  }
  
  private loadSessionFromStorage(): AnonymousSession | null {
    const stored = localStorage.getItem(AnonymousSessionManager.STORAGE_KEY);
    if (!stored) return null;
    
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('❌ Error parsing stored session:', error);
      return null;
    }
  }
}

/**
 * Format active time for display (positive, not threatening)
 */
export const formatActiveTime = (minutes: number): string => {
  if (minutes < 60) return `${minutes} minutes of creativity`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m of musical exploration`;
}; 