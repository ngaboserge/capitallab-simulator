'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CMARegulatorLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);

      // Login via Supabase API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Invalid email or password');
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      // Verify the user is a CMA regulator
      if (data.profile?.role !== 'CMA_REGULATOR' && data.profile?.role !== 'CMA_ADMIN') {
        setError('This account is not authorized as a CMA Regulator');
        setLoading(false);
        return;
      }

      console.log('CMA Regulator logged in:', data.profile);

      // Redirect to CMA regulator dashboard
      window.location.href = '/capitallab/collaborative/cma-regulator';
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-red-100 rounded-full">
              <Shield className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CMA Regulator Login</h1>
          <p className="text-gray-600">Capital Markets Authority - Rwanda</p>
        </div>

        <Card className="border-2 border-red-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-red-50 to-blue-50">
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-600" />
              <span>Regulatory Access</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Official Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@cma.gov.rw"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {loading ? 'Logging in...' : 'Login to CMA Dashboard'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t space-y-3">
              <Link href="/auth/cma-regulator-signup">
                <Button variant="outline" className="w-full">
                  Create CMA Regulator Account
                </Button>
              </Link>

              <Link href="/capitallab/collaborative">
                <Button variant="ghost" size="sm" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to CapitalLab Hub
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>🏛️ Capital Markets Authority - Rwanda</p>
          <p className="text-xs mt-1">Authorized Personnel Only</p>
        </div>
      </div>
    </div>
  );
}
