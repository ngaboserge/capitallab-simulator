/**
 * React hooks for CMA API integration
 * Provides easy-to-use hooks with loading states and error handling
 */

import { useState, useEffect, useCallback } from 'react'
import { cmaApi } from './cma-api-client'
import type { Database } from '@/lib/supabase/types'

type Application = Database['public']['Tables']['ipo_applications']['Row']
type ApplicationSection = Database['public']['Tables']['application_sections']['Row']
type Comment = Database['public']['Tables']['comments']['Row']
type Notification = Database['public']['Tables']['notifications']['Row']

// ============ Applications ============

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await cmaApi.getApplications()
    if (result.error) {
      setError(result.error)
    } else {
      setApplications(result.data?.applications || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  return { applications, loading, error, refetch: fetchApplications }
}

export function useApplication(id: string | null) {
  const [application, setApplication] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchApplication = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const result = await cmaApi.getApplication(id)
    if (result.error) {
      setError(result.error)
    } else {
      setApplication(result.data?.application || null)
    }
    setLoading(false)
  }, [id])

  useEffect(() => {
    fetchApplication()
  }, [fetchApplication])

  return { application, loading, error, refetch: fetchApplication }
}

export function useCreateApplication() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createApplication = async (data: { target_amount?: number }) => {
    setLoading(true)
    setError(null)
    const result = await cmaApi.createApplication(data)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return null
    }
    return result.data?.application || null
  }

  return { createApplication, loading, error }
}

export function useSubmitApplication() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submitApplication = async (id: string) => {
    setLoading(true)
    setError(null)
    const result = await cmaApi.submitApplication(id)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return false
    }
    return true
  }

  return { submitApplication, loading, error }
}

// ============ Sections ============

export function useApplicationSections(applicationId: string | null) {
  const [sections, setSections] = useState<ApplicationSection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSections = useCallback(async () => {
    if (!applicationId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const result = await cmaApi.getApplicationSections(applicationId)
    if (result.error) {
      setError(result.error)
    } else {
      setSections(result.data?.sections || [])
    }
    setLoading(false)
  }, [applicationId])

  useEffect(() => {
    fetchSections()
  }, [fetchSections])

  return { sections, loading, error, refetch: fetchSections }
}

export function useUpdateSection() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateSection = async (
    applicationId: string,
    sectionId: string,
    data: Partial<ApplicationSection>
  ) => {
    setLoading(true)
    setError(null)
    const result = await cmaApi.updateSection(applicationId, sectionId, data)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return null
    }
    return result.data?.section || null
  }

  return { updateSection, loading, error }
}

// ============ IB Advisor ============

export function useIBAdvisors() {
  const [advisors, setAdvisors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAdvisors = async () => {
      setLoading(true)
      setError(null)
      const result = await cmaApi.getIBAdvisors()
      if (result.error) {
        setError(result.error)
      } else {
        setAdvisors(result.data?.advisors || [])
      }
      setLoading(false)
    }
    fetchAdvisors()
  }, [])

  return { advisors, loading, error }
}

export function useAssignIBAdvisor() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const assignIBAdvisor = async (applicationId: string, ibAdvisorId: string) => {
    setLoading(true)
    setError(null)
    const result = await cmaApi.assignIBAdvisor(applicationId, ibAdvisorId)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return false
    }
    return true
  }

  const removeIBAdvisor = async (applicationId: string) => {
    setLoading(true)
    setError(null)
    const result = await cmaApi.removeIBAdvisor(applicationId)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return false
    }
    return true
  }

  return { assignIBAdvisor, removeIBAdvisor, loading, error }
}

// ============ CMA Review ============

export function useCMAReview() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startReview = async (applicationId: string, comment?: string) => {
    setLoading(true)
    setError(null)
    const result = await cmaApi.startReview(applicationId, comment)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return false
    }
    return true
  }

  const issueQuery = async (
    applicationId: string,
    comment: string,
    riskRating?: 'LOW' | 'MEDIUM' | 'HIGH',
    complianceScore?: number
  ) => {
    setLoading(true)
    setError(null)
    const result = await cmaApi.issueQuery(applicationId, comment, riskRating, complianceScore)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return false
    }
    return true
  }

  const approveApplication = async (
    applicationId: string,
    comment: string,
    riskRating?: 'LOW' | 'MEDIUM' | 'HIGH',
    complianceScore?: number
  ) => {
    setLoading(true)
    setError(null)
    const result = await cmaApi.approveApplication(applicationId, comment, riskRating, complianceScore)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return false
    }
    return true
  }

  const rejectApplication = async (
    applicationId: string,
    comment: string,
    riskRating?: 'LOW' | 'MEDIUM' | 'HIGH',
    complianceScore?: number
  ) => {
    setLoading(true)
    setError(null)
    const result = await cmaApi.rejectApplication(applicationId, comment, riskRating, complianceScore)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return false
    }
    return true
  }

  return { startReview, issueQuery, approveApplication, rejectApplication, loading, error }
}

// ============ Comments ============

export function useComments(applicationId: string | null, sectionId?: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchComments = useCallback(async () => {
    if (!applicationId) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const result = await cmaApi.getComments(applicationId, sectionId)
    if (result.error) {
      setError(result.error)
    } else {
      setComments(result.data?.comments || [])
    }
    setLoading(false)
  }, [applicationId, sectionId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  return { comments, loading, error, refetch: fetchComments }
}

export function useAddComment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addComment = async (
    applicationId: string,
    content: string,
    options?: {
      sectionId?: string
      isInternal?: boolean
      parentCommentId?: string
    }
  ) => {
    setLoading(true)
    setError(null)
    const result = await cmaApi.addComment(applicationId, content, options)
    setLoading(false)
    if (result.error) {
      setError(result.error)
      return null
    }
    return result.data?.comment || null
  }

  return { addComment, loading, error }
}

// ============ Notifications ============

export function useNotifications(unreadOnly = false) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await cmaApi.getNotifications(unreadOnly)
    if (result.error) {
      setError(result.error)
    } else {
      setNotifications(result.data?.notifications || [])
    }
    setLoading(false)
  }, [unreadOnly])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const markAsRead = async (notificationIds?: string[]) => {
    const result = await cmaApi.markNotificationsAsRead(notificationIds)
    if (!result.error) {
      fetchNotifications()
    }
    return !result.error
  }

  return { notifications, loading, error, refetch: fetchNotifications, markAsRead }
}
