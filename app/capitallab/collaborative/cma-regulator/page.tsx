'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { SimpleProtectedRoute } from '@/lib/auth/simple-protected-route';
import { useSimpleAuth } from '@/lib/auth/simple-auth-context';
import { ApplicationService } from '@/lib/supabase/applications';
import { DocumentListViewer } from '@/components/cma-issuer/form-components/document-viewer';
import { useDocuments } from '@/lib/supabase/use-documents';
import { ApplicationDataViewer } from '@/components/cma-regulator/application-data-viewer';
import { FeedbackCommunication } from '@/components/feedback/feedback-communication';
import { useFeedbackLocalStorage } from '@/lib/api/use-feedback-localstorage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  ArrowLeft, 
  FileText, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Eye,
  MessageSquare,
  Download,
  Filter,
  Send,
  Briefcase
} from 'lucide-react';
import Link from 'next/link';

interface Application {
  id: string;
  company_id: string;
  application_number: string;
  status: string;
  submission_date: string;
  target_amount: number;
  completion_percentage: number;
  company?: {
    legal_name: string;
    trading_name?: string;
  };
}

function CMARegulatorPageContent() {
  const { profile, logout } = useSimpleAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('review');
  const [newFeedback, setNewFeedback] = useState({
    category: '',
    issue: '',
    priority: 'MEDIUM' as 'HIGH' | 'MEDIUM' | 'LOW'
  });

  const applicationService = new ApplicationService();

  // Use feedback hook for CMA-to-IB communication
  const { 
    feedback: feedbackItems, 
    createFeedback, 
    loading: feedbackLoading 
  } = useFeedbackLocalStorage(
    selectedApplication?.id || '', 
    profile?.id, 
    profile?.full_name || profile?.username,
    'CMA_REGULATOR'
  );

  // Load applications for review
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load applications submitted by IB Advisors from localStorage
        const allKeys = Object.keys(localStorage);
        const ibTransferKeys = allKeys.filter(key => key.startsWith('ib_transfer_'));
        
        console.log('CMA Regulator loading applications...');
        console.log('Found IB transfer keys:', ibTransferKeys.length);

        const loadedApplications: Application[] = [];

        // Load each IB transfer
        ibTransferKeys.forEach((key, index) => {
          try {
            const transferData = localStorage.getItem(key);
            if (transferData) {
              const transfer = JSON.parse(transferData);
              
              // Check if this application has been submitted to CMA (status: IB_APPROVED)
              const cmaSubmissionKey = `cma_submission_${key}`;
              const cmaSubmissionData = localStorage.getItem(cmaSubmissionKey);
              const cmaSubmission = cmaSubmissionData ? JSON.parse(cmaSubmissionData) : null;
              
              // Calculate completion
              let completedSections = 0;
              let totalSections = 0;
              if (transfer.sections) {
                totalSections = Object.keys(transfer.sections).length;
                completedSections = Object.values(transfer.sections).filter(
                  (section: any) => section.status === 'COMPLETED'
                ).length;
              }
              const completionPercentage = totalSections > 0 
                ? Math.round((completedSections / totalSections) * 100) 
                : 0;

              // Only include applications that have been submitted to CMA
              if (cmaSubmission || transfer.status === 'IB_APPROVED') {
                // Get company name from CMA submission first, then transfer data
                const companyName = cmaSubmission?.companyName || transfer.companyName || 'Unknown Company';
                const targetAmount = cmaSubmission?.dealStructure?.totalAmount || transfer.targetAmount || null;
                
                const application: Application = {
                  id: key,
                  company_id: transfer.companyId || `company-${index}`,
                  application_number: `CMA-2024-${String(index + 1).padStart(3, '0')}`,
                  status: cmaSubmission?.status || 'IB_APPROVED', // IB_APPROVED means submitted to CMA
                  submission_date: cmaSubmission?.submissionDate || transfer.transferDate || new Date().toISOString(),
                  target_amount: targetAmount,
                  completion_percentage: completionPercentage,
                  company: {
                    legal_name: companyName,
                    trading_name: transfer.tradingName || companyName
                  }
                };

                loadedApplications.push(application);
              }
            }
          } catch (e) {
            console.error(`Error loading transfer ${key}:`, e);
          }
        });

        console.log('Loaded applications for CMA review:', loadedApplications.length);

        if (loadedApplications.length === 0) {
          // Show demo data if no real applications
          const mockApplications: Application[] = [
            {
              id: 'demo-1',
              company_id: 'demo-company-1',
              application_number: 'CMA-2024-001',
              status: 'IB_APPROVED',
              submission_date: new Date().toISOString(),
              target_amount: 500000000,
              completion_percentage: 85,
              company: {
                legal_name: 'Rwanda Tech Solutions Ltd (Demo)',
                trading_name: 'RTS'
              }
            },
            {
              id: 'demo-2',
              company_id: 'demo-company-2',
              application_number: 'CMA-2024-002',
              status: 'UNDER_REVIEW',
              submission_date: new Date(Date.now() - 86400000).toISOString(),
              target_amount: 750000000,
              completion_percentage: 92,
              company: {
                legal_name: 'Green Energy Rwanda PLC (Demo)',
                trading_name: 'GER'
              }
            }
          ];
          setApplications(mockApplications);
        } else {
          setApplications(loadedApplications);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load applications';
        console.error('Error loading applications:', error);
        setError(errorMessage);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [profile]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800';
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 text-yellow-800';
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
      case 'UNDER_REVIEW':
        return <Eye className="h-4 w-4" />;
      case 'QUERY_ISSUED':
        return <MessageSquare className="h-4 w-4" />;
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleApplicationSelect = (application: Application) => {
    setSelectedApplication(application);
  };

  const handleApprove = async () => {
    if (!selectedApplication) return;
    
    try {
      // Update CMA submission record in localStorage
      const cmaSubmissionKey = `cma_submission_${selectedApplication.id}`;
      const cmaSubmissionData = localStorage.getItem(cmaSubmissionKey);
      
      if (cmaSubmissionData) {
        const cmaSubmission = JSON.parse(cmaSubmissionData);
        cmaSubmission.status = 'APPROVED';
        cmaSubmission.cmaDecisionDate = new Date().toISOString();
        cmaSubmission.cmaReviewerName = profile?.full_name || 'CMA Regulator';
        cmaSubmission.cmaComments = reviewComment;
        localStorage.setItem(cmaSubmissionKey, JSON.stringify(cmaSubmission));
      }
      
      // Update local state (localStorage mode)
      setApplications(prev => 
        prev.map(app => 
          app.id === selectedApplication.id 
            ? { ...app, status: 'APPROVED' }
            : app
        )
      );
      
      setReviewComment('');
      alert('✅ Application APPROVED by CMA!\n\nThe company can now proceed to SHORA Exchange listing.');
    } catch (error) {
      console.error('Error approving application:', error);
      alert('Error approving application');
    }
  };

  const handleReject = async () => {
    if (!selectedApplication || !reviewComment.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    try {
      // Update CMA submission record in localStorage
      const cmaSubmissionKey = `cma_submission_${selectedApplication.id}`;
      const cmaSubmissionData = localStorage.getItem(cmaSubmissionKey);
      
      if (cmaSubmissionData) {
        const cmaSubmission = JSON.parse(cmaSubmissionData);
        cmaSubmission.status = 'REJECTED';
        cmaSubmission.cmaDecisionDate = new Date().toISOString();
        cmaSubmission.cmaReviewerName = profile?.full_name || 'CMA Regulator';
        cmaSubmission.cmaComments = reviewComment;
        localStorage.setItem(cmaSubmissionKey, JSON.stringify(cmaSubmission));
      }
      
      // Update local state (localStorage mode)
      setApplications(prev => 
        prev.map(app => 
          app.id === selectedApplication.id 
            ? { ...app, status: 'REJECTED' }
            : app
        )
      );
      
      setReviewComment('');
      alert('❌ Application REJECTED by CMA.\n\nThe issuer and IB Advisor will be notified with the rejection reasons.');
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('Error rejecting application');
    }
  };

  const handleQuery = async () => {
    if (!selectedApplication || !reviewComment.trim()) {
      alert('Please provide query details');
      return;
    }
    
    try {
      // Update CMA submission record in localStorage
      const cmaSubmissionKey = `cma_submission_${selectedApplication.id}`;
      const cmaSubmissionData = localStorage.getItem(cmaSubmissionKey);
      
      if (cmaSubmissionData) {
        const cmaSubmission = JSON.parse(cmaSubmissionData);
        cmaSubmission.status = 'QUERY_ISSUED';
        cmaSubmission.cmaQueryDate = new Date().toISOString();
        cmaSubmission.cmaReviewerName = profile?.full_name || 'CMA Regulator';
        cmaSubmission.cmaComments = reviewComment;
        localStorage.setItem(cmaSubmissionKey, JSON.stringify(cmaSubmission));
      }
      
      // In demo mode, just update local state
      if (!profile || !['CMA_REGULATOR', 'CMA_ADMIN'].includes(profile.role)) {
        // Demo mode - just update local state
        setApplications(prev => 
          prev.map(app => 
            app.id === selectedApplication.id 
              ? { ...app, status: 'QUERY_ISSUED' }
              : app
          )
        );
        
        setReviewComment('');
        alert('⚠️ Query issued to issuer.\n\nThe issuer will be notified and must respond to the query.');
        return;
      }

      // Real mode - update database
      await applicationService.updateApplicationStatus(
        selectedApplication.id, 
        'QUERY_ISSUED',
        reviewComment
      );
      
      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === selectedApplication.id 
            ? { ...app, status: 'QUERY_ISSUED' }
            : app
        )
      );
      
      setReviewComment('');
      alert('⚠️ Query issued to issuer');
    } catch (error) {
      console.error('Error issuing query:', error);
      alert('Error issuing query');
    }
  };

  const filteredApplications = applications.filter(app => 
    filterStatus === 'all' || app.status === filterStatus
  );

  return (
    <SimpleProtectedRoute allowedRoles={['CMA_REGULATOR', 'CMA_ADMIN']}>
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
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Shield className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">CMA Regulator</h1>
                    <p className="text-sm text-gray-600">Application Review & Compliance</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <Shield className="h-3 w-3 mr-1" />
                  Regulator
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
                        {(profile as any).department || 'CMA Regulator'} • {(profile as any).employee_id || 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            await logout();
                            window.location.href = '/auth/cma-regulator-login';
                          } catch (error) {
                            console.error('Logout error:', error);
                            window.location.href = '/auth/cma-regulator-login';
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

        {/* Regulatory Dashboard Overview */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Key Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Applications</p>
                    <p className="text-2xl font-bold text-blue-900">{applications.length}</p>
                    <p className="text-xs text-blue-500">This Quarter</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Under Review</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {applications.filter(a => ['IB_APPROVED', 'UNDER_REVIEW'].includes(a.status)).length}
                    </p>
                    <p className="text-xs text-yellow-500">Avg: 45 days</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Approved</p>
                    <p className="text-2xl font-bold text-green-900">
                      {applications.filter(a => a.status === 'APPROVED').length}
                    </p>
                    <p className="text-xs text-green-500">95% Success Rate</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Queries Issued</p>
                    <p className="text-2xl font-bold text-red-900">
                      {applications.filter(a => a.status === 'QUERY_ISSUED').length}
                    </p>
                    <p className="text-xs text-red-500">Pending Response</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Applications List */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Regulatory Queue</span>
                    <Badge variant="outline">{filteredApplications.length}</Badge>
                  </CardTitle>
                  
                  {/* Regulatory Notices */}
                  {(!profile || !['CMA_REGULATOR', 'CMA_ADMIN'].includes(profile.role)) && (
                    <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                      📋 Demo Mode: CMA Rwanda Regulatory Review System
                    </div>
                  )}
                  
                  <div className="text-xs text-green-600 bg-green-50 p-2 rounded mt-2">
                    🏛️ Capital Markets Authority - Rwanda | Regulatory Review Dashboard
                  </div>

                  {/* Priority and Filter Controls */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="all">All Applications</option>
                        <option value="IB_APPROVED">New Submissions</option>
                        <option value="UNDER_REVIEW">Under Review</option>
                        <option value="QUERY_ISSUED">Query Issued</option>
                        <option value="APPROVED">Approved</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      SLA: 60 working days
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">Loading applications...</div>
                  ) : error ? (
                    <div className="p-4 text-center text-red-500">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <p className="font-medium">Error Loading Applications</p>
                      <p className="text-sm">{error}</p>
                      {error.includes('Not authenticated') && (
                        <p className="text-xs mt-2 text-gray-600">
                          Please sign in with a CMA Regulator account
                        </p>
                      )}
                    </div>
                  ) : filteredApplications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No applications found</div>
                  ) : (
                    <div className="space-y-3 p-4">
                      {filteredApplications.map((application) => {
                        // Calculate compliance score (demo)
                        const complianceScore = Math.min(95, application.completion_percentage + Math.floor(Math.random() * 10));
                        const riskLevel = complianceScore >= 85 ? 'LOW' : complianceScore >= 70 ? 'MEDIUM' : 'HIGH';
                        const daysInReview = Math.floor(Math.random() * 45) + 1;
                        
                        return (
                          <div
                            key={application.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                              selectedApplication?.id === application.id
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleApplicationSelect(application)}
                          >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-medium text-sm text-gray-900 mb-1">
                                  {application.company?.legal_name || 'Unknown Company'}
                                </h3>
                                <p className="text-xs text-gray-500">
                                  {application.company?.trading_name && `(${application.company.trading_name})`}
                                </p>
                              </div>
                              <Badge className={getStatusColor(application.status)}>
                                {getStatusIcon(application.status)}
                                <span className="ml-1 text-xs">{application.status.replace('_', ' ')}</span>
                              </Badge>
                            </div>

                            {/* Regulatory Details */}
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div className="text-xs">
                                <span className="text-gray-500">Application #:</span>
                                <p className="font-medium">{application.application_number || 'CMA-2024-' + (Math.floor(Math.random() * 100) + 1).toString().padStart(3, '0')}</p>
                              </div>
                              <div className="text-xs">
                                <span className="text-gray-500">Target Amount:</span>
                                <p className="font-medium">RWF {application.target_amount?.toLocaleString() || 'TBD'}</p>
                              </div>
                              <div className="text-xs">
                                <span className="text-gray-500">Days in Review:</span>
                                <p className="font-medium">{daysInReview} days</p>
                              </div>
                              <div className="text-xs">
                                <span className="text-gray-500">Risk Level:</span>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    riskLevel === 'LOW' ? 'border-green-300 text-green-700' :
                                    riskLevel === 'MEDIUM' ? 'border-yellow-300 text-yellow-700' :
                                    'border-red-300 text-red-700'
                                  }`}
                                >
                                  {riskLevel}
                                </Badge>
                              </div>
                            </div>

                            {/* Compliance Score */}
                            <div className="mb-2">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-500">Compliance Score</span>
                                <span className={`font-medium ${
                                  complianceScore >= 85 ? 'text-green-600' :
                                  complianceScore >= 70 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {complianceScore}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    complianceScore >= 85 ? 'bg-green-500' :
                                    complianceScore >= 70 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${complianceScore}%` }}
                                ></div>
                              </div>
                            </div>

                            {/* Priority Indicators */}
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-2">
                                {daysInReview > 30 && (
                                  <Badge variant="outline" className="border-orange-300 text-orange-700">
                                    ⚠️ SLA Risk
                                  </Badge>
                                )}
                                {application.target_amount && application.target_amount > 1000000000 && (
                                  <Badge variant="outline" className="border-purple-300 text-purple-700">
                                    💎 Large Cap
                                  </Badge>
                                )}
                              </div>
                              <span className="text-gray-400">
                                Submitted {new Date(application.submission_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Application Review Panel */}
            <div className="lg:col-span-2 space-y-6">
              {selectedApplication ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="review">Application Review</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="feedback">Feedback to IB Advisor</TabsTrigger>
                    <TabsTrigger value="decision">CMA Decision</TabsTrigger>
                  </TabsList>

                  {/* Application Review Tab */}
                  <TabsContent value="review" className="space-y-6">
                    <>
                  {/* Regulatory Review Header */}
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Shield className="h-6 w-6 text-blue-600" />
                          <div>
                            <span className="text-lg">CMA Regulatory Review</span>
                            <p className="text-sm text-gray-600 font-normal">
                              {selectedApplication.company?.legal_name}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(selectedApplication.status)}>
                          {selectedApplication.status.replace('_', ' ')}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-3 rounded">
                          <label className="text-xs font-medium text-gray-600">Application Number</label>
                          <p className="text-sm font-semibold">{selectedApplication.application_number || 'CMA-2024-' + Math.floor(Math.random() * 100)}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <label className="text-xs font-medium text-gray-600">Target Amount</label>
                          <p className="text-sm font-semibold">
                            RWF {selectedApplication.target_amount?.toLocaleString() || 'TBD'}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <label className="text-xs font-medium text-gray-600">Review Officer</label>
                          <p className="text-sm font-semibold">{profile?.full_name || 'CMA Officer'}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <label className="text-xs font-medium text-gray-600">SLA Deadline</label>
                          <p className="text-sm font-semibold text-orange-600">
                            {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Application Data - All Sections */}
                  <ApplicationDataViewer applicationId={selectedApplication.id} />

                  {/* Detailed Compliance Checklist */}
                  <DetailedComplianceChecklist />
                    </>
                  </TabsContent>

                  {/* Documents Tab */}
                  <TabsContent value="documents" className="space-y-6">
                    <ApplicationDocuments applicationId={selectedApplication.id} />
                  </TabsContent>

                  {/* Feedback to IB Advisor Tab */}
                  <TabsContent value="feedback" className="space-y-6">
                    {/* Get IB Advisor Info */}
                    {(() => {
                      // Load IB Advisor info from CMA submission
                      const cmaSubmissionKey = `cma_submission_${selectedApplication.id}`;
                      const cmaSubmissionData = localStorage.getItem(cmaSubmissionKey);
                      const cmaSubmission = cmaSubmissionData ? JSON.parse(cmaSubmissionData) : null;
                      const ibAdvisorName = cmaSubmission?.ibAdvisorName || 'IB Advisor';
                      const ibAdvisorId = cmaSubmission?.ibAdvisorId || 'unknown';

                      return (
                        <>
                          {/* Header with IB Advisor Info */}
                          <Card className="bg-gradient-to-r from-red-50 to-green-50 border-red-200">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    Communicate with IB Advisor: {ibAdvisorName}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    Application: {selectedApplication.application_number} • 
                                    Send queries and feedback to the IB Advisor for clarification
                                  </p>
                                </div>
                                <Badge className="bg-red-600 text-white">
                                  <Briefcase className="h-3 w-3 mr-1" />
                                  IB Advisor
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Add New Feedback to IB Advisor */}
                          <Card className="border-2 border-dashed border-gray-300 hover:border-red-400 transition-colors">
                            <CardHeader className="bg-gray-50">
                              <CardTitle className="flex items-center space-x-2">
                                <MessageSquare className="h-5 w-5 text-red-600" />
                                <span>Send Query to IB Advisor</span>
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
                                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                                  >
                                    <option value="">-- Select Category --</option>
                                    <option value="Financial Projections">📊 Financial Projections</option>
                                    <option value="Deal Structure">💼 Deal Structure</option>
                                    <option value="Valuation">💰 Valuation</option>
                                    <option value="Use of Proceeds">📈 Use of Proceeds</option>
                                    <option value="Risk Assessment">⚠️ Risk Assessment</option>
                                    <option value="Documentation">📝 Documentation</option>
                                    <option value="Other">❓ Other</option>
                                  </select>
                                </div>
                                
                                <div>
                                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                    Priority Level <span className="text-red-500">*</span>
                                  </label>
                                  <select
                                    value={newFeedback.priority}
                                    onChange={(e) => setNewFeedback(prev => ({ ...prev, priority: e.target.value as any }))}
                                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                                  >
                                    <option value="LOW">🟢 Low - Informational</option>
                                    <option value="MEDIUM">🟡 Medium - Requires Response</option>
                                    <option value="HIGH">🔴 High - Critical Query</option>
                                  </select>
                                </div>
                              </div>
                              
                              <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                  Query / Feedback to IB Advisor <span className="text-red-500">*</span>
                                </label>
                                <Textarea
                                  value={newFeedback.issue}
                                  onChange={(e) => setNewFeedback(prev => ({ ...prev, issue: e.target.value }))}
                                  placeholder="Describe your query or feedback for the IB Advisor. Be specific about what clarification or additional information is needed..."
                                  rows={4}
                                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  The IB Advisor will receive this query and can respond with clarifications.
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-4 border-t">
                                <div className="text-sm text-gray-600">
                                  <AlertCircle className="h-4 w-4 inline mr-1" />
                                  Query will be sent to {ibAdvisorName}
                                </div>
                                <Button 
                                  onClick={async () => {
                                    if (!newFeedback.category || !newFeedback.issue) {
                                      alert('Please fill in all fields');
                                      return;
                                    }

                                    try {
                                      await createFeedback({
                                        category: newFeedback.category,
                                        issue: newFeedback.issue,
                                        priority: newFeedback.priority,
                                        company_id: selectedApplication.company_id
                                      });
                                      setNewFeedback({ category: '', issue: '', priority: 'MEDIUM' });
                                      alert(`Query sent to ${ibAdvisorName}!`);
                                    } catch (error) {
                                      console.error('Error sending feedback:', error);
                                      alert('Failed to send query');
                                    }
                                  }}
                                  className="bg-red-600 hover:bg-red-700 px-6"
                                  disabled={feedbackLoading || !newFeedback.category || !newFeedback.issue}
                                >
                                  <Send className="h-4 w-4 mr-2" />
                                  Send Query to IB Advisor
                                </Button>
                              </div>

                              {/* Quick Templates */}
                              <div className="border-t pt-4">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">📋 Common Regulatory Queries (Click to Use)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {[
                                    { category: 'Financial Projections', issue: 'Please provide additional support for revenue growth projections in years 3-5', priority: 'HIGH' },
                                    { category: 'Deal Structure', issue: 'Clarify the rationale for the proposed public float percentage', priority: 'MEDIUM' },
                                    { category: 'Valuation', issue: 'Provide comparable company analysis supporting the valuation', priority: 'HIGH' },
                                    { category: 'Use of Proceeds', issue: 'Break down capital expenditure allocation in more detail', priority: 'MEDIUM' }
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
                                      className="text-left h-auto p-3 justify-start hover:bg-red-50 hover:border-red-300 transition-colors"
                                    >
                                      <div className="w-full">
                                        <div className="font-semibold text-sm text-red-700">{template.category}</div>
                                        <div className="text-xs text-gray-600 mt-1 line-clamp-2">{template.issue}</div>
                                      </div>
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          {/* Feedback Communication Component */}
                          <FeedbackCommunication 
                            applicationId={selectedApplication.id} 
                            isIBAdvisor={false}
                          />
                        </>
                      );
                    })()}
                  </TabsContent>

                  {/* CMA Decision Tab */}
                  <TabsContent value="decision" className="space-y-6">
                  {/* Regulatory Decision Panel */}
                  <Card className="border-l-4 border-l-red-500">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-red-600" />
                        <span>CMA Regulatory Decision</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Decision Templates */}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Common Review Items</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {[
                            'Financial projections require additional validation',
                            'Board composition needs independent director confirmation',
                            'Use of proceeds requires more detailed breakdown',
                            'Auditor opinion letter needs clarification on going concern',
                            'Share ownership structure requires verification',
                            'Business model sustainability assessment needed'
                          ].map((template, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => setReviewComment(template)}
                              className="text-left h-auto p-2 justify-start text-xs"
                            >
                              {template}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Official CMA Review Comments
                        </label>
                        <Textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Enter detailed regulatory review comments, specific queries, or reasons for decision. This will be part of the official CMA record..."
                          rows={5}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          These comments will be included in the official CMA decision letter
                        </p>
                      </div>

                      {/* Decision Actions */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Regulatory Decision</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Button
                            onClick={handleApprove}
                            className="bg-green-600 hover:bg-green-700 h-12"
                            disabled={selectedApplication.status === 'APPROVED'}
                          >
                            <CheckCircle className="h-5 w-5 mr-2" />
                            <div className="text-left">
                              <div className="font-medium">APPROVE</div>
                              <div className="text-xs opacity-90">Issue Approval Letter</div>
                            </div>
                          </Button>
                          
                          <Button
                            onClick={handleQuery}
                            variant="outline"
                            className="border-orange-500 text-orange-600 hover:bg-orange-50 h-12"
                            disabled={!reviewComment.trim()}
                          >
                            <MessageSquare className="h-5 w-5 mr-2" />
                            <div className="text-left">
                              <div className="font-medium">QUERY</div>
                              <div className="text-xs opacity-90">Request Information</div>
                            </div>
                          </Button>
                          
                          <Button
                            onClick={handleReject}
                            variant="outline"
                            className="border-red-500 text-red-600 hover:bg-red-50 h-12"
                            disabled={!reviewComment.trim()}
                          >
                            <XCircle className="h-5 w-5 mr-2" />
                            <div className="text-left">
                              <div className="font-medium">REJECT</div>
                              <div className="text-xs opacity-90">Issue Rejection Letter</div>
                            </div>
                          </Button>
                        </div>
                        
                        <div className="mt-4 text-xs text-gray-600 bg-white p-3 rounded border">
                          <strong>Regulatory Authority:</strong> All decisions are made under the Capital Markets Law of Rwanda 
                          and CMA Regulations. Decisions are subject to internal review and appeal processes.
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  </TabsContent>
                </Tabs>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Application</h3>
                    <p className="text-gray-600">
                      Choose an application from the list to review its details and documents
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </SimpleProtectedRoute>
  );
}

export default function CMARegulatorPage() {
  return <CMARegulatorPageContent />;
}

// Component to display application documents
function ApplicationDocuments({ applicationId }: { applicationId: string }) {
  const { documents, loading, error } = useDocuments({
    applicationId,
    autoLoad: true
  });

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

  // Convert Supabase documents to API documents format
  const apiDocuments = documents.map(doc => ({
    ...doc,
    file_size: doc.file_size || 0,
    mime_type: doc.mime_type || 'application/octet-stream'
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Application Documents</span>
          <Badge variant="outline">{documents.length} files</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
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


// Detailed Compliance Checklist Component
function DetailedComplianceChecklist() {
  const [expandedSection, setExpandedSection] = useState<string | null>('eligibility');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [itemNotes, setItemNotes] = useState<{[key: string]: string}>({});
  const [itemStatus, setItemStatus] = useState<{[key: string]: string}>({});
  
  // Function to update item status
  const updateItemStatus = (itemId: string, newStatus: string) => {
    setItemStatus(prev => ({ ...prev, [itemId]: newStatus }));
  };

  // Function to update item notes
  const updateItemNotes = (itemId: string, notes: string) => {
    setItemNotes(prev => ({ ...prev, [itemId]: notes }));
    setEditingItem(null);
  };

  const complianceCategories = [
    {
      id: 'eligibility',
      title: 'Eligibility & Pre-approval',
      score: 92,
      items: [
        { 
          id: 'corp-form',
          requirement: 'Issuer corporate form: Public Limited Company',
          status: 'PASS',
          evidence: 'Certificate of Incorporation attached',
          notes: 'Verified - Company registered as PLC',
          dataSource: 'Company Identity Section - Legal Structure field'
        },
        { 
          id: 'min-capital',
          requirement: 'Minimum paid-up capital ≥ RWF 500M',
          status: 'PASS',
          evidence: 'Audited financial statements',
          notes: 'Current paid-up capital: RWF 750M',
          dataSource: 'Capitalization Section - Authorized & Issued Capital'
        },
        { 
          id: 'net-assets',
          requirement: 'Net assets ≥ RWF 1B',
          status: 'PASS',
          evidence: 'Balance sheet verification',
          notes: 'Net assets: RWF 1.2B as of latest audit',
          dataSource: 'Uploaded Document: Audited Financial Statements 2023'
        },
        { 
          id: 'audited-financials',
          requirement: 'Audited financials (IFRS) within allowed date window',
          status: 'PASS',
          evidence: '3 years audited statements provided',
          notes: 'FY 2021, 2022, 2023 - all IFRS compliant',
          dataSource: 'Documents Tab - Financial Statements (3 files)'
        },
        { 
          id: 'auditor-opinion',
          requirement: 'Auditor opinion unqualified on going concern',
          status: 'REVIEW',
          evidence: 'Audit reports attached',
          notes: 'Minor qualification on inventory valuation - requires clarification',
          dataSource: 'Uploaded Document: Auditor Opinion Letter 2023'
        },
        { 
          id: 'shareholding-spread',
          requirement: 'Post-offer at least 25% held by ≥1,000 shareholders',
          status: 'PASS',
          evidence: 'Shareholding spread plan submitted',
          notes: 'Plan shows 30% public float with 1,500 target shareholders',
          dataSource: 'Share Ownership Section + Offer Details Section'
        },
        { 
          id: 'director-suitability',
          requirement: 'Directors pass suitability tests (no bankruptcy/criminal disqualifications)',
          status: 'PASS',
          evidence: 'Background checks completed',
          notes: 'All 7 directors cleared - fit and proper declarations received',
          dataSource: 'Governance Section - Board of Directors + Uploaded CVs'
        }
      ]
    },
    {
      id: 'prospectus',
      title: 'Prospectus Content Checks',
      score: 85,
      items: [
        { 
          id: 'front-page',
          requirement: 'Front-page declarations and disclaimers',
          status: 'PASS',
          evidence: 'Prospectus draft reviewed',
          notes: 'All required disclaimers present',
          dataSource: 'Prospectus Section - Front Page'
        },
        { 
          id: 'company-overview',
          requirement: 'Company overview and history',
          status: 'PASS',
          evidence: 'Section 2 of prospectus',
          notes: 'Comprehensive 15-year history provided',
          dataSource: 'Company Identity Section + Prospectus Document'
        },
        { 
          id: 'directors-bios',
          requirement: 'Directors and management bios',
          status: 'PASS',
          evidence: 'Section 3 of prospectus',
          notes: 'Full CVs and experience details included',
          dataSource: 'Governance Section - Board Members + Uploaded CVs'
        },
        { 
          id: 'capital-structure',
          requirement: 'Capital structure and shareholding',
          status: 'PASS',
          evidence: 'Section 4 of prospectus',
          notes: 'Pre and post-offer structure clearly detailed',
          dataSource: 'Capitalization + Share Ownership Sections'
        },
        { 
          id: 'use-of-proceeds',
          requirement: 'Use of proceeds and project timeline',
          status: 'REVIEW',
          evidence: 'Section 5 of prospectus',
          notes: 'Requires more detailed breakdown of capital expenditure',
          dataSource: 'Offer Details Section - Use of Proceeds'
        },
        { 
          id: 'financial-statements',
          requirement: 'Financial statements (IFRS) and audit reports',
          status: 'PASS',
          evidence: 'Appendix A of prospectus',
          notes: '3 years of audited financials included',
          dataSource: 'Uploaded Documents - Financial Statements'
        },
        { 
          id: 'risk-factors',
          requirement: 'Risk factors and material information',
          status: 'PASS',
          evidence: 'Section 6 of prospectus',
          notes: 'Comprehensive risk disclosure - 12 key risks identified',
          dataSource: 'Prospectus Section - Risk Factors'
        },
        { 
          id: 'underwriting-fees',
          requirement: 'Underwriting and advisory fees',
          status: 'PASS',
          evidence: 'Section 7 of prospectus',
          notes: 'IB fees: 3.5% of gross proceeds disclosed',
          dataSource: 'Offer Details Section - Fees & Expenses'
        },
        { 
          id: 'legal-tax',
          requirement: 'Legal and tax disclosures',
          status: 'PASS',
          evidence: 'Section 8 of prospectus',
          notes: 'Tax opinions and legal compliance confirmed',
          dataSource: 'Compliance Section + Uploaded Legal Opinions'
        },
        { 
          id: 'expert-consents',
          requirement: 'Expert consents (auditors, legal counsel, valuers)',
          status: 'PASS',
          evidence: 'Appendix B of prospectus',
          notes: 'All expert consent letters received and verified',
          dataSource: 'Uploaded Documents - Expert Consent Letters'
        }
      ]
    },
    {
      id: 'advertisements',
      title: 'Advertisements & Electronic Forms',
      score: 95,
      items: [
        { 
          id: 'abridged-prospectus',
          requirement: 'Copy of abridged prospectus for newspapers',
          status: 'PASS',
          evidence: 'Document submitted',
          notes: 'Abridged version reviewed and approved',
          dataSource: 'Publication Section + Uploaded Abridged Prospectus'
        },
        { 
          id: 'electronic-form',
          requirement: 'Electronic subscription form submitted 48 hrs prior',
          status: 'PASS',
          evidence: 'Online form reviewed',
          notes: 'Form meets all CMA requirements',
          dataSource: 'Publication Section - Electronic Form'
        }
      ]
    },
    {
      id: 'post-approval',
      title: 'Post-approval Requirements',
      score: 88,
      items: [
        { 
          id: 'lock-up',
          requirement: 'Signed undertaking for lock-up period by controlling shareholders',
          status: 'PENDING',
          evidence: 'Awaiting signatures',
          notes: '12-month lock-up agreement prepared - pending execution',
          dataSource: 'Undertakings Section - Lock-up Agreements'
        },
        { 
          id: 'publication-plan',
          requirement: 'Publication plan for short prospectus in ≥2 national newspapers',
          status: 'PASS',
          evidence: 'Media plan submitted',
          notes: 'Scheduled for New Times and Igihe - dates confirmed',
          dataSource: 'Publication Section - Media Plan'
        }
      ]
    }
  ];

  const overallScore = Math.round(
    complianceCategories.reduce((sum, cat) => sum + cat.score, 0) / complianceCategories.length
  );

  const totalItems = complianceCategories.reduce((sum, cat) => sum + cat.items.length, 0);
  const passedItems = complianceCategories.reduce(
    (sum, cat) => sum + cat.items.filter(item => item.status === 'PASS').length, 
    0
  );
  const reviewItems = complianceCategories.reduce(
    (sum, cat) => sum + cat.items.filter(item => item.status === 'REVIEW').length, 
    0
  );
  const pendingItems = complianceCategories.reduce(
    (sum, cat) => sum + cat.items.filter(item => item.status === 'PENDING').length, 
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span>Detailed Regulatory Compliance Checklist</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{overallScore}%</div>
              <div className="text-xs text-gray-500">Overall Score</div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-700">{passedItems}</div>
            <div className="text-xs text-green-600">Passed</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">{reviewItems}</div>
            <div className="text-xs text-yellow-600">Under Review</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-700">{pendingItems}</div>
            <div className="text-xs text-orange-600">Pending</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-700">{totalItems}</div>
            <div className="text-xs text-blue-600">Total Items</div>
          </div>
        </div>

        {/* Compliance Categories */}
        <div className="space-y-4">
          {complianceCategories.map((category) => (
            <div key={category.id} className="border rounded-lg overflow-hidden">
              {/* Category Header */}
              <div 
                className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => setExpandedSection(expandedSection === category.id ? null : category.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      category.score >= 90 ? 'bg-green-100 text-green-700' :
                      category.score >= 75 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {category.score}%
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{category.title}</h4>
                      <p className="text-sm text-gray-600">
                        {category.items.filter(i => i.status === 'PASS').length} of {category.items.length} items passed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${
                      category.score >= 90 ? 'bg-green-100 text-green-800' :
                      category.score >= 75 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {category.score >= 90 ? 'Excellent' :
                       category.score >= 75 ? 'Good' : 'Needs Work'}
                    </Badge>
                    <svg 
                      className={`w-5 h-5 transition-transform ${expandedSection === category.id ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Category Items */}
              {expandedSection === category.id && (
                <div className="p-4 space-y-3 bg-white">
                  {category.items.map((item) => {
                    const currentStatus = itemStatus[item.id] || item.status;
                    const currentNotes = itemNotes[item.id] || item.notes;
                    
                    return (
                      <div key={item.id} className={`border-l-4 pl-4 py-3 rounded-r ${
                        currentStatus === 'PASS' ? 'border-green-500 bg-green-50' :
                        currentStatus === 'REVIEW' ? 'border-yellow-500 bg-yellow-50' :
                        'border-orange-500 bg-orange-50'
                      }`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {/* Status Selector */}
                              <select
                                value={currentStatus}
                                onChange={(e) => updateItemStatus(item.id, e.target.value)}
                                className="text-xs px-2 py-1 rounded border font-medium"
                              >
                                <option value="PASS">✓ PASS</option>
                                <option value="REVIEW">⚠ REVIEW</option>
                                <option value="PENDING">⏱ PENDING</option>
                                <option value="FAIL">✗ FAIL</option>
                              </select>
                              <span className="font-medium text-gray-900 text-sm">{item.requirement}</span>
                            </div>
                            
                            {/* Data Source */}
                            <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded mb-2 inline-block">
                              <strong>📊 Data Source:</strong> {item.dataSource}
                            </div>
                            
                            <div className="text-xs text-gray-600 space-y-1">
                              <div><strong>Evidence:</strong> {item.evidence}</div>
                              
                              {/* Editable Notes */}
                              {editingItem === item.id ? (
                                <div className="mt-2">
                                  <Textarea
                                    value={currentNotes}
                                    onChange={(e) => setItemNotes(prev => ({ ...prev, [item.id]: e.target.value }))}
                                    className="text-xs mb-2"
                                    rows={2}
                                    placeholder="Add your assessment notes..."
                                  />
                                  <div className="flex space-x-2">
                                    <Button 
                                      size="sm" 
                                      onClick={() => updateItemNotes(item.id, currentNotes)}
                                      className="h-6 text-xs"
                                    >
                                      Save
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => setEditingItem(null)}
                                      className="h-6 text-xs"
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-start justify-between">
                                  <div><strong>Notes:</strong> {currentNotes}</div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingItem(item.id)}
                                    className="h-6 text-xs ml-2"
                                  >
                                    Edit
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          {currentStatus === 'PASS' && (
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 ml-2" />
                          )}
                          {currentStatus === 'REVIEW' && (
                            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 ml-2" />
                          )}
                          {currentStatus === 'PENDING' && (
                            <Clock className="h-5 w-5 text-orange-600 flex-shrink-0 ml-2" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Final Assessment */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border-2 border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-3">Final Authority Assessment</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <strong>Overall Compliance:</strong> {overallScore}% - Application meets CMA Rwanda listing requirements
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <strong>Items Requiring Attention:</strong> {reviewItems + pendingItems} items need clarification or completion
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <strong>Recommendation:</strong> {overallScore >= 85 ? 'APPROVE with minor conditions' : 'QUERY for additional information'}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-xs text-gray-600">
              <strong>Authority Actions:</strong> Upon approval, CMA will issue approval letter and require copy to Registrar General for registration. 
              Issuer must comply with all post-approval requirements including lock-up undertakings and publication requirements.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}