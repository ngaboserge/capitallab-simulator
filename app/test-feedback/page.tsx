'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TestFeedbackPage() {
  const [feedbackKeys, setFeedbackKeys] = useState<string[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [keyData, setKeyData] = useState<any>(null);

  const loadFeedbackKeys = () => {
    const allKeys = Object.keys(localStorage);
    const keys = allKeys.filter(key => 
      key.includes('feedback') || key.includes('ib_transfers')
    );
    setFeedbackKeys(keys);
  };

  useEffect(() => {
    loadFeedbackKeys();
  }, []);

  const viewKey = (key: string) => {
    setSelectedKey(key);
    try {
      const data = localStorage.getItem(key);
      if (data) {
        setKeyData(JSON.parse(data));
      }
    } catch (e) {
      setKeyData({ error: 'Failed to parse' });
    }
  };

  const createTestFeedback = () => {
    const testCompanyId = 'test-company-123';
    const testAppId = 'test-app-456';
    
    const feedback = {
      id: `feedback-${Date.now()}`,
      application_id: testAppId,
      category: 'Financial Documents',
      issue: 'Please provide audited financial statements for the last 3 years',
      priority: 'HIGH',
      status: 'PENDING',
      created_by: 'ib-advisor-test',
      created_at: new Date().toISOString(),
      creator: {
        id: 'ib-advisor-test',
        full_name: 'Test IB Advisor',
        role: 'IB_ADVISOR'
      }
    };

    // Save to both keys
    const appKey = `feedback_${testAppId}`;
    const issuerKey = `issuer_feedback_${testCompanyId}`;

    // App key
    const appStored = localStorage.getItem(appKey);
    const appFeedback = appStored ? JSON.parse(appStored) : [];
    appFeedback.push(feedback);
    localStorage.setItem(appKey, JSON.stringify(appFeedback));

    // Issuer key
    const issuerStored = localStorage.getItem(issuerKey);
    const issuerFeedback = issuerStored ? JSON.parse(issuerStored) : [];
    issuerFeedback.push(feedback);
    localStorage.setItem(issuerKey, JSON.stringify(issuerFeedback));

    alert(`Test feedback created!\n\nCompany ID: ${testCompanyId}\nApp ID: ${testAppId}\n\nCheck localStorage for:\n- ${appKey}\n- ${issuerKey}`);
    loadFeedbackKeys();
  };

  const clearAllFeedback = () => {
    if (confirm('Clear all feedback from localStorage?')) {
      feedbackKeys.forEach(key => localStorage.removeItem(key));
      loadFeedbackKeys();
      setSelectedKey('');
      setKeyData(null);
      alert('All feedback cleared!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Feedback System Debug Tool</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-3">
              <Button onClick={loadFeedbackKeys}>
                Refresh Keys
              </Button>
              <Button onClick={createTestFeedback} className="bg-green-600">
                Create Test Feedback
              </Button>
              <Button onClick={clearAllFeedback} variant="destructive">
                Clear All Feedback
              </Button>
            </div>

            <div>
              <h3 className="font-semibold mb-2">
                Feedback Keys in localStorage ({feedbackKeys.length})
              </h3>
              <div className="space-y-2">
                {feedbackKeys.length === 0 ? (
                  <p className="text-gray-500">No feedback keys found</p>
                ) : (
                  feedbackKeys.map(key => (
                    <div key={key} className="flex items-center justify-between p-2 border rounded">
                      <code className="text-sm">{key}</code>
                      <Button size="sm" onClick={() => viewKey(key)}>
                        View
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedKey && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Data for: {selectedKey}</span>
                <Badge>{Array.isArray(keyData) ? `${keyData.length} items` : 'object'}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-xs">
                {JSON.stringify(keyData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>1. Create Test Feedback:</strong> Creates sample feedback with test IDs</p>
            <p><strong>2. Check IB Advisor:</strong> Login as IB Advisor and create real feedback</p>
            <p><strong>3. Check Issuer:</strong> Login as Issuer and view feedback at /capitallab/collaborative/issuer/feedback</p>
            <p><strong>4. Debug:</strong> Use browser console to see detailed logs</p>
            <p className="text-gray-500 mt-4">
              Test Company ID: test-company-123<br />
              Test App ID: test-app-456
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
