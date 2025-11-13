"use client"

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { FileUpload } from '@/components/cma-issuer/form-components/file-upload'
import { AddressInput } from '@/components/cma-issuer/form-components/address-input'
import { ContactInfoInput } from '@/components/cma-issuer/form-components/contact-info-input'
import { IssuerApplication, CompanyType, Address, ContactInfo, Document } from '@/lib/cma-issuer-system/types'

interface CompanyIdentitySectionProps {
  data: Partial<IssuerApplication>
  onDataChange: (data: Partial<IssuerApplication>) => void
  onSectionComplete: (isComplete: boolean) => void
}

interface ValidationErrors {
  legalName?: string
  companyType?: string
  incorporationDate?: string
  registrationNumber?: string
  registeredAddress?: Partial<Record<keyof Address, string>>
  contactInfo?: Partial<Record<keyof ContactInfo, string>>
  certificateOfIncorporation?: string
  memorandumAndArticles?: string
}

export function CompanyIdentitySection({
  data,
  onDataChange,
  onSectionComplete
}: CompanyIdentitySectionProps) {
  const [errors, setErrors] = useState<ValidationErrors>({})

  const companyIdentity = data.companyIdentity || {
    legalName: '',
    tradingName: '',
    companyType: undefined,
    incorporationDate: undefined,
    registrationNumber: '',
    registeredAddress: undefined,
    contactInfo: undefined,
    documents: {
      certificateOfIncorporation: undefined,
      memorandumAndArticles: undefined
    }
  }

  // Local state to ensure documents are preserved
  const [localDocuments, setLocalDocuments] = useState(() => ({
    certificateOfIncorporation: companyIdentity.documents?.certificateOfIncorporation || null,
    memorandumAndArticles: companyIdentity.documents?.memorandumAndArticles || null
  }));

  const updateCompanyIdentity = (updates: any) => {
    let finalUpdates = { ...updates };
    
    // If updating documents, merge with local state
    if (updates.documents) {
      const mergedDocuments = {
        ...localDocuments,
        ...updates.documents
      };
      setLocalDocuments(mergedDocuments);
      finalUpdates.documents = mergedDocuments;
    }
    
    const updatedData = {
      ...data,
      companyIdentity: {
        ...companyIdentity,
        ...finalUpdates
      }
    }
    
    onDataChange(updatedData)
    
    // Validate after update
    setTimeout(() => validateAndNotify(updatedData.companyIdentity), 100)
  }

  const validateAndNotify = (identity: any) => {
    const newErrors: ValidationErrors = {}

    // Required field validations
    if (!identity.legalName?.trim()) {
      newErrors.legalName = 'Legal name is required'
    }

    if (!identity.companyType) {
      newErrors.companyType = 'Company type is required'
    } else if (identity.companyType !== 'PUBLIC_LIMITED') {
      newErrors.companyType = 'Only Public Limited Companies are eligible'
    }

    if (!identity.incorporationDate) {
      newErrors.incorporationDate = 'Incorporation date is required'
    }

    if (!identity.registrationNumber?.trim()) {
      newErrors.registrationNumber = 'Registration number is required'
    }

    // Address validation
    const addressErrors: Partial<Record<keyof Address, string>> = {}
    if (!identity.registeredAddress?.street?.trim()) {
      addressErrors.street = 'Street address is required'
    }
    if (!identity.registeredAddress?.city?.trim()) {
      addressErrors.city = 'City is required'
    }
    if (!identity.registeredAddress?.province?.trim()) {
      addressErrors.province = 'Province is required'
    }
    if (Object.keys(addressErrors).length > 0) {
      newErrors.registeredAddress = addressErrors
    }

    // Contact info validation
    const contactErrors: Partial<Record<keyof ContactInfo, string>> = {}
    if (!identity.contactInfo?.email?.trim()) {
      contactErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity.contactInfo.email)) {
      contactErrors.email = 'Invalid email format'
    }
    if (!identity.contactInfo?.phone?.trim()) {
      contactErrors.phone = 'Phone number is required'
    }
    if (Object.keys(contactErrors).length > 0) {
      newErrors.contactInfo = contactErrors
    }

    // Document validation
    if (!identity.documents?.certificateOfIncorporation) {
      newErrors.certificateOfIncorporation = 'Certificate of Incorporation is required'
    }
    if (!identity.documents?.memorandumAndArticles) {
      newErrors.memorandumAndArticles = 'Memorandum and Articles of Association are required'
    }

    setErrors(newErrors)
    
    const isComplete = Object.keys(newErrors).length === 0
    onSectionComplete(isComplete)
  }

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
                onChange={(e) => updateCompanyIdentity({ legalName: e.target.value })}
                className={errors.legalName ? 'border-red-500' : ''}
              />
              {errors.legalName && (
                <p className="text-sm text-red-600">{errors.legalName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tradingName">Trading Name (if different)</Label>
              <Input
                id="tradingName"
                placeholder="Enter trading name"
                value={companyIdentity.tradingName || ''}
                onChange={(e) => updateCompanyIdentity({ tradingName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyType">
                Company Type
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select
                value={companyIdentity.companyType || ''}
                onValueChange={(value) => updateCompanyIdentity({ companyType: value as CompanyType })}
              >
                <SelectTrigger className={errors.companyType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select company type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PUBLIC_LIMITED">Public Limited Company</SelectItem>
                </SelectContent>
              </Select>
              {errors.companyType && (
                <p className="text-sm text-red-600">{errors.companyType}</p>
              )}
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
                onChange={(e) => updateCompanyIdentity({ registrationNumber: e.target.value })}
                className={errors.registrationNumber ? 'border-red-500' : ''}
              />
              {errors.registrationNumber && (
                <p className="text-sm text-red-600">{errors.registrationNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="incorporationDate">
                Date of Incorporation
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="incorporationDate"
                type="date"
                value={companyIdentity.incorporationDate ? 
                  new Date(companyIdentity.incorporationDate).toISOString().split('T')[0] : ''}
                onChange={(e) => updateCompanyIdentity({ 
                  incorporationDate: e.target.value ? new Date(e.target.value) : undefined 
                })}
                className={errors.incorporationDate ? 'border-red-500' : ''}
              />
              {errors.incorporationDate && (
                <p className="text-sm text-red-600">{errors.incorporationDate}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <AddressInput
        label="Registered Office Address"
        value={companyIdentity.registeredAddress}
        onChange={(address) => updateCompanyIdentity({ registeredAddress: address })}
        required={true}
        errors={errors.registeredAddress}
      />

      <ContactInfoInput
        label="Company Contact Information"
        value={companyIdentity.contactInfo}
        onChange={(contactInfo) => updateCompanyIdentity({ contactInfo })}
        required={true}
        errors={errors.contactInfo}
      />

      <Separator />

      <div>
        <h4 className="text-base font-semibold mb-4">Required Documents</h4>
        <div className="space-y-6">
          <FileUpload
            label="Certificate of Incorporation"
            description="Upload the official Certificate of Incorporation issued by RDB"
            acceptedTypes={['pdf', 'jpg', 'jpeg', 'png']}
            required={true}
            value={companyIdentity.documents?.certificateOfIncorporation}
            onChange={(file) => updateCompanyIdentity({
              documents: {
                certificateOfIncorporation: file as Document
              }
            })}
            error={errors.certificateOfIncorporation}
          />

          <FileUpload
            label="Memorandum and Articles of Association"
            description="Upload the current Memorandum and Articles of Association"
            acceptedTypes={['pdf', 'doc', 'docx']}
            required={true}
            value={companyIdentity.documents?.memorandumAndArticles}
            onChange={(file) => updateCompanyIdentity({
              documents: {
                memorandumAndArticles: file as Document
              }
            })}
            error={errors.memorandumAndArticles}
          />
        </div>
      </div>
    </div>
  )
}