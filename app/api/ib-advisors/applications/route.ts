import { NextRequest, NextResponse } from 'next/server';
import { createTypedServerClient } from '@/lib/supabase/typed-client';

// GET - Fetch applications assigned to an IB Advisor
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ibAdvisorId = searchParams.get('ibAdvisorId');

    if (!ibAdvisorId) {
      return NextResponse.json(
        { error: 'IB Advisor ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createTypedServerClient();

    // Fetch applications assigned to this IB Advisor
    const { data: applications, error } = await supabase
      .from('ipo_applications')
      .select(`
        *,
        company:companies(
          id,
          legal_name,
          trading_name
        )
      `)
      .eq('assigned_ib_advisor', ibAdvisorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching IB Advisor applications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      applications: applications || [],
      count: applications?.length || 0
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Assign an application to an IB Advisor (when issuer selects one)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationId, ibAdvisorId, companyId } = body;

    if (!applicationId || !ibAdvisorId) {
      return NextResponse.json(
        { error: 'Application ID and IB Advisor ID are required' },
        { status: 400 }
      );
    }

    const supabase = await createTypedServerClient();

    // Update the application to assign it to the IB Advisor
    const { data, error } = await supabase
      .from('ipo_applications')
      .update({
        assigned_ib_advisor: ibAdvisorId,
        status: 'IB_REVIEW',
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) {
      console.error('Error assigning application to IB Advisor:', error);
      return NextResponse.json(
        { error: 'Failed to assign application' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      application: data
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
