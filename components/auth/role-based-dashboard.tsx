'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { FeedbackCommunication } from '@/components/feedback/feedback-communication';
import { 
  ISSUER_ROLES, 
  type IssuerRole, 
  getUserSectionPermissions,
  getSectionTitle,
  type SectionPermission 
} from '@/lib/auth/issuer-roles';
import { 
  Crown, 
  Calculator, 
  Scale, 
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  Send,
  Shield,
  Users,
  Building2,
  ArrowLeft
} from 'lucide-react';

interface RoleBasedDashboardProps {
  userRole: IssuerRole;
  userName: string;
  companyName: string;
  applicationId?: string;
  companyId?: string;
  sectionStatuses?: Record<number, 'not_started' | 'in_progress' | 'completed' | 'under_review' | 'approved'>;
  onSectionClick?: (sectionNumber: number) => void;
}

const ROLE_ICONS = {
  CEO: Crown,
  CFO: Calculator,
  LEGAL_ADVISOR: Scale,
  SECRETARY: FileText
};

const ROLE_COLORS = {
  CEO: 'bg-purple-100 text-purple-800 border-purple-200',
  CFO: 'bg-green-100 text-green-800 border-green-200',
  LEGAL_ADVISOR: 'bg-blue-100 text-blue-800 border-blue-200',
  SECRETARY: 'bg-orange-100 text-orange-800 border-orange-200'
};

const STATUS_COLORS = {
  not_started: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  under_review: 'bg-blue-100 text-blue-800',
  approved: 'bg-emerald-100 text-emerald-800'
};

const STATUS_ICONS = {
  not_started: AlertCircle,
  in_progress: Clock,
  completed: CheckCircle,
  under_review: Eye,
  approved: Shield
};

export function RoleBasedDashboard({
  userRole,
  userName,
  companyName,
  applicationId,
  companyId,
  sectionStatuses = {},
  onSectionClick
}: RoleBasedDashboardProps) {
  const [activeTab, setActiveTab] = useState<'my-sections' | 'all-sections' | 'team' | 'feedback'>('my-sections');
  
  const roleDefinition = ISSUER_ROLES[userRole];
  const RoleIcon = ROLE_ICONS[userRole];
  const sectionPermissions = getUserSectionPermissions(userRole);
  
  // Filter sections based on user's responsibilities
  const mySections = sectionPermissions.filter(section => section.isPrimaryResponsible);
  const viewableSections = sectionPermissions.filter(section => section.canView);
  
  // Calculate progress
  const myCompletedSections = mySections.filter(section => 
    sectionStatuses[section.sectionNumber] === 'completed' || 
    sectionStatuses[section.sectionNumber] === 'approved'
  ).length;
  const myProgress = mySections.length > 0 ? (myCompletedSections / mySections.length) * 100 : 0;
  
  const totalCompletedSections = Object.values(sectionStatuses).filter(status => 
    status === 'completed' || status === 'approved'
  ).length;
  const totalProgress = (totalCompletedSections / 10) * 100;

  const getSectionStatusIcon = (status: string) => {
    const IconComponent = STATUS_ICONS[status as keyof typeof STATUS_ICONS] || AlertCircle;
    return <IconComponent className="h-4 w-4" />;
  };

  const canUserPerformAction = (section: SectionPermission, action: 'view' | 'edit' | 'submit' | 'approve') => {
    switch (action) {
      case 'view': return section.canView;
      case 'edit': return section.canEdit;
      case 'submit': return section.canSubmit;
      case 'approve': return section.canApprove;
      default: return false;
    }
  };

  const renderSectionCard = (section: SectionPermission, showPermissions = false) => {
    const status = sectionStatuses[section.sectionNumber] || 'not_started';
    const StatusIcon = STATUS_ICONS[status];
    
    return (
      <Card 
        key={section.sectionNumber}
        className={`cursor-pointer transition-all hover:shadow-md ${
          section.isPrimaryResponsible ? 'border-l-4 border-l-blue-500' : ''
        }`}
        onClick={() => onSectionClick?.(section.sectionNumber)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {section.sectionNumber}
                </Badge>
                {section.isPrimaryResponsible && (
                  <Badge className="text-xs bg-blue-100 text-blue-800">
                    Your Section
                  </Badge>
                )}
              </div>
              <Badge className={STATUS_COLORS[status]}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          
          <h4 className="font-medium text-gray-900 mb-2">{section.sectionTitle}</h4>
          
          {showPermissions && (
            <div className="flex items-center space-x-2 mb-3">
              {section.canView && (
                <Badge variant="outline" className="text-xs">
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Badge>
              )}
              {section.canEdit && (
                <Badge variant="outline" className="text-xs">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Badge>
              )}
              {section.canSubmit && (
                <Badge variant="outline" className="text-xs">
                  <Send className="h-3 w-3 mr-1" />
                  Submit
                </Badge>
              )}
              {section.canApprove && (
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Approve
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {section.isPrimaryResponsible ? 'Primary responsibility' : 'Can view and collaborate'}
            </span>
            {section.canEdit && (
              <Button size="sm" variant="outline">
                {status === 'not_started' ? 'Start' : 'Continue'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-lg ${ROLE_COLORS[userRole]}`}>
            <RoleIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {userName}
            </h1>
            <p className="text-gray-600">
              {roleDefinition.title} at {companyName}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-600">IPO Application Progress</div>
          <div className="text-2xl font-bold text-gray-900">{Math.round(totalProgress)}%</div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Your Sections</span>
              <span className="text-lg font-bold text-blue-600">
                {myCompletedSections}/{mySections.length}
              </span>
            </div>
            <Progress value={myProgress} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">
              {Math.round(myProgress)}% of your assigned sections completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Overall Progress</span>
              <span className="text-lg font-bold text-green-600">
                {totalCompletedSections}/10
              </span>
            </div>
            <Progress value={totalProgress} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">
              {Math.round(totalProgress)}% of all sections completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Your Role</span>
              <Badge className={ROLE_COLORS[userRole]}>
                <RoleIcon className="h-3 w-3 mr-1" />
                {roleDefinition.title}
              </Badge>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {roleDefinition.description}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="my-sections">
            My Sections ({mySections.length})
          </TabsTrigger>
          <TabsTrigger value="all-sections">
            All Sections (10)
          </TabsTrigger>
          <TabsTrigger value="team">
            Team Overview
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <FileText className="h-4 w-4 mr-2" />
            Feedback
          </TabsTrigger>
        </TabsList>

        {/* My Sections Tab */}
        <TabsContent value="my-sections" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Assigned Sections</h3>
            <Badge variant="outline">
              {mySections.length} sections assigned to you
            </Badge>
          </div>
          
          {mySections.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Sections Assigned</h4>
                <p className="text-gray-600">
                  You don't have any primary section responsibilities in this role.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mySections.map(section => renderSectionCard(section))}
            </div>
          )}
        </TabsContent>

        {/* All Sections Tab */}
        <TabsContent value="all-sections" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">All IPO Application Sections</h3>
            <Badge variant="outline">
              {viewableSections.length} sections you can view
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {viewableSections.map(section => renderSectionCard(section, true))}
          </div>
        </TabsContent>

        {/* Team Overview Tab */}
        <TabsContent value="team" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Team Collaboration</h3>
            <Badge variant="outline">
              <Users className="h-3 w-3 mr-1" />
              Multi-role team
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(ISSUER_ROLES).map(([role, definition]) => {
              const Icon = ROLE_ICONS[role as IssuerRole];
              const roleSections = getUserSectionPermissions(role as IssuerRole)
                .filter(s => s.isPrimaryResponsible);
              const roleCompleted = roleSections.filter(s => 
                sectionStatuses[s.sectionNumber] === 'completed' || 
                sectionStatuses[s.sectionNumber] === 'approved'
              ).length;
              const roleProgress = roleSections.length > 0 ? (roleCompleted / roleSections.length) * 100 : 0;
              
              return (
                <Card key={role} className={userRole === role ? 'border-blue-500 bg-blue-50' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-lg ${ROLE_COLORS[role as IssuerRole]}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">{definition.title}</h4>
                        {userRole === role && (
                          <Badge className="text-xs bg-blue-100 text-blue-800">You</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{roleCompleted}/{roleSections.length}</span>
                      </div>
                      <Progress value={roleProgress} className="h-1" />
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-600">
                      {roleSections.length} sections assigned
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">IB Advisor Communication</h3>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              <FileText className="h-3 w-3 mr-1" />
              Feedback & Comments
            </Badge>
          </div>
          
          {companyId ? (
            <FeedbackCommunication 
              applicationId={applicationId || `mock-app-id-${companyId}`}
              isIBAdvisor={false}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Company Associated</h4>
                <p className="text-gray-600">
                  You need to be associated with a company to view feedback.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}