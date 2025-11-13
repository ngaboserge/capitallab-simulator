"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ContactInfoInput } from '@/components/cma-issuer/form-components/contact-info-input'
import { IssuerApplication } from '@/lib/cma-issuer-system/types'
import { PenTool, CheckCircle, AlertCircle, User, FileSignature } from 'lucide-react'

interface DeclarationsSectionProps {
  data: Partial<IssuerApplication>
  onDataChange: (data: Partial<IssuerApplication>) => void
  onSectionComplete: (isComplete: boolean) => void
}

export function DeclarationsSection({ data, onDataChange, onSectionComplete }: DeclarationsSectionProps) {
  const [formData, setFormData] = useState({
    authorizedOfficer: data.declarations?.authorizedOfficer || {
      name: '',
      position: '',
      contactInfo: {
        email: '',
        phone: '',
        fax: '',
        website: ''
      }
    },
    investmentAdviser: {
      name: '',
      title: '',
      company: '',
      email: '',
      phone: '',
      licenseNumber: ''
    },
    declarationAcceptance: false,
    informationAccuracy: false,
    complianceCommitment: false,
    advisorConfirmation: false,
    digitalSignature: {
      officerSignature: '',
      advisorSignature: '',
      signatureDate: '',
      ipAddress: '',
      timestamp: ''
    }
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const errors: Record<string, string> = {}
    
    if (!formData.authorizedOfficer.name.trim()) {
      errors.officerName = 'Authorized officer name is required'
    }
    
    if (!formData.authorizedOfficer.position.trim()) {
      errors.officerTitle = 'Authorized officer title is required'
    }
    
    if (!formData.authorizedOfficer.contactInfo.email.trim()) {
      errors.officerEmail = 'Authorized officer email is required'
    }
    
    if (!formData.authorizedOfficer.contactInfo.phone.trim()) {
      errors.officerPhone = 'Authorized officer phone is required'
    }
    
    if (!formData.investmentAdviser.name.trim()) {
      errors.advisorName = 'Investment adviser name is required'
    }
    
    if (!formData.investmentAdviser.company.trim()) {
      errors.advisorCompany = 'Investment adviser company is required'
    }
    
    if (!formData.investmentAdviser.licenseNumber.trim()) {
      errors.advisorLicense = 'Investment adviser license number is required'
    }
    
    if (!formData.declarationAcceptance) {
      errors.declarationAcceptance = 'Declaration acceptance is required'
    }
    
    if (!formData.informationAccuracy) {
      errors.informationAccuracy = 'Information accuracy confirmation is required'
    }
    
    if (!formData.complianceCommitment) {
      errors.complianceCommitment = 'Compliance commitment is required'
    }
    
    if (!formData.advisorConfirmation) {
      errors.advisorConfirmation = 'Investment adviser confirmation is required'
    }

    // Only show errors for touched fields
    const filteredErrors: Record<string, string> = {}
    Object.keys(errors).forEach(key => {
      if (touchedFields[key]) {
        filteredErrors[key] = errors[key]
      }
    })
    
    setValidationErrors(filteredErrors)
    
    const isComplete = Object.keys(errors).length === 0

    onSectionComplete(isComplete)
  }, [formData, touchedFields])

  const updateFormData = (updates: Partial<typeof formData>) => {
    const newFormData = { ...formData, ...updates }
    setFormData(newFormData)
    
    // Update parent data with proper structure
    const updatedData = {
      ...data,
      declarations: {
        authorizedOfficer: {
          name: newFormData.authorizedOfficer.name,
          position: newFormData.authorizedOfficer.position,
          contactInfo: newFormData.authorizedOfficer.contactInfo,
          signature: {
            signerId: '1',
            signerName: newFormData.authorizedOfficer.name,
            signerPosition: newFormData.authorizedOfficer.position,
            signatureData: newFormData.digitalSignature.officerSignature,
            timestamp: new Date(),
            ipAddress: newFormData.digitalSignature.ipAddress
          },
          declarationText: 'I hereby declare that all information provided is true and accurate.'
        },
        investmentAdviser: {
          signature: {
            signerId: '2',
            signerName: newFormData.investmentAdviser.name,
            signerPosition: newFormData.investmentAdviser.title,
            signatureData: newFormData.digitalSignature.advisorSignature,
            timestamp: new Date(),
            ipAddress: newFormData.digitalSignature.ipAddress
          },
          confirmationText: 'I confirm the accuracy of this application.'
        }
      }
    }
    onDataChange(updatedData)
  }

  const handleOfficerChange = (field: string, value: any) => {
    updateFormData({
      authorizedOfficer: {
        ...formData.authorizedOfficer,
        [field]: value
      }
    })
  }

  const handleAdvisorChange = (field: string, value: string) => {
    updateFormData({
      investmentAdviser: {
        ...formData.investmentAdviser,
        [field]: value
      }
    })
  }

  const handleDigitalSignature = (type: 'officer' | 'advisor') => {
    const timestamp = new Date().toISOString()
    const ipAddress = '127.0.0.1' // In real implementation, get actual IP
    
    updateFormData({
      digitalSignature: {
        ...formData.digitalSignature,
        [`${type}Signature`]: `${type === 'officer' ? formData.authorizedOfficer.name : formData.investmentAdviser.name}_${timestamp}`,
        signatureDate: timestamp,
        ipAddress,
        timestamp
      }
    })
  }

  const markFieldTouched = (fieldName: string) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="w-5 h-5" />
            Declarations & Authorized Contacts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Authorized Officer Details */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <User className="w-4 h-4" />
              Authorized Officer Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name *
                </label>
                <Input
                  value={formData.authorizedOfficer.name}
                  onChange={(e) => handleOfficerChange('name', e.target.value)}
                  onFocus={() => markFieldTouched('officerName')}
                  placeholder="Enter full name"
                  className={validationErrors.officerName ? 'border-red-500' : ''}
                />
                {validationErrors.officerName && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.officerName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Title/Position *
                </label>
                <Input
                  value={formData.authorizedOfficer.position}
                  onChange={(e) => handleOfficerChange('position', e.target.value)}
                  onFocus={() => markFieldTouched('officerTitle')}
                  placeholder="e.g., Chief Executive Officer"
                  className={validationErrors.officerTitle ? 'border-red-500' : ''}
                />
                {validationErrors.officerTitle && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.officerTitle}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={formData.authorizedOfficer.contactInfo.email}
                  onChange={(e) => handleOfficerChange('contactInfo', { ...formData.authorizedOfficer.contactInfo, email: e.target.value })}
                  onFocus={() => markFieldTouched('officerEmail')}
                  placeholder="Enter email address"
                  className={validationErrors.officerEmail ? 'border-red-500' : ''}
                />
                {validationErrors.officerEmail && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.officerEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number *
                </label>
                <Input
                  value={formData.authorizedOfficer.contactInfo.phone}
                  onChange={(e) => handleOfficerChange('contactInfo', { ...formData.authorizedOfficer.contactInfo, phone: e.target.value })}
                  onFocus={() => markFieldTouched('officerPhone')}
                  placeholder="Enter phone number"
                  className={validationErrors.officerPhone ? 'border-red-500' : ''}
                />
                {validationErrors.officerPhone && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.officerPhone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Investment Adviser Details */}
          <div className="space-y-4">
            <h4 className="font-medium">Investment Adviser Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Adviser Name *
                </label>
                <Input
                  value={formData.investmentAdviser.name}
                  onChange={(e) => handleAdvisorChange('name', e.target.value)}
                  onFocus={() => markFieldTouched('advisorName')}
                  placeholder="Enter adviser name"
                  className={validationErrors.advisorName ? 'border-red-500' : ''}
                />
                {validationErrors.advisorName && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.advisorName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Title/Position
                </label>
                <Input
                  value={formData.investmentAdviser.title}
                  onChange={(e) => handleAdvisorChange('title', e.target.value)}
                  placeholder="Enter title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Company/Firm *
                </label>
                <Input
                  value={formData.investmentAdviser.company}
                  onChange={(e) => handleAdvisorChange('company', e.target.value)}
                  onFocus={() => markFieldTouched('advisorCompany')}
                  placeholder="Enter company name"
                  className={validationErrors.advisorCompany ? 'border-red-500' : ''}
                />
                {validationErrors.advisorCompany && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.advisorCompany}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  CMA License Number *
                </label>
                <Input
                  value={formData.investmentAdviser.licenseNumber}
                  onChange={(e) => handleAdvisorChange('licenseNumber', e.target.value)}
                  onFocus={() => markFieldTouched('advisorLicense')}
                  placeholder="Enter license number"
                  className={validationErrors.advisorLicense ? 'border-red-500' : ''}
                />
                {validationErrors.advisorLicense && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.advisorLicense}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={formData.investmentAdviser.email}
                  onChange={(e) => handleAdvisorChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <Input
                  value={formData.investmentAdviser.phone}
                  onChange={(e) => handleAdvisorChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          {/* Declaration Text */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-3">Declaration Statement</h4>
            <div className="text-sm space-y-2 text-gray-700">
              <p>
                I/We, the undersigned, being the authorized officer(s) of the applicant company, hereby declare that:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>All information provided in this application is true, accurate, and complete to the best of our knowledge</li>
                <li>We have disclosed all material facts and circumstances that may affect the application</li>
                <li>We understand and commit to comply with all CMA regulations and ongoing obligations</li>
                <li>We authorize CMA to verify any information provided and conduct necessary investigations</li>
                <li>We understand that providing false or misleading information may result in rejection or penalties</li>
              </ul>
            </div>
          </div>

          {/* Declaration Confirmations */}
          <div className="space-y-4">
            <h4 className="font-medium">Required Confirmations</h4>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="declarationAcceptance"
                  checked={formData.declarationAcceptance}
                  onCheckedChange={(checked) => {
                    markFieldTouched('declarationAcceptance')
                    const newValue = Boolean(checked)
                    updateFormData({ declarationAcceptance: newValue })
                  }}
                  className={validationErrors.declarationAcceptance ? 'border-red-500' : ''}
                />
                <div className="space-y-1">
                  <label htmlFor="declarationAcceptance" className="text-sm font-medium cursor-pointer">
                    Declaration Acceptance *
                  </label>
                  <p className="text-xs text-muted-foreground">
                    I accept and agree to the declaration statement above
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="informationAccuracy"
                  checked={formData.informationAccuracy}
                  onCheckedChange={(checked) => {
                    markFieldTouched('informationAccuracy')
                    const newValue = Boolean(checked)
                    updateFormData({ informationAccuracy: newValue })
                  }}
                  className={validationErrors.informationAccuracy ? 'border-red-500' : ''}
                />
                <div className="space-y-1">
                  <label htmlFor="informationAccuracy" className="text-sm font-medium cursor-pointer">
                    Information Accuracy Confirmation *
                  </label>
                  <p className="text-xs text-muted-foreground">
                    I confirm that all information provided is accurate and complete
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="complianceCommitment"
                  checked={formData.complianceCommitment}
                  onCheckedChange={(checked) => {
                    markFieldTouched('complianceCommitment')
                    const newValue = Boolean(checked)
                    updateFormData({ complianceCommitment: newValue })
                  }}
                  className={validationErrors.complianceCommitment ? 'border-red-500' : ''}
                />
                <div className="space-y-1">
                  <label htmlFor="complianceCommitment" className="text-sm font-medium cursor-pointer">
                    Compliance Commitment *
                  </label>
                  <p className="text-xs text-muted-foreground">
                    I commit to ongoing compliance with all CMA regulations
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="advisorConfirmation"
                  checked={formData.advisorConfirmation}
                  onCheckedChange={(checked) => {
                    markFieldTouched('advisorConfirmation')
                    const newValue = Boolean(checked)
                    updateFormData({ advisorConfirmation: newValue })
                  }}
                  className={validationErrors.advisorConfirmation ? 'border-red-500' : ''}
                />
                <div className="space-y-1">
                  <label htmlFor="advisorConfirmation" className="text-sm font-medium cursor-pointer">
                    Investment Adviser Confirmation *
                  </label>
                  <p className="text-xs text-muted-foreground">
                    The investment adviser confirms review and accuracy of this application
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Digital Signatures */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium flex items-center gap-2">
              <PenTool className="w-4 h-4" />
              Digital Signatures
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Authorized Officer Signature</label>
                {formData.digitalSignature.officerSignature ? (
                  <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                    <div className="font-medium text-green-700">Signed</div>
                    <div className="text-green-600">{formData.authorizedOfficer.name}</div>
                    <div className="text-xs text-green-500">
                      {formData.digitalSignature.signatureDate && new Date(formData.digitalSignature.signatureDate).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleDigitalSignature('officer')}
                    disabled={!formData.authorizedOfficer.name || Object.keys(validationErrors).length > 0}
                    className="w-full"
                  >
                    Sign as Authorized Officer
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Investment Adviser Signature</label>
                {formData.digitalSignature.advisorSignature ? (
                  <div className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                    <div className="font-medium text-green-700">Signed</div>
                    <div className="text-green-600">{formData.investmentAdviser.name}</div>
                    <div className="text-xs text-green-500">
                      {formData.digitalSignature.signatureDate && new Date(formData.digitalSignature.signatureDate).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => handleDigitalSignature('advisor')}
                    disabled={!formData.investmentAdviser.name || Object.keys(validationErrors).length > 0}
                    variant="outline"
                    className="w-full"
                  >
                    Sign as Investment Adviser
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Validation Summary */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                <AlertCircle className="w-4 h-4" />
                Please complete the following required fields:
              </div>
              <ul className="text-sm text-red-600 space-y-1">
                {Object.values(validationErrors).map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {Object.keys(validationErrors).length === 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <CheckCircle className="w-4 h-4" />
                Section 10: Declarations & Contacts - Complete
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}