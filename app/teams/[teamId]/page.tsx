'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Building2, 
  TrendingUp, 
  Clock, 
  Award,
  MessageSquare,
  FileText,
  Target,
  Activity,
  Settings,
  UserPlus,
  Play,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Copy,
  Share,
  BarChart3,
  Calendar,
  DollarSign
} from 'lucide-react'
import { CollaborativeTeamDashboard } from '@/components/collaborative-team-dashboard'
import { TeamRoleIntegration } from '@/components/team-role-integration'

interface TeamData {
  id: string
  name: string
  university: string
  description: string
  memberCount: number
  maxMembers: number
  currentDeal: Deal | null
  progress: WorkflowProgress
  performance: TeamMetrics
  status: 'forming' | 'active' | 'completed'
  inviteCode: string
  createdAt: Date
  members: TeamMember[]
  isOwner: boolean
  isMember: boolean
}

interface Deal {
  id: string
  companyName: string
  sector: string
  capitalTarget: number
  currentStep: number
  totalSteps: number
  estimatedCompletion: Date
  description: string
}

interface WorkflowProgress {
  currentStep: number
  totalSteps: number
  completedSteps: number
  nextActions: NextAction[]
  blockedSteps: string[]
}

interface NextAction {
  id: string
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

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  isOnline: boolean
  joinedAt: Date
  performance: number
  avatar?: string
}

export default function TeamDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const teamId = params.teamId as string
  const isNewTeam = searchParams.get('created') === 'true'

  const [teamData, setTeamData] = useState<TeamData | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [showInviteCode, setShowInviteCode] = useState(false)

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockTeamData: TeamData = {
      id: teamId,
      name: "Kigali University Capital Markets 2024",
      university: "University of Rwanda - Kigali",
      description: "Focused on renewable energy and sustainable development projects in Rwanda. Our mission is to understand how green energy companies can access capital markets while contributing to Rwanda's Vision 2050.",
      memberCount: 8,
      maxMembers: 10,
      currentDeal: {
        id: 'deal_001',
        companyName: 'Green Energy Rwanda Ltd',
        sector: 'Renewable Energy',
        capitalTarget: 500000000,
        currentStep: 3,
        totalSteps: 7,
        estimatedCompletion: new Date('2024-12-15'),
        description: 'Solar and wind energy infrastructure development across Rwanda'
      },
      progress: {
        currentStep: 3,
        totalSteps: 7,
        completedSteps: 2,
        nextActions: [
          {
            id: 'action_1',
            description: 'Review and approve regulatory filing for Green Energy Rwanda Ltd',
            assignedRole: 'CMA Regulator',
            assignedTo: 'Grace Mukamana',
            dueDate: new Date('2024-11-05'),
            priority: 'high'
          },
          {
            id: 'action_2',
            description: 'Prepare listing documentation and ISIN allocation',
            assignedRole: 'SHORA Exchange Listing Desk',
            assignedTo: 'David Nkurunziza',
            dueDate: new Date('2024-11-08'),
            priority: 'medium'
          }
        ],
        blockedSteps: []
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
      status: 'active',
      inviteCode: 'KIGALI2024',
      createdAt: new Date('2024-10-01'),
      members: [
        { id: '1', name: 'Alice Uwimana', email: 'alice@ur.ac.rw', role: 'Issuer', isOnline: true, joinedAt: new Date('2024-10-01'), performance: 92 },
        { id: '2', name: 'Jean Baptiste', email: 'jean@ur.ac.rw', role: 'IB Advisor', isOnline: true, joinedAt: new Date('2024-10-01'), performance: 88 },
        { id: '3', name: 'Grace Mukamana', email: 'grace@ur.ac.rw', role: 'CMA Regulator', isOnline: false, joinedAt: new Date('2024-10-02'), performance: 95 },
        { id: '4', name: 'David Nkurunziza', email: 'david@ur.ac.rw', role: 'SHORA Exchange Listing Desk', isOnline: true, joinedAt: new Date('2024-10-02'), performance: 87 },
        { id: '5', name: 'Sarah Ingabire', email: 'sarah@ur.ac.rw', role: 'Licensed Broker', isOnline: true, joinedAt: new Date('2024-10-03'), performance: 91 },
        { id: '6', name: 'Eric Habimana', email: 'eric@ur.ac.rw', role: 'Investor', isOnline: false, joinedAt: new Date('2024-10-03'), performance: 89 },
        { id: '7', name: 'Marie Nyirahabimana', email: 'marie@ur.ac.rw', role: 'Investor', isOnline: true, joinedAt: new Date('2024-10-04'), performance: 93 },
        { id: '8', name: 'Patrick Nzeyimana', email: 'patrick@ur.ac.rw', role: 'CSD Operator', isOnline: true, joinedAt: new Date('2024-10-04'), performance: 90 }
      ],
      isOwner: true,
      isMember: true
    }

    setTimeout(() => {
      setTeamData(mockTeamData)
      setIsLoading(false)
    }, 1000)
  }, [teamId])

  const copyInviteCode = () => {
    if (teamData?.inviteCode) {
      navigator.clipboard.writeText(teamData.inviteCode)
      setShowInviteCode(true)
      setTimeout(() => setShowInviteCode(false), 2000)
    }
  }

  const handleStartDeal = () => {
    router.push(`/teams/${teamId}/deals/create`)
  }

  const handleJoinTeam = () => {
    router.push(`/teams/${teamId}/join`)
  }

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

  // If user is not a member, show join interface
  if (!teamData.isMember) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-2xl">{teamData.name}</CardTitle>
              <p className="text-muted-foreground">{teamData.university}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg">{teamData.description}</p>
              
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="text-center">
                  <p className="text-2xl font-bold">{teamData.memberCount}/{teamData.maxMembers}</p>
                  <p className="text-sm text-muted-foreground">Members</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{teamData.performance.overallScore}%</p>
                  <p className="text-sm text-muted-foreground">Performance</p>
                </div>
              </div>

              {teamData.status === 'forming' && teamData.memberCount < teamData.maxMembers ? (
                <Button onClick={handleJoinTeam} size="lg">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Request to Join Team
                </Button>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This team is {teamData.status === 'forming' ? 'full' : teamData.status} and not accepting new members.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const progressPercentage = (teamData.progress.completedSteps / teamData.progress.totalSteps) * 100

  return (
    <div className="min-h-screen bg-background">
      {/* Success Alert for New Team */}
      {isNewTeam && (
        <div className="bg-green-50 border-b border-green-200 p-4">
          <div className="max-w-7xl mx-auto">
            <Alert className="bg-transparent border-0">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Team created successfully!</strong> Share your invite code with potential members: 
                <span className="font-mono font-bold ml-2">{teamData.inviteCode}</span>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}

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
              
              <div className="flex items-center gap-4 text-sm">
                <Badge className={
                  teamData.status === 'forming' ? 'bg-yellow-100 text-yellow-800' :
                  teamData.status === 'active' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }>
                  {teamData.status}
                </Badge>
                
                {teamData.currentDeal && (
                  <Badge className="bg-blue-100 text-blue-800">
                    <Building2 className="w-3 h-3 mr-1" />
                    {teamData.currentDeal.companyName}
                  </Badge>
                )}
                
                <Badge variant="outline">
                  {teamData.members.filter(m => m.isOnline).length}/{teamData.memberCount} online
                </Badge>
                
                <Badge variant="outline">
                  Rank #{teamData.performance.rankings.overall} overall
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {teamData.isOwner && teamData.status === 'forming' && (
                <Button variant="outline" size="sm" onClick={copyInviteCode}>
                  <Copy className="w-4 h-4 mr-2" />
                  {showInviteCode ? 'Copied!' : 'Invite Code'}
                </Button>
              )}
              
              <Button variant="outline" size="sm" onClick={() => router.push(`/teams/${teamId}/roles`)}>
                <Users className="w-4 h-4 mr-2" />
                Manage Roles
              </Button>
              
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Team Chat
              </Button>
              
              {teamData.status === 'forming' && !teamData.currentDeal && (
                <Button size="sm" onClick={handleStartDeal}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Deal
                </Button>
              )}
              
              {teamData.currentDeal && (
                <Button size="sm">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Continue Process
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="workflow" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Workflow
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Members
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{teamData.memberCount}/{teamData.maxMembers}</p>
                      <p className="text-sm text-muted-foreground">Team Members</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Award className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{teamData.performance.overallScore}%</p>
                      <p className="text-sm text-muted-foreground">Performance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {teamData.currentDeal && (
                <>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Target className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{Math.round(progressPercentage)}%</p>
                          <p className="text-sm text-muted-foreground">Progress</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <DollarSign className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">RWF {(teamData.currentDeal.capitalTarget / 1000000).toFixed(0)}M</p>
                          <p className="text-sm text-muted-foreground">Target Capital</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Current Deal Progress */}
            {teamData.currentDeal && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Current Deal: {teamData.currentDeal.companyName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Company</p>
                        <p className="font-medium">{teamData.currentDeal.companyName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Sector</p>
                        <p className="font-medium">{teamData.currentDeal.sector}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p className="text-sm">{teamData.currentDeal.description}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Capital Target</p>
                        <p className="text-2xl font-bold text-primary">
                          RWF {(teamData.currentDeal.capitalTarget / 1000000).toFixed(0)}M
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Progress</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Step {teamData.currentDeal.currentStep} of {teamData.currentDeal.totalSteps}</span>
                            <span>{Math.round(progressPercentage)}%</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Est. Completion</p>
                        <p className="font-medium flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {teamData.currentDeal.estimatedCompletion.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Role Integration - Show user's specific role dashboard */}
            {teamData.isMember && (
              <TeamRoleIntegration 
                teamId={teamId}
                userId="user_1" // Replace with actual current user ID
                userRole={teamData.members.find(m => m.id === "user_1")?.role || 'investor'}
                teamData={teamData}
              />
            )}

            {/* Next Actions */}
            {teamData.progress.nextActions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Next Actions Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamData.progress.nextActions.map((action) => (
                      <div key={action.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <p className="font-medium">{action.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Assigned to: {action.assignedTo}</span>
                            <span>Role: {action.assignedRole}</span>
                            <span>Due: {action.dueDate.toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Badge className={
                          action.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          action.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          action.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {action.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="workflow">
            <CollaborativeTeamDashboard teamId={teamId} />
          </TabsContent>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teamData.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          member.isOnline ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{member.performance}%</p>
                        <p className="text-sm text-muted-foreground">Performance</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Team Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No documents uploaded yet</p>
                  <Button className="mt-4">
                    <FileText className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Overall Score</span>
                      <span className="font-bold">{teamData.performance.overallScore}%</span>
                    </div>
                    <Progress value={teamData.performance.overallScore} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Collaboration</span>
                      <span className="font-bold">{teamData.performance.collaborationScore}%</span>
                    </div>
                    <Progress value={teamData.performance.collaborationScore} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Process Efficiency</span>
                      <span className="font-bold">{teamData.performance.processEfficiency}%</span>
                    </div>
                    <Progress value={teamData.performance.processEfficiency} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Rankings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Overall Ranking</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      #{teamData.performance.rankings.overall}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>University Ranking</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      #{teamData.performance.rankings.university}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Sector Ranking</span>
                    <Badge className="bg-green-100 text-green-800">
                      #{teamData.performance.rankings.sector}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}