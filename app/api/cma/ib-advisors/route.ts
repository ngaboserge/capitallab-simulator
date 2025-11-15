import { NextRequest, NextResponse } from 'next/server'
import { createTypedServerClient } from '@/lib/supabase/typed-client'

// GET /api/cma/ib-advisors - Get list of IB Advisors and CMA Regulators
export async function GET(request: NextRequest) {
  try {
    const supabase = await createTypedServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get IB Advisors
    const { data: advisors, error: advisorsError } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, created_at')
      .eq('role', 'IB_ADVISOR')
      .order('full_name')

    if (advisorsError) {
      return NextResponse.json({ error: advisorsError.message }, { status: 500 })
    }

    // Get CMA Regulators (for IB advisor submission)
    const { data: regulators, error: regulatorsError } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, employee_id, department, created_at')
      .in('role', ['CMA_REGULATOR', 'CMA_ADMIN'])
      .order('full_name')

    if (regulatorsError) {
      console.error('Error fetching regulators:', regulatorsError)
    }

    // Return both advisors and all users (including regulators)
    const allUsers = [...(advisors || []), ...(regulators || [])]

    return NextResponse.json({ 
      advisors: advisors || [],
      users: allUsers,
      regulators: regulators || []
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

