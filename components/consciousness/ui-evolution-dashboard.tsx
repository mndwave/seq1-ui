"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  MousePointer, 
  Clock, 
  Users, 
  Palette, 
  Type, 
  Layout,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  Shield,
  BarChart3
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface UIEvolutionMetrics {
  evolution_active: boolean
  auto_deployment_enabled: boolean
  total_variants_tested: number
  successful_evolutions: number
  evolution_success_rate: number
  user_engagement_improvement: number
  conversion_rate_improvement: number
  active_tests: number
  winning_variants: number
  engagement_data_points: number
}

interface UIVariant {
  variant_id: string
  evolution_type: string
  target_element: string
  status: string
  confidence_score: number
  created_at: string
  test_duration_hours: number
  original_value?: any
  variant_value?: any
}

interface EngagementMetric {
  element_id: string
  click_through_rate: number
  time_on_element: number
  bounce_rate: number
  conversion_rate: number
  user_satisfaction: number
  accessibility_score: number
  aesthetic_rating: number
}

export function UIEvolutionDashboard() {
  const [metrics, setMetrics] = useState<UIEvolutionMetrics | null>(null)
  const [activeVariants, setActiveVariants] = useState<UIVariant[]>([])
  const [winningVariants, setWinningVariants] = useState<UIVariant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUIEvolutionData()
    const interval = setInterval(fetchUIEvolutionData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchUIEvolutionData = async () => {
    try {
      const [metricsData, activeData, winningData] = await Promise.all([
        apiClient.request('/api/consciousness/ui-evolution/metrics'),
        apiClient.request('/api/consciousness/ui-evolution/variants/active'),
        apiClient.request('/api/consciousness/ui-evolution/variants/winning')
      ])

      setMetrics(metricsData.data?.ui_evolution_metrics || null)
      setActiveVariants(activeData.data?.active_variants || [])
      setWinningVariants(winningData.data?.winning_variants || [])
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch UI evolution data')
      setLoading(false)
    }
  }

  const approveVariant = async (variantId: string) => {
    try {
      await apiClient.request(`/api/consciousness/ui-evolution/variants/${variantId}/approve`, {
        method: 'POST'
      })
      fetchUIEvolutionData() // Refresh data
    } catch (err) {
      setError('Failed to approve variant')
    }
  }

  const revertVariant = async (variantId: string) => {
    try {
      await apiClient.request(`/api/consciousness/ui-evolution/variants/${variantId}/revert`, {
        method: 'POST'
      })
      fetchUIEvolutionData() // Refresh data
    } catch (err) {
      setError('Failed to revert variant')
    }
  }

  const getEvolutionTypeIcon = (type: string) => {
    switch (type) {
      case 'ui_layout': return <Layout className="h-4 w-4" />
      case 'color_scheme': return <Palette className="h-4 w-4" />
      case 'copy_text': return <Type className="h-4 w-4" />
      case 'button_style': return <MousePointer className="h-4 w-4" />
      case 'typography': return <Type className="h-4 w-4" />
      case 'animation': return <Zap className="h-4 w-4" />
      default: return <Sparkles className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'testing': return 'bg-blue-500'
      case 'winning': return 'bg-green-500'
      case 'losing': return 'bg-red-500'
      case 'deployed': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sacred Brand Protection Notice */}
      <Alert className="border-amber-200 bg-amber-50">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Brand Protection Active:</strong> Logo, core brand colors, and primary typography are protected from evolution. 
          Only secondary UI elements and copy can be optimized.
        </AlertDescription>
      </Alert>

      {/* Evolution Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Evolution Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(metrics.evolution_success_rate * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.successful_evolutions} of {metrics.total_variants_tested} variants
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Improvement</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                +{(metrics.user_engagement_improvement * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                User satisfaction increase
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tests</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.active_tests}</div>
              <p className="text-xs text-muted-foreground">
                Currently running A/B tests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Points</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.engagement_data_points.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Engagement metrics collected
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Evolution Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Tests ({activeVariants.length})</TabsTrigger>
          <TabsTrigger value="winning">Winning Variants ({winningVariants.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Active Tests */}
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Currently Running A/B Tests</CardTitle>
              <CardDescription>
                UI and language variants being tested with real users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeVariants.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No active tests running. The system will automatically create tests for underperforming elements.
                </p>
              ) : (
                <div className="space-y-4">
                  {activeVariants.map((variant) => (
                    <div key={variant.variant_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getEvolutionTypeIcon(variant.evolution_type)}
                          <span className="font-medium">{variant.target_element}</span>
                          <Badge className={getStatusColor(variant.status)}>
                            {variant.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(variant.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <p className="text-sm font-medium">Evolution Type</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {variant.evolution_type.replace('_', ' ')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Test Duration</p>
                          <p className="text-sm text-muted-foreground">
                            {variant.test_duration_hours} hours
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Confidence</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={variant.confidence_score * 100} className="flex-1" />
                            <span className="text-sm">{(variant.confidence_score * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Winning Variants */}
        <TabsContent value="winning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Winning Variants Ready for Deployment</CardTitle>
              <CardDescription>
                Variants that showed significant improvement and are ready to be deployed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {winningVariants.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No winning variants ready for deployment.
                </p>
              ) : (
                <div className="space-y-4">
                  {winningVariants.map((variant) => (
                    <div key={variant.variant_id} className="border rounded-lg p-4 bg-green-50 border-green-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          {getEvolutionTypeIcon(variant.evolution_type)}
                          <span className="font-medium">{variant.target_element}</span>
                          <Badge className="bg-green-500">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Winning
                          </Badge>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            onClick={() => approveVariant(variant.variant_id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Deploy
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => revertVariant(variant.variant_id)}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium mb-2">Original</p>
                          <div className="bg-gray-100 p-3 rounded text-sm">
                            {JSON.stringify(variant.original_value, null, 2)}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Improved Version</p>
                          <div className="bg-green-100 p-3 rounded text-sm">
                            {JSON.stringify(variant.variant_value, null, 2)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Confidence: {(variant.confidence_score * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-green-600 font-medium">
                          Ready for deployment
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Evolution Categories</CardTitle>
                <CardDescription>Types of UI elements being optimized</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Type className="h-4 w-4" />
                      <span>Copy & Text</span>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MousePointer className="h-4 w-4" />
                      <span>Button Styles</span>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Palette className="h-4 w-4" />
                      <span>Color Accents</span>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Layout className="h-4 w-4" />
                      <span>Layout & Spacing</span>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4" />
                      <span>Animations</span>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Protected Elements</CardTitle>
                <CardDescription>Brand elements that never evolve</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-amber-500" />
                      <span>Logo & Brand Marks</span>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800">Protected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-amber-500" />
                      <span>Primary Brand Colors</span>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800">Protected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-amber-500" />
                      <span>Brand Typography</span>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800">Protected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-amber-500" />
                      <span>Legal & Compliance Text</span>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800">Protected</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Evolution Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Evolution Impact</CardTitle>
              <CardDescription>How UI evolution is improving user experience</CardDescription>
            </CardHeader>
            <CardContent>
              {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      +{(metrics.user_engagement_improvement * 100).toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">User Engagement</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {(metrics.evolution_success_rate * 100).toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {metrics.total_variants_tested}
                    </div>
                    <p className="text-sm text-muted-foreground">Variants Tested</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 