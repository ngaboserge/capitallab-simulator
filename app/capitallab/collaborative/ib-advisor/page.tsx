'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SimpleProtectedRoute } from '@/lib/auth/simple-protected-route';
import { useSimpleAuth } from '@/lib/auth/simple-auth-context';
import { ApplicationService } from '@/lib/supabase/applications';
import { useDocuments } from '@/lib/supabase/use-documents';
import { Document as SupabaseDocument } from '@/lib/supabase/types';
import { Document as ApiDocument } from '@/lib/api/document-service';
import { DocumentListViewer } from '@/components/cma-issuer/form-components/document-viewer';
import { useFeedback } from '@/lib/api/use-feedback';
import { FeedbackCommunication } from '@/components/feedback/feedback-communication';
import { 
  Briefcase, 
  ArrowLeft, 
  FileText, 
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  DollarSign,
  Send,
  Eye,
  Edit,
  Calculator,
  MessageSquare,
  Shield
} from 'lucide-react';
import Link from 'next/link';

interface Application {
  id: string;
  company_id: string;
  application_number: string | null;
  status: string;
  submission_date?: string;
  created_at?: string;
  target_amount: number | null;
  completion_percentage: number | null;
  assigned_ib_advisor: string | null;
  assigned_cma_officer: string | null;
  company?: {
    legal_name: string;
    trading_name?: string;
  };
}

interface DealStructure {
  offerType: 'IPO' | 'RIGHTS' | 'PRIVATE_PLACEMENT';
  totalShares: number;
  offerPrice: number;
  totalAmount: number;
  publicFloat: number;
  useOfProceeds: string;
  underwritingFee: number;
  advisoryFee: number;
  timeline: string;
}

function IBAdvisorPageContent() {
  const { profile, loading: authLoading, logout } = useSimpleAuth();
  
  // ALL useState hooks MUST be at the top (React Rules of Hooks)
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('applications');
  const [dealStructure, setDealStructure] = useState<DealStructure>({
    offerType: 'IPO',
    totalShares: 0,
    offerPrice: 0,
    totalAmount: 0,
    publicFloat: 25,
    useOfProceeds: '',
    underwritingFee: 2.5,
    advisoryFee: 1.5,
    timeline: '6 months'
  });
  const [ibComments, setIbComments] = useState('');
  const [newFeedback, setNewFeedback] = useState({
    category: '',
    issue: '',
    priority: 'MEDIUM' as 'HIGH' | 'MEDIUM' | 'LOW'
  });
  const [selectedRegulator, setSelectedRegulator] = useState<string>('');
  const [availableRegulators, setAvailableRegulators] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);

  // Use feedback hook for selected application (Supabase version)
  const { 
    feedback: feedbackItems, 
    createFeedback, 
    loading: feedbackLoading 
  } = useFeedback(selectedApplication?.id || '');

  // Create applicationService instance (must be after hooks)
  const applicationService = new ApplicationService();

  // ALL useEffect hooks must also be at the top
  // Load applications for IB review (from Supabase + localStorage fallback)
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        
        if (!profile?.id) {
          setLoading(false);
          return;
        }

        // First, try to load from Supabase
        try {
          const response = await fetch(`/api/ib-advisors/applications?ibAdvisorId=${profile.id}`);
          if (response.ok) {
            const data = await response.json();
            console.log('Supabase API response:', data);
            if (data.applications && data.applications.length > 0) {
              console.log('✅ Loaded', data.applications.length, 'applications from Supabase');
              setApplications(data.applications);
              setLoading(false);
              return;
            } else {
              console.log('⚠️ No applications found in Supabase, checking localStorage...');
            }
          } else {
            console.warn('❌ Supabase API returned error:', response.status);
          }
        } catch (apiError) {
          console.error('❌ Failed to load from Supabase:', apiError);
        }

        // Fallback to localStorage for backward compatibility
        const ibTransfersKey = `ib_transfers_${profile.id}`;
        console.log('IB Advisor loading transfers with key:', ibTransfersKey);
        
        const transfersData = localStorage.getItem(ibTransfersKey);
        console.log('Transfers data found:', transfersData ? 'YES' : 'NO');
        
        if (transfersData) {
          const transfers = JSON.parse(transfersData);
          
          // Convert transfers to application format
          const loadedApplications: Application[] = transfers.map((transfer: any, index: number) => {
            // Load the actual transfer data
            const transferData = localStorage.getItem(transfer.transferKey);
            const applicationData = transferData ? JSON.parse(transferData) : null;
            
            // Calculate completion
            let completedSections = 0;
            let totalSections = 0;
            if (applicationData?.sections) {
              totalSections = Object.keys(applicationData.sections).length;
              completedSections = Object.values(applicationData.sections).filter(
                (section: any) => section.status === 'COMPLETED'
              ).length;
            }
            const completionPercentage = totalSections > 0 
              ? Math.round((completedSections / totalSections) * 100) 
              : 0;
            
            return {
              id: transfer.transferKey,
              company_id: `company-${index}`,
              application_number: `CMA-2024-${String(index + 1).padStart(3, '0')}`,
              status: 'IB_REVIEW',
              submission_date: transfer.transferDate,
              target_amount: null,
              completion_percentage: completionPercentage,
              assigned_ib_advisor: profile.id,
              company: {
                legal_name: transfer.companyName,
                trading_name: transfer.companyName
              }
            };
          });
          
          setApplications(loadedApplications);
        } else {
          // No transfers yet, show empty state
          setApplications([]);
        }
      } catch (error) {
        console.error('Error loading applications:', error);
        setError('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      loadApplications();
    }
  }, [profile]);

  // Load available CMA regulators from Supabase
  useEffect(() => {
    const loadRegulators = async () => {
      try {
        // Load from Supabase API
        const response = await fetch('/api/cma/ib-advisors');
        if (response.ok) {
          const data = await response.json();
          // Filter for CMA regulators only with valid UUIDs
          const regulators = data.users?.filter((u: any) => {
            const isRegulator = u.role === 'CMA_REGULATOR' || u.role === 'CMA_ADMIN';
            // Check if ID is a valid UUID format
            const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(u.id);
            return isRegulator && isValidUUID;
          }) || [];
          
          if (regulators.length > 0) {
            console.log('✅ Loaded', regulators.length, 'CMA regulators from Supabase');
            setAvailableRegulators(regulators);
            
            // Auto-select first regulator if available
            if (!selectedRegulator) {
              setSelectedRegulator(regulators[0].id);
            }
            return;
          } else {
            console.log('⚠️ No valid CMA regulators found in Supabase');
          }
        }
        
        // Show message if no regulators available
        console.log('ℹ️ No CMA regulators available. Please create a CMA regulator account first.');
        setAvailableRegulators([]);
      } catch (error) {
        console.error('Error loading regulators:', error);
        setAvailableRegulators([]);
      }
    };

    loadRegulators();
  }, [selectedRegulator]);

  // Load sections when application is selected
  useEffect(() => {
    const loadSections = async () => {
      if (!selectedApplication?.id) {
        setSections([]);
        return;
      }

      setSectionsLoading(true);
      try {
        const response = await fetch(`/api/cma/applications/${selectedApplication.id}/sections`);
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Loaded sections from Supabase:', data.sections);
          setSections(data.sections || []);
        } else {
          console.error('Failed to load sections:', response.status);
          setSections([]);
        }
      } catch (error) {
        console.error('Error loading sections:', error);
        setSections([]);
      } finally {
        setSectionsLoading(false);
      }
    };

    loadSections();
  }, [selectedApplication?.id]);

  // Debug logging
  console.log('IBAdvisorPage Debug:', { 
    profile, 
    authLoading,
    role: profile?.role,
    hasProfile: !!profile
  });

  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading IB Advisor dashboard...</p>
        </div>
      </div>
    );
  }

  // Redirect to IB Advisor login if no profile (not logged in)
  if (!profile) {
    // Immediate redirect to dedicated IB Advisor login page
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/ib-advisor-login';
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Redirecting to IB Advisor login...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800';
      case 'IB_REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'IB_APPROVED':
        return 'bg-green-100 text-green-800';
      case 'CMA_REVIEW':
      case 'UNDER_REVIEW':
        return 'bg-purple-100 text-purple-800';
      case 'QUERY_ISSUED':
        return 'bg-orange-100 text-orange-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return <Clock className="h-4 w-4" />;
      case 'IB_REVIEW':
        return <Edit className="h-4 w-4" />;
      case 'IB_APPROVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CMA_REVIEW':
      case 'UNDER_REVIEW':
        return <Eye className="h-4 w-4" />;
      case 'QUERY_ISSUED':
        return <AlertCircle className="h-4 w-4" />;
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleTakeApplication = async (application: Application) => {
    try {
      // Initialize deal structure with issuer's data
      if (application.target_amount) {
        const estimatedShares = 1000000; // Default estimate
        const estimatedPrice = Math.round(application.target_amount / estimatedShares);
        
        setDealStructure(prev => ({
          ...prev,
          totalShares: estimatedShares,
          offerPrice: estimatedPrice,
          totalAmount: application.target_amount || 0
        }));
      }

      // In demo mode, just update local state
      if (!profile || profile.role !== 'IB_ADVISOR') {
        // Demo mode - just update local state
        setApplications(prev =>
          prev.map(app =>
            app.id === application.id
              ? { ...app, status: 'IB_REVIEW', assigned_ib_advisor: 'demo-ib-advisor' }
              : app
          )
        );
        
        setSelectedApplication({ ...application, status: 'IB_REVIEW' });
        setActiveTab('documents');
        return;
      }

      // Real mode - update database via API
      const response = await fetch(`/api/cma/applications/${application.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'IB_REVIEW'
        })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const responseText = await response.text();
        console.error('API Error Response:', responseText);
        console.error('Response status:', response.status);
        
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.error || 'Failed to update application status');
        } catch (e) {
          throw new Error(`Failed to update application status (${response.status}): ${responseText}`);
        }
      }
      
      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === application.id
            ? { ...app, status: 'IB_REVIEW', assigned_ib_advisor: profile?.id || null }
            : app
        )
      );
      
      setSelectedApplication({ ...application, status: 'IB_REVIEW' });
      setActiveTab('documents');
    } catch (error) {
      console.error('Error taking application:', error);
      alert('Error taking application');
    }
  };

  const handleSubmitToCMA = async () => {
    if (!selectedApplication) return;
    
    try {
      // Get selected regulator details
      const selectedRegulatorData = availableRegulators.find(r => r.id === selectedRegulator);
      
      // Submit to CMA via the dedicated submit-to-cma endpoint
      const response = await fetch(`/api/cma/applications/${selectedApplication.id}/submit-to-cma`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ibComments,
          dealStructure,
          assignedRegulatorId: selectedRegulator
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit to CMA');
      }

      const result = await response.json();
      
      // Update local state
      setApplications(prev =>
        prev.map(app =>
          app.id === selectedApplication.id
            ? { 
                ...app, 
                status: 'CMA_REVIEW',
                assigned_cma_officer: selectedRegulator,
                submission_date: new Date().toISOString()
              }
            : app
        )
      );
      
      setIbComments('');
      setSelectedRegulator('');
      const regulatorName = selectedRegulatorData?.full_name || 'CMA Regulator';
      alert(`✅ Application successfully submitted to ${regulatorName}!\n\nThe application is now in the CMA regulatory review queue.`);
      setActiveTab('applications');
    } catch (error) {
      console.error('Error submitting to CMA:', error);
      alert(`Error submitting to CMA: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const calculateDealMetrics = () => {
    const totalAmount = dealStructure.totalShares * dealStructure.offerPrice;
    const underwritingFees = totalAmount * (dealStructure.underwritingFee / 100);
    const advisoryFees = totalAmount * (dealStructure.advisoryFee / 100);
    const netProceeds = totalAmount - underwritingFees - advisoryFees;
    
    return { totalAmount, underwritingFees, advisoryFees, netProceeds };
  };

  const addFeedbackItem = async () => {
    if (!newFeedback.category || !newFeedback.issue) {
      alert('Please fill in all feedback fields');
      return;
    }

    if (!selectedApplication) {
      alert('Please select an application first');
      return;
    }

    try {
      await createFeedback({
        category: newFeedback.category,
        issue: newFeedback.issue,
        priority: newFeedback.priority
      });
      setNewFeedback({ category: '', issue: '', priority: 'MEDIUM' });
      alert(`Feedback sent to ${selectedApplication.company?.legal_name}!`);
    } catch (error) {
      console.error('Error adding feedback:', error);
      alert('Failed to add feedback');
    }
  };

  const sendFeedbackToIssuer = async () => {
    if (feedbackItems.length === 0) {
      alert('Please add at least one feedback item');
      return;
    }

    const pendingItems = feedbackItems.filter(item => item.status === 'PENDING');
    if (pendingItems.length === 0) {
      alert('All feedback items have been resolved');
      return;
    }

    alert(`Feedback notification sent to issuer with ${pendingItems.length} items to address. The issuer team will be notified.`);
  };

  return (
    <SimpleProtectedRoute allowedRoles={['IB_ADVISOR', 'ISSUER']}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Link href="/capitallab/collaborative">
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Hub
                    </Button>
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link href="/shora-market">
                    <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                      View Market
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Briefcase className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">IB Advisor Dashboard</h1>
                    <p className="text-sm text-gray-600">Structure deals and guide issuers through regulatory process</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Briefcase className="h-3 w-3 mr-1" />
                  IB Advisor
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
                
                {/* User Profile Section */}
                {profile && (
                  <div className="flex items-center space-x-3 ml-6 pl-6 border-l border-gray-200">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {profile.full_name || profile.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        {profile.role === 'IB_ADVISOR' ? 'Investment Bank Advisor' : profile.role}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            await logout();
                            // Redirect to dedicated IB Advisor login page
                            window.location.href = '/auth/ib-advisor-login';
                          } catch (error) {
                            console.error('Logout error:', error);
                            // Fallback redirect if logout fails
                            window.location.href = '/auth/ib-advisor-login';
                          }
                        }}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Logout
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Demo Notice */}
        {(!profile || profile.role !== 'IB_ADVISOR') && (
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5 text-green-600" />
                  <div>
                    <h3 className="font-medium text-green-900">Demo Mode - IB Advisor</h3>
                    <p className="text-sm text-green-700">
                      You're viewing the IB Advisor role in demo mode. All actions will be simulated locally without database updates.
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link href="/auth/ib-advisor-login">
                    <Button variant="outline" size="sm" className="border-green-300 text-green-700 hover:bg-green-100">
                      Login as IB Advisor
                    </Button>
                  </Link>
                  <Link href="/auth/ib-advisor-signup">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Create IB Account
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="feedback">Feedback to Issuer</TabsTrigger>
              <TabsTrigger value="cma-feedback">CMA Regulator Feedback</TabsTrigger>
              <TabsTrigger value="structure">Deal Structure</TabsTrigger>
              <TabsTrigger value="submit">Submit to CMA</TabsTrigger>
            </TabsList>

            {/* Applications Tab */}
            <TabsContent value="applications" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-blue-900">Pending Review</h3>
                    <p className="text-2xl font-bold text-blue-700">
                      {applications.filter(a => a.status === 'SUBMITTED').length}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <Edit className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-yellow-900">In Progress</h3>
                    <p className="text-2xl font-bold text-yellow-700">
                      {applications.filter(a => a.status === 'IB_REVIEW').length}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-green-900">Submitted to CMA</h3>
                    <p className="text-2xl font-bold text-green-700">
                      {applications.filter(a => ['CMA_REVIEW', 'QUERY_ISSUED', 'APPROVED'].includes(a.status)).length}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Issuer Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading applications...</div>
                  ) : applications.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No applications available</div>
                  ) : (
                    <div className="space-y-4">
                      {applications.map((application) => (
                        <div
                          key={application.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium">{application.company?.legal_name}</h3>
                              <Badge className={getStatusColor(application.status)}>
                                {getStatusIcon(application.status)}
                                <span className="ml-1">{application.status}</span>
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>Target Amount: RWF {application.target_amount?.toLocaleString() || 'Not specified'}</p>
                              <p>Completion: {application.completion_percentage || 0}%</p>
                              <p>Submitted: {application.submission_date ? new Date(application.submission_date).toLocaleDateString() : 'N/A'}</p>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            {application.status === 'SUBMITTED' && (
                              <Button
                                onClick={() => handleTakeApplication(application)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Take Application
                              </Button>
                            )}
                            {['IB_REVIEW', 'CMA_REVIEW', 'QUERY_ISSUED', 'APPROVED', 'REJECTED'].includes(application.status) && (
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedApplication(application);
                                  setActiveTab('documents');
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Review
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* CMA Regulator Feedback Tab - NEW */}
            <TabsContent value="cma-feedback" className="space-y-6">
              {selectedApplication ? (
                <>
                  {/* Get CMA Regulator Info */}
                  {(() => {
                    // Check if application has been submitted to CMA (using Supabase status)
                    const isSubmittedToCMA = ['CMA_REVIEW', 'QUERY_ISSUED', 'APPROVED', 'REJECTED'].includes(selectedApplication.status);
                    
                    // Get regulator name if assigned
                    const regulatorProfile = availableRegulators.find(r => r.id === selectedApplication.assigned_cma_officer);
                    const regulatorName = regulatorProfile?.full_name || 'CMA Regulator';
                    const regulatorDepartment = regulatorProfile?.department || 'Capital Markets Authority';

                    return (
                      <>
                        {!isSubmittedToCMA ? (
                          <Card>
                            <CardContent className="p-12 text-center">
                              <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">Not Yet Submitted to CMA</h3>
                              <p className="text-gray-600 mb-4">
                                This application has not been submitted to CMA yet. Submit the application first to receive feedback from the regulator.
                              </p>
                              <Button
                                onClick={() => setActiveTab('submit')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Go to Submit Tab
                              </Button>
                            </CardContent>
                          </Card>
                        ) : (
                          <>
                            {/* Header with CMA Regulator Info */}
                            <Card className="bg-gradient-to-r from-red-50 to-blue-50 border-red-200">
                              <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                      Feedback from CMA Regulator: {regulatorName}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      Application: {selectedApplication.application_number} • 
                                      {regulatorDepartment} • Respond to regulatory feedback and provide clarifications
                                    </p>
                                  </div>
                                  <Badge className="bg-red-600 text-white">
                                    <Shield className="h-3 w-3 mr-1" />
                                    CMA Regulator
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>

                            {/* CMA Status Banner */}
                            <Card className={`border-2 ${
                              selectedApplication.status === 'APPROVED' ? 'border-green-500 bg-green-50' :
                              selectedApplication.status === 'REJECTED' ? 'border-red-500 bg-red-50' :
                              selectedApplication.status === 'QUERY_ISSUED' ? 'border-orange-500 bg-orange-50' :
                              'border-blue-500 bg-blue-50'
                            }`}>
                              <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="text-lg font-semibold mb-2">
                                      CMA Review Status: {selectedApplication.status.replace('_', ' ')}
                                    </h3>
                                    <div className="text-sm space-y-1">
                                      <p><strong>Submitted:</strong> {selectedApplication.submission_date ? new Date(selectedApplication.submission_date).toLocaleDateString() : 'N/A'}</p>
                                      <p><strong>Assigned Regulator:</strong> {regulatorName}</p>
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    {selectedApplication.status === 'APPROVED' && <CheckCircle className="h-16 w-16 text-green-600" />}
                                    {selectedApplication.status === 'REJECTED' && <XCircle className="h-16 w-16 text-red-600" />}
                                    {selectedApplication.status === 'QUERY_ISSUED' && <AlertCircle className="h-16 w-16 text-orange-600" />}
                                    {['CMA_REVIEW', 'UNDER_REVIEW'].includes(selectedApplication.status) && <Clock className="h-16 w-16 text-blue-600" />}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>

                            {/* Feedback Communication with CMA */}
                            <FeedbackCommunication 
                              applicationId={selectedApplication.id} 
                              isIBAdvisor={true}
                            />

                            {/* Quick Actions */}
                            <Card>
                              <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <Button
                                  variant="outline"
                                  className="w-full justify-start"
                                  onClick={() => setActiveTab('documents')}
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Review Application Documents
                                </Button>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start"
                                  onClick={() => setActiveTab('structure')}
                                >
                                  <Calculator className="h-4 w-4 mr-2" />
                                  Review Deal Structure
                                </Button>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start"
                                  onClick={() => setActiveTab('feedback')}
                                >
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Communicate with Issuer
                                </Button>
                              </CardContent>
                            </Card>
                          </>
                        )}
                      </>
                    );
                  })()}
                </>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Select an Application</h3>
                    <p className="text-gray-600">Choose an application to view feedback from CMA regulator</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Deal Structure Tab */}
            <TabsContent value="structure" className="space-y-6">
              {selectedApplication ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Calculator className="h-5 w-5" />
                        <span>Deal Structure Review - {selectedApplication.company?.legal_name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Issuer's Original Proposal */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium text-blue-900 mb-3">Issuer's Original Proposal</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-blue-600">Target Amount:</span>
                            <p className="font-medium">RWF {selectedApplication.target_amount?.toLocaleString() || 'Not specified'}</p>
                          </div>
                          <div>
                            <span className="text-blue-600">Offer Type:</span>
                            <p className="font-medium">Initial Public Offering</p>
                          </div>
                          <div>
                            <span className="text-blue-600">Proposed Shares:</span>
                            <p className="font-medium">1,000,000 shares</p>
                          </div>
                          <div>
                            <span className="text-blue-600">Indicative Price:</span>
                            <p className="font-medium">RWF {selectedApplication.target_amount ? Math.round(selectedApplication.target_amount / 1000000) : 500}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">IB Advisor Recommendations</h4>
                          
                          <div>
                            <label className="text-sm font-medium">Recommended Offer Price (RWF)</label>
                            <Input
                              type="number"
                              value={dealStructure.offerPrice}
                              onChange={(e) => setDealStructure(prev => ({ ...prev, offerPrice: Number(e.target.value) }))}
                              placeholder="Based on valuation analysis"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Based on comparable company analysis and market conditions
                            </p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Recommended Shares to Offer</label>
                            <Input
                              type="number"
                              value={dealStructure.totalShares}
                              onChange={(e) => setDealStructure(prev => ({ ...prev, totalShares: Number(e.target.value) }))}
                              placeholder="Optimized for liquidity"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Optimized for market liquidity and regulatory requirements
                            </p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Public Float (%)</label>
                            <Input
                              type="number"
                              value={dealStructure.publicFloat}
                              onChange={(e) => setDealStructure(prev => ({ ...prev, publicFloat: Number(e.target.value) }))}
                              placeholder="Minimum 25%"
                              min="25"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Must meet CMA minimum 25% public float requirement
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">IB Fee Structure & Timeline</h4>
                          
                          <div>
                            <label className="text-sm font-medium">Underwriting Fee (%)</label>
                            <Input
                              type="number"
                              step="0.1"
                              value={dealStructure.underwritingFee}
                              onChange={(e) => setDealStructure(prev => ({ ...prev, underwritingFee: Number(e.target.value) }))}
                              placeholder="Market standard: 2-4%"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Covers underwriting risk and distribution
                            </p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Advisory Fee (%)</label>
                            <Input
                              type="number"
                              step="0.1"
                              value={dealStructure.advisoryFee}
                              onChange={(e) => setDealStructure(prev => ({ ...prev, advisoryFee: Number(e.target.value) }))}
                              placeholder="Typical: 1-2%"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              For structuring and advisory services
                            </p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Estimated Timeline</label>
                            <select
                              value={dealStructure.timeline}
                              onChange={(e) => setDealStructure(prev => ({ ...prev, timeline: e.target.value }))}
                              className="w-full mt-1 p-2 border rounded"
                            >
                              <option value="4-6 months">4-6 months (Fast track)</option>
                              <option value="6-9 months">6-9 months (Standard)</option>
                              <option value="9-12 months">9-12 months (Complex)</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                              From CMA submission to listing
                            </p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">IB Assessment of Use of Proceeds</label>
                            <Textarea
                              value={dealStructure.useOfProceeds}
                              onChange={(e) => setDealStructure(prev => ({ ...prev, useOfProceeds: e.target.value }))}
                              placeholder="IB review and recommendations on fund utilization..."
                              rows={3}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Professional assessment of issuer's proposed fund usage
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Comparison Analysis */}
                      <div className="border-t pt-6">
                        <h3 className="font-semibold mb-4">IB Analysis & Recommendations</h3>
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Valuation Assessment</h4>
                              <p className="text-gray-600">
                                Based on comparable company analysis, the recommended price range is 
                                RWF {dealStructure.offerPrice * 0.9}-{dealStructure.offerPrice * 1.1} per share.
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Market Conditions</h4>
                              <p className="text-gray-600">
                                Current market conditions favor IPOs with strong fundamentals. 
                                Recommended timing aligns with market appetite.
                              </p>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-700 mb-2">Risk Assessment</h4>
                              <p className="text-gray-600">
                                Low to medium risk profile. Strong management team and 
                                solid financial performance support the offering.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Deal Metrics */}
                      <div className="border-t pt-6">
                        <h3 className="font-semibold mb-4">Revised Deal Metrics (IB Recommendations)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {(() => {
                            const metrics = calculateDealMetrics();
                            return (
                              <>
                                <div className="text-center p-3 bg-blue-50 rounded">
                                  <p className="text-sm text-blue-600">Total Amount</p>
                                  <p className="font-bold text-blue-900">RWF {metrics.totalAmount.toLocaleString()}</p>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded">
                                  <p className="text-sm text-green-600">Net Proceeds</p>
                                  <p className="font-bold text-green-900">RWF {metrics.netProceeds.toLocaleString()}</p>
                                </div>
                                <div className="text-center p-3 bg-yellow-50 rounded">
                                  <p className="text-sm text-yellow-600">Underwriting Fees</p>
                                  <p className="font-bold text-yellow-900">RWF {metrics.underwritingFees.toLocaleString()}</p>
                                </div>
                                <div className="text-center p-3 bg-purple-50 rounded">
                                  <p className="text-sm text-purple-600">Advisory Fees</p>
                                  <p className="font-bold text-purple-900">RWF {metrics.advisoryFees.toLocaleString()}</p>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Application</h3>
                    <p className="text-gray-600">Choose an application from the Applications tab to structure the deal</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-6">
              {selectedApplication ? (
                <ApplicationDocuments applicationId={selectedApplication.id} />
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Application</h3>
                    <p className="text-gray-600">Choose an application to review its documents</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Feedback to Issuer Tab */}
            <TabsContent value="feedback" className="space-y-6">
              {selectedApplication ? (
                <>
                  {/* Header with Company Info */}
                  <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            Providing Feedback to: {selectedApplication.company?.legal_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Application: {selectedApplication.application_number} • 
                            All feedback will be sent directly to the issuer team
                          </p>
                        </div>
                        <Badge className="bg-green-600 text-white">
                          <Users className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Add New Feedback - Improved UI */}
                  <Card className="border-2 border-dashed border-gray-300 hover:border-green-400 transition-colors">
                    <CardHeader className="bg-gray-50">
                      <CardTitle className="flex items-center space-x-2">
                        <MessageSquare className="h-5 w-5 text-green-600" />
                        <span>Create New Feedback Item</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-2 block">
                            Category <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={newFeedback.category}
                            onChange={(e) => setNewFeedback(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                          >
                            <option value="">-- Select Category --</option>
                            <option value="MISSING_INFO">📋 Missing Information</option>
                            <option value="INCORRECT_DATA">❌ Incorrect Data</option>
                            <option value="CLARIFICATION_NEEDED">❓ Clarification Needed</option>
                            <option value="DOCUMENT_ISSUE">📄 Document Issue</option>
                            <option value="COMPLIANCE_ISSUE">✅ Compliance Issue</option>
                            <option value="OTHER">📝 Other</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-2 block">
                            Priority Level <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={newFeedback.priority}
                            onChange={(e) => setNewFeedback(prev => ({ ...prev, priority: e.target.value as any }))}
                            className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                          >
                            <option value="LOW">🟢 Low - Minor Issue</option>
                            <option value="MEDIUM">🟡 Medium - Important</option>
                            <option value="HIGH">🔴 High - Critical</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Feedback Description <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                          value={newFeedback.issue}
                          onChange={(e) => setNewFeedback(prev => ({ ...prev, issue: e.target.value }))}
                          placeholder="Clearly describe what needs to be addressed or improved..."
                          rows={4}
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Be specific and actionable. The issuer will receive this feedback directly.
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="text-sm text-gray-600">
                          <AlertCircle className="h-4 w-4 inline mr-1" />
                          Feedback will be sent to {selectedApplication.company?.legal_name}
                        </div>
                        <Button 
                          onClick={addFeedbackItem} 
                          className="bg-green-600 hover:bg-green-700 px-6"
                          disabled={feedbackLoading || !newFeedback.category || !newFeedback.issue}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send Feedback to Issuer
                        </Button>
                      </div>

                      {/* Quick Templates */}
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">📋 Quick Templates (Click to Use)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[
                            { category: 'Financial Documents', issue: 'Please provide audited financial statements for the last 3 years', priority: 'HIGH' },
                            { category: 'Legal Documents', issue: 'Certificate of Incorporation appears to be outdated. Please provide current version', priority: 'MEDIUM' },
                            { category: 'Governance', issue: 'Board resolution for IPO approval is missing', priority: 'HIGH' },
                            { category: 'Compliance', issue: 'Tax clearance certificate is required', priority: 'HIGH' }
                          ].map((template, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => setNewFeedback({
                                category: template.category,
                                issue: template.issue,
                                priority: template.priority as any
                              })}
                              className="text-left h-auto p-3 justify-start hover:bg-green-50 hover:border-green-300 transition-colors"
                            >
                              <div className="w-full">
                                <div className="font-semibold text-sm text-green-700">{template.category}</div>
                                <div className="text-xs text-gray-600 mt-1 line-clamp-2">{template.issue}</div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Feedback Communication */}
                  <FeedbackCommunication applicationId={selectedApplication.id} isIBAdvisor={true} />
                </>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Select an Application</h3>
                    <p className="text-gray-600">Choose an application from the list to provide feedback to the issuer</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Submit to CMA Tab */}
            <TabsContent value="submit" className="space-y-6">
              {selectedApplication && selectedApplication.status === 'IB_REVIEW' ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Send className="h-5 w-5" />
                      <span>Submit to CMA - {selectedApplication.company?.legal_name}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Feedback Status Check */}
                    {feedbackItems.filter(item => item.status === 'PENDING').length > 0 && (
                      <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertCircle className="h-5 w-5 text-orange-600" />
                          <h3 className="font-medium text-orange-900">Outstanding Feedback Items</h3>
                        </div>
                        <p className="text-sm text-orange-700 mb-3">
                          There are {feedbackItems.filter(item => item.status === 'PENDING').length} unresolved feedback items. 
                          Consider resolving these before submitting to CMA.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab('feedback')}
                          className="border-orange-300 text-orange-700 hover:bg-orange-100"
                        >
                          Review Feedback Items
                        </Button>
                      </div>
                    )}

                    {/* CMA Regulator Selection */}
                    <div className="bg-gradient-to-r from-red-50 to-blue-50 p-6 rounded-lg border-2 border-red-200">
                      <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Users className="h-5 w-5 mr-2 text-red-600" />
                        Select CMA Regulator
                      </h3>
                      
                      {availableRegulators.length === 0 ? (
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                          <p className="text-sm text-yellow-800 mb-3">
                            ⚠️ No CMA Regulators are currently registered in the system.
                          </p>
                          <Link href="/auth/cma-regulator-signup">
                            <Button size="sm" variant="outline" className="border-yellow-300">
                              Register as CMA Regulator
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-600 mb-3">
                            Select the CMA regulator who will review this application:
                          </p>
                          <div className="grid grid-cols-1 gap-3">
                            {availableRegulators.map((regulator) => (
                              <div
                                key={regulator.id}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                  selectedRegulator === regulator.id
                                    ? 'border-red-500 bg-red-50 shadow-md'
                                    : 'border-gray-200 hover:border-red-300 bg-white'
                                }`}
                                onClick={() => setSelectedRegulator(regulator.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <Shield className="h-4 w-4 text-red-600" />
                                      <h4 className="font-semibold text-gray-900">{regulator.full_name}</h4>
                                    </div>
                                    <p className="text-sm text-gray-600">{regulator.department}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Employee ID: {regulator.employee_id} • {regulator.email}
                                    </p>
                                  </div>
                                  {selectedRegulator === regulator.id && (
                                    <CheckCircle className="h-6 w-6 text-red-600" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-900 mb-2">IB Advisor Certification</h3>
                      <p className="text-sm text-blue-700">
                        By submitting this application, you certify that you have:
                      </p>
                      <ul className="text-sm text-blue-700 mt-2 space-y-1">
                        <li>• Reviewed all application documents for completeness</li>
                        <li>• Addressed all feedback items with the issuer</li>
                        <li>• Structured the deal according to CMA requirements</li>
                        <li>• Verified financial projections and use of proceeds</li>
                        <li>• Ensured compliance with listing requirements</li>
                      </ul>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">IB Advisor Comments</label>
                      <Textarea
                        value={ibComments}
                        onChange={(e) => setIbComments(e.target.value)}
                        placeholder="Add your professional assessment and recommendations for CMA review..."
                        rows={4}
                      />
                    </div>
                    
                    <Button
                      onClick={handleSubmitToCMA}
                      className="w-full bg-green-600 hover:bg-green-700"
                      disabled={!ibComments.trim() || !selectedRegulator}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {selectedRegulator 
                        ? `Submit to ${availableRegulators.find(r => r.id === selectedRegulator)?.full_name || 'CMA'}`
                        : 'Submit to CMA for Regulatory Review'
                      }
                    </Button>
                    
                    {!selectedRegulator && availableRegulators.length > 0 && (
                      <p className="text-sm text-orange-600 text-center">
                        ⚠️ Please select a CMA regulator before submitting
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Send className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Application Ready</h3>
                    <p className="text-gray-600">
                      {selectedApplication 
                        ? 'This application has already been submitted to CMA'
                        : 'Select an application in review status to submit to CMA'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </SimpleProtectedRoute>
  );
}

export default function IBAdvisorPage() {
  return <IBAdvisorPageContent />;
}

// Component to display application documents
function ApplicationDocuments({ applicationId }: { applicationId: string }) {
  const { documents, loading, error } = useDocuments({
    applicationId,
    autoLoad: true
  });

  // Convert Supabase documents to API documents format
  const apiDocuments: ApiDocument[] = documents.map(doc => ({
    id: doc.id,
    application_id: doc.application_id,
    section_id: doc.section_id,
    filename: doc.filename,
    original_name: doc.original_name,
    file_path: doc.file_path,
    file_size: doc.file_size || 0, // Convert null to 0
    mime_type: doc.mime_type || 'application/octet-stream', // Provide default
    category: doc.category,
    uploaded_by: doc.uploaded_by,
    uploaded_at: doc.uploaded_at,
    is_active: doc.is_active,
    url: doc.url
  }));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Application Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">Loading documents...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Application Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">Error loading documents: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Application Documents</span>
          <Badge variant="outline">{apiDocuments.length} files</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {apiDocuments.length === 0 ? (
          <div className="text-center py-4 text-gray-500">No documents uploaded yet</div>
        ) : (
          <DocumentListViewer
            documents={apiDocuments}
            title=""
            emptyMessage="No documents found"
          />
        )}
      </CardContent>
    </Card>
  );
}