'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMockAuth } from '@/lib/mock-data/mock-auth-context';
import { USE_MOCK_DATA } from '@/lib/mock-data/mock-toggle';
import { Building2, Briefcase, Shield, LogOut } from 'lucide-react';

export function RoleSelector() {
  const { profile, signIn, signOut } = useMockAuth();

  if (!USE_MOCK_DATA) {
    return null;
  }

  if (profile) {
    return (
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-blue-900">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Mock Mode Active</span>
            </div>
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              {profile.role.replace('_', ' ')}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-800">
                Signed in as: <strong>{profile.full_name}</strong> ({profile.email})
              </p>
              <p className="text-xs text-blue-600 mt-1">
                All actions are simulated locally without database updates
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={signOut}
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Switch Role
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-900">Mock Mode - Select Your Role</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-orange-800 mb-4">
          Choose a role to test the collaborative workflow without backend dependencies:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => signIn('ISSUER')}
            className="h-auto p-4 flex flex-col items-center space-y-2 bg-blue-600 hover:bg-blue-700"
          >
            <Building2 className="h-8 w-8" />
            <div className="text-center">
              <div className="font-semibold">Issuer Company</div>
              <div className="text-xs opacity-90">Submit IPO applications</div>
            </div>
          </Button>

          <Button
            onClick={() => signIn('IB_ADVISOR')}
            className="h-auto p-4 flex flex-col items-center space-y-2 bg-green-600 hover:bg-green-700"
          >
            <Briefcase className="h-8 w-8" />
            <div className="text-center">
              <div className="font-semibold">IB Advisor</div>
              <div className="text-xs opacity-90">Review & structure deals</div>
            </div>
          </Button>

          <Button
            onClick={() => signIn('CMA_REGULATOR')}
            className="h-auto p-4 flex flex-col items-center space-y-2 bg-red-600 hover:bg-red-700"
          >
            <Shield className="h-8 w-8" />
            <div className="text-center">
              <div className="font-semibold">CMA Regulator</div>
              <div className="text-xs opacity-90">Regulatory review</div>
            </div>
          </Button>
        </div>

        <div className="mt-4 p-3 bg-orange-100 rounded-lg">
          <p className="text-xs text-orange-700">
            <strong>Note:</strong> This is a development mode feature. All data is simulated locally 
            and no real database operations are performed.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}