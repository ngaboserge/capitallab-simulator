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
  const [transferData, setTransferData] = useState<any>(null);
  const [cmaSubmission, setCmaSubmission] = useState<any>(null);

  React.useEffect(() => {
    // Load transfer data
    const data = localStorage.getItem(applicationId);
    if (data) {
      setTransferData(JSON.parse(data));
    }

    // Load CMA submission data
    const submissionKey = `cma_submission_${applicationId}`;
    const submissionData = localStorage.getItem(submissionKey);
    if (submissionData) {
      setCmaSubmission(JSON.parse(submissionData));
    }
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

  if (!transferData) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading application data...</p>
        </CardContent>
      </Card>
    );
  }

  const sections = transferData.sections || {};
  const sectionKeys = Object.keys(sections).sort((a, b) => parseInt(a) - parseInt(b));

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
              <p className="font-semibold text-gray-900">{cmaSubmission?.companyName || transferData.companyName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Sections</p>
              <p className="font-semibold text-gray-900">{sectionKeys.length} sections</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completion Status</p>
              <p className="font-semibold text-green-700">
                {Object.values(sections).filter((s: any) => s.status === 'COMPLETED').length} / {sectionKeys.length} completed
              </p>
            </div>
          </div>

          {cmaSubmission?.ibComments && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-2">IB Advisor Comments:</p>
              <p className="text-sm text-gray-700">{cmaSubmission.ibComments}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Data */}
      <div className="space-y-4">
        {sectionKeys.map((sectionId) => {
          const section = sections[sectionId];
          const Icon = SECTION_ICONS[sectionId] || FileText;
          const isExpanded = expandedSections.has(sectionId);
          const sectionTitle = SECTION_TITLES[sectionId] || `Section ${sectionId}`;

          return (
            <Card key={sectionId} className="border-2 hover:shadow-md transition-shadow">
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

      {/* IB Advisor Deal Structure (if available) */}
      {cmaSubmission?.dealStructure && (
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span>IB Advisor Deal Structure</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600">Offer Type</p>
                <p className="font-semibold text-gray-900">{cmaSubmission.dealStructure.offerType}</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Shares</p>
                <p className="font-semibold text-gray-900">{cmaSubmission.dealStructure.totalShares?.toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600">Offer Price</p>
                <p className="font-semibold text-gray-900">RWF {cmaSubmission.dealStructure.offerPrice?.toLocaleString()}</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-semibold text-green-700">RWF {cmaSubmission.dealStructure.totalAmount?.toLocaleString()}</p>
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
