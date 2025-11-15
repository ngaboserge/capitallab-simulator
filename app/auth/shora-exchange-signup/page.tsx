'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Award, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SHORAExchangeSignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    position: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!formData.fullName || !formData.username || !formData.email || !formData.password || !formData.position) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      // Create account using Supabase API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.fullName,
          username: formData.username,
          role: 'SHORA_EXCHANGE',
          metadata: {
            position: formData.position,
            department: 'Exchange Operations'
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      console.log('✅ Shora Exchange account created:', data);
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/shora-exchange-login');
      }, 2000);
    } catch (err) {
      setError('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-green-200">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
            <p className="text-gray-600 mb-4">
              Your SHORA Exchange account has been created successfully.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to login page...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <CardTitle className="text-2xl font-bold">Create SHORA Account</CardTitle>
            <CardDescription>
              Register as a SHORA Exchange Official
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="johndoe"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@exchange.rw"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Position</label>
                <Input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="e.g., Listing Committee Member"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm Password</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  required
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/auth/shora-exchange-login" className="text-purple-600 hover:underline font-medium">
                  Sign in
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
