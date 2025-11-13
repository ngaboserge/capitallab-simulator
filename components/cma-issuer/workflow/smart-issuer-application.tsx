"use client"

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { TeamSetup } from './team-setup'
import { RoleDashboard } from './role-dashboard'
import { IssuerApplicationForm } from '../issuer-application-form'
import { 
  TeamMember, 
  WorkflowProgress, 
  DEFAULT_SECTION_ASSIGNMENTS,
  UserRole,
  RoleProgress
} from '@/lib/cma-issuer-system/types/workflow'
import { IssuerApplication } from '@/lib/cma-issuer-system/types'
import { ArrowLeft, Users, FileText, CheckCircle } from 'lucide-react'

type ApplicationPhase = 'TEAM_SETUP' | 'DASHBOARD' | 'SECTION_FORM'

export function SmartIssuerApplication() {
  const [currentPhase, setCurrentPhase] = useState<ApplicationPhase>('TEAM_SETUP')
  const [team, setTeam] = useState<TeamMember[]>([])
  const [currentUser, setCurrentUser] = useState<TeamMember | null>(null)
  const [selectedSection, setSelectedSection] = useState<number | null>(null)
  const [applicationData, setApplicationData] = useState<Partial<IssuerApplication>>({})
  const [workflowProgress, setWorkflowProgress] = useState<WorkflowProgress>({
    applicationId: `app_${Date.now()}`,
    totalSections: 10,
    completedSections: 0,
    completionPercentage: 0,
    currentPhase: 'SETUP',
    sectionProgress: {},
    teamProgress: {
      CEO: { role: 'CEO', assignedSections: [], completedSections: [], pendingSections: [], overdueSections: [], totalProgress: 0 },
      CFO: { role: 'CFO', assignedSections: [], completedSections: [], pendingSections: [], overdueSections: [], totalProgress: 0 },
      COMPANY_SECRETARY: { role: 'COMPANY_SECRETARY', assignedSections: [], completedSections: [], pendingSections: [], overdueSections: [], totalProgress: 0 },
      LEGAL_ADVISOR: { role: 'LEGAL_ADVISOR', assignedSections: [], completedSections: [], pendingSections: [], overdueSections: [], totalProgress: 0 }
    }
  })

  const handleTeamSetup = useCallback((setupTeam: TeamMember[]) => {
    setTeam(setupTeam)
    // Set the first team member as current user (in real app, this would be based on login)
    setCurrentUser(setupTeam[0])
    setCurrentPhase('DASHBOARD')
    
    // Initialize workflow progress
    const initialProgress: WorkflowProgress = {
      applicationId: `app_${Date.now()}`,
      totalSections: 10,
      completedSections: 0,
      completionPercentage: 0,
      currentPhase: 'DATA_COLLECTION',
      sectionProgress: {},
      teamProgress: {} as Record<UserRole, RoleProgress>
    }

    // Initialize section progress
    DEFAULT_SECTION_ASSIGNMENTS.forEach(assignment => {
      initialProgress.sectionProgress[assignment.sectionId] = {
        sectionId: assignment.sectionId,
        assignedTo: assignment.assignedRole,
        status: 'NOT_STARTED',
        comments: [],
        validationStatus: 'PENDING',
        requiredDocuments: [],
        uploadedDocuments: []
      }
    })

    // Initialize team progress
    setupTeam.forEach(member => {
      const memberAssignments = DEFAULT_SECTION_ASSIGNMENTS.filter(
        assignment => assignment.assignedRole === member.role
      )
      initialProgress.teamProgress[member.role] = {
        role: member.role,
        assignedSections: memberAssignments.map(a => a.sectionId),
        completedSections: [],
        pendingSections: memberAssignments.map(a => a.sectionId),
        overdueSections: [],
        totalProgress: 0
      }
    })

    setWorkflowProgress(initialProgress)
  }, [])

  const handleSectionSelect = useCallback((sectionId: number) => {
    setSelectedSection(sectionId)
    setCurrentPhase('SECTION_FORM')
    
    // Mark section as in progress
    setWorkflowProgress(prev => ({
      ...prev,
      sectionProgress: {
        ...prev.sectionProgress,
        [sectionId]: {
          ...prev.sectionProgress[sectionId],
          status: 'IN_PROGRESS'
        }
      }
    }))
  }, [])

  const handleSectionComplete = useCallback((sectionId: number, isComplete: boolean) => {
    setWorkflowProgress(prev => {
      const newSectionProgress = {
        ...prev.sectionProgress,
        [sectionId]: {
          ...prev.sectionProgress[sectionId],
          status: isComplete ? 'COMPLETED' as const : 'IN_PROGRESS' as const,
          completedDate: isComplete ? new Date() : undefined,
          completedBy: isComplete ? currentUser?.id : undefined
        }
      }

      const completedSections = Object.values(newSectionProgress).filter(
        section => section.status === 'COMPLETED'
      ).length

      const completionPercentage = Math.round((completedSections / 10) * 100)

      // Update team progress
      const newTeamProgress = { ...prev.teamProgress }
      if (currentUser) {
        const userAssignments = DEFAULT_SECTION_ASSIGNMENTS.filter(
          assignment => assignment.assignedRole === currentUser.role
        )
        const userCompleted = userAssignments.filter(assignment => 
          newSectionProgress[assignment.sectionId]?.status === 'COMPLETED'
        )
        
        newTeamProgress[currentUser.role] = {
          ...newTeamProgress[currentUser.role],
          completedSections: userCompleted.map(a => a.sectionId),
          pendingSections: userAssignments.filter(assignment => 
            newSectionProgress[assignment.sectionId]?.status !== 'COMPLETED'
          ).map(a => a.sectionId),
          totalProgress: Math.round((userCompleted.length / userAssignments.length) * 100)
        }
      }

      return {
        ...prev,
        sectionProgress: newSectionProgress,
        teamProgress: newTeamProgress,
        completedSections,
        completionPercentage,
        currentPhase: completionPercentage === 100 ? 'COMPLETED' : 'DATA_COLLECTION'
      }
    })
  }, [currentUser])

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

  const getCurrentSectionTitle = () => {
    if (!selectedSection) return ''
    const assignment = DEFAULT_SECTION_ASSIGNMENTS.find(a => a.sectionId === selectedSection)
    return assignment?.sectionTitle || ''
  }

  const canUserAccessSection = (sectionId: number) => {
    if (!currentUser) return false
    const assignment = DEFAULT_SECTION_ASSIGNMENTS.find(a => a.sectionId === sectionId)
    return assignment?.assignedRole === currentUser.role
  }

  if (currentPhase === 'TEAM_SETUP') {
    return <TeamSetup onTeamComplete={handleTeamSetup} />
  }

  if (currentPhase === 'DASHBOARD' && currentUser) {
    return (
      <RoleDashboard
        currentUser={currentUser}
        team={team}
        workflowProgress={workflowProgress}
        onSectionSelect={handleSectionSelect}
      />
    )
  }

  if (currentPhase === 'SECTION_FORM' && selectedSection && currentUser) {
    // Check if user can access this section
    if (!canUserAccessSection(selectedSection)) {
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
                  <h2 className="text-lg font-semibold">Section {selectedSection}: {getCurrentSectionTitle()}</h2>
                  <p className="text-sm text-muted-foreground">
                    Assigned to: {currentUser.name} ({currentUser.role.replace('_', ' ')})
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Overall Progress</div>
                <div className="text-lg font-bold">{workflowProgress.completionPercentage}%</div>
                <Progress value={workflowProgress.completionPercentage} className="w-24" />
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