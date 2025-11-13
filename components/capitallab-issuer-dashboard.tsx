"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { IssuerApplicationForm } from '@/components/cma-issuer/issuer-application-form'
import { 
  Building2, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Eye,
  Send,
  MessageSquare,
  ArrowLeft,
  Bell,
  Calendar,
  Users,
  Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useApplications, useCreateApplication, useComments } from '@/lib/api/use-cma-api'
import { 
  APPLICATION_STATUS_LABELS, 
  APPLICATION_STATUS_COLORS,
  formatDate,
  formatRelativeTime 
} from '@/lib/api/cma-utils'

interface Application {
  id: string
  companyName: string
  status: 'draft' | 'submitted' | 'under_review' | 'query_issued' | 'approved' | 'rejected'
  submissionDate?: Date
  lastModified: Date
  completionPercentage: number
  assignedTo?: string
  nextAction?: string
}

interface Query {
  id: string
  applicationId: string
  from: string
  subject: string
  message: string
  issuedDate: Date
  dueDate: Date
  status: 'open' | 'responded' | 'resolved'
  priority: 'low' | 'medium' | 'high'
}

export function CapitalLabIssuerDashboard() {
  const router = useRouter()
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Use real API data
  const { applications, loading, error, refetch } = useApplications()
  const { createApplication, loading: creating } = useCreateApplication()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'REJECTED':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'UNDER_REVIEW':
        return <Clock className="w-4 h-4 text-blue-600" />
      case 'QUERY_ISSUED':
        return <MessageSquare className="w-4 h-4 text-orange-600" />
      case 'SUBMITTED':
        return <Send className="w-4 h-4 text-purple-600" />
      default:
        return <FileText className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const statusKey = status as keyof typeof APPLICATION_STATUS_COLORS
    return (
      <Badge className={APPLICATION_STATUS_COLORS[statusKey]}>
        {APPLICATION_STATUS_LABELS[statusKey]}
      </Badge>
    )
  }
  
  // Calculate stats from real data
  const stats = {
    total: applications.length,
    underReview: applications.filter(a => a.status === 'UNDER_REVIEW').length,
    queries: applications.filter(a => a.status === 'QUERY_ISSUED').length,
    approved: applications.filter(a => a.status === 'APPROVED').length
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const handleNewApplication = async () => {
    const newApp = await createApplication({ target_amount: 0 })
    if (newApp) {
      setSelectedApplication(newApp.id)
      setActiveTab('application')
      refetch()
    }
  }

  const handleViewApplication = (appId: string) => {
    setSelectedApplication(appId)
    setActiveTab('application')
  }

  const handleSaveApplication = (data: any) => {
    console.log('Saving application:', data)
    // In real implementation, save to database
  }

  const handleSubmitApplication = (data: any) => {
    console.log('Submitting application:', data)
    // In real implementation, submit to IB Advisor
    setActiveTab('overview')
    setSelectedApplication(null)
  }

  if (selectedApplication) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedApplication(null)
                setActiveTab('overview')
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {selectedApplication === 'new' ? 'New IPO Application' : 'Edit Application'}
              </h1>
              <p className="text-muted-foreground">Complete your IPO application for CMA review</p>
            </div>
          </div>
        </div>

        <IssuerApplicationForm
          initialData={selectedApplication !== 'new' ? {} : undefined}
          onSave={handleSaveApplication}
          onSubmit={handleSubmitApplication}
        />
      </div>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-lg">Loading applications...</span>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <Alert className="max-w-2xl mx-auto mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Error loading applications:</strong> {error}
          <Button variant="outline" size="sm" onClick={refetch} className="ml-4">
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => router.push('/capitallab/collaborative')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Hub
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              Issuer Dashboard
            </h1>
            <p className="text-muted-foreground">Manage your IPO applications and regulatory submissions</p>
          </div>
        </div>
        <Button onClick={handleNewApplication} disabled={creating}>
          {creating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              New Application
            </>
          )}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="queries">Queries & Communications</TabsTrigger>
          <TabsTrigger value="timeline">Process Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats - Using Real Data */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Applications</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Under Review</p>
                    <p className="text-2xl font-bold">{stats.underReview}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Open Queries</p>
                    <p className="text-2xl font-bold">{stats.queries}</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold">{stats.approved}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <MessageSquare className="w-5 h-5 text-orange-600" />
                  <div className="flex-1">
                    <p className="font-medium">New query received</p>
                    <p className="text-sm text-muted-foreground">
                      CMA Regulator requested additional financial information for Green Energy Rwanda PLC
                    </p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-800">Due Jan 30</Badge>
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-medium">Application under review</p>
                    <p className="text-sm text-muted-foreground">
                      Rwanda Tech Solutions Ltd application is being reviewed by CMA
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleNewApplication}>
              <CardContent className="p-6 text-center">
                <Plus className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Start New IPO Application</h3>
                <p className="text-sm text-muted-foreground">
                  Begin the process of going public with a new application
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('queries')}>
              <CardContent className="p-6 text-center">
                <MessageSquare className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Respond to Queries</h3>
                <p className="text-sm text-muted-foreground">
                  Address pending questions from regulators
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Applications</h3>
            <Button onClick={handleNewApplication}>
              <Plus className="w-4 h-4 mr-2" />
              New Application
            </Button>
          </div>

          <div className="space-y-4">
            {applications.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start your IPO journey by creating your first application
                  </p>
                  <Button onClick={handleNewApplication}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Application
                  </Button>
                </CardContent>
              </Card>
            ) : (
              applications.map((app: any) => (
                <Card key={app.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(app.status)}
                        <div>
                          <h4 className="font-semibold">
                            {app.companies?.legal_name || 'Unnamed Company'}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Last modified: {formatRelativeTime(app.updated_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(app.status)}
                        <Button variant="outline" size="sm" onClick={() => handleViewApplication(app.id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completion</span>
                        <span>{app.completion_percentage}%</span>
                      </div>
                      <Progress value={app.completion_percentage} className="h-2" />
                    </div>

                    {app.application_number && (
                      <div className="mt-4 text-sm text-muted-foreground">
                        Application #: {app.application_number}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="queries" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Queries & Communications</h3>
            <Badge className="bg-orange-100 text-orange-800">
              {applications.filter(a => a.status === 'QUERY_ISSUED').length} applications with queries
            </Badge>
          </div>

          <div className="space-y-4">
            {applications.filter(a => a.status === 'QUERY_ISSUED').length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Open Queries</h3>
                  <p className="text-muted-foreground">
                    You don't have any pending queries from CMA regulators
                  </p>
                </CardContent>
              </Card>
            ) : (
              applications
                .filter(a => a.status === 'QUERY_ISSUED')
                .map((app: any) => (
                  <Card key={app.id} className="border-l-4 border-orange-500">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold">
                            Query on {app.companies?.legal_name || 'Application'}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Application: {app.application_number || app.id}
                          </p>
                        </div>
                        <Badge className="bg-orange-100 text-orange-800">
                          Query Issued
                        </Badge>
                      </div>

                      <p className="text-sm mb-4">
                        CMA has issued queries on this application. Please review and respond.
                      </p>

                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleViewApplication(app.id)}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          View & Respond
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <h3 className="text-lg font-semibold">Process Timeline</h3>
          
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Application Submitted</h4>
                    <p className="text-sm text-muted-foreground">Your application has been submitted to IB Advisor</p>
                  </div>
                  <span className="text-sm text-muted-foreground">Jan 15, 2024</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">Under CMA Review</h4>
                    <p className="text-sm text-muted-foreground">CMA is reviewing your application for compliance</p>
                  </div>
                  <span className="text-sm text-muted-foreground">Current</span>
                </div>

                <div className="flex items-center gap-4 opacity-50">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">RSE Listing</h4>
                    <p className="text-sm text-muted-foreground">Pending CMA approval</p>
                  </div>
                  <span className="text-sm text-muted-foreground">Pending</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}