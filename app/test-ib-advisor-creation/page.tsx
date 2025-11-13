'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Users, CheckCircle, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface IBAdvisor {
  id: string;
  name: string;
  description: string;
  specialization: string[];
  experience: string;
  successRate: number;
  completedIPOs: number;
  status: string;
}

export default function TestIBAdvisorCreation() {
  const [advisors, setAdvisors] = useState<IBAdvisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAdvisors = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ib-advisors');
      const data = await response.json();
      
      if (response.ok) {
        setAdvisors(data.advisors || []);
        setError(null);
      } else {
        setError(data.error || 'Failed to load advisors');
      }
    } catch (err) {
      setError('Network error loading advisors');
      console.error('Error loading advisors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdvisors();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            IB Advisor System Test
          </h1>
          <p className="text-gray-600">
            Test creating IB Advisor accounts and verify they appear in the issuer selection
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <Plus className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-green-900 mb-2">Create IB Advisor</h3>
              <p className="text-sm text-green-700 mb-4">
                Register a new investment bank advisor account
              </p>
              <Link href="/auth/ib-advisor-signup">
                <Button className="bg-green-600 hover:bg-green-700">
                  Create Account
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6 text-center">
              <Briefcase className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-blue-900 mb-2">Test Selection</h3>
              <p className="text-sm text-blue-700 mb-4">
                Go to issuer page and test IB Advisor selection
              </p>
              <Link href="/capitallab/collaborative/issuer">
                <Button variant="outline" className="border-blue-300 text-blue-700">
                  Test Selection
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-purple-900 mb-2">IB Dashboard</h3>
              <p className="text-sm text-purple-700 mb-4">
                Access the IB Advisor dashboard
              </p>
              <Link href="/capitallab/collaborative/ib-advisor">
                <Button variant="outline" className="border-purple-300 text-purple-700">
                  IB Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-orange-900 mb-2">IB Advisor Login</h3>
              <p className="text-sm text-orange-700 mb-4">
                Login as existing IB Advisor
              </p>
              <Link href="/auth/ib-advisor-login">
                <Button variant="outline" className="border-orange-300 text-orange-700">
                  IB Advisor Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Current IB Advisors */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Registered IB Advisors ({advisors.length})
              </CardTitle>
              <Button onClick={loadAdvisors} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">
                Loading IB Advisors...
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-600 mb-4">{error}</div>
                <Button onClick={loadAdvisors} variant="outline">
                  Try Again
                </Button>
              </div>
            ) : advisors.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No IB Advisors Found
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first IB Advisor account to test the system
                </p>
                <Link href="/auth/ib-advisor-signup">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First IB Advisor
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {advisors.map((advisor) => (
                  <div
                    key={advisor.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-lg">{advisor.name}</h3>
                        <Badge 
                          className={
                            advisor.status === 'available' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {advisor.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{advisor.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Experience: {advisor.experience}</span>
                        <span>Success Rate: {advisor.successRate}%</span>
                        <span>Completed IPOs: {advisor.completedIPOs}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {advisor.specialization.map((spec) => (
                          <Badge key={spec} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">Available</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-blue-800">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <strong>Create IB Advisor Account:</strong> Click "Create Account" above to register a new investment bank advisor with full profile details.
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <strong>Verify Registration:</strong> After creating an account, refresh this page to see the new advisor appear in the list above.
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <strong>Test Selection:</strong> Go to the issuer page and complete some sections, then test selecting your newly created IB Advisor.
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">4</div>
                <div>
                  <strong>Test Workflow:</strong> Login as the IB Advisor and verify you can see transferred applications in the IB Dashboard.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}