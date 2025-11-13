'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSimpleAuth } from '@/lib/auth/simple-auth-context';
import { Loader2, Briefcase, User, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function IBAdvisorLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { login } = useSimpleAuth();
  const router = useRouter();

  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await login(loginData.username, loginData.password);
      
      // Get user profile to verify role
      const response = await fetch('/api/auth/session');
      const sessionData = await response.json();
      
      if (sessionData.user?.role === 'IB_ADVISOR') {
        setSuccess('Successfully logged in! Redirecting to your dashboard...');
        setTimeout(() => {
          router.push('/capitallab/collaborative/ib-advisor');
        }, 1000);
      } else {
        // Wrong role - logout and show error
        setError(`This login is for Investment Bank Advisors only. Your account role is: ${sessionData.user?.role}`);
        setIsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center shadow-xl">
            <Briefcase className="h-12 w-12 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Investment Bank Advisor Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Professional IPO structuring and advisory services
          </p>
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-100 border border-green-200 rounded-full">
            <Briefcase className="h-4 w-4 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">IB Advisor Access Only</span>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-2xl border-green-100">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
            <CardTitle className="text-green-900">Sign In to Your Account</CardTitle>
            <CardDescription className="text-green-700">
              Access your IB Advisor dashboard to review applications and structure deals
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <Label htmlFor="username" className="text-gray-700">Username or Email</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-3 h-5 w-5 text-green-500" />
                  <Input
                    id="username"
                    type="text"
                    required
                    className="pl-10 border-green-200 focus:border-green-500 focus:ring-green-500"
                    placeholder="Enter your username or email"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-green-500" />
                  <Input
                    id="password"
                    type="password"
                    required
                    className="pl-10 border-green-200 focus:border-green-500 focus:ring-green-500"
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg" 
                disabled={isLoading}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    <Briefcase className="mr-2 h-5 w-5" />
                    Sign In as IB Advisor
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">New to the platform?</span>
              </div>
            </div>

            {/* Create Account Link */}
            <div className="text-center">
              <Link href="/auth/ib-advisor-signup">
                <Button 
                  variant="outline" 
                  className="w-full border-green-300 text-green-700 hover:bg-green-50"
                  type="button"
                >
                  Create IB Advisor Account
                </Button>
              </Link>
              <p className="text-xs text-gray-500 mt-3">
                Register your investment bank to provide professional IPO advisory services
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Links */}
        <div className="text-center space-y-3">
          <div className="text-sm">
            <Link href="/capitallab/collaborative" className="text-green-600 hover:text-green-700 font-medium">
              ← Back to Collaborative Hub
            </Link>
          </div>
          <div className="text-xs text-gray-500">
            <Link href="/auth/login" className="hover:text-gray-700">
              Login as different role (Issuer/Regulator)
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}