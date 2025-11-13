import { supabase } from './client';
import { Document } from './types';

export interface UploadResult {
  success: boolean;
  document?: Document;
  error?: string;
}

export interface UploadProgress {
  fileId: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export class SupabaseStorageService {
  private static readonly BUCKET_NAME = 'cma-documents';
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  
  private static readonly ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];

  /**
   * Upload a file to Supabase Storage
   */
  static async uploadFile(
    file: File,
    applicationId: string,
    category: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Check if this is a demo or transfer application
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || applicationId.startsWith('demo-') || applicationId.startsWith('ib_transfer_')) {
        // Handle demo/transfer mode - create a demo document
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const fileId = `${timestamp}_${randomId}`;
        
        onProgress?.({
          fileId,
          progress: 100,
          status: 'success'
        });
        
        const demoDocument: Document = {
          id: `demo-upload-${fileId}`,
          application_id: applicationId,
          section_id: null,
          filename: `${timestamp}_${file.name}`,
          original_name: file.name,
          file_path: `demo/${file.name}`,
          file_size: file.size,
          mime_type: file.type,
          category,
          uploaded_by: user?.id || 'demo-user',
          uploaded_at: new Date().toISOString(),
          is_active: true,
          url: URL.createObjectURL(file),
          description: null,
          version: 1,
          checksum: null,
          is_confidential: false
        };
        
        return { success: true, document: demoDocument };
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const filename = `${applicationId}/${category}/${timestamp}_${randomId}.${fileExtension}`;

      // Report upload start
      const fileId = `${timestamp}_${randomId}`;
      onProgress?.({
        fileId,
        progress: 0,
        status: 'uploading'
      });

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        onProgress?.({
          fileId,
          progress: 0,
          status: 'error',
          error: uploadError.message
        });
        return { success: false, error: uploadError.message };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filename);

      // Create document record in database
      const document = {
        application_id: applicationId,
        section_id: null,
        filename: uploadData.path,
        original_name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        mime_type: file.type,
        category,
        uploaded_by: (await supabase.auth.getUser()).data.user?.id || '',
        uploaded_at: new Date().toISOString(),
        is_active: true
      };

      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert(document as any)
        .select()
        .single();

      if (docError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage.from(this.BUCKET_NAME).remove([filename]);
        
        onProgress?.({
          fileId,
          progress: 0,
          status: 'error',
          error: docError.message
        });
        return { success: false, error: docError.message };
      }

      // Report success
      onProgress?.({
        fileId,
        progress: 100,
        status: 'success'
      });

      return {
        success: true,
        document: {
          ...(docData as any),
          url: urlData.publicUrl
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Upload multiple files
   */
  static async uploadFiles(
    files: File[],
    applicationId: string,
    category: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    for (const file of files) {
      const result = await this.uploadFile(file, applicationId, category, onProgress);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Delete a document
   */
  static async deleteDocument(documentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get document info
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('file_path')
        .eq('id', documentId)
        .single();

      if (fetchError) {
        return { success: false, error: fetchError.message };
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([(document as any).file_path]);

      if (storageError) {
        return { success: false, error: storageError.message };
      }

      // Mark as inactive in database (soft delete)
      const { error: dbError } = await (supabase as any)
        .from('documents')
        .update({ is_active: false })
        .eq('id', documentId);

      if (dbError) {
        return { success: false, error: dbError.message };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get documents for an application
   */
  static async getDocuments(applicationId: string): Promise<Document[]> {
    try {
      // Check if we have a valid user session
      const { data: { user } } = await supabase.auth.getUser();
      
      // If no user, demo application ID, or IB transfer key, return demo/localStorage documents
      if (!user || applicationId.startsWith('demo-') || applicationId.startsWith('ib_transfer_')) {
        return this.getDemoDocuments(applicationId);
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('application_id', applicationId)
        .eq('is_active', true)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        return this.getDemoDocuments(applicationId);
      }

      // Add public URLs
      return data.map((doc: any) => ({
        ...doc,
        url: supabase.storage.from(this.BUCKET_NAME).getPublicUrl(doc.file_path).data.publicUrl
      }));
    } catch (error) {
      console.error('Error in getDocuments:', error);
      return this.getDemoDocuments(applicationId);
    }
  }

  /**
   * Get demo documents for demonstration purposes
   * Also handles loading documents from localStorage for transferred applications
   */
  private static getDemoDocuments(applicationId: string): Document[] {
    // If this is a transfer key, try to load actual documents from localStorage
    if (typeof window !== 'undefined' && applicationId.startsWith('ib_transfer_')) {
      try {
        console.log('🔍 Loading documents for transfer key:', applicationId);
        const transferData = localStorage.getItem(applicationId);
        
        if (transferData) {
          const parsedData = JSON.parse(transferData);
          console.log('📦 Transfer data loaded:', {
            hasSections: !!parsedData.sections,
            sectionCount: parsedData.sections ? Object.keys(parsedData.sections).length : 0,
            metadata: parsedData.metadata
          });
          
          const documents: Document[] = [];
          
          // Extract documents from all sections
          if (parsedData.sections) {
            Object.values(parsedData.sections).forEach((section: any) => {
              console.log(`📄 Checking section ${section.section_number}:`, {
                hasData: !!section.data,
                status: section.status
              });
              
              if (section.data) {
                this.extractDocumentsFromData(section.data, documents, applicationId, section.section_number);
              }
            });
          }
          
          console.log(`✅ Extracted ${documents.length} documents from transfer data`);
          
          // If we found documents, return them
          if (documents.length > 0) {
            return documents;
          } else {
            console.log('⚠️ No documents found in transfer data, using demo documents');
          }
        } else {
          console.log('⚠️ No transfer data found in localStorage for key:', applicationId);
        }
      } catch (error) {
        console.error('❌ Error loading documents from transfer data:', error);
      }
    }
    
    // Return default demo documents
    return [
      {
        id: `demo-doc-1-${applicationId}`,
        application_id: applicationId,
        section_id: null,
        filename: 'certificate_of_incorporation.pdf',
        original_name: 'Certificate of Incorporation.pdf',
        file_path: 'demo/certificate_of_incorporation.pdf',
        file_size: 2048576, // 2MB
        mime_type: 'application/pdf',
        category: 'incorporation_documents',
        uploaded_by: 'demo-user',
        uploaded_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        is_active: true,
        url: '/demo-documents/certificate_of_incorporation.pdf',
        description: null,
        version: 1,
        checksum: null,
        is_confidential: false
      },
      {
        id: `demo-doc-2-${applicationId}`,
        application_id: applicationId,
        section_id: null,
        filename: 'audited_financials_2023.pdf',
        original_name: 'Audited Financial Statements 2023.pdf',
        file_path: 'demo/audited_financials_2023.pdf',
        file_size: 5242880, // 5MB
        mime_type: 'application/pdf',
        category: 'financial_documents',
        uploaded_by: 'demo-user',
        uploaded_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        is_active: true,
        url: '/demo-documents/audited_financials_2023.pdf',
        description: null,
        version: 1,
        checksum: null,
        is_confidential: false
      },
      {
        id: `demo-doc-3-${applicationId}`,
        application_id: applicationId,
        section_id: null,
        filename: 'memorandum_articles.pdf',
        original_name: 'Memorandum and Articles of Association.pdf',
        file_path: 'demo/memorandum_articles.pdf',
        file_size: 1572864, // 1.5MB
        mime_type: 'application/pdf',
        category: 'legal_documents',
        uploaded_by: 'demo-user',
        uploaded_at: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        is_active: true,
        url: '/demo-documents/memorandum_articles.pdf',
        description: null,
        version: 1,
        checksum: null,
        is_confidential: false
      }
    ];
  }

  /**
   * Helper to extract documents from nested data structure
   */
  private static extractDocumentsFromData(
    data: any, 
    documents: Document[], 
    applicationId: string, 
    sectionNumber?: number
  ): void {
    if (!data || typeof data !== 'object') return;
    
    for (const key in data) {
      const value = data[key];
      
      // Check if this looks like a document object
      if (value && typeof value === 'object' && value.id && value.filename && value.originalName) {
        console.log(`📎 Found document in section ${sectionNumber}:`, {
          key,
          filename: value.filename,
          originalName: value.originalName,
          hasUrl: !!value.url
        });
        
        documents.push({
          id: value.id,
          application_id: applicationId,
          section_id: sectionNumber ? `section-${sectionNumber}` : null,
          filename: value.filename,
          original_name: value.originalName,
          file_path: value.storagePath || value.filename,
          file_size: value.size || null,
          mime_type: value.type || null,
          category: value.category || 'general',
          uploaded_by: value.uploadedBy || 'issuer',
          uploaded_at: value.uploadedAt || new Date().toISOString(),
          is_active: true,
          url: value.url || `/demo-documents/${value.filename}`,
          description: null,
          version: 1,
          checksum: null,
          is_confidential: false
        });
      } else if (value && typeof value === 'object') {
        // Recursively search nested objects
        this.extractDocumentsFromData(value, documents, applicationId, sectionNumber);
      }
    }
  }

  /**
   * Validate file before upload
   */
  private static validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds ${this.MAX_FILE_SIZE / (1024 * 1024)}MB limit`
      };
    }

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not supported`
      };
    }

    // Check for empty files
    if (file.size === 0) {
      return {
        valid: false,
        error: 'File is empty'
      };
    }

    // Basic security check for file name
    const suspiciousPatterns = ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.js'];
    const fileName = file.name.toLowerCase();
    
    for (const pattern of suspiciousPatterns) {
      if (fileName.includes(pattern)) {
        return {
          valid: false,
          error: 'File type not allowed for security reasons'
        };
      }
    }

    return { valid: true };
  }

  /**
   * Initialize storage bucket (call this during setup)
   */
  static async initializeBucket(): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        return { success: false, error: listError.message };
      }

      const bucketExists = buckets?.some(bucket => bucket.name === this.BUCKET_NAME);
      
      if (!bucketExists) {
        // Create bucket
        const { error: createError } = await supabase.storage.createBucket(this.BUCKET_NAME, {
          public: true,
          allowedMimeTypes: this.ALLOWED_TYPES,
          fileSizeLimit: this.MAX_FILE_SIZE
        });

        if (createError) {
          return { success: false, error: createError.message };
        }
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bucket initialization failed';
      return { success: false, error: errorMessage };
    }
  }
}