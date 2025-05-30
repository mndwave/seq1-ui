// lib/api-services.ts
import { apiClient } from "@/lib/api-client" // Your configured API client instance

interface SystemStatus {
  status: string
  version: string
  uptime?: number
  // Add other relevant system status fields
}

export class SystemAPI {
  static async getSystemStatus(): Promise<SystemStatus> {
    // Assuming an endpoint like /api/system/status
    return apiClient.request<SystemStatus>("/api/system/status")
  }

  static async testApiConnectivity(): Promise<{ success: boolean; message: string; data?: any }> {
    // This is a simplified version. Your actual testApiConnectivity might be more complex
    // and could live in lib/real-api-tests.ts if it's for comprehensive testing.
    // For a simple client-side check:
    try {
      const response = await apiClient.request<any>("/api/health-check") // Assuming a health-check endpoint
      return { success: true, message: "API connection successful.", data: response }
    } catch (error: any) {
      return { success: false, message: `API connection failed: ${error.message || "Unknown error"}` }
    }
  }
}

// Transport API
interface TransportState {
  isPlaying: boolean
  bpm: number
  timeSignature: string
  position: number
  // Add other transport state fields
}
export class TransportAPI {
  static async play(): Promise<any> {
    return apiClient.request("/api/transport/play", { method: "POST" })
  }

  static async stop(): Promise<any> {
    return apiClient.request("/api/transport/stop", { method: "POST" })
  }

  static async setBPM(bpm: number): Promise<any> {
    return apiClient.request("/api/transport/bpm", {
      method: "POST",
      body: JSON.stringify({ bpm }),
    })
  }

  static async setTimeSignature(numerator: number, denominator: number): Promise<any> {
    return apiClient.request("/api/transport/time-signature", {
      method: "POST",
      body: JSON.stringify({ numerator, denominator }),
    })
  }

  static async getState(): Promise<TransportState> {
    return apiClient.request<TransportState>("/api/transport")
  }

  static async getPublicTransportState(): Promise<Partial<TransportState>> {
    // Assuming a different endpoint or a version of /api/transport that returns limited public info
    return apiClient.request<Partial<TransportState>>("/api/transport/public")
  }

  static async setPlayheadPosition(position: number): Promise<any> {
    return apiClient.request("/api/transport/playhead", {
      method: "POST",
      body: JSON.stringify({ position }),
    })
  }

  static async playMidiClip(clipId: string, deviceId?: string): Promise<any> {
    return apiClient.request("/api/midi/play", {
      method: "POST",
      body: JSON.stringify({ clipId, deviceId }),
    })
  }
}

// Device API
interface Device {
  id: string
  name: string
  type: string
  connected: boolean
  // other properties
}
export class DeviceAPI {
  static async listDevices(): Promise<Device[]> {
    return apiClient.request<Device[]>("/api/devices")
  }

  static async connectDevice(deviceId: string): Promise<any> {
    return apiClient.request(`/api/devices/${deviceId}/connect`, {
      method: "POST",
    })
  }

  static async disconnectDevice(deviceId: string): Promise<any> {
    return apiClient.request(`/api/devices/${deviceId}/disconnect`, {
      method: "POST",
    })
  }

  static async sendMIDI(deviceId: string, message: any): Promise<any> {
    return apiClient.request("/api/midi/send", {
      method: "POST",
      body: JSON.stringify({ deviceId, message }),
    })
  }

  static async scanDevices(): Promise<any> {
    return apiClient.request("/api/devices/scan", { method: "POST" })
  }
}

// Chat API
interface ChatMessage {
  id: string
  sender: string // 'user' | 'ai'
  content: string
  timestamp: string
}
export class ChatAPI {
  static async sendMessage(content: string): Promise<ChatMessage> {
    return apiClient.request<ChatMessage>("/api/chat/message", {
      // Or your actual chat endpoint
      method: "POST",
      body: JSON.stringify({ content }), // Or { prompt: content } depending on backend
    })
  }

  static async getChatHistory(limit = 50): Promise<ChatMessage[]> {
    return apiClient.request<ChatMessage[]>(`/api/chat/history?limit=${limit}`)
  }

  static async clearHistory(): Promise<any> {
    return apiClient.request("/api/chat/clear", { method: "POST" })
  }
}

// Project API
interface Project {
  id: string
  name: string
  bpm: number
  timeSignature: string
  // other project data
}
interface ProjectData {
  [key: string]: any
}
export class ProjectAPI {
  static async listProjects(): Promise<Project[]> {
    return apiClient.request<Project[]>("/api/projects")
  }

  static async createProject(name: string, bpm = 120, timeSignature = "4/4"): Promise<Project> {
    return apiClient.request<Project>("/api/projects", {
      method: "POST",
      body: JSON.stringify({ name, bpm, timeSignature }),
    })
  }

  static async loadProject(projectId: string): Promise<Project> {
    return apiClient.request<Project>(`/api/projects/${projectId}`)
  }

  static async saveProject(projectId: string, data: ProjectData): Promise<Project> {
    return apiClient.request<Project>(`/api/projects/${projectId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }
}
