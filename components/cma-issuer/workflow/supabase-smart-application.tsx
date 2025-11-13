"use client"

import React, { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useSimpleAuth } from '@/lib/auth/simple-auth-context'
import { useIssuerApplication, useApplication } from '@/lib/api/use-application'
import { TeamSetup } from './team-setup'
import { RoleDashboard } from './role-dashboard'
import { IssuerApplicationForm } from '../issuer-application-form'
import { 
  TeamMember, 
  WorkflowProgress, 
  DEFAULT_SECTION_ASSIGNMENTS,
  UserRole 
} from '@/lib/cma-issuer-system/types/workflow'
import { IssuerApplication } from '@/lib/cma-issuer-system/types'
import { ArrowLeft, FileText, Loader2 } from 'lucide-react'

type ApplicationPhase = 'LOADING' | 'NO_APPLICATION' | 'TEAM_SETUP' | 'DASHBOARD' | 'SECTION_FORM'

export function SupabaseSmartApplication() {
  const { user, profile, loading: authLoading } = useSimpleAuth()
  const { application: issuerApp, loading: appLoading, error: appError } = useIssuerApplication()
  
  const [currentPhase, setCurrentPhase] = useState<ApplicationPhase>('DASHBOARD')
  const [team, setTeam] = useState<TeamMember[]>([])
  const [selectedSection, setSelectedSection] = useState<number | null>(null)
  const [applicationData, setApplicationData] = useState<Partial<IssuerApplication>>({})
  const [workflowProgress, setWorkflowProgress] = useState<WorkflowProgress | null>(null)

  // Build workflow progress from application data
  React.useEffect(() => {
    if (!issuerApp) return

    // Build workflow progress
    const progress: WorkflowProgress = {
      applicationId: issuerApp.id,
      totalSections: 10,
      completedSections: issuerApp.application_sections?.filter((s: any) => s.status === 'COMPLETED').length || 0,
      completionPercentage: issuerApp.completion_percentage || 0,
      currentPhase: 'DATA_COLLECTION' as const,
      sectionProgress: {},
      teamProgress: {
        CEO: { role: 'CEO', assignedSections: [], completedSections: [], pendingSections: [], overdueSections: [], totalProgress: 0 },
        CFO: { role: 'CFO', assignedSections: [], completedSections: [], pendingSections: [], overdueSections: [], totalProgress: 0 },
        COMPANY_SECRETARY: { role: 'COMPANY_SECRETARY', assignedSections: [], completedSections: [], pendingSections: [], overdueSections: [], totalProgress: 0 },
        LEGAL_ADVISOR: { role: 'LEGAL_ADVISOR', assignedSections: [], completedSections: [], pendingSections: [], overdueSections: [], totalProgress: 0 }
      }
    }

    // Map application sections to progress
    issuerApp.application_sections?.forEach((section: any) => {
      progress.sectionProgress[section.section_number] = {
        sectionId: section.section_number,
        assignedTo: 'CEO' as UserRole, // Default assignment
        status: section.status,
        comments: [],
        validationStatus: 'PENDING',
        requiredDocuments: [],
        uploadedDocuments: [],
        completedBy: section.completed_by,
        completedDate: section.completed_at ? new Date(section.completed_at) : undefined
      }
    })

    setWorkflowProgress(progress)

    // Set demo team if no real team exists
    if (team.length === 0 && profile) {
      const demoTeam: TeamMember[] = [
        {
          id: user?.id || 'demo-1',
          name: profile.full_name || 'Current User',
          email: profile.email,
          role: profile.role.replace('ISSUER_', '').replace('ISSUER', 'CEO') as UserRole,
          isActive: true,
          joinedDate: new Date()
        }
      ]
      setTeam(demoTeam)
    }
  }, [issuerApp, profile, user, team.length])

  const handleTeamSetup = useCallback(async (setupTeam: TeamMember[]) => {
    setTeam(setupTeam)
    setCurrentPhase('DASHBOARD')
  }, [])

  const handleSectionSelect = useCallback((sectionId: number) => {
    setSelectedSection(sectionId)
    setCurrentPhase('SECTION_FORM')
  }, [])

  const handleSectionComplete = useCallback(async (sectionId: number, isComplete: boolean) => {
    if (!issuerApp || !workflowProgress) return

    try {
      // Update section via API
      const section = issuerApp.application_sections?.find((s: any) => s.section_number === sectionId)
      if (section) {
        await fetch(`/api/cma/applications/${issuerApp.id}/sections/${section.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: isComplete ? 'COMPLETED' : 'IN_PROGRESS',
            data: applicationData,
            completed_by: isComplete ? user?.id : null,
            completed_at: isComplete ? new Date().toISOString() : null
          })
        })

        // Recalculate completion
        await fetch(`/api/cma/applications/${issuerApp.id}/recalculate-completion`, {
          method: 'POST'
        })
      }

      // Update local state
      setWorkflowProgress(prev => {
        if (!prev) return prev
        
        return {
          ...prev,
          sectionProgress: {
            ...prev.sectionProgress,
            [sectionId]: {
              ...prev.sectionProgress[sectionId],
              status: isComplete ? 'COMPLETED' : 'IN_PROGRESS',
              completedDate: isComplete ? new Date() : undefined,
              completedBy: isComplete ? user?.id : undefined
            }
          }
        }
      })
    } catch (err) {
      console.error('Failed to update section progress:', err)
    }
  }, [issuerApp, workflowProgress, applicationData, user])

  const handleApplicationDataChange = useCallback((data: Partial<IssuerApplication>) => {
    setApplicationData(prev => ({
      ...prev,
      ...data,
      lastModified: new Date()
    }))
  }, [])

  const handleBackToDashboard = () => {
    setCurrentPhase('DASHBOARD')
    setSelectedSection(null)
  }

  if (authLoading || appLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your application...</p>
        </div>
      </div>
    )
  }

  if (appError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <FileText className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-xl font-bold mb-2">Error Loading Application</h2>
            <p className="text-muted-foreground mb-4">{appError}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!issuerApp) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-blue-500 mb-4">
              <FileText className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-xl font-bold mb-2">No Application Found</h2>
            <p className="text-muted-foreground mb-4">
              You don't have any IPO applications yet. Contact your administrator to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentPhase === 'TEAM_SETUP') {
    return <TeamSetup onTeamComplete={handleTeamSetup} />
  }

  if (currentPhase === 'DASHBOARD' && profile && workflowProgress) {
    const currentUser: TeamMember = {
      id: user?.id || '',
      name: profile.full_name || '',
      email: profile.email,
      role: profile.role.replace('ISSUER_', '') as UserRole,
      isActive: true,
      joinedDate: new Date()
    }

    return (
      <RoleDashboard
        currentUser={currentUser}
        team={team}
        workflowProgress={workflowProgress}
        onSectionSelect={handleSectionSelect}
      />
    )
  }

  if (currentPhase === 'SECTION_FORM' && selectedSection && profile) {
    const currentUser: TeamMember = {
      id: user?.id || '',
      name: profile.full_name || '',
      email: profile.email,
      role: profile.role.replace('ISSUER_', '') as UserRole,
      isActive: true,
      joinedDate: new Date()
    }

    // Check if user can access this section
    const assignment = DEFAULT_SECTION_ASSIGNMENTS.find(a => a.sectionId === selectedSection)
    if (!assignment || assignment.assignedRole !== currentUser.role) {
      return (
        <div className="max-w-4xl mx-auto p-6">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-red-500 mb-4">
                <FileText className="w-16 h-16 mx-auto" />
              </div>
              <h2 className="text-xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-4">
                This section is not assigned to your role ({currentUser.role.replace('_', ' ')}).
              </p>
              <Button onClick={handleBackToDashboard}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* Section Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={handleBackToDashboard}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
                <div>
                  <h2 className="text-lg font-semibold">
                    Section {selectedSection}: {assignment?.sectionTitle}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Assigned to: {profile.full_name} ({profile.role.replace('ISSUER_', '').replace('_', ' ')})
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Overall Progress</div>
                <div className="text-lg font-bold">{workflowProgress?.completionPercentage || 0}%</div>
                <Progress value={workflowProgress?.completionPercentage || 0} className="w-24" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Form */}
        <IssuerApplicationForm
          initialData={applicationData}
          onSave={handleApplicationDataChange}
          onSubmit={handleApplicationDataChange}
          currentSection={selectedSection}
          onSectionComplete={(isComplete) => handleSectionComplete(selectedSection, isComplete)}
          restrictToSection={selectedSection}
        />
      </div>
    )
  }

  return null
}