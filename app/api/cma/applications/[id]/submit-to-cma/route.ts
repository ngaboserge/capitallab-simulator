import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    const { id: applicationId } = await params;
    
    // Get request body
    const body = await request.json();
    const { 
      ibComments, 
      dealStructure, 
      assignedRegulatorId 
    } = body;

    // Validate required fields
    if (!ibComments || !assignedRegulatorId) {
      return NextResponse.json(
        { error: 'IB comments and assigned regulator are required' },
        { status: 400 }
      );
    }

    // Get current user (IB Advisor)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get IB Advisor profile
    const { data: ibProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !ibProfile) {
      return NextResponse.json(
        { error: 'IB Advisor profile not found' },
        { status: 404 }
      );
    }

    // Get CMA Regulator profile
    const { data: regulatorProfile, error: regulatorError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', assignedRegulatorId)
      .eq('role', 'CMA_REGULATOR')
      .single();

    if (regulatorError || !regulatorProfile) {
      return NextResponse.json(
        { error: 'CMA Regulator not found' },
        { status: 404 }
      );
    }

    // Get application details
    const { data: application, error: appError } = await supabase
      .from('ipo_applications')
      .select('*, companies(*)')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Update application with CMA submission details
    const { data: updatedApp, error: updateError } = await supabase
      .from('ipo_applications')
      .update({
        status: 'CMA_REVIEW',
        current_phase: 'CMA_REVIEW',
        assigned_cma_officer: assignedRegulatorId,
        submission_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating application:', updateError);
      return NextResponse.json(
        { error: 'Failed to update application' },
        { status: 500 }
      );
    }

    // Create a comment with IB submission details
    const { error: commentError } = await supabase
      .from('comments')
      .insert({
        application_id: applicationId,
        author_id: user.id,
        content: `IB Advisor Submission to CMA\n\n${ibComments}\n\nDeal Structure: ${JSON.stringify(dealStructure, null, 2)}`,
        comment_type: 'GENERAL',
        is_internal: false,
        priority: 'HIGH'
      });

    if (commentError) {
      console.error('Error creating comment:', commentError);
      // Don't fail the request if comment creation fails
    }

    // Create notification for CMA Regulator
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        recipient_id: assignedRegulatorId,
        sender_id: user.id,
        title: 'New Application Submitted for Review',
        message: `${ibProfile.full_name || ibProfile.username} has submitted application ${application.application_number} from ${application.companies?.legal_name} for your review.`,
        type: 'APPLICATION_SUBMITTED',
        application_id: applicationId,
        priority: 'HIGH',
        action_url: `/capitallab/collaborative/cma-regulator?applicationId=${applicationId}`,
        metadata: {
          ibComments,
          dealStructure,
          companyName: application.companies?.legal_name,
          applicationNumber: application.application_number
        }
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the request if notification creation fails
    }

    // Create audit log
    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        table_name: 'ipo_applications',
        record_id: applicationId,
        action: 'SUBMIT',
        new_values: {
          status: 'CMA_REVIEW',
          assigned_cma_officer: assignedRegulatorId,
          ib_comments: ibComments,
          deal_structure: dealStructure
        },
        changed_by: user.id,
        application_id: applicationId
      });

    if (auditError) {
      console.error('Error creating audit log:', auditError);
      // Don't fail the request if audit log creation fails
    }

    return NextResponse.json({
      success: true,
      application: updatedApp,
      message: `Application successfully submitted to ${regulatorProfile.full_name || regulatorProfile.username}`
    });

  } catch (error) {
    console.error('Error submitting to CMA:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
