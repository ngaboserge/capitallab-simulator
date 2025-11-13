import { NextRequest, NextResponse } from 'next/server'
import { createTypedServerClient } from '@/lib/supabase/typed-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    const supabase = await createTypedServerClient()

    // Find user by username OR email
    console.log('Looking up profile for username/email:', username)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, id, username, full_name, role, company_id, company_role, is_active')
      .or(`username.eq.${username},email.eq.${username}`)
      .single()

    if (profileError) {
      console.error('Profile lookup error:', profileError)
    }

    if (profileError || !profile) {
      console.log('Profile not found for username/email:', username)
      return NextResponse.json(
        { error: 'Invalid username/email or password' },
        { status: 401 }
      )
    }

    console.log('Profile found:', profile.username, profile.email)

    // Check if user is active
    if (!profile.is_active) {
      return NextResponse.json(
        { error: 'Account is inactive. Please contact support.' },
        { status: 403 }
      )
    }

    // Sign in with email and password
    console.log('Attempting Supabase auth with email:', profile.email)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: profile.email,
      password
    })

    if (authError) {
      console.error('Supabase auth error:', authError)
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    console.log('Auth successful!')

    if (!authData.session) {
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    // Update last login timestamp
    await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', profile.id)

    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email,
        username: profile.username,
        fullName: profile.full_name,
        role: profile.role,
        companyId: profile.company_id
      },
      session: {
        accessToken: authData.session.access_token,
        refreshToken: authData.session.refresh_token,
        expiresAt: authData.session.expires_at
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
