import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

// POST /api/cma/applications/[id]/assign-ib - Assign IB Advisor to application
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
    const { ib_advisor_id } = body

    if (!ib_advisor_id) {
      return NextResponse.json({ error: 'IB Advisor ID is required' }, { status: 400 })
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

    // Only issuer CEO can assign IB Advisor
    if (profile?.role !== 'ISSUER_CEO' || application.company_id !== profile.company_id) {
      return NextResponse.json({ 
        error: 'Only the company CEO can assign an IB Advisor' 
      }, { status: 403 })
    }

    // Verify the IB Advisor exists and has correct role
    const { data: ibAdvisor } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('id', ib_advisor_id)
      .eq('role', 'IB_ADVISOR')
      .single()

    if (!ibAdvisor) {
      return NextResponse.json({ error: 'Invalid IB Advisor' }, { status: 400 })
    }

    // Update application
    const { data: updated, error } = await supabase
      .from('ipo_applications')
      .update({
        assigned_ib_advisor: ib_advisor_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create notification for IB Advisor
    await supabase.from('notifications').insert({
      recipient_id: ib_advisor_id,
      title: 'New IPO Application Assignment',
      message: `You have been assigned as IB Advisor for ${(application.companies as any)?.legal_name}'s IPO application`,
      type: 'IB_ASSIGNED',
      application_id: params.id
    })

    return NextResponse.json({ 
      application: updated,
      ib_advisor: ibAdvisor,
      message: 'IB Advisor assigned successfully'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/cma/applications/[id]/assign-ib - Remove IB Advisor assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
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
      .select('company_id, assigned_ib_advisor')
      .eq('id', params.id)
      .single()

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    // Only issuer CEO can remove IB Advisor
    if (profile?.role !== 'ISSUER_CEO' || application.company_id !== profile.company_id) {
      return NextResponse.json({ 
        error: 'Only the company CEO can remove an IB Advisor' 
      }, { status: 403 })
    }

    // Update application
    const { data: updated, error } = await supabase
      .from('ipo_applications')
      .update({
        assigned_ib_advisor: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      application: updated,
      message: 'IB Advisor removed successfully'
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
