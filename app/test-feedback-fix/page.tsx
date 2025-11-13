'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSimpleAuth } from '@/lib/auth/simple-auth-context';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function TestFeedbackFixPage() {
  const { profile } = useSimpleAuth();
  const [created, setCreated] = useState(false);

  const createFeedbackForMyCompany = () => {
    if (!profile?.company_id) {
      alert('Please login as an issuer first!');
      return;
    }

    const companyId = profile.company_id;
    const appId = `app-${companyId}`;
    
    const feedback = {
      id: `feedback-${Date.now()}`,
      application_id: appId,
      category: 'Financial Documents',
      issue: 'Please provide audited financial statements for the last 3 years. This is critical for the IPO process.',
      priority: 'HIGH',
      status: 'PENDING',
      created_by: 'ib-advisor-demo',
      created_at: new Date().toISOString(),
      creator: {
        id: 'ib-advisor-demo',
        full_name: 'Demo IB Advisor',
        role: 'IB_ADVISOR'
      }
    };

    const feedback2 = {
      id: `feedback-${Date.now() + 1}`,
      application_id: appId,
      category: 'Legal Documents',
      issue: 'Certificate of Incorporation needs to be updated. Please provide the current version.',
      priority: 'MEDIUM',
      status: 'PENDING',
      created_by: 'ib-advisor-demo',
      created_at: new Date().toISOString(),
      creator: {
        id: 'ib-advisor-demo',
        full_name: 'Demo IB Advisor',
        role: 'IB_ADVISOR'
      }
    };

    // Save to issuer-specific key
    const issuerKey = `issuer_feedback_${companyId}`;
    const items = [feedback, feedback2];
    localStorage.setItem(issuerKey, JSON.stringify(items));

    // Also save to application key
    const appKey = `feedback_${appId}`;
    localStorage.setItem(appKey, JSON.stringify(items));

    setCreated(true);
    alert(`✅ Created 2 feedback items for your company!\n\nCompany ID: ${companyId}\nApp ID: ${appId}\n\nNow go to /capitallab/collaborative/issuer/feedback to see them!`);
  };

  const clearMyFeedback = () => {
    if (!profile?.company_id) {
      alert('Please login as an issuer first!');
      return;
    }

    const companyId = profile.company_id;
    const issuerKey = `issuer_feedback_${companyId}`;
    localStorage.removeItem(issuerKey);
    
    const appId = `app-${companyId}`;
    const appKey = `feedback_${appId}`;
    localStorage.removeItem(appKey);

    setCreated(false);
    alert('Feedback cleared!');
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Please Login First</h2>
            <p className="text-gray-600 mb-4">You need to be logged in as an issuer to use this tool</p>
            <Button onClick={() => window.location.href = '/auth/login'}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-2 border-blue-300">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-6 w-6 text-blue-600" />
              <span>Feedback Fix Tool</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="bg-white p-4 rounded border">
              <h3 className="font-semibold mb-2">Your Information:</h3>
              <div className="text-sm space-y-1">
                <p><strong>Name:</strong> {profile.full_name || profile.username}</p>
                <p><strong>Role:</strong> {profile.role}</p>
                <p><strong>Company ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{profile.company_id}</code></p>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={createFeedbackForMyCompany}
                className="w-full bg-green-600 hover:bg-green-700 h-auto py-4"
                size="lg"
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="font-semibold">Create Test Feedback for My Company</div>
                  <div className="text-xs opacity-90">Creates 2 sample feedback items linked to your company</div>
                </div>
              </Button>

              <Button 
                onClick={clearMyFeedback}
                variant="outline"
                className="w-full"
              >
                Clear My Feedback
              </Button>

              <Button 
                onClick={() => window.location.href = '/capitallab/collaborative/issuer/feedback'}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Go to Feedback Page
              </Button>
            </div>

            {created && (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Feedback Created Successfully!</span>
                </div>
                <p className="text-sm text-green-700 mt-2">
                  Go to the feedback page to see your new feedback items with the improved UI.
                </p>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-sm">
              <h4 className="font-semibold text-yellow-900 mb-2">📋 What This Does:</h4>
              <ul className="space-y-1 text-yellow-800">
                <li>• Creates feedback with YOUR company ID</li>
                <li>• Saves to both issuer and application keys</li>
                <li>• Creates 2 sample feedback items (HIGH and MEDIUM priority)</li>
                <li>• You'll see the new improved UI with color-coded cards</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <span className="font-bold text-blue-600">1.</span>
              <p>Click "Create Test Feedback for My Company" above</p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold text-blue-600">2.</span>
              <p>Click "Go to Feedback Page" or navigate to <code className="bg-gray-100 px-2 py-1 rounded">/capitallab/collaborative/issuer/feedback</code></p>
            </div>
            <div className="flex items-start space-x-2">
              <span className="font-bold text-blue-600">3.</span>
              <p>You should see the new UI with:</p>
            </div>
            <ul className="ml-8 space-y-1 text-gray-600">
              <li>• Color-coded feedback cards (orange border for pending)</li>
              <li>• Step-by-step instructions banner</li>
              <li>• Better response areas</li>
              <li>• Improved discussion threads</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
