import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Test service role connection
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Test 1: Check if we can connect
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('profiles')
      .select('count')
      .limit(0)

    if (tablesError) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: tablesError.message,
        code: tablesError.code
      })
    }

    // Test 2: Try to query profiles table
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .limit(1)

    if (profilesError) {
      return NextResponse.json({
        success: false,
        error: 'Profiles table query failed',
        details: profilesError.message,
        code: profilesError.code
      })
    }

    // Test 3: Try to query companies table
    const { data: companies, error: companiesError } = await supabaseAdmin
      .from('companies')
      .select('*')
      .limit(1)

    if (companiesError) {
      return NextResponse.json({
        success: false,
        error: 'Companies table query failed',
        details: companiesError.message,
        code: companiesError.code
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      tables: {
        profiles: profiles?.length || 0,
        companies: companies?.length || 0
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
