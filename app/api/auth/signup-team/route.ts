import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { IssuerRole } from '@/lib/auth/issuer-roles'

interface TeamMember {
  fullName: string;
  email: string;
  username: string;
  password: string;
  role: IssuerRole;
}

interface CompanyInfo {
  legalName: string;
  tradingName?: string;
  registrationNumber: string;
  industry?: string;
  description?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { company, team }: { company: CompanyInfo; team: TeamMember[] } = body

    // Validate required fields
    if (!company.legalName || !company.registrationNumber || !team || team.length === 0) {
      return NextResponse.json(
        { error: 'Missing required company or team information' },
        { status: 400 }
      )
    }

    // Validate team has CEO
    const hasCEO = team.some(member => member.role === 'CEO')
    if (!hasCEO) {
      return NextResponse.json(
        { error: 'Team must include a CEO' },
        { status: 400 }
      )
    }

    // Validate all team members have required fields
    for (const member of team) {
      if (!member.fullName || !member.email || !member.username || !member.password) {
        return NextResponse.json(
          { error: 'All team member fields are required' },
          { status: 400 }
        )
      }
      if (member.password.length < 8) {
        return NextResponse.json(
          { error: 'Passwords must be at least 8 characters long' },
          { status: 400 }
        )
      }
    }

    // Use service role client for admin operations
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

    // Check for existing usernames and emails
    const usernames = team.map(m => m.username)
    const emails = team.map(m => m.email)

    const { data: existingProfiles } = await supabaseAdmin
      .from('profiles')
      .select('username, email')
      .or(`username.in.(${usernames.join(',')}),email.in.(${emails.join(',')})`)

    if (existingProfiles && existingProfiles.length > 0) {
      const existingUsernames = existingProfiles.map(p => p.username)
      const existingEmails = existingProfiles.map(p => p.email)
      
      const duplicateUsernames = usernames.filter(u => existingUsernames.includes(u))
      const duplicateEmails = emails.filter(e => existingEmails.includes(e))
      
      if (duplicateUsernames.length > 0) {
        return NextResponse.json(
          { error: `Username(s) already exist: ${duplicateUsernames.join(', ')}` },
          { status: 409 }
        )
      }
      
      if (duplicateEmails.length > 0) {
        return NextResponse.json(
          { error: `Email(s) already exist: ${duplicateEmails.join(', ')}` },
          { status: 409 }
        )
      }
    }

    // Create company first
    console.log('Creating company:', company.legalName)
    const { data: companyData, error: companyError } = await supabaseAdmin
      .from('companies')
      .insert({
        legal_name: company.legalName,
        trading_name: company.tradingName || null,
        registration_number: company.registrationNumber,
        industry_sector: company.industry || null,
        business_description: company.description || null,
        status: 'ACTIVE'
      })
      .select()
      .single()

    if (companyError || !companyData) {
      console.error('Company creation error:', companyError)
      return NextResponse.json(
        { error: 'Failed to create company: ' + (companyError?.message || 'Unknown error') },
        { status: 500 }
      )
    }

    console.log('Company created successfully:', companyData.id)

    // Create team members
    const createdUsers = []
    const createdProfiles = []

    try {
      for (const member of team) {
        console.log('Creating user for:', member.email)
        
        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: member.email,
          password: member.password,
          email_confirm: true,
          app_metadata: {},
          user_metadata: {
            full_name: member.fullName,
            role: 'ISSUER',
            company_role: member.role
          }
        })

        if (authError || !authData.user) {
          console.error('Auth user creation error:', authError)
          throw new Error(`Failed to create user ${member.email}: ${authError?.message || 'Unknown error'}`)
        }

        createdUsers.push(authData.user)
        console.log('Auth user created:', authData.user.id)

        // Create profile
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: authData.user.id,
            email: member.email,
            username: member.username,
            full_name: member.fullName,
            role: 'ISSUER',
            company_id: companyData.id,
            company_role: member.role,
            is_active: true
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
          throw new Error(`Failed to create profile for ${member.email}: ${profileError.message}`)
        }

        createdProfiles.push({
          id: authData.user.id,
          email: member.email,
          username: member.username,
          full_name: member.fullName,
          role: 'ISSUER',
          company_role: member.role
        })

        console.log('Profile created for:', member.email)
      }

      // Update company with created_by (CEO)
      const ceoProfile = createdProfiles.find(p => p.company_role === 'CEO')
      if (ceoProfile) {
        await supabaseAdmin
          .from('companies')
          .update({ created_by: ceoProfile.id })
          .eq('id', companyData.id)
      }

      return NextResponse.json({
        success: true,
        company: companyData,
        team: createdProfiles,
        message: `Successfully created company "${company.legalName}" with ${team.length} team members`
      })

    } catch (error) {
      console.error('Team creation failed, rolling back:', error)
      
      // Rollback: delete created users and company
      try {
        for (const user of createdUsers) {
          await supabaseAdmin.auth.admin.deleteUser(user.id)
        }
        await supabaseAdmin.from('companies').delete().eq('id', companyData.id)
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError)
      }
      
      return NextResponse.json(
        { 
          error: 'Team creation failed: ' + 
            (error instanceof Error ? error.message : 'Unknown error')
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Unexpected team signup error:', error)
    return NextResponse.json(
      { 
        error: 'Unexpected error: ' + 
          (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    )
  }
}