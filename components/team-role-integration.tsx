'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Building2, 
  Briefcase, 
  Shield, 
  Award,
  Database,
  TrendingUp,
  Users,
  ArrowRight,
  Play,
  CheckCircle,
  Clock,
  FileText,
  Target
} from 'lucide-react'

interface TeamRoleIntegrationProps {
  teamId: string
  userId: string
  userRole: string
  teamData: any
}

interface RoleTask {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate: Date
  assignedTo: string
  relatedStep: number
}

interface RoleDashboardData {
  role: string
  tasks: RoleTask[]
  documents: any[]
  notifications: any[]
  performance: {
    completedTasks: number
    totalTasks: number
    averageRating: number
    collaborationScore: number
  }
}

const ROLE_CONFIGS = {
  issuer: {
    name: 'Issuer',
    icon: Building2,
    color: 'bg-gray-100 text-gray-800',
    dashboardPath: '/capitallab/issuer',
    description: 'Company seeking capital'
  },
  ib_advisor: {
    name: 'IB Advisor',
    icon: Briefcase,
    color: 'bg-orange-100 text-orange-800',
    dashboardPath: '/capitallab/ib-advisor',
    description: 'Deal structuring and advisory'
  },
  regulator: {
    name: 'CMA Regulator',
    icon: Shield,
    color: 'bg-red-100 text-red-800',
    dashboardPath: '/capitallab/regulator',
    description: 'Regulatory review and approval'
  },
  listing_desk: {
    name: 'RSE Listing Desk',
    icon: Award,
    color: 'bg-green-100 text-green-800',
    dashboardPath: '/capitallab/listing-desk',
    description: 'Exchange listing management'
  },
  broker: {
    name: 'Licensed Broker',
    icon: Users,
    color: 'bg-blue-100 text-blue-800',
    dashboardPath: '/capitallab/broker',
    description: 'Market access and trading'
  },
  investor: {
    name: 'Investor',
    icon: TrendingUp,
    color: 'bg-teal-100 text-teal-800',
    dashboardPath: '/capitallab/investor',
    description: 'Capital provider'
  },
  csd_operator: {
    name: 'CSD Operator',
    icon: Database,
    color: 'bg-purple-100 text-purple-800',
    dashboardPath: '/capitallab/csd',
    description: 'Settlement and registry'
  }
}

export function TeamRoleIntegration({ teamId, userId, userRole, teamData }: TeamRoleIntegrationProps) {
  const router = useRouter()
  const [roleDashboard, setRoleDashboard] = useState<RoleDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock role-specific data based on user's role
    const mockRoleDashboard: RoleDashboardData = {
      role: userRole,
      tasks: generateRoleTasks(userRole, teamData),
      documents: [],
      notifications: [],
      performance: {
        completedTasks: 3,
        totalTasks: 7,
        averageRating: 4.2,
        collaborationScore: 88
      }
    }

    setTimeout(() => {
      setRoleDashboard(mockRoleDashboard)
      setIsLoading(false)
    }, 1000)
  }, [userRole, teamData])

  const generateRoleTasks = (role: string, team: any): RoleTask[] => {
    const baseTasks: Record<string, RoleTask[]> = {
      issuer: [
        {
          id: 'task_1',
          title: 'Submit Capital Raise Intent',
          description: 'Complete and submit the initial capital raising intention form',
          status: 'completed',
          priority: 'high',
          dueDate: new Date('2024-11-01'),
          assignedTo: userId,
          relatedStep: 1
        },
        {
          id: 'task_2',
          title: 'Prepare Financial Statements',
          description: 'Compile 3-year financial statements and projections',
          status: 'in_progress',
          priority: 'high',
          dueDate: new Date('2024-11-05'),
          assignedTo: userId,
          relatedStep: 2
        },
        {
          id: 'task_3',
          title: 'Business Plan Presentation',
          description: 'Create investor presentation deck',
          status: 'pending',
          priority: 'medium',
          dueDate: new Date('2024-11-10'),
          assignedTo: userId,
          relatedStep: 6
        }
      ],
      ib_advisor: [
        {
          id: 'task_1',
          title: 'Deal Structure Design',
          description: 'Design optimal capital structure for the deal',
          status: 'completed',
          priority: 'high',
          dueDate: new Date('2024-11-02'),
          assignedTo: userId,
          relatedStep: 2
        },
        {
          id: 'task_2',
          title: 'Regulatory Filing Preparation',
          description: 'Prepare comprehensive regulatory submission',
          status: 'in_progress',
          priority: 'urgent',
          dueDate: new Date('2024-11-04'),
          assignedTo: userId,
          relatedStep: 3
        },
        {
          id: 'task_3',
          title: 'Due Diligence Coordination',
          description: 'Coordinate due diligence process with all parties',
          status: 'pending',
          priority: 'high',
          dueDate: new Date('2024-11-08'),
          assignedTo: userId,
          relatedStep: 3
        }
      ],
      regulator: [
        {
          id: 'task_1',
          title: 'Review Regulatory Filing',
          description: 'Comprehensive review of submitted regulatory documents',
          status: 'in_progress',
          priority: 'high',
          dueDate: new Date('2024-11-06'),
          assignedTo: userId,
          relatedStep: 3
        },
        {
          id: 'task_2',
          title: 'Risk Assessment',
          description: 'Assess investor protection and market risk factors',
          status: 'pending',
          priority: 'high',
          dueDate: new Date('2024-11-08'),
          assignedTo: userId,
          relatedStep: 3
        }
      ],
      listing_desk: [
        {
          id: 'task_1',
          title: 'Listing Application Review',
          description: 'Review application for exchange listing',
          status: 'pending',
          priority: 'medium',
          dueDate: new Date('2024-11-10'),
          assignedTo: userId,
          relatedStep: 4
        },
        {
          id: 'task_2',
          title: 'ISIN Assignment',
          description: 'Assign unique ISIN for the security',
          status: 'pending',
          priority: 'medium',
          dueDate: new Date('2024-11-12'),
          assignedTo: userId,
          relatedStep: 4
        }
      ],
      broker: [
        {
          id: 'task_1',
          title: 'Investor Account Setup',
          description: 'Set up investor accounts for market access',
          status: 'pending',
          priority: 'medium',
          dueDate: new Date('2024-11-15'),
          assignedTo: userId,
          relatedStep: 5
        },
        {
          id: 'task_2',
          title: 'Trading System Configuration',
          description: 'Configure trading systems for new security',
          status: 'pending',
          priority: 'medium',
          dueDate: new Date('2024-11-18'),
          assignedTo: userId,
          relatedStep: 5
        }
      ],
      investor: [
        {
          id: 'task_1',
          title: 'Investment Analysis',
          description: 'Analyze investment opportunity and risks',
          status: 'pending',
          priority: 'medium',
          dueDate: new Date('2024-11-20'),
          assignedTo: userId,
          relatedStep: 6
        },
        {
          id: 'task_2',
          title: 'Investment Decision',
          description: 'Make final investment decision and place orders',
          status: 'pending',
          priority: 'high',
          dueDate: new Date('2024-11-22'),
          assignedTo: userId,
          relatedStep: 6
        }
      ],
      csd_operator: [
        {
          id: 'task_1',
          title: 'Registry Setup',
          description: 'Set up securities registry for new instrument',
          status: 'pending',
          priority: 'low',
          dueDate: new Date('2024-11-25'),
          assignedTo: userId,
          relatedStep: 7
        },
        {
          id: 'task_2',
          title: 'Settlement Processing',
          description: 'Process initial settlement transactions',
          status: 'pending',
          priority: 'medium',
          dueDate: new Date('2024-11-28'),
          assignedTo: userId,
          relatedStep: 7
        }
      ]
    }

    return baseTasks[role] || []
  }

  const handleAccessRoleDashboard = () => {
    const roleConfig = ROLE_CONFIGS[userRole as keyof typeof ROLE_CONFIGS]
    if (roleConfig) {
      // Pass team context to individual role dashboard
      router.push(`${roleConfig.dashboardPath}?teamId=${teamId}&teamMode=true`)
    }
  }

  const handleCompleteTask = (taskId: string) => {
    if (roleDashboard) {
      const updatedTasks = roleDashboard.tasks.map(task =>
        task.id === taskId ? { ...task, status: 'completed' as const } : task
      )
      setRoleDashboard({ ...roleDashboard, tasks: updatedTasks })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!roleDashboard) {
    return (
      <Alert>
        <AlertDescription>Unable to load role dashboard data.</AlertDescription>
      </Alert>
    )
  }

  const roleConfig = ROLE_CONFIGS[userRole as keyof typeof ROLE_CONFIGS]
  const Icon = roleConfig?.icon || Users

  return (
    <div className="space-y-6">
      {/* Role Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            Your Role: {roleConfig?.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{roleConfig?.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {roleDashboard.performance.completedTasks}/{roleDashboard.performance.totalTasks}
              </p>
              <p className="text-sm text-blue-700">Tasks Complete</p>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {roleDashboard.performance.averageRating.toFixed(1)}
              </p>
              <p className="text-sm text-green-700">Avg Rating</p>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {roleDashboard.performance.collaborationScore}%
              </p>
              <p className="text-sm text-purple-700">Collaboration</p>
            </div>
            
            <div className="text-center">
              <Button onClick={handleAccessRoleDashboard} className="w-full">
                <Play className="w-4 h-4 mr-2" />
                Role Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Your Current Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roleDashboard.tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{task.title}</p>
                    <Badge className={
                      task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Due: {task.dueDate.toLocaleDateString()}
                    </span>
                    <span>Step {task.relatedStep}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={
                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    task.status === 'blocked' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {task.status.replace('_', ' ')}
                  </Badge>
                  
                  {task.status === 'pending' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleCompleteTask(task.id)}
                    >
                      Start
                    </Button>
                  )}
                  
                  {task.status === 'in_progress' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleCompleteTask(task.id)}
                    >
                      Complete
                    </Button>
                  )}
                  
                  {task.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>
              </div>
            ))}
            
            {roleDashboard.tasks.length === 0 && (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No tasks assigned yet</p>
                <p className="text-sm text-muted-foreground">Tasks will appear as the team progresses through the workflow</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" onClick={handleAccessRoleDashboard}>
              <Play className="w-4 h-4 mr-2" />
              Access Full Dashboard
            </Button>
            
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              View Documents
            </Button>
            
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Contact Team
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}