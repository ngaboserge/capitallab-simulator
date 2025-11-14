import { NextRequest, NextResponse } from 'next/server'
import { createTypedServerClient } from '@/lib/supabase/typed-client'

// POST /api/cma/applications/[id]/sections/[sectionId]/complete - Mark section as complete
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; sectionId: string } }
) {
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

    // Check permissions - only issuers and IB advisors can mark as complete
    const application = (section as any).ipo_applications
    const canComplete = 
      ((profile as any).role === 'ISSUER' && application.company_id === (profile as any).company_id) ||
      ((profile as any).role === 'IB_ADVISOR' && application.assigned_ib_advisor === user.id)

    if (!canComplete) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if application is in editable state
    const editableStatuses = ['DRAFT', 'IN_PROGRESS', 'QUERY_TO_ISSUER']
    if (!editableStatuses.includes(application.status)) {
      return NextResponse.json({ 
        error: 'Application is not in editable state',
        details: `Cannot complete section when application is in ${application.status} status`
      }, { status: 409 })
    }

    // Validate that section has data
    const sectionData = (section as any).data
    if (!sectionData || Object.keys(sectionData).length === 0) {
      return NextResponse.json({ 
        error: 'Cannot complete empty section',
        details: 'Section must have data before it can be marked as complete'
      }, { status: 400 })
    }

    // Check for validation errors
    const validationErrors = (section as any).validation_errors
    if (validationErrors && Array.isArray(validationErrors) && validationErrors.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot complete section with validation errors',
        details: 'Please fix all validation errors before marking section as complete',
        validation_errors: validationErrors
      }, { status: 400 })
    }

    // Mark section as completed
    const { data: updated, error } = await supabase
      .from('application_sections')
      .update({
        status: 'COMPLETED' as const,
        completion_percentage: 100,
        completed_by: user.id,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any)
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

    // Update application progress
    const { data: allSections } = await supabase
      .from('application_sections')
      .select('status, completion_percentage')
      .eq('application_id', params.id)

    if (allSections) {
      const completedCount = allSections.filter(s => (s as any).status === 'COMPLETED').length
      const totalCompletion = allSections.reduce((sum, s) => sum + ((s as any).completion_percentage || 0), 0)
      const avgCompletion = Math.round(totalCompletion / allSections.length)

      // Update application status based on completion
      let newStatus = application.status
      if (avgCompletion > 0 && application.status === 'DRAFT') {
        newStatus = 'IN_PROGRESS'
      }

      await supabase
        .from('ipo_applications')
        .update({ 
          completion_percentage: avgCompletion,
          status: newStatus,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', params.id)

      return NextResponse.json({ 
        section: updated,
        application_progress: {
          completed_sections: completedCount,
          total_sections: allSections.length,
          completion_percentage: avgCompletion
        }
      })
    }

    return NextResponse.json({ section: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
