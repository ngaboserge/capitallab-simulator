'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Building2, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MessageSquare,
  FileText,
  Award,
  Target,
  Activity,
  Globe,
  ArrowRight,
  Play,
  Pause,
  BarChart3
} from 'lucide-react'

interface TeamDashboardProps {
  teamId: string
}

interface TeamData {
  id: string
  name: string
  university: string
  members: TeamMember[]
  currentDeal: Deal | null
  progress: WorkflowProgress
  performance: TeamMetrics
  status: 'forming' | 'active' | 'completed' | 'paused'
}

interface TeamMember {
  id: string
  name: string
  role: string
  isOnline: boolean
  avatar: string
  performance: number
}

interface Deal {
  companyName: string
  sector: string
  capitalTarget: number
  currentStep: number
  totalSteps: number
  estimatedCompletion: Date
}

interface WorkflowProgress {
  currentStep: number
  totalSteps: number
  completedSteps: number
  nextActions: NextAction[]
}

interface NextAction {
  description: string
  assignedRole: string
  assignedTo: string
  dueDate: Date
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

interface TeamMetrics {
  overallScore: number
  collaborationScore: number
  processEfficiency: number
  rankings: {
    overall: number
    university: number
    sector: number
  }
}

export function CollaborativeTeamDashboard({ teamId }: TeamDashboardProps) {
  const [teamData, setTeamData] = useState<TeamData | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'workflow' | 'members' | 'market'>('overview')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockTeamData: TeamData = {
      id: teamId,
      name: "Kigali University Capital Markets 2024",
      university: "University of Rwanda - Kigali",
      members: [
        { id: '1', name: 'Alice Uwimana', role: 'Issuer', isOnline: true, avatar: '/avatars/alice.jpg', performance: 92 },
        { id: '2', name: 'Jean Baptiste', role: 'IB Advisor', isOnline: true, avatar: '/avatars/jean.jpg', performance: 88 },
        { id: '3', name: 'Grace Mukamana', role: 'CMA Regulator', isOnline: false, avatar: '/avatars/grace.jpg', performance: 95 },
        { id: '4', name: 'David Nkurunziza', role: 'RSE Listing Desk', isOnline: true, avatar: '/avatars/david.jpg', performance: 87 },
        { id: '5', name: 'Sarah Ingabire', role: 'Licensed Broker', isOnline: true, avatar: '/avatars/sarah.jpg', performance: 91 },
        { id: '6', name: 'Eric Habimana', role: 'Investor', isOnline: false, avatar: '/avatars/eric.jpg', performance: 89 },
        { id: '7', name: 'Marie Nyirahabimana', role: 'Investor', isOnline: true, avatar: '/avatars/marie.jpg', performance: 93 },
        { id: '8', name: 'Patrick Nzeyimana', role: 'CSD Operator', isOnline: true, avatar: '/avatars/patrick.jpg', performance: 90 }
      ],
      currentDeal: {
        companyName: "Green Energy Rwanda Ltd",
        sector: "Renewable Energy",
        capitalTarget: 500000000,
        currentStep: 3,
        totalSteps: 7,
        estimatedCompletion: new Date('2024-12-15')
      },
      progress: {
        currentStep: 3,
        totalSteps: 7,
        completedSteps: 2,
        nextActions: [
          {
            description: "Review and approve regulatory filing",
            assignedRole: "CMA Regulator",
            assignedTo: "Grace Mukamana",
            dueDate: new Date('2024-11-05'),
            priority: 'high'
          },
          {
            description: "Prepare listing documentation",
            assignedRole: "RSE Listing Desk",
            assignedTo: "David Nkurunziza",
            dueDate: new Date('2024-11-08'),
            priority: 'medium'
          }
        ]
      },
      performance: {
        overallScore: 91,
        collaborationScore: 88,
        processEfficiency: 94,
        rankings: {
          overall: 3,
          university: 1,
          sector: 2
        }
      },
      status: 'active'
    }

    setTimeout(() => {
      setTeamData(mockTeamData)
      setIsLoading(false)
    }, 1000)
  }, [teamId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading team dashboard...</p>
        </div>
      </div>
    )
  }

  if (!teamData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Team not found or access denied.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const progressPercentage = (teamData.progress.completedSteps / teamData.progress.totalSteps) * 100

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-lg">
                  <Users className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{teamData.name}</h1>
                  <p className="text-muted-foreground">{teamData.university}</p>
                </div>
              </div>
              
              {teamData.currentDeal && (
                <div className="flex items-center gap-4 text-sm">
                  <Badge className="bg-green-100 text-green-800">
                    <Building2 className="w-3 h-3 mr-1" />
                    {teamData.currentDeal.companyName}
                  </Badge>
                  <Badge variant="outline">
                    Step {teamData.currentDeal.currentStep}/{teamData.currentDeal.totalSteps}
                  </Badge>
                  <Badge variant="outline">
                    {teamData.members.filter(m => m.isOnline).length}/{teamData.members.length} online
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Team Chat
              </Button>
              <Button size="sm">
                <Play className="w-4 h-4 mr-2" />
                Continue Process
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'workflow', label: 'Workflow', icon: ArrowRight },
              { id: 'members', label: 'Team Members', icon: Users },
              { id: 'market', label: 'Market Data', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Progress Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Current Deal Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {teamData.currentDeal && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{teamData.currentDeal.companyName}</h3>
                          <p className="text-muted-foreground">{teamData.currentDeal.sector}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            RWF {(teamData.currentDeal.capitalTarget / 1000000).toFixed(0)}M
                          </p>
                          <p className="text-sm text-muted-foreground">Target Capital</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>{progressPercentage.toFixed(0)}% Complete</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Current Step</p>
                          <p className="font-medium">Step {teamData.currentDeal.currentStep}: Regulatory Review</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Est. Completion</p>
                          <p className="font-medium">{teamData.currentDeal.estimatedCompletion.toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Team Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Overall Score</span>
                      <span className="font-bold text-lg">{teamData.performance.overallScore}/100</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Collaboration</span>
                      <span className="font-medium">{teamData.performance.collaborationScore}/100</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Efficiency</span>
                      <span className="font-medium">{teamData.performance.processEfficiency}/100</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <h4 className="font-medium text-sm">Rankings</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Overall</span>
                        <span>#{teamData.performance.rankings.overall}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">University</span>
                        <span>#{teamData.performance.rankings.university}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sector</span>
                        <span>#{teamData.performance.rankings.sector}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Next Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Next Actions Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamData.progress.nextActions.map((action, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{action.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Assigned to: {action.assignedTo}</span>
                          <span>Role: {action.assignedRole}</span>
                          <span>Due: {action.dueDate.toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Badge 
                        className={
                          action.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          action.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          action.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {action.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Team Members Quick View */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {teamData.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          member.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                        <p className="text-xs text-green-600">{member.performance}% performance</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'workflow' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Capital Raising Workflow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { step: 1, name: 'Capital Intent Submission', status: 'completed', role: 'Issuer' },
                    { step: 2, name: 'Deal Structuring & Advisory', status: 'completed', role: 'IB Advisor' },
                    { step: 3, name: 'Regulatory Review & Approval', status: 'active', role: 'CMA Regulator' },
                    { step: 4, name: 'Exchange Listing Approval', status: 'pending', role: 'RSE Listing Desk' },
                    { step: 5, name: 'Broker Market Access Setup', status: 'pending', role: 'Licensed Broker' },
                    { step: 6, name: 'Investor Capital Deployment', status: 'pending', role: 'Investor' },
                    { step: 7, name: 'Settlement & Registry', status: 'pending', role: 'CSD Operator' }
                  ].map((step) => (
                    <div key={step.step} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.status === 'completed' ? 'bg-green-500 text-white' :
                        step.status === 'active' ? 'bg-blue-500 text-white' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {step.status === 'completed' ? <CheckCircle className="w-4 h-4" /> : step.step}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{step.name}</p>
                        <p className="text-sm text-muted-foreground">Assigned to: {step.role}</p>
                      </div>
                      <Badge variant={
                        step.status === 'completed' ? 'default' :
                        step.status === 'active' ? 'secondary' :
                        'outline'
                      }>
                        {step.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add other tab content as needed */}
      </div>
    </div>
  )
}