// Mock documents hook
import { useState, useEffect } from 'react';
import { USE_MOCK_DATA, MOCK_DOCUMENTS } from './mock-toggle';

export function useMockDocuments(applicationId?: string) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!USE_MOCK_DATA || !applicationId) {
      setLoading(false);
      return;
    }

    const loadDocuments = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const appDocuments = MOCK_DOCUMENTS.filter(doc => doc.application_id === applicationId);
        setDocuments(appDocuments);
        setError(null);
      } catch (err) {
        setError('Failed to load documents');
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [applicationId]);

  const uploadDocument = async (file: File, category: string, description?: string) => {
    if (!USE_MOCK_DATA) {
      throw new Error('Mock service called when USE_MOCK_DATA is false');
    }

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockDocument = {
      id: `mock-doc-${Date.now()}`,
      application_id: applicationId,
      filename: file.name.toLowerCase().replace(/\s+/g, '_'),
      original_name: file.name,
      file_path: `/mock/documents/${file.name}`,
      file_size: file.size,
      mime_type: file.type,
      category: category,
      description: description || file.name,
      version: 1,
      uploaded_by: 'mock-user',
      uploaded_at: new Date().toISOString(),
      is_active: true,
      is_confidential: false
    };

    // Add to local state
    setDocuments(prev => [...prev, mockDocument]);

    return {
      data: mockDocument,
      error: null
    };
  };

  const deleteDocument = async (documentId: string) => {
    if (!USE_MOCK_DATA) {
      throw new Error('Mock service called when USE_MOCK_DATA is false');
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    // Remove from local state
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));

    return {
      data: { success: true },
      error: null
    };
  };

  const downloadDocument = async (documentId: string) => {
    if (!USE_MOCK_DATA) {
      throw new Error('Mock service called when USE_MOCK_DATA is false');
    }

    // For mock, just show an alert
    const document = documents.find(doc => doc.id === documentId);
    if (document) {
      alert(`Mock: Would download ${document.original_name}`);
    }

    return {
      data: { url: '#' },
      error: null
    };
  };

  return {
    documents,
    loading,
    error,
    uploadDocument,
    deleteDocument,
    downloadDocument,
    refetch: () => {
      // Trigger a re-load
      setLoading(true);
      setTimeout(() => {
        const appDocuments = MOCK_DOCUMENTS.filter(doc => doc.application_id === applicationId);
        setDocuments(appDocuments);
        setLoading(false);
      }, 300);
    }
  };
}