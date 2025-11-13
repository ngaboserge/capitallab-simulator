'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function TestFeedbackFiltering() {
  const [results, setResults] = useState<any>(null);

  const clearOldFeedback = () => {
    let count = 0;
    const removed: string[] = [];
    
    Object.keys(localStorage).forEach(key => {
      if (key.includes('feedback') || key.includes('issuer_feedback')) {
        localStorage.removeItem(key);
        removed.push(key);
        count++;
      }
    });

    setResults({
      action: 'clear',
      count,
      removed
    });
  };

  const analyzeFeedback = () => {
    const feedbackKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('feedback_') && !key.includes('comments')
    );

    const analysis: any = {
      totalKeys: feedbackKeys.length,
      items: []
    };

    feedbackKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const items = JSON.parse(data);
          if (Array.isArray(items)) {
            items.forEach(item => {
              analysis.items.push({
                key,
                id: item.id,
                category: item.category,
                creatorRole: item.creator?.role || 'NO_ROLE',
                hasRole: !!item.creator?.role,
                created_at: item.created_at
              });
            });
          }
        }
      } catch (e) {
        console.error('Error parsing:', key, e);
      }
    });

    // Group by role
    const byRole: any = {};
    analysis.items.forEach((item: any) => {
      const role = item.creatorRole;
      if (!byRole[role]) byRole[role] = [];
      byRole[role].push(item);
    });

    analysis.byRole = byRole;
    setResults({ action: 'analyze', ...analysis });
  };

  const createTestFeedback = () => {
    const testData = [
      {
        id: 'test-cma-1',
        application_id: 'test-app',
        category: 'Financial Projections',
        issue: 'Test CMA query',
        priority: 'HIGH',
        status: 'PENDING',
        created_by: 'cma-user',
        created_at: new Date().toISOString(),
        creator: {
          id: 'cma-user',
          full_name: 'CMA Regulator',
          role: 'CMA_REGULATOR'
        }
      },
      {
        id: 'test-ib-1',
        application_id: 'test-app',
        category: 'Financial Documents',
        issue: 'Test IB feedback to issuer',
        priority: 'MEDIUM',
        status: 'PENDING',
        created_by: 'ib-user',
        created_at: new Date().toISOString(),
        creator: {
          id: 'ib-user',
          full_name: 'IB Advisor',
          role: 'IB_ADVISOR'
        }
      }
    ];

    localStorage.setItem('feedback_test-app', JSON.stringify(testData));
    setResults({
      action: 'create',
      message: 'Created 2 test feedback items',
      items: testData
    });
  };

  const testFiltering = () => {
    const feedbackKey = 'feedback_test-app';
    const data = localStorage.getItem(feedbackKey);
    
    if (!data) {
      setResults({
        action: 'test',
        error: 'No test data found. Create test feedback first.'
      });
      return;
    }

    const items = JSON.parse(data);

    // Test filtering for each role
    const cmaView = items.filter((item: any) => {
      const role = item.creator?.role;
      return role === 'CMA_REGULATOR' || role === 'IB_ADVISOR';
    });

    const ibView = items.filter((item: any) => {
      const role = item.creator?.role;
      return role === 'IB_ADVISOR' || role === 'CMA_REGULATOR';
    });

    const issuerView = items.filter((item: any) => {
      const role = item.creator?.role;
      return role === 'IB_ADVISOR';
    });

    setResults({
      action: 'test',
      total: items.length,
      cmaView: {
        count: cmaView.length,
        items: cmaView.map((i: any) => ({ id: i.id, role: i.creator?.role }))
      },
      ibView: {
        count: ibView.length,
        items: ibView.map((i: any) => ({ id: i.id, role: i.creator?.role }))
      },
      issuerView: {
        count: issuerView.length,
        items: issuerView.map((i: any) => ({ id: i.id, role: i.creator?.role }))
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Feedback Filtering Test Utility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={analyzeFeedback} variant="outline">
                📊 Analyze Current Feedback
              </Button>
              <Button onClick={clearOldFeedback} variant="destructive">
                🗑️ Clear All Feedback
              </Button>
              <Button onClick={createTestFeedback} className="bg-green-600">
                ✨ Create Test Feedback
              </Button>
              <Button onClick={testFiltering} className="bg-blue-600">
                🧪 Test Filtering Logic
              </Button>
            </div>
          </CardContent>
        </Card>

        {results && (
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              {results.action === 'clear' && (
                <div className="space-y-2">
                  <Badge className="bg-red-600">Cleared {results.count} items</Badge>
                  <div className="text-sm text-gray-600">
                    <p className="font-semibold mb-2">Removed keys:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {results.removed.map((key: string) => (
                        <li key={key}>{key}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {results.action === 'analyze' && (
                <div className="space-y-4">
                  <div>
                    <Badge>Total Feedback Keys: {results.totalKeys}</Badge>
                    <Badge className="ml-2">Total Items: {results.items.length}</Badge>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">By Creator Role:</h3>
                    {Object.entries(results.byRole).map(([role, items]: [string, any]) => (
                      <div key={role} className="mb-3">
                        <Badge variant="outline" className={
                          role === 'CMA_REGULATOR' ? 'border-red-500 text-red-700' :
                          role === 'IB_ADVISOR' ? 'border-green-500 text-green-700' :
                          'border-orange-500 text-orange-700'
                        }>
                          {role}: {items.length} items
                        </Badge>
                        <ul className="text-sm text-gray-600 mt-1 ml-4">
                          {items.slice(0, 3).map((item: any) => (
                            <li key={item.id}>
                              {item.category} - {item.id.substring(0, 20)}...
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                    <p className="text-sm font-semibold text-yellow-800">
                      Items without role: {results.items.filter((i: any) => !i.hasRole).length}
                    </p>
                    {results.items.filter((i: any) => !i.hasRole).length > 0 && (
                      <p className="text-xs text-yellow-700 mt-1">
                        ⚠️ These items won't be filtered correctly. Clear and recreate them.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {results.action === 'create' && (
                <div className="space-y-2">
                  <Badge className="bg-green-600">{results.message}</Badge>
                  <div className="text-sm">
                    {results.items.map((item: any) => (
                      <div key={item.id} className="border p-2 rounded mb-2">
                        <p><strong>ID:</strong> {item.id}</p>
                        <p><strong>Role:</strong> {item.creator.role}</p>
                        <p><strong>Category:</strong> {item.category}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {results.action === 'test' && (
                <div className="space-y-4">
                  {results.error ? (
                    <Badge variant="destructive">{results.error}</Badge>
                  ) : (
                    <>
                      <div>
                        <Badge>Total Items: {results.total}</Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="border-2 border-red-200 p-4 rounded">
                          <h3 className="font-semibold text-red-700 mb-2">CMA Regulator View</h3>
                          <Badge className="bg-red-600 mb-2">
                            {results.cmaView.count} items
                          </Badge>
                          <ul className="text-sm space-y-1">
                            {results.cmaView.items.map((item: any) => (
                              <li key={item.id}>
                                {item.id} ({item.role})
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="border-2 border-green-200 p-4 rounded">
                          <h3 className="font-semibold text-green-700 mb-2">IB Advisor View</h3>
                          <Badge className="bg-green-600 mb-2">
                            {results.ibView.count} items
                          </Badge>
                          <ul className="text-sm space-y-1">
                            {results.ibView.items.map((item: any) => (
                              <li key={item.id}>
                                {item.id} ({item.role})
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="border-2 border-blue-200 p-4 rounded">
                          <h3 className="font-semibold text-blue-700 mb-2">Issuer View</h3>
                          <Badge className="bg-blue-600 mb-2">
                            {results.issuerView.count} items
                          </Badge>
                          <ul className="text-sm space-y-1">
                            {results.issuerView.items.map((item: any) => (
                              <li key={item.id}>
                                {item.id} ({item.role})
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="bg-green-50 border border-green-200 p-3 rounded">
                        <p className="text-sm font-semibold text-green-800">
                          ✅ Expected Results:
                        </p>
                        <ul className="text-xs text-green-700 mt-1 space-y-1">
                          <li>• CMA sees: CMA_REGULATOR + IB_ADVISOR items (2 items)</li>
                          <li>• IB Advisor sees: All items (2 items)</li>
                          <li>• Issuer sees: Only IB_ADVISOR items (1 item)</li>
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              )}

              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto mt-4">
                {JSON.stringify(results, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <ol className="list-decimal pl-5 space-y-2">
              <li><strong>Analyze Current Feedback:</strong> See what feedback exists and check if it has role information</li>
              <li><strong>Clear All Feedback:</strong> Remove old feedback data that doesn't have proper role tagging</li>
              <li><strong>Create Test Feedback:</strong> Generate sample feedback with proper roles</li>
              <li><strong>Test Filtering Logic:</strong> Verify that filtering works correctly for each role</li>
            </ol>
            
            <div className="bg-blue-50 border border-blue-200 p-3 rounded mt-4">
              <p className="font-semibold text-blue-900">💡 Recommended Workflow:</p>
              <ol className="text-blue-800 text-xs mt-2 space-y-1">
                <li>1. Analyze to see current state</li>
                <li>2. Clear all old feedback</li>
                <li>3. Create test feedback</li>
                <li>4. Test filtering to verify it works</li>
                <li>5. Go back to dashboards and create real feedback</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
