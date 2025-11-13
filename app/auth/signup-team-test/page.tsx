'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function TestPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Test Page - Signup Team</h1>
        <p className="mb-4">If you can see this, the route is working.</p>
        
        <div className="space-y-4">
          <button
            onClick={() => router.push('/auth/signup-team')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Actual Signup Team Page
          </button>
          
          <button
            onClick={() => router.push('/auth/login')}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 ml-4"
          >
            Go to Login
          </button>
        </div>

        <div className="mt-8 p-4 bg-white rounded shadow">
          <h2 className="font-bold mb-2">Debug Info:</h2>
          <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
          <p>Route: /auth/signup-team-test</p>
        </div>
      </div>
    </div>
  );
}
