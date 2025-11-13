/**
 * Application Service
 * 
 * Provides methods for all CRUD operations on IPO applications
 * Handles role-based filtering, section initialization, and completion tracking
 */

import { createTypedClient } from '@/lib/supabase/typed-client'
import type { IPOApplication, ApplicationSection, Profile } from '@/lib/supabase/types'

export interface ApplicationWithDetails extends Omit<IPOApplication, 'assigned_ib_advisor' | 'assigned_cma_officer'> {
  companies?: any
  application_sections?: ApplicationSection[]
  assigned_ib_advisor?: Profile | string | null
  assigned_cma_officer?: Profile | string | null
}

export interface CreateApplicationData {
  target_amount?: number
  securities_count?: number
  price_per_security?: number
  expected_listing_date?: string
}

export interface UpdateApplicationData {
  status?: IPOApplication['status']
  current_phase?: IPOApplication['current_phase']
  completion_percentage?: number
  target_amount?: number
  securities_count?: number
  price_per_security?: number
  assigned_ib_advisor?: string
  assigned_cma_officer?: string
  priority?: IPOApplication['priority']
  expected_listing_date?: string
}

export class ApplicationService {
  private supabase = createTypedClient()

  /**
   * Get applications filtered by user role
   */
  async getApplicationsByRole(userId: string, role: string, companyId?: string | null): Promise<ApplicationWithDetails[]> {
    let query = this.supabase
      .from('ipo_applications')
      .select(`
        *,
        companies (
          legal_name,
          trading_name,
          registration_number
        ),
        assigned_ib_advisor:profiles!ipo_applications_assigned_ib_advisor_fkey (
          id,
          full_name,
          email
        ),
        assigned_cma_officer:profiles!ipo_applications_assigned_cma_officer_fkey (
          id,
          full_name,
          email
        )
      `) as any

    // Apply role-based filtering
    if (role.startsWith('ISSUER_') || role === 'ISSUER') {
      if (!companyId) {
        throw new Error('Company ID required for issuer role')
      }
      query = query.eq('company_id', companyId)
    } else if (role === 'IB_ADVISOR') {
      query = query.eq('assigned_ib_advisor', userId)
    } else if (role === 'CMA_REGULATOR') {
      query = query.or(`assigned_cma_officer.eq.${userId},status.in.(SUBMITTED,UNDER_REVIEW,QUERY_ISSUED)`)
    }
    // CMA_ADMIN sees all applications (no filter)

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch applications: ${error.message}`)
    }

    return data || []
  }

  /**
   * Get single application by ID with full details
   */
  async getApplicationById(id: string): Promise<ApplicationWithDetails | null> {
    const { data, error } = await this.supabase
      .from('ipo_applications')
      .select(`
        *,
        companies (*),
        application_sections (*),
        assigned_ib_advisor:profiles!ipo_applications_assigned_ib_advisor_fkey (
          id,
          full_name,
          email,
          role
        ),
        assigned_cma_officer:profiles!ipo_applications_assigned_cma_officer_fkey (
          id,
          full_name,
          email,
          role
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error(`Failed to fetch application: ${error.message}`)
    }

    return data as ApplicationWithDetails
  }

  /**
   * Create new application with automatic section initialization
   */
  async createApplication(companyId: string, data?: CreateApplicationData): Promise<ApplicationWithDetails> {
    // Create application
    const { data: application, error: appError } = await this.supabase
      .from('ipo_applications')
      .insert({
        company_id: companyId,
        status: 'DRAFT' as const,
        current_phase: 'DATA_COLLECTION' as const,
        completion_percentage: 0,
        priority: 'MEDIUM' as const,
        target_amount: data?.target_amount || null,
        securities_count: data?.securities_count || null,
        price_per_security: data?.price_per_security || null,
        expected_listing_date: data?.expected_listing_date || null
      } as any)
      .select()
      .single()

    if (appError) {
      throw new Error(`Failed to create application: ${appError.message}`)
    }

    // Initialize all 10 sections
    const defaultSections = [
      { section_number: 1, section_title: 'Company Identity & Legal Form' },
      { section_number: 2, section_title: 'Capitalization & Financial Strength' },
      { section_number: 3, section_title: 'Share Ownership & Distribution' },
      { section_number: 4, section_title: 'Governance & Management' },
      { section_number: 5, section_title: 'Legal & Regulatory Compliance' },
      { section_number: 6, section_title: 'Offer Details (IPO Information)' },
      { section_number: 7, section_title: 'Prospectus & Disclosure Checklist' },
      { section_number: 8, section_title: 'Publication & Advertisement' },
      { section_number: 9, section_title: 'Post-Approval Undertakings' },
      { section_number: 10, section_title: 'Declarations & Contacts' }
    ]

    const sectionsToInsert = defaultSections.map(section => ({
      application_id: application.id,
      section_number: section.section_number,
      section_title: section.section_title,
      status: 'NOT_STARTED' as const,
      data: {},
      validation_errors: [],
      completion_percentage: 0
    }))

    const { error: sectionsError } = await this.supabase
      .from('application_sections')
      .insert(sectionsToInsert as any)

    if (sectionsError) {
      // Rollback application creation if sections fail
      await this.supabase.from('ipo_applications').delete().eq('id', application.id)
      throw new Error(`Failed to initialize sections: ${sectionsError.message}`)
    }

    // Return full application with sections
    return this.getApplicationById(application.id) as Promise<ApplicationWithDetails>
  }

  /**
   * Update application with optimistic locking
   */
  async updateApplication(id: string, data: UpdateApplicationData, expectedUpdatedAt?: string): Promise<ApplicationWithDetails> {
    // If optimistic locking is enabled, check updated_at
    if (expectedUpdatedAt) {
      const { data: current } = await this.supabase
        .from('ipo_applications')
        .select('updated_at')
        .eq('id', id)
        .single() as any

      if (current && current.updated_at !== expectedUpdatedAt) {
        throw new Error('Application has been modified by another user. Please refresh and try again.')
      }
    }

    const { data: updated, error } = await this.supabase
      .from('ipo_applications')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update application: ${error.message}`)
    }

    // Return full application with details
    return this.getApplicationById(id) as Promise<ApplicationWithDetails>
  }

  /**
   * Calculate completion percentage based on section status
   */
  async calculateCompletionPercentage(applicationId: string): Promise<number> {
    const { data: sections, error } = await this.supabase
      .from('application_sections')
      .select('status, completion_percentage')
      .eq('application_id', applicationId) as any

    if (error) {
      throw new Error(`Failed to fetch sections: ${error.message}`)
    }

    if (!sections || sections.length === 0) {
      return 0
    }

    // Calculate average completion across all sections
    const totalCompletion = sections.reduce((sum: number, section: any) => {
      return sum + (section.completion_percentage || 0)
    }, 0)

    const percentage = Math.round(totalCompletion / sections.length)

    // Update application with new percentage
    await this.supabase
      .from('ipo_applications')
      .update({ 
        completion_percentage: percentage,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', applicationId)

    return percentage
  }

  /**
   * Check if user has access to application
   */
  async checkAccess(applicationId: string, userId: string, role: string, companyId?: string | null): Promise<boolean> {
    const { data: application } = await this.supabase
      .from('ipo_applications')
      .select('company_id, assigned_ib_advisor, assigned_cma_officer, status')
      .eq('id', applicationId)
      .single() as any

    if (!application) {
      return false
    }

    // Check access based on role
    if (role === 'CMA_ADMIN') {
      return true
    }

    if (role === 'CMA_REGULATOR') {
      return application.assigned_cma_officer === userId || 
             ['SUBMITTED', 'UNDER_REVIEW', 'QUERY_ISSUED'].includes(application.status)
    }

    if (role.startsWith('ISSUER_') || role === 'ISSUER') {
      return application.company_id === companyId
    }

    if (role === 'IB_ADVISOR') {
      return application.assigned_ib_advisor === userId
    }

    return false
  }

  /**
   * Get or create application for issuer (automatic initialization)
   */
  async getOrCreateApplicationForIssuer(companyId: string): Promise<ApplicationWithDetails> {
    // Check if application already exists
    const { data: existing } = await this.supabase
      .from('ipo_applications')
      .select('id')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single() as any

    if (existing) {
      return this.getApplicationById(existing.id) as Promise<ApplicationWithDetails>
    }

    // Create new application
    return this.createApplication(companyId)
  }

  /**
   * Delete application (admin only)
   */
  async deleteApplication(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('ipo_applications')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete application: ${error.message}`)
    }
  }
}

// Export singleton instance
export const applicationService = new ApplicationService()
