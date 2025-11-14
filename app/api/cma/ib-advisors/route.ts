import { NextRequest, NextResponse } from 'next/server'
import { createTypedServerClient } from '@/lib/supabase/typed-client'

// GET /api/cma/ib-advisors - Get list of IB Advisors
export async function GET(request: NextRequest) {
  try {
    const supabase = await createTypedServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: advisors, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, created_at')
      .eq('role', 'IB_ADVISOR')
      .order('full_name')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ advisors })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

