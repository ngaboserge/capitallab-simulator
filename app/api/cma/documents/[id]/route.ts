import { NextRequest, NextResponse } from 'next/server';
import { createTypedServerClient } from '@/lib/supabase/typed-client';

const BUCKET_NAME = 'applications';

/**
 * GET /api/cma/documents/[id]
 * Get document metadata
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

    // Check user has permission to access document
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

    // Remove application data from response
    const { application: _, ...documentData } = document as any;

    return NextResponse.json({
      success: true,
      document: documentData
    });

  } catch (error) {
    console.error('Get document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cma/documents/[id]
 * Delete a document
 */
export async function DELETE(
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

    const documentId = id;

    // Get document info
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

    // Check user has permission to delete document
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
    
    // Only issuer (owner) or CMA admin can delete documents
    const canDelete = 
      (profileData.role === 'ISSUER' && profileData.company_id === application.company_id) ||
      profileData.role === 'CMA_ADMIN';

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Forbidden: You do not have permission to delete this document' },
        { status: 403 }
      );
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([(document as any).file_path]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
      // Continue with soft delete even if storage delete fails
    }

    // Soft delete in database
    const { error: updateError } = await supabase
      .from('documents')
      .update({ is_active: false } as any)
      .eq('id', documentId);

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to delete document: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Delete document error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
