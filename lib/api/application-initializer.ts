/**
 * Application Initializer
 * 
 * Handles automatic application creation and initialization for issuer users
 * Ensures that issuers always have an application to work with
 */

import { createTypedClient } from '@/lib/supabase/typed-client'
import type { IPOApplication } from '@/lib/supabase/types'

export interface ApplicationInitializerResult {
  application: IPOApplication | null
  isNew: boolean
  error: string | null
}

/**
 * Check for existing application or create new one for issuer
 */
export async function initializeIssuerApplication(
  companyId: string
): Promise<ApplicationInitializerResult> {
  const supabase = createTypedClient()

  try {
    // Check if application already exists for this company
    const { data: existingApplications, error: fetchError } = await supabase
      .from('ipo_applications')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(1) as any

    if (fetchError) {
      return {
        application: null,
        isNew: false,
        error: `Failed to check for existing applications: ${fetchError.message}`
      }
    }

    // If application exists, return it
    if (existingApplications && existingApplications.length > 0) {
      return {
        application: existingApplications[0],
        isNew: false,
        error: null
      }
    }

    // Create new application
    const { data: newApplication, error: createError } = await supabase
      .from('ipo_applications')
      .insert({
        company_id: companyId,
        status: 'DRAFT' as const,
        current_phase: 'DATA_COLLECTION' as const,
        completion_percentage: 0,
        priority: 'MEDIUM' as const
      } as any)
      .select()
      .single()

    if (createError) {
      return {
        application: null,
        isNew: false,
        error: `Failed to create application: ${createError.message}`
      }
    }

    // Initialize all 10 sections with NOT_STARTED status
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
      application_id: newApplication.id,
      section_number: section.section_number,
      section_title: section.section_title,
      status: 'NOT_STARTED' as const,
      data: {},
      validation_errors: [],
      completion_percentage: 0
    }))

    const { error: sectionsError } = await supabase
      .from('application_sections')
      .insert(sectionsToInsert as any)

    if (sectionsError) {
      // Rollback: delete the application if sections fail
      await supabase
        .from('ipo_applications')
        .delete()
        .eq('id', newApplication.id)

      return {
        application: null,
        isNew: false,
        error: `Failed to initialize sections: ${sectionsError.message}`
      }
    }

    return {
      application: newApplication,
      isNew: true,
      error: null
    }
  } catch (error) {
    return {
      application: null,
      isNew: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Get or create application via API endpoint
 */
export async function getOrCreateApplication(): Promise<{
  application: any
  isNew: boolean
  error: string | null
}> {
  try {
    // First, try to get existing applications
    const listResponse = await fetch('/api/cma/applications')
    const listData = await listResponse.json()

    if (listResponse.ok && listData.applications && listData.applications.length > 0) {
      return {
        application: listData.applications[0],
        isNew: false,
        error: null
      }
    }

    // If no applications exist, create one
    const createResponse = await fetch('/api/cma/applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })

    const createData = await createResponse.json()

    if (!createResponse.ok) {
      return {
        application: null,
        isNew: false,
        error: createData.error || 'Failed to create application'
      }
    }

    return {
      application: createData.application,
      isNew: true,
      error: null
    }
  } catch (error) {
    return {
      application: null,
      isNew: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Check if all sections are initialized for an application
 */
export async function validateSectionInitialization(applicationId: string): Promise<{
  isValid: boolean
  missingSections: number[]
  error: string | null
}> {
  const supabase = createTypedClient()

  try {
    const { data: sections, error } = await supabase
      .from('application_sections')
      .select('section_number')
      .eq('application_id', applicationId)
      .order('section_number') as any

    if (error) {
      return {
        isValid: false,
        missingSections: [],
        error: `Failed to validate sections: ${error.message}`
      }
    }

    const existingSectionNumbers = sections?.map((s: any) => s.section_number) || []
    const expectedSections = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const missingSections = expectedSections.filter(
      num => !existingSectionNumbers.includes(num)
    )

    return {
      isValid: missingSections.length === 0,
      missingSections,
      error: null
    }
  } catch (error) {
    return {
      isValid: false,
      missingSections: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}
