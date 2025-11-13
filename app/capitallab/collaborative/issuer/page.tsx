'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RoleBasedDashboard } from '@/components/auth/role-based-dashboard';
import { SimpleProtectedRoute } from '@/lib/auth/simple-protected-route';
import { useSimpleAuth } from '@/lib/auth/simple-auth-context';
import { AuthProvider } from '@/lib/supabase/auth-context';
import { type IssuerRole } from '@/lib/auth/issuer-roles';
import { useIssuerApplication } from '@/lib/api/use-application';
import { IBWorkflow } from '@/components/issuer/ib-workflow';
import { IssuerFeedbackAlert } from '@/components/feedback/issuer-feedback-alert';
import { 
  Building2, 
  ArrowLeft, 
  CheckCircle,
  Crown,
  Calculator,
  Scale,
  FileText,
  Users,
  Send
} from 'lucide-react';
import Link from 'next/link';

function IssuerPageContent() {
  const { profile, logout, loading: authLoading } = useSimpleAuth();
  const [companyName, setCompanyName] = useState<string>('');
  const [sectionStatuses, setSectionStatuses] = useState<Record<number, any>>({});
  const [showIBWorkflow, setShowIBWorkflow] = useState(false);
  const [applicationTransferred, setApplicationTransferred] = useState(false);
  
  // Get application data (disabled for localStorage mode)
  // const { application, loading: appLoading } = useIssuerApplication();

  // Get role icon
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'CEO': return Crown;
      case 'CFO': return Calculator;
      case 'LEGAL_ADVISOR': return Scale;
      case 'SECRETARY': return FileText;
      default: return Building2;
    }
  };

  // Load company name
  useEffect(() => {
    const loadCompanyInfo = async () => {
      if (profile?.company_id) {
        try {
          const response = await fetch(`/api/cma/companies/${profile.company_id}`);
          if (response.ok) {
            const data = await response.json();
            setCompanyName(data.company?.legal_name || 'Your Company');
          }
        } catch (error) {
          console.error('Error loading company info:', error);
          setCompanyName('Your Company');
        }
      }
    };

    loadCompanyInfo();
  }, [profile?.company_id]);

  // Load real section statuses from localStorage
  useEffect(() => {
    const loadSectionStatuses = () => {
      const statuses: Record<number, any> = {};
      
      // Check each section (1-10) for completion status
      for (let sectionNumber = 1; sectionNumber <= 10; sectionNumber++) {
        const applicationId = profile?.company_id ? `mock-app-id-${profile.company_id}` : null;
        if (applicationId) {
          const sectionId = `${applicationId}-section-${sectionNumber}`;
          const sectionKey = `mock_section_${sectionId}`;
          
          try {
            const sectionData = localStorage.getItem(sectionKey);
            if (sectionData) {
              const parsedData = JSON.parse(sectionData);
              
              // Map the status from our mock service to dashboard format
              switch (parsedData.status) {
                case 'COMPLETED':
                  statuses[sectionNumber] = 'completed';
                  break;
                case 'IN_PROGRESS':
                  statuses[sectionNumber] = 'in_progress';
                  break;
                case 'NOT_STARTED':
                default:
                  statuses[sectionNumber] = 'not_started';
                  break;
              }
            } else {
              statuses[sectionNumber] = 'not_started';
            }
          } catch (error) {
            console.error(`Error loading section ${sectionNumber} status:`, error);
            statuses[sectionNumber] = 'not_started';
          }
        }
      }
      
      setSectionStatuses(statuses);
    };

    if (profile?.company_id) {
      loadSectionStatuses();
      
      // Set up an interval to refresh section statuses periodically
      const interval = setInterval(loadSectionStatuses, 2000); // Refresh every 2 seconds
      
      // Also refresh when the window gains focus (user returns from section page)
      const handleFocus = () => {
        loadSectionStatuses();
      };
      
      window.addEventListener('focus', handleFocus);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [profile?.company_id]);

  const handleSectionClick = (sectionNumber: number) => {
    // Navigate to the specific section form
    window.location.href = `/capitallab/collaborative/issuer/sections/${sectionNumber}`;
  };

  // Function to manually refresh section statuses (can be called from components)
  const refreshSectionStatuses = () => {
    const statuses: Record<number, any> = {};
    
    // Check each section (1-10) for completion status
    for (let sectionNumber = 1; sectionNumber <= 10; sectionNumber++) {
      const applicationId = profile?.company_id ? `mock-app-id-${profile.company_id}` : null;
      if (applicationId) {
        const sectionId = `${applicationId}-section-${sectionNumber}`;
        const sectionKey = `mock_section_${sectionId}`;
        
        try {
          const sectionData = localStorage.getItem(sectionKey);
          if (sectionData) {
            const parsedData = JSON.parse(sectionData);
            
            // Map the status from our mock service to dashboard format
            switch (parsedData.status) {
              case 'COMPLETED':
                statuses[sectionNumber] = 'completed';
                break;
              case 'IN_PROGRESS':
                statuses[sectionNumber] = 'in_progress';
                break;
              case 'NOT_STARTED':
              default:
                statuses[sectionNumber] = 'not_started';
                break;
            }
          } else {
            statuses[sectionNumber] = 'not_started';
          }
        } catch (error) {
          console.error(`Error loading section ${sectionNumber} status:`, error);
          statuses[sectionNumber] = 'not_started';
        }
      }
    }
    
    setSectionStatuses(statuses);
  };

  // Check if application is ready for IB transfer
  const getCompletedSectionsCount = () => {
    return Object.values(sectionStatuses).filter(status => status === 'completed').length;
  };

  const isReadyForIBTransfer = () => {
    return getCompletedSectionsCount() >= 3; // Require at least 3 completed sections
  };

  const handleIBWorkflowStart = () => {
    setShowIBWorkflow(true);
  };

  const handleIBWorkflowBack = () => {
    setShowIBWorkflow(false);
  };

  const handleIBWorkflowComplete = () => {
    setShowIBWorkflow(false);
    setApplicationTransferred(true);
    // In real app, this would update the application status in the database
  };

  // Debug logging
  console.log('IssuerPage Debug:', { 
    profile, 
    loading: false, // We don't have loading state here
    user: profile ? 'exists' : 'null',
    company_id: profile?.company_id,
    company_role: profile?.company_role 
  });

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Building2 className="h-12 w-12 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if no profile (not logged in)
  if (!profile) {
    // Immediate redirect to login with Issuer context
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login?returnUrl=' + encodeURIComponent('/capitallab/collaborative/issuer') + '&role=ISSUER';
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Building2 className="h-12 w-12 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const RoleIcon = getRoleIcon(profile.company_role || 'CEO');

  // Show IB Workflow if requested
  if (showIBWorkflow) {
    return (
      <IBWorkflow
        companyName={companyName || 'Your Company'}
        onBack={handleIBWorkflowBack}
        onComplete={handleIBWorkflowComplete}
      />
    );
  }

  return (
    <SimpleProtectedRoute allowedRoles={['ISSUER']}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/capitallab/collaborative">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Hub
                  </Button>
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <RoleIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {companyName || 'Loading...'}
                    </h1>
                    <p className="text-sm text-gray-600">
                      IPO Application - {profile.company_role?.replace('_', ' ') || 'Team Member'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <RoleIcon className="h-3 w-3 mr-1" />
                  {profile.company_role?.replace('_', ' ') || 'Issuer'}
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    if (confirm('Are you sure you want to logout?')) {
                      try {
                        await logout();
                        // Redirect to login with return URL and role hint for Issuer
                        window.location.href = '/auth/login?returnUrl=' + encodeURIComponent('/capitallab/collaborative/issuer') + '&role=ISSUER';
                      } catch (error) {
                        console.error('Logout error:', error);
                        // Fallback to manual logout with role hint
                        window.location.href = '/auth/login?role=ISSUER';
                      }
                    }
                  }}
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Role-Based Dashboard */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {profile.company_role && (
            <div>
              {/* Debug Info - Remove this later */}
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Debug Info (Current User):</h4>
                <div className="text-sm text-yellow-700 space-y-1">
                  <p><strong>Username:</strong> {profile.username}</p>
                  <p><strong>Role:</strong> {profile.role}</p>
                  <p><strong>Company Role:</strong> {profile.company_role || 'None'}</p>
                  <p><strong>Company ID:</strong> {profile.company_id || 'None'}</p>
                  <p><strong>Full Name:</strong> {profile.full_name || 'None'}</p>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      if (confirm('This will clear your company role so you can create a new team. Continue?')) {
                        // In a real app, this would call an API to update the profile
                        alert('In a real implementation, this would reset your company role. For now, you can manually update your database or create a new user account.');
                      }
                    }}
                  >
                    Reset Company Role
                  </Button>
                  <Link href="/auth/signup-team">
                    <Button size="sm">
                      Create New Team Anyway
                    </Button>
                  </Link>
                </div>
              </div>

              {/* IB Advisor Feedback Alert */}
              {profile.company_id && (
                <div className="mb-6">
                  <IssuerFeedbackAlert companyId={profile.company_id} />
                </div>
              )}

              {/* IB Advisor Transfer Section */}
              {!applicationTransferred && (
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-blue-900">
                            Ready for IB Advisor Review?
                          </h3>
                          <p className="text-blue-700 text-sm">
                            Transfer your completed sections to an Investment Bank Advisor for professional review
                          </p>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-blue-600">
                            <span>✓ {getCompletedSectionsCount()}/10 sections completed</span>
                            <span>✓ Documents uploaded and verified</span>
                            {isReadyForIBTransfer() && <span>✓ Ready for transfer</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Button
                          onClick={handleIBWorkflowStart}
                          disabled={!isReadyForIBTransfer()}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Select IB Advisor
                        </Button>
                        {!isReadyForIBTransfer() && (
                          <p className="text-xs text-blue-600">
                            Complete at least 3 sections to proceed
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Application Transferred Status */}
              {applicationTransferred && (
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-green-100 rounded-full">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-green-900">
                          Application Transferred to IB Advisor
                        </h3>
                        <p className="text-green-700 text-sm">
                          Your IPO application is now under review by your selected Investment Bank Advisor.
                          You'll receive updates on the review progress.
                        </p>
                        <div className="mt-2 text-sm text-green-600">
                          Status: Under IB Review • Expected response: 2-3 business days
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <RoleBasedDashboard
                userRole={profile.company_role as IssuerRole}
                userName={profile.full_name || profile.username}
                companyName={companyName || 'Your Company'}
                applicationId={profile?.company_id ? `mock-app-id-${profile.company_id}` : undefined}
                companyId={profile?.company_id || undefined}
                sectionStatuses={sectionStatuses}
                onSectionClick={handleSectionClick}
              />
            </div>
          )}
          
          {!profile.company_role && (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to IPO Application</h3>
              <p className="text-gray-600 mb-6">
                To get started, you need to either create a new team for your company or join an existing one.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Link href="/auth/signup-team">
                  <Button className="w-full sm:w-auto">
                    <Building2 className="h-4 w-4 mr-2" />
                    Create New Team
                  </Button>
                </Link>
                
                <Link href="/auth/join-team">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <FileText className="h-4 w-4 mr-2" />
                    Join Existing Team
                  </Button>
                </Link>
              </div>
              
              <div className="mt-8 p-4 bg-blue-50 rounded-lg max-w-2xl mx-auto">
                <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                <ul className="text-sm text-blue-800 space-y-1 text-left">
                  <li>• <strong>Create New Team:</strong> Set up your company and assign roles to team members</li>
                  <li>• <strong>Join Existing Team:</strong> Get added to your company's existing IPO application team</li>
                  <li>• <strong>Role-Based Access:</strong> Each team member sees only their assigned sections</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </SimpleProtectedRoute>
  );
}

export default function IssuerRolePage() {
  return <IssuerPageContent />;
}