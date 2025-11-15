'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SimpleProtectedRoute } from '@/lib/auth/simple-protected-route';
import { useSimpleAuth } from '@/lib/auth/simple-auth-context';
import { FeedbackCommunication } from '@/components/feedback/feedback-communication';

import { ArrowLeft, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Application {
  id: string;
  company_id: string;
  application_number: string | null;
  status: string;
  company?: {
    legal_name: string;
  };
}

function IssuerFeedbackPageContent() {
  const { profile } = useSimpleAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApplications = () => {
      if (!profile?.company_id) return;

      try {
        setLoading(true);
        
        // Check if there's feedback for this company
        const issuerFeedbackKey = `issuer_feedback_${profile.company_id}`;
        const feedbackData = localStorage.getItem(issuerFeedbackKey);
        
        // Load from localStorage - check for transferred applications
        const ibTransfersKey = `ib_transfers_issuer_${profile.company_id}`;
        const transfersData = localStorage.getItem(ibTransfersKey);
        
        if (transfersData) {
          const transfers = JSON.parse(transfersData);
          const apps = transfers.map((transfer: any, index: number) => ({
            id: transfer.transferKey || `app-${index}`,
            company_id: profile.company_id,
            application_number: `CMA-2024-${String(index + 1).padStart(3, '0')}`,
            status: 'IB_REVIEW',
            company: {
              legal_name: transfer.companyName || 'Your Company'
            }
          }));
          
          setApplications(apps);
          
          if (apps.length > 0) {
            setSelectedApplication(apps[0]);
          }
        } else {
          // Create a default application for demo
          const defaultApp = {
            id: `app-${profile.company_id}`,
            company_id: profile.company_id,
            application_number: 'CMA-2024-001',
            status: 'IB_REVIEW',
            company: {
              legal_name: 'Your Company'
            }
          };
          
          setApplications([defaultApp]);
          setSelectedApplication(defaultApp);
        }

        // Show notification if there's feedback
        if (feedbackData) {
          const feedback = JSON.parse(feedbackData);
          const pendingCount = feedback.filter((f: any) => f.status === 'PENDING').length;
          if (pendingCount > 0) {
            console.log(`You have ${pendingCount} pending feedback items from your IB Advisor`);
          }
        }

        // Debug: Log all localStorage keys related to feedback
        console.log('=== Feedback Debug Info ===');
        console.log('Company ID:', profile.company_id);
        console.log('Issuer Feedback Key:', issuerFeedbackKey);
        console.log('Has Feedback Data:', !!feedbackData);
        if (feedbackData) {
          const feedback = JSON.parse(feedbackData);
          console.log('Feedback Count:', feedback.length);
          console.log('Feedback Items:', feedback);
        }
        
        // Log all feedback-related keys in localStorage
        const allKeys = Object.keys(localStorage);
        const feedbackKeys = allKeys.filter(key => 
          key.includes('feedback') || key.includes('ib_transfers')
        );
        console.log('All Feedback Keys in localStorage:', feedbackKeys);
        feedbackKeys.forEach(key => {
          try {
            const data = localStorage.getItem(key);
            if (data) {
              const parsed = JSON.parse(data);
              console.log(`${key}:`, Array.isArray(parsed) ? `${parsed.length} items` : 'object', parsed);
            }
          } catch (e) {
            console.log(`${key}: (parse error)`);
          }
        });
        console.log('=========================');
      } catch (error) {
        console.error('Error loading applications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, [profile]);

  return (
    <SimpleProtectedRoute allowedRoles={['ISSUER']}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Link href="/capitallab/collaborative/issuer">
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Dashboard
                    </Button>
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link href="/capitallab/collaborative">
                    <Button variant="ghost" size="sm">
                      Back to Hub
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">IB Advisor Feedback</h1>
                    <p className="text-sm text-gray-600">Review and respond to feedback from your IB Advisor</p>
                  </div>
                </div>
              </div>

              {profile && (
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Issuer
                  </Badge>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{profile.full_name}</p>
                    <p className="text-xs text-gray-500">{profile.company_role}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">Loading applications...</p>
              </CardContent>
            </Card>
          ) : applications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
                <p className="text-gray-600">You don't have any applications yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Application Selector */}
              {applications.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Select Application</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {applications.map((app) => (
                        <Button
                          key={app.id}
                          variant={selectedApplication?.id === app.id ? 'default' : 'outline'}
                          onClick={() => setSelectedApplication(app)}
                          className="h-auto p-4 justify-start"
                        >
                          <div className="text-left">
                            <div className="font-medium">{app.company?.legal_name}</div>
                            <div className="text-xs opacity-70">{app.application_number}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Info Banner */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-blue-900 mb-2 text-lg">
                        📋 How to Respond to IB Advisor Feedback
                      </h3>
                      <div className="text-sm text-blue-800 space-y-2">
                        <p className="flex items-start">
                          <span className="font-semibold mr-2">1.</span>
                          <span>Review each feedback item carefully - your IB Advisor has identified areas that need attention</span>
                        </p>
                        <p className="flex items-start">
                          <span className="font-semibold mr-2">2.</span>
                          <span>Click "Start Working" when you begin addressing an item</span>
                        </p>
                        <p className="flex items-start">
                          <span className="font-semibold mr-2">3.</span>
                          <span>Add your response explaining what actions you've taken</span>
                        </p>
                        <p className="flex items-start">
                          <span className="font-semibold mr-2">4.</span>
                          <span>Use "Show Discussion" to ask questions or provide updates</span>
                        </p>
                        <p className="flex items-start">
                          <span className="font-semibold mr-2">5.</span>
                          <span>Mark as "Resolved" once you've completed the requested changes</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Feedback Communication */}
              {selectedApplication && (
                <FeedbackCommunication 
                  applicationId={selectedApplication.id} 
                  isIBAdvisor={false} 
                />
              )}

              {/* Quick Actions */}
              <Card className="border-2 border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        <MessageSquare className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Need Help or Clarification?</h3>
                        <p className="text-sm text-gray-600">
                          Use the discussion feature on each feedback item to communicate with your IB Advisor
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Link href="/capitallab/collaborative/issuer">
                        <Button variant="outline" size="lg">
                          Back to Application
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </SimpleProtectedRoute>
  );
}

export default function IssuerFeedbackPage() {
  return <IssuerFeedbackPageContent />;
}
