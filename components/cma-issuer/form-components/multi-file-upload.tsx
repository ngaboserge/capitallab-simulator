'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import { Document } from '@/lib/cma-issuer-system/types';



interface MultiFileUploadProps {
  onDocumentsChange: (documents: { certificateOfIncorporation: Document | null; memorandumAndArticles: Document | null }) => void;
  initialDocuments?: { certificateOfIncorporation: Document | null; memorandumAndArticles: Document | null };
}

export function MultiFileUpload({ onDocumentsChange, initialDocuments }: MultiFileUploadProps) {
  const [documents, setDocuments] = useState<{
    certificateOfIncorporation: Document | null;
    memorandumAndArticles: Document | null;
  }>(initialDocuments || {
    certificateOfIncorporation: null,
    memorandumAndArticles: null
  });

  const handleFileUpload = async (file: File, docType: 'certificateOfIncorporation' | 'memorandumAndArticles') => {
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
        [docType]: document
      };
      
      setDocuments(newDocuments);
      onDocumentsChange(newDocuments);
      
    } catch (error) {
      console.error('File upload error:', error);
      alert('Error uploading file. Please try again.');
    }
  };

  const removeDocument = (docType: 'certificateOfIncorporation' | 'memorandumAndArticles') => {
    const newDocuments = {
      ...documents,
      [docType]: null
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Required Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Certificate of Incorporation */}
        <div className="space-y-3">
          <h4 className="font-medium">Certificate of Incorporation *</h4>
          <p className="text-sm text-gray-600">Upload the official Certificate of Incorporation issued by RDB</p>
          
          {!documents.certificateOfIncorporation ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <input
                type="file"
                id="cert-upload"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'certificateOfIncorporation');
                }}
              />
              <label htmlFor="cert-upload" className="cursor-pointer">
                <Button variant="outline" asChild>
                  <span>Choose Certificate File</span>
                </Button>
              </label>
              <p className="text-xs text-gray-500 mt-2">PDF, JPG, JPEG, PNG (Max 10MB)</p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <File className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">{documents.certificateOfIncorporation.originalName}</p>
                  <p className="text-sm text-green-700">{formatFileSize(documents.certificateOfIncorporation.size)}</p>
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
                  onClick={() => removeDocument('certificateOfIncorporation')}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Memorandum and Articles */}
        <div className="space-y-3">
          <h4 className="font-medium">Memorandum and Articles of Association *</h4>
          <p className="text-sm text-gray-600">Upload the current Memorandum and Articles of Association</p>
          
          {!documents.memorandumAndArticles ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
              <input
                type="file"
                id="memo-upload"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'memorandumAndArticles');
                }}
              />
              <label htmlFor="memo-upload" className="cursor-pointer">
                <Button variant="outline" asChild>
                  <span>Choose Memorandum File</span>
                </Button>
              </label>
              <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX (Max 10MB)</p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <File className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">{documents.memorandumAndArticles.originalName}</p>
                  <p className="text-sm text-green-700">{formatFileSize(documents.memorandumAndArticles.size)}</p>
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
                  onClick={() => removeDocument('memorandumAndArticles')}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Status Summary */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between text-sm">
            <span>Documents Status:</span>
            <span className={`font-medium ${
              documents.certificateOfIncorporation && documents.memorandumAndArticles 
                ? 'text-green-600' 
                : 'text-orange-600'
            }`}>
              {documents.certificateOfIncorporation && documents.memorandumAndArticles 
                ? 'All Required Documents Uploaded' 
                : `${(documents.certificateOfIncorporation ? 1 : 0) + (documents.memorandumAndArticles ? 1 : 0)}/2 Documents Uploaded`
              }
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}