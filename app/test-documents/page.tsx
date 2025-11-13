'use client';

import { useState, useEffect } from 'react';
import { SupabaseFileUpload } from '@/components/cma-issuer/form-components/supabase-file-upload';
import { DocumentListViewer } from '@/components/cma-issuer/form-components/document-viewer';
import { useDocumentManagement } from '@/lib/api/use-documents';
import { Document } from '@/lib/api/document-service';
import { useSimpleAuth } from '@/lib/auth/simple-auth-context';
import { SimpleAuthForm } from '@/components/auth/simple-auth-form';
import { Button } from '@/components/ui/button';

export default function TestDocumentsPage() {
  const { user, loading: authLoading, logout } = useSimpleAuth();
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [creatingApp, setCreatingApp] = useState(false);

  // Create a test application when user logs in
  useEffect(() => {
    async function createTestApplication() {
      if (!user || applicationId || creatingApp) return;
      
      setCreatingApp(true);
      try {
        // Create a test application
        const response = await fetch('/api/cma/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            offering_type: 'IPO',
            offering_size: 1000000,
            share_price: 10
          })
        });

        if (response.ok) {
          const data = await response.json();
          setApplicationId(data.application.id);
        } else {
          console.error('Failed to create test application');
        }
      } catch (error) {
        console.error('Error creating test application:', error);
      } finally {
        setCreatingApp(false);
      }
    }

    createTestApplication();
  }, [user, applicationId, creatingApp]);

  const {
    documents: loadedDocs,
    loading,
    error,
    uploadFile,
    deleteDocument
  } = useDocumentManagement({
    applicationId: applicationId || '',
    category: 'test_documents',
    autoLoad: !!applicationId
  });

  // Show loading state
  if (authLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user) {
    return (
      <div className="container mx-auto p-8 max-w-md">
        <h1 className="text-3xl font-bold mb-6">Document Storage Test</h1>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-6">
          <p className="text-sm">
            You need to be logged in to test document uploads. Please sign up or log in.
          </p>
        </div>
        <SimpleAuthForm />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Document Storage Test</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Logged in as: {user.email}
          </span>
          <Button variant="outline" size="sm" onClick={logout}>
            Logout
          </Button>
        </div>
      </div>

      {creatingApp && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded">
          Creating test application...
        </div>
      )}

      {!applicationId && !creatingApp && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
          Failed to create test application. Please check your database setup.
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
          Error: {error}
        </div>
      )}

      {applicationId && (
        <>
          <div className="bg-green-50 border border-green-200 p-4 rounded">
            <p className="text-sm">
              <strong>Test Application ID:</strong> {applicationId}
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Upload Documents</h2>
            <SupabaseFileUpload
              label="Test Documents"
              description="Upload test files to verify the document storage system"
              applicationId={applicationId}
              category="test_documents"
              acceptedTypes={['pdf', 'doc', 'docx', 'jpg', 'png']}
              maxFileSize={10}
              maxFiles={5}
              value={documents}
              onChange={setDocuments}
            />
          </div>
        </>
      )}

      {applicationId && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Loaded Documents</h2>
          {loading ? (
            <div>Loading documents...</div>
          ) : (
            <DocumentListViewer
              documents={loadedDocs}
              title="All Documents"
              emptyMessage="No documents uploaded yet"
            />
          )}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 p-4 rounded">
        <h3 className="font-semibold mb-2">Test Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Upload a test file using the form above</li>
          <li>Verify it appears in the "Loaded Documents" section</li>
          <li>Click "View" to preview (PDF/images only)</li>
          <li>Click "Download" to test secure downloads</li>
          <li>Click "Delete" to test deletion</li>
        </ol>
      </div>
    </div>
  );
}
