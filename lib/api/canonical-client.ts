/**
 * CANONICAL API CLIENT - Direct connection to comprehensive FastAPI backend
 */

const CANONICAL_API_BASE = 'http://localhost:8000'

interface ApiResponse<T = any> {
  data?: T
  error?: string
  status: number
}

class CanonicalApiClient {
  private baseUrl: string
  private authToken: string | null = null

  constructor(baseUrl: string = CANONICAL_API_BASE) {
    this.baseUrl = baseUrl
  }

  setAuthToken(token: string | null) {
    this.authToken = token
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`
    }

    try {
      const response = await fetch(url, { ...options, headers })
      let data: T | undefined
      try { data = await response.json() } catch { }
      return {
        data,
        status: response.status,
        error: response.ok ? undefined : data?.toString() || `HTTP ${response.status}`
      }
    } catch (error) {
      return { status: 0, error: error?.toString() || 'Network error' }
    }
  }

  // TRANSPORT ENDPOINTS
  async transportPlay() { return this.request('/transport/play', { method: 'POST' }) }
  async transportStop() { return this.request('/transport/stop', { method: 'POST' }) }
  async transportStatus() { return this.request('/transport/status') }
  
  // AUTH ENDPOINTS
  async login(credentials: any) { return this.request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }) }
  async verify() { return this.request('/auth/verify') }
  
  // MUSICAL INTELLIGENCE
  async orchestrationGenerate(params: any) { return this.request('/orchestration/generate', { method: 'POST', body: JSON.stringify(params) }) }
  async midiDevices() { return this.request('/midi/devices') }
  async compositions() { return this.request('/compositions') }
  async health() { return this.request('/health') }
}

export const canonicalApi = new CanonicalApiClient()
export type { ApiResponse }
