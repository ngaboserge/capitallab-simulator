'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText,
  Building2,
  Users,
  DollarSign,
  Shield,
  BookOpen,
  Megaphone,
  FileCheck,
  FileSignature,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface ApplicationDataViewerProps {
  applicationId: string;
}

const SECTION_ICONS: Record<string, any> = {
  '1': Building2,
  '2': Users,
  '3': DollarSign,
  '4': Shield,
  '5': FileCheck,
  '6': DollarSign,
  '7': BookOpen,
  '8': Megaphone,
  '9': FileSignature,
  '10': FileCheck
};

const SECTION_TITLES: Record<string, string> = {
  '1': 'Company Identity',
  '2': 'Share Ownership Structure',
  '3': 'Capitalization',
  '4': 'Governance',
  '5': 'Compliance & Legal',
  '6': 'Offer Details',
  '7': 'Prospectus',
  '8': 'Publication Plan',
  '9': 'Undertakings',
  '10': 'Declarations'
};

export function ApplicationDataViewer({ applicationId }: ApplicationDataViewerProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['1']));
  const [applicationData, setApplicationData] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const loadApplicationData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load application data from Supabase API
        const response = await fetch(`/api/cma/applications/${applicationId}`);
        
        if (!response.ok) {
          throw new Error('Failed to load application data');
        }

        const data = await response.json();
        console.log('📋 Application data loaded:', data.application);
        
        setApplicationData(data.application);
        setSections(data.application?.application_sections || []);
        
      } catch (err) {
        console.error('Error loading application data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load application data');
        
        // Fallback to localStorage for backward compatibility
        const localData = localStorage.getItem(applicationId);
        if (localData) {
          const parsed = JSON.parse(localData);
          setApplicationData(parsed);
          setSections(Object.entries(parsed.sections || {}).map(([id, data]: any) => ({
            section_number: parseInt(id),
            ...data
          })));
        }
      } finally {
        setLoading(false);
      }
    };

    loadApplicationData();
  }, [applicationId]);

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading application data...</p>
        </CardContent>
      </Card>
    );
  }

  if (error && !applicationData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-600 font-medium mb-2">Error Loading Application</p>
          <p className="text-sm text-gray-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const sectionKeys = sections
    .sort((a, b) => (a.section_number || 0) - (b.section_number || 0))
    .map(s => s.section_number?.toString() || s.id);

  return (
    <div className="space-y-6">
      {/* Application Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Application Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Company Name</p>
              <p className="font-semibold text-gray-900">
                {applicationData?.companies?.legal_name || applicationData?.company?.legal_name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Sections</p>
              <p className="font-semibold text-gray-900">{sections.length} sections</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completion Status</p>
              <p className="font-semibold text-green-700">
                {sections.filter((s: any) => s.status === 'COMPLETED').length} / {sections.length} completed
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Application Number</p>
              <p className="font-semibold text-gray-900">{applicationData?.application_number || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-semibold text-gray-900">{applicationData?.status || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Target Amount</p>
              <p className="font-semibold text-gray-900">
                {applicationData?.target_amount ? `RWF ${applicationData.target_amount.toLocaleString()}` : 'TBD'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completion</p>
              <p className="font-semibold text-gray-900">{applicationData?.completion_percentage || 0}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Data */}
      <div className="space-y-4">
        {sections.map((section: any) => {
          const sectionId = section.section_number?.toString() || section.id;
          const Icon = SECTION_ICONS[sectionId] || FileText;
          const isExpanded = expandedSections.has(sectionId);
          const sectionTitle = section.section_title || SECTION_TITLES[sectionId] || `Section ${sectionId}`;

          return (
            <Card key={section.id} className="border-2 hover:shadow-md transition-shadow">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => toggleSection(sectionId)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Section {sectionId}: {sectionTitle}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {section.data ? Object.keys(section.data).length : 0} fields
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={
                      section.status === 'COMPLETED' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }>
                      {section.status === 'COMPLETED' ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Completed</>
                      ) : (
                        <><Clock className="h-3 w-3 mr-1" /> In Progress</>
                      )}
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-6 bg-gray-50">
                  {section.data && Object.keys(section.data).length > 0 ? (
                    <div className="space-y-4">
                      {Object.entries(section.data).map(([key, value]: [string, any]) => (
                        <DataField key={key} fieldKey={key} value={value} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No data available for this section</p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Offering Details */}
      {applicationData?.target_amount && (
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span>Offering Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600">Target Amount</p>
                <p className="font-semibold text-green-700">RWF {applicationData.target_amount.toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600">Application Status</p>
                <p className="font-semibold text-gray-900">{applicationData.status}</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600">Current Phase</p>
                <p className="font-semibold text-gray-900">{applicationData.current_phase || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DataField({ fieldKey, value }: { fieldKey: string; value: any }) {
  const formatFieldName = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const renderValue = (val: any): React.ReactNode => {
    if (val === null || val === undefined || val === '') {
      return <span className="text-gray-400 italic">Not provided</span>;
    }

    if (typeof val === 'boolean') {
      return val ? (
        <Badge className="bg-green-100 text-green-800">Yes</Badge>
      ) : (
        <Badge className="bg-gray-100 text-gray-800">No</Badge>
      );
    }

    if (Array.isArray(val)) {
      if (val.length === 0) {
        return <span className="text-gray-400 italic">No items</span>;
      }
      return (
        <div className="space-y-2">
          {val.map((item, index) => (
            <div key={index} className="bg-white p-3 rounded border border-gray-200">
              {typeof item === 'object' ? (
                <div className="space-y-1">
                  {Object.entries(item).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className="text-gray-600">{formatFieldName(k)}:</span>
                      <span className="font-medium text-gray-900">{String(v)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-gray-900">{String(item)}</span>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (typeof val === 'object') {
      return (
        <div className="bg-white p-3 rounded border border-gray-200 space-y-1">
          {Object.entries(val).map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-gray-600">{formatFieldName(k)}:</span>
              <span className="font-medium text-gray-900">{String(v)}</span>
            </div>
          ))}
        </div>
      );
    }

    return <span className="text-gray-900 font-medium">{String(val)}</span>;
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-semibold text-gray-700">
          {formatFieldName(fieldKey)}
        </label>
        <div className="text-sm">
          {renderValue(value)}
        </div>
      </div>
    </div>
  );
}
