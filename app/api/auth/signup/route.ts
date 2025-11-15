import { NextRequest, NextResponse } from 'next/server'
import { createTypedServerClient } from '@/lib/supabase/typed-client'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let { username, password, email, fullName, role, companyName, companyRole, ibAdvisorProfile, phone, metadata } = body

    // Auto-generate username if not provided
    if (!username && email) {
      const timestamp = Date.now().toString().slice(-6)
      username = `${email.split('@')[0]}_${timestamp}`
    }

    // Validate required fields
    if (!username || !password || !email || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles = ['ISSUER', 'IB_ADVISOR', 'CMA_REGULATOR', 'CMA_ADMIN', 'SHORA_EXCHANGE', 'SHORA_ADMIN', 'SHORA_OPERATOR']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Validate company name for issuer users
    if (role === 'ISSUER' && !companyName) {
      return NextResponse.json(
        { error: 'Company name is required for issuer users' },
        { status: 400 }
      )
    }

    // Use service role client for admin operations (bypasses RLS)
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        db: {
          schema: 'public'
        }
      }
    )

    const supabase = await createTypedServerClient()

    // Check if username already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      )
    }

    // Check if email already exists
    const { data: existingEmail } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('email', email)
      .single()

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }

    // Create auth user (without email verification)
    console.log('Creating auth user for:', email)
    
    // Try creating user with minimal data first
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      app_metadata: {},
      user_metadata: {}
    })

    if (authError) {
      console.error('Auth user creation error:', authError)
      
      // Check if it's a trigger/database error
      if (authError.message.includes('Database error')) {
        return NextResponse.json(
          { 
            error: 'Database configuration error. Please check Supabase Auth triggers and RLS policies.',
            details: authError.message 
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { error: 'Auth error: ' + authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      console.error('Auth user creation returned no data')
      return NextResponse.json(
        { error: 'Failed to create user - no data returned' },
        { status: 500 }
      )
    }

    console.log('Auth user created successfully:', authData.user.id)

    let companyId: string | null = null

    // Create company for issuer users
    if (role === 'ISSUER' && companyName) {
      try {
        console.log('Creating company:', companyName)
        const { data: company, error: companyError } = await supabaseAdmin
          .from('companies')
          .insert({
            legal_name: companyName,
            country: 'Rwanda'
          })
          .select()
          .single()

        if (companyError) {
          console.error('Company creation error:', companyError)
          throw new Error(companyError.message)
        }

        if (!company) {
          console.error('Company creation returned no data')
          throw new Error('Company creation returned no data')
        }

        companyId = company.id
        console.log('Company created successfully:', companyId)
      } catch (companyError) {
        console.error('Company creation failed, rolling back user:', companyError)
        // Rollback: delete the auth user
        try {
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        } catch (deleteError) {
          console.error('Failed to rollback user creation:', deleteError)
        }
        
        return NextResponse.json(
          { 
            error: 'Database error creating company: ' + 
              (companyError instanceof Error ? companyError.message : 'Unknown error')
          },
          { status: 500 }
        )
      }
    }

    // Update profile (trigger creates it automatically)
    try {
      console.log('Updating profile for user:', authData.user.id)
      
      // Wait for trigger to create profile
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const profileUpdate: any = {
        full_name: fullName || null,
        company_id: companyId,
        role: role, // Set the role field
        is_ib_advisor: role === 'IB_ADVISOR',
        phone: phone || null
      };

      // Add IB Advisor profile data if provided
      if (role === 'IB_ADVISOR' && ibAdvisorProfile) {
        profileUpdate.ib_advisor_profile = ibAdvisorProfile;
      }

      // Add CMA Regulator specific fields if provided
      if ((role === 'CMA_REGULATOR' || role === 'CMA_ADMIN') && metadata) {
        if (metadata.employee_id) {
          profileUpdate.employee_id = metadata.employee_id;
        }
        if (metadata.department) {
          profileUpdate.department = metadata.department;
        }
      }

      // Add Shora Exchange specific fields if provided (only if columns exist)
      if ((role === 'SHORA_EXCHANGE' || role === 'SHORA_ADMIN' || role === 'SHORA_OPERATOR') && metadata) {
        // Store in user_metadata instead if position column doesn't exist
        // This will be available in the auth.users table
        if (metadata.position || metadata.department) {
          // Just skip for now - position can be added later if needed
          console.log('Shora Exchange metadata:', metadata);
        }
      }

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update(profileUpdate)
        .eq('id', authData.user.id)

      if (profileError) {
        console.error('Profile update error:', profileError)
        throw new Error(profileError.message)
      }
      
      console.log('Profile updated successfully')
    } catch (profileError) {
      console.error('Profile update failed, rolling back:', profileError)
      // Rollback: delete the auth user and company
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        if (companyId) {
          await supabaseAdmin.from('companies').delete().eq('id', companyId)
        }
      } catch (deleteError) {
        console.error('Failed to rollback user/company creation:', deleteError)
      }
      
      return NextResponse.json(
        { 
          error: 'Database error creating profile: ' + 
            (profileError instanceof Error ? profileError.message : 'Unknown error')
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email,
        username,
        role,
        companyId
      }
    })
    console.log('Signup completed successfully')
    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email,
        username,
        role,
        companyId
      }
    })
  } catch (error) {
    console.error('Unexpected signup error:', error)
    return NextResponse.json(
      { 
        error: 'Unexpected error: ' + 
          (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    )
  }
}
