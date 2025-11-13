import { createClient } from './client'
import type { Database } from './types'

type Company = Database['public']['Tables']['companies']['Row']
type CompanyInsert = Database['public']['Tables']['companies']['Insert']
type CompanyUpdate = Database['public']['Tables']['companies']['Update']

export class CompanyService {
  private supabase = createClient()

  // Create a new company
  async createCompany(data: CompanyInsert): Promise<{ data: Company | null; error: any }> {
    return await this.supabase
      .from('companies')
      .insert(data)
      .select()
      .single()
  }

  // Get company by ID
  async getCompany(id: string): Promise<{ data: Company | null; error: any }> {
    return await this.supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single()
  }

  // Get user's company
  async getUserCompany(): Promise<{ data: Company | null; error: any }> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: 'Not authenticated' }
    }

    // Get user's profile to find company_id
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single()

    if (!profile?.company_id) {
      return { data: null, error: 'No company associated with user' }
    }

    return await this.getCompany(profile.company_id)
  }

  // Update company
  async updateCompany(id: string, data: CompanyUpdate): Promise<{ data: Company | null; error: any }> {
    return await this.supabase
      .from('companies')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
  }

  // Search companies (for CMA/IB Advisor use)
  async searchCompanies(query: string): Promise<{ data: Company[] | null; error: any }> {
    return await this.supabase
      .from('companies')
      .select('*')
      .or(`legal_name.ilike.%${query}%,trading_name.ilike.%${query}%,registration_number.ilike.%${query}%`)
      .order('legal_name')
  }

  // Get all companies (for CMA use)
  async getAllCompanies(): Promise<{ data: Company[] | null; error: any }> {
    return await this.supabase
      .from('companies')
      .select('*')
      .order('legal_name')
  }

  // Check if registration number is available
  async isRegistrationNumberAvailable(registrationNumber: string, excludeId?: string): Promise<boolean> {
    let query = this.supabase
      .from('companies')
      .select('id')
      .eq('registration_number', registrationNumber)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data } = await query

    return !data || data.length === 0
  }
}