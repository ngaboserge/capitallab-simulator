import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

// GET /api/cma/applications/[id]/sections - Get all sections for an application
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
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
      .eq('id', params.id)
      .single()

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Verify access based on role
    const hasAccess = 
      (profile as any).role === 'CMA_ADMIN' ||
      ((profile as any).role === 'ISSUER' && (application as any).company_id === (profile as any).company_id) ||
      ((profile as any).role === 'IB_ADVISOR' && (application as any).assigned_ib_advisor === user.id) ||
      ((profile as any).role === 'CMA_REGULATOR' && (
        (application as any).assigned_cma_officer === user.id ||
        ['SUBMITTED', 'UNDER_REVIEW', 'CMA_REVIEW', 'QUERY_ISSUED'].includes((application as any).status)
      ))

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { data: sections, error } = await supabase
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
      .eq('application_id', params.id)
      .order('section_number')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ sections })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
