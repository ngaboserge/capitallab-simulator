'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirect to unified team signup page
 * This route is deprecated - all issuer team creation now happens at /auth/signup-team
 */
export default function CreateCompanyTeamRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/signup-team');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to team signup...</p>
      </div>
    </div>
  );
}
