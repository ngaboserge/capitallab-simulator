/**
 * Section Service
 * 
 * Provides methods for all CRUD operations on application sections
 * Handles auto-save, validation, and completion tracking
 */

import { createClient } from '@/lib/supabase/client'
import type { ApplicationSection } from '@/lib/supabase/types'

export interface SectionWithProfiles extends ApplicationSection {
  completed_by_profile?: {
    id: string
    full_name: string
    email: string
  } | null
  reviewed_by_profile?: {
    id: string
    full_name: string
    email: string
  } | null
}

export interface UpdateSectionData {
  data?: Record<string, any>
  status?: ApplicationSection['status']
  validation_errors?: any[]
  completion_percentage?: number
}

export interface ValidationError {
  field: string
  message: string
  code?: string
}

export class SectionService {
  private supabase = createClient()

  /**
   * Get all sections for an application
   */
  async getSections(applicationId: string): Promise<SectionWithProfiles[]> {
    const { data, error } = await this.supabase
      .from('application_sections')
      .select(`
        *,
        completed_by_profile:profiles!application_sections_completed_by_fkey (
          id,
          full_name,
          email
        ),
        reviewed_by_profile:profiles!application_sections_reviewed_by_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('application_id', applicationId)
      .order('section_number')

    if (error) {
      throw new Error(`Failed to fetch sections: ${error.message}`)
    }

    return (data || []) as SectionWithProfiles[]
  }

  /**
   * Get single section by ID
   */
  async getSectionById(sectionId: string): Promise<SectionWithProfiles | null> {
    const { data, error } = await this.supabase
      .from('application_sections')
      .select(`
        *,
        completed_by_profile:profiles!application_sections_completed_by_fkey (
          id,
          full_name,
          email
        ),
        reviewed_by_profile:profiles!application_sections_reviewed_by_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('id', sectionId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error(`Failed to fetch section: ${error.message}`)
    }

    return data as SectionWithProfiles
  }

  /**
   * Get section by application ID and section number
   */
  async getSectionByNumber(applicationId: string, sectionNumber: number): Promise<SectionWithProfiles | null> {
    const { data, error } = await this.supabase
      .from('application_sections')
      .select(`
        *,
        completed_by_profile:profiles!application_sections_completed_by_fkey (
          id,
          full_name,
          email
        ),
        reviewed_by_profile:profiles!application_sections_reviewed_by_fkey (
          id,
          full_name,
          email
        )
      `)
      .eq('application_id', applicationId)
      .eq('section_number', sectionNumber)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Not found
      }
      throw new Error(`Failed to fetch section: ${error.message}`)
    }

    return data as SectionWithProfiles
  }

  /**
   * Update section data (auto-save)
   */
  async updateSection(sectionId: string, updates: UpdateSectionData): Promise<SectionWithProfiles> {
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    }

    // Only update fields that are provided
    if (updates.data !== undefined) {
      updateData.data = updates.data
    }
    if (updates.status !== undefined) {
      updateData.status = updates.status
    }
    if (updates.validation_errors !== undefined) {
      updateData.validation_errors = updates.validation_errors
    }
    if (updates.completion_percentage !== undefined) {
      updateData.completion_percentage = Math.max(0, Math.min(100, updates.completion_percentage))
    }

    const { data, error } = await this.supabase
      .from('application_sections')
      .update(updateData as any)
      .eq('id', sectionId)
      .select(`
        *,
        completed_by_profile:profiles!application_sections_completed_by_fkey (
          id,
          full_name,
          email
        ),
        reviewed_by_profile:profiles!application_sections_reviewed_by_fkey (
          id,
          full_name,
          email
        )
      `)
      .single()

    if (error) {
      throw new Error(`Failed to update section: ${error.message}`)
    }

    return data as SectionWithProfiles
  }

  /**
   * Update section field (for auto-save on blur)
   */
  async updateSectionField(sectionId: string, fieldPath: string, value: any): Promise<SectionWithProfiles> {
    // Get current section data
    const section = await this.getSectionById(sectionId)
    if (!section) {
      throw new Error('Section not found')
    }

    // Update the specific field in the data object
    const updatedData = { ...(section.data as Record<string, any>) }
    this.setNestedValue(updatedData, fieldPath, value)

    // Calculate completion percentage based on filled fields
    const completionPercentage = this.calculateFieldCompletion(updatedData)

    return this.updateSection(sectionId, {
      data: updatedData,
      completion_percentage: completionPercentage,
      status: completionPercentage > 0 ? 'IN_PROGRESS' : 'NOT_STARTED'
    })
  }

  /**
   * Mark section as complete
   */
  async completeSection(sectionId: string, userId: string): Promise<SectionWithProfiles> {
    const section = await this.getSectionById(sectionId)
    if (!section) {
      throw new Error('Section not found')
    }

    // Validate that section has data
    if (!section.data || Object.keys(section.data).length === 0) {
      throw new Error('Cannot complete empty section')
    }

    // Check for validation errors
    if (section.validation_errors && Array.isArray(section.validation_errors) && section.validation_errors.length > 0) {
      throw new Error('Cannot complete section with validation errors')
    }

    const { data, error } = await this.supabase
      .from('application_sections')
      .update({
        status: 'COMPLETED' as const,
        completion_percentage: 100,
        completed_by: userId,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', sectionId)
      .select(`
        *,
        completed_by_profile:profiles!application_sections_completed_by_fkey (
          id,
          full_name,
          email
        ),
        reviewed_by_profile:profiles!application_sections_reviewed_by_fkey (
          id,
          full_name,
          email
        )
      `)
      .single()

    if (error) {
      throw new Error(`Failed to complete section: ${error.message}`)
    }

    return data as SectionWithProfiles
  }

  /**
   * Validate section data
   */
  validateSection(section: ApplicationSection): ValidationError[] {
    const errors: ValidationError[] = []

    // Basic validation - check if data exists
    if (!section.data || Object.keys(section.data).length === 0) {
      errors.push({
        field: 'data',
        message: 'Section data is required',
        code: 'REQUIRED'
      })
    }

    // Add more validation rules based on section number
    // This is a placeholder - actual validation should be more comprehensive
    
    return errors
  }

  /**
   * Calculate completion percentage based on filled fields
   */
  private calculateFieldCompletion(data: Record<string, any>): number {
    if (!data || Object.keys(data).length === 0) {
      return 0
    }

    const fields = this.flattenObject(data)
    const totalFields = Object.keys(fields).length
    const filledFields = Object.values(fields).filter(value => {
      if (value === null || value === undefined || value === '') {
        return false
      }
      if (Array.isArray(value) && value.length === 0) {
        return false
      }
      if (typeof value === 'object' && Object.keys(value).length === 0) {
        return false
      }
      return true
    }).length

    return totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0
  }

  /**
   * Set nested value in object using dot notation
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    let current = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }

    current[keys[keys.length - 1]] = value
  }

  /**
   * Flatten nested object for field counting
   */
  private flattenObject(obj: any, prefix = ''): Record<string, any> {
    const flattened: Record<string, any> = {}

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key]
        const newKey = prefix ? `${prefix}.${key}` : key

        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          Object.assign(flattened, this.flattenObject(value, newKey))
        } else {
          flattened[newKey] = value
        }
      }
    }

    return flattened
  }

  /**
   * Get section completion summary for an application
   */
  async getSectionCompletionSummary(applicationId: string): Promise<{
    total: number
    completed: number
    in_progress: number
    not_started: number
    completion_percentage: number
  }> {
    const sections = await this.getSections(applicationId)

    const summary = {
      total: sections.length,
      completed: sections.filter(s => s.status === 'COMPLETED').length,
      in_progress: sections.filter(s => s.status === 'IN_PROGRESS').length,
      not_started: sections.filter(s => s.status === 'NOT_STARTED').length,
      completion_percentage: 0
    }

    if (summary.total > 0) {
      const totalCompletion = sections.reduce((sum, s) => sum + (s.completion_percentage || 0), 0)
      summary.completion_percentage = Math.round(totalCompletion / summary.total)
    }

    return summary
  }
}

// Export singleton instance
export const sectionService = new SectionService()
