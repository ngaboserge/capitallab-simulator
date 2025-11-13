'use client';

import React from 'react';
import { JoinTeamRequest } from '@/components/auth/join-team-request';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function JoinTeamPage() {
  const router = useRouter();

  const handleSuccess = () => {
    // After successful request, redirect back to issuer page
    setTimeout(() => {
      router.push('/capitallab/collaborative/issuer');
    }, 3000);
  };

  const handleError = (error: string) => {
    console.error('Join team error:', error);
    // Error is already displayed in the component
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/capitallab/collaborative/issuer">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Issuer Dashboard
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Join Your Company's IPO Team
            </h1>
            <p className="text-gray-600">
              Request access to your company's existing IPO application
            </p>
          </div>
        </div>

        {/* Join Team Form */}
        <JoinTeamRequest onSuccess={handleSuccess} onError={handleError} />
        
        {/* Help Section */}
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Can't find your company?</strong> If your company hasn't started an IPO application yet, 
                you may need to <Link href="/auth/signup-team" className="text-blue-600 hover:underline">create a new team</Link>.
              </p>
              <p>
                <strong>Already have an account?</strong> Make sure you're logged in with the correct email address 
                that your company administrator expects.
              </p>
              <p>
                <strong>Technical issues?</strong> Contact support if you're having trouble accessing your team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}