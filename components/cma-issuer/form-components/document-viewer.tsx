'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Eye, 
  Download, 
  FileText, 
  Image, 
  File, 
  ExternalLink,
  Calendar,
  User,
  HardDrive,
  Loader2
} from 'lucide-react';
import { Document } from '@/lib/api/document-service';
import { useDocumentDownload } from '@/lib/api/use-documents';
import { DocumentService } from '@/lib/api/document-service';

interface DocumentViewerProps {
  document: Document;
  showDetails?: boolean;
  className?: string;
}

export function DocumentViewer({ 
  document, 
  showDetails = true, 
  className = '' 
}: DocumentViewerProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(false);
  
  const { downloadDocument } = useDocumentDownload();

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    if (mimeType.includes('image')) return <Image className="h-5 w-5 text-blue-500" />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <FileText className="h-5 w-5 text-blue-600" />;
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return <FileText className="h-5 w-5 text-green-600" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const getFileTypeLabel = (mimeType: string) => {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('image')) return 'Image';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'Word';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'Excel';
    return 'Document';
  };

  const formatFileSize = (bytes: number) => {
    return DocumentService.formatFileSize(bytes);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = async () => {
    try {
      await downloadDocument(document.id, document.original_name);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handlePreview = async () => {
    if (document.mime_type?.includes('image') || document.mime_type?.includes('pdf')) {
      // Load signed URL for preview
      if (!signedUrl && !loadingUrl) {
        setLoadingUrl(true);
        try {
          const result = await DocumentService.generateSignedUrl(document.id);
          if (result.success && result.url) {
            setSignedUrl(result.url);
            setIsPreviewOpen(true);
          }
        } catch (error) {
          console.error('Failed to load preview:', error);
        } finally {
          setLoadingUrl(false);
        }
      } else if (signedUrl) {
        setIsPreviewOpen(true);
      }
    } else {
      // For non-previewable files, download
      handleDownload();
    }
  };

  const canPreview = document.mime_type?.includes('image') || document.mime_type?.includes('pdf');

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* File Icon */}
          <div className="flex-shrink-0 mt-1">
            {getFileIcon(document.mime_type || '')}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="text-sm font-medium truncate">
                {document.original_name}
              </h4>
              <Badge variant="outline" className="text-xs">
                {getFileTypeLabel(document.mime_type || '')}
              </Badge>
            </div>

            {showDetails && (
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <HardDrive className="h-3 w-3" />
                    <span>{formatFileSize(document.file_size || 0)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(document.uploaded_at)}</span>
                  </div>
                </div>
                {document.category && (
                  <div className="flex items-center space-x-1">
                    <span className="font-medium">Category:</span>
                    <span className="capitalize">{document.category.replace(/_/g, ' ')}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1">
            {canPreview && (
              <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePreview}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                      {getFileIcon(document.mime_type || '')}
                      <span>{document.original_name}</span>
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-auto">
                    {signedUrl ? (
                      document.mime_type?.includes('image') ? (
                        <img
                          src={signedUrl}
                          alt={document.original_name}
                          className="max-w-full h-auto mx-auto"
                        />
                      ) : document.mime_type?.includes('pdf') ? (
                        <iframe
                          src={signedUrl}
                          className="w-full h-[70vh] border-0"
                          title={document.original_name}
                        />
                      ) : (
                        <div className="text-center py-8">
                          <File className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                          <p className="text-muted-foreground">
                            Preview not available for this file type
                          </p>
                          <Button
                            variant="outline"
                            onClick={handleDownload}
                            className="mt-4"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download File
                          </Button>
                        </div>
                      )
                    ) : (
                      <div className="text-center py-8">
                        <Loader2 className="h-16 w-16 mx-auto text-gray-400 mb-4 animate-spin" />
                        <p className="text-muted-foreground">Loading preview...</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="h-8 w-8 p-0"
            >
              <Download className="h-4 w-4" />
            </Button>

            {!canPreview && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="h-8 w-8 p-0"
                title="Download file"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DocumentListViewerProps {
  documents: Document[];
  title?: string;
  emptyMessage?: string;
  className?: string;
}

export function DocumentListViewer({
  documents,
  title = "Documents",
  emptyMessage = "No documents uploaded yet",
  className = ""
}: DocumentListViewerProps) {
  if (documents.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <File className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold">{title}</h3>
      )}
      <div className="space-y-2">
        {documents.map((document) => (
          <DocumentViewer
            key={document.id}
            document={document}
            showDetails={true}
          />
        ))}
      </div>
    </div>
  );
}