import { NextRequest, NextResponse } from 'next/server'
import { createTypedServerClient } from '@/lib/supabase/typed-client'

// GET /api/cma/applications/[id]/sections - Get all sections for an application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createTypedServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user has access to this application
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, company_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Check application access
    const { data: application } = await supabase
      .from('ipo_applications')
      .select('company_id, assigned_ib_advisor, assigned_cma_officer, status')
      .eq('id', id)
      .single()

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Verify access based on role
    const hasAccess = 
      (profile as any).role === 'CMA_ADMIN' ||
      ((profile as any).role?.startsWith('ISSUER_') && (application as any).company_id === (profile as any).company_id) ||
      ((profile as any).role === 'IB_ADVISOR' && (application as any).assigned_ib_advisor === user.id) ||
      ((profile as any).role === 'CMA_REGULATOR' && (
        (application as any).assigned_cma_officer === user.id ||
        ['SUBMITTED', 'UNDER_REVIEW', 'CMA_REVIEW', 'QUERY_ISSUED'].includes((application as any).status)
      ))

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Fetch sections without profile joins for now (simpler query)
    const { data: sections, error } = await supabase
      .from('application_sections')
      .select('*')
      .eq('application_id', id)
      .order('section_number')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ sections })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
