'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Settings, 
  Activity, 
  Users, 
  TrendingUp, 
  Zap,
  Target,
  Award,
  Shield,
  Database,
  AlertTriangle,
  Play,
  Pause,
  BarChart3,
  Clock,
  CheckCircle,
  Crown,
  Briefcase,
  Building2
} from 'lucide-react'
import { marketEngine, MarketMakerProfile, MarketScenario, MarketOperation } from '@/lib/market-engine-system'
import { workflowEngine } from '@/lib/capitallab-workflow-engine'

interface MarketEngineDashboardProps {
  userId: string
  userRole: string
}

export function MarketEngineDashboard({ userId, userRole }: MarketEngineDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [marketMakerProfile, setMarketMakerProfile] = useState<MarketMakerProfile | null>(null)
  const [allMarketMakers, setAllMarketMakers] = useState<MarketMakerProfile[]>([])
  const [activeScenarios, setActiveScenarios] = useState<MarketScenario[]>([])
  const [recentOperations, setRecentOperations] = useState<MarketOperation[]>([])
  const [canGraduate, setCanGraduate] = useState(false)

  useEffect(() => {
    // Check if user can graduate to market maker
    const profile = marketEngine.evaluateForGraduation(userId)
    if (profile) {
      setMarketMakerProfile(profile)
    } else {
      // Check if user is close to graduation
      const completedWorkflows = marketEngine['getUserCompletedWorkflows'](userId)
      setCanGraduate(completedWorkflows?.length > 0)
    }
    
    // Load market data
    setAllMarketMakers(marketEngine.getAllMarketMakers())
    setActiveScenarios(marketEngine.getActiveScenarios())
    setRecentOperations(marketEngine.getMarketOperations(10))
  }, [userId])

  const handleGraduateToMarketMaker = () => {
    const profile = marketEngine.evaluateForGraduation(userId)
    if (profile) {
      setMarketMakerProfile(profile)
      setAllMarketMakers(marketEngine.getAllMarketMakers())
    }
  }

  const createDemoScenario = () => {
    if (!marketMakerProfile?.canCreateScenarios) return
    
    const scenario = marketEngine.createScenario(userId, {
      title: 'Market Volatility Crisis',
      description: 'Simulate high volatility conditions with increased regulatory scrutiny',
      type: 'crisis_simulation',
      targetRoles: ['broker', 'investor', 'regulator'],
      duration: 30,
      complexity: 'intermediate',
      marketConditions: {
        volatility: 8,
        liquidity: 3,
        regulatoryPressure: 7,
        economicEvents: ['Currency devaluation', 'Political uncertainty']
      },
      workflowModifications: {
        stageTimeouts: {
          'regulatory_review': 10,
          'due_diligence': 15,
          'prospectus_building': 20,
          'capital_raise_intent': 5,
          'ib_assignment': 5,
          'listing_approval': 10,
          'isin_assignment': 5,
          'investor_onboarding': 10,
          'trading_active': 60,
          'settlement': 5,
          'completed': 0
        },
        rejectionProbability: {
          'regulator': 0.3,
          'listing_desk': 0.2
        },
        documentRequirements: {
          'due_diligence': ['stress_test_results', 'risk_assessment']
        }
      },
      successCriteria: {
        completionRate: 0.7,
        timeLimit: 45,
        complianceScore: 0.8
      }
    })
    
    setActiveScenarios([...activeScenarios, scenario])
  }

  const executeLiquidityInjection = () => {
    if (!marketMakerProfile?.canProvideLiquidity) return
    
    const operation = marketEngine.executeMarketOperation(userId, {
      type: 'liquidity_injection',
      description: 'Emergency liquidity injection to stabilize market',
      targetInstruments: ['RW2024EQ1234', 'RW2024BD5678'],
      parameters: {
        liquidityAmount: 5000000,
        duration: 60
      }
    })
    
    setRecentOperations([operation, ...recentOperations])
  }

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'market_administrator': return 'bg-purple-100 text-purple-800'
      case 'market_supervisor': return 'bg-blue-100 text-blue-800'
      case 'senior_market_maker': return 'bg-green-100 text-green-800'
      case 'junior_market_maker': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role: string) => {
    const icons = {
      'liquidity_provider': TrendingUp,
      'scenario_creator': Target,
      'workflow_supervisor': Users,
      'system_administrator': Settings,
      'market_data_manager': BarChart3,
      'compliance_monitor': Shield
    }
    return icons[role as keyof typeof icons] || Activity
  }

  if (!marketMakerProfile && !canGraduate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Market Maker Graduation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-blue-50 border-blue-200">
            <Award className="h-4 w-4" />
            <AlertDescription>
              <strong>Complete Institutional Workflows to Graduate:</strong> 
              <br />
              To become a Market Maker and access the Market Engine, you need to complete at least one full capital raise workflow in any institutional role.
              <br /><br />
              <strong>Graduation Levels:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• <strong>Junior Market Maker:</strong> Complete 1 workflow</li>
                <li>• <strong>Senior Market Maker:</strong> Complete 3 workflows in different roles</li>
                <li>• <strong>Market Supervisor:</strong> Complete 5 workflows in 5+ roles</li>
                <li>• <strong>Market Administrator:</strong> Complete 8 workflows in all roles</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 text-center">
            <Button onClick={() => window.location.href = '/capitallab'}>
              Start Institutional Workflow
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!marketMakerProfile && canGraduate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5" />
            Ready for Market Maker Graduation!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Congratulations!</strong> You've completed institutional workflows and are eligible to graduate to Market Maker status.
              <br /><br />
              As a Market Maker, you'll be able to:
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Provide market liquidity</li>
                <li>• Create educational scenarios</li>
                <li>• Supervise other participants' workflows</li>
                <li>• Manage market operations</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 text-center">
            <Button onClick={handleGraduateToMarketMaker} size="lg">
              <Crown className="w-5 h-5 mr-2" />
              Graduate to Market Maker
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Market Maker Profile Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <Crown className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Market Engine Control Center</CardTitle>
                <p className="text-muted-foreground">
                  {marketMakerProfile.name} • {marketMakerProfile.level.replace('_', ' ').toUpperCase()}
                </p>
              </div>
            </div>
            <Badge className={getLevelBadgeColor(marketMakerProfile.level)}>
              {marketMakerProfile.level.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{marketMakerProfile.completedWorkflows.length}</div>
              <div className="text-sm text-muted-foreground">Workflows Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{marketMakerProfile.rolesExperienced.length}</div>
              <div className="text-sm text-muted-foreground">Roles Mastered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{marketMakerProfile.scenariosCreated}</div>
              <div className="text-sm text-muted-foreground">Scenarios Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{marketMakerProfile.supervisionRating.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">Supervision Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Market Overview</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="makers">Market Makers</TabsTrigger>
          <TabsTrigger value="workflows">Live Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Market Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Market Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Market State</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Workflows</span>
                    <span className="font-medium">7</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Market Makers</span>
                    <span className="font-medium">{allMarketMakers.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Your Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {marketMakerProfile.roles.map((role) => {
                    const Icon = getRoleIcon(role)
                    return (
                      <div key={role} className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">{role.replace('_', ' ')}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {marketMakerProfile.canCreateScenarios && (
                  <Button size="sm" className="w-full" onClick={createDemoScenario}>
                    Create Scenario
                  </Button>
                )}
                {marketMakerProfile.canProvideLiquidity && (
                  <Button size="sm" variant="outline" className="w-full" onClick={executeLiquidityInjection}>
                    Inject Liquidity
                  </Button>
                )}
                {marketMakerProfile.canManageMarketData && (
                  <Button size="sm" variant="outline" className="w-full">
                    Adjust Prices
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Market Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Market Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOperations.slice(0, 5).map((operation) => (
                  <div key={operation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <Activity className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{operation.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {operation.type.replace('_', ' ')} • {operation.executedAt.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Badge className={operation.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {operation.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Educational Scenarios</h3>
            {marketMakerProfile.canCreateScenarios && (
              <Button onClick={createDemoScenario}>
                <Target className="w-4 h-4 mr-2" />
                Create Scenario
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {activeScenarios.map((scenario) => (
              <Card key={scenario.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{scenario.title}</CardTitle>
                    <Badge className={scenario.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {scenario.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{scenario.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-sm font-medium">Duration</div>
                      <div className="text-xs text-muted-foreground">{scenario.duration} min</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-sm font-medium">Complexity</div>
                      <div className="text-xs text-muted-foreground">{scenario.complexity}</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-sm font-medium">Volatility</div>
                      <div className="text-xs text-muted-foreground">{scenario.marketConditions.volatility}/10</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-sm font-medium">Participants</div>
                      <div className="text-xs text-muted-foreground">{scenario.participants.length}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {scenario.status === 'draft' && marketMakerProfile.canSuperviseWorkflows && (
                      <Button size="sm">
                        <Play className="w-4 h-4 mr-2" />
                        Launch Scenario
                      </Button>
                    )}
                    {scenario.status === 'active' && (
                      <Button size="sm" variant="outline">
                        <Pause className="w-4 h-4 mr-2" />
                        Pause Scenario
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Market Operations History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOperations.map((operation) => (
                  <div key={operation.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{operation.description}</div>
                      <Badge className={operation.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {operation.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Type: {operation.type.replace('_', ' ')} • 
                      Executed: {operation.executedAt.toLocaleString()} • 
                      Impact: {operation.impact.workflowsAffected} workflows affected
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="makers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Market Maker Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {marketEngine.getMarketMakerLeaderboard().map((maker, index) => (
                  <div key={maker.userId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-bold text-muted-foreground">#{index + 1}</div>
                      <div className="p-2 rounded-lg bg-purple-100">
                        <Crown className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium">{maker.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {maker.completedWorkflows.length} workflows • {maker.rolesExperienced.length} roles
                        </div>
                      </div>
                    </div>
                    <Badge className={getLevelBadgeColor(maker.level)}>
                      {maker.level.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Workflow Supervision</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="bg-blue-50 border-blue-200">
                <Activity className="h-4 w-4" />
                <AlertDescription>
                  <strong>Real-Time Workflow Monitoring:</strong> As a Market Maker, you can supervise and intervene in active workflows to ensure smooth operations and provide educational guidance.
                </AlertDescription>
              </Alert>
              
              <div className="mt-6 text-center">
                <Button onClick={() => window.location.href = '/capitallab'}>
                  View Active Workflows
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}