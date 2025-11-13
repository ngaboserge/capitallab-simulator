import { useState, useEffect, useCallback } from 'react';
import { SupabaseStorageService } from './storage';
import { Document } from './types';

export interface UseDocumentsOptions {
  applicationId: string;
  category?: string;
  autoLoad?: boolean;
}

export interface UseDocumentsReturn {
  documents: Document[];
  loading: boolean;
  error: string | null;
  uploadFile: (file: File, category: string) => Promise<void>;
  uploadFiles: (files: File[], category: string) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  refreshDocuments: () => Promise<void>;
}

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
      
      // Get documents (will automatically handle demo mode)
      const docs = await SupabaseStorageService.getDocuments(applicationId);
      
      // Filter by category if specified
      const filteredDocs = category 
        ? docs.filter(doc => doc.category === category)
        : docs;
        
      setDocuments(filteredDocs);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load documents';
      setError(errorMessage);
      console.error('Error loading documents:', err);
      
      // Fallback to empty array on error
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [applicationId, category]);

  const uploadFile = useCallback(async (file: File, uploadCategory: string) => {
    try {
      setError(null);
      
      // Handle demo mode
      if (applicationId.startsWith('demo-')) {
        // Create demo document
        const demoDocument: Document = {
          id: `demo-upload-${Date.now()}`,
          application_id: applicationId,
          section_id: null,
          filename: `${Date.now()}_${file.name}`,
          original_name: file.name,
          file_path: `demo/${file.name}`,
          file_size: file.size,
          mime_type: file.type,
          category: uploadCategory,
          uploaded_by: 'demo-user',
          uploaded_at: new Date().toISOString(),
          is_active: true,
          url: URL.createObjectURL(file) // Create temporary URL for demo
        };

        // Add to local state if it matches our category filter
        if (!category || uploadCategory === category) {
          setDocuments(prev => [demoDocument, ...prev]);
        }
        return;
      }

      const result = await SupabaseStorageService.uploadFile(
        file,
        applicationId,
        uploadCategory
      );

      if (result.success && result.document) {
        // Add to local state if it matches our category filter
        if (!category || uploadCategory === category) {
          setDocuments(prev => [result.document!, ...prev]);
        }
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw err;
    }
  }, [applicationId, category]);

  const uploadFiles = useCallback(async (files: File[], uploadCategory: string) => {
    try {
      setError(null);
      const results = await SupabaseStorageService.uploadFiles(
        files,
        applicationId,
        uploadCategory
      );

      const successfulUploads = results
        .filter(result => result.success && result.document)
        .map(result => result.document!);

      // Add to local state if they match our category filter
      if (!category || uploadCategory === category) {
        setDocuments(prev => [...successfulUploads, ...prev]);
      }

      // Check for any failures
      const failures = results.filter(result => !result.success);
      if (failures.length > 0) {
        const errorMessages = failures.map(f => f.error).join(', ');
        throw new Error(`Some uploads failed: ${errorMessages}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      throw err;
    }
  }, [applicationId, category]);

  const deleteDocument = useCallback(async (documentId: string) => {
    try {
      setError(null);
      
      // Handle demo mode
      if (documentId.startsWith('demo-')) {
        // Just remove from local state in demo mode
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
        return;
      }

      const result = await SupabaseStorageService.deleteDocument(documentId);

      if (result.success) {
        // Remove from local state
        setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      } else {
        throw new Error(result.error || 'Delete failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMessage);
      throw err;
    }
  }, []);

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
    uploadFile,
    uploadFiles,
    deleteDocument,
    refreshDocuments
  };
}