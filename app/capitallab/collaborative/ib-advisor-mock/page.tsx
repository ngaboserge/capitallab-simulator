'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoleSelector } from '@/components/mock-data/role-selector';
import { MockAuthProvider, useMockAuth } from '@/lib/mock-data/mock-auth-context';
import { MockApplicationService } from '@/lib/mock-data/mock-application-service';
import { useMockDocuments } from '@/lib/mock-data/mock-use-documents';
import { USE_MOCK_DATA, MOCK_APPLICATIONS } from '@/lib/mock-data/mock-toggle';
import { 
  Briefcase, 
  ArrowLeft, 
  FileText, 
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  DollarSign,
  Send,
  Eye,
  Edit,
  Calculator,
  MessageSquare
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
  assigned_ib_advisor: string | null;
  company?: {
    legal_name: string;
    trading_name?: string;
  };
}

function IBAdvisorPageContent() {
  const { profile } = useMockAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('applications');
  const [ibComments, setIbComments] = useState('');

  const mockApplicationService = new MockApplicationService();

  // Load applications for IB review
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        const { data } = await mockApplicationService.getAllApplications();
        
        // Filter applications that need IB Advisor review
        const ibApplications = (data || []).filter((app: any) => 
          ['SUBMITTED', 'IB_REVIEW', 'IB_APPROVED'].includes(app.status) || 
          app.assigned_ib_advisor === profile?.id
        );
        setApplications(ibApplications);
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
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800';
      case 'IB_REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'IB_APPROVED':
        return 'bg-green-100 text-green-800';
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
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleTakeApplication = async (application: Application) => {
    try {
      setApplications(prev =>
        prev.map(app =>
          app.id === application.id
            ? { ...app, status: 'IB_REVIEW', assigned_ib_advisor: profile?.id || 'mock-ib' }
            : app
        )
      );
      
      setSelectedApplication({ ...application, status: 'IB_REVIEW' });
      setActiveTab('documents');
    } catch (error) {
      console.error('Error taking application:', error);
    }
  };

  const handleSubmitToCMA = async () => {
    if (!selectedApplication) return;
    
    try {
      setApplications(prev =>
        prev.map(app =>
          app.id === selectedApplication.id
            ? { ...app, status: 'IB_APPROVED' }
            : app
        )
      );
      
      setIbComments('');
      alert('Mock: Application successfully submitted to CMA for regulatory review!');
      setActiveTab('applications');
    } catch (error) {
      console.error('Error submitting to CMA:', error);
    }
  };

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
                Mock Mode
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <RoleSelector />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
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
                  <h3 className="font-semibold text-green-900">Completed</h3>
                  <p className="text-2xl font-bold text-green-700">
                    {applications.filter(a => a.status === 'IB_APPROVED').length}
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
                            <p>Target Amount: RWF {application.target_amount?.toLocaleString()}</p>
                            <p>Completion: {application.completion_percentage}%</p>
                            <p>Submitted: {new Date(application.submission_date).toLocaleDateString()}</p>
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
                          {(application.status === 'IB_REVIEW' || application.status === 'IB_APPROVED') && (
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

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            {selectedApplication ? (
              <Card>
                <CardHeader>
                  <CardTitle>Application Documents - {selectedApplication.company?.legal_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>Mock documents would be displayed here</p>
                    <p className="text-sm mt-2">In real mode, this would show uploaded documents for review</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8 text-gray-500">
                  Select an application to view documents
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Deal Structure Tab */}
          <TabsContent value="structure" className="space-y-6">
            {selectedApplication ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calculator className="h-5 w-5" />
                    <span>Deal Structure - {selectedApplication.company?.legal_name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Issuer's Proposal</h4>
                      <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                        <p><strong>Target Amount:</strong> RWF {selectedApplication.target_amount?.toLocaleString()}</p>
                        <p><strong>Estimated Shares:</strong> 1,000,000</p>
                        <p><strong>Indicative Price:</strong> RWF {selectedApplication.target_amount ? Math.round(selectedApplication.target_amount / 1000000) : 500}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">IB Recommendations</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">Recommended Price (RWF)</label>
                          <Input type="number" placeholder="Based on valuation" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Recommended Shares</label>
                          <Input type="number" placeholder="Optimized for liquidity" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Public Float (%)</label>
                          <Input type="number" placeholder="Min 25%" defaultValue="25" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8 text-gray-500">
                  Select an application to structure the deal
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Submit to CMA Tab */}
          <TabsContent value="submit" className="space-y-6">
            {selectedApplication ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Send className="h-5 w-5" />
                    <span>Submit to CMA - {selectedApplication.company?.legal_name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">IB Advisor Final Comments</label>
                    <Textarea
                      value={ibComments}
                      onChange={(e) => setIbComments(e.target.value)}
                      placeholder="Provide final review comments and recommendations for CMA..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button
                      onClick={handleSubmitToCMA}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Submit to CMA
                    </Button>
                    <Button variant="outline">
                      Save Draft
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8 text-gray-500">
                  Select an application to submit to CMA
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function IBAdvisorMockPage() {
  return (
    <MockAuthProvider>
      <IBAdvisorPageContent />
    </MockAuthProvider>
  );
}