'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building2, LogIn, UserPlus, ArrowLeft } from 'lucide-react'

function IssuerEntryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('login')

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'no-company') {
      setError('Your account needs to be associated with a company. Please use "Create Account" to set up your company.')
      setActiveTab('signup')
    }
  }, [searchParams])
  
  // Login form
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  
  // Signup form - CEO only
  const [companyData, setCompanyData] = useState({
    companyName: '',
    founderName: '',
    founderEmail: '',
    founderPassword: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Check if user has company
      if (data.profile?.companyId) {
        router.push('/capitallab/collaborative/issuer')
      } else {
        setError('Your account is not associated with a company. Please use "Create Account" tab to set up your company.')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Create CEO account with company
      const timestamp = Date.now().toString().slice(-6)
      const username = `${companyData.founderEmail.split('@')[0]}_${timestamp}`
      
      const signupResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          email: companyData.founderEmail,
          password: companyData.founderPassword,
          fullName: companyData.founderName,
          role: 'ISSUER',
          companyName: companyData.companyName,
          companyRole: 'CEO'
        })
      })

      const signupResult = await signupResponse.json()
      if (!signupResponse.ok) {
        throw new Error(signupResult.error || 'Account creation failed')
      }

      // Login the CEO
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: companyData.founderEmail,
          password: companyData.founderPassword
        })
      })

      const loginResult = await loginResponse.json()
      if (!loginResponse.ok) {
        throw new Error(loginResult.error || 'Login failed')
      }

      // Success! Redirect to issuer dashboard
      router.push('/capitallab/collaborative/issuer?welcome=true')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {/* Back to Hub Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/capitallab/collaborative')}
            className="text-gray-700 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Hub
          </Button>
        </div>

        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Issuer Portal</CardTitle>
            <CardDescription>
              Access your IPO application or create a new account
            </CardDescription>
          </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </TabsTrigger>
              <TabsTrigger value="signup">
                <UserPlus className="h-4 w-4 mr-2" />
                Create Account
              </TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Create your company and CEO account.</strong> You can add team members (CFO, Legal Advisor, Secretary) later from your dashboard.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    type="text"
                    placeholder="Your Company Ltd"
                    value={companyData.companyName}
                    onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="founder-name">Your Full Name (CEO)</Label>
                  <Input
                    id="founder-name"
                    type="text"
                    placeholder="John Doe"
                    value={companyData.founderName}
                    onChange={(e) => setCompanyData({ ...companyData, founderName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="founder-email">Email Address</Label>
                  <Input
                    id="founder-email"
                    type="email"
                    placeholder="your@email.com"
                    value={companyData.founderEmail}
                    onChange={(e) => setCompanyData({ ...companyData, founderEmail: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="founder-password">Password</Label>
                  <Input
                    id="founder-password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={companyData.founderPassword}
                    onChange={(e) => setCompanyData({ ...companyData, founderPassword: e.target.value })}
                    required
                    minLength={8}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || !companyData.companyName || !companyData.founderName || !companyData.founderEmail || !companyData.founderPassword}
                >
                  {loading ? 'Creating Account...' : 'Create Company & CEO Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

export default function IssuerEntryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <IssuerEntryContent />
    </Suspense>
  )
}
