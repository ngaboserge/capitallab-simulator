import { NextRequest, NextResponse } from 'next/server'
import { createTypedServerClient } from '@/lib/supabase/typed-client'

// POST /api/cma/applications/[id]/submit - Submit application for review
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

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, company_id')
      .eq('id', user.id)
      .single()

    // Get application
    const { data: application } = await supabase
      .from('ipo_applications')
      .select('*, companies(legal_name)')
      .eq('id', params.id)
      .single()

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Check permissions - only issuer CEO can submit
    if (profile?.role !== 'ISSUER_CEO' || application.company_id !== profile.company_id) {
      return NextResponse.json({ error: 'Only the company CEO can submit the application' }, { status: 403 })
    }

    // Check if all sections are completed
    const { data: sections } = await supabase
      .from('application_sections')
      .select('status')
      .eq('application_id', params.id)

    const allCompleted = sections?.every(s => s.status === 'COMPLETED')

    if (!allCompleted) {
      return NextResponse.json({ 
        error: 'All sections must be completed before submission' 
      }, { status: 400 })
    }

    // Generate application number
    const appNumber = `IPO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`

    // Update application status
    const { data: updated, error } = await supabase
      .from('ipo_applications')
      .update({
        status: 'SUBMITTED',
        application_number: appNumber,
        submission_date: new Date().toISOString(),
        current_phase: 'REVIEW',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create notification for CMA regulators
    const { data: cmaUsers } = await supabase
      .from('profiles')
      .select('id')
      .in('role', ['CMA_REGULATOR', 'CMA_ADMIN'])

    if (cmaUsers) {
      const notifications = cmaUsers.map(cmaUser => ({
        recipient_id: cmaUser.id,
        title: 'New IPO Application Submitted',
        message: `${(application.companies as any)?.legal_name} has submitted a new IPO application (${appNumber})`,
        type: 'APPLICATION_SUBMITTED',
        application_id: params.id
      }))

      await supabase.from('notifications').insert(notifications)
    }

    // Notify IB Advisor if assigned
    if (application.assigned_ib_advisor) {
      await supabase.from('notifications').insert({
        recipient_id: application.assigned_ib_advisor,
        title: 'IPO Application Submitted',
        message: `The IPO application for ${(application.companies as any)?.legal_name} has been submitted for CMA review`,
        type: 'APPLICATION_SUBMITTED',
        application_id: params.id
      })
    }

    return NextResponse.json({ 
      application: updated,
      message: 'Application submitted successfully'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
