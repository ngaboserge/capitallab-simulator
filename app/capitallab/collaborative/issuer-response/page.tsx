'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/lib/supabase/auth-context';
import { ApplicationService } from '@/lib/supabase/applications';
import { DocumentListViewer } from '@/components/cma-issuer/form-components/document-viewer';
import { SupabaseFileUpload } from '@/components/cma-issuer/form-components/supabase-file-upload';
import { useDocuments } from '@/lib/supabase/use-documents';
import { 
  Building2, 
  ArrowLeft, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Clock,
  MessageSquare,
  Upload,
  TrendingUp,
  Calendar,
  Target,
  BarChart3,
  PieChart,
  Activity
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
  queries?: Query[];
}

interface Query {
  id: string;
  query_text: string;
  query_date: string;
  response_text?: string;
  response_date?: string;
  status: 'PENDING' | 'RESPONDED' | 'RESOLVED';
}

export default function IssuerResponsePortal() {
  const { profile } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'queries' | 'documents' | 'analytics'>('overview');

  const applicationService = new ApplicationService();

  // Load issuer applications
  useEffect(() => {
    const loadApplications = async () => {
      // Demo data for issuer portal
      const mockApplications: Application[] = [
        {
          id: 'demo-1',
          company_id: 'demo-company-1',
          application_number: 'CMA-2024-001',
          status: 'QUERY_ISSUED',
          submission_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          target_amount: 500000000,
          completion_percentage: 85,
          company: {
            legal_name: 'Rwanda Tech Solutions Ltd',
            trading_name: 'RTS'
          },
          queries: [
            {
              id: 'q1',
              query_text: 'Financial projections require additional validation. Please provide detailed cash flow projections for the next 5 years with supporting assumptions.',
              query_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'PENDING'
            },
            {
              id: 'q2',
              query_text: 'Board composition needs independent director confirmation. Please provide CVs and declarations of independence for all proposed independent directors.',
              query_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'PENDING'
            }
          ]
        },
        {
          id: 'demo-2',
          company_id: 'demo-company-2',
          application_number: 'CMA-2024-002',
          status: 'UNDER_REVIEW',
          submission_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          target_amount: 750000000,
          completion_percentage: 92,
          company: {
            legal_name: 'Green Energy Rwanda PLC',
            trading_name: 'GER'
          },
          queries: []
        }
      ];
      
      setApplications(mockApplications);
      setSelectedApplication(mockApplications[0]);
      setLoading(false);
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
        return <Activity className="h-4 w-4" />;
      case 'QUERY_ISSUED':
        return <MessageSquare className="h-4 w-4" />;
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleQueryResponse = async () => {
    if (!selectedQuery || !responseText.trim()) {
      alert('Please provide a response to the query');
      return;
    }

    // Demo mode - update local state
    if (selectedApplication) {
      const updatedQueries = selectedApplication.queries?.map(q => 
        q.id === selectedQuery.id 
          ? { ...q, response_text: responseText, response_date: new Date().toISOString(), status: 'RESPONDED' as const }
          : q
      ) || [];

      const updatedApplication = { ...selectedApplication, queries: updatedQueries };
      setSelectedApplication(updatedApplication);
      
      setApplications(prev => 
        prev.map(app => 
          app.id === selectedApplication.id ? updatedApplication : app
        )
      );
    }

    setResponseText('');
    setSelectedQuery(null);
    alert('Demo: Response submitted successfully! In real mode, this would notify the CMA regulator.');
  };

  const calculateDaysInReview = (submissionDate: string) => {
    return Math.floor((Date.now() - new Date(submissionDate).getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <ProtectedRoute allowedRoles={['ISSUER', 'COMPANY_ADMIN']} allowDemo={true}>
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
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Issuer Response Portal</h1>
                    <p className="text-sm text-gray-600">CMA Application Management & Query Response</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Building2 className="h-3 w-3 mr-1" />
                  Issuer
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Application Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Active Applications</p>
                    <p className="text-2xl font-bold text-blue-900">{applications.length}</p>
                    <p className="text-xs text-blue-500">In Progress</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Pending Queries</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {applications.reduce((acc, app) => acc + (app.queries?.filter(q => q.status === 'PENDING').length || 0), 0)}
                    </p>
                    <p className="text-xs text-orange-500">Require Response</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Target Capital</p>
                    <p className="text-2xl font-bold text-green-900">
                      RWF {(applications.reduce((acc, app) => acc + app.target_amount, 0) / 1000000).toFixed(0)}M
                    </p>
                    <p className="text-xs text-green-500">Total Raising</p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Avg Review Time</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {applications.length > 0 ? Math.round(applications.reduce((acc, app) => acc + calculateDaysInReview(app.submission_date), 0) / applications.length) : 0}
                    </p>
                    <p className="text-xs text-purple-500">Days</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-600" />
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
                    <span>My Applications</span>
                    <Badge variant="outline">{applications.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="p-4 text-center text-gray-500">Loading applications...</div>
                  ) : applications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No applications found</div>
                  ) : (
                    <div className="space-y-3 p-4">
                      {applications.map((application) => {
                        const daysInReview = calculateDaysInReview(application.submission_date);
                        const pendingQueries = application.queries?.filter(q => q.status === 'PENDING').length || 0;
                        
                        return (
                          <div
                            key={application.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                              selectedApplication?.id === application.id
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedApplication(application)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-medium text-sm text-gray-900 mb-1">
                                  {application.company?.legal_name || 'Unknown Company'}
                                </h3>
                                <p className="text-xs text-gray-500">
                                  {application.application_number}
                                </p>
                              </div>
                              <Badge className={getStatusColor(application.status)}>
                                {getStatusIcon(application.status)}
                                <span className="ml-1 text-xs">{application.status.replace('_', ' ')}</span>
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div className="text-xs">
                                <span className="text-gray-500">Target Amount:</span>
                                <p className="font-medium">RWF {(application.target_amount / 1000000).toFixed(0)}M</p>
                              </div>
                              <div className="text-xs">
                                <span className="text-gray-500">Days in Review:</span>
                                <p className="font-medium">{daysInReview} days</p>
                              </div>
                            </div>

                            {pendingQueries > 0 && (
                              <div className="bg-orange-50 border border-orange-200 rounded p-2 mb-2">
                                <div className="flex items-center space-x-2">
                                  <MessageSquare className="h-4 w-4 text-orange-600" />
                                  <span className="text-xs font-medium text-orange-700">
                                    {pendingQueries} Pending {pendingQueries === 1 ? 'Query' : 'Queries'}
                                  </span>
                                </div>
                              </div>
                            )}

                            <div className="text-xs text-gray-400">
                              Submitted {new Date(application.submission_date).toLocaleDateString()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Panel */}
            <div className="lg:col-span-2 space-y-6">
              {selectedApplication ? (
                <>
                  {/* Application Header */}
                  <Card className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Building2 className="h-6 w-6 text-blue-600" />
                          <div>
                            <span className="text-lg">{selectedApplication.company?.legal_name}</span>
                            <p className="text-sm text-gray-600 font-normal">
                              {selectedApplication.application_number}
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
                          <label className="text-xs font-medium text-gray-600">Target Amount</label>
                          <p className="text-sm font-semibold">
                            RWF {selectedApplication.target_amount?.toLocaleString() || 'TBD'}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <label className="text-xs font-medium text-gray-600">Submission Date</label>
                          <p className="text-sm font-semibold">
                            {new Date(selectedApplication.submission_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <label className="text-xs font-medium text-gray-600">Days in Review</label>
                          <p className="text-sm font-semibold">
                            {calculateDaysInReview(selectedApplication.submission_date)} days
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <label className="text-xs font-medium text-gray-600">SLA Remaining</label>
                          <p className="text-sm font-semibold text-orange-600">
                            {Math.max(0, 60 - calculateDaysInReview(selectedApplication.submission_date))} days
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tab Navigation */}
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                        {[
                          { id: 'overview', label: 'Overview', icon: TrendingUp },
                          { id: 'queries', label: 'Queries', icon: MessageSquare },
                          { id: 'documents', label: 'Documents', icon: FileText },
                          { id: 'analytics', label: 'Analytics', icon: BarChart3 }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                              activeTab === tab.id
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            <tab.icon className="h-4 w-4" />
                            <span>{tab.label}</span>
                            {tab.id === 'queries' && (selectedApplication.queries?.filter(q => q.status === 'PENDING').length || 0) > 0 && (
                              <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                                {selectedApplication.queries?.filter(q => q.status === 'PENDING').length || 0}
                              </Badge>
                            )}
                          </button>
                        ))}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {activeTab === 'overview' && (
                        <ApplicationOverview application={selectedApplication} />
                      )}
                      {activeTab === 'queries' && (
                        <QueryManagement 
                          application={selectedApplication}
                          selectedQuery={selectedQuery}
                          setSelectedQuery={setSelectedQuery}
                          responseText={responseText}
                          setResponseText={setResponseText}
                          onSubmitResponse={handleQueryResponse}
                        />
                      )}
                      {activeTab === 'documents' && (
                        <DocumentManagement applicationId={selectedApplication.id} />
                      )}
                      {activeTab === 'analytics' && (
                        <ApplicationAnalytics application={selectedApplication} />
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Application</h3>
                    <p className="text-gray-600">
                      Choose an application from the list to view details and respond to queries
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
// Application Overview Component
function ApplicationOverview({ application }: { application: Application }) {
  const daysInReview = Math.floor((Date.now() - new Date(application.submission_date).getTime()) / (1000 * 60 * 60 * 24));
  const completionPercentage = application.completion_percentage || 0;
  
  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-3">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray={`${completionPercentage}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-blue-600">{completionPercentage}%</span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-700">Completion</p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">{daysInReview}</p>
            <p className="text-sm font-medium text-gray-700">Days in Review</p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-lg font-bold text-green-600">RWF {(application.target_amount / 1000000).toFixed(0)}M</p>
            <p className="text-sm font-medium text-gray-700">Target Capital</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Timeline</h3>
        <div className="space-y-4">
          {[
            { date: application.submission_date, event: 'Application Submitted', status: 'completed', icon: FileText },
            { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), event: 'Initial Review Started', status: 'completed', icon: Activity },
            { date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), event: 'Queries Issued', status: application.status === 'QUERY_ISSUED' ? 'current' : 'pending', icon: MessageSquare },
            { date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), event: 'Final Decision Expected', status: 'pending', icon: CheckCircle }
          ].map((item, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className={`p-2 rounded-full ${
                item.status === 'completed' ? 'bg-green-100 text-green-600' :
                item.status === 'current' ? 'bg-blue-100 text-blue-600' :
                'bg-gray-100 text-gray-400'
              }`}>
                <item.icon className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className={`font-medium ${
                  item.status === 'completed' ? 'text-green-700' :
                  item.status === 'current' ? 'text-blue-700' :
                  'text-gray-500'
                }`}>
                  {item.event}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(item.date).toLocaleDateString()}
                </p>
              </div>
              {item.status === 'current' && (
                <Badge className="bg-blue-100 text-blue-800">Current</Badge>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <h4 className="font-medium text-orange-800 mb-2">Next Steps Required</h4>
        <ul className="space-y-1 text-sm text-orange-700">
          {application.queries?.filter(q => q.status === 'PENDING').map((query, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="text-orange-500 mt-1">•</span>
              <span>Respond to CMA query regarding {query.query_text.substring(0, 50)}...</span>
            </li>
          ))}
          {(!application.queries || application.queries.filter(q => q.status === 'PENDING').length === 0) && (
            <li className="flex items-start space-x-2">
              <span className="text-orange-500 mt-1">•</span>
              <span>Await CMA review completion</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

// Query Management Component
function QueryManagement({ 
  application, 
  selectedQuery, 
  setSelectedQuery, 
  responseText, 
  setResponseText, 
  onSubmitResponse 
}: {
  application: Application;
  selectedQuery: Query | null;
  setSelectedQuery: (query: Query | null) => void;
  responseText: string;
  setResponseText: (text: string) => void;
  onSubmitResponse: () => void;
}) {
  const queries = application.queries || [];
  const pendingQueries = queries.filter(q => q.status === 'PENDING');
  const respondedQueries = queries.filter(q => q.status === 'RESPONDED');

  return (
    <div className="space-y-6">
      {/* Query Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Pending Queries</p>
              <p className="text-2xl font-bold text-orange-900">{pendingQueries.length}</p>
            </div>
            <MessageSquare className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Responded</p>
              <p className="text-2xl font-bold text-green-900">{respondedQueries.length}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Queries</p>
              <p className="text-2xl font-bold text-blue-900">{queries.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Pending Queries */}
      {pendingQueries.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Queries - Action Required</h3>
          <div className="space-y-4">
            {pendingQueries.map((query) => (
              <div key={query.id} className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-orange-100 text-orange-800">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Pending Response
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Issued {new Date(query.query_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-800 leading-relaxed">{query.query_text}</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button
                    onClick={() => setSelectedQuery(query)}
                    variant="outline"
                    className="border-orange-500 text-orange-600 hover:bg-orange-100"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Respond to Query
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Response Form */}
      {selectedQuery && (
        <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Respond to CMA Query</h3>
          
          <div className="bg-white p-4 rounded border mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Query Details:</h4>
            <p className="text-gray-700 text-sm leading-relaxed">{selectedQuery.query_text}</p>
            <p className="text-xs text-gray-500 mt-2">
              Issued on {new Date(selectedQuery.query_date).toLocaleDateString()}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Your Response to CMA
              </label>
              <Textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Provide a detailed response to the CMA query. Include all requested information, supporting documentation references, and any clarifications..."
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                This response will be submitted to the CMA regulator for review
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Button
                onClick={onSubmitResponse}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={!responseText.trim()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Submit Response
              </Button>
              
              <Button
                onClick={() => {
                  setSelectedQuery(null);
                  setResponseText('');
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Responded Queries */}
      {respondedQueries.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Responses</h3>
          <div className="space-y-4">
            {respondedQueries.map((query) => (
              <div key={query.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Responded
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Responded {query.response_date ? new Date(query.response_date).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                    <p className="text-gray-800 text-sm mb-3"><strong>Query:</strong> {query.query_text}</p>
                    {query.response_text && (
                      <div className="bg-white p-3 rounded border">
                        <p className="text-sm text-gray-700"><strong>Your Response:</strong></p>
                        <p className="text-sm text-gray-600 mt-1">{query.response_text}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {queries.length === 0 && (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Queries Yet</h3>
          <p className="text-gray-600">
            The CMA regulator hasn't issued any queries for this application yet.
          </p>
        </div>
      )}
    </div>
  );
}

// Document Management Component
function DocumentManagement({ applicationId }: { applicationId: string }) {
  const { documents, loading, error } = useDocuments({
    applicationId,
    autoLoad: true
  });

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Upload Additional Documents</h3>
        <p className="text-sm text-blue-700 mb-4">
          Upload any additional documents requested by the CMA or supporting materials for your responses.
        </p>
        
        <SupabaseFileUpload
          label="Upload Additional Documents"
          applicationId={applicationId}
          category="additional"
          acceptedTypes={[".pdf", ".doc", ".docx", ".xls", ".xlsx"]}
          maxFileSize={10} // 10MB
          multiple={true}
          onChange={(documents) => {
            console.log('Documents uploaded:', documents);
            // Refresh documents list
          }}
        />
      </div>

      {/* Documents List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Documents</h3>
        
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading documents...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">Error loading documents: {error}</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Documents</h4>
            <p className="text-gray-600">No documents have been uploaded for this application yet.</p>
          </div>
        ) : (
          <DocumentListViewer
            documents={documents}
            title=""
            emptyMessage="No documents found"
          />
        )}
      </div>

      {/* Document Requirements */}
      <div className="bg-gray-50 border rounded-lg p-6">
        <h4 className="font-medium text-gray-900 mb-3">Required Documents Checklist</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Certificate of Incorporation', required: true, uploaded: true },
            { name: 'Memorandum & Articles of Association', required: true, uploaded: true },
            { name: 'Audited Financial Statements (3 years)', required: true, uploaded: true },
            { name: 'Board Resolutions', required: true, uploaded: false },
            { name: 'Prospectus Draft', required: true, uploaded: true },
            { name: 'Use of Proceeds Details', required: true, uploaded: false },
            { name: 'Independent Director CVs', required: true, uploaded: false },
            { name: 'Fit & Proper Declarations', required: true, uploaded: true }
          ].map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
              <span className="text-sm text-gray-700">{doc.name}</span>
              <div className="flex items-center space-x-2">
                {doc.required && (
                  <Badge variant="outline" className="text-xs border-red-300 text-red-700">
                    Required
                  </Badge>
                )}
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    doc.uploaded 
                      ? 'border-green-300 text-green-700' 
                      : 'border-gray-300 text-gray-500'
                  }`}
                >
                  {doc.uploaded ? '✓ Uploaded' : 'Pending'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Application Analytics Component
function ApplicationAnalytics({ application }: { application: Application }) {
  const daysInReview = Math.floor((Date.now() - new Date(application.submission_date).getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Review Progress</p>
              <p className="text-2xl font-bold text-blue-900">{Math.min(95, daysInReview * 2)}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Compliance Score</p>
              <p className="text-2xl font-bold text-green-900">89%</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Query Response Time</p>
              <p className="text-2xl font-bold text-orange-900">2.5</p>
              <p className="text-xs text-orange-500">Days Avg</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Document Score</p>
              <p className="text-2xl font-bold text-purple-900">85%</p>
            </div>
            <FileText className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Review Timeline Chart */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Timeline</h3>
        <div className="space-y-4">
          {/* Timeline visualization */}
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            {[
              { week: 'Week 1', activity: 'Initial Submission', progress: 100, color: 'green' },
              { week: 'Week 2', activity: 'Document Review', progress: 100, color: 'green' },
              { week: 'Week 3', activity: 'Compliance Assessment', progress: 80, color: 'blue' },
              { week: 'Week 4', activity: 'Query Resolution', progress: 60, color: 'orange' },
              { week: 'Week 5', activity: 'Final Review', progress: 20, color: 'gray' }
            ].map((item, index) => (
              <div key={index} className="relative flex items-center space-x-4 pb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                  item.color === 'green' ? 'bg-green-500' :
                  item.color === 'blue' ? 'bg-blue-500' :
                  item.color === 'orange' ? 'bg-orange-500' :
                  'bg-gray-300'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-900">{item.week}</span>
                    <span className="text-sm text-gray-500">{item.progress}%</span>
                  </div>
                  <p className="text-sm text-gray-600">{item.activity}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${
                        item.color === 'green' ? 'bg-green-500' :
                        item.color === 'blue' ? 'bg-blue-500' :
                        item.color === 'orange' ? 'bg-orange-500' :
                        'bg-gray-300'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compliance Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Breakdown</h3>
          <div className="space-y-4">
            {[
              { category: 'Financial Requirements', score: 92, color: 'green' },
              { category: 'Legal Documentation', score: 88, color: 'green' },
              { category: 'Governance Structure', score: 85, color: 'yellow' },
              { category: 'Disclosure Requirements', score: 90, color: 'green' }
            ].map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.category}</span>
                  <span className={`text-sm font-bold ${
                    item.color === 'green' ? 'text-green-600' :
                    item.color === 'yellow' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {item.score}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      item.color === 'green' ? 'bg-green-500' :
                      item.color === 'yellow' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Average Response Time</span>
              <span className="font-semibold text-gray-900">2.5 days</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Document Completeness</span>
              <span className="font-semibold text-gray-900">85%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Query Resolution Rate</span>
              <span className="font-semibold text-gray-900">95%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">SLA Compliance</span>
              <span className="font-semibold text-green-600">On Track</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Recommendations for Faster Approval</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-blue-800">Priority Actions:</h4>
            <ul className="space-y-1 text-sm text-blue-700">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Submit outstanding board resolutions</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Provide independent director CVs</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Clarify use of proceeds breakdown</span>
              </li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-blue-800">Process Optimization:</h4>
            <ul className="space-y-1 text-sm text-blue-700">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Respond to queries within 48 hours</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Ensure all documents are properly signed</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Schedule pre-submission meetings</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}