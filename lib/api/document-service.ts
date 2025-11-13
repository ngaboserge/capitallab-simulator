/**
 * Document Service
 * 
 * Handles document upload, download, and deletion operations
 * with Supabase Storage integration.
 */

export interface Document {
  id: string;
  application_id: string;
  section_id?: string | null;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  category: string;
  uploaded_by: string;
  uploaded_at: string;
  is_active: boolean;
  url?: string;
}

export interface UploadProgress {
  fileId: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export interface UploadResult {
  success: boolean;
  document?: Document;
  error?: string;
}

export interface DownloadResult {
  success: boolean;
  url?: string;
  expiresIn?: number;
  error?: string;
}

export interface DeleteResult {
  success: boolean;
  error?: string;
}

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

export class DocumentService {
  /**
   * Validate file before upload
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`
      };
    }

    // Check file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
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

    // Security check for file name
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
   * Upload a document with progress tracking
   */
  static async uploadDocument(
    file: File,
    applicationId: string,
    category: string,
    sectionId?: string | null,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Generate unique file ID for progress tracking
      const fileId = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

      // Report upload start
      onProgress?.({
        fileId,
        progress: 0,
        status: 'uploading'
      });

      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('applicationId', applicationId);
      formData.append('category', category);
      if (sectionId) {
        formData.append('sectionId', sectionId);
      }

      // Upload via API
      const response = await fetch('/api/cma/documents/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        onProgress?.({
          fileId,
          progress: 0,
          status: 'error',
          error: errorData.error || 'Upload failed'
        });
        return {
          success: false,
          error: errorData.error || 'Upload failed'
        };
      }

      const data = await response.json();

      // Report success
      onProgress?.({
        fileId,
        progress: 100,
        status: 'success'
      });

      return {
        success: true,
        document: data.document
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Upload multiple documents
   */
  static async uploadDocuments(
    files: File[],
    applicationId: string,
    category: string,
    sectionId?: string | null,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    
    for (const file of files) {
      const result = await this.uploadDocument(
        file,
        applicationId,
        category,
        sectionId,
        onProgress
      );
      results.push(result);
    }
    
    return results;
  }

  /**
   * Generate signed URL for secure download
   */
  static async generateSignedUrl(documentId: string): Promise<DownloadResult> {
    try {
      const response = await fetch(`/api/cma/documents/${documentId}/download`);

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to generate download URL'
        };
      }

      const data = await response.json();

      return {
        success: true,
        url: data.url,
        expiresIn: data.expiresIn
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate download URL';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get document metadata
   */
  static async getDocument(documentId: string): Promise<{ success: boolean; document?: Document; error?: string }> {
    try {
      const response = await fetch(`/api/cma/documents/${documentId}`);

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to get document'
        };
      }

      const data = await response.json();

      return {
        success: true,
        document: data.document
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get document';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Delete a document with storage cleanup
   */
  static async deleteDocument(documentId: string): Promise<DeleteResult> {
    try {
      const response = await fetch(`/api/cma/documents/${documentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to delete document'
        };
      }

      return { success: true };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete document';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get documents for an application
   */
  static async getDocuments(
    applicationId: string,
    category?: string
  ): Promise<{ success: boolean; documents?: Document[]; error?: string }> {
    try {
      const params = new URLSearchParams({ applicationId });
      if (category) {
        params.append('category', category);
      }

      const response = await fetch(`/api/cma/applications/${applicationId}/documents?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || 'Failed to get documents'
        };
      }

      const data = await response.json();

      return {
        success: true,
        documents: data.documents || []
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get documents';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Download a document
   */
  static async downloadDocument(documentId: string, originalName: string): Promise<void> {
    try {
      // Get signed URL
      const result = await this.generateSignedUrl(documentId);

      if (!result.success || !result.url) {
        throw new Error(result.error || 'Failed to get download URL');
      }

      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = result.url;
      link.download = originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Download failed';
      throw new Error(errorMessage);
    }
  }

  /**
   * Get allowed file types
   */
  static getAllowedMimeTypes(): string[] {
    return [...ALLOWED_MIME_TYPES];
  }

  /**
   * Get max file size
   */
  static getMaxFileSize(): number {
    return MAX_FILE_SIZE;
  }

  /**
   * Format file size for display
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get file extension from filename
   */
  static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  /**
   * Get file type label from MIME type
   */
  static getFileTypeLabel(mimeType: string): string {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('image')) return 'Image';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'Word';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'Excel';
    return 'Document';
  }
}
