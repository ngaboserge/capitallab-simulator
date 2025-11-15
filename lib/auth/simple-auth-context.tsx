"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createTypedClient } from '@/lib/supabase/typed-client'
import type { Profile } from '@/lib/supabase/types'

interface User {
  id: string
  email: string
  username: string
  fullName: string | null
  role: string
  companyId: string | null
}

interface SimpleAuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  error: string | null
  login: (username: string, password: string) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

export interface SignupData {
  username: string
  password: string
  email: string
  fullName?: string
  role: 'ISSUER' | 'IB_ADVISOR' | 'CMA_REGULATOR' | 'CMA_ADMIN'
  companyName?: string
  companyRole?: string
  ibAdvisorProfile?: any // For IB Advisor registration
}

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined)

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createTypedClient()

  const fetchSession = useCallback(async () => {
    console.log('fetchSession: Starting session fetch...');
    try {
      // First check localStorage for session (for CMA Regulator, IB Advisor, etc.)
      const localSession = localStorage.getItem('auth_session');
      if (localSession) {
        try {
          const sessionData = JSON.parse(localSession);
          if (sessionData.profile) {
            console.log('fetchSession: Found session in localStorage:', sessionData.profile.role);
            setUser({
              id: sessionData.profile.id,
              email: sessionData.profile.email,
              username: sessionData.profile.username || sessionData.profile.full_name,
              fullName: sessionData.profile.full_name,
              role: sessionData.profile.role,
              companyId: sessionData.profile.company_id || null
            });
            setProfile(sessionData.profile);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error('fetchSession: Error parsing localStorage session:', e);
        }
      }

      // If no localStorage session, try API (for database users)
      const response = await fetch('/api/auth/session')
      const data = await response.json()
      
      console.log('fetchSession: API Response received:', { 
        status: response.status, 
        hasUser: !!data.user, 
        hasProfile: !!data.profile,
        error: data.error 
      });

      if (data.user && data.profile) {
        setUser(data.user)
        setProfile(data.profile)
        console.log('fetchSession: User and profile set from API successfully');
      } else {
        setUser(null)
        setProfile(null)
        console.log('fetchSession: No user or profile found, setting to null');
      }
    } catch (err) {
      console.error('fetchSession: Error fetching session:', err)
      setUser(null)
      setProfile(null)
    } finally {
      setLoading(false)
      console.log('fetchSession: Loading set to false');
    }
  }, [])

  const refreshSession = useCallback(async () => {
    await fetchSession()
  }, [fetchSession])

  const login = useCallback(async (emailOrUsername: string, password: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: emailOrUsername, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      setUser(data.user)
      
      // Fetch full profile
      await fetchSession()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [fetchSession])

  const signup = useCallback(async (data: SignupData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Signup failed')
      }

      // Auto-login after signup using email
      await login(data.email, data.password)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [login])

  const logout = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Clear localStorage session first (for CMA Regulator, IB Advisor, etc.)
      localStorage.removeItem('auth_session');
      console.log('logout: Cleared auth_session from localStorage');

      // Then call API logout (for database users)
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      })

      if (!response.ok) {
        console.warn('logout: API logout failed, but localStorage cleared');
      }

      setUser(null)
      setProfile(null)
      console.log('logout: User and profile cleared');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed'
      console.error('logout: Error during logout:', errorMessage);
      setError(errorMessage)
      // Still clear local state even if API fails
      setUser(null)
      setProfile(null)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Initialize session on mount
  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await fetchSession()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth, fetchSession])

  const value = {
    user,
    profile,
    loading,
    error,
    login,
    signup,
    logout,
    refreshSession
  }

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  )
}

export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext)
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider')
  }
  return context
}
