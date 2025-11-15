'use client';

import React from 'react';
import { IssuerTeamSignup } from '@/components/auth/issuer-team-signup';
import { useRouter } from 'next/navigation';
import { useSimpleAuth } from '@/lib/auth/simple-auth-context';

export default function TeamSignupPage() {
  const router = useRouter();
  const { profile } = useSimpleAuth();

  const handleSuccess = (company: any, team: any[]) => {
    // Show success message and redirect to issuer dashboard
    alert(`Successfully created company "${company.legal_name}" with ${team.length} team members!`);
    router.push('/capitallab/collaborative/issuer');
  };

  const handleError = (error: string) => {
    console.error('Team signup error:', error);
    // Error is already displayed in the component
  };

  // Pass current user info if logged in
  const currentUser = profile ? {
    fullName: profile.full_name || profile.email?.split('@')[0] || '',
    email: profile.email || '',
    role: (profile.company_role?.replace('ISSUER_', '') || profile.role?.replace('ISSUER_', '') || 'CEO') as any
  } : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-6">
          <button
            onClick={() => router.push(profile ? '/capitallab/collaborative/issuer' : '/auth/login')}
            className="text-blue-600 hover:text-blue-700 flex items-center space-x-2 text-sm font-medium"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to {profile ? 'Dashboard' : 'Login'}</span>
          </button>
        </div>
        <IssuerTeamSignup 
          onSuccess={handleSuccess} 
          onError={handleError}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}