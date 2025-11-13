'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SupabaseFileUpload } from '@/components/cma-issuer/form-components/supabase-file-upload';
import { useDocuments } from '@/lib/supabase/use-documents';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  Clock, 
  User, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Filter, 
  MoreVertical,
  History,
  Share,
  Lock,
  Unlock,
  Tag,
  Calendar,
  FileCheck,
  AlertTriangle
} from 'lucide-react';

interface DocumentVersion {
  id: string;
  version: string;
  uploadDate: string;
  uploadedBy: string;
  fileSize: number;
  status: 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  comments?: string;
  changes?: string;
}

interface EnhancedDocument {
  id: string;
  name: string;
  type: string;
  category: string;
  status: 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'REQUIRES_UPDATE';
  currentVersion: string;
  versions: DocumentVersion[];
  tags: string[];
  isRequired: boolean;
  dueDate?: string;
  assignedReviewer?: string;
  lastModified: string;
  fileSize: number;
  complianceScore?: number;
  securityLevel: 'PUBLIC' | 'CONFIDENTIAL' | 'RESTRICTED';
}

interface DocumentManagerProps {
  applicationId: string;
  userRole: 'ISSUER' | 'CMA_REGULATOR' | 'IB_ADVISOR';
  readOnly?: boolean;
}

export function AdvancedDocumentManager({ applicationId, userRole, readOnly = false }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<EnhancedDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<EnhancedDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<EnhancedDocument | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [reviewComment, setReviewComment] = useState('');

  // Mock enhanced documents data
  useEffect(() => {
    const mockDocuments: EnhancedDocument[] = [
      {
        id: 'doc-1',
        name: 'Certificate of Incorporation',
        type: 'PDF',
        category: 'Legal',
        status: 'APPROVED',
        currentVersion: '2.1',
        versions: [
          {
            id: 'v1',
            version: '1.0',
            uploadDate: '2024-01-15',
            uploadedBy: 'John Doe',
            fileSize: 2048576,
            status: 'REJECTED',
            comments: 'Missing notarization seal'
          },
          {
            id: 'v2',
            version: '2.0',
            uploadDate: '2024-01-20',
            uploadedBy: 'John Doe',
            fileSize: 2156789,
            status: 'UNDER_REVIEW',
            comments: 'Resubmitted with notarization'
          },
          {
            id: 'v3',
            version: '2.1',
            uploadDate: '2024-01-22',
            uploadedBy: 'John Doe',
            fileSize: 2156789,
            status: 'APPROVED',
            comments: 'Minor formatting corrections applied'
          }
        ],
        tags: ['incorporation', 'legal', 'required'],
        isRequired: true,
        assignedReviewer: 'CMA Legal Team',
        lastModified: '2024-01-22',
        fileSize: 2156789,
        complianceScore: 98,
        securityLevel: 'CONFIDENTIAL'
      },
      {
        id: 'doc-2',
        name: 'Audited Financial Statements 2023',
        type: 'PDF',
        category: 'Financial',
        status: 'UNDER_REVIEW',
        currentVersion: '1.0',
        versions: [
          {
            id: 'v1',
            version: '1.0',
            uploadDate: '2024-01-25',
            uploadedBy: 'Jane Smith',
            fileSize: 5242880,
            status: 'UNDER_REVIEW',
            comments: 'Initial submission for review'
          }
        ],
        tags: ['financial', 'audited', 'required', '2023'],
        isRequired: true,
        dueDate: '2024-02-15',
        assignedReviewer: 'CMA Financial Analysis',
        lastModified: '2024-01-25',
        fileSize: 5242880,
        complianceScore: 85,
        securityLevel: 'CONFIDENTIAL'
      },
      {
        id: 'doc-3',
        name: 'Board Resolution - IPO Authorization',
        type: 'PDF',
        category: 'Governance',
        status: 'REQUIRES_UPDATE',
        currentVersion: '1.0',
        versions: [
          {
            id: 'v1',
            version: '1.0',
            uploadDate: '2024-01-18',
            uploadedBy: 'Board Secretary',
            fileSize: 1048576,
            status: 'REJECTED',
            comments: 'Missing signatures from 2 independent directors'
          }
        ],
        tags: ['board', 'resolution', 'ipo', 'governance'],
        isRequired: true,
        dueDate: '2024-02-10',
        assignedReviewer: 'CMA Governance Team',
        lastModified: '2024-01-18',
        fileSize: 1048576,
        complianceScore: 65,
        securityLevel: 'RESTRICTED'
      },
      {
        id: 'doc-4',
        name: 'Prospectus Draft v3.2',
        type: 'PDF',
        category: 'Disclosure',
        status: 'DRAFT',
        currentVersion: '3.2',
        versions: [
          {
            id: 'v1',
            version: '3.2',
            uploadDate: '2024-01-28',
            uploadedBy: 'Legal Counsel',
            fileSize: 8388608,
            status: 'DRAFT',
            comments: 'Working draft - not yet submitted'
          }
        ],
        tags: ['prospectus', 'disclosure', 'draft'],
        isRequired: true,
        dueDate: '2024-02-20',
        lastModified: '2024-01-28',
        fileSize: 8388608,
        complianceScore: 72,
        securityLevel: 'CONFIDENTIAL'
      }
    ];

    setDocuments(mockDocuments);
    setFilteredDocuments(mockDocuments);
  }, [applicationId]);

  // Filter documents based on search and filters
  useEffect(() => {
    let filtered = documents;

    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(doc => doc.category === categoryFilter);
    }

    setFilteredDocuments(filtered);
  }, [documents, searchTerm, statusFilter, categoryFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'REQUIRES_UPDATE':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'UNDER_REVIEW':
        return <Clock className="h-4 w-4" />;
      case 'REJECTED':
        return <AlertCircle className="h-4 w-4" />;
      case 'REQUIRES_UPDATE':
        return <AlertTriangle className="h-4 w-4" />;
      case 'DRAFT':
        return <Edit3 className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getSecurityIcon = (level: string) => {
    switch (level) {
      case 'RESTRICTED':
        return <Lock className="h-4 w-4 text-red-600" />;
      case 'CONFIDENTIAL':
        return <Lock className="h-4 w-4 text-orange-600" />;
      case 'PUBLIC':
        return <Unlock className="h-4 w-4 text-green-600" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDocumentReview = (documentId: string, status: 'APPROVED' | 'REJECTED', comment: string) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === documentId 
          ? { 
              ...doc, 
              status,
              versions: doc.versions.map(v => 
                v.version === doc.currentVersion 
                  ? { ...v, status, comments: comment }
                  : v
              )
            }
          : doc
      )
    );
    setReviewComment('');
    alert(`Document ${status.toLowerCase()} successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Document Management</h2>
          <p className="text-gray-600">Advanced document control with version history and compliance tracking</p>
        </div>
        
        {!readOnly && userRole === 'ISSUER' && (
          <Button 
            onClick={() => setUploadingDocument(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="REQUIRES_UPDATE">Requires Update</option>
            </select>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Categories</option>
              <option value="Legal">Legal</option>
              <option value="Financial">Financial</option>
              <option value="Governance">Governance</option>
              <option value="Disclosure">Disclosure</option>
            </select>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {filteredDocuments.length} documents
              </Badge>
              <Badge variant="outline" className="text-xs">
                {filteredDocuments.filter(d => d.isRequired).length} required
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Total Documents', count: documents.length, color: 'blue', icon: FileText },
          { label: 'Approved', count: documents.filter(d => d.status === 'APPROVED').length, color: 'green', icon: CheckCircle },
          { label: 'Under Review', count: documents.filter(d => d.status === 'UNDER_REVIEW').length, color: 'yellow', icon: Clock },
          { label: 'Requires Action', count: documents.filter(d => ['REJECTED', 'REQUIRES_UPDATE'].includes(d.status)).length, color: 'red', icon: AlertTriangle },
          { label: 'Avg Compliance', count: Math.round(documents.reduce((acc, d) => acc + (d.complianceScore || 0), 0) / documents.length) + '%', color: 'purple', icon: FileCheck }
        ].map((stat, index) => (
          <Card key={index} className={`bg-gradient-to-r from-${stat.color}-50 to-${stat.color}-100 border-${stat.color}-200`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium text-${stat.color}-600`}>{stat.label}</p>
                  <p className={`text-2xl font-bold text-${stat.color}-900`}>{stat.count}</p>
                </div>
                <stat.icon className={`h-8 w-8 text-${stat.color}-600`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Documents</span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export List
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Found</h3>
              <p className="text-gray-600">No documents match your current filters.</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredDocuments.map((document) => (
                <div key={document.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Document Header */}
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{document.name}</h3>
                            <Badge className={getStatusColor(document.status)}>
                              {getStatusIcon(document.status)}
                              <span className="ml-1">{document.status.replace('_', ' ')}</span>
                            </Badge>
                            {document.isRequired && (
                              <Badge variant="outline" className="border-red-300 text-red-700">
                                Required
                              </Badge>
                            )}
                            {getSecurityIcon(document.securityLevel)}
                          </div>
                          
                          {/* Document Metadata */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                              <span className="font-medium">Category:</span> {document.category}
                            </div>
                            <div>
                              <span className="font-medium">Version:</span> {document.currentVersion}
                            </div>
                            <div>
                              <span className="font-medium">Size:</span> {formatFileSize(document.fileSize)}
                            </div>
                            <div>
                              <span className="font-medium">Modified:</span> {new Date(document.lastModified).toLocaleDateString()}
                            </div>
                          </div>

                          {/* Compliance Score */}
                          {document.complianceScore && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600">Compliance Score</span>
                                <span className={`font-medium ${
                                  document.complianceScore >= 90 ? 'text-green-600' :
                                  document.complianceScore >= 75 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {document.complianceScore}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    document.complianceScore >= 90 ? 'bg-green-500' :
                                    document.complianceScore >= 75 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${document.complianceScore}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* Tags */}
                          <div className="flex items-center space-x-2 mb-3">
                            <Tag className="h-4 w-4 text-gray-400" />
                            <div className="flex flex-wrap gap-1">
                              {document.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Due Date Warning */}
                          {document.dueDate && new Date(document.dueDate) < new Date() && document.status !== 'APPROVED' && (
                            <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
                              <div className="flex items-center space-x-2">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <span className="text-sm text-red-700 font-medium">
                                  Overdue: Due {new Date(document.dueDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Assigned Reviewer */}
                          {document.assignedReviewer && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                              <User className="h-4 w-4" />
                              <span>Assigned to: {document.assignedReviewer}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedDocument(document);
                          setShowVersionHistory(true);
                        }}
                      >
                        <History className="h-4 w-4 mr-2" />
                        History
                      </Button>
                      
                      {userRole === 'CMA_REGULATOR' && document.status === 'UNDER_REVIEW' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedDocument(document)}
                        >
                          <FileCheck className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Review Modal */}
      {selectedDocument && !showVersionHistory && userRole === 'CMA_REGULATOR' && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Review Document: {selectedDocument.name}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedDocument(null)}
              >
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Review Comments
              </label>
              <Textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Enter your review comments, feedback, or reasons for approval/rejection..."
                rows={4}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => handleDocumentReview(selectedDocument.id, 'APPROVED', reviewComment)}
                className="bg-green-600 hover:bg-green-700"
                disabled={!reviewComment.trim()}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              
              <Button
                onClick={() => handleDocumentReview(selectedDocument.id, 'REJECTED', reviewComment)}
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50"
                disabled={!reviewComment.trim()}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Version History Modal */}
      {showVersionHistory && selectedDocument && (
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Version History: {selectedDocument.name}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setShowVersionHistory(false);
                  setSelectedDocument(null);
                }}
              >
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedDocument.versions.map((version, index) => (
                <div key={version.id} className="flex items-start space-x-4 p-4 bg-white rounded-lg border">
                  <div className={`p-2 rounded-full ${
                    version.status === 'APPROVED' ? 'bg-green-100' :
                    version.status === 'REJECTED' ? 'bg-red-100' :
                    version.status === 'UNDER_REVIEW' ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}>
                    {getStatusIcon(version.status)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium text-gray-900">Version {version.version}</span>
                        <Badge className={getStatusColor(version.status)}>
                          {version.status.replace('_', ' ')}
                        </Badge>
                        {index === 0 && (
                          <Badge variant="outline" className="border-blue-300 text-blue-700">
                            Current
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatFileSize(version.fileSize)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      Uploaded by {version.uploadedBy} on {new Date(version.uploadDate).toLocaleDateString()}
                    </div>
                    
                    {version.comments && (
                      <div className="bg-gray-50 p-3 rounded border text-sm">
                        <span className="font-medium text-gray-700">Comments: </span>
                        {version.comments}
                      </div>
                    )}
                    
                    {version.changes && (
                      <div className="bg-blue-50 p-3 rounded border text-sm mt-2">
                        <span className="font-medium text-blue-700">Changes: </span>
                        {version.changes}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Modal */}
      {uploadingDocument && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Upload New Document</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setUploadingDocument(false)}
              >
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SupabaseFileUpload
              label="Upload Document"
              applicationId={applicationId}
              category="general"
              acceptedTypes={[".pdf", ".doc", ".docx", ".xls", ".xlsx"]}
              maxFileSize={10} // 10MB
              multiple={true}
              onChange={(documents) => {
                console.log('Documents uploaded:', documents);
                setUploadingDocument(false);
                // Refresh documents list
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}