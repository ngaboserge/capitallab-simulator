import { createClient } from './client'
import type { Database } from './types'

type Application = Database['public']['Tables']['ipo_applications']['Row']
type ApplicationInsert = Database['public']['Tables']['ipo_applications']['Insert']
type ApplicationUpdate = Database['public']['Tables']['ipo_applications']['Update']
type ApplicationSection = Database['public']['Tables']['application_sections']['Row']
type ApplicationSectionInsert = Database['public']['Tables']['application_sections']['Insert']
type ApplicationSectionUpdate = Database['public']['Tables']['application_sections']['Update']
type TeamAssignment = Database['public']['Tables']['team_assignments']['Row']
type TeamAssignmentInsert = Database['public']['Tables']['team_assignments']['Insert']

export class ApplicationService {
  private supabase = createClient()

  // Create a new IPO application
  async createApplication(data: ApplicationInsert): Promise<{ data: Application | null; error: any }> {
    const result = await this.supabase
      .from('ipo_applications')
      .insert(data)
      .select()
      .single()

    if (result.data) {
      // Create default sections for the application
      await this.createDefaultSections(result.data.id)
    }

    return result
  }

  // Get applications for current user based on their role
  async getUserApplications(): Promise<{ data: Application[] | null; error: any }> {
    return await this.supabase
      .from('ipo_applications')
      .select(`
        *,
        companies (
          legal_name,
          trading_name,
          registration_number
        ),
        assigned_ib_advisor:profiles!assigned_ib_advisor (
          full_name,
          email
        ),
        assigned_cma_officer:profiles!assigned_cma_officer (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false })
  }

  // Get specific application with all details
  async getApplication(id: string): Promise<{ data: any | null; error: any }> {
    return await this.supabase
      .from('ipo_applications')
      .select(`
        *,
        companies (*),
        application_sections (*),
        team_assignments (
          *,
          profiles (
            full_name,
            email,
            role
          )
        )
      `)
      .eq('id', id)
      .single()
  }

  // Update application
  async updateApplication(id: string, data: ApplicationUpdate): Promise<{ data: Application | null; error: any }> {
    return await this.supabase
      .from('ipo_applications')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
  }

  // Get application sections
  async getApplicationSections(applicationId: string): Promise<{ data: ApplicationSection[] | null; error: any }> {
    return await this.supabase
      .from('application_sections')
      .select('*')
      .eq('application_id', applicationId)
      .order('section_number')
  }

  // Update section data
  async updateSection(id: string, data: ApplicationSectionUpdate): Promise<{ data: ApplicationSection | null; error: any }> {
    return await this.supabase
      .from('application_sections')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
  }

  // Mark section as completed
  async completeSection(sectionId: string, userId: string, sectionData: any): Promise<{ data: ApplicationSection | null; error: any }> {
    return await this.supabase
      .from('application_sections')
      .update({
        status: 'COMPLETED',
        data: sectionData,
        completed_by: userId,
        completed_at: new Date().toISOString(),
        completion_percentage: 100,
        updated_at: new Date().toISOString()
      })
      .eq('id', sectionId)
      .select()
      .single()
  }

  // Create team assignments
  async createTeamAssignments(applicationId: string, assignments: TeamAssignmentInsert[]): Promise<{ data: TeamAssignment[] | null; error: any }> {
    const assignmentsWithAppId = assignments.map(assignment => ({
      ...assignment,
      application_id: applicationId
    }))

    return await this.supabase
      .from('team_assignments')
      .insert(assignmentsWithAppId)
      .select(`
        *,
        profiles (
          full_name,
          email,
          role
        )
      `)
  }

  // Get team assignments for application
  async getTeamAssignments(applicationId: string): Promise<{ data: any[] | null; error: any }> {
    return await this.supabase
      .from('team_assignments')
      .select(`
        *,
        profiles (
          full_name,
          email,
          role
        )
      `)
      .eq('application_id', applicationId)
      .eq('is_active', true)
  }

  // Subscribe to real-time updates for an application
  subscribeToApplication(applicationId: string, callback: (payload: any) => void) {
    return this.supabase
      .channel(`application_${applicationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'application_sections',
          filter: `application_id=eq.${applicationId}`
        },
        callback
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ipo_applications',
          filter: `id=eq.${applicationId}`
        },
        callback
      )
      .subscribe()
  }

  // Private method to create default sections
  private async createDefaultSections(applicationId: string) {
    const defaultSections = [
      { section_number: 1, section_title: 'Company Identity & Legal Form', assigned_role: 'ISSUER_CEO' },
      { section_number: 2, section_title: 'Capitalization & Financial Strength', assigned_role: 'ISSUER_CFO' },
      { section_number: 3, section_title: 'Share Ownership & Distribution', assigned_role: 'ISSUER_CFO' },
      { section_number: 4, section_title: 'Governance & Management', assigned_role: 'ISSUER_SECRETARY' },
      { section_number: 5, section_title: 'Legal & Regulatory Compliance', assigned_role: 'ISSUER_LEGAL' },
      { section_number: 6, section_title: 'Offer Details (IPO Information)', assigned_role: 'ISSUER_CFO' },
      { section_number: 7, section_title: 'Prospectus & Disclosure Checklist', assigned_role: 'ISSUER_CEO' },
      { section_number: 8, section_title: 'Publication & Advertisement', assigned_role: 'ISSUER_SECRETARY' },
      { section_number: 9, section_title: 'Post-Approval Undertakings', assigned_role: 'ISSUER_LEGAL' },
      { section_number: 10, section_title: 'Declarations & Contacts', assigned_role: 'ISSUER_CEO' }
    ]

    const sectionsToInsert = defaultSections.map(section => ({
      application_id: applicationId,
      ...section
    }))

    await this.supabase
      .from('application_sections')
      .insert(sectionsToInsert)
  }

  // Calculate application progress
  async calculateProgress(applicationId: string): Promise<{ completionPercentage: number; completedSections: number }> {
    const { data: sections } = await this.getApplicationSections(applicationId)
    
    if (!sections) return { completionPercentage: 0, completedSections: 0 }

    const completedSections = sections.filter(section => section.status === 'COMPLETED').length
    const completionPercentage = Math.round((completedSections / sections.length) * 100)

    // Update the application with new progress
    await this.updateApplication(applicationId, {
      completion_percentage: completionPercentage
    })

    return { completionPercentage, completedSections }
  }

  // Get all applications (for CMA regulators)
  async getAllApplications() {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) {
      return { data: null, error: new Error('Not authenticated') }
    }

    // Check if user is CMA regulator or admin
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['CMA_REGULATOR', 'CMA_ADMIN'].includes(profile.role)) {
      return { data: null, error: new Error('Unauthorized - CMA access required') }
    }

    return await this.supabase
      .from('ipo_applications')
      .select(`
        *,
        companies (
          legal_name,
          trading_name
        )
      `)
      .order('created_at', { ascending: false })
  }

  // Update application status (for CMA regulators)
  async updateApplicationStatus(applicationId: string, status: string, comment?: string) {
    const { data: { user } } = await this.supabase.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }

    // Check if user is CMA regulator or admin
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['CMA_REGULATOR', 'CMA_ADMIN'].includes(profile.role)) {
      throw new Error('Unauthorized - CMA access required')
    }

    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    // Set assigned CMA officer if not already set
    if (status === 'UNDER_REVIEW') {
      updateData.assigned_cma_officer = user.id
    }

    const { error } = await this.supabase
      .from('ipo_applications')
      .update(updateData)
      .eq('id', applicationId)

    if (error) {
      throw error
    }

    // If there's a comment, create a review record
    if (comment) {
      await this.supabase
        .from('comments')
        .insert({
          application_id: applicationId,
          author_id: user.id,
          content: comment,
          is_internal: true
        })
    }

    return { success: true }
  }
}