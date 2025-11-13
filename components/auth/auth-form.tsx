"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { CompanyService } from '@/lib/supabase/companies'
import { Loader2, Building, User, Mail, Lock, Phone } from 'lucide-react'

type UserRole = 'ISSUER_CEO' | 'ISSUER_CFO' | 'ISSUER_SECRETARY' | 'ISSUER_LEGAL' | 'IB_ADVISOR' | 'CMA_REGULATOR'

interface SignUpData {
  email: string
  password: string
  fullName: string
  role: UserRole
  phone?: string
  // Company data (for issuers)
  companyName?: string
  tradingName?: string
  registrationNumber?: string
  incorporationDate?: string
  businessDescription?: string
}

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('signin')
  
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  })

  const [signUpData, setSignUpData] = useState<SignUpData>({
    email: '',
    password: '',
    fullName: '',
    role: 'ISSUER_CEO' as UserRole,
    phone: '',
    companyName: '',
    tradingName: '',
    registrationNumber: '',
    incorporationDate: '',
    businessDescription: ''
  })

  const supabase = createClient()
  const companyService = new CompanyService()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess('Successfully signed in!')
        // Redirect will happen automatically via auth state change
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          data: {
            full_name: signUpData.fullName,
            role: signUpData.role
          }
        }
      })

      if (authError) {
        setError(authError.message)
        return
      }

      if (!authData.user) {
        setError('Failed to create user account')
        return
      }

      let companyId = null

      // Create company if user is an issuer
      if (signUpData.role.startsWith('ISSUER_') && signUpData.companyName) {
        const { data: company, error: companyError } = await companyService.createCompany({
          legal_name: signUpData.companyName,
          trading_name: signUpData.tradingName || null,
          registration_number: signUpData.registrationNumber || null,
          incorporation_date: signUpData.incorporationDate || null,
          business_description: signUpData.businessDescription || null,
          registered_address: {},
          contact_info: { phone: signUpData.phone }
        })

        if (companyError) {
          setError('Failed to create company: ' + companyError.message)
          return
        }

        companyId = company?.id
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: signUpData.email,
          full_name: signUpData.fullName,
          role: signUpData.role,
          company_id: companyId,
          phone: signUpData.phone || null
        })

      if (profileError) {
        setError('Failed to create profile: ' + profileError.message)
        return
      }

      setSuccess('Account created successfully! Please check your email to verify your account.')
      setActiveTab('signin')
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const isIssuerRole = signUpData.role.startsWith('ISSUER_')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Building className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            CapitalLab - IPO Application Platform
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Advanced Capital Markets Education Platform - Streamlined IPO application process for Rwanda
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Access Your Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              {error && (
                <Alert className="mt-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mt-4 border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signin-email"
                        type="email"
                        required
                        className="pl-10"
                        placeholder="Enter your email"
                        value={signInData.email}
                        onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signin-password"
                        type="password"
                        required
                        className="pl-10"
                        placeholder="Enter your password"
                        value={signInData.password}
                        onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Personal Information</h4>
                    
                    <div>
                      <Label htmlFor="signup-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-name"
                          required
                          className="pl-10"
                          placeholder="Enter your full name"
                          value={signUpData.fullName}
                          onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="signup-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-email"
                          type="email"
                          required
                          className="pl-10"
                          placeholder="Enter your email"
                          value={signUpData.email}
                          onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-password"
                          type="password"
                          required
                          className="pl-10"
                          placeholder="Create a password"
                          value={signUpData.password}
                          onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="signup-phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-phone"
                          type="tel"
                          className="pl-10"
                          placeholder="Enter your phone number"
                          value={signUpData.phone}
                          onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="signup-role">Role</Label>
                      <Select
                        value={signUpData.role}
                        onValueChange={(value: UserRole) => setSignUpData({ ...signUpData, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ISSUER_CEO">Issuer - CEO</SelectItem>
                          <SelectItem value="ISSUER_CFO">Issuer - CFO</SelectItem>
                          <SelectItem value="ISSUER_SECRETARY">Issuer - Company Secretary</SelectItem>
                          <SelectItem value="ISSUER_LEGAL">Issuer - Legal Advisor</SelectItem>
                          <SelectItem value="IB_ADVISOR">Investment Bank Advisor</SelectItem>
                          <SelectItem value="CMA_REGULATOR">CMA Regulator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Company Information (for issuers only) */}
                  {isIssuerRole && (
                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="font-medium">Company Information</h4>
                      
                      <div>
                        <Label htmlFor="company-name">Company Legal Name *</Label>
                        <Input
                          id="company-name"
                          required
                          placeholder="Enter company legal name"
                          value={signUpData.companyName}
                          onChange={(e) => setSignUpData({ ...signUpData, companyName: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="trading-name">Trading Name</Label>
                        <Input
                          id="trading-name"
                          placeholder="Enter trading name (if different)"
                          value={signUpData.tradingName}
                          onChange={(e) => setSignUpData({ ...signUpData, tradingName: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="registration-number">Registration Number</Label>
                        <Input
                          id="registration-number"
                          placeholder="Enter company registration number"
                          value={signUpData.registrationNumber}
                          onChange={(e) => setSignUpData({ ...signUpData, registrationNumber: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="incorporation-date">Incorporation Date</Label>
                        <Input
                          id="incorporation-date"
                          type="date"
                          value={signUpData.incorporationDate}
                          onChange={(e) => setSignUpData({ ...signUpData, incorporationDate: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
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