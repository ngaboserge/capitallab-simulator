'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SimpleProtectedRoute } from '@/lib/auth/simple-protected-route';
import { useSimpleAuth } from '@/lib/auth/simple-auth-context';
import { useSectionData, useCompleteSection } from '@/lib/api/use-sections';
import { ArrowLeft, Save, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

// Import section components
import { CompanyIdentitySection } from '@/components/cma-issuer/sections/company-identity-section-simple';
import { CompanyIdentityDebugSection } from '@/components/cma-issuer/sections/company-identity-debug';
import { CompanyIdentityFixed } from '@/components/cma-issuer/sections/company-identity-fixed';
import { CapitalizationSection } from '@/components/cma-issuer/sections/capitalization-section-simple';
import { ShareOwnershipSection } from '@/components/cma-issuer/sections/share-ownership-section-simple';
import { GovernanceSection } from '@/components/cma-issuer/sections/governance-section-simple';
import { ComplianceSection } from '@/components/cma-issuer/sections/compliance-section-simple';
import { OfferDetailsSection } from '@/components/cma-issuer/sections/offer-details-section-simple';
import { ProspectusSection } from '@/components/cma-issuer/sections/prospectus-section-simple';
import { PublicationSection } from '@/components/cma-issuer/sections/publication-section-simple';
import { UndertakingsSection } from '@/components/cma-issuer/sections/undertakings-section-simple';
import { DeclarationsSection } from '@/components/cma-issuer/sections/declarations-section-simple';

interface SectionInfo {
  number: number;
  title: string;
  description: string;
  component: React.ComponentType<any>;
}

const SECTIONS: Record<number, SectionInfo> = {
  1: {
    number: 1,
    title: 'Company Identity & Legal Form',
    description: 'Basic company information, legal structure, and registration details',
    component: CompanyIdentityFixed
  },
  2: {
    number: 2,
    title: 'Capitalization & Financial Strength',
    description: 'Capital structure, financial statements, and funding details',
    component: CapitalizationSection
  },
  3: {
    number: 3,
    title: 'Share Ownership & Distribution',
    description: 'Current shareholding structure and proposed distribution',
    component: ShareOwnershipSection
  },
  4: {
    number: 4,
    title: 'Governance & Management',
    description: 'Board composition, management structure, and governance policies',
    component: GovernanceSection
  },
  5: {
    number: 5,
    title: 'Legal & Regulatory Compliance',
    description: 'Legal compliance, regulatory approvals, and risk factors',
    component: ComplianceSection
  },
  6: {
    number: 6,
    title: 'Offer Details (IPO Information)',
    description: 'IPO specifics, pricing, timeline, and offering structure',
    component: OfferDetailsSection
  },
  7: {
    number: 7,
    title: 'Prospectus & Disclosure Checklist',
    description: 'Prospectus preparation and mandatory disclosures',
    component: ProspectusSection
  },
  8: {
    number: 8,
    title: 'Publication & Advertisement',
    description: 'Marketing materials, publication requirements, and advertising compliance',
    component: PublicationSection
  },
  9: {
    number: 9,
    title: 'Post-Approval Undertakings',
    description: 'Commitments and undertakings post-IPO approval',
    component: UndertakingsSection
  },
  10: {
    number: 10,
    title: 'Declarations & Contacts',
    description: 'Final declarations, certifications, and contact information',
    component: DeclarationsSection
  }
};

function SectionPageContent() {
  const params = useParams();
  const { profile } = useSimpleAuth();
  const [applicationId, setApplicationId] = useState<string | null>(null);

  const sectionNumber = parseInt(params.sectionId as string);
  const section = SECTIONS[sectionNumber];

  // Get the user's real application ID from database
  useEffect(() => {
    const loadApplication = async () => {
      if (!profile?.company_id) return;
      
      try {
        const response = await fetch(`/api/cma/applications?company_id=${profile.company_id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.applications && data.applications.length > 0) {
            setApplicationId(data.applications[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading application:', error);
      }
    };
    
    loadApplication();
  }, [profile]);

  // Get section ID from application and section number
  const [sectionId, setSectionId] = useState<string | null>(null);
  
  // Load section ID when application is ready
  useEffect(() => {
    const loadSectionId = async () => {
      if (!applicationId) return;
      
      try {
        // Fetch the section by application ID and section number
        console.log('Fetching sections for application:', applicationId);
        const response = await fetch(`/api/cma/applications/${applicationId}/sections`);
        console.log('Sections API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Sections API response data:', data);
          
          // The API returns { sections: [...] } not just an array
          const sections = data.sections || data;
          console.log('Sections array:', sections);
          
          const targetSection = sections.find((s: any) => s.section_number === sectionNumber);
          console.log('Target section for number', sectionNumber, ':', targetSection);
          
          if (targetSection) {
            console.log('Setting section ID:', targetSection.id);
            setSectionId(targetSection.id);
          } else {
            console.error('Section not found for section number:', sectionNumber);
          }
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch sections:', response.status, errorText);
        }
      } catch (error) {
        console.error('Error loading section ID:', error);
      }
    };
    
    loadSectionId();
  }, [applicationId, sectionNumber]);

  // Use the real Supabase section data hook
  const { 
    section: sectionData, 
    loading, 
    error, 
    saving, 
    saveError, 
    lastSaved,
    updateSection,
    updateField 
  } = useSectionData(sectionId);

  // Create a debounced version of updateSection
  const [localData, setLocalData] = useState<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Update local data immediately for responsive UI
  useEffect(() => {
    if (sectionData?.data) {
      setLocalData(sectionData.data);
    }
  }, [sectionData?.data]);

  const debouncedUpdateSection = useCallback((newData: any) => {
    // Update local state immediately for responsive typing
    setLocalData(newData);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer to save after 1 second of no changes
    debounceTimerRef.current = setTimeout(() => {
      updateSection({
        data: newData,
        status: 'IN_PROGRESS'
      });
    }, 1000);
  }, [updateSection]);

  // Use the real complete section hook
  const { 
    completeSection, 
    completing, 
    error: completeError 
  } = useCompleteSection(sectionId);

  const handleSave = async (data: any) => {
    try {
      await updateSection({
        data: data,
        status: 'IN_PROGRESS'
      });
      alert('Section saved successfully!');
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Error saving section. Please try again.');
    }
  };

  const handleComplete = async () => {
    try {
      await completeSection();
      alert('Section marked as completed!');
    } catch (error) {
      console.error('Error completing section:', error);
      alert('Error completing section. Please try again.');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Clock className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Section</h3>
            <p className="text-gray-600">Please wait while we load your section data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Section</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link href="/capitallab/collaborative/issuer">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!section) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Section Not Found</h3>
            <p className="text-gray-600 mb-4">
              Section {sectionNumber} does not exist or is not available.
            </p>
            <Link href="/capitallab/collaborative/issuer">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const SectionComponent = section.component;
  const currentStatus = sectionData?.status || 'NOT_STARTED';

  const getStatusIcon = () => {
    switch (currentStatus) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'IN_PROGRESS':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (currentStatus) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <SimpleProtectedRoute allowedRoles={['ISSUER', 'ISSUER_CEO', 'ISSUER_CFO', 'ISSUER_SECRETARY', 'ISSUER_LEGAL_ADVISOR']}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Link href="/capitallab/collaborative/issuer">
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Dashboard
                    </Button>
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link href="/capitallab/collaborative">
                    <Button variant="ghost" size="sm">
                      Back to Hub
                    </Button>
                  </Link>
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Section {section.number}: {section.title}
                    </h1>
                    <Badge variant="outline" className={getStatusColor()}>
                      {getStatusIcon()}
                      <span className="ml-1 capitalize">{currentStatus.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {section.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Save indicator */}
                {saving && (
                  <div className="flex items-center text-sm text-blue-600">
                    <Clock className="h-4 w-4 mr-1 animate-spin" />
                    Saving...
                  </div>
                )}
                {lastSaved && !saving && (
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Saved {lastSaved.toLocaleTimeString()}
                  </div>
                )}
                {saveError && (
                  <div className="flex items-center text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Save failed
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={() => handleSave(sectionData?.data || {})}
                  disabled={saving || completing}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Draft'}
                </Button>
                {currentStatus !== 'COMPLETED' && (
                  <Button 
                    onClick={handleComplete}
                    disabled={saving || completing}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {completing ? 'Completing...' : 'Mark Complete'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section Content */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Debug Info for Section Page */}
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h4 className="font-semibold mb-2">Section Page Debug (Supabase Integration):</h4>
            <div className="text-xs space-y-2">
              <div><strong>Company ID:</strong> {profile?.company_id || 'Not loaded'}</div>
              <div><strong>Application ID:</strong> {applicationId || 'Loading...'}</div>
              <div><strong>Section Number:</strong> {sectionNumber}</div>
              <div><strong>Section ID (DB):</strong> {sectionId || 'Loading...'}</div>
              <div><strong>Status:</strong> {currentStatus}</div>
              <div><strong>Completion:</strong> {sectionData?.completion_percentage || 0}%</div>
              <div><strong>Last Updated:</strong> {sectionData?.updated_at || 'Never'}</div>
              <div><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</div>
              <div><strong>Error:</strong> {error || 'None'}</div>
              <div><strong>Data Keys:</strong> {Object.keys(sectionData?.data || {}).join(', ') || 'Empty'}</div>
              <div><strong>Data:</strong></div>
              <pre className="overflow-auto max-h-32 bg-white p-2 rounded">
                {JSON.stringify(sectionData?.data || {}, null, 2)}
              </pre>
            </div>
          </div>
          
          <SectionComponent
            data={localData || sectionData?.data || {}}
            onDataChange={(newData: any) => {
              console.log('Section page onDataChange called with:', newData);
              // Auto-save on data change with debounce
              debouncedUpdateSection(newData);
            }}
            onSectionComplete={(isComplete: boolean) => {
              if (isComplete) {
                handleComplete();
              }
            }}
          />
        </div>
      </div>
    </SimpleProtectedRoute>
  );
}

export default function SectionPage() {
  return <SectionPageContent />;
}