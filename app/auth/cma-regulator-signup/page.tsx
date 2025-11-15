'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CMARegulatorSignup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    employeeId: '',
    department: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);

      // Create CMA Regulator account via API (Supabase)
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.email.split('@')[0],
          full_name: formData.fullName,
          role: 'CMA_REGULATOR',
          phone: formData.phone,
          metadata: {
            employee_id: formData.employeeId,
            department: formData.department || 'Listing & Compliance'
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create account');
      }

      alert('✅ CMA Regulator account created successfully!\n\nYou can now login with your credentials.');
      router.push('/auth/cma-regulator-login');
    } catch (error) {
      console.error('Signup error:', error);
      setError(error instanceof Error ? error.message : 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-red-100 rounded-full">
              <Shield className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CMA Regulator Registration</h1>
          <p className="text-gray-600">Capital Markets Authority - Rwanda</p>
        </div>

        <Card className="border-2 border-red-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-red-50 to-blue-50">
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-600" />
              <span>Create CMA Regulator Account</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee ID <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    placeholder="CMA-EMP-001"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Official Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john.doe@cma.gov.rw"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Use your official CMA email address</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select Department</option>
                    <option value="Listing & Compliance">Listing & Compliance</option>
                    <option value="Market Supervision">Market Supervision</option>
                    <option value="Enforcement">Enforcement</option>
                    <option value="Legal">Legal</option>
                    <option value="Research & Policy">Research & Policy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+250 788 000 000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Regulatory Authority
                </h4>
                <p className="text-sm text-blue-800">
                  By creating this account, you confirm that you are an authorized employee of the 
                  Capital Markets Authority of Rwanda with the authority to review and make decisions 
                  on securities applications.
                </p>
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {loading ? 'Creating Account...' : 'Create CMA Account'}
                </Button>
                <Link href="/auth/cma-regulator-login" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Already have an account?
                  </Button>
                </Link>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t">
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
          <p className="text-xs mt-1">Regulatory Review & Compliance System</p>
        </div>
      </div>
    </div>
  );
}
