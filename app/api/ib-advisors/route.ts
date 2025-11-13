import { NextResponse } from 'next/server';
import { createTypedServerClient } from '@/lib/supabase/typed-client';

export async function GET() {
  try {
    const supabase = await createTypedServerClient();

    // Get all IB Advisor profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'IB_ADVISOR')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching IB Advisors:', error);
      return NextResponse.json(
        { error: 'Failed to fetch IB Advisors' },
        { status: 500 }
      );
    }

    // Transform profiles to IB Advisor format
    const advisors = profiles.map(profile => {
      // Parse IB Advisor profile data from JSON field or use defaults
      const ibProfile = profile.ib_advisor_profile || {};
      
      return {
        id: profile.id,
        name: ibProfile.companyName || profile.full_name || 'Investment Bank',
        description: ibProfile.description || 'Professional investment banking services',
        specialization: ibProfile.specializations || ['General IPO Services'],
        experience: ibProfile.yearsExperience || '5+ years',
        successRate: ibProfile.successRate || 85,
        completedIPOs: ibProfile.completedIPOs || 10,
        averageTimeline: ibProfile.averageTimeline || '6-12 months',
        fees: {
          retainer: ibProfile.retainerFee || 'Contact for pricing',
          success: ibProfile.successFee || 'Contact for pricing'
        },
        team: ibProfile.teamMembers || [
          {
            name: profile.full_name || 'Team Lead',
            role: 'Managing Director',
            experience: '10+ years'
          }
        ],
        contact: {
          email: profile.email,
          phone: ibProfile.phone || profile.phone || 'Contact for details',
          website: ibProfile.website || 'Contact for details'
        },
        certifications: ibProfile.certifications || ['Licensed Investment Advisor'],
        status: ibProfile.status || 'available',
        rating: ibProfile.rating || 4.0
      };
    });

    return NextResponse.json({
      advisors,
      count: advisors.length
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint to create/update IB Advisor profile
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, ibAdvisorProfile } = body;

    if (!userId || !ibAdvisorProfile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createTypedServerClient();

    // Update the profile with IB Advisor data
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ib_advisor_profile: ibAdvisorProfile,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .eq('role', 'IB_ADVISOR')
      .select()
      .single();

    if (error) {
      console.error('Error updating IB Advisor profile:', error);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: data
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}