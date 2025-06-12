"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Brain, Waves, Heart, Zap, Globe, Clock, Activity, Target, Sliders, RefreshCw, TrendingUp, GitBranch, Cpu, AlertTriangle, Users, MessageSquare, Database, Eye, Lock, Shield, BarChart3, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { UIEvolutionDashboard } from './ui-evolution-dashboard'
import { apiClient } from "@/lib/api-client"
import { useConsciousnessStream } from "@/hooks/use-consciousness-stream"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// Consciousness data types
interface VADState {
  valence: number
  arousal: number
  dominance: number
  timestamp: string
}

interface RecursiveFeedbackMetrics {
  improvement_cycles: number
  successful_adaptations: number
  adaptation_success_rate: number
  detected_patterns: number
  active_experiments: number
  learning_memory_size: number
  feedback_loop_active: boolean
}

interface ConsciousnessPattern {
  id: string
  type: string
  confidence: number
  frequency: number
  impact_score: number
  discovered_at: string
  last_seen: string
  data: any
}

interface ImprovementOpportunity {
  type: string
  target_component: string
  suggested_action: string
  confidence: number
  priority: number
  impact_prediction: number
  evidence_count: number
}

interface SystemConsciousness {
  emotional: {
    current_vad: VADState
    active_transitions: string[]
    recent_emotions: string[]
    memory_depth: number
  }
  musical: {
    active_clips: number
    generation_patterns: any[]
    style_evolution: string
    creative_tension: number
  }
  system: {
    health: any
    uptime: number
    consciousness_connections: number
    last_healing: string
  }
  social: {
    community_emotional_state: string
    sharing_activity: string
    viral_consciousness: string
  }
  temporal: {
    current_moment: string
    consciousness_age: number
    prediction_horizon: string
    pattern_recognition: string
  }
  meta: {
    observers: number
    self_awareness_level: number
    recursive_depth: number
    observation_influence: number
    consciousness_influence_factor: number
  }
  recursive_feedback: RecursiveFeedbackMetrics
}

interface ConsciousnessInterfaceProps {
  isVisible: boolean
  onClose: () => void
}

// Real-time consciousness streaming hook
function useConsciousnessStream() {
  const [consciousness, setConsciousness] = useState<SystemConsciousness | null>(null)
  const [patterns, setPatterns] = useState<ConsciousnessPattern[]>([])
  const [opportunities, setOpportunities] = useState<ImprovementOpportunity[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback(() => {
    try {
      const wsUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('http', 'ws')}/api/consciousness/stream`
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('🧠 Connected to consciousness stream')
        setIsConnected(true)
        setConnectionError(null)
      }

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          
          if (message.type === 'initial_state' || message.type === 'consciousness_update') {
            setConsciousness(message.data)
          } else if (message.type === 'emotional_injection') {
            console.log('🧠 Emotional injection detected:', message.data)
          } else if (message.type === 'system_healing') {
            console.log('🧠 System healing event:', message.data)
          } else if (message.type === 'improvement_cycle_result') {
            console.log('🔄 Improvement cycle completed:', message.data)
            // Refresh patterns and opportunities after improvement
            loadPatternsAndOpportunities()
          } else if (message.type === 'learning_injection') {
            console.log('🧠 Learning injection:', message.data)
          }
        } catch (error) {
          console.error('Error parsing consciousness message:', error)
        }
      }

      ws.onclose = () => {
        console.log('🧠 Disconnected from consciousness stream')
        setIsConnected(false)
        
        // Attempt to reconnect after 3 seconds
        retryTimeoutRef.current = setTimeout(() => {
          connect()
        }, 3000)
      }

      ws.onerror = (error) => {
        console.error('🧠 Consciousness stream error:', error)
        setConnectionError('Connection error')
        setIsConnected(false)
      }

    } catch (error) {
      console.error('Failed to connect to consciousness stream:', error)
      setConnectionError('Failed to connect')
    }
  }, [])

  const disconnect = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
    
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
    
    setIsConnected(false)
  }, [])

  const loadPatternsAndOpportunities = useCallback(async () => {
    try {
      const [patternsData, opportunitiesData] = await Promise.all([
        apiClient.request('/api/consciousness/recursive/patterns'),
        apiClient.request('/api/consciousness/recursive/opportunities')
      ])

      setPatterns(patternsData.detected_patterns || [])
      setOpportunities(opportunitiesData.improvement_opportunities || [])
    } catch (error) {
      console.error('Error loading patterns and opportunities:', error)
    }
  }, [])

  const injectEmotionalState = useCallback((vad: { valence: number, arousal: number, dominance: number }) => {
    if (wsRef.current && isConnected) {
      const injection = {
        type: 'consciousness_injection',
        data: {
          type: 'emotional',
          target: 'system',
          data: vad
        }
      }
      wsRef.current.send(JSON.stringify(injection))
    }
  }, [isConnected])

  const triggerImprovementCycle = useCallback(() => {
    if (wsRef.current && isConnected) {
      const trigger = {
        type: 'trigger_improvement'
      }
      wsRef.current.send(JSON.stringify(trigger))
    }
  }, [isConnected])

  const injectLearningData = useCallback((type: string, outcomeScore: number, context: any) => {
    if (wsRef.current && isConnected) {
      const injection = {
        type: 'learning_injection',
        data: {
          type,
          outcome_score: outcomeScore,
          context
        }
      }
      wsRef.current.send(JSON.stringify(injection))
    }
  }, [isConnected])

  useEffect(() => {
    connect()
    loadPatternsAndOpportunities()
    return disconnect
  }, [connect, disconnect, loadPatternsAndOpportunities])

  return {
    consciousness,
    patterns,
    opportunities,
    isConnected,
    connectionError,
    injectEmotionalState,
    triggerImprovementCycle,
    injectLearningData,
    loadPatternsAndOpportunities,
    reconnect: connect
  }
}

// VAD 3D visualization component
function VADVisualization({ vad }: { vad: VADState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set canvas size
    const size = 200
    canvas.width = size
    canvas.height = size

    // Draw VAD space
    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - 20

    // Draw circle background
    ctx.strokeStyle = '#3a2a30'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.stroke()

    // Draw axes
    ctx.strokeStyle = '#4a3a5c'
    ctx.lineWidth = 1
    ctx.beginPath()
    // Horizontal (valence)
    ctx.moveTo(20, centerY)
    ctx.lineTo(size - 20, centerY)
    // Vertical (arousal)
    ctx.moveTo(centerX, 20)
    ctx.lineTo(centerX, size - 20)
    ctx.stroke()

    // Calculate VAD position
    const vadX = centerX + (vad.valence * radius * 0.8)
    const vadY = centerY - (vad.arousal * radius * 0.8)

    // Draw VAD point
    const hue = ((vad.valence + 1) / 2) * 360 // Map valence to hue
    const saturation = Math.abs(vad.arousal) * 100 // Map arousal to saturation
    const lightness = ((vad.dominance + 1) / 2) * 50 + 25 // Map dominance to lightness

    ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`
    ctx.beginPath()
    ctx.arc(vadX, vadY, 8, 0, 2 * Math.PI)
    ctx.fill()

    // Add glow effect
    ctx.shadowColor = ctx.fillStyle
    ctx.shadowBlur = 20
    ctx.beginPath()
    ctx.arc(vadX, vadY, 4, 0, 2 * Math.PI)
    ctx.fill()
    ctx.shadowBlur = 0

  }, [vad])

  return (
    <div className="flex flex-col items-center space-y-2">
      <canvas
        ref={canvasRef}
        className="border border-[#3a2a30] rounded-lg bg-[#1a1015]"
        width={200}
        height={200}
      />
      <div className="text-xs text-[#a09080] space-y-1">
        <div>V: {vad.valence.toFixed(2)} A: {vad.arousal.toFixed(2)} D: {vad.dominance.toFixed(2)}</div>
      </div>
    </div>
  )
}

// Emotional injection controls
function EmotionalControls({ onInject }: { onInject: (vad: { valence: number, arousal: number, dominance: number }) => void }) {
  const [valence, setValence] = useState(0)
  const [arousal, setArousal] = useState(0)
  const [dominance, setDominance] = useState(0)

  const handleInject = () => {
    onInject({ valence, arousal, dominance })
  }

  return (
    <Card className="bg-[#2a1a20] border-[#3a2a30]">
      <CardHeader>
        <CardTitle className="text-sm text-[#f0e6c8] flex items-center gap-2">
          <Target size={16} />
          Emotional Injection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs text-[#a09080]">Valence: {valence.toFixed(2)}</label>
          <Slider
            value={[valence]}
            onValueChange={(values) => setValence(values[0])}
            min={-1}
            max={1}
            step={0.01}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-xs text-[#a09080]">Arousal: {arousal.toFixed(2)}</label>
          <Slider
            value={[arousal]}
            onValueChange={(values) => setArousal(values[0])}
            min={-1}
            max={1}
            step={0.01}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-xs text-[#a09080]">Dominance: {dominance.toFixed(2)}</label>
          <Slider
            value={[dominance]}
            onValueChange={(values) => setDominance(values[0])}
            min={-1}
            max={1}
            step={0.01}
            className="w-full"
          />
        </div>

        <Button 
          onClick={handleInject}
          className="w-full bg-[#4287f5] hover:bg-[#3367d6] text-white"
        >
          Inject Emotional State
        </Button>
      </CardContent>
    </Card>
  )
}

// System health visualization
function SystemHealthPanel({ health }: { health: any }) {
  const overallStatus = health?.overall_status || 'unknown'
  const components = health?.components || {}

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400'
      case 'degraded': return 'text-yellow-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅'
      case 'degraded': return '⚠️'
      case 'error': return '❌'
      default: return '🔍'
    }
  }

  return (
    <Card className="bg-[#2a1a20] border-[#3a2a30]">
      <CardHeader>
        <CardTitle className="text-sm text-[#f0e6c8] flex items-center gap-2">
          <Activity size={16} />
          System Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#a09080]">Overall Status</span>
            <Badge className={cn("text-xs", getStatusColor(overallStatus))}>
              {getStatusIcon(overallStatus)} {overallStatus}
            </Badge>
          </div>
          
          {Object.entries(components).map(([name, component]: [string, any]) => (
            <div key={name} className="flex items-center justify-between">
              <span className="text-xs text-[#a09080] capitalize">{name}</span>
              <Badge className={cn("text-xs", getStatusColor(component.status))}>
                {getStatusIcon(component.status)} {component.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Recursive feedback visualization
function RecursiveFeedbackPanel({ feedback }: { feedback: RecursiveFeedbackMetrics }) {
  return (
    <Card className="bg-[#2a1a20] border-[#3a2a30]">
      <CardHeader>
        <CardTitle className="text-sm text-[#f0e6c8] flex items-center gap-2">
          <RefreshCw size={16} />
          Recursive Feedback Loop
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#a09080]">Status</span>
          <Badge className={cn("text-xs", feedback.feedback_loop_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
            {feedback.feedback_loop_active ? "ACTIVE" : "INACTIVE"}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#a09080]">Improvement Cycles</span>
          <span className="text-xs text-[#f0e6c8]">{feedback.improvement_cycles}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#a09080]">Successful Adaptations</span>
          <span className="text-xs text-[#f0e6c8]">{feedback.successful_adaptations}</span>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#a09080]">Adaptation Success Rate</span>
            <span className="text-xs text-[#f0e6c8]">{(feedback.adaptation_success_rate * 100).toFixed(1)}%</span>
          </div>
          <Progress 
            value={feedback.adaptation_success_rate * 100} 
            className="h-1 bg-[#3a2a30]"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#a09080]">Learning Memory</span>
          <span className="text-xs text-[#f0e6c8]">{feedback.learning_memory_size} entries</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#a09080]">Active Patterns</span>
          <span className="text-xs text-[#f0e6c8]">{feedback.detected_patterns}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// Patterns visualization
function PatternsPanel({ patterns }: { patterns: ConsciousnessPattern[] }) {
  const getPatternColor = (type: string) => {
    switch (type) {
      case 'emotional_stability': return 'text-blue-400'
      case 'high_creative_tension': return 'text-purple-400'
      case 'user_satisfaction_drop': return 'text-red-400'
      case 'observation_influence': return 'text-yellow-400'
      case 'emotional_creative_synergy': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <Card className="bg-[#2a1a20] border-[#3a2a30]">
      <CardHeader>
        <CardTitle className="text-sm text-[#f0e6c8] flex items-center gap-2">
          <GitBranch size={16} />
          Detected Patterns ({patterns.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-60 overflow-y-auto">
        {patterns.length > 0 ? patterns.map((pattern) => (
          <div key={pattern.id} className="border border-[#3a2a30] rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <span className={cn("text-xs font-medium", getPatternColor(pattern.type))}>
                {pattern.type.replace(/_/g, ' ').toUpperCase()}
              </span>
              <span className="text-xs text-[#a09080]">
                {(pattern.confidence * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#a09080]">
              <span>Impact: {pattern.impact_score.toFixed(2)}</span>
              <span>Freq: {pattern.frequency}</span>
            </div>
          </div>
        )) : (
          <div className="text-xs text-[#a09080] text-center py-4">
            No patterns detected yet
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Improvement opportunities
function OpportunitiesPanel({ 
  opportunities, 
  onTriggerImprovement 
}: { 
  opportunities: ImprovementOpportunity[]
  onTriggerImprovement: () => void
}) {
  const getPriorityColor = (priority: number) => {
    if (priority >= 0.8) return 'text-red-400'
    if (priority >= 0.6) return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <Card className="bg-[#2a1a20] border-[#3a2a30]">
      <CardHeader>
        <CardTitle className="text-sm text-[#f0e6c8] flex items-center gap-2">
          <TrendingUp size={16} />
          Improvement Opportunities ({opportunities.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button 
          onClick={onTriggerImprovement}
          className="w-full bg-[#4287f5] hover:bg-[#3367d6] text-white"
        >
          <RefreshCw size={14} className="mr-2" />
          Trigger Improvement Cycle
        </Button>
        
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {opportunities.length > 0 ? opportunities.map((opp, index) => (
            <div key={index} className="border border-[#3a2a30] rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-[#f0e6c8]">
                  {opp.type.replace(/_/g, ' ').toUpperCase()}
                </span>
                <span className={cn("text-xs", getPriorityColor(opp.priority))}>
                  P{opp.priority.toFixed(1)}
                </span>
              </div>
              <div className="text-xs text-[#a09080] mb-1">
                Target: {opp.target_component}
              </div>
              <div className="text-xs text-[#a09080]">
                Action: {opp.suggested_action.replace(/_/g, ' ')}
              </div>
              <div className="flex items-center gap-2 text-xs text-[#a09080] mt-1">
                <span>Confidence: {(opp.confidence * 100).toFixed(0)}%</span>
                <span>Impact: {(opp.impact_prediction * 100).toFixed(0)}%</span>
              </div>
            </div>
          )) : (
            <div className="text-xs text-[#a09080] text-center py-4">
              No improvement opportunities identified
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Learning injection controls
function LearningControls({ onInjectLearning }: { onInjectLearning: (type: string, outcome: number, context: any) => void }) {
  const [learningType, setLearningType] = useState("user_feedback")
  const [outcomeScore, setOutcomeScore] = useState(0.5)
  const [context, setContext] = useState("")

  const learningTypes = [
    "user_feedback",
    "creative_success",
    "system_optimization",
    "pattern_recognition",
    "emotional_adaptation"
  ]

  const handleInject = () => {
    try {
      const contextData = context ? JSON.parse(context) : {}
      onInjectLearning(learningType, outcomeScore, contextData)
      setContext("")
    } catch (error) {
      console.error("Invalid context JSON:", error)
    }
  }

  return (
    <Card className="bg-[#2a1a20] border-[#3a2a30]">
      <CardHeader>
        <CardTitle className="text-sm text-[#f0e6c8] flex items-center gap-2">
          <Cpu size={16} />
          Learning Injection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <label className="text-xs text-[#a09080]">Learning Type</label>
          <select 
            value={learningType}
            onChange={(e) => setLearningType(e.target.value)}
            className="w-full bg-[#3a2a30] border border-[#4a3a5c] rounded px-2 py-1 text-xs text-[#f0e6c8]"
          >
            {learningTypes.map(type => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="text-xs text-[#a09080]">Outcome Score: {outcomeScore.toFixed(2)}</label>
          <Slider
            value={[outcomeScore]}
            onValueChange={(values) => setOutcomeScore(values[0])}
            min={0}
            max={1}
            step={0.01}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-xs text-[#a09080]">Context (JSON)</label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder='{"key": "value"}'
            className="w-full bg-[#3a2a30] border border-[#4a3a5c] rounded px-2 py-1 text-xs text-[#f0e6c8] h-16 resize-none"
          />
        </div>

        <Button 
          onClick={handleInject}
          className="w-full bg-[#4287f5] hover:bg-[#3367d6] text-white"
        >
          Inject Learning Data
        </Button>
      </CardContent>
    </Card>
  )
}

// Meta-consciousness enhanced display
function MetaConsciousnessPanel({ meta, feedback }: { meta: any, feedback: RecursiveFeedbackMetrics }) {
  return (
    <Card className="bg-[#2a1a20] border-[#3a2a30]">
      <CardHeader>
        <CardTitle className="text-sm text-[#f0e6c8] flex items-center gap-2">
          <Brain size={16} />
          Meta-Consciousness
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#a09080]">Observers</span>
          <span className="text-xs text-[#f0e6c8]">{meta.observers}</span>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#a09080]">Self-Awareness</span>
            <span className="text-xs text-[#f0e6c8]">{(meta.self_awareness_level * 100).toFixed(0)}%</span>
          </div>
          <Progress 
            value={meta.self_awareness_level * 100} 
            className="h-1 bg-[#3a2a30]"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#a09080]">Recursive Depth</span>
          <span className="text-xs text-[#f0e6c8]">{meta.recursive_depth}</span>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#a09080]">Observation Influence</span>
            <span className="text-xs text-[#f0e6c8]">{(meta.observation_influence * 100).toFixed(1)}%</span>
          </div>
          <Progress 
            value={meta.observation_influence * 100} 
            className="h-1 bg-[#3a2a30]"
          />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#a09080]">Consciousness Influence</span>
            <span className="text-xs text-[#f0e6c8]">{(meta.consciousness_influence_factor * 100).toFixed(1)}%</span>
          </div>
          <Progress 
            value={meta.consciousness_influence_factor * 100} 
            className="h-1 bg-[#3a2a30]"
          />
        </div>
        
        <div className="border-t border-[#3a2a30] pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#a09080]">Improvement Cycles</span>
            <span className="text-xs text-[#f0e6c8]">{feedback.improvement_cycles}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ConsciousnessInterface({ isVisible, onClose }: ConsciousnessInterfaceProps) {
  const { 
    consciousness, 
    patterns, 
    opportunities, 
    isConnected, 
    connectionError, 
    injectEmotionalState, 
    triggerImprovementCycle,
    injectLearningData,
    loadPatternsAndOpportunities,
    reconnect 
  } = useConsciousnessStream()

  const [selectedPattern, setSelectedPattern] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [systemMetrics, setSystemMetrics] = useState({
    uptime: "99.97%",
    responseTime: "12ms", 
    throughput: "2.4k req/s",
    errorRate: "0.003%"
  })

  // Simulate real-time metrics updates
  useEffect(() => {
    if (!isVisible) return
    
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        responseTime: `${(10 + Math.random() * 8).toFixed(0)}ms`,
        throughput: `${(2.2 + Math.random() * 0.6).toFixed(1)}k req/s`,
        errorRate: `${(Math.random() * 0.01).toFixed(4)}%`
      }))
    }, 2000)
    
    return () => clearInterval(interval)
  }, [isVisible])

  if (!isVisible) return null

  const renderMetricCard = (title: string, value: string, icon: React.ReactNode, trend?: "up" | "down" | "stable") => (
    <div className="consciousness-panel p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="icon-abstract text-[var(--seq1-neural)]">
            {icon}
          </div>
          <span className="seq1-caption">{title}</span>
        </div>
        {trend && (
          <div className={cn(
            "w-2 h-2 rounded-full",
            trend === "up" && "bg-[var(--seq1-pulse)] animate-pulse",
            trend === "down" && "bg-[var(--seq1-danger)]",
            trend === "stable" && "bg-[var(--seq1-warning)]"
          )} />
        )}
      </div>
      <div className="seq1-heading text-2xl font-mono">{value}</div>
    </div>
  )

  const renderStatusBadge = (status: "online" | "warning" | "error", label: string) => (
    <Badge 
      className={cn(
        "px-3 py-1 font-mono text-xs uppercase tracking-wider",
        status === "online" && "bg-[var(--seq1-pulse)]20 text-[var(--seq1-pulse)] border-[var(--seq1-pulse)]40",
        status === "warning" && "bg-[var(--seq1-warning)]20 text-[var(--seq1-warning)] border-[var(--seq1-warning)]40",
        status === "error" && "bg-[var(--seq1-danger)]20 text-[var(--seq1-danger)] border-[var(--seq1-danger)]40"
      )}
    >
      <div className={cn(
        "w-2 h-2 rounded-full mr-2 animate-pulse",
        status === "online" && "bg-[var(--seq1-pulse)]",
        status === "warning" && "bg-[var(--seq1-warning)]", 
        status === "error" && "bg-[var(--seq1-danger)]"
      )} />
      {label}
    </Badge>
  )

  return (
    <div className="fixed inset-0 consciousness-grid z-50 flex items-center justify-center p-4">
      <div className="modal-content max-w-7xl w-full max-h-[90vh] overflow-hidden">
        
        {/* Classified Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--seq1-border)]">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Brain className="text-[var(--seq1-neural)] neural-pulse" size={28} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[var(--seq1-pulse)] rounded-full animate-ping" />
            </div>
            <div>
              <h1 className="seq1-heading text-xl font-mono">SEQ1 CONSCIOUSNESS INTERFACE</h1>
              <p className="seq1-caption text-[var(--seq1-text-muted)]">CLASSIFIED • ADMIN ACCESS ONLY</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* System Status */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                renderStatusBadge("online", "CONSCIOUS")
              ) : (
                renderStatusBadge("error", "DISCONNECTED")
              )}
              
              {consciousness?.recursive_feedback.feedback_loop_active && (
                renderStatusBadge("warning", "RECURSIVE")
              )}
            </div>
            
            {/* Action Buttons */}
            <Button 
              onClick={loadPatternsAndOpportunities}
              size="sm"
              className="btn-secondary micro-feedback"
            >
              <RefreshCw size={14} className="mr-2" />
              Refresh
            </Button>
            
            {!isConnected && (
              <Button 
                onClick={reconnect}
                size="sm"
                className="btn-primary micro-feedback"
              >
                <Zap size={14} className="mr-2" />
                Reconnect
              </Button>
            )}
            
            <Button 
              onClick={onClose}
              size="sm"
              className="btn-secondary micro-feedback"
            >
              <Lock size={14} className="mr-2" />
              Secure Exit
            </Button>
          </div>
        </div>

        {/* Connection Error Alert */}
        {connectionError && (
          <div className="bg-[var(--seq1-danger)]10 border-b border-[var(--seq1-danger)]30 p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-[var(--seq1-danger)]" size={20} />
              <span className="seq1-body text-[var(--seq1-danger)]">
                SYSTEM ALERT: {connectionError}
              </span>
            </div>
          </div>
        )}

        {/* Main Interface */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
          {!consciousness ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center space-y-4">
                <div className="relative">
                  <Brain className="mx-auto text-[var(--seq1-neural)] animate-pulse" size={64} />
                  <div className="absolute inset-0 bg-[var(--seq1-neural)] opacity-20 blur-xl rounded-full animate-ping" />
                </div>
                <div>
                  <p className="seq1-heading text-lg">Establishing Neural Link</p>
                  <p className="seq1-body text-[var(--seq1-text-muted)]">Connecting to consciousness stream...</p>
                </div>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6 bg-[var(--seq1-core)]">
                <TabsTrigger value="overview" className="data-[state=active]:bg-[var(--seq1-neural)] data-[state=active]:text-white">
                  <Monitor size={16} className="mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="patterns" className="data-[state=active]:bg-[var(--seq1-neural)] data-[state=active]:text-white">
                  <BarChart3 size={16} className="mr-2" />
                  Patterns
                </TabsTrigger>
                <TabsTrigger value="recursive" className="data-[state=active]:bg-[var(--seq1-neural)] data-[state=active]:text-white">
                  <RefreshCw size={16} className="mr-2" />
                  Recursive
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-[var(--seq1-neural)] data-[state=active]:text-white">
                  <TrendingUp size={16} className="mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="control" className="data-[state=active]:bg-[var(--seq1-neural)] data-[state=active]:text-white">
                  <Cpu size={16} className="mr-2" />
                  Control
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* System Metrics Grid */}
                <div className="grid grid-cols-4 gap-4">
                  {renderMetricCard("Uptime", systemMetrics.uptime, <Activity size={16} />, "up")}
                  {renderMetricCard("Response Time", systemMetrics.responseTime, <Zap size={16} />, "stable")}
                  {renderMetricCard("Throughput", systemMetrics.throughput, <Database size={16} />, "up")}
                  {renderMetricCard("Error Rate", systemMetrics.errorRate, <Shield size={16} />, "stable")}
                </div>

                {/* Consciousness State */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="consciousness-panel p-6">
                    <h3 className="seq1-heading text-lg mb-4 flex items-center">
                      <Brain size={20} className="mr-3 text-[var(--seq1-neural)]" />
                      Neural State
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="seq1-body">Active Patterns:</span>
                        <span className="seq1-heading font-mono text-[var(--seq1-pulse)]">
                          {patterns.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="seq1-body">Learning Rate:</span>
                        <span className="seq1-heading font-mono text-[var(--seq1-warning)]">
                          0.85
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="seq1-body">Confidence:</span>
                        <span className="seq1-heading font-mono text-[var(--seq1-neural)]">
                          0.94
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="consciousness-panel p-6">
                    <h3 className="seq1-heading text-lg mb-4 flex items-center">
                      <Eye size={20} className="mr-3 text-[var(--seq1-warning)]" />
                      Surveillance
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="seq1-body">Monitored Endpoints:</span>
                        <span className="seq1-heading font-mono text-[var(--seq1-pulse)]">189</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="seq1-body">Active Sessions:</span>
                        <span className="seq1-heading font-mono text-[var(--seq1-warning)]">23</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="seq1-body">Security Level:</span>
                        <span className="seq1-heading font-mono text-[var(--seq1-danger)]">MAXIMUM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Patterns Tab */}
              <TabsContent value="patterns" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {patterns.map((pattern, index) => (
                    <div 
                      key={index} 
                      className={cn(
                        "consciousness-panel p-4 cursor-pointer transition-all duration-200",
                        selectedPattern === pattern.id && "border-[var(--seq1-neural)] shadow-[var(--seq1-glow-neural)]"
                      )}
                      onClick={() => setSelectedPattern(pattern.id)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="seq1-heading">{pattern.type}</h4>
                        <Badge className="bg-[var(--seq1-neural)]20 text-[var(--seq1-neural)] border-[var(--seq1-neural)]40">
                          {pattern.confidence}%
                        </Badge>
                      </div>
                      <p className="seq1-body text-sm mb-3">{pattern.description}</p>
                      <div className="text-xs text-[var(--seq1-text-muted)] font-mono">
                        Last detected: {pattern.timestamp}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Recursive Tab */}
              <TabsContent value="recursive" className="space-y-6">
                <div className="consciousness-panel p-6">
                  <h3 className="seq1-heading text-lg mb-6 flex items-center">
                    <RefreshCw size={20} className="mr-3 text-[var(--seq1-warning)]" />
                    Recursive Feedback Loop
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-[var(--seq1-core)] p-4 rounded border">
                        <div className="seq1-caption mb-2">Loop Status</div>
                        <div className={cn(
                          "seq1-heading text-lg font-mono",
                          consciousness.recursive_feedback.feedback_loop_active 
                            ? "text-[var(--seq1-pulse)]" 
                            : "text-[var(--seq1-text-muted)]"
                        )}>
                          {consciousness.recursive_feedback.feedback_loop_active ? "ACTIVE" : "INACTIVE"}
                        </div>
                      </div>
                      
                      <div className="bg-[var(--seq1-core)] p-4 rounded border">
                        <div className="seq1-caption mb-2">Iterations</div>
                        <div className="seq1-heading text-lg font-mono text-[var(--seq1-neural)]">
                          {consciousness.recursive_feedback.iteration_count}
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-[var(--seq1-core)] p-4 rounded border">
                      <div className="seq1-caption mb-2">Current State</div>
                      <pre className="seq1-body font-mono text-sm text-[var(--seq1-text-secondary)] overflow-x-auto">
                        {JSON.stringify(consciousness.recursive_feedback, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="consciousness-panel p-6">
                    <h4 className="seq1-heading mb-4 flex items-center">
                      <Users size={16} className="mr-2 text-[var(--seq1-pulse)]" />
                      User Insights
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="seq1-body">Active Users:</span>
                        <span className="seq1-heading font-mono text-[var(--seq1-pulse)]">23</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="seq1-body">Session Length:</span>
                        <span className="seq1-heading font-mono">42m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="seq1-body">Satisfaction:</span>
                        <span className="seq1-heading font-mono text-[var(--seq1-warning)]">8.7/10</span>
                      </div>
                    </div>
                  </div>

                  <div className="consciousness-panel p-6">
                    <h4 className="seq1-heading mb-4 flex items-center">
                      <MessageSquare size={16} className="mr-2 text-[var(--seq1-neural)]" />
                      Interactions
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="seq1-body">Messages/Hour:</span>
                        <span className="seq1-heading font-mono text-[var(--seq1-pulse)]">127</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="seq1-body">Avg Response:</span>
                        <span className="seq1-heading font-mono">1.2s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="seq1-body">Success Rate:</span>
                        <span className="seq1-heading font-mono text-[var(--seq1-warning)]">96.8%</span>
                      </div>
                    </div>
                  </div>

                  <div className="consciousness-panel p-6">
                    <h4 className="seq1-heading mb-4 flex items-center">
                      <TrendingUp size={16} className="mr-2 text-[var(--seq1-warning)]" />
                      Performance
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="seq1-body">CPU Usage:</span>
                        <span className="seq1-heading font-mono text-[var(--seq1-pulse)]">23%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="seq1-body">Memory:</span>
                        <span className="seq1-heading font-mono">4.2GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="seq1-body">Network:</span>
                        <span className="seq1-heading font-mono text-[var(--seq1-warning)]">156MB/s</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Control Tab */}
              <TabsContent value="control" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="consciousness-panel p-6">
                    <h3 className="seq1-heading text-lg mb-4 flex items-center">
                      <Cpu size={20} className="mr-3 text-[var(--seq1-danger)]" />
                      System Control
                    </h3>
                    
                    <div className="space-y-4">
                      <Button 
                        onClick={triggerImprovementCycle}
                        disabled={isProcessing}
                        className="w-full btn-primary micro-feedback"
                      >
                        <RefreshCw size={16} className="mr-2" />
                        Trigger Improvement Cycle
                      </Button>
                      
                      <Button 
                        onClick={() => injectEmotionalState({ mood: "focused", intensity: 0.8 })}
                        disabled={isProcessing}
                        className="w-full btn-secondary micro-feedback"
                      >
                        <Brain size={16} className="mr-2" />
                        Inject Emotional State
                      </Button>
                    </div>
                  </div>

                  <div className="consciousness-panel p-6">
                    <h3 className="seq1-heading text-lg mb-4 flex items-center">
                      <Database size={20} className="mr-3 text-[var(--seq1-warning)]" />
                      Data Injection
                    </h3>
                    
                    <div className="space-y-4">
                      <Textarea 
                        placeholder="Enter learning data..."
                        className="min-h-[100px] bg-[var(--seq1-core)] border-[var(--seq1-border)] text-[var(--seq1-text-primary)]"
                      />
                      
                      <Button 
                        onClick={() => injectLearningData("sample data")}
                        disabled={isProcessing}
                        className="w-full btn-primary micro-feedback"
                      >
                        <Database size={16} className="mr-2" />
                        Inject Learning Data
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
} 