import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

export async function POST(request: NextRequest) {
  try {
    // Use service role client for testing
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Test 1: Check if company_role column exists
    const { data: columnCheck, error: columnError } = await supabaseAdmin
      .from('profiles')
      .select('company_role')
      .limit(1)

    if (columnError) {
      return NextResponse.json({
        success: false,
        error: 'company_role column missing',
        details: columnError.message
      })
    }

    // Test 2: Create a real auth user first, then test profile creation
    const testEmail = `test-${Date.now()}@example.com`
    const testUsername = `testuser-${Date.now()}`

    // Create auth user first
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: 'testpassword123',
      email_confirm: true
    })

    if (authError || !authData.user) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create test auth user',
        details: authError?.message || 'No user data returned'
      })
    }

    const testUserId = authData.user.id

    // Now test profile creation with company_role
    const { data: insertTest, error: insertError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: testUserId,
        email: testEmail,
        username: testUsername,
        full_name: 'Test User',
        role: 'ISSUER',
        company_role: 'CEO',
        is_active: true
      })
      .select()

    if (insertError) {
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(testUserId)
      return NextResponse.json({
        success: false,
        error: 'Failed to insert test profile',
        details: insertError.message
      })
    }

    // Clean up test data
    await supabaseAdmin.from('profiles').delete().eq('id', testUserId)
    await supabaseAdmin.auth.admin.deleteUser(testUserId)

    return NextResponse.json({
      success: true,
      message: 'Signup fix verified successfully',
      tests: {
        columnExists: true,
        insertWorks: true
      }
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to test signup fix',
    endpoint: '/api/test-signup-fix'
  })
}