'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TestFeedbackSync() {
  const [feedbackKeys, setFeedbackKeys] = useState<string[]>([]);
  const [feedbackData, setFeedbackData] = useState<Record<string, any>>({});
  const [refreshCount, setRefreshCount] = useState(0);

  const loadFeedbackData = () => {
    const allKeys = Object.keys(localStorage);
    const relevantKeys = allKeys.filter(key => 
      key.startsWith('feedback_') || 
      key.startsWith('issuer_feedback_') ||
      key.startsWith('ib_transfer_')
    );
    
    setFeedbackKeys(relevantKeys);
    
    const data: Record<string, any> = {};
    relevantKeys.forEach(key => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          data[key] = JSON.parse(stored);
        }
      } catch (e) {
        data[key] = 'Error parsing';
      }
    });
    
    setFeedbackData(data);
    setRefreshCount(prev => prev + 1);
  };

  useEffect(() => {
    loadFeedbackData();
  }, []);

  const clearAllFeedback = () => {
    if (confirm('Clear all feedback data from localStorage?')) {
      feedbackKeys.forEach(key => {
        localStorage.removeItem(key);
      });
      loadFeedbackData();
      alert('All feedback data cleared!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Feedback Synchronization Test</span>
              <div className="flex items-center space-x-3">
                <Badge variant="outline">Refresh #{refreshCount}</Badge>
                <Button onClick={loadFeedbackData} size="sm">
                  Refresh Data
                </Button>
                <Button onClick={clearAllFeedback} variant="destructive" size="sm">
                  Clear All
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Total Feedback Keys: {feedbackKeys.length}
                </h3>
                <p className="text-sm text-blue-700">
                  This page shows all feedback-related data in localStorage to help debug synchronization issues.
                </p>
              </div>

              {feedbackKeys.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No feedback data found in localStorage
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbackKeys.map((key) => (
                    <Card key={key} className="border-2">
                      <CardHeader className="bg-gray-50">
                        <CardTitle className="text-base font-mono">{key}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        {Array.isArray(feedbackData[key]) ? (
                          <div className="space-y-3">
                            <Badge variant="outline">
                              {feedbackData[key].length} items
                            </Badge>
                            {feedbackData[key].map((item: any, index: number) => (
                              <div key={index} className="bg-white p-4 rounded border">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="font-semibold">ID:</span> {item.id}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Status:</span>{' '}
                                    <Badge className={
                                      item.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                                      item.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                      'bg-orange-100 text-orange-800'
                                    }>
                                      {item.status}
                                    </Badge>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="font-semibold">Category:</span> {item.category}
                                  </div>
                                  <div className="col-span-2">
                                    <span className="font-semibold">Issue:</span> {item.issue}
                                  </div>
                                  {item.issuer_response && (
                                    <div className="col-span-2 bg-blue-50 p-2 rounded">
                                      <span className="font-semibold text-blue-900">Issuer Response:</span>
                                      <p className="text-blue-800 text-sm mt-1">{item.issuer_response}</p>
                                    </div>
                                  )}
                                  {item.ib_response && (
                                    <div className="col-span-2 bg-green-50 p-2 rounded">
                                      <span className="font-semibold text-green-900">IB Response:</span>
                                      <p className="text-green-800 text-sm mt-1">{item.ib_response}</p>
                                    </div>
                                  )}
                                  <div className="col-span-2 text-xs text-gray-500">
                                    Created: {new Date(item.created_at).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-96">
                            {JSON.stringify(feedbackData[key], null, 2)}
                          </pre>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-yellow-900 mb-3">Testing Instructions:</h3>
            <ol className="text-sm text-yellow-800 space-y-2">
              <li>1. Go to IB Advisor page and create feedback for an issuer</li>
              <li>2. Go to Issuer Feedback page and respond to the feedback</li>
              <li>3. Come back to this page and click "Refresh Data"</li>
              <li>4. Verify that the issuer's response appears in all relevant keys</li>
              <li>5. Go back to IB Advisor page and verify the response is visible there</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
