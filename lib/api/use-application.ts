"use client"

/**
 * Application React Hooks
 * 
 * Provides hooks for managing IPO applications with loading/error states
 * Includes optimistic updates and automatic refetching
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSimpleAuth } from '@/lib/auth/simple-auth-context'
import type { IPOApplication, ApplicationSection } from '@/lib/supabase/types'

export interface ApplicationWithDetails extends Omit<IPOApplication, 'assigned_ib_advisor' | 'assigned_cma_officer'> {
  companies?: any
  application_sections?: ApplicationSection[]
  assigned_ib_advisor?: any
  assigned_cma_officer?: any
}

export interface UseApplicationResult {
  application: ApplicationWithDetails | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  updateApplication: (data: Partial<IPOApplication>) => Promise<void>
  recalculateCompletion: () => Promise<void>
}

export interface UseApplicationsResult {
  applications: ApplicationWithDetails[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export interface UseCreateApplicationResult {
  createApplication: (data?: CreateApplicationData) => Promise<ApplicationWithDetails>
  loading: boolean
  error: string | null
}

export interface CreateApplicationData {
  target_amount?: number
  securities_count?: number
  price_per_security?: number
  expected_listing_date?: string
}

/**
 * Hook for fetching and managing a single application
 */
export function useApplication(applicationId: string | null): UseApplicationResult {
  const [application, setApplication] = useState<ApplicationWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchApplication = useCallback(async () => {
    if (!applicationId) {
      setApplication(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/cma/applications/${applicationId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch application')
      }

      setApplication(data.application)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch application'
      setError(errorMessage)
      console.error('Error fetching application:', err)
    } finally {
      setLoading(false)
    }
  }, [applicationId])

  const updateApplication = useCallback(async (data: Partial<IPOApplication>) => {
    if (!applicationId) return

    try {
      setError(null)

      // Optimistic update
      if (application) {
        setApplication({ ...application, ...data })
      }

      const response = await fetch(`/api/cma/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update application')
      }

      setApplication(result.application)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update application'
      setError(errorMessage)
      // Revert optimistic update on error
      await fetchApplication()
      throw err
    }
  }, [applicationId, application, fetchApplication])

  const recalculateCompletion = useCallback(async () => {
    if (!applicationId) return

    try {
      const response = await fetch(`/api/cma/applications/${applicationId}/recalculate-completion`, {
        method: 'POST'
      })

      if (response.ok) {
        await fetchApplication()
      }
    } catch (err) {
      console.error('Error recalculating completion:', err)
    }
  }, [applicationId, fetchApplication])

  useEffect(() => {
    fetchApplication()
  }, [fetchApplication])

  return {
    application,
    loading,
    error,
    refetch: fetchApplication,
    updateApplication,
    recalculateCompletion
  }
}

/**
 * Hook for fetching list of applications with role-based filtering
 */
export function useApplications(): UseApplicationsResult {
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, profile } = useSimpleAuth()

  const fetchApplications = useCallback(async () => {
    if (!user || !profile) {
      setApplications([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/cma/applications')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch applications')
      }

      setApplications(data.applications || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch applications'
      setError(errorMessage)
      console.error('Error fetching applications:', err)
    } finally {
      setLoading(false)
    }
  }, [user, profile])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  return {
    applications,
    loading,
    error,
    refetch: fetchApplications
  }
}

/**
 * Hook for creating new applications
 */
export function useCreateApplication(): UseCreateApplicationResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { profile } = useSimpleAuth()
  const router = useRouter()

  const createApplication = useCallback(async (data?: CreateApplicationData): Promise<ApplicationWithDetails> => {
    if (!profile?.company_id) {
      throw new Error('No company associated with user')
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/cma/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data || {})
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create application')
      }

      return result.application
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create application'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [profile])

  return {
    createApplication,
    loading,
    error
  }
}

/**
 * Hook for updating application with optimistic updates
 */
export function useUpdateApplication(applicationId: string | null) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateApplication = useCallback(async (data: Partial<IPOApplication>) => {
    if (!applicationId) {
      throw new Error('No application ID provided')
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/cma/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update application')
      }

      return result.application
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update application'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [applicationId])

  return {
    updateApplication,
    loading,
    error
  }
}

/**
 * Hook for automatic application initialization on issuer login
 */
export function useIssuerApplication() {
  const { profile, user } = useSimpleAuth()
  const [application, setApplication] = useState<ApplicationWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const initializeApplication = useCallback(async () => {
    if (!user || !profile) {
      setLoading(false)
      return
    }

    // Only for issuer roles
    if (!profile.role.startsWith('ISSUER') && profile.role !== 'ISSUER') {
      setLoading(false)
      return
    }

    if (!profile.company_id) {
      setError('No company associated with user')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Fetch applications for this company
      const response = await fetch('/api/cma/applications')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch applications')
      }

      const applications = data.applications || []

      if (applications.length > 0) {
        // Use existing application
        setApplication(applications[0])
      } else {
        // Create new application automatically
        const createResponse = await fetch('/api/cma/applications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        })

        const createData = await createResponse.json()

        if (!createResponse.ok) {
          throw new Error(createData.error || 'Failed to create application')
        }

        setApplication(createData.application)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize application'
      setError(errorMessage)
      console.error('Error initializing application:', err)
    } finally {
      setLoading(false)
    }
  }, [user, profile])

  useEffect(() => {
    initializeApplication()
  }, [initializeApplication])

  return {
    application,
    loading,
    error,
    refetch: initializeApplication
  }
}
