'use client';

import React, { useState, useCallback } from 'react';
import { Upload, X, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useDocumentManagement } from '@/lib/api/use-documents';
import { Document, UploadProgress } from '@/lib/api/document-service';
import { cn } from '@/lib/utils';

interface SupabaseFileUploadProps {
  label: string;
  description?: string;
  applicationId: string;
  category: string;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
  multiple?: boolean;
  required?: boolean;
  value?: Document[];
  onChange?: (documents: Document[]) => void;
  className?: string;
}

interface FileUploadState {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  document?: Document;
}

export function SupabaseFileUpload({
  label,
  description,
  applicationId,
  category,
  acceptedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'],
  maxFileSize = 10,
  maxFiles = 5,
  multiple = true,
  required = false,
  value = [],
  onChange,
  className = ''
}: SupabaseFileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<FileUploadState[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Use the new document management hook
  const {
    uploadFile,
    uploadFiles: uploadMultipleFiles,
    uploading,
    uploadProgress,
    deleteDocument: deleteDoc
  } = useDocumentManagement({
    applicationId,
    category,
    autoLoad: false
  });

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size exceeds ${maxFileSize}MB limit`;
    }

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !acceptedTypes.includes(fileExtension)) {
      return `File type .${fileExtension} is not supported`;
    }

    // Check for potentially malicious files
    const suspiciousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.js'];
    if (suspiciousExtensions.some(ext => file.name.toLowerCase().includes(ext))) {
      return 'File type not allowed for security reasons';
    }

    return null;
  };

  const handleFiles = useCallback(async (files: FileList) => {
    const newErrors: string[] = [];
    const validFiles: File[] = [];

    // Check total file count
    const totalFiles = value.length + uploadingFiles.length + files.length;
    if (totalFiles > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} files allowed`);
      setErrors(newErrors);
      return;
    }

    // Validate each file
    Array.from(files).forEach(file => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);

    // Create upload states
    const newUploadStates: FileUploadState[] = validFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'uploading'
    }));

    setUploadingFiles(prev => [...prev, ...newUploadStates]);

    // Upload files one by one using new service
    for (const uploadState of newUploadStates) {
      try {
        const result = await uploadFile(uploadState.file);

        if (result.success && result.document) {
          // Update state with successful upload
          setUploadingFiles(prev =>
            prev.map(state =>
              state.id === uploadState.id
                ? {
                    ...state,
                    status: 'success',
                    document: result.document,
                    progress: 100
                  }
                : state
            )
          );

          // Add to value and notify parent
          const newDocuments = [...value, result.document];
          onChange?.(newDocuments);
        } else {
          // Handle upload error
          setUploadingFiles(prev =>
            prev.map(state =>
              state.id === uploadState.id
                ? {
                    ...state,
                    status: 'error',
                    error: result.error
                  }
                : state
            )
          );
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setUploadingFiles(prev =>
          prev.map(state =>
            state.id === uploadState.id
              ? {
                  ...state,
                  status: 'error',
                  error: errorMessage
                }
              : state
          )
        );
      }
    }

    // Clean up completed uploads after a delay
    setTimeout(() => {
      setUploadingFiles(prev => prev.filter(state => state.status === 'uploading'));
    }, 3000);
  }, [value, uploadingFiles.length, maxFiles, uploadFile, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input value to allow same file selection
    e.target.value = '';
  }, [handleFiles]);

  const removeDocument = async (documentId: string) => {
    try {
      await deleteDoc(documentId);
      const updatedDocuments = value.filter(doc => doc.id !== documentId);
      onChange?.(updatedDocuments);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed';
      setErrors([errorMessage]);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('image')) return '🖼️';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const hasFiles = value.length > 0;
  const isUploading = uploading || uploadingFiles.some(state => state.status === 'uploading');

  return (
    <div className={cn('space-y-4', className)}>
      {/* Label and Description */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Upload Area */}
      <Card className={cn(
        'border-2 border-dashed transition-colors',
        isDragOver && 'border-blue-500 bg-blue-50',
        errors.length > 0 && 'border-red-500',
        hasFiles && 'border-green-500'
      )}>
        <CardContent className="p-6">
          <div
            className="text-center"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                Drop files here or click to browse
              </p>
              <p className="text-sm text-gray-500">
                Supported formats: {acceptedTypes.join(', ').toUpperCase()}
              </p>
              <p className="text-sm text-gray-500">
                Maximum file size: {maxFileSize}MB | Maximum files: {maxFiles}
              </p>
            </div>
            <input
              type="file"
              multiple={multiple}
              accept={acceptedTypes.map(type => `.${type}`).join(',')}
              onChange={handleFileInput}
              className="hidden"
              id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
              disabled={isUploading}
            />
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              disabled={isUploading}
              onClick={() => document.getElementById(`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`)?.click()}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Select Files'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Uploading Files</h4>
          {uploadingFiles.map((uploadState) => (
            <div
              key={uploadState.id}
              className="flex items-center space-x-3 p-3 border rounded-lg"
            >
              <FileText className="h-4 w-4" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {uploadState.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(uploadState.file.size)}
                </p>
                {uploadState.status === 'uploading' && (
                  <Progress value={uploadState.progress} className="mt-1" />
                )}
                {uploadState.status === 'error' && uploadState.error && (
                  <p className="text-xs text-red-500 mt-1">{uploadState.error}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {uploadState.status === 'uploading' && (
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                )}
                {uploadState.status === 'success' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {uploadState.status === 'error' && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Documents */}
      {hasFiles && (
        <div className="space-y-2">
          <h4 className="font-medium">Uploaded Documents</h4>
          {value.map((document) => (
            <div
              key={document.id}
              className="flex items-center space-x-3 p-3 border rounded-lg bg-green-50"
            >
              <span className="text-2xl">{getFileIcon(document.mime_type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {document.original_name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(document.file_size)} • Uploaded {new Date(document.uploaded_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Stored
                </Badge>
                {document.url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(document.url, '_blank')}
                    className="h-8 px-2"
                  >
                    View
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDocument(document.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}