'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RoleSelector } from '@/components/mock-data/role-selector';
import { MockAuthProvider, useMockAuth } from '@/lib/mock-data/mock-auth-context';
import { MockApplicationService } from '@/lib/mock-data/mock-application-service';
import { USE_MOCK_DATA, MOCK_APPLICATIONS } from '@/lib/mock-data/mock-toggle';
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
  Filter
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
  const { profile } = useMockAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewComment, setReviewComment] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const mockApplicationService = new MockApplicationService();

  // Load applications for review
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        const { data } = await mockApplicationService.getAllApplications();
        
        // Filter applications that need CMA review
        const cmaApplications = (data || []).filter((app: any) => 
          ['IB_APPROVED', 'UNDER_REVIEW', 'QUERY_ISSUED', 'APPROVED', 'REJECTED'].includes(app.status)
        );
        setApplications(cmaApplications);
      } catch (error) {
        console.error('Error loading applications:', error);
      } finally {
        setLoading(false);
      }
    };

    if (profile) {
      loadApplications();
    }
  }, [profile]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IB_APPROVED':
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
      case 'IB_APPROVED':
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
      setApplications(prev => 
        prev.map(app => 
          app.id === selectedApplication.id 
            ? { ...app, status: 'APPROVED' }
            : app
        )
      );
      
      setReviewComment('');
      alert('Mock: Application approved successfully!');
    } catch (error) {
      console.error('Error approving application:', error);
    }
  };

  const handleReject = async () => {
    if (!selectedApplication || !reviewComment.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    
    try {
      setApplications(prev => 
        prev.map(app => 
          app.id === selectedApplication.id 
            ? { ...app, status: 'REJECTED' }
            : app
        )
      );
      
      setReviewComment('');
      alert('Mock: Application rejected');
    } catch (error) {
      console.error('Error rejecting application:', error);
    }
  };

  const handleQuery = async () => {
    if (!selectedApplication || !reviewComment.trim()) {
      alert('Please provide query details');
      return;
    }
    
    try {
      setApplications(prev => 
        prev.map(app => 
          app.id === selectedApplication.id 
            ? { ...app, status: 'QUERY_ISSUED' }
            : app
        )
      );
      
      setReviewComment('');
      alert('Mock: Query issued to issuer');
    } catch (error) {
      console.error('Error issuing query:', error);
    }
  };

  const filteredApplications = applications.filter(app => 
    filterStatus === 'all' || app.status === filterStatus
  );

  // Skip auth check in mock mode
  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <RoleSelector />
        </div>
      </div>
    );
  }

  return (
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
                Mock Mode
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <RoleSelector />

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
                
                <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                  🏛️ Capital Markets Authority - Rwanda | Mock Regulatory Review
                </div>

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
                ) : filteredApplications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No applications found</div>
                ) : (
                  <div className="space-y-3 p-4">
                    {filteredApplications.map((application) => {
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
              <>
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

                <Card>
                  <CardHeader>
                    <CardTitle>Mock Documents & Compliance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>Mock compliance checklist and documents would be displayed here</p>
                      <p className="text-sm mt-2">In real mode, this would show detailed regulatory review items</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-red-600" />
                      <span>CMA Regulatory Decision</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Common Review Items</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {[
                          'Financial projections require additional validation',
                          'Board composition needs independent director confirmation',
                          'Use of proceeds requires more detailed breakdown',
                          'Auditor opinion letter needs clarification',
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
                        placeholder="Enter detailed regulatory review comments..."
                        rows={4}
                      />
                    </div>

                    <div className="flex space-x-4">
                      <Button
                        onClick={handleApprove}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Application
                      </Button>
                      <Button
                        onClick={handleQuery}
                        variant="outline"
                        className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Issue Query
                      </Button>
                      <Button
                        onClick={handleReject}
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Application
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12 text-gray-500">
                  <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Select an Application</h3>
                  <p>Choose an application from the queue to begin regulatory review</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CMARegulatorMockPage() {
  return (
    <MockAuthProvider>
      <CMARegulatorPageContent />
    </MockAuthProvider>
  );
}