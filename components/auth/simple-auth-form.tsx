"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useSimpleAuth } from '@/lib/auth/simple-auth-context'
import { Loader2, Building, User, Lock, AlertCircle, CheckCircle, Users, ArrowRight, Crown, Calculator, Scale, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface LoginFormData {
  username: string
  password: string
}

export function SimpleAuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const { login } = useSimpleAuth()
  const router = useRouter()

  // Get return URL and role hint from URL parameters
  const [returnUrl, setReturnUrl] = useState<string | null>(null)
  const [roleHint, setRoleHint] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      setReturnUrl(urlParams.get('returnUrl'))
      setRoleHint(urlParams.get('role'))
    }
  }, [])

  const [loginData, setLoginData] = useState<LoginFormData>({
    username: '',
    password: ''
  })

  const handleUsernameChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData(prev => ({ ...prev, username: e.target.value }))
  }, [])

  const handlePasswordChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData(prev => ({ ...prev, password: e.target.value }))
  }, [])

  const handleTeamCreationClick = React.useCallback(() => {
    router.push('/auth/signup-team')
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await login(loginData.username, loginData.password)
      setSuccess('Successfully logged in! Redirecting...')
      
      // Get user profile to determine redirect
      const response = await fetch('/api/auth/session')
      const sessionData = await response.json()
      
      console.log('Login successful, session data:', sessionData);
      console.log('Return URL:', returnUrl, 'Role hint:', roleHint);
      
      // Determine redirect URL
      let redirectUrl = '/dashboard'; // default
      
      // If there's a return URL and the user's role matches the hint, use return URL
      if (returnUrl && roleHint && sessionData.user?.role === roleHint) {
        redirectUrl = returnUrl;
      } else if (returnUrl && !roleHint) {
        // Use return URL if no role hint
        redirectUrl = returnUrl;
      } else {
        // Default role-based redirect
        if (sessionData.user?.role === 'ISSUER') {
          redirectUrl = '/capitallab/collaborative/issuer';
        } else if (sessionData.user?.role === 'IB_ADVISOR') {
          redirectUrl = '/capitallab/collaborative/ib-advisor';
        } else if (sessionData.user?.role === 'CMA_REGULATOR') {
          redirectUrl = '/capitallab/collaborative/cma-regulator';
        }
      }
      
      console.log('Redirecting to:', redirectUrl);
      
      // Redirect after short delay to show success message
      setTimeout(() => {
        // Use window.location for more reliable redirect
        window.location.href = redirectUrl;
      }, 500)
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed')
      setIsLoading(false)
    }
  }



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl mb-6">
            <Building className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">
            CapitalLab IPO Platform
          </h1>
          <p className="text-lg text-gray-600">
            Streamlined IPO application process for Rwanda
          </p>
        </div>

        {/* Main Login Card */}
        <div className="max-w-md mx-auto">
          <Card className="shadow-2xl border-2 border-gray-200">
            <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50 border-b">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl">Sign In</CardTitle>
              </div>
              <CardDescription className="text-base">
                {roleHint 
                  ? `Sign in as ${roleHint === 'IB_ADVISOR' ? 'Investment Bank Advisor' : roleHint}`
                  : 'Access your account to continue'}
              </CardDescription>
              {roleHint && (
                <div className="mt-3 p-2 bg-blue-100 border border-blue-300 rounded text-sm text-blue-900">
                  Expected role: <strong>{roleHint === 'IB_ADVISOR' ? 'Investment Bank Advisor' : roleHint}</strong>
                </div>
              )}
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
                  <Label htmlFor="login-username" className="text-base font-medium">Username or Email</Label>
                  <div className="relative mt-2">
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <Input
                      id="login-username"
                      type="text"
                      required
                      className="pl-11 h-12 text-base"
                      placeholder="Enter your username or email"
                      value={loginData.username}
                      onChange={handleUsernameChange}
                      disabled={isLoading}
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="login-password" className="text-base font-medium">Password</Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <Input
                      id="login-password"
                      type="password"
                      required
                      className="pl-11 h-12 text-base"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={handlePasswordChange}
                      disabled={isLoading}
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-base bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Compact Team Creation Link */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-600 font-medium">
                  New Issuer Company?
                </span>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleTeamCreationClick}
              className="mt-4 w-full p-4 bg-white border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">Create Issuer Team</h3>
                    <p className="text-sm text-gray-600">Set up company with CEO, CFO, Legal & Secretary roles</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>

          <p className="text-center text-xs text-gray-500 mt-6">
            For IB Advisors or CMA Regulators, contact your administrator
          </p>

          <p className="text-center text-xs text-gray-400 mt-4">
            By using this platform, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
