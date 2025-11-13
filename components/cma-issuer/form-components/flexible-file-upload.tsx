'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Document } from '@/lib/cma-issuer-system/types';

interface DocumentField {
  key: string;
  label: string;
  description: string;
  acceptedTypes: string[];
  required: boolean;
}

interface FlexibleFileUploadProps {
  title?: string;
  documentFields: DocumentField[];
  onDocumentsChange: (documents: Record<string, Document | null>) => void;
  initialDocuments?: Record<string, Document | null>;
}

export function FlexibleFileUpload({ 
  title = "Required Documents",
  documentFields, 
  onDocumentsChange, 
  initialDocuments 
}: FlexibleFileUploadProps) {
  const [documents, setDocuments] = useState<Record<string, Document | null>>(() => {
    const initial: Record<string, Document | null> = {};
    documentFields.forEach(field => {
      initial[field.key] = initialDocuments?.[field.key] || null;
    });
    return initial;
  });

  // Update documents when initialDocuments changes
  useEffect(() => {
    if (initialDocuments) {
      const updated: Record<string, Document | null> = {};
      documentFields.forEach(field => {
        updated[field.key] = initialDocuments[field.key] || null;
      });
      setDocuments(updated);
    }
  }, [initialDocuments, documentFields]);

  const handleFileUpload = async (file: File, documentKey: string) => {
    try {
      // Create Document object
      const document: Document = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        filename: `${Date.now()}_${file.name}`,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        uploadDate: new Date(),
        uploadedBy: 'current_user',
        category: 'application_document',
        url: URL.createObjectURL(file),
        checksum: 'mock_checksum',
        version: 1
      };

      // Update local state
      const newDocuments = {
        ...documents,
        [documentKey]: document
      };
      
      setDocuments(newDocuments);
      onDocumentsChange(newDocuments);
      
    } catch (error) {
      console.error('File upload error:', error);
      alert('Error uploading file. Please try again.');
    }
  };

  const removeDocument = (documentKey: string) => {
    const newDocuments = {
      ...documents,
      [documentKey]: null
    };
    
    setDocuments(newDocuments);
    onDocumentsChange(newDocuments);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAcceptString = (acceptedTypes: string[]) => {
    return acceptedTypes.map(type => `.${type}`).join(',');
  };

  const getAcceptDescription = (acceptedTypes: string[]) => {
    return acceptedTypes.map(type => type.toUpperCase()).join(', ') + ' (Max 10MB)';
  };

  const getUploadedCount = () => {
    return Object.values(documents).filter(doc => doc !== null).length;
  };

  const getRequiredCount = () => {
    return documentFields.filter(field => field.required).length;
  };

  const getTotalCount = () => {
    return documentFields.length;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {documentFields.map((field) => (
          <div key={field.key} className="space-y-3">
            <h4 className="font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </h4>
            <p className="text-sm text-gray-600">{field.description}</p>
            
            {!documents[field.key] ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <input
                  type="file"
                  id={`${field.key}-upload`}
                  className="hidden"
                  accept={getAcceptString(field.acceptedTypes)}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, field.key);
                  }}
                />
                <label htmlFor={`${field.key}-upload`} className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>Choose File</span>
                  </Button>
                </label>
                <p className="text-xs text-gray-500 mt-2">{getAcceptDescription(field.acceptedTypes)}</p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <File className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">{documents[field.key]!.originalName}</p>
                    <p className="text-sm text-green-700">{formatFileSize(documents[field.key]!.size)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Uploaded
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDocument(field.key)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Status Summary */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span>Documents Status:</span>
            <div className="flex items-center space-x-2">
              {getUploadedCount() >= getRequiredCount() ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-orange-600" />
              )}
              <span className={`font-medium ${
                getUploadedCount() >= getRequiredCount()
                  ? 'text-green-600' 
                  : 'text-orange-600'
              }`}>
                {getUploadedCount() >= getRequiredCount()
                  ? 'All Required Documents Uploaded' 
                  : `${getUploadedCount()}/${getTotalCount()} Documents Uploaded (${getRequiredCount()} required)`
                }
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}