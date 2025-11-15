import { NextRequest, NextResponse } from 'next/server'
import { createTypedServerClient } from '@/lib/supabase/typed-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createTypedServerClient()

    // Authenticate with Supabase
    console.log('Attempting login for:', email)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError || !authData.user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, id, full_name, role, company_id, is_ib_advisor')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile lookup error:', profileError)
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    console.log('Login successful for:', profile.email)

    // Extract company role from database role (e.g., 'ISSUER_CEO' -> 'CEO')
    const companyRole = profile.role?.startsWith('ISSUER_') 
      ? profile.role.replace('ISSUER_', '') 
      : null

    return NextResponse.json({
      success: true,
      user: authData.user,
      profile: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role,
        companyId: profile.company_id,
        companyRole: companyRole,
        isIbAdvisor: profile.is_ib_advisor
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
