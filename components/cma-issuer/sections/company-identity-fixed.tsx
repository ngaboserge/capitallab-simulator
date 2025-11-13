'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiFileUpload } from '@/components/cma-issuer/form-components/multi-file-upload';
import { AddressInput } from '@/components/cma-issuer/form-components/address-input';
import { ContactInfoInput } from '@/components/cma-issuer/form-components/contact-info-input';

interface CompanyIdentityFixedProps {
  data: any;
  onDataChange: (data: any) => void;
  onSectionComplete: (isComplete: boolean) => void;
}

export function CompanyIdentityFixed({ data, onDataChange, onSectionComplete }: CompanyIdentityFixedProps) {
  const [errors, setErrors] = useState<any>({});

  const companyIdentity = data.companyIdentity || {
    legalName: '',
    tradingName: '',
    companyType: undefined,
    incorporationDate: undefined,
    registrationNumber: '',
    registeredAddress: undefined,
    contactInfo: undefined,
    documents: {
      certificateOfIncorporation: null,
      memorandumAndArticles: null
    }
  };

  const updateField = (field: string, value: any) => {
    const updatedData = {
      ...data,
      companyIdentity: {
        ...companyIdentity,
        [field]: value
      }
    };
    onDataChange(updatedData);
  };

  const handleDocumentsChange = (documents: any) => {
    const updatedData = {
      ...data,
      companyIdentity: {
        ...companyIdentity,
        documents
      }
    };
    onDataChange(updatedData);
    
    // Check if section is complete
    const isComplete = documents.certificateOfIncorporation && documents.memorandumAndArticles;
    onSectionComplete(isComplete);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Company Identity & Legal Form</h3>
        <p className="text-sm text-muted-foreground">
          Provide complete company identity and legal information for CMA verification.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="legalName">
                Legal Company Name
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="legalName"
                placeholder="Enter legal company name"
                value={companyIdentity.legalName || ''}
                onChange={(e) => updateField('legalName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tradingName">Trading Name (if different)</Label>
              <Input
                id="tradingName"
                placeholder="Enter trading name"
                value={companyIdentity.tradingName || ''}
                onChange={(e) => updateField('tradingName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyType">
                Company Type
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select
                value={companyIdentity.companyType || ''}
                onValueChange={(value) => updateField('companyType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC_LIMITED">Public Limited Company</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationNumber">
                Company Registration Number
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="registrationNumber"
                placeholder="Enter registration number"
                value={companyIdentity.registrationNumber || ''}
                onChange={(e) => updateField('registrationNumber', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="incorporationDate">
                Date of Incorporation
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="incorporationDate"
                type="date"
                value={companyIdentity.incorporationDate || ''}
                onChange={(e) => updateField('incorporationDate', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registered Address</CardTitle>
        </CardHeader>
        <CardContent>
          <AddressInput
            value={companyIdentity.registeredAddress}
            onChange={(address) => updateField('registeredAddress', address)}
            required={true}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ContactInfoInput
            value={companyIdentity.contactInfo}
            onChange={(contactInfo) => updateField('contactInfo', contactInfo)}
            required={true}
          />
        </CardContent>
      </Card>

      {/* Use the new MultiFileUpload component */}
      <MultiFileUpload 
        onDocumentsChange={handleDocumentsChange}
        initialDocuments={companyIdentity.documents}
      />
    </div>
  );
}