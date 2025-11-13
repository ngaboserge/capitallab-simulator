import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

// PATCH /api/cma/applications/[id]/feedback/[feedbackId] - Update feedback status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; feedbackId: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status, response } = body;

    // Get feedback and verify access
    const { data: feedback } = await supabase
      .from('application_feedback')
      .select('*, application:ipo_applications(company_id, assigned_ib_advisor)')
      .eq('id', params.feedbackId)
      .single();

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, company_id')
      .eq('id', user.id)
      .single();

    // Check access with type assertions
    const feedbackData = feedback as any;
    const feedbackApp = feedbackData?.application || {};
    const profileData = profile as any;
    
    const isIBAdvisor = profileData?.role === 'IB_ADVISOR' && 
                        feedbackApp?.assigned_ib_advisor === user.id;
    const isIssuer = profileData?.company_id === feedbackApp?.company_id;

    if (!isIBAdvisor && !isIssuer) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const updates: any = {};
    
    if (status) {
      updates.status = status;
      if (status === 'RESOLVED') {
        updates.resolved_at = new Date().toISOString();
        updates.resolved_by = user.id;
      }
    }

    if (response) {
      if (isIBAdvisor) {
        updates.ib_response = response;
      } else {
        updates.issuer_response = response;
      }
    }

    const { data: updatedFeedback, error } = await supabase
      .from('application_feedback')
      .update(updates)
      .eq('id', params.feedbackId)
      .select(`
        *,
        creator:profiles!application_feedback_created_by_fkey(id, full_name, role),
        resolver:profiles!application_feedback_resolved_by_fkey(id, full_name, role)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Notify the other party
    const notifyUserId = isIBAdvisor 
      ? feedbackApp?.company_id 
      : feedbackApp?.assigned_ib_advisor;

    if (notifyUserId) {
      const notificationTitle = isIssuer 
        ? 'Issuer Response to Feedback'
        : 'IB Advisor Updated Feedback';
      
      const notificationMessage = response 
        ? `New response: ${response.substring(0, 100)}...`
        : `Feedback status updated to ${status}`;

      await supabase.from('notifications').insert({
        recipient_id: notifyUserId,
        title: notificationTitle,
        message: notificationMessage,
        type: 'COMMENT_ADDED',
        application_id: params.id,
        priority: 'MEDIUM'
      } as any);
    }

    return NextResponse.json({ feedback: updatedFeedback });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET /api/cma/applications/[id]/feedback/[feedbackId] - Get feedback comments
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; feedbackId: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: comments, error } = await supabase
      .from('feedback_comments')
      .select(`
        *,
        author:profiles!feedback_comments_author_id_fkey(id, full_name, role)
      `)
      .eq('feedback_id', params.feedbackId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ comments: comments || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/cma/applications/[id]/feedback/[feedbackId] - Add comment to feedback
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; feedbackId: string } }
) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const { data: comment, error } = await supabase
      .from('feedback_comments')
      .insert({
        feedback_id: params.feedbackId,
        author_id: user.id,
        content: content.trim()
      } as any)
      .select(`
        *,
        author:profiles!feedback_comments_author_id_fkey(id, full_name, role)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get feedback to notify relevant parties
    const { data: feedback } = await supabase
      .from('application_feedback')
      .select('application_id, application:ipo_applications(company_id, assigned_ib_advisor)')
      .eq('id', params.feedbackId)
      .single();

    if (feedback) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, company_id, full_name')
        .eq('id', user.id)
        .single();

      // Notify the other party
      const feedbackData = feedback as any;
      const feedbackApp = feedbackData?.application || {};
      const profileData = profile as any;
      
      const isIssuer = profileData?.company_id === feedbackApp?.company_id;
      const notifyUserId = isIssuer 
        ? feedbackApp?.assigned_ib_advisor
        : null;

      // If issuer commented, notify IB Advisor
      if (notifyUserId) {
        await supabase.from('notifications').insert({
          recipient_id: notifyUserId,
          title: 'New Comment on Feedback',
          message: `${profileData?.full_name || 'Someone'} commented: ${content.substring(0, 100)}...`,
          type: 'COMMENT_ADDED',
          application_id: feedbackData?.application_id,
          priority: 'MEDIUM'
        } as any);
      }

      // If IB Advisor commented, notify issuer team
      if (profileData?.role === 'IB_ADVISOR') {
        const { data: issuerTeam } = await supabase
          .from('profiles')
          .select('id')
          .eq('company_id', feedbackApp?.company_id)
          .neq('id', user.id);

        if (issuerTeam && issuerTeam.length > 0) {
          const notifications = (issuerTeam as any[]).map((member: any) => ({
            recipient_id: member.id,
            title: 'New Comment from IB Advisor',
            message: `${profileData?.full_name || 'IB Advisor'} commented: ${content.substring(0, 100)}...`,
            type: 'COMMENT_ADDED',
            application_id: feedbackData?.application_id,
            priority: 'MEDIUM'
          }));

          await supabase.from('notifications').insert(notifications as any);
        }
      }
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
