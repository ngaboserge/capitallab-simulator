"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { FileUpload } from '@/components/cma-issuer/form-components/file-upload'
import { IssuerApplication, Document } from '@/lib/cma-issuer-system/types'
import { AlertCircle, CheckCircle, Info, Shield, FileText, User, Scale } from 'lucide-react'

interface ComplianceSectionProps {
  data: Partial<IssuerApplication>
  onDataChange: (data: Partial<IssuerApplication>) => void
  onSectionComplete: (isComplete: boolean) => void
}

export function ComplianceSection({
  data,
  onDataChange,
  onSectionComplete
}: ComplianceSectionProps) {
  const [localData, setLocalData] = useState({
    // Legal Proceedings
    ongoingLitigation: data.legalCompliance?.ongoingLitigation || '',
    litigationValue: '',
    regulatoryActions: '',
    
    // Compliance History
    previousViolations: '',
    complianceOfficer: '',
    complianceOfficerContact: '',
    
    // Confirmations
    materialLitigationConfirmation: data.legalCompliance?.materialLitigationConfirmation || false,
    regulatoryComplianceConfirmation: false,
    noMaterialChanges: false,
    
    // Documents
    businessLicenses: data.legalCompliance?.documents?.businessLicenses || [],
    taxClearance: data.legalCompliance?.documents?.taxClearance || null,
    complianceStatement: data.legalCompliance?.documents?.complianceStatement || null,
    materialContracts: data.legalCompliance?.documents?.materialContracts || null
  })

  const updateField = (field: string, value: any) => {
    const newLocalData = { ...localData, [field]: value }
    setLocalData(newLocalData)

    // Update parent data
    const updatedData = {
      ...data,
      legalCompliance: {
        ongoingLitigation: field === 'ongoingLitigation' ? value : localData.ongoingLitigation,
        materialLitigationConfirmation: field === 'materialLitigationConfirmation' ? Boolean(value) : Boolean(localData.materialLitigationConfirmation),
        documents: {
          businessLicenses: (field === 'businessLicenses' ? value : localData.businessLicenses) as Document[],
          taxClearance: (field === 'taxClearance' ? value : localData.taxClearance) as Document,
          complianceStatement: (field === 'complianceStatement' ? value : localData.complianceStatement) as Document,
          materialContracts: (field === 'materialContracts' ? value : localData.materialContracts) as Document
        }
      }
    }
    
    onDataChange(updatedData)

    // Simple validation
    const hasRequiredFields = 
      newLocalData.complianceOfficer &&
      newLocalData.complianceOfficerContact &&
      newLocalData.materialLitigationConfirmation &&
      newLocalData.regulatoryComplianceConfirmation &&
      newLocalData.noMaterialChanges &&
      newLocalData.businessLicenses.length > 0 &&
      newLocalData.taxClearance &&
      newLocalData.complianceStatement &&
      newLocalData.materialContracts

    onSectionComplete(Boolean(hasRequiredFields))
  }

  const getComplianceStatus = () => {
    const hasRequiredDocs = localData.businessLicenses.length > 0 &&
                           localData.taxClearance &&
                           localData.complianceStatement &&
                           localData.materialContracts
    
    const hasConfirmation = localData.materialLitigationConfirmation
    
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
            <User className="w-4 h-4 mr-2" />
            Compliance Officer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="complianceOfficer">
                Chief Compliance Officer
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="complianceOfficer"
                placeholder="Enter compliance officer name"
                value={localData.complianceOfficer}
                onChange={(e) => updateField('complianceOfficer', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="complianceOfficerContact">
                Contact Information
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="complianceOfficerContact"
                placeholder="Email and phone number"
                value={localData.complianceOfficerContact}
                onChange={(e) => updateField('complianceOfficerContact', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Scale className="w-4 h-4 mr-2" />
            Regulatory Compliance History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="previousViolations">
              Previous Regulatory Violations (if any)
            </Label>
            <Textarea
              id="previousViolations"
              placeholder="Describe any previous regulatory violations, penalties, or sanctions. If none, enter 'None' or 'N/A'"
              value={localData.previousViolations}
              onChange={(e) => updateField('previousViolations', e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="regulatoryActions">
              Ongoing Regulatory Actions
            </Label>
            <Textarea
              id="regulatoryActions"
              placeholder="Describe any ongoing regulatory investigations or actions. If none, enter 'None' or 'N/A'"
              value={localData.regulatoryActions}
              onChange={(e) => updateField('regulatoryActions', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

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
              value={localData.ongoingLitigation}
              onChange={(e) => updateField('ongoingLitigation', e.target.value)}
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              Provide details of any material litigation, arbitration, or regulatory proceedings 
              that could affect the company's operations or financial position.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="litigationValue">
              Total Value of Claims (RWF)
            </Label>
            <Input
              id="litigationValue"
              type="number"
              placeholder="Enter total value of all claims against the company"
              value={localData.litigationValue}
              onChange={(e) => updateField('litigationValue', e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Include all pending claims, lawsuits, and potential liabilities
            </p>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="materialLitigationConfirmation"
              checked={localData.materialLitigationConfirmation}
              onCheckedChange={(checked) => updateField('materialLitigationConfirmation', checked)}
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
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="regulatoryComplianceConfirmation"
              checked={localData.regulatoryComplianceConfirmation}
              onCheckedChange={(checked) => updateField('regulatoryComplianceConfirmation', checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="regulatoryComplianceConfirmation" className="text-sm font-medium">
                Regulatory Compliance Confirmation
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                I confirm that the company is in full compliance with all applicable laws, regulations, 
                and regulatory requirements in Rwanda and has all necessary licenses and permits.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="noMaterialChanges"
              checked={localData.noMaterialChanges}
              onCheckedChange={(checked) => updateField('noMaterialChanges', checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="noMaterialChanges" className="text-sm font-medium">
                No Material Changes Confirmation
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                I confirm that there have been no material changes in the company's legal or regulatory 
                status since the last audited financial statements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

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
            value={localData.businessLicenses}
            onChange={(files) => updateField('businessLicenses', Array.isArray(files) ? files : (files ? [files] : []))}
          />

          <FileUpload
            label="Tax Clearance Certificate"
            description="Upload current tax clearance certificate from Rwanda Revenue Authority (RRA)"
            acceptedTypes={['pdf', 'jpg', 'jpeg', 'png']}
            required={true}
            value={localData.taxClearance || undefined}
            onChange={(file) => updateField('taxClearance', file)}
          />

          <FileUpload
            label="Legal Compliance Statement"
            description="Upload signed legal compliance statement from Company Secretary confirming regulatory compliance"
            acceptedTypes={['pdf', 'doc', 'docx']}
            required={true}
            value={localData.complianceStatement || undefined}
            onChange={(file) => updateField('complianceStatement', file)}
          />

          <FileUpload
            label="Material Contracts and Obligations"
            description="Upload documentation of all material contracts, agreements, and obligations that could affect the business"
            acceptedTypes={['pdf', 'doc', 'docx']}
            required={true}
            value={localData.materialContracts || undefined}
            onChange={(file) => updateField('materialContracts', file)}
          />
        </div>
      </div>
    </div>
  )
}