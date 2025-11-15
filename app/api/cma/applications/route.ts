import { NextRequest, NextResponse } from 'next/server'
import { createTypedServerClient } from '@/lib/supabase/typed-client'

// GET /api/cma/applications - Get applications based on user role
export async function GET(request: NextRequest) {
  try {
    const supabase = await createTypedServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile to determine role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, company_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    let query = supabase
      .from('ipo_applications')
      .select(`
        *,
        companies!ipo_applications_company_id_fkey (
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

    // Check for company_id query parameter
    const searchParams = request.nextUrl.searchParams
    const companyIdParam = searchParams.get('company_id')

    // Filter based on role
    if (profile.role?.startsWith('ISSUER_')) {
      // Issuer sees only their company's applications
      query = query.eq('company_id', companyIdParam || profile.company_id)
    } else if (profile.role === 'IB_ADVISOR') {
      // IB Advisor sees applications assigned to them
      query = query.eq('assigned_ib_advisor', user.id)
    } else if (profile.role === 'CMA_REGULATOR') {
      // CMA Regulator sees applications assigned to them
      query = query.eq('assigned_cma_officer', user.id)
    } else if (profile.role === 'CMA_ADMIN') {
      // CMA Admin sees all applications
      // No filter needed
    }

    const { data: applications, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ applications })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/cma/applications - Create new application (Issuer only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createTypedServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, company_id')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'ISSUER') {
      return NextResponse.json({ error: 'Only issuers can create applications' }, { status: 403 })
    }

    if (!profile.company_id) {
      return NextResponse.json({ error: 'No company associated with user' }, { status: 400 })
    }

    const body = await request.json()

    // Create application
    const { data: application, error } = await supabase
      .from('ipo_applications')
      .insert({
        company_id: profile.company_id,
        status: 'DRAFT' as const,
        current_phase: 'DATA_COLLECTION',
        completion_percentage: 0,
        target_amount: body.target_amount || null
      } as any)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create default sections
    const defaultSections = [
      { section_number: 1, section_title: 'Company Identity & Legal Form', assigned_role: 'CEO' },
      { section_number: 2, section_title: 'Capitalization & Financial Strength', assigned_role: 'CFO' },
      { section_number: 3, section_title: 'Share Ownership & Distribution', assigned_role: 'CFO' },
      { section_number: 4, section_title: 'Governance & Management', assigned_role: 'SECRETARY' },
      { section_number: 5, section_title: 'Legal & Regulatory Compliance', assigned_role: 'LEGAL_ADVISOR' },
      { section_number: 6, section_title: 'Offer Details (IPO Information)', assigned_role: 'CFO' },
      { section_number: 7, section_title: 'Prospectus & Disclosure Checklist', assigned_role: 'CEO' },
      { section_number: 8, section_title: 'Publication & Advertisement', assigned_role: 'SECRETARY' },
      { section_number: 9, section_title: 'Post-Approval Undertakings', assigned_role: 'LEGAL_ADVISOR' },
      { section_number: 10, section_title: 'Declarations & Contacts', assigned_role: 'CEO' }
    ]

    const sectionsToInsert = defaultSections.map(section => ({
      application_id: application.id,
      ...section,
      status: 'NOT_STARTED' as const,
      data: {}
    }))

    await supabase.from('application_sections').insert(sectionsToInsert as any)

    return NextResponse.json({ application }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
