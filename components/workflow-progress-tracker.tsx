'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Building2, 
  Briefcase, 
  Users, 
  TrendingUp, 
  Shield, 
  Database,
  Award,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Eye,
  Activity,
  Calendar,
  User
} from 'lucide-react'

interface WorkflowStage {
  id: string
  name: string
  description: string
  actor: string
  actorRole: 'issuer' | 'ib_advisor' | 'regulator' | 'listing_desk' | 'broker' | 'investor' | 'csd'
  status: 'pending' | 'in_progress' | 'completed' | 'rejected' | 'waiting'
  completedAt?: Date
  estimatedDuration: string
  requirements: string[]
  nextActions: string[]
  icon: any
  color: string
}

interface WorkflowData {
  id: string
  companyName: string
  instrumentType: string
  targetAmount: number
  currentStage: string
  overallProgress: number
  startedAt: Date
  estimatedCompletion: Date
  participants: {
    issuer?: string
    ibAdvisor?: string
    regulator?: string
    listingDesk?: string
    broker?: string
    investors?: string[]
    csd?: string
  }
  stages: WorkflowStage[]
}

const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: 'intent_submission',
    name: 'Capital Raise Intent',
    description: 'Issuer submits their capital raise intention',
    actor: 'Issuer',
    actorRole: 'issuer',
    status: 'completed',
    completedAt: new Date('2024-01-15'),
    estimatedDuration: '1 day',
    requirements: ['Business registration', 'Basic company information', 'Funding purpose'],
    nextActions: ['Wait for IB assignment'],
    icon: Building2,
    color: 'bg-gray-100 text-gray-700'
  },
  {
    id: 'ib_assignment',
    name: 'IB Advisor Assignment',
    description: 'Investment Bank Advisor is assigned to guide the process',
    actor: 'System / IB Advisor',
    actorRole: 'ib_advisor',
    status: 'completed',
    completedAt: new Date('2024-01-16'),
    estimatedDuration: '1-2 days',
    requirements: ['Available IB capacity', 'Sector expertise match'],
    nextActions: ['Begin due diligence process'],
    icon: Briefcase,
    color: 'bg-orange-100 text-orange-700'
  },
  {
    id: 'due_diligence',
    name: 'Due Diligence',
    description: 'IB requests and reviews comprehensive documentation',
    actor: 'IB Advisor ↔ Issuer',
    actorRole: 'ib_advisor',
    status: 'in_progress',
    estimatedDuration: '2-3 weeks',
    requirements: ['Financial statements', 'Business plan', 'Risk assessment', 'Legal documents'],
    nextActions: ['Submit remaining documents', 'Review financial projections'],
    icon: FileText,
    color: 'bg-blue-100 text-blue-700'
  },
  {
    id: 'prospectus_preparation',
    name: 'Prospectus Preparation',
    description: 'IB creates regulatory filing documents',
    actor: 'IB Advisor',
    actorRole: 'ib_advisor',
    status: 'waiting',
    estimatedDuration: '1-2 weeks',
    requirements: ['Completed due diligence', 'Legal review', 'Financial structuring'],
    nextActions: ['Await due diligence completion'],
    icon: FileText,
    color: 'bg-blue-100 text-blue-700'
  },
  {
    id: 'regulatory_review',
    name: 'CMA Regulatory Review',
    description: 'Capital Markets Authority reviews and approves/rejects filing',
    actor: 'CMA Regulator',
    actorRole: 'regulator',
    status: 'pending',
    estimatedDuration: '3-4 weeks',
    requirements: ['Complete prospectus', 'Compliance documentation', 'Fee payment'],
    nextActions: ['Await prospectus submission'],
    icon: Shield,
    color: 'bg-red-100 text-red-700'
  },
  {
    id: 'listing_approval',
    name: 'RSE Listing Approval',
    description: 'Rwanda Stock Exchange approves listing and creates ISIN',
    actor: 'RSE Listing Desk',
    actorRole: 'listing_desk',
    status: 'pending',
    estimatedDuration: '1-2 weeks',
    requirements: ['CMA approval', 'Listing fees', 'Market maker arrangement'],
    nextActions: ['Await regulatory approval'],
    icon: Award,
    color: 'bg-green-100 text-green-700'
  },
  {
    id: 'csd_setup',
    name: 'CSD Registry Setup',
    description: 'Central Securities Depository creates instrument registry',
    actor: 'CSD Operator',
    actorRole: 'csd',
    status: 'pending',
    estimatedDuration: '3-5 days',
    requirements: ['ISIN assignment', 'Instrument specifications', 'Custody arrangements'],
    nextActions: ['Await listing approval'],
    icon: Database,
    color: 'bg-purple-100 text-purple-700'
  },
  {
    id: 'broker_activation',
    name: 'Broker & Investor Setup',
    description: 'Brokers activate investor accounts for trading access',
    actor: 'Licensed Brokers',
    actorRole: 'broker',
    status: 'pending',
    estimatedDuration: '1 week',
    requirements: ['Active instrument', 'Investor KYC', 'Broker agreements'],
    nextActions: ['Await trading launch'],
    icon: Users,
    color: 'bg-indigo-100 text-indigo-700'
  },
  {
    id: 'trading_launch',
    name: 'Trading Commencement',
    description: 'Instrument becomes available for trading on the market',
    actor: 'Market Participants',
    actorRole: 'investor',
    status: 'pending',
    estimatedDuration: 'Ongoing',
    requirements: ['All approvals complete', 'Market readiness', 'Investor interest'],
    nextActions: ['Await all prerequisites'],
    icon: TrendingUp,
    color: 'bg-teal-100 text-teal-700'
  }
]

interface WorkflowProgressTrackerProps {
  workflowId?: string
  companyName?: string
  userRole?: string
  showDetailedView?: boolean
}

export function WorkflowProgressTracker({ 
  workflowId = 'WF-001', 
  companyName = 'Rwanda Green Energy Ltd',
  userRole = 'viewer',
  showDetailedView = true 
}: WorkflowProgressTrackerProps) {
  const [workflowData, setWorkflowData] = useState<WorkflowData | null>(null)
  const [selectedStage, setSelectedStage] = useState<string | null>(null)

  useEffect(() => {
    // Mock workflow data - in real implementation, fetch from API
    const mockWorkflow: WorkflowData = {
      id: workflowId,
      companyName,
      instrumentType: 'Corporate Bond',
      targetAmount: 500000000,
      currentStage: 'due_diligence',
      overallProgress: 33,
      startedAt: new Date('2024-01-15'),
      estimatedCompletion: new Date('2024-04-15'),
      participants: {
        issuer: 'Rwanda Green Energy Ltd',
        ibAdvisor: 'Sarah Mukamana (Rwanda Capital Partners)',
        regulator: 'CMA Review Team',
        listingDesk: 'RSE Listing Committee',
        broker: 'Kigali Securities',
        investors: ['Rwanda Investment Group'],
        csd: 'CSD Rwanda'
      },
      stages: WORKFLOW_STAGES
    }
    
    setWorkflowData(mockWorkflow)
  }, [workflowId, companyName])

  if (!workflowData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workflow progress...</p>
        </CardContent>
      </Card>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'in_progress':
        return <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
      case 'waiting':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: 'default' as const, label: 'Completed' },
      in_progress: { variant: 'default' as const, label: 'In Progress' },
      waiting: { variant: 'secondary' as const, label: 'Waiting' },
      rejected: { variant: 'destructive' as const, label: 'Rejected' },
      pending: { variant: 'outline' as const, label: 'Pending' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: 'outline' as const,
      label: 'Unknown'
    }
    
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    )
  }

  const currentStageIndex = workflowData.stages.findIndex(stage => stage.id === workflowData.currentStage)
  const currentStageData = workflowData.stages[currentStageIndex]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                {workflowData.companyName}
              </CardTitle>
              <p className="text-muted-foreground">
                {workflowData.instrumentType} • RWF {workflowData.targetAmount.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{workflowData.overallProgress}%</div>
              <p className="text-sm text-muted-foreground">Complete</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={workflowData.overallProgress} className="h-3" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Started: {workflowData.startedAt.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>Est. Completion: {workflowData.estimatedCompletion.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <span>Current: {currentStageData?.name}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Stage Highlight */}
      {currentStageData && (
        <Alert className="border-primary bg-primary/5">
          <Activity className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Current Stage:</strong> {currentStageData.name} ({currentStageData.actor})
                <br />
                <span className="text-sm">{currentStageData.description}</span>
              </div>
              {getStatusBadge(currentStageData.status)}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Workflow Stages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {workflowData.stages.map((stage, index) => {
          const StageIcon = stage.icon
          const isActive = stage.id === workflowData.currentStage
          const isCompleted = stage.status === 'completed'
          const isNext = index === currentStageIndex + 1
          
          return (
            <Card 
              key={stage.id} 
              className={`cursor-pointer transition-all ${
                isActive 
                  ? 'border-primary shadow-md' 
                  : isCompleted 
                    ? 'border-green-200 bg-green-50/50'
                    : isNext
                      ? 'border-yellow-200 bg-yellow-50/50'
                      : 'hover:shadow-sm'
              }`}
              onClick={() => setSelectedStage(selectedStage === stage.id ? null : stage.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${stage.color}`}>
                      <StageIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{stage.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{stage.actor}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(stage.status)}
                    {getStatusBadge(stage.status)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3">{stage.description}</p>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Duration: {stage.estimatedDuration}</span>
                  {stage.completedAt && (
                    <span className="text-green-600">
                      Completed: {stage.completedAt.toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Expanded Details */}
                {selectedStage === stage.id && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Requirements:</h4>
                      <ul className="text-xs space-y-1">
                        {stage.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-primary rounded-full" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Next Actions:</h4>
                      <ul className="text-xs space-y-1">
                        {stage.nextActions.map((action, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <ArrowRight className="w-3 h-3 text-primary" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Participants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Workflow Participants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(workflowData.participants).map(([role, participant]) => {
              if (!participant) return null
              
              const roleIcons = {
                issuer: Building2,
                ibAdvisor: Briefcase,
                regulator: Shield,
                listingDesk: Award,
                broker: Users,
                investors: TrendingUp,
                csd: Database
              }
              
              const RoleIcon = roleIcons[role as keyof typeof roleIcons] || User
              
              return (
                <div key={role} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <RoleIcon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {role.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Array.isArray(participant) ? participant.join(', ') : participant}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Role-Specific Actions */}
      {userRole !== 'viewer' && (
        <Card>
          <CardHeader>
            <CardTitle>Your Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <User className="h-4 w-4" />
              <AlertDescription>
                As a <strong>{userRole}</strong>, you can take specific actions in this workflow. 
                Your next steps will appear here when it's your turn to act.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}