'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Send,
  Building2,
  User,
  Calendar,
  ArrowRight,
  Package,
  Shield,
  Download
} from 'lucide-react';

interface ApplicationSection {
  id: number;
  title: string;
  status: 'completed' | 'in_progress' | 'not_started';
  completionPercentage: number;
  documentsCount: number;
  lastUpdated: string;
}

interface ApplicationHandoffProps {
  selectedAdvisor: {
    id: string;
    name: string;
    contact: {
      email: string;
      phone: string;
    };
  };
  companyName: string;
  onHandoff: () => void;
}

export function ApplicationHandoff({ selectedAdvisor, companyName, onHandoff }: ApplicationHandoffProps) {
  const [sections, setSections] = useState<ApplicationSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);
  const [transferComplete, setTransferComplete] = useState(false);

  useEffect(() => {
    loadApplicationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadApplicationData = async () => {
    setLoading(true);
    
    // First, we need to find the actual localStorage keys
    // They are in format: mock_section_mock-app-id-{company_id}-section-{number}
    // Let's scan localStorage to find them
    const sectionData: ApplicationSection[] = [];
    
    // Try to find the application ID from localStorage keys
    let foundApplicationId: string | null = null;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('mock_section_mock-app-id-')) {
        // Extract application ID from the key
        // Key format: mock_section_mock-app-id-{uuid}-section-{number}
        const match = key.match(/mock_section_(mock-app-id-[a-f0-9-]+)-section-\d+/);
        if (match) {
          foundApplicationId = match[1];
          console.log('Matched key:', key, 'Extracted ID:', foundApplicationId);
          break;
        }
      }
    }
    
    console.log('Found application ID:', foundApplicationId);
    
    for (let sectionNumber = 1; sectionNumber <= 10; sectionNumber++) {
      // Use the found application ID or fallback
      const sectionId = foundApplicationId 
        ? `${foundApplicationId}-section-${sectionNumber}`
        : `mock-app-id-company-section-${sectionNumber}`;
      const sectionKey = `mock_section_${sectionId}`;
      
      console.log(`Looking for section ${sectionNumber} with key:`, sectionKey);
      
      try {
        const storedData = localStorage.getItem(sectionKey);
        let status: 'completed' | 'in_progress' | 'not_started' = 'not_started';
        let completionPercentage = 0;
        let documentsCount = 0;
        let lastUpdated = 'Never';
        
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          console.log(`Section ${sectionNumber} data:`, parsedData);
          
          // Map status
          switch (parsedData.status) {
            case 'COMPLETED':
              status = 'completed';
              completionPercentage = 100;
              break;
            case 'IN_PROGRESS':
              status = 'in_progress';
              completionPercentage = parsedData.completion_percentage || 50;
              break;
            default:
              status = 'not_started';
              completionPercentage = 0;
          }
          
          // Count documents
          if (parsedData.data) {
            documentsCount = countDocuments(parsedData.data);
          }
          
          lastUpdated = parsedData.updated_at ? 
            new Date(parsedData.updated_at).toLocaleDateString() : 
            'Never';
        } else {
          console.log(`No data found for section ${sectionNumber}`);
        }
        
        sectionData.push({
          id: sectionNumber,
          title: getSectionTitle(sectionNumber),
          status,
          completionPercentage,
          documentsCount,
          lastUpdated
        });
      } catch (error) {
        console.error(`Error loading section ${sectionNumber}:`, error);
        sectionData.push({
          id: sectionNumber,
          title: getSectionTitle(sectionNumber),
          status: 'not_started',
          completionPercentage: 0,
          documentsCount: 0,
          lastUpdated: 'Never'
        });
      }
    }
    
    setSections(sectionData);
    setLoading(false);
  };

  const countDocuments = (data: any): number => {
    let count = 0;
    
    const countInObject = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      
      for (const key in obj) {
        const value = obj[key];
        if (value && typeof value === 'object') {
          // Check if it looks like a document object
          if (value.id && value.filename && value.originalName) {
            count++;
          } else {
            countInObject(value);
          }
        }
      }
    };
    
    countInObject(data);
    return count;
  };

  const getSectionTitle = (sectionNumber: number): string => {
    const titles: Record<number, string> = {
      1: 'Company Identity & Legal Form',
      2: 'Capitalization & Financial Strength',
      3: 'Share Ownership & Distribution',
      4: 'Governance & Management',
      5: 'Legal & Regulatory Compliance',
      6: 'Offer Details (IPO Information)',
      7: 'Prospectus & Disclosure Checklist',
      8: 'Publication & Advertisement',
      9: 'Post-Approval Undertakings',
      10: 'Declarations & Contacts'
    };
    return titles[sectionNumber] || `Section ${sectionNumber}`;
  };

  const handleTransfer = async () => {
    setTransferring(true);
    
    try {
      // Find the actual application ID from localStorage
      let foundApplicationId: string | null = null;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('mock_section_mock-app-id-')) {
          // Match the full pattern including UUID with hyphens
          const match = key.match(/mock_section_(mock-app-id-[a-f0-9-]+)-section-\d+/);
          if (match) {
            foundApplicationId = match[1];
            console.log('Found application ID from key:', key, '→', foundApplicationId);
            break;
          }
        }
      }
      
      console.log('Transferring with application ID:', foundApplicationId);
      
      // Package all section data from localStorage
      const applicationData: any = {
        sections: {},
        documents: {},
        metadata: {
          companyName,
          transferDate: new Date().toISOString(),
          ibAdvisorId: selectedAdvisor.id,
          ibAdvisorName: selectedAdvisor.name,
          applicationId: foundApplicationId
        }
      };

      // Collect all section data from localStorage
      for (let sectionNumber = 1; sectionNumber <= 10; sectionNumber++) {
        const sectionId = foundApplicationId 
          ? `${foundApplicationId}-section-${sectionNumber}`
          : `mock-app-id-company-section-${sectionNumber}`;
        const sectionKey = `mock_section_${sectionId}`;
        
        try {
          const storedData = localStorage.getItem(sectionKey);
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            applicationData.sections[sectionNumber] = parsedData;
            console.log(`Collected section ${sectionNumber}:`, parsedData.status);
          }
        } catch (error) {
          console.error(`Error collecting section ${sectionNumber}:`, error);
        }
      }

      console.log('Total sections collected:', Object.keys(applicationData.sections).length);

      // Store the transfer in localStorage for the IB Advisor to access
      const transferKey = `ib_transfer_${selectedAdvisor.id}_${Date.now()}`;
      localStorage.setItem(transferKey, JSON.stringify(applicationData));
      
      // Also store a reference to this transfer for the IB Advisor
      const ibTransfersKey = `ib_transfers_${selectedAdvisor.id}`;
      const existingTransfers = JSON.parse(localStorage.getItem(ibTransfersKey) || '[]');
      existingTransfers.push({
        transferKey,
        companyName,
        transferDate: applicationData.metadata.transferDate,
        sectionsCount: Object.keys(applicationData.sections).length
      });
      localStorage.setItem(ibTransfersKey, JSON.stringify(existingTransfers));

      // Transfer data to IB Advisor (for logging/notification purposes)
      const response = await fetch('/api/transfer-to-ib', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ibAdvisorId: selectedAdvisor.id,
          applicationData,
          companyName,
          transferKey
        })
      });

      if (!response.ok) {
        console.warn('Transfer API call failed, but localStorage transfer succeeded');
      }

      const result = await response.json();
      console.log('Transfer successful:', result);
      
      setTransferComplete(true);
      
      // Call parent callback after short delay
      setTimeout(() => {
        onHandoff();
      }, 2000);
      
    } catch (error) {
      console.error('Transfer failed:', error);
      alert('Transfer failed. Please try again.');
    } finally {
      setTransferring(false);
    }
  };

  const completedSections = sections.filter(s => s.status === 'completed');
  const totalDocuments = sections.reduce((sum, s) => sum + s.documentsCount, 0);
  const overallCompletion = sections.length > 0 ? 
    Math.round(sections.reduce((sum, s) => sum + s.completionPercentage, 0) / sections.length) : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (transferComplete) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            Application Successfully Transferred!
          </h3>
          <p className="text-green-700 mb-4">
            Your IPO application has been transferred to <strong>{selectedAdvisor.name}</strong>.
            They will review your documents and contact you within 2-3 business days.
          </p>
          <div className="bg-white p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-700">
              <strong>Next Steps:</strong><br />
              • IB Advisor will review all sections and documents<br />
              • You'll receive feedback and any requested changes<br />
              • Once approved, the application will be submitted to CMA
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Transfer Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Application Transfer Summary
          </CardTitle>
          <p className="text-sm text-gray-600">
            Review your application before transferring to the selected IB Advisor
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <div className="text-lg font-semibold text-blue-600">{completedSections.length}/10</div>
              <div className="text-xs text-gray-600">Completed Sections</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Download className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <div className="text-lg font-semibold text-green-600">{totalDocuments}</div>
              <div className="text-xs text-gray-600">Total Documents</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Shield className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <div className="text-lg font-semibold text-purple-600">{overallCompletion}%</div>
              <div className="text-xs text-gray-600">Overall Progress</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <Calendar className="h-5 w-5 text-orange-600 mx-auto mb-1" />
              <div className="text-lg font-semibold text-orange-600">Today</div>
              <div className="text-xs text-gray-600">Transfer Date</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Application Completion</span>
              <span>{overallCompletion}%</span>
            </div>
            <Progress value={overallCompletion} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Transfer Details */}
      <Card>
        <CardHeader>
          <CardTitle>Transfer Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                From (Issuer)
              </h4>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium">{companyName}</div>
                <div className="text-sm text-gray-600">IPO Application</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <User className="h-4 w-4 mr-2" />
                To (IB Advisor)
              </h4>
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="font-medium">{selectedAdvisor.name}</div>
                <div className="text-sm text-gray-600">{selectedAdvisor.contact.email}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Details */}
      <Card>
        <CardHeader>
          <CardTitle>Section Status</CardTitle>
          <p className="text-sm text-gray-600">
            All sections and their documents will be transferred to the IB Advisor
          </p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading application data...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sections.map((section) => (
                <div key={section.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(section.status)}
                    <div>
                      <div className="font-medium">Section {section.id}: {section.title}</div>
                      <div className="text-sm text-gray-600">
                        {section.documentsCount} documents • Last updated: {section.lastUpdated}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getStatusColor(section.status)}>
                      {section.status.replace('_', ' ')}
                    </Badge>
                    <div className="text-sm text-gray-600 w-12 text-right">
                      {section.completionPercentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transfer Action */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Ready to Transfer Application?
            </h3>
            <p className="text-blue-700 mb-4">
              This will transfer all your completed sections and documents to {selectedAdvisor.name} 
              for review. You'll still be able to view your application but won't be able to make changes 
              until the IB Advisor completes their review.
            </p>
            
            <Button
              onClick={handleTransfer}
              disabled={transferring || completedSections.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {transferring ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Transferring Application...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Transfer to IB Advisor
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
            
            {completedSections.length === 0 && (
              <p className="text-sm text-red-600 mt-2">
                You need to complete at least one section before transferring to an IB Advisor.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}