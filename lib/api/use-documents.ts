/**
 * Document Management Hooks
 * 
 * React hooks for document upload, download, and management
 * with progress tracking and error handling.
 */

import { useState, useEffect, useCallback } from 'react';
import { DocumentService, Document, UploadProgress, UploadResult } from './document-service';

export interface UseDocumentsOptions {
  applicationId: string;
  category?: string;
  autoLoad?: boolean;
}

export interface UseDocumentsReturn {
  documents: Document[];
  loading: boolean;
  error: string | null;
  refreshDocuments: () => Promise<void>;
}

/**
 * Hook for listing application documents
 */
export function useDocuments({
  applicationId,
  category,
  autoLoad = true
}: UseDocumentsOptions): UseDocumentsReturn {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshDocuments = useCallback(async () => {
    if (!applicationId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await DocumentService.getDocuments(applicationId, category);
      
      if (result.success && result.documents) {
        setDocuments(result.documents);
      } else {
        setError(result.error || 'Failed to load documents');
        setDocuments([]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load documents';
      setError(errorMessage);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [applicationId, category]);

  // Auto-load documents on mount and when dependencies change
  useEffect(() => {
    if (autoLoad && applicationId) {
      refreshDocuments();
    }
  }, [autoLoad, refreshDocuments]);

  return {
    documents,
    loading,
    error,
    refreshDocuments
  };
}

export interface UseDocumentUploadOptions {
  applicationId: string;
  category: string;
  sectionId?: string | null;
  onSuccess?: (document: Document) => void;
  onError?: (error: string) => void;
}

export interface UseDocumentUploadReturn {
  uploadFile: (file: File) => Promise<UploadResult>;
  uploadFiles: (files: File[]) => Promise<UploadResult[]>;
  uploading: boolean;
  progress: Map<string, UploadProgress>;
  error: string | null;
}

/**
 * Hook for document upload with progress tracking
 */
export function useDocumentUpload({
  applicationId,
  category,
  sectionId,
  onSuccess,
  onError
}: UseDocumentUploadOptions): UseDocumentUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Map<string, UploadProgress>>(new Map());
  const [error, setError] = useState<string | null>(null);

  const handleProgress = useCallback((progressData: UploadProgress) => {
    setProgress(prev => {
      const newProgress = new Map(prev);
      newProgress.set(progressData.fileId, progressData);
      return newProgress;
    });
  }, []);

  const uploadFile = useCallback(async (file: File): Promise<UploadResult> => {
    try {
      setUploading(true);
      setError(null);

      const result = await DocumentService.uploadDocument(
        file,
        applicationId,
        category,
        sectionId,
        handleProgress
      );

      if (result.success && result.document) {
        onSuccess?.(result.document);
      } else {
        const errorMsg = result.error || 'Upload failed';
        setError(errorMsg);
        onError?.(errorMsg);
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setUploading(false);
      // Clean up progress after a delay
      setTimeout(() => {
        setProgress(new Map());
      }, 3000);
    }
  }, [applicationId, category, sectionId, handleProgress, onSuccess, onError]);

  const uploadFiles = useCallback(async (files: File[]): Promise<UploadResult[]> => {
    try {
      setUploading(true);
      setError(null);

      const results = await DocumentService.uploadDocuments(
        files,
        applicationId,
        category,
        sectionId,
        handleProgress
      );

      // Call onSuccess for each successful upload
      results.forEach(result => {
        if (result.success && result.document) {
          onSuccess?.(result.document);
        }
      });

      // Check for any failures
      const failures = results.filter(r => !r.success);
      if (failures.length > 0) {
        const errorMsg = failures.map(f => f.error).join(', ');
        setError(errorMsg);
        onError?.(errorMsg);
      }

      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      onError?.(errorMessage);
      return [{ success: false, error: errorMessage }];
    } finally {
      setUploading(false);
      // Clean up progress after a delay
      setTimeout(() => {
        setProgress(new Map());
      }, 3000);
    }
  }, [applicationId, category, sectionId, handleProgress, onSuccess, onError]);

  return {
    uploadFile,
    uploadFiles,
    uploading,
    progress,
    error
  };
}

export interface UseDocumentDownloadOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export interface UseDocumentDownloadReturn {
  downloadDocument: (documentId: string, originalName: string) => Promise<void>;
  downloading: boolean;
  error: string | null;
}

/**
 * Hook for secure document downloads
 */
export function useDocumentDownload({
  onSuccess,
  onError
}: UseDocumentDownloadOptions = {}): UseDocumentDownloadReturn {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadDocument = useCallback(async (documentId: string, originalName: string) => {
    try {
      setDownloading(true);
      setError(null);

      await DocumentService.downloadDocument(documentId, originalName);
      
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Download failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setDownloading(false);
    }
  }, [onSuccess, onError]);

  return {
    downloadDocument,
    downloading,
    error
  };
}

export interface UseDeleteDocumentOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export interface UseDeleteDocumentReturn {
  deleteDocument: (documentId: string) => Promise<void>;
  deleting: boolean;
  error: string | null;
}

/**
 * Hook for document deletion with confirmation
 */
export function useDeleteDocument({
  onSuccess,
  onError
}: UseDeleteDocumentOptions = {}): UseDeleteDocumentReturn {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteDocument = useCallback(async (documentId: string) => {
    try {
      setDeleting(true);
      setError(null);

      const result = await DocumentService.deleteDocument(documentId);

      if (result.success) {
        onSuccess?.();
      } else {
        const errorMsg = result.error || 'Delete failed';
        setError(errorMsg);
        onError?.(errorMsg);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setDeleting(false);
    }
  }, [onSuccess, onError]);

  return {
    deleteDocument,
    deleting,
    error
  };
}

/**
 * Combined hook for complete document management
 */
export interface UseDocumentManagementOptions {
  applicationId: string;
  category?: string;
  sectionId?: string | null;
  autoLoad?: boolean;
}

export interface UseDocumentManagementReturn {
  // Documents
  documents: Document[];
  loading: boolean;
  error: string | null;
  refreshDocuments: () => Promise<void>;
  
  // Upload
  uploadFile: (file: File) => Promise<UploadResult>;
  uploadFiles: (files: File[]) => Promise<UploadResult[]>;
  uploading: boolean;
  uploadProgress: Map<string, UploadProgress>;
  
  // Download
  downloadDocument: (documentId: string, originalName: string) => Promise<void>;
  downloading: boolean;
  
  // Delete
  deleteDocument: (documentId: string) => Promise<void>;
  deleting: boolean;
}

/**
 * All-in-one hook for document management
 */
export function useDocumentManagement({
  applicationId,
  category,
  sectionId,
  autoLoad = true
}: UseDocumentManagementOptions): UseDocumentManagementReturn {
  // List documents
  const {
    documents,
    loading,
    error: listError,
    refreshDocuments
  } = useDocuments({ applicationId, category, autoLoad });

  // Upload
  const {
    uploadFile,
    uploadFiles,
    uploading,
    progress: uploadProgress,
    error: uploadError
  } = useDocumentUpload({
    applicationId,
    category: category || 'general',
    sectionId,
    onSuccess: () => {
      // Refresh list after successful upload
      refreshDocuments();
    }
  });

  // Download
  const {
    downloadDocument,
    downloading,
    error: downloadError
  } = useDocumentDownload();

  // Delete
  const {
    deleteDocument: deleteDoc,
    deleting,
    error: deleteError
  } = useDeleteDocument({
    onSuccess: () => {
      // Refresh list after successful delete
      refreshDocuments();
    }
  });

  // Combine errors
  const error = listError || uploadError || downloadError || deleteError;

  return {
    documents,
    loading,
    error,
    refreshDocuments,
    uploadFile,
    uploadFiles,
    uploading,
    uploadProgress,
    downloadDocument,
    downloading,
    deleteDocument: deleteDoc,
    deleting
  };
}
