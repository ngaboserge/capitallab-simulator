import { NextRequest, NextResponse } from 'next/server'
import { createTypedServerClient } from '@/lib/supabase/typed-client'

// GET /api/cma/applications/[id]/comments - Get comments for application
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createTypedServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sectionId = searchParams.get('section_id')

    // Get user profile to determine what comments they can see
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, company_id')
      .eq('id', user.id)
      .single()

    let query = supabase
      .from('comments')
      .select(`
        *,
        author:profiles!comments_author_id_fkey (
          id,
          full_name,
          email,
          role
        )
      `)
      .eq('application_id', params.id)

    // Filter by section if provided
    if (sectionId) {
      query = query.eq('section_id', sectionId)
    }

    // CMA can see all comments, others only see non-internal comments
    if (!['CMA_REGULATOR', 'CMA_ADMIN'].includes(profile?.role || '')) {
      query = query.eq('is_internal', false)
    }

    const { data: comments, error } = await query.order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ comments })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/cma/applications/[id]/comments - Add comment to application
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createTypedServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content, section_id, is_internal, parent_comment_id } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, company_id')
      .eq('id', user.id)
      .single()

    // Verify user has access to this application
    const { data: application } = await supabase
      .from('ipo_applications')
      .select('company_id, assigned_ib_advisor, assigned_cma_officer')
      .eq('id', params.id)
      .single()

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const hasAccess = 
      ['CMA_REGULATOR', 'CMA_ADMIN'].includes(profile?.role || '') ||
      (profile?.role.startsWith('ISSUER_') && application.company_id === profile.company_id) ||
      (profile?.role === 'IB_ADVISOR' && application.assigned_ib_advisor === user.id)

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Only CMA can create internal comments
    const isInternalComment = is_internal && ['CMA_REGULATOR', 'CMA_ADMIN'].includes(profile?.role || '')

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        application_id: params.id,
        section_id: section_id || null,
        author_id: user.id,
        content: content.trim(),
        is_internal: isInternalComment,
        parent_comment_id: parent_comment_id || null
      })
      .select(`
        *,
        author:profiles!comments_author_id_fkey (
          id,
          full_name,
          email,
          role
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create notifications for relevant parties (except internal comments)
    if (!isInternalComment) {
      const notifications = []

      // Notify issuer team
      const { data: issuerTeam } = await supabase
        .from('profiles')
        .select('id')
        .eq('company_id', application.company_id)
        .neq('id', user.id) // Don't notify the author

      if (issuerTeam) {
        issuerTeam.forEach(member => {
          notifications.push({
            recipient_id: member.id,
            title: 'New Comment on Application',
            message: `${profile?.full_name || 'Someone'} commented on your IPO application`,
            type: 'COMMENT_ADDED',
            application_id: params.id
          })
        })
      }

      // Notify IB Advisor if assigned and not the author
      if (application.assigned_ib_advisor && application.assigned_ib_advisor !== user.id) {
        notifications.push({
          recipient_id: application.assigned_ib_advisor,
          title: 'New Comment on Application',
          message: `${profile?.full_name || 'Someone'} commented on an IPO application you're advising`,
          type: 'COMMENT_ADDED',
          application_id: params.id
        })
      }

      // Notify CMA officer if assigned and not the author
      if (application.assigned_cma_officer && application.assigned_cma_officer !== user.id) {
        notifications.push({
          recipient_id: application.assigned_cma_officer,
          title: 'New Comment on Application',
          message: `${profile?.full_name || 'Someone'} commented on an application you're reviewing`,
          type: 'COMMENT_ADDED',
          application_id: params.id
        })
      }

      if (notifications.length > 0) {
        await supabase.from('notifications').insert(notifications)
      }
    }

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
