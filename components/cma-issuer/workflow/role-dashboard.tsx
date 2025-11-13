"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  UserRole, 
  SectionAssignment, 
  WorkflowProgress, 
  DEFAULT_SECTION_ASSIGNMENTS,
  TeamMember 
} from '@/lib/cma-issuer-system/types/workflow'
import { 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Users,
  TrendingUp,
  Calendar
} from 'lucide-react'

interface RoleDashboardProps {
  currentUser: TeamMember
  team: TeamMember[]
  workflowProgress: WorkflowProgress
  onSectionSelect: (sectionId: number) => void
}

export function RoleDashboard({ 
  currentUser, 
  team, 
  workflowProgress, 
  onSectionSelect 
}: RoleDashboardProps) {
  const [activeTab, setActiveTab] = useState('my-tasks')

  // Get sections assigned to current user
  const myAssignments = DEFAULT_SECTION_ASSIGNMENTS.filter(
    assignment => assignment.assignedRole === currentUser.role
  )

  // Get progress for current user's sections
  const myProgress = myAssignments.map(assignment => ({
    ...assignment,
    progress: workflowProgress.sectionProgress[assignment.sectionId] || {
      sectionId: assignment.sectionId,
      assignedTo: assignment.assignedRole,
      status: 'NOT_STARTED',
      comments: [],
      validationStatus: 'PENDING',
      requiredDocuments: [],
      uploadedDocuments: []
    }
  }))

  const completedTasks = myProgress.filter(task => task.progress.status === 'COMPLETED').length
  const totalTasks = myProgress.length
  const myCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const getStatusColor = (status: string) => {
    const colors = {
      'NOT_STARTED': 'bg-gray-100 text-gray-800',
      'IN_PROGRESS': 'bg-blue-100 text-blue-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'UNDER_REVIEW': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-emerald-100 text-emerald-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      'HIGH': 'bg-red-100 text-red-800',
      'MEDIUM': 'bg-orange-100 text-orange-800',
      'LOW': 'bg-green-100 text-green-800'
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const canStartSection = (assignment: SectionAssignment) => {
    // All sections are now accessible - no dependencies
    return true
  }

  const getTeamOverview = () => {
    const teamStats = team.map(member => {
      const memberAssignments = DEFAULT_SECTION_ASSIGNMENTS.filter(
        assignment => assignment.assignedRole === member.role
      )
      const completed = memberAssignments.filter(assignment => {
        const progress = workflowProgress.sectionProgress[assignment.sectionId]
        return progress && progress.status === 'COMPLETED'
      }).length
      
      return {
        member,
        total: memberAssignments.length,
        completed,
        percentage: memberAssignments.length > 0 ? Math.round((completed / memberAssignments.length) * 100) : 0
      }
    })
    
    return teamStats
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">CMA Application Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {currentUser.name} ({currentUser.role.replace('_', ' ')})
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">
            {workflowProgress.completionPercentage}%
          </div>
          <div className="text-sm text-muted-foreground">Overall Progress</div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{myCompletionRate}%</div>
                <div className="text-sm text-muted-foreground">
                  My Progress ({completedTasks}/{totalTasks} sections)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{completedTasks}/{totalTasks}</div>
                <div className="text-sm text-muted-foreground">Tasks Complete</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{team.length}</div>
                <div className="text-sm text-muted-foreground">Team Members</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{workflowProgress.completedSections}/10</div>
                <div className="text-sm text-muted-foreground">Sections Done</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="my-tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="ib-feedback">
            IB Feedback
            <Badge className="ml-2 bg-orange-500 text-white text-xs">2</Badge>
          </TabsTrigger>
          <TabsTrigger value="team-overview">Team Overview</TabsTrigger>
          <TabsTrigger value="progress">Overall Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="ib-feedback" className="space-y-4">
          <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>IB Advisor Feedback</span>
                <Badge className="bg-orange-100 text-orange-800">2 Items to Address</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Feedback Item 1 */}
              <div className="bg-white p-4 rounded-lg border-l-4 border-l-orange-500">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-orange-100 rounded">
                    <span className="text-orange-600 font-bold text-lg">!</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">Financial Projections Need More Detail</h4>
                      <Badge variant="outline" className="border-orange-300 text-orange-700">Action Required</Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      Your 5-year financial projections in the <strong>Offer Details</strong> section need more supporting assumptions. 
                      Please provide detailed breakdown of revenue growth drivers, cost structure, and key assumptions.
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>📍 Section: Offer Details</span>
                        <span>•</span>
                        <span>👤 IB Advisor</span>
                        <span>•</span>
                        <span>🕐 2 days ago</span>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => onSectionSelect(6)}>
                        Go to Section →
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback Item 2 */}
              <div className="bg-white p-4 rounded-lg border-l-4 border-l-orange-500">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-orange-100 rounded">
                    <span className="text-orange-600 font-bold text-lg">!</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">Use of Proceeds Breakdown Required</h4>
                      <Badge variant="outline" className="border-orange-300 text-orange-700">Action Required</Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      Please provide a more detailed breakdown of how the raised capital will be used. Include specific 
                      amounts for each category (CAPEX, working capital, debt repayment, etc.) with timeline.
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>📍 Section: Offer Details</span>
                        <span>•</span>
                        <span>👤 IB Advisor</span>
                        <span>•</span>
                        <span>🕐 2 days ago</span>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => onSectionSelect(6)}>
                        Go to Section →
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback Item 3 - Approved */}
              <div className="bg-white p-4 rounded-lg border-l-4 border-l-green-500">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 rounded">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">Board Composition Approved</h4>
                      <Badge variant="outline" className="border-green-300 text-green-700">✓ Approved</Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">
                      Your governance structure meets all requirements. The board has appropriate mix of 
                      independent and executive directors. Well done!
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>📍 Section: Governance</span>
                      <span>•</span>
                      <span>👤 IB Advisor</span>
                      <span>•</span>
                      <span>🕐 3 days ago</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <div className="text-blue-600 text-lg">💡</div>
                  <div className="flex-1">
                    <p className="text-sm text-blue-800">
                      <strong>Important:</strong> Address all IB Advisor feedback before your application can be submitted 
                      to CMA for regulatory review. Once all items are resolved, your IB Advisor will submit the application 
                      to the Capital Markets Authority.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Assigned Sections</CardTitle>
              <Progress value={myCompletionRate} className="w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myProgress.map((task) => (
                  <Card key={task.sectionId} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <h4 className="font-medium">{task.sectionTitle}</h4>
                          <Badge className={getStatusColor(task.progress.status)}>
                            {task.progress.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{task.estimatedTime}</span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        {task.progress.status === 'COMPLETED' && (
                          <div className="text-green-600 text-sm font-medium">
                            ✓ Complete
                          </div>
                        )}
                        <Button
                          onClick={() => onSectionSelect(task.sectionId)}
                          variant={task.progress.status === 'COMPLETED' ? 'outline' : 'default'}
                          size="sm"
                        >
                          {task.progress.status === 'COMPLETED' ? 'Review' : 
                           task.progress.status === 'IN_PROGRESS' ? 'Continue' : 'Start'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team-overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getTeamOverview().map((memberStats) => (
                  <Card key={memberStats.member.id} className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <User className="w-8 h-8 text-gray-400" />
                        <div>
                          <div className="font-medium">{memberStats.member.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {memberStats.member.role.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{memberStats.percentage}%</div>
                        <div className="text-sm text-muted-foreground">
                          {memberStats.completed}/{memberStats.total} sections
                        </div>
                        <Progress value={memberStats.percentage} className="w-24 mt-1" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Overall Application Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {workflowProgress.completionPercentage}%
                  </div>
                  <Progress value={workflowProgress.completionPercentage} className="w-full mb-4" />
                  <p className="text-muted-foreground">
                    {workflowProgress.completedSections} of 10 sections completed
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DEFAULT_SECTION_ASSIGNMENTS.map((assignment) => {
                    const progress = workflowProgress.sectionProgress[assignment.sectionId]
                    const assignedMember = team.find(member => member.role === assignment.assignedRole)
                    
                    return (
                      <Card key={assignment.sectionId} className="p-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{assignment.sectionTitle}</div>
                            <div className="text-xs text-muted-foreground">
                              Assigned to: {assignedMember?.name || assignment.assignedRole.replace('_', ' ')}
                            </div>
                          </div>
                          <Badge className={getStatusColor(progress?.status || 'NOT_STARTED')}>
                            {(progress?.status || 'NOT_STARTED').replace('_', ' ')}
                          </Badge>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}