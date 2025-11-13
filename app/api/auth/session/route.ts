import { NextRequest, NextResponse } from 'next/server'
import { createTypedServerClient } from '@/lib/supabase/typed-client'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createTypedServerClient()

    // Get authenticated user (more secure than getSession)
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { user: null, profile: null, session: null },
        { status: 200 }
      )
    }

    // Get session for tokens
    const { data: { session } } = await supabase.auth.getSession()

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: profile.username,
        fullName: profile.full_name,
        role: profile.role,
        companyId: profile.company_id
      },
      profile,
      session: session ? {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at
      } : null
    })
  } catch (error) {
    console.error('Session error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
