import { NextRequest, NextResponse } from 'next/server';
import { createTypedServerClient } from '@/lib/supabase/typed-client';

const BUCKET_NAME = 'applications';
const SIGNED_URL_EXPIRY = 3600; // 1 hour in seconds

/**
 * GET /api/cma/documents/[id]/download
 * Get a signed URL for secure document download
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createTypedServerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const documentId = id;

    // Get document metadata
    const { data: document, error: docError } = await supabase
      .from('documents')
      .select(`
        *,
        application:ipo_applications(
          id,
          company_id,
          assigned_ib_advisor,
          assigned_cma_officer,
          status
        )
      `)
      .eq('id', documentId)
      .eq('is_active', true)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Check user has permission to download document
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
    const application = (document as any).application;
    const hasAccess = 
      (profileData.role === 'ISSUER' && profileData.company_id === application.company_id) ||
      (profileData.role === 'IB_ADVISOR' && application.assigned_ib_advisor === user.id) ||
      (profileData.role === 'CMA_REGULATOR' && application.assigned_cma_officer === user.id) ||
      profileData.role === 'CMA_ADMIN';

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have access to this document' },
        { status: 403 }
      );
    }

    // Generate signed URL
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl((document as any).file_path, SIGNED_URL_EXPIRY);

    if (urlError || !signedUrlData) {
      console.error('Signed URL generation error:', urlError);
      return NextResponse.json(
        { error: 'Failed to generate download URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: signedUrlData.signedUrl,
      expiresIn: SIGNED_URL_EXPIRY,
      document: {
        id: (document as any).id,
        original_name: (document as any).original_name,
        file_size: (document as any).file_size,
        mime_type: (document as any).mime_type
      }
    });

  } catch (error) {
    console.error('Download document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
