/**
 * CMA IPO Application System API Client
 * Handles all backend API calls with proper error handling and type safety
 */

import type { Database } from '@/lib/supabase/types'

type Application = Database['public']['Tables']['ipo_applications']['Row']
type ApplicationSection = Database['public']['Tables']['application_sections']['Row']
type Comment = Database['public']['Tables']['comments']['Row']
type Notification = Database['public']['Tables']['notifications']['Row']

interface ApiResponse<T> {
  data?: T
  error?: string
}

class CMAApiClient {
  private baseUrl = '/api/cma'

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || 'An error occurred' }
      }

      return { data }
    } catch (error: any) {
      return { error: error.message || 'Network error' }
    }
  }

  // ============ Applications ============

  async getApplications() {
    return this.request<{ applications: Application[] }>('/applications')
  }

  async getApplication(id: string) {
    return this.request<{ application: any }>(`/applications/${id}`)
  }

  async createApplication(data: { target_amount?: number }) {
    return this.request<{ application: Application }>('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateApplication(id: string, data: Partial<Application>) {
    return this.request<{ application: Application }>(`/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async submitApplication(id: string) {
    return this.request<{ application: Application; message: string }>(
      `/applications/${id}/submit`,
      { method: 'POST' }
    )
  }

  // ============ Sections ============

  async getApplicationSections(applicationId: string) {
    return this.request<{ sections: ApplicationSection[] }>(
      `/applications/${applicationId}/sections`
    )
  }

  async updateSection(
    applicationId: string,
    sectionId: string,
    data: Partial<ApplicationSection>
  ) {
    return this.request<{ section: ApplicationSection }>(
      `/applications/${applicationId}/sections/${sectionId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    )
  }

  // ============ IB Advisor Assignment ============

  async assignIBAdvisor(applicationId: string, ibAdvisorId: string) {
    return this.request<{ application: Application; message: string }>(
      `/applications/${applicationId}/assign-ib`,
      {
        method: 'POST',
        body: JSON.stringify({ ib_advisor_id: ibAdvisorId }),
      }
    )
  }

  async removeIBAdvisor(applicationId: string) {
    return this.request<{ application: Application; message: string }>(
      `/applications/${applicationId}/assign-ib`,
      { method: 'DELETE' }
    )
  }

  async getIBAdvisors() {
    return this.request<{ advisors: any[] }>('/ib-advisors')
  }

  // ============ CMA Review ============

  async startReview(applicationId: string, comment?: string) {
    return this.request<{ application: Application; review: any; message: string }>(
      `/applications/${applicationId}/review`,
      {
        method: 'POST',
        body: JSON.stringify({ action: 'START_REVIEW', comment }),
      }
    )
  }

  async issueQuery(
    applicationId: string,
    comment: string,
    riskRating?: 'LOW' | 'MEDIUM' | 'HIGH',
    complianceScore?: number
  ) {
    return this.request<{ application: Application; review: any; message: string }>(
      `/applications/${applicationId}/review`,
      {
        method: 'POST',
        body: JSON.stringify({
          action: 'ISSUE_QUERY',
          comment,
          risk_rating: riskRating,
          compliance_score: complianceScore,
        }),
      }
    )
  }

  async approveApplication(
    applicationId: string,
    comment: string,
    riskRating?: 'LOW' | 'MEDIUM' | 'HIGH',
    complianceScore?: number
  ) {
    return this.request<{ application: Application; review: any; message: string }>(
      `/applications/${applicationId}/review`,
      {
        method: 'POST',
        body: JSON.stringify({
          action: 'APPROVE',
          comment,
          risk_rating: riskRating,
          compliance_score: complianceScore,
        }),
      }
    )
  }

  async rejectApplication(
    applicationId: string,
    comment: string,
    riskRating?: 'LOW' | 'MEDIUM' | 'HIGH',
    complianceScore?: number
  ) {
    return this.request<{ application: Application; review: any; message: string }>(
      `/applications/${applicationId}/review`,
      {
        method: 'POST',
        body: JSON.stringify({
          action: 'REJECT',
          comment,
          risk_rating: riskRating,
          compliance_score: complianceScore,
        }),
      }
    )
  }

  // ============ Comments ============

  async getComments(applicationId: string, sectionId?: string) {
    const url = sectionId
      ? `/applications/${applicationId}/comments?section_id=${sectionId}`
      : `/applications/${applicationId}/comments`
    return this.request<{ comments: Comment[] }>(url)
  }

  async addComment(
    applicationId: string,
    content: string,
    options?: {
      sectionId?: string
      isInternal?: boolean
      parentCommentId?: string
    }
  ) {
    return this.request<{ comment: Comment }>(
      `/applications/${applicationId}/comments`,
      {
        method: 'POST',
        body: JSON.stringify({
          content,
          section_id: options?.sectionId,
          is_internal: options?.isInternal,
          parent_comment_id: options?.parentCommentId,
        }),
      }
    )
  }

  // ============ Notifications ============

  async getNotifications(unreadOnly = false, limit = 50) {
    return this.request<{ notifications: Notification[] }>(
      `/notifications?unread_only=${unreadOnly}&limit=${limit}`
    )
  }

  async markNotificationsAsRead(notificationIds?: string[]) {
    return this.request<{ message: string }>('/notifications', {
      method: 'PATCH',
      body: JSON.stringify({
        notification_ids: notificationIds,
        mark_all: !notificationIds,
      }),
    })
  }
}

// Export singleton instance
export const cmaApi = new CMAApiClient()

// Export class for testing or custom instances
export { CMAApiClient }
