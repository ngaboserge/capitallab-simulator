import { NextRequest, NextResponse } from 'next/server'
import { createTypedServerClient } from '@/lib/supabase/typed-client'

// GET /api/cma/applications/[id] - Get specific application with all details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createTypedServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First get the application - cast to any to bypass type issues
    const { data: application, error } = await supabase
      .from('ipo_applications')
      .select('*')
      .eq('id', id)
      .single() as any

    if (error) {
      console.error('Error fetching application:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Get company data
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', application.company_id)
      .single() as any

    // Get sections
    const { data: sections } = await supabase
      .from('application_sections')
      .select('*')
      .eq('application_id', id) as any

    // Get IB advisor profile if assigned
    let ibAdvisor = null
    if (application.assigned_ib_advisor) {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('id', application.assigned_ib_advisor)
        .single() as any
      ibAdvisor = data
    }

    // Get CMA officer profile if assigned
    let cmaOfficer = null
    if (application.assigned_cma_officer) {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, role')
        .eq('id', application.assigned_cma_officer)
        .single() as any
      cmaOfficer = data
    }

    // Combine all data
    const fullApplication = {
      ...application,
      companies: company,
      application_sections: sections || [],
      assigned_ib_advisor: ibAdvisor,
      assigned_cma_officer: cmaOfficer
    }

    // Check access permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, company_id')
      .eq('id', user.id)
      .single() as any

    const userRole = profile?.role
    const hasAccess = 
      userRole === 'CMA_ADMIN' ||
      userRole === 'CMA_REGULATOR' ||
      (userRole?.startsWith('ISSUER_') && fullApplication.company_id === profile?.company_id) ||
      (userRole === 'IB_ADVISOR' && fullApplication.assigned_ib_advisor === user.id)

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ application: fullApplication })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/cma/applications/[id] - Update application
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const supabase = await createTypedServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, company_id')
      .eq('id', user.id)
      .single() as any

    // Get application to check permissions
    const { data: application } = await supabase
      .from('ipo_applications')
      .select('company_id, assigned_ib_advisor, assigned_cma_officer')
      .eq('id', id)
      .single() as any

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Check permissions based on what's being updated
    const userRole = profile?.role
    const canUpdate = 
      userRole === 'CMA_ADMIN' ||
      (userRole?.startsWith('ISSUER_') && application.company_id === profile?.company_id) ||
      (userRole === 'IB_ADVISOR' && application.assigned_ib_advisor === user.id) ||
      (userRole === 'CMA_REGULATOR' && application.assigned_cma_officer === user.id)

    if (!canUpdate) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { data: updated, error } = await supabase
      .from('ipo_applications')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single() as any

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ application: updated })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
