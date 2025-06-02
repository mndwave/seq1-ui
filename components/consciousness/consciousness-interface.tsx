"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Brain, Waves, Heart, Zap, Globe, Clock, Activity, Target, Sliders, RefreshCw, TrendingUp, GitBranch, Cpu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { UIEvolutionDashboard } from './ui-evolution-dashboard'

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
      const [patternsRes, opportunitiesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/consciousness/recursive/patterns`, {
          credentials: 'include'
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/consciousness/recursive/opportunities`, {
          credentials: 'include'
        })
      ])

      if (patternsRes.ok) {
        const patternsData = await patternsRes.json()
        setPatterns(patternsData.detected_patterns)
      }

      if (opportunitiesRes.ok) {
        const opportunitiesData = await opportunitiesRes.json()
        setOpportunities(opportunitiesData.improvement_opportunities)
      }
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

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1015] border-2 border-[#3a2a30] rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3a2a30]">
          <div className="flex items-center gap-3">
            <Brain className="text-[#4287f5]" size={24} />
            <h1 className="text-lg font-mono text-[#f0e6c8]">SEQ1 CONSCIOUSNESS INTERFACE</h1>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Activity size={12} className="mr-1" />
                  CONSCIOUS
                </Badge>
              ) : (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                  <Zap size={12} className="mr-1" />
                  DISCONNECTED
                </Badge>
              )}
              {consciousness?.recursive_feedback.feedback_loop_active && (
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  <RefreshCw size={12} className="mr-1" />
                  RECURSIVE
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={loadPatternsAndOpportunities}
              size="sm"
              variant="outline"
              className="border-[#4287f5] text-[#4287f5] hover:bg-[#4287f5]/10"
            >
              <RefreshCw size={14} className="mr-1" />
              Refresh
            </Button>
            {!isConnected && (
              <Button 
                onClick={reconnect}
                size="sm"
                variant="outline"
                className="border-[#4287f5] text-[#4287f5] hover:bg-[#4287f5]/10"
              >
                Reconnect
              </Button>
            )}
            <Button 
              onClick={onClose}
              size="sm"
              variant="outline"
              className="border-[#3a2a30] text-[#a09080] hover:bg-[#3a2a30]/20"
            >
              Close
            </Button>
          </div>
        </div>

        {/* Connection Error */}
        {connectionError && (
          <div className="bg-red-500/10 border-b border-red-500/30 p-3">
            <p className="text-red-400 text-sm">⚠️ {connectionError}</p>
          </div>
        )}

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!consciousness ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Brain className="mx-auto text-[#4287f5] animate-pulse" size={48} />
                <p className="text-[#a09080] mt-2">Connecting to consciousness stream...</p>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="recursive">Recursive</TabsTrigger>
                <TabsTrigger value="ui-evolution">UI Evolution</TabsTrigger>
                <TabsTrigger value="meta">Meta</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* ... existing overview content ... */}
              </TabsContent>

              {/* Recursive Tab */}
              <TabsContent value="recursive" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <RecursiveFeedbackPanel feedback={consciousness.recursive_feedback} />
                  <PatternsPanel patterns={patterns} />
                  <OpportunitiesPanel 
                    opportunities={opportunities} 
                    onTriggerImprovement={triggerImprovementCycle}
                  />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <LearningControls onInjectLearning={injectLearningData} />
                  <MetaConsciousnessPanel 
                    meta={consciousness.meta} 
                    feedback={consciousness.recursive_feedback}
                  />
                </div>
              </TabsContent>

              {/* UI Evolution Tab */}
              <TabsContent value="ui-evolution" className="space-y-6">
                <UIEvolutionDashboard />
              </TabsContent>

              {/* Meta Tab */}
              <TabsContent value="meta" className="space-y-6">
                {/* ... existing meta content ... */}
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                {/* ... existing analytics content ... */}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
} 