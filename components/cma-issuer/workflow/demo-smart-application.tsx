'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/supabase/auth-context';
import { SupabaseSmartApplication } from './supabase-smart-application';
import { TeamSetup } from './team-setup';
import { RoleDashboard } from './role-dashboard';
import { IssuerApplicationForm } from '../issuer-application-form';
import { 
  TeamMember, 
  WorkflowProgress, 
  DEFAULT_SECTION_ASSIGNMENTS,
  UserRole 
} from '@/lib/cma-issuer-system/types/workflow';
import { 
  Building2, 
  Users, 
  FileText, 
  CheckCircle,
  ArrowRight,
  Play
} from 'lucide-react';

type DemoPhase = 'WELCOME' | 'TEAM_SETUP' | 'ROLE_DASHBOARD' | 'SECTION_FORM';

export function DemoSmartApplication() {
  const { user, profile } = useAuth();
  const [demoPhase, setDemoPhase] = useState<DemoPhase>('WELCOME');
  const [demoTeam, setDemoTeam] = useState<TeamMember[]>([]);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedSection, setSelectedSection] = useState<number | null>(null);
  const [workflowProgress, setWorkflowProgress] = useState<WorkflowProgress | null>(null);

  // If user is authenticated, use the real Supabase application
  if (user && profile) {
    return <SupabaseSmartApplication />;
  }

  // Demo mode for unauthenticated users
  const renderDemoContent = () => {
    switch (demoPhase) {
      case 'WELCOME':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-6 w-6 text-blue-600" />
                <span>Welcome to CMA IPO Application System</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Intelligent Role-Based IPO Workflow
                  </h3>
                  <p className="text-blue-700 mb-4">
                    Experience the smart CMA Rwanda IPO application system with intelligent role assignments,
                    team collaboration, and automated workflow management.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-medium text-blue-900">Smart Team Setup</h4>
                      <p className="text-sm text-blue-700">
                        Intelligent role assignment with section distribution
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-medium text-blue-900">Role Dashboard</h4>
                      <p className="text-sm text-blue-700">
                        Personalized tasks based on your role
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-blue-200">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h4 className="font-medium text-blue-900">Progress Tracking</h4>
                      <p className="text-sm text-blue-700">
                        Real-time team progress and notifications
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setDemoPhase('TEAM_SETUP')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Smart Workflow Demo
                  </Button>
                </div>
                
                <div className="text-sm text-gray-600 space-y-2">
                  <p>
                    <strong>Demo Features:</strong>
                  </p>
                  <ul className="text-left space-y-1">
                    <li>• Set up team with intelligent role assignments</li>
                    <li>• Experience personalized role-based dashboards</li>
                    <li>• Work on sections assigned to your role</li>
                    <li>• See real-time team progress and collaboration</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'TEAM_SETUP':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={() => setDemoPhase('WELCOME')}
              >
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Back to Welcome
              </Button>
              
              <Badge className="bg-blue-100 text-blue-800">
                Demo Mode - Team Setup
              </Badge>
            </div>
            
            <TeamSetup
              onTeamComplete={(team) => {
                setDemoTeam(team);
                // Create demo workflow progress
                const progress: WorkflowProgress = {
                  applicationId: 'demo-app-id',
                  totalSections: 10,
                  completedSections: 0,
                  completionPercentage: 0,
                  currentPhase: 'DATA_COLLECTION',
                  sectionProgress: {},
                  teamProgress: {
                    CEO: { role: 'CEO', assignedSections: [1, 7, 10], completedSections: [], pendingSections: [1, 7, 10], overdueSections: [], totalProgress: 0 },
                    CFO: { role: 'CFO', assignedSections: [2, 3, 6], completedSections: [], pendingSections: [2, 3, 6], overdueSections: [], totalProgress: 0 },
                    COMPANY_SECRETARY: { role: 'COMPANY_SECRETARY', assignedSections: [4, 8], completedSections: [], pendingSections: [4, 8], overdueSections: [], totalProgress: 0 },
                    LEGAL_ADVISOR: { role: 'LEGAL_ADVISOR', assignedSections: [5, 9], completedSections: [], pendingSections: [5, 9], overdueSections: [], totalProgress: 0 }
                  }
                };
                setWorkflowProgress(progress);
                setDemoPhase('ROLE_DASHBOARD');
              }}
              initialTeam={demoTeam}
            />
          </div>
        );

      case 'ROLE_DASHBOARD':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={() => setDemoPhase('TEAM_SETUP')}
              >
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Back to Team Setup
              </Button>
              
              <Badge className="bg-green-100 text-green-800">
                Demo Mode - Role Dashboard
              </Badge>
            </div>
            
            {workflowProgress && demoTeam.length > 0 && (
              <RoleDashboard
                currentUser={demoTeam[0]} // Use first team member as current user
                team={demoTeam}
                workflowProgress={workflowProgress}
                onSectionSelect={(sectionNumber) => {
                  setSelectedSection(sectionNumber);
                  setDemoPhase('SECTION_FORM');
                }}
              />
            )}
          </div>
        );

      case 'SECTION_FORM':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={() => setDemoPhase('ROLE_DASHBOARD')}
              >
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
                Back to Dashboard
              </Button>
              
              <div className="flex items-center space-x-2">
                <Badge className="bg-purple-100 text-purple-800">
                  Role: {demoTeam[0]?.role || 'CEO'}
                </Badge>
                <Badge className="bg-blue-100 text-blue-800">
                  Demo Mode - Section {selectedSection}
                </Badge>
              </div>
            </div>
            
            <IssuerApplicationForm 
              initialData={{
                id: 'demo-application-id'
              }}
              currentSection={selectedSection || 1}
              restrictToSection={selectedSection || 1}
              onSave={(data) => {
                console.log('Demo save:', data);
                // In demo mode, just log the data
              }}
              onSubmit={(data) => {
                console.log('Demo submit:', data);
                alert('Section completed! In real mode, this would update team progress and notify other members.');
                // Go back to dashboard
                setDemoPhase('ROLE_DASHBOARD');
              }}
              onSectionComplete={(isComplete) => {
                if (isComplete && workflowProgress) {
                  // Update demo progress
                  const updatedProgress = {
                    ...workflowProgress,
                    completedSections: workflowProgress.completedSections + 1,
                    completionPercentage: Math.round(((workflowProgress.completedSections + 1) / 10) * 100)
                  };
                  setWorkflowProgress(updatedProgress);
                }
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {renderDemoContent()}
    </div>
  );
}