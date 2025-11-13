import { NextRequest, NextResponse } from 'next/server';
import { createTypedServerClient } from '@/lib/supabase/typed-client';

/**
 * GET /api/cma/applications/[id]/documents
 * Get all documents for an application
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createTypedServerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const applicationId = params.id;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Verify application exists and user has access
    const { data: application, error: appError } = await supabase
      .from('ipo_applications')
      .select('id, company_id, assigned_ib_advisor, assigned_cma_officer, status')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check user has permission to view documents
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, company_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const profileData = profile as any;
    const appData = application as any;
    const hasAccess = 
      (profileData.role === 'ISSUER' && profileData.company_id === appData.company_id) ||
      (profileData.role === 'IB_ADVISOR' && appData.assigned_ib_advisor === user.id) ||
      (profileData.role === 'CMA_REGULATOR' && appData.assigned_cma_officer === user.id) ||
      profileData.role === 'CMA_ADMIN';

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to this application' },
        { status: 403 }
      );
    }

    // Build query
    let query = supabase
      .from('documents')
      .select('*')
      .eq('application_id', applicationId)
      .eq('is_active', true)
      .order('uploaded_at', { ascending: false });

    // Filter by category if provided
    if (category) {
      query = query.eq('category', category);
    }

    const { data: documents, error: docsError } = await query;

    if (docsError) {
      console.error('Error fetching documents:', docsError);
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      documents: documents || []
    });

  } catch (error) {
    console.error('Get documents error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
