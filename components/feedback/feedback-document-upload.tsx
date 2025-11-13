'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';

interface FeedbackDocumentUploadProps {
  feedbackId: string;
  category: string;
  onUploadComplete: (files: UploadedFile[]) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
}

export function FeedbackDocumentUpload({ feedbackId, category, onUploadComplete }: FeedbackDocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    
    try {
      // Simulate upload - in real implementation, this would upload to storage
      const uploaded: UploadedFile[] = files.map(file => ({
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        uploadedAt: new Date().toISOString()
      }));

      // Store in localStorage for demo
      const storageKey = `feedback_documents_${feedbackId}`;
      const existing = localStorage.getItem(storageKey);
      const existingDocs = existing ? JSON.parse(existing) : [];
      const allDocs = [...existingDocs, ...uploaded];
      localStorage.setItem(storageKey, JSON.stringify(allDocs));

      setUploadedFiles(prev => [...prev, ...uploaded]);
      setFiles([]);
      onUploadComplete(uploaded);
      
      alert(`✅ ${uploaded.length} document(s) uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Load existing documents
  React.useEffect(() => {
    const storageKey = `feedback_documents_${feedbackId}`;
    const existing = localStorage.getItem(storageKey);
    if (existing) {
      setUploadedFiles(JSON.parse(existing));
    }
  }, [feedbackId]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white hover:border-blue-400 transition-colors">
        <div className="text-center">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Upload Documents for: {category}
          </h3>
          <p className="text-xs text-gray-600 mb-4">
            Upload the requested documents to address this feedback
          </p>
          
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id={`file-upload-${feedbackId}`}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          />
          
          <label htmlFor={`file-upload-${feedbackId}`}>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(`file-upload-${feedbackId}`)?.click();
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Select Files
            </Button>
          </label>
          
          <p className="text-xs text-gray-500 mt-2">
            Supported: PDF, Word, Excel, Images (Max 10MB each)
          </p>
        </div>
      </div>

      {/* Selected Files (Not Yet Uploaded) */}
      {files.length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-blue-900">
              Selected Files ({files.length})
            </h4>
            <Button
              size="sm"
              onClick={handleUpload}
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploading ? 'Uploading...' : 'Upload All'}
            </Button>
          </div>
          
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-blue-200">
                <div className="flex items-center space-x-2 flex-1">
                  <File className="h-4 w-4 text-blue-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h4 className="text-sm font-semibold text-green-900">
              Uploaded Documents ({uploadedFiles.length})
            </h4>
          </div>
          
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between bg-white p-2 rounded border border-green-200">
                <div className="flex items-center space-x-2 flex-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • Uploaded {new Date(file.uploadedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-600 text-white">
                  ✓ Uploaded
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-gray-600 mt-0.5" />
          <div className="text-xs text-gray-600">
            <p className="font-semibold mb-1">Tips for uploading documents:</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>Upload all requested documents at once</li>
              <li>Use clear, descriptive file names</li>
              <li>Ensure documents are current and complete</li>
              <li>After uploading, click "Notify IB Advisor" to alert them</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
