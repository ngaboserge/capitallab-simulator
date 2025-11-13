import { createTypedClient } from '@/lib/supabase/typed-client'
import type { Database } from '@/lib/supabase/types'

type Company = Database['public']['Tables']['companies']['Row']
type CompanyInsert = Database['public']['Tables']['companies']['Insert']

export class CompanyService {
  private supabase = createTypedClient()

  /**
   * Create a new company for an issuer user
   * @param data Company data
   * @param userId User ID who is creating the company
   * @returns Created company or error
   */
  async createCompany(
    data: {
      legalName: string
      tradingName?: string
      registrationNumber?: string
      incorporationDate?: string
      businessDescription?: string
      industrySector?: string
    },
    userId: string
  ): Promise<{ company: Company | null; error: Error | null }> {
    try {
      // Validate required fields
      if (!data.legalName || !data.legalName.trim()) {
        return {
          company: null,
          error: new Error('Company legal name is required')
        }
      }

      // Check if company with same name already exists
      const { data: existingCompany } = await this.supabase
        .from('companies')
        .select('id, legal_name')
        .eq('legal_name', data.legalName.trim())
        .single()

      if (existingCompany) {
        return {
          company: null,
          error: new Error('A company with this name already exists')
        }
      }

      // Create the company
      const companyData: CompanyInsert = {
        legal_name: data.legalName.trim(),
        trading_name: data.tradingName?.trim() || null,
        registration_number: data.registrationNumber?.trim() || null,
        incorporation_date: data.incorporationDate || null,
        business_description: data.businessDescription?.trim() || null,
        industry_sector: data.industrySector?.trim() || null,
        status: 'ACTIVE',
        created_by: userId
      }

      const { data: company, error } = await this.supabase
        .from('companies')
        .insert(companyData)
        .select()
        .single()

      if (error) {
        console.error('Error creating company:', error)
        return {
          company: null,
          error: new Error(`Failed to create company: ${error.message}`)
        }
      }

      return { company, error: null }
    } catch (error) {
      console.error('Unexpected error creating company:', error)
      return {
        company: null,
        error: error instanceof Error ? error : new Error('Unexpected error creating company')
      }
    }
  }

  /**
   * Get company by ID
   * @param companyId Company ID
   * @returns Company or null
   */
  async getCompany(companyId: string): Promise<Company | null> {
    try {
      const { data, error } = await this.supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single()

      if (error) {
        console.error('Error fetching company:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Unexpected error fetching company:', error)
      return null
    }
  }

  /**
   * Update company information
   * @param companyId Company ID
   * @param data Updated company data
   * @returns Updated company or error
   */
  async updateCompany(
    companyId: string,
    data: Partial<{
      legalName: string
      tradingName: string
      registrationNumber: string
      incorporationDate: string
      businessDescription: string
      industrySector: string
      status: string
    }>
  ): Promise<{ company: Company | null; error: Error | null }> {
    try {
      const updateData: any = {}

      if (data.legalName) updateData.legal_name = data.legalName.trim()
      if (data.tradingName !== undefined) updateData.trading_name = data.tradingName?.trim() || null
      if (data.registrationNumber !== undefined) updateData.registration_number = data.registrationNumber?.trim() || null
      if (data.incorporationDate !== undefined) updateData.incorporation_date = data.incorporationDate || null
      if (data.businessDescription !== undefined) updateData.business_description = data.businessDescription?.trim() || null
      if (data.industrySector !== undefined) updateData.industry_sector = data.industrySector?.trim() || null
      if (data.status) updateData.status = data.status

      const { data: company, error } = await this.supabase
        .from('companies')
        .update(updateData)
        .eq('id', companyId)
        .select()
        .single()

      if (error) {
        console.error('Error updating company:', error)
        return {
          company: null,
          error: new Error(`Failed to update company: ${error.message}`)
        }
      }

      return { company, error: null }
    } catch (error) {
      console.error('Unexpected error updating company:', error)
      return {
        company: null,
        error: error instanceof Error ? error : new Error('Unexpected error updating company')
      }
    }
  }

  /**
   * Generate a unique company ID
   * This is handled automatically by the database, but can be used for validation
   */
  generateCompanyId(): string {
    return crypto.randomUUID()
  }
}
