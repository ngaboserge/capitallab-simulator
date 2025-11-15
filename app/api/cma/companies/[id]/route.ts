import { NextRequest, NextResponse } from 'next/server'
import { createTypedServerClient } from '@/lib/supabase/typed-client'

// GET /api/cma/companies/[id] - Get company information
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = await createTypedServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get company information
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select(`
        id,
        legal_name,
        trading_name,
        registration_number,
        industry,
        country,
        created_at
      `)
      .eq('id', id)
      .single()

    if (companyError) {
      console.error('Company lookup error:', companyError)
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      company
    })

  } catch (error) {
    console.error('Company API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}