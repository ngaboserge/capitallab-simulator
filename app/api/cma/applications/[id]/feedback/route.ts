import { NextRequest, NextResponse } from 'next/server';
import { createTypedServerClient } from '@/lib/supabase/typed-client';

// GET /api/cma/applications/[id]/feedback - Get all feedback for application
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createTypedServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: feedback, error } = await supabase
      .from('application_feedback')
      .select(`
        *,
        creator:profiles!application_feedback_created_by_fkey(id, full_name, role),
        resolver:profiles!application_feedback_resolved_by_fkey(id, full_name, role)
      `)
      .eq('application_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ feedback: feedback || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/cma/applications/[id]/feedback - Create new feedback
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createTypedServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { category, issue, priority, section_id } = body;

    if (!category || !issue) {
      return NextResponse.json(
        { error: 'Category and issue are required' },
        { status: 400 }
      );
    }

    // Verify user is IB Advisor for this application
    const { data: application } = await supabase
      .from('ipo_applications')
      .select('assigned_ib_advisor, company_id')
      .eq('id', id)
      .single();

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const applicationData = application as any;
    const profileData = profile as any;
    
    if (profileData?.role !== 'IB_ADVISOR' || applicationData?.assigned_ib_advisor !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { data: feedback, error } = await supabase
      .from('application_feedback')
      .insert({
        application_id: id,
        section_id: section_id || null,
        category,
        issue,
        priority: priority || 'MEDIUM',
        created_by: user.id,
        status: 'PENDING'
      } as any)
      .select(`
        *,
        creator:profiles!application_feedback_created_by_fkey(id, full_name, role)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Notify issuer team
    const { data: issuerTeam } = await supabase
      .from('profiles')
      .select('id')
      .eq('company_id', applicationData?.company_id);

    if (issuerTeam && issuerTeam.length > 0) {
      const notifications = issuerTeam.map((member: any) => ({
        recipient_id: member.id,
        title: 'New Feedback from IB Advisor',
        message: `Your IB Advisor has provided feedback on: ${category}`,
        type: 'QUERY_ISSUED',
        application_id: id,
        priority: priority || 'MEDIUM'
      }));

      await supabase.from('notifications').insert(notifications as any);
    }

    return NextResponse.json({ feedback }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
