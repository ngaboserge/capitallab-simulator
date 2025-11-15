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
import { Badge } from '@/components/ui/badge'
import { Building2, LogIn, UserPlus, Plus, Trash2, User, Mail, ArrowRight, ArrowLeft } from 'lucide-react'

interface TeamMember {
  name: string
  email: string
  role: string
  password: string
}

function IssuerEntryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('login')
  const [signupStep, setSignupStep] = useState(1) // 1: Company info, 2: Team setup

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
  
  // Signup form - Step 1
  const [companyData, setCompanyData] = useState({
    companyName: '',
    founderName: '',
    founderEmail: '',
    founderPassword: '',
    founderRole: 'ISSUER_CEO'
  })

  // Signup form - Step 2: Team members
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: '', // Will be set dynamically based on available roles
    password: ''
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
        // No company - show error and suggest creating account
        setError('Your account is not associated with a company. Please use "Create Account" tab to set up your company.')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const availableRoles = [
    { value: 'ISSUER_CEO', label: 'CEO', color: 'bg-purple-100 text-purple-800' },
    { value: 'ISSUER_CFO', label: 'CFO', color: 'bg-blue-100 text-blue-800' },
    { value: 'ISSUER_SECRETARY', label: 'Company Secretary', color: 'bg-green-100 text-green-800' },
    { value: 'ISSUER_LEGAL_ADVISOR', label: 'Legal Advisor', color: 'bg-orange-100 text-orange-800' }
  ]

  // Exclude the founder's role and already added team member roles
  const usedRoles = [companyData.founderRole, ...teamMembers.map(m => m.role)]
  const unusedRoles = availableRoles.filter(r => !usedRoles.includes(r.value))
  
  // Update newMember role when unusedRoles changes or when it's empty
  React.useEffect(() => {
    if (unusedRoles.length > 0) {
      // If current role is not in unused roles or is empty, set to first available
      if (!newMember.role || !unusedRoles.find(r => r.value === newMember.role)) {
        setNewMember(prev => ({ ...prev, role: unusedRoles[0].value }))
      }
    }
  }, [unusedRoles.length, companyData.founderRole])

  const addTeamMember = () => {
    if (newMember.name && newMember.email && newMember.password && newMember.role) {
      setTeamMembers([...teamMembers, { ...newMember }])
      // Clear form and set to next available role
      const remainingRoles = availableRoles.filter(r => 
        r.value !== companyData.founderRole && 
        !teamMembers.some(m => m.role === r.value) &&
        r.value !== newMember.role
      )
      setNewMember({ 
        name: '', 
        email: '', 
        role: remainingRoles[0]?.value || 'ISSUER_CFO', 
        password: '' 
      })
    }
  }

  const removeMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Create founder account with company
      // Generate unique username from email + timestamp to avoid conflicts
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
          companyRole: companyData.founderRole
        })
      })

      const signupResult = await signupResponse.json()
      if (!signupResponse.ok) {
        throw new Error(signupResult.error || 'Account creation failed')
      }

      // Login the founder
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

      // Update profile with company role
      const teamResponse = await fetch('/api/auth/signup-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyData.companyName,
          companyRole: companyData.founderRole
        })
      })

      if (!teamResponse.ok) {
        const teamResult = await teamResponse.json()
        console.error('Team setup error:', teamResult.error)
        // Continue anyway - user is created
      }

      // TODO: In the future, we can create team member accounts here
      // For now, team members can be invited from the dashboard

      // Success! Redirect to issuer dashboard
      router.push('/capitallab/collaborative/issuer')
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
                {/* Progress indicator */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className={`flex items-center gap-2 ${signupStep === 1 ? 'text-blue-600' : 'text-green-600'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${signupStep === 1 ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
                      1
                    </div>
                    <span className="text-sm font-medium">Company</span>
                  </div>
                  <div className="w-12 h-0.5 bg-gray-300"></div>
                  <div className={`flex items-center gap-2 ${signupStep === 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${signupStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                      2
                    </div>
                    <span className="text-sm font-medium">Team</span>
                  </div>
                </div>

                {/* Step 1: Company & Founder Info */}
                {signupStep === 1 && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        Set up your company and create your founder account
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

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="founder-name">Your Full Name</Label>
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
                        <Label htmlFor="founder-role">Your Role</Label>
                        <select
                          id="founder-role"
                          className="w-full h-10 px-3 rounded-md border border-input bg-background"
                          value={companyData.founderRole}
                          onChange={(e) => setCompanyData({ ...companyData, founderRole: e.target.value })}
                        >
                          {availableRoles.map(role => (
                            <option key={role.value} value={role.value}>{role.label}</option>
                          ))}
                        </select>
                      </div>
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
                        placeholder="Minimum 6 characters"
                        value={companyData.founderPassword}
                        onChange={(e) => setCompanyData({ ...companyData, founderPassword: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>

                    <Button 
                      type="button" 
                      className="w-full" 
                      onClick={() => setSignupStep(2)}
                      disabled={!companyData.companyName || !companyData.founderName || !companyData.founderEmail || !companyData.founderPassword}
                    >
                      Next: Add Team Members
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}

                {/* Step 2: Team Setup */}
                {signupStep === 2 && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        <strong>Add your team members</strong> (optional). Each role will handle specific sections of the IPO application.
                      </p>
                    </div>

                    {/* Current team */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Team Members ({teamMembers.length + 1})</h4>
                      
                      {/* Founder */}
                      <div className="mb-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span className="font-medium">{companyData.founderName}</span>
                              <Badge className="bg-purple-100 text-purple-800 text-xs">Founder</Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              <span>{companyData.founderEmail}</span>
                            </div>
                            <Badge className={availableRoles.find(r => r.value === companyData.founderRole)?.color}>
                              {availableRoles.find(r => r.value === companyData.founderRole)?.label}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Team members */}
                      {teamMembers.map((member, index) => (
                        <div key={index} className="mb-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span className="font-medium">{member.name}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                <span>{member.email}</span>
                              </div>
                              <Badge className={availableRoles.find(r => r.value === member.role)?.color}>
                                {availableRoles.find(r => r.value === member.role)?.label}
                              </Badge>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMember(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add new member form */}
                    {unusedRoles.length > 0 && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                        <h4 className="text-sm font-medium">Add Team Member</h4>
                        <div className="grid grid-cols-1 gap-3">
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="Full Name"
                              value={newMember.name}
                              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                            />
                            <Input
                              type="email"
                              placeholder="Email"
                              value={newMember.email}
                              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="password"
                              placeholder="Password (min 6 chars)"
                              value={newMember.password}
                              onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                              minLength={6}
                            />
                            <select
                              className="h-10 px-3 rounded-md border border-input bg-background"
                              value={newMember.role}
                              onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                            >
                              {unusedRoles.map(role => (
                                <option key={role.value} value={role.value}>{role.label}</option>
                              ))}
                            </select>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            onClick={addTeamMember}
                            disabled={!newMember.name || !newMember.email || !newMember.password || newMember.password.length < 6}
                            className="w-full"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add {availableRoles.find(r => r.value === newMember.role)?.label}
                          </Button>
                        </div>
                      </div>
                    )}

                    {unusedRoles.length === 0 && teamMembers.length > 0 && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center text-sm text-green-800">
                        ✓ All roles assigned! Your team is complete.
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setSignupStep(1)}
                        className="flex-1"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="flex-1"
                      >
                        {loading ? 'Creating...' : 'Create Company & Team'}
                      </Button>
                    </div>
                  </div>
                )}
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
