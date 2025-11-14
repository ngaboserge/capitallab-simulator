import { NextRequest, NextResponse } from 'next/server'
import { createTypedServerClient } from '@/lib/supabase/typed-client'

// GET /api/cma/applications/[id]/sections/[sectionId] - Get single section
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { id, sectionId } = await params;
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

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get section with application details
    const { data: section, error } = await supabase
      .from('application_sections')
      .select(`
        *,
        ipo_applications!inner(
          company_id,
          assigned_ib_advisor,
          assigned_cma_officer,
          status
        ),
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
      .eq('id', params.sectionId)
      .eq('application_id', params.id)
      .single()

    if (error || !section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    // Check permissions
    const application = (section as any).ipo_applications
    const hasAccess = 
      (profile as any).role === 'CMA_ADMIN' ||
      ((profile as any).role === 'ISSUER' && application.company_id === (profile as any).company_id) ||
      ((profile as any).role === 'IB_ADVISOR' && application.assigned_ib_advisor === user.id) ||
      ((profile as any).role === 'CMA_REGULATOR' && (
        application.assigned_cma_officer === user.id ||
        ['SUBMITTED', 'UNDER_REVIEW', 'CMA_REVIEW', 'QUERY_ISSUED'].includes(application.status)
      ))

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json({ section })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/cma/applications/[id]/sections/[sectionId] - Update section
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; sectionId: string } }
) {
  try {
    const supabase = await createTypedServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate input data
    if (body.data && typeof body.data !== 'object') {
      return NextResponse.json({ 
        error: 'Invalid data format',
        details: 'Section data must be an object'
      }, { status: 400 })
    }

    if (body.validation_errors && !Array.isArray(body.validation_errors)) {
      return NextResponse.json({ 
        error: 'Invalid validation_errors format',
        details: 'Validation errors must be an array'
      }, { status: 400 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, company_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get section and application
    const { data: section } = await supabase
      .from('application_sections')
      .select(`
        *,
        ipo_applications!inner(
          company_id,
          assigned_ib_advisor,
          status
        )
      `)
      .eq('id', params.sectionId)
      .eq('application_id', params.id)
      .single()

    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 })
    }

    // Check permissions - only issuers and IB advisors can update
    const application = (section as any).ipo_applications
    const canUpdate = 
      ((profile as any).role === 'ISSUER' && application.company_id === (profile as any).company_id) ||
      ((profile as any).role === 'IB_ADVISOR' && application.assigned_ib_advisor === user.id)

    if (!canUpdate) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if application is in editable state
    const editableStatuses = ['DRAFT', 'IN_PROGRESS', 'QUERY_TO_ISSUER']
    if (!editableStatuses.includes(application.status)) {
      return NextResponse.json({ 
        error: 'Application is not in editable state',
        details: `Cannot edit application in ${application.status} status`
      }, { status: 409 })
    }

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    }

    // Only update fields that are provided
    if (body.data !== undefined) {
      updateData.data = body.data
    }
    if (body.status !== undefined) {
      updateData.status = body.status
      
      // If marking as completed, add completion metadata
      if (body.status === 'COMPLETED' && (section as any).status !== 'COMPLETED') {
        updateData.completed_by = user.id
        updateData.completed_at = new Date().toISOString()
      }
    }
    if (body.validation_errors !== undefined) {
      updateData.validation_errors = body.validation_errors
    }
    if (body.completion_percentage !== undefined) {
      updateData.completion_percentage = Math.max(0, Math.min(100, body.completion_percentage))
    }

    const { data: updated, error } = await supabase
      .from('application_sections')
      .update(updateData as any)
      .eq('id', params.sectionId)
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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update application progress (trigger will handle this, but we can also do it manually)
    const { data: allSections } = await supabase
      .from('application_sections')
      .select('status, completion_percentage')
      .eq('application_id', params.id)

    if (allSections) {
      // Calculate average completion percentage
      const totalCompletion = allSections.reduce((sum, s) => sum + ((s as any).completion_percentage || 0), 0)
      const avgCompletion = Math.round(totalCompletion / allSections.length)

      await supabase
        .from('ipo_applications')
        .update({ 
          completion_percentage: avgCompletion,
          status: avgCompletion > 0 ? 'IN_PROGRESS' : 'DRAFT',
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', params.id)
    }

    return NextResponse.json({ section: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
