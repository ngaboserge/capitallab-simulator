import { NextRequest, NextResponse } from 'next/server';
import { createTypedServerClient } from '@/lib/supabase/typed-client';

// POST /api/cma/applications/[id]/reject - Reject application
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

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single() as any;

    // Only CMA regulators can reject
    if (profile?.role !== 'CMA_REGULATOR' && profile?.role !== 'CMA_ADMIN') {
      return NextResponse.json({ error: 'Only CMA regulators can reject applications' }, { status: 403 });
    }

    const body = await request.json();
    const { reason, comments } = body;

    if (!reason) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 });
    }

    // Update application status to REJECTED
    const { data: updated, error: updateError } = (await supabase
      .from('ipo_applications')
      .update({
        status: 'CMA_REJECTED',
        current_phase: 'REJECTED',
        rejected_at: new Date().toISOString(),
        rejection_reason: reason,
        cma_rejection_comments: comments,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', id)
      .select()
      .single()) as any;

    if (updateError) {
      console.error('Error rejecting application:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Log the rejection action
    await supabase
      .from('application_activity_log')
      .insert({
        application_id: id,
        user_id: user.id,
        action: 'CMA_REJECTED',
        details: {
          reason,
          comments,
          rejected_by: profile?.full_name
        },
        created_at: new Date().toISOString()
      } as any);

    return NextResponse.json({
      success: true,
      application: updated,
      message: 'Application rejected'
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
