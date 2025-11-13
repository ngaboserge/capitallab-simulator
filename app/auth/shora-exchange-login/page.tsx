'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Award, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function SHORAExchangeLoginPage() {
  const router = useRouter();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check against registered accounts (allow login with username or email)
      const accounts = JSON.parse(localStorage.getItem('shora_exchange_accounts') || '[]');
      const account = accounts.find((acc: any) => 
        (acc.email === usernameOrEmail || acc.username === usernameOrEmail) && 
        acc.password === password
      );

      if (account) {
        // Create session
        const session = {
          user: {
            id: account.id,
            email: account.email,
            full_name: account.fullName
          },
          profile: {
            id: account.id,
            user_id: account.id,
            email: account.email,
            full_name: account.fullName,
            role: 'SHORA_EXCHANGE',
            position: account.position
          }
        };

        // Use 'auth_session' key to match SimpleAuthContext
        localStorage.setItem('auth_session', JSON.stringify(session));
        
        // Force a full page reload to ensure session is loaded
        window.location.href = '/capitallab/collaborative/rse-listing';
      } else {
        setError('Invalid username/email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link href="/capitallab">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Hub
          </Button>
        </Link>

        <Card className="shadow-xl border-purple-200">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">SHORA Exchange</CardTitle>
            <CardDescription>
              Listing Committee Portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Username or Email</label>
                <Input
                  type="text"
                  value={usernameOrEmail}
                  onChange={(e) => setUsernameOrEmail(e.target.value)}
                  placeholder="username or email@exchange.rw"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/auth/shora-exchange-signup" className="text-purple-600 hover:underline font-medium">
                  Create one
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-600 mt-4">
          SHORA Exchange - Stock and Holdings Registry of Africa
        </p>
      </div>
    </div>
  );
}
