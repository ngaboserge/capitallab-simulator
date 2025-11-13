'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity,
  ArrowUpIcon,
  ArrowDownIcon,
  AlertTriangle,
  Building2,
  UserCheck,
  FileText,
  Settings,
  BarChart3,
  Globe,
  Shield
} from 'lucide-react'

// Import existing admin dashboard
import { AdminDashboard } from '@/components/admin-dashboard'

interface PlatformMetrics {
  totalUsers: number
  activeUsers: number
  individualTraders: number
  teamMembers: number
  institutionalUsers: number
  totalTrades: number
  totalVolume: number
  platformModes: {
    individual: { users: number; trades: number; volume: number }
    team: { teams: number; members: number; trades: number }
    institutional: { workflows: number; submissions: number; settlements: number }
  }
}

interface InstitutionalWorkflow {
  id: string
  type: 'capital_raise' | 'listing' | 'settlement'
  issuer: string
  currentStage: string
  participants: string[]
  status: 'active' | 'completed' | 'rejected'
  createdAt: Date
  lastActivity: Date
}

interface EducationalScenario {
  id: string
  name: string
  type: 'crisis' | 'compliance' | 'market_stress'
  participants: number
  status: 'active' | 'scheduled' | 'completed'
  scheduledFor?: Date
}

export function EnhancedAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    individualTraders: 0,
    teamMembers: 0,
    institutionalUsers: 0,
    totalTrades: 0,
    totalVolume: 0,
    platformModes: {
      individual: { users: 0, trades: 0, volume: 0 },
      team: { teams: 0, members: 0, trades: 0 },
      institutional: { workflows: 0, submissions: 0, settlements: 0 }
    }
  })
  
  const [institutionalWorkflows, setInstitutionalWorkflows] = useState<InstitutionalWorkflow[]>([])
  const [educationalScenarios, setEducationalScenarios] = useState<EducationalScenario[]>([])

  useEffect(() => {
    // Mock enhanced platform data
    setPlatformMetrics({
      totalUsers: 2847,
      activeUsers: 1456,
      individualTraders: 1247,
      teamMembers: 892,
      institutionalUsers: 156,
      totalTrades: 15420,
      totalVolume: 45600000,
      platformModes: {
        individual: { users: 1247, trades: 8920, volume: 25400000 },
        team: { teams: 89, members: 892, trades: 4850 },
        institutional: { workflows: 23, submissions: 45, settlements: 156 }
      }
    })

    setInstitutionalWorkflows([
      {
        id: 'WF-001',
        type: 'capital_raise',
        issuer: 'TechCorp Ltd',
        currentStage: 'regulatory_review',
        participants: ['IB-001', 'REG-001'],
        status: 'active',
        createdAt: new Date('2024-01-20'),
        lastActivity: new Date('2024-01-22')
      },
      {
        id: 'WF-002',
        type: 'listing',
        issuer: 'AgriCorp Ltd',
        currentStage: 'isin_assignment',
        participants: ['IB-002', 'LST-001'],
        status: 'active',
        createdAt: new Date('2024-01-18'),
        lastActivity: new Date('2024-01-21')
      }
    ])

    setEducationalScenarios([
      {
        id: 'SC-001',
        name: 'Market Volatility Crisis',
        type: 'crisis',
        participants: 45,
        status: 'scheduled',
        scheduledFor: new Date('2024-01-25')
      },
      {
        id: 'SC-002',
        name: 'Regulatory Compliance Test',
        type: 'compliance',
        participants: 23,
        status: 'active'
      }
    ])
  }, [])

  const getWorkflowStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      completed: 'secondary',
      rejected: 'destructive'
    } as const
    
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>
  }

  const getScenarioStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      scheduled: 'secondary',
      completed: 'outline'
    } as const
    
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Platform Administration</h1>
          <p className="text-muted-foreground">
            Multi-mode platform oversight and institutional workflow management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">All Systems Operational</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Platform Overview</TabsTrigger>
          <TabsTrigger value="market">Market Admin</TabsTrigger>
          <TabsTrigger value="institutional">Institutional</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Platform-Wide Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformMetrics.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {platformMetrics.activeUsers} active today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Individual Traders</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformMetrics.individualTraders.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {platformMetrics.platformModes.individual.trades} trades
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformMetrics.teamMembers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {platformMetrics.platformModes.team.teams} active teams
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Institutional Users</CardTitle>
                <Building2 className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{platformMetrics.institutionalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {platformMetrics.platformModes.institutional.workflows} workflows
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  RWF {(platformMetrics.totalVolume / 1000000).toFixed(1)}M
                </div>
                <p className="text-xs text-muted-foreground">Across all modes</p>
              </CardContent>
            </Card>
          </div>

          {/* Mode Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Individual Mode
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Users</span>
                  <span className="font-medium">{platformMetrics.platformModes.individual.users}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Trades</span>
                  <span className="font-medium">{platformMetrics.platformModes.individual.trades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Volume</span>
                  <span className="font-medium">RWF {(platformMetrics.platformModes.individual.volume / 1000000).toFixed(1)}M</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-500" />
                  Team Mode
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Teams</span>
                  <span className="font-medium">{platformMetrics.platformModes.team.teams}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Team Members</span>
                  <span className="font-medium">{platformMetrics.platformModes.team.members}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Team Trades</span>
                  <span className="font-medium">{platformMetrics.platformModes.team.trades}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-purple-500" />
                  Institutional Mode
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active Workflows</span>
                  <span className="font-medium">{platformMetrics.platformModes.institutional.workflows}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Submissions</span>
                  <span className="font-medium">{platformMetrics.platformModes.institutional.submissions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Settlements</span>
                  <span className="font-medium">{platformMetrics.platformModes.institutional.settlements}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          {/* Existing Market Admin Dashboard */}
          <AdminDashboard />
        </TabsContent>

        <TabsContent value="institutional" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Workflows */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Active Institutional Workflows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {institutionalWorkflows.map((workflow) => (
                    <div key={workflow.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{workflow.issuer}</h4>
                        <p className="text-sm text-muted-foreground">
                          {workflow.type.replace('_', ' ')} • Stage: {workflow.currentStage.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {workflow.participants.length} participants • Last activity: {workflow.lastActivity.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getWorkflowStatusBadge(workflow.status)}
                        <Button size="sm" variant="outline">
                          Monitor
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Institutional System Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Regulatory Review Queue</span>
                    <Button size="sm" variant="outline">Manage</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">ISIN Assignment System</span>
                    <Button size="sm" variant="outline">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Settlement Orchestrator</span>
                    <Button size="sm" variant="outline">Monitor</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Document Generation</span>
                    <Button size="sm" variant="outline">Settings</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Audit Trail System</span>
                    <Button size="sm" variant="outline">View Logs</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Educational Scenarios</h3>
            <Button>Create New Scenario</Button>
          </div>

          <div className="space-y-4">
            {educationalScenarios.map((scenario) => (
              <Card key={scenario.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{scenario.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Type: {scenario.type.replace('_', ' ')} • {scenario.participants} participants
                      </p>
                      {scenario.scheduledFor && (
                        <p className="text-xs text-muted-foreground">
                          Scheduled: {scenario.scheduledFor.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getScenarioStatusBadge(scenario.status)}
                      <Button size="sm" variant="outline">
                        {scenario.status === 'active' ? 'Monitor' : 'Configure'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Cross-Platform Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Comprehensive analytics across all platform modes
                </p>
                <Button className="w-full">Open Analytics Dashboard</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Platform Health Monitor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Real-time system health and performance metrics
                </p>
                <Button className="w-full">View Health Dashboard</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}