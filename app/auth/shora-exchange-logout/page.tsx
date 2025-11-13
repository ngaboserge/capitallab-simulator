'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, LogOut, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SHORAExchangeLogoutPage() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(true);
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    // Perform logout
    const performLogout = async () => {
      try {
        // Clear SHORA Exchange session
        localStorage.removeItem('auth_session');
        
        // Also clear any other SHORA-specific data if needed
        // localStorage.removeItem('shora_exchange_accounts'); // Keep accounts for future logins
        
        // Small delay for UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setLoggingOut(false);
        setLoggedOut(true);
      } catch (error) {
        console.error('Logout error:', error);
        setLoggingOut(false);
        setLoggedOut(true);
      }
    };

    performLogout();
  }, []);

  const handleReturnToHub = () => {
    router.push('/capitallab');
  };

  const handleLoginAgain = () => {
    router.push('/auth/shora-exchange-login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-purple-200">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                {loggingOut ? (
                  <LogOut className="h-8 w-8 text-purple-600 animate-pulse" />
                ) : (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                )}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              {loggingOut ? 'Logging Out...' : 'Logged Out Successfully'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loggingOut ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Clearing your SHORA Exchange session...</p>
              </div>
            ) : (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 font-medium">
                    You have been successfully logged out from SHORA Exchange
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    Your session has been cleared
                  </p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={handleLoginAgain}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Login to SHORA Exchange Again
                  </Button>

                  <Button
                    onClick={handleReturnToHub}
                    variant="outline"
                    className="w-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Return to CapitalLab Hub
                  </Button>
                </div>

                <div className="text-center text-sm text-gray-600 pt-4 border-t">
                  <p>Need to access other roles?</p>
                  <div className="flex flex-col space-y-2 mt-3">
                    <Link href="/auth/cma-regulator-login" className="text-blue-600 hover:underline">
                      CMA Regulator Login
                    </Link>
                    <Link href="/auth/ib-advisor-login" className="text-green-600 hover:underline">
                      IB Advisor Login
                    </Link>
                    <Link href="/auth/create-company-team" className="text-orange-600 hover:underline">
                      Issuer Company Login
                    </Link>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-600 mt-4">
          SHORA Exchange - Stock and Holdings Registry of Africa
        </p>
      </div>
    </div>
  );
}
