"use client"

import React from 'react'
import { useAuth } from '@/lib/supabase/auth-context'
import { AuthForm } from './auth-form'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
  fallback?: React.ReactNode
  allowDemo?: boolean
}

export function ProtectedRoute({ 
  children, 
  allowedRoles, 
  fallback,
  allowDemo = false
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    if (allowDemo) {
      // Allow demo access without authentication
      return <>{children}</>
    }
    return fallback || <AuthForm />
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    if (allowDemo) {
      // Allow demo access even with wrong role
      return <>{children}</>
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Your role: {profile.role.replace('_', ' ')}
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}