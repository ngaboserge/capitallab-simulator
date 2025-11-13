import { NextRequest, NextResponse } from 'next/server';
import { createTypedServerClient } from '@/lib/supabase/typed-client';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/gif'
];

const BUCKET_NAME = 'applications';

/**
 * POST /api/cma/documents/upload
 * Upload a document to Supabase Storage and create metadata record
 */
export async function POST(request: NextRequest) {
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const applicationId = formData.get('applicationId') as string | null;
    const sectionId = formData.get('sectionId') as string | null;
    const category = formData.get('category') as string | null;

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `File type ${file.type} is not supported` },
        { status: 400 }
      );
    }

    // Check for empty files
    if (file.size === 0) {
      return NextResponse.json(
        { error: 'File is empty' },
        { status: 400 }
      );
    }

    // Security check for file name
    const suspiciousPatterns = ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.js'];
    const fileName = file.name.toLowerCase();
    
    for (const pattern of suspiciousPatterns) {
      if (fileName.includes(pattern)) {
        return NextResponse.json(
          { error: 'File type not allowed for security reasons' },
          { status: 400 }
        );
      }
    }

    // Verify user has access to the application
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

    // Check user has permission to upload documents
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

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const storagePath = sectionId 
      ? `${applicationId}/section-${sectionId}/${timestamp}_${randomId}.${fileExtension}`
      : `${applicationId}/${category}/${timestamp}_${randomId}.${fileExtension}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Create document metadata record
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        application_id: applicationId,
        section_id: sectionId || null,
        filename: uploadData.path,
        original_name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        mime_type: file.type,
        category,
        uploaded_by: user.id
      } as any)
      .select()
      .single();

    if (docError) {
      console.error('Database insert error:', docError);
      
      // Clean up uploaded file if database insert fails
      await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
      
      return NextResponse.json(
        { error: `Failed to create document record: ${docError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      document
    });

  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
