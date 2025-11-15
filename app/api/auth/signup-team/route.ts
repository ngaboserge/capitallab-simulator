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
        industry: company.industry || null,
        country: 'Rwanda'
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
        
        // Check if user already exists in auth.users
        const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = existingUsers?.users.find(u => u.email === member.email)
        
        let userId: string
        
        if (existingUser) {
          // User already exists (logged-in CEO), just use their ID
          console.log('User already exists in auth, using existing account:', existingUser.id)
          userId = existingUser.id
          // Don't add to createdUsers since we didn't create them
        } else {
          // Create new auth user for team member
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: member.email,
            password: member.password,
            email_confirm: true,
            app_metadata: {},
            user_metadata: {
              full_name: member.fullName,
              role: `ISSUER_${member.role}`
            }
          })

          if (authError || !authData.user) {
            console.error('Auth user creation error:', authError)
            throw new Error(`Failed to create user ${member.email}: ${authError?.message || 'Unknown error'}`)
          }

          userId = authData.user.id
          createdUsers.push(authData.user)
          console.log('Auth user created:', authData.user.id)
        }

        // Map role to database format (CEO -> ISSUER_CEO)
        const dbRole = `ISSUER_${member.role}`

        // Update or create profile
        let profileError
        
        if (existingUser) {
          // For existing users, just update the company_id
          const { error } = await supabaseAdmin
            .from('profiles')
            .update({ company_id: companyData.id })
            .eq('id', userId)
          profileError = error
        } else {
          // For new users, insert full profile
          const { error } = await supabaseAdmin
            .from('profiles')
            .upsert({
              id: userId,
              email: member.email,
              full_name: member.fullName,
              role: dbRole,
              company_id: companyData.id
            }, {
              onConflict: 'id'
            })
          profileError = error
        }

        if (profileError) {
          console.error('Profile creation error:', profileError)
          throw new Error(`Failed to create profile for ${member.email}: ${profileError.message}`)
        }

        createdProfiles.push({
          id: userId,
          email: member.email,
          username: member.username,
          full_name: member.fullName,
          role: dbRole,
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

      // Check if IPO application already exists for this company
      console.log('Checking for existing IPO application for company:', companyData.id)
      const { data: existingApp, error: checkError } = await supabaseAdmin
        .from('ipo_applications')
        .select('*')
        .eq('company_id', companyData.id)
        .maybeSingle()

      if (checkError) {
        console.error('Error checking for existing application:', checkError)
      }

      let applicationData = existingApp

      // Only create application if it doesn't exist
      if (!existingApp) {
        console.log('No existing application found, creating new one')
        const { data: newApp, error: appError } = await supabaseAdmin
          .from('ipo_applications')
          .insert({
            company_id: companyData.id,
            status: 'DRAFT',
            current_phase: 'TEAM_SETUP',
            completion_percentage: 0
          })
          .select()
          .single()

        if (appError) {
          console.error('Application creation error:', appError)
          throw new Error(`Failed to create IPO application: ${appError.message}`)
        }
        
        if (!newApp) {
          throw new Error('Failed to create IPO application: No data returned')
        }
        
        applicationData = newApp
        console.log('New IPO application created:', applicationData.id)
      } else {
        console.log('IPO application already exists, using existing:', existingApp.id)
      }

      // Ensure we have an application before proceeding
      if (!applicationData || !applicationData.id) {
        throw new Error('No IPO application available - this should not happen')
      }

      // Check if sections already exist
      console.log('Checking for existing sections for application:', applicationData.id)
      const { data: existingSections } = await supabaseAdmin
        .from('application_sections')
        .select('id')
        .eq('application_id', applicationData.id)

      // Only create sections if they don't exist
      if (!existingSections || existingSections.length === 0) {
        const sectionTitles = [
          'Company Identity & Legal Form',
          'Capitalization & Financial Strength',
          'Share Ownership & Distribution',
          'Governance & Management',
          'Legal & Regulatory Compliance',
          'Offer Details (IPO Information)',
          'Prospectus & Disclosure Checklist',
          'Publication & Advertisement',
          'Post-Approval Undertakings',
          'Declarations & Contacts'
        ];

        const sectionRoles = ['CEO', 'CFO', 'CEO', 'CEO', 'LEGAL_ADVISOR', 'CFO', 'SECRETARY', 'SECRETARY', 'CEO', 'CEO'];

        const sectionsToCreate = sectionTitles.map((title, index) => ({
          application_id: applicationData.id,
          section_number: index + 1,
          section_title: title,
          assigned_role: sectionRoles[index],
          status: 'NOT_STARTED',
          data: {},
          completion_percentage: 0
        }));

        const { error: sectionsError } = await supabaseAdmin
          .from('application_sections')
          .insert(sectionsToCreate)

        if (sectionsError) {
          console.error('Sections creation error:', sectionsError)
          throw new Error('Failed to create application sections')
        }
        
        console.log('Created application sections')
      } else {
        console.log('Application sections already exist, skipping creation')
      }

      return NextResponse.json({
        success: true,
        company: companyData,
        application: applicationData,
        team: createdProfiles,
        message: `Successfully created company "${company.legalName}" with ${team.length} team members and IPO application`
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