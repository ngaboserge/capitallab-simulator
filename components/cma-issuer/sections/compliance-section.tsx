"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
// import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileUpload } from '@/components/cma-issuer/form-components/file-upload'
import { IssuerApplication, Document } from '@/lib/cma-issuer-system/types'
import { AlertCircle, CheckCircle, Info, Shield, FileText } from 'lucide-react'

interface ComplianceSectionProps {
  data: Partial<IssuerApplication>
  onDataChange: (data: Partial<IssuerApplication>) => void
  onSectionComplete: (isComplete: boolean) => void
}

interface ValidationErrors {
  materialLitigationConfirmation?: string
  businessLicenses?: string
  taxClearance?: string
  complianceStatement?: string
  materialContracts?: string
}

export function ComplianceSection({
  data,
  onDataChange,
  onSectionComplete
}: ComplianceSectionProps) {
  const [errors, setErrors] = useState<ValidationErrors>({})

  const legalCompliance = data.legalCompliance || {
    ongoingLitigation: '',
    materialLitigationConfirmation: false,
    documents: {
      businessLicenses: [],
      taxClearance: undefined,
      complianceStatement: undefined,
      materialContracts: undefined
    }
  }

  const updateLegalCompliance = (updates: any) => {
    const updatedData = {
      ...data,
      legalCompliance: {
        ...legalCompliance,
        ...updates
      }
    }
    onDataChange(updatedData)
  }

  const validateSection = useCallback(() => {
    const newErrors: ValidationErrors = {}

    // Material litigation confirmation is required
    if (legalCompliance.materialLitigationConfirmation === undefined) {
      newErrors.materialLitigationConfirmation = 'Material litigation confirmation is required'
    }

    // Document validation
    if (!legalCompliance.documents?.businessLicenses || legalCompliance.documents.businessLicenses.length === 0) {
      newErrors.businessLicenses = 'Business licenses are required'
    }
    
    if (!legalCompliance.documents?.taxClearance) {
      newErrors.taxClearance = 'Tax clearance certificate is required'
    }
    
    if (!legalCompliance.documents?.complianceStatement) {
      newErrors.complianceStatement = 'Legal compliance statement is required'
    }
    
    if (!legalCompliance.documents?.materialContracts) {
      newErrors.materialContracts = 'Material contracts documentation is required'
    }

    setErrors(newErrors)
    
    const isComplete = Object.keys(newErrors).length === 0
    onSectionComplete(isComplete)
    
    return isComplete
  }, [legalCompliance.materialLitigationConfirmation, legalCompliance.documents])

  useEffect(() => {
    validateSection()
  }, [legalCompliance.materialLitigationConfirmation, legalCompliance.documents])

  const getComplianceStatus = () => {
    const hasRequiredDocs = legalCompliance.documents?.businessLicenses?.length > 0 &&
                           legalCompliance.documents?.taxClearance &&
                           legalCompliance.documents?.complianceStatement &&
                           legalCompliance.documents?.materialContracts
    
    const hasConfirmation = legalCompliance.materialLitigationConfirmation !== undefined
    
    if (hasRequiredDocs && hasConfirmation) {
      return { type: 'success', message: 'Legal compliance requirements met' }
    } else if (!hasRequiredDocs || !hasConfirmation) {
      return { type: 'error', message: 'Legal compliance requirements not met' }
    }
    return { type: 'info', message: 'Complete compliance information to check requirements' }
  }

  const complianceStatus = getComplianceStatus()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Legal & Regulatory Compliance</h3>
        <p className="text-sm text-muted-foreground">
          Demonstrate legal and regulatory compliance to confirm there are no hidden risks.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Requirements:</strong> Current business licenses, tax clearance, legal compliance statement, 
          and disclosure of any material litigation or contracts.
        </AlertDescription>
      </Alert>

      <Alert className={
        complianceStatus.type === 'success' ? 'border-green-500 bg-green-50' :
        complianceStatus.type === 'error' ? 'border-red-500 bg-red-50' :
        'border-blue-500 bg-blue-50'
      }>
        {complianceStatus.type === 'success' ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : complianceStatus.type === 'error' ? (
          <AlertCircle className="h-4 w-4 text-red-600" />
        ) : (
          <Info className="h-4 w-4 text-blue-600" />
        )}
        <AlertDescription className={
          complianceStatus.type === 'success' ? 'text-green-800' :
          complianceStatus.type === 'error' ? 'text-red-800' :
          'text-blue-800'
        }>
          {complianceStatus.message}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Legal Proceedings Disclosure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ongoingLitigation">
              Ongoing Legal Proceedings (if any)
            </Label>
            <Textarea
              id="ongoingLitigation"
              placeholder="Describe any ongoing legal proceedings, investigations, or regulatory actions. If none, enter 'None' or 'N/A'"
              value={legalCompliance.ongoingLitigation || ''}
              onChange={(e) => updateLegalCompliance({ ongoingLitigation: e.target.value })}
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              Provide details of any material litigation, arbitration, or regulatory proceedings 
              that could affect the company's operations or financial position.
            </p>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="materialLitigationConfirmation"
              checked={Boolean(legalCompliance.materialLitigationConfirmation)}
              onCheckedChange={(checked) => updateLegalCompliance({ 
                materialLitigationConfirmation: Boolean(checked)
              })}
              className={errors.materialLitigationConfirmation ? 'border-red-500 mt-1' : 'mt-1'}
            />
            <div className="space-y-1">
              <Label htmlFor="materialLitigationConfirmation" className="text-sm font-medium">
                Material Litigation Confirmation
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                I confirm that there is no material litigation, arbitration, or regulatory action 
                that would materially affect the company's operations, financial position, or ability 
                to conduct the proposed public offering.
              </p>
              {errors.materialLitigationConfirmation && (
                <p className="text-sm text-red-600">{errors.materialLitigationConfirmation}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="border-t my-6" />

      <div>
        <h4 className="text-base font-semibold mb-4 flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Required Compliance Documents
        </h4>
        <div className="space-y-6">
          <FileUpload
            label="Business Licenses"
            description="Upload all current business licenses and permits required for your operations"
            acceptedTypes={['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']}
            required={true}
            multiple={true}
            value={legalCompliance.documents?.businessLicenses}
            onChange={(files) => updateLegalCompliance({
              documents: {
                ...legalCompliance.documents,
                businessLicenses: Array.isArray(files) ? files : (files ? [files] : [])
              }
            })}
            error={errors.businessLicenses}
          />

          <FileUpload
            label="Tax Clearance Certificate"
            description="Upload current tax clearance certificate from Rwanda Revenue Authority (RRA)"
            acceptedTypes={['pdf', 'jpg', 'jpeg', 'png']}
            required={true}
            value={legalCompliance.documents?.taxClearance}
            onChange={(file) => updateLegalCompliance({
              documents: {
                ...legalCompliance.documents,
                taxClearance: file as Document
              }
            })}
            error={errors.taxClearance}
          />

          <FileUpload
            label="Legal Compliance Statement"
            description="Upload signed legal compliance statement from Company Secretary confirming regulatory compliance"
            acceptedTypes={['pdf', 'doc', 'docx']}
            required={true}
            value={legalCompliance.documents?.complianceStatement}
            onChange={(file) => updateLegalCompliance({
              documents: {
                ...legalCompliance.documents,
                complianceStatement: file as Document
              }
            })}
            error={errors.complianceStatement}
          />

          <FileUpload
            label="Material Contracts and Obligations"
            description="Upload documentation of all material contracts, agreements, and obligations that could affect the business"
            acceptedTypes={['pdf', 'doc', 'docx']}
            required={true}
            value={legalCompliance.documents?.materialContracts}
            onChange={(file) => updateLegalCompliance({
              documents: {
                ...legalCompliance.documents,
                materialContracts: file as Document
              }
            })}
            error={errors.materialContracts}
          />
        </div>
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">
            Compliance Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              {legalCompliance.documents?.businessLicenses?.length > 0 ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>Business licenses uploaded</span>
            </div>
            <div className="flex items-center space-x-2">
              {legalCompliance.documents?.taxClearance ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>Tax clearance certificate uploaded</span>
            </div>
            <div className="flex items-center space-x-2">
              {legalCompliance.documents?.complianceStatement ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>Legal compliance statement uploaded</span>
            </div>
            <div className="flex items-center space-x-2">
              {legalCompliance.documents?.materialContracts ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>Material contracts documentation uploaded</span>
            </div>
            <div className="flex items-center space-x-2">
              {legalCompliance.materialLitigationConfirmation ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>Material litigation confirmation provided</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}