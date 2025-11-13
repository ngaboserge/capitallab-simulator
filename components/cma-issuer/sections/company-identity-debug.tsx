'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/cma-issuer/form-components/file-upload';
import { Document } from '@/lib/cma-issuer-system/types';

interface DebugSectionProps {
  data: any;
  onDataChange: (data: any) => void;
  onSectionComplete: (isComplete: boolean) => void;
}

export function CompanyIdentityDebugSection({ data, onDataChange, onSectionComplete }: DebugSectionProps) {
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [localDocuments, setLocalDocuments] = useState<any>({
    certificateOfIncorporation: null,
    memorandumAndArticles: null
  });

  // Get current documents
  const documents = data?.companyIdentity?.documents || {};
  const cert = documents.certificateOfIncorporation;
  const memo = documents.memorandumAndArticles;

  // Update local state when data changes
  React.useEffect(() => {
    if (documents.certificateOfIncorporation || documents.memorandumAndArticles) {
      setLocalDocuments({
        certificateOfIncorporation: documents.certificateOfIncorporation || null,
        memorandumAndArticles: documents.memorandumAndArticles || null
      });
    }
  }, [documents.certificateOfIncorporation, documents.memorandumAndArticles]);

  const updateDocument = (docType: string, file: Document | null) => {
    // Use local state to ensure we have the latest documents
    const updatedLocalDocs = {
      ...localDocuments,
      [docType]: file
    };
    
    setLocalDocuments(updatedLocalDocs);

    const currentData = data || {};
    const currentCompanyIdentity = currentData.companyIdentity || {};

    // Use the updated local documents to ensure both are preserved
    const newData = {
      ...currentData,
      companyIdentity: {
        ...currentCompanyIdentity,
        documents: updatedLocalDocs
      }
    };

    console.log('Before update - localDocuments:', localDocuments);
    console.log('Before update - data.documents:', data?.companyIdentity?.documents);
    console.log('After update - updatedLocalDocs:', updatedLocalDocs);
    console.log('After update - newData.documents:', newData.companyIdentity.documents);
    
    setDebugInfo(`Updated ${docType}. Local docs: ${JSON.stringify(updatedLocalDocs, null, 2)}`);
    onDataChange(newData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Document Upload Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Debug Info */}
          <div className="p-4 bg-gray-100 rounded">
            <h4 className="font-semibold mb-2">Current State:</h4>
            <pre className="text-xs overflow-auto">
              {JSON.stringify({ 
                cert: cert ? { name: cert.originalName, id: cert.id } : null,
                memo: memo ? { name: memo.originalName, id: memo.id } : null,
                fullData: data
              }, null, 2)}
            </pre>
          </div>

          {/* Certificate Upload */}
          <div>
            <h4 className="font-medium mb-2">Certificate of Incorporation</h4>
            <FileUpload
              label="Certificate Upload"
              description="Upload certificate"
              acceptedTypes={['pdf', 'jpg', 'jpeg', 'png']}
              required={true}
              value={cert}
              onChange={(file) => {
                console.log('Certificate onChange called with:', file);
                updateDocument('certificateOfIncorporation', file as Document);
              }}
            />
            {cert && (
              <div className="mt-2 p-2 bg-green-50 rounded">
                ✅ Certificate: {cert.originalName}
              </div>
            )}
          </div>

          {/* Memorandum Upload */}
          <div>
            <h4 className="font-medium mb-2">Memorandum and Articles</h4>
            <FileUpload
              label="Memorandum Upload"
              description="Upload memorandum"
              acceptedTypes={['pdf', 'doc', 'docx']}
              required={true}
              value={memo}
              onChange={(file) => {
                console.log('Memorandum onChange called with:', file);
                updateDocument('memorandumAndArticles', file as Document);
              }}
            />
            {memo && (
              <div className="mt-2 p-2 bg-green-50 rounded">
                ✅ Memorandum: {memo.originalName}
              </div>
            )}
          </div>

          {/* Debug Output */}
          {debugInfo && (
            <div className="p-4 bg-blue-50 rounded">
              <h4 className="font-semibold mb-2">Last Update:</h4>
              <pre className="text-xs">{debugInfo}</pre>
            </div>
          )}

          {/* Test Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                console.log('Current data:', data);
                setDebugInfo(`Current data: ${JSON.stringify(data, null, 2)}`);
              }}
              variant="outline"
            >
              Log Current Data
            </Button>
            <Button 
              onClick={() => {
                const testData = {
                  companyIdentity: {
                    documents: {
                      certificateOfIncorporation: null,
                      memorandumAndArticles: null
                    }
                  }
                };
                onDataChange(testData);
                setDebugInfo('Reset documents to null');
              }}
              variant="outline"
            >
              Reset Documents
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}