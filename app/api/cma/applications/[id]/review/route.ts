import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

// POST /api/cma/applications/[id]/review - CMA Regulator reviews application
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, comment, risk_rating, compliance_score } = body

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Only CMA regulators can review
    if (!profile || !['CMA_REGULATOR', 'CMA_ADMIN'].includes(profile.role)) {
      return NextResponse.json({ 
        error: 'Only CMA regulators can review applications' 
      }, { status: 403 })
    }

    // Get application
    const { data: application } = await supabase
      .from('ipo_applications')
      .select('*, companies(legal_name), assigned_ib_advisor')
      .eq('id', params.id)
      .single()

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Validate action
    const validActions = ['START_REVIEW', 'ISSUE_QUERY', 'APPROVE', 'REJECT']
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    let newStatus = application.status
    let reviewType: 'INITIAL_REVIEW' | 'QUERY_RESPONSE' | 'FINAL_REVIEW' = 'INITIAL_REVIEW'
    let decision: 'APPROVE' | 'REJECT' | 'QUERY' | null = null

    switch (action) {
      case 'START_REVIEW':
        newStatus = 'UNDER_REVIEW'
        break
      case 'ISSUE_QUERY':
        newStatus = 'QUERY_ISSUED'
        decision = 'QUERY'
        break
      case 'APPROVE':
        newStatus = 'APPROVED'
        decision = 'APPROVE'
        reviewType = 'FINAL_REVIEW'
        break
      case 'REJECT':
        newStatus = 'REJECTED'
        decision = 'REJECT'
        reviewType = 'FINAL_REVIEW'
        break
    }

    // Update application
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString()
    }

    // Assign CMA officer if starting review
    if (action === 'START_REVIEW' && !application.assigned_cma_officer) {
      updateData.assigned_cma_officer = user.id
    }

    const { data: updated, error: updateError } = await supabase
      .from('ipo_applications')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Create review record
    const { data: review, error: reviewError } = await supabase
      .from('cma_reviews')
      .insert({
        application_id: params.id,
        reviewer_id: user.id,
        review_type: reviewType,
        status: newStatus,
        compliance_score: compliance_score || null,
        risk_rating: risk_rating || null,
        decision: decision,
        decision_reason: comment || null,
        completed_at: decision ? new Date().toISOString() : null
      })
      .select()
      .single()

    if (reviewError) {
      return NextResponse.json({ error: reviewError.message }, { status: 500 })
    }

    // Create comment if provided
    if (comment) {
      await supabase.from('comments').insert({
        application_id: params.id,
        author_id: user.id,
        content: comment,
        is_internal: action === 'START_REVIEW' // Internal for start review, public for queries/decisions
      })
    }

    // Create notifications
    const notifications = []

    // Notify issuer team
    const { data: issuerTeam } = await supabase
      .from('profiles')
      .select('id')
      .eq('company_id', application.company_id)

    if (issuerTeam) {
      issuerTeam.forEach(member => {
        notifications.push({
          recipient_id: member.id,
          title: getNotificationTitle(action),
          message: getNotificationMessage(action, (application.companies as any)?.legal_name, comment),
          type: `CMA_${action}`,
          application_id: params.id
        })
      })
    }

    // Notify IB Advisor if assigned
    if (application.assigned_ib_advisor) {
      notifications.push({
        recipient_id: application.assigned_ib_advisor,
        title: getNotificationTitle(action),
        message: getNotificationMessage(action, (application.companies as any)?.legal_name, comment),
        type: `CMA_${action}`,
        application_id: params.id
      })
    }

    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications)
    }

    return NextResponse.json({ 
      application: updated,
      review,
      message: getSuccessMessage(action)
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function getNotificationTitle(action: string): string {
  switch (action) {
    case 'START_REVIEW': return 'Application Under Review'
    case 'ISSUE_QUERY': return 'Query Issued on Application'
    case 'APPROVE': return 'Application Approved'
    case 'REJECT': return 'Application Rejected'
    default: return 'Application Update'
  }
}

function getNotificationMessage(action: string, companyName: string, comment?: string): string {
  const base = `Your IPO application for ${companyName}`
  switch (action) {
    case 'START_REVIEW': return `${base} is now under CMA review`
    case 'ISSUE_QUERY': return `${base} has queries that need to be addressed. ${comment || ''}`
    case 'APPROVE': return `${base} has been approved by CMA. ${comment || ''}`
    case 'REJECT': return `${base} has been rejected. ${comment || ''}`
    default: return `${base} has been updated`
  }
}

function getSuccessMessage(action: string): string {
  switch (action) {
    case 'START_REVIEW': return 'Review started successfully'
    case 'ISSUE_QUERY': return 'Query issued successfully'
    case 'APPROVE': return 'Application approved successfully'
    case 'REJECT': return 'Application rejected'
    default: return 'Action completed'
  }
}
