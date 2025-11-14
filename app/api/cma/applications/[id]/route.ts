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

    const { data: application, error } = await supabase
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
        ),
        team_assignments (
          *,
          profiles (
            id,
            full_name,
            email,
            role
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Check access permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, company_id')
      .eq('id', user.id)
      .single()

    const hasAccess = 
      profile?.role === 'CMA_ADMIN' ||
      profile?.role === 'CMA_REGULATOR' ||
      (profile?.role.startsWith('ISSUER_') && application.company_id === profile.company_id) ||
      (profile?.role === 'IB_ADVISOR' && application.assigned_ib_advisor === user.id)

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ application })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
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
      .single()

    // Get application to check permissions
    const { data: application } = await supabase
      .from('ipo_applications')
      .select('company_id, assigned_ib_advisor, assigned_cma_officer')
      .eq('id', id)
      .single()

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Check permissions based on what's being updated
    const canUpdate = 
      profile?.role === 'CMA_ADMIN' ||
      (profile?.role.startsWith('ISSUER_') && application.company_id === profile.company_id) ||
      (profile?.role === 'IB_ADVISOR' && application.assigned_ib_advisor === user.id) ||
      (profile?.role === 'CMA_REGULATOR' && application.assigned_cma_officer === user.id)

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
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ application: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
