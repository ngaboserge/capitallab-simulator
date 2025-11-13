'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  ArrowDown,
  CheckCircle,
  Clock,
  AlertCircle,
  Activity,
  Zap,
  Target,
  Eye
} from 'lucide-react'

interface RoleAction {
  id: string
  roleId: string
  roleName: string
  action: string
  description: string
  timestamp: Date
  status: 'completed' | 'in_progress' | 'pending' | 'blocked'
  impacts: RoleImpact[]
  icon: any
  color: string
}

interface RoleImpact {
  targetRoleId: string
  targetRoleName: string
  impactType: 'enables' | 'requires' | 'notifies' | 'blocks' | 'updates'
  description: string
  actionRequired?: string
  priority: 'high' | 'medium' | 'low'
}

interface RoleImpactVisualizerProps {
  workflowId?: string
  showRealTime?: boolean
}

const MOCK_ACTIONS: RoleAction[] = [
  {
    id: 'action_001',
    roleId: 'issuer',
    roleName: 'Issuer',
    action: 'Submit Capital Raise Intent',
    description: 'Rwanda Green Energy Ltd submits intent to raise RWF 500M for solar farm development',
    timestamp: new Date('2024-01-15T09:00:00'),
    status: 'completed',
    impacts: [
      {
        targetRoleId: 'ib_advisor',
        targetRoleName: 'IB Advisor',
        impactType: 'enables',
        description: 'New client assignment available for review and acceptance',
        actionRequired: 'Review intent and accept assignment',
        priority: 'high'
      },
      {
        targetRoleId: 'regulator',
        targetRoleName: 'CMA Regulator',
        impactType: 'notifies',
        description: 'New capital raise intent logged in regulatory monitoring system',
        priority: 'low'
      }
    ],
    icon: Building2,
    color: 'text-gray-700'
  },
  {
    id: 'action_002',
    roleId: 'ib_advisor',
    roleName: 'IB Advisor',
    action: 'Accept Assignment & Request Due Diligence',
    description: 'Sarah Mukamana (Rwanda Capital Partners) accepts assignment and requests financial documents',
    timestamp: new Date('2024-01-16T14:30:00'),
    status: 'completed',
    impacts: [
      {
        targetRoleId: 'issuer',
        targetRoleName: 'Issuer',
        impactType: 'requires',
        description: 'Must provide audited financials, business plan, and risk assessment',
        actionRequired: 'Upload required due diligence documents',
        priority: 'high'
      },
      {
        targetRoleId: 'regulator',
        targetRoleName: 'CMA Regulator',
        impactType: 'notifies',
        description: 'IB assignment confirmed, due diligence process initiated',
        priority: 'medium'
      }
    ],
    icon: Briefcase,
    color: 'text-orange-700'
  },
  {
    id: 'action_003',
    roleId: 'issuer',
    roleName: 'Issuer',
    action: 'Submit Due Diligence Documents',
    description: 'Rwanda Green Energy Ltd uploads financial statements and business projections',
    timestamp: new Date('2024-01-22T11:15:00'),
    status: 'in_progress',
    impacts: [
      {
        targetRoleId: 'ib_advisor',
        targetRoleName: 'IB Advisor',
        impactType: 'enables',
        description: 'Can now review documents and begin prospectus preparation',
        actionRequired: 'Review submitted documents and create prospectus',
        priority: 'high'
      }
    ],
    icon: Building2,
    color: 'text-gray-700'
  },
  {
    id: 'action_004',
    roleId: 'ib_advisor',
    roleName: 'IB Advisor',
    action: 'Create & Submit Prospectus',
    description: 'Prospectus prepared and submitted to CMA for regulatory review',
    timestamp: new Date('2024-01-25T16:45:00'),
    status: 'pending',
    impacts: [
      {
        targetRoleId: 'regulator',
        targetRoleName: 'CMA Regulator',
        impactType: 'requires',
        description: 'Regulatory filing requires review and approval/rejection decision',
        actionRequired: 'Review prospectus for compliance and issue decision',
        priority: 'high'
      },
      {
        targetRoleId: 'listing_desk',
        targetRoleName: 'RSE Listing Desk',
        impactType: 'notifies',
        description: 'Potential new listing pending regulatory approval',
        priority: 'medium'
      }
    ],
    icon: Briefcase,
    color: 'text-orange-700'
  },
  {
    id: 'action_005',
    roleId: 'regulator',
    roleName: 'CMA Regulator',
    action: 'Approve Regulatory Filing',
    description: 'CMA approves Rwanda Green Energy Bond prospectus with standard conditions',
    timestamp: new Date('2024-02-10T10:30:00'),
    status: 'pending',
    impacts: [
      {
        targetRoleId: 'listing_desk',
        targetRoleName: 'RSE Listing Desk',
        impactType: 'enables',
        description: 'Can now create ISIN and list instrument on exchange',
        actionRequired: 'Create virtual ISIN and list instrument',
        priority: 'high'
      },
      {
        targetRoleId: 'ib_advisor',
        targetRoleName: 'IB Advisor',
        impactType: 'notifies',
        description: 'Client filing approved, can proceed with listing process',
        priority: 'high'
      },
      {
        targetRoleId: 'csd',
        targetRoleName: 'CSD Registry',
        impactType: 'notifies',
        description: 'New instrument will require registry setup',
        priority: 'medium'
      }
    ],
    icon: Shield,
    color: 'text-red-700'
  }
]

export function RoleImpactVisualizer({ workflowId = 'WF-001', showRealTime = true }: RoleImpactVisualizerProps) {
  const [actions, setActions] = useState<RoleAction[]>([])
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [showAllImpacts, setShowAllImpacts] = useState(false)

  useEffect(() => {
    // Load mock actions
    setActions(MOCK_ACTIONS)

    // Simulate real-time updates if enabled
    if (showRealTime) {
      const interval = setInterval(() => {
        setActions(prev => {
          // Simulate status updates
          return prev.map(action => {
            if (action.status === 'pending' && Math.random() > 0.8) {
              return { ...action, status: 'in_progress' as const }
            }
            if (action.status === 'in_progress' && Math.random() > 0.9) {
              return { ...action, status: 'completed' as const }
            }
            return action
          })
        })
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [showRealTime])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'in_progress':
        return <Activity className="w-4 h-4 text-blue-600 animate-pulse" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'blocked':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { variant: 'default' as const, label: 'Completed' },
      in_progress: { variant: 'default' as const, label: 'In Progress' },
      pending: { variant: 'secondary' as const, label: 'Pending' },
      blocked: { variant: 'destructive' as const, label: 'Blocked' }
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

  const getImpactIcon = (impactType: string) => {
    switch (impactType) {
      case 'enables':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'requires':
        return <Target className="w-4 h-4 text-red-600" />
      case 'notifies':
        return <Eye className="w-4 h-4 text-blue-600" />
      case 'blocks':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'updates':
        return <Zap className="w-4 h-4 text-yellow-600" />
      default:
        return <ArrowRight className="w-4 h-4 text-gray-400" />
    }
  }

  const getImpactColor = (impactType: string) => {
    switch (impactType) {
      case 'enables':
        return 'bg-green-50 border-green-200'
      case 'requires':
        return 'bg-red-50 border-red-200'
      case 'notifies':
        return 'bg-blue-50 border-blue-200'
      case 'blocks':
        return 'bg-red-50 border-red-200'
      case 'updates':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      high: { variant: 'destructive' as const, label: 'High Priority' },
      medium: { variant: 'default' as const, label: 'Medium Priority' },
      low: { variant: 'secondary' as const, label: 'Low Priority' }
    }
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || {
      variant: 'outline' as const,
      label: 'Unknown'
    }
    
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Role Impact Visualizer
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllImpacts(!showAllImpacts)}
              >
                {showAllImpacts ? 'Hide' : 'Show'} All Impacts
              </Button>
              {showRealTime && (
                <Badge variant="outline" className="animate-pulse">
                  <Activity className="w-3 h-3 mr-1" />
                  Live Updates
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              See how actions in one role immediately affect other participants in the capital raise workflow. 
              Click on any action to see detailed impact analysis.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Actions Timeline */}
      <div className="space-y-4">
        {actions.map((action, index) => {
          const ActionIcon = action.icon
          const isSelected = selectedAction === action.id
          const nextAction = actions[index + 1]
          
          return (
            <div key={action.id} className="space-y-3">
              <Card 
                className={`cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-primary shadow-lg' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedAction(isSelected ? null : action.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <ActionIcon className={`w-5 h-5 ${action.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{action.action}</CardTitle>
                        <p className="text-sm text-muted-foreground">{action.roleName}</p>
                        <p className="text-xs text-muted-foreground">
                          {action.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(action.status)}
                      {getStatusBadge(action.status)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-muted-foreground mb-4">{action.description}</p>
                  
                  {/* Impact Summary */}
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">
                      Impacts {action.impacts.length} role{action.impacts.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Impacts Grid */}
                  {(showAllImpacts || isSelected) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {action.impacts.map((impact, impactIndex) => (
                        <div 
                          key={impactIndex}
                          className={`p-3 rounded-lg border ${getImpactColor(impact.impactType)}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getImpactIcon(impact.impactType)}
                              <span className="font-medium text-sm">{impact.targetRoleName}</span>
                            </div>
                            {getPriorityBadge(impact.priority)}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {impact.description}
                          </p>
                          
                          {impact.actionRequired && (
                            <div className="flex items-start gap-2">
                              <Target className="w-3 h-3 text-primary mt-0.5" />
                              <p className="text-xs font-medium text-primary">
                                Action Required: {impact.actionRequired}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Flow Arrow */}
              {nextAction && (
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm">
                    <ArrowDown className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Triggers Next Action
                    </span>
                    <ArrowDown className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Impact Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Impact Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">
                {actions.reduce((sum, action) => sum + action.impacts.length, 0)}
              </div>
              <p className="text-sm text-blue-700">Total Impacts</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">
                {actions.reduce((sum, action) => 
                  sum + action.impacts.filter(i => i.impactType === 'enables').length, 0
                )}
              </div>
              <p className="text-sm text-blue-700">Actions Enabled</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-700">
                {actions.reduce((sum, action) => 
                  sum + action.impacts.filter(i => i.priority === 'high').length, 0
                )}
              </div>
              <p className="text-sm text-blue-700">High Priority</p>
            </div>
          </div>
          
          <Alert className="mt-4 bg-white border-blue-200">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Key Insight:</strong> Every action in the capital markets workflow creates 
              specific impacts on other roles, demonstrating the interconnected nature of institutional processes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}