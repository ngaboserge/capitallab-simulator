'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  Users,
  Building2,
  Shield,
  Award,
  Database,
  FileText,
  Bell,
  Activity,
  TrendingUp
} from 'lucide-react'
import { CapitalRaiseWorkflow, WorkflowStage, workflowEngine } from '@/lib/capitallab-workflow-engine'

interface WorkflowDashboardProps {
  userId: string
  userRole: string
  workflowId?: string
}

export function WorkflowDashboard({ userId, userRole, workflowId }: WorkflowDashboardProps) {
  const [workflows, setWorkflows] = useState<CapitalRaiseWorkflow[]>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<CapitalRaiseWorkflow | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // Load workflows for this user
    const userWorkflows = workflowEngine.getWorkflowsByParticipant(userId, userRole)
    setWorkflows(userWorkflows)
    
    // Load notifications
    const userNotifications = workflowEngine.getNotificationsForUser(userId, userRole)
    setNotifications(userNotifications)
    
    // Select specific workflow if provided
    if (workflowId) {
      const workflow = workflowEngine.getWorkflow(workflowId)
      if (workflow) setSelectedWorkflow(workflow)
    } else if (userWorkflows.length > 0) {
      setSelectedWorkflow(userWorkflows[0])
    }
  }, [userId, userRole, workflowId])

  const getStageIcon = (stage: WorkflowStage) => {
    const icons = {
      'capital_raise_intent': Building2,
      'ib_assignment': Users,
      'due_diligence': FileText,
      'prospectus_building': FileText,
      'regulatory_review': Shield,
      'listing_approval': Award,
      'isin_assignment': Database,
      'investor_onboarding': Users,
      'trading_active': TrendingUp,
      'settlement': CheckCircle,
      'completed': CheckCircle
    }
    return icons[stage] || Activity
  }

  const getStageColor = (stage: WorkflowStage, isActive: boolean, isCompleted: boolean) => {
    if (isCompleted) return 'text-green-600 bg-green-100'
    if (isActive) return 'text-blue-600 bg-blue-100'
    return 'text-gray-400 bg-gray-100'
  }

  const getStageTitle = (stage: WorkflowStage) => {
    const titles = {
      'capital_raise_intent': 'Capital Raise Intent',
      'ib_assignment': 'IB Assignment',
      'due_diligence': 'Due Diligence',
      'prospectus_building': 'Prospectus Building',
      'regulatory_review': 'CMA Review',
      'listing_approval': 'RSE Listing Approval',
      'isin_assignment': 'ISIN Assignment',
      'investor_onboarding': 'Investor Onboarding',
      'trading_active': 'Active Trading',
      'settlement': 'Settlement',
      'completed': 'Completed'
    }
    return titles[stage] || stage
  }

  const getRoleActions = (workflow: CapitalRaiseWorkflow) => {
    if (!workflow) return []
    
    const actions = []
    const currentStage = workflow.currentStage
    
    switch (userRole) {
      case 'issuer':
        if (currentStage === 'capital_raise_intent') {
          actions.push({ label: 'Submit Intent', action: 'submit_intent', variant: 'default' })
        }
        if (currentStage === 'due_diligence') {
          actions.push({ label: 'Upload Documents', action: 'upload_docs', variant: 'default' })
        }
        break
        
      case 'ib_advisor':
        if (currentStage === 'ib_assignment') {
          actions.push({ label: 'Accept Assignment', action: 'assign_ib', variant: 'default' })
        }
        if (currentStage === 'due_diligence') {
          actions.push({ label: 'Request Documents', action: 'request_docs', variant: 'default' })
        }
        if (currentStage === 'prospectus_building') {
          actions.push({ label: 'Build Prospectus', action: 'build_prospectus', variant: 'default' })
          actions.push({ label: 'Submit for Review', action: 'submit_for_review', variant: 'default' })
        }
        break
        
      case 'regulator':
        if (currentStage === 'regulatory_review') {
          actions.push({ label: 'Approve Filing', action: 'approve_filing', variant: 'default' })
          actions.push({ label: 'Reject Filing', action: 'reject_filing', variant: 'destructive' })
        }
        break
        
      case 'listing_desk':
        if (currentStage === 'listing_approval') {
          actions.push({ label: 'Approve Listing', action: 'approve_listing', variant: 'default' })
        }
        break
        
      case 'csd_operator':
        if (currentStage === 'isin_assignment') {
          actions.push({ label: 'Create ISIN', action: 'create_isin', variant: 'default' })
        }
        break
        
      case 'broker':
        if (currentStage === 'investor_onboarding' || currentStage === 'trading_active') {
          actions.push({ label: 'Activate Investor', action: 'activate_investor', variant: 'default' })
        }
        if (currentStage === 'trading_active') {
          actions.push({ label: 'Execute Trade', action: 'execute_trade', variant: 'default' })
        }
        break
        
      case 'investor':
        if (currentStage === 'trading_active') {
          actions.push({ label: 'Place Order', action: 'place_order', variant: 'default' })
        }
        break
    }
    
    return actions
  }

  const executeWorkflowAction = (action: string) => {
    if (!selectedWorkflow) return
    
    // Mock data for different actions
    const mockData = {
      participant: {
        userId,
        role: userRole,
        name: `${userRole} User`,
        isActive: true
      }
    }
    
    const success = workflowEngine.executeAction(selectedWorkflow.id, action as any, userId, mockData)
    
    if (success) {
      // Refresh the workflow data
      const updatedWorkflow = workflowEngine.getWorkflow(selectedWorkflow.id)
      if (updatedWorkflow) {
        setSelectedWorkflow(updatedWorkflow)
        setWorkflows(prev => prev.map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w))
      }
    }
  }

  const workflowStages: WorkflowStage[] = [
    'capital_raise_intent',
    'ib_assignment', 
    'due_diligence',
    'prospectus_building',
    'regulatory_review',
    'listing_approval',
    'isin_assignment',
    'investor_onboarding',
    'trading_active',
    'settlement',
    'completed'
  ]

  if (!selectedWorkflow) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Workflows</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No capital raise workflows are currently assigned to your role.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{selectedWorkflow.issuerCompany}</CardTitle>
              <p className="text-muted-foreground">
                {selectedWorkflow.instrumentType.toUpperCase()} • {selectedWorkflow.currency} {selectedWorkflow.targetAmount.toLocaleString()}
                {selectedWorkflow.virtualISIN && ` • ISIN: ${selectedWorkflow.virtualISIN}`}
              </p>
            </div>
            <Badge className={selectedWorkflow.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {selectedWorkflow.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Workflow Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Workflow Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4">
              {workflowStages.map((stage, index) => {
                const Icon = getStageIcon(stage)
                const isActive = selectedWorkflow.currentStage === stage
                const isCompleted = selectedWorkflow.stageHistory.some(h => h.stage === stage && h.completedAt)
                const colorClass = getStageColor(stage, isActive, isCompleted)
                
                return (
                  <div key={stage} className="flex items-center gap-2 min-w-fit">
                    <div className={`p-3 rounded-lg ${colorClass} transition-all`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-center min-w-[120px]">
                      <div className="text-sm font-medium">{getStageTitle(stage)}</div>
                      <div className="text-xs text-muted-foreground">
                        {isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Pending'}
                      </div>
                    </div>
                    {index < workflowStages.length - 1 && (
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Current Stage Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Your Actions Required</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert className="bg-blue-50 border-blue-200">
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Current Stage:</strong> {getStageTitle(selectedWorkflow.currentStage)}
                    <br />
                    As a {userRole}, you can perform the following actions:
                  </AlertDescription>
                </Alert>
                
                <div className="flex gap-2 flex-wrap">
                  {getRoleActions(selectedWorkflow).map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant as any}
                      onClick={() => executeWorkflowAction(action.action)}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stage History */}
          <Card>
            <CardHeader>
              <CardTitle>Stage History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedWorkflow.stageHistory.map((history, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className={`p-2 rounded-lg ${history.completedAt ? 'bg-green-100' : 'bg-blue-100'}`}>
                      {React.createElement(getStageIcon(history.stage), { 
                        className: `w-4 h-4 ${history.completedAt ? 'text-green-600' : 'text-blue-600'}` 
                      })}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{getStageTitle(history.stage)}</div>
                      <div className="text-sm text-muted-foreground">
                        Started: {history.enteredAt.toLocaleString()}
                        {history.completedAt && ` • Completed: ${history.completedAt.toLocaleString()}`}
                      </div>
                      {history.notes && (
                        <div className="text-sm text-muted-foreground mt-1">
                          Notes: {history.notes}
                        </div>
                      )}
                    </div>
                    {history.completedAt ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Participants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Issuer */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="w-5 h-5 text-gray-600" />
                    <span className="font-medium">Issuer</span>
                  </div>
                  <div className="text-sm">{selectedWorkflow.participants.issuer.name}</div>
                </div>

                {/* IB Advisor */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-orange-600" />
                    <span className="font-medium">IB Advisor</span>
                  </div>
                  <div className="text-sm">
                    {selectedWorkflow.participants.ibAdvisor?.name || 'Not assigned'}
                  </div>
                </div>

                {/* Regulator */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">CMA Regulator</span>
                  </div>
                  <div className="text-sm">
                    {selectedWorkflow.participants.regulator?.name || 'Not assigned'}
                  </div>
                </div>

                {/* Listing Desk */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="w-5 h-5 text-green-600" />
                    <span className="font-medium">RSE Listing Desk</span>
                  </div>
                  <div className="text-sm">
                    {selectedWorkflow.participants.listingDesk?.name || 'Not assigned'}
                  </div>
                </div>

                {/* CSD Operator */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Database className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">CSD Operator</span>
                  </div>
                  <div className="text-sm">
                    {selectedWorkflow.participants.csdOperator?.name || 'Not assigned'}
                  </div>
                </div>

                {/* Brokers */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-red-600" />
                    <span className="font-medium">Brokers</span>
                  </div>
                  <div className="text-sm">
                    {selectedWorkflow.participants.brokers.length} broker(s) involved
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedWorkflow.documents.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No documents uploaded yet
                  </p>
                ) : (
                  selectedWorkflow.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="font-medium">{doc.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {doc.type} • Uploaded {doc.uploadedAt.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Badge className={doc.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {doc.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No notifications
                  </p>
                ) : (
                  notifications.slice(0, 10).map((notification) => (
                    <div key={notification.id} className={`p-3 border rounded-lg ${!notification.isRead ? 'bg-blue-50 border-blue-200' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{notification.title}</div>
                          <div className="text-sm text-muted-foreground">{notification.message}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {notification.createdAt.toLocaleString()}
                          </div>
                        </div>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}