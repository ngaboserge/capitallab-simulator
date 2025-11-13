"use client"

import React, { useCallback, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Document } from '@/lib/cma-issuer-system/types'

interface FileUploadProps {
  label: string
  description?: string
  acceptedTypes?: string[]
  maxSize?: number // in MB
  required?: boolean
  multiple?: boolean
  value?: Document | Document[]
  onChange?: (files: Document | Document[] | null) => void
  error?: string
}

export function FileUpload({
  label,
  description,
  acceptedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
  maxSize = 10,
  required = false,
  multiple = false,
  value,
  onChange,
  error
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }, [])

  const handleFiles = async (files: FileList) => {
    setUploading(true)
    
    try {
      const fileArray = Array.from(files)
      const processedFiles: Document[] = []

      for (const file of fileArray) {
        // Validate file type
        const fileExtension = file.name.split('.').pop()?.toLowerCase()
        if (fileExtension && !acceptedTypes.includes(fileExtension)) {
          throw new Error(`File type .${fileExtension} is not supported`)
        }

        // Validate file size
        if (file.size > maxSize * 1024 * 1024) {
          throw new Error(`File size must be less than ${maxSize}MB`)
        }

        // Create Document object (in real implementation, this would upload to server)
        const document: Document = {
          id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          filename: `${Date.now()}_${file.name}`,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          uploadDate: new Date(),
          uploadedBy: 'current_user', // Would be actual user ID
          category: 'application_document',
          url: URL.createObjectURL(file), // Temporary URL for preview
          checksum: 'mock_checksum', // Would be actual file checksum
          version: 1
        }

        processedFiles.push(document)
      }

      if (multiple) {
        const currentFiles = Array.isArray(value) ? value : []
        onChange?.([ ...currentFiles, ...processedFiles])
      } else {
        onChange?.(processedFiles[0])
      }
    } catch (error) {
      console.error('File upload error:', error)
      // In real implementation, show error toast
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (fileId: string) => {
    if (multiple && Array.isArray(value)) {
      const updatedFiles = value.filter(file => file.id !== fileId)
      onChange?.(updatedFiles.length > 0 ? updatedFiles : null)
    } else {
      onChange?.(null)
    }
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊'
    return '📎'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const hasFiles = multiple ? Array.isArray(value) && value.length > 0 : !!value
  const files = multiple ? (Array.isArray(value) ? value : []) : (value ? [value] : []).filter(Boolean)

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      </div>
      
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <Card className={cn(
        "border-2 border-dashed transition-colors",
        dragActive && "border-blue-500 bg-blue-50",
        error && "border-red-500",
        hasFiles && "border-green-500"
      )}>
        <CardContent className="p-6">
          <div
            className="text-center"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
              className="hidden"
              multiple={multiple}
              accept={acceptedTypes.map(type => `.${type}`).join(',')}
              onChange={handleChange}
              disabled={uploading}
            />
            
            {!hasFiles ? (
              <div className="space-y-4">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div>
                  <label
                    htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
                    className="cursor-pointer"
                  >
                    <Button variant="outline" disabled={uploading} asChild>
                      <span>
                        {uploading ? 'Uploading...' : 'Choose Files'}
                      </span>
                    </Button>
                  </label>
                  <p className="mt-2 text-sm text-muted-foreground">
                    or drag and drop files here
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  <p>Accepted formats: {acceptedTypes.join(', ').toUpperCase()}</p>
                  <p>Maximum size: {maxSize}MB per file</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getFileIcon(file.mimeType)}</span>
                      <div className="text-left">
                        <p className="text-sm font-medium">{file.originalName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Uploaded
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {multiple && (
                  <label
                    htmlFor={`file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
                    className="cursor-pointer"
                  >
                    <Button variant="outline" size="sm" disabled={uploading} asChild>
                      <span>Add More Files</span>
                    </Button>
                  </label>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center space-x-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}