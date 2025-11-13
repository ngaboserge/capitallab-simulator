"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileUpload } from '@/components/cma-issuer/form-components/file-upload'
import { IssuerApplication, Document } from '@/lib/cma-issuer-system/types'
import { AlertCircle, CheckCircle, Info, FileText, Shield, Users } from 'lucide-react'

interface ProspectusSectionProps {
  data: Partial<IssuerApplication>
  onDataChange: (data: Partial<IssuerApplication>) => void
  onSectionComplete: (isComplete: boolean) => void
}

interface ValidationErrors {
  materialInformationDisclosed?: string
  forecastAssumptionsReasonable?: string
  fullProspectus?: string
  abridgedProspectus?: string
  expertConsents?: string
  riskFactorsSummary?: string
  projectTimeline?: string
  capitalStructureTable?: string
  feeDisclosure?: string
}

export function ProspectusSection({
  data,
  onDataChange,
  onSectionComplete
}: ProspectusSectionProps) {
  const [errors, setErrors] = useState<ValidationErrors>({})

  const prospectus = data.prospectus || {
    materialInformationDisclosed: false,
    forecastAssumptionsReasonable: false,
    documents: {
      fullProspectus: undefined,
      abridgedProspectus: undefined,
      expertConsents: [],
      riskFactorsSummary: undefined,
      projectTimeline: undefined,
      capitalStructureTable: undefined,
      feeDisclosure: undefined
    }
  }

  const updateProspectus = (updates: any) => {
    const updatedData = {
      ...data,
      prospectus: {
        ...prospectus,
        ...updates
      }
    }
    onDataChange(updatedData)
  }

  const validateSection = () => {
    const newErrors: ValidationErrors = {}

    // Material information disclosure confirmation
    if (!prospectus.materialInformationDisclosed) {
      newErrors.materialInformationDisclosed = 'Material information disclosure confirmation is required'
    }

    // Forecast assumptions confirmation
    if (!prospectus.forecastAssumptionsReasonable) {
      newErrors.forecastAssumptionsReasonable = 'Forecast assumptions confirmation is required'
    }

    // Document validation
    if (!prospectus.documents?.fullProspectus) {
      newErrors.fullProspectus = 'Full prospectus is required'
    }
    
    if (!prospectus.documents?.abridgedProspectus) {
      newErrors.abridgedProspectus = 'Abridged prospectus is required'
    }
    
    if (!prospectus.documents?.expertConsents || prospectus.documents.expertConsents.length === 0) {
      newErrors.expertConsents = 'Expert consents are required (auditor, legal counsel, valuer)'
    }
    
    if (!prospectus.documents?.riskFactorsSummary) {
      newErrors.riskFactorsSummary = 'Risk factors summary is required'
    }
    
    if (!prospectus.documents?.projectTimeline) {
      newErrors.projectTimeline = 'Project timeline is required'
    }
    
    if (!prospectus.documents?.capitalStructureTable) {
      newErrors.capitalStructureTable = 'Capital structure table is required'
    }
    
    if (!prospectus.documents?.feeDisclosure) {
      newErrors.feeDisclosure = 'Fee disclosure statement is required'
    }

    setErrors(newErrors)
    
    const isComplete = Object.keys(newErrors).length === 0
    onSectionComplete(isComplete)
    
    return isComplete
  }

  useEffect(() => {
    validateSection()
  }, [prospectus])

  const getProspectusStatus = () => {
    const hasConfirmations = prospectus.materialInformationDisclosed && 
                            prospectus.forecastAssumptionsReasonable
    
    const hasRequiredDocs = prospectus.documents?.fullProspectus &&
                           prospectus.documents?.abridgedProspectus &&
                           prospectus.documents?.expertConsents?.length > 0 &&
                           prospectus.documents?.riskFactorsSummary &&
                           prospectus.documents?.projectTimeline &&
                           prospectus.documents?.capitalStructureTable &&
                           prospectus.documents?.feeDisclosure
    
    if (hasConfirmations && hasRequiredDocs) {
      return { type: 'success', message: 'Prospectus and disclosure requirements complete' }
    } else if (hasRequiredDocs) {
      return { type: 'warning', message: 'Documents uploaded, complete confirmations' }
    } else if (hasConfirmations) {
      return { type: 'warning', message: 'Confirmations provided, upload required documents' }
    }
    return { type: 'info', message: 'Complete prospectus and disclosure requirements' }
  }

  const prospectusStatus = getProspectusStatus()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Prospectus & Disclosure Checklist</h3>
        <p className="text-sm text-muted-foreground">
          Provide comprehensive prospectus documentation and confirm disclosure compliance for investor protection.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Requirements:</strong> Full and abridged prospectus, expert consents from auditor/legal/valuer, 
          risk factors summary, and comprehensive disclosure confirmations.
        </AlertDescription>
      </Alert>

      <Alert className={
        prospectusStatus.type === 'success' ? 'border-green-500 bg-green-50' :
        prospectusStatus.type === 'warning' ? 'border-orange-500 bg-orange-50' :
        'border-blue-500 bg-blue-50'
      }>
        {prospectusStatus.type === 'success' ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : prospectusStatus.type === 'warning' ? (
          <AlertCircle className="h-4 w-4 text-orange-600" />
        ) : (
          <Info className="h-4 w-4 text-blue-600" />
        )}
        <AlertDescription className={
          prospectusStatus.type === 'success' ? 'text-green-800' :
          prospectusStatus.type === 'warning' ? 'text-orange-800' :
          'text-blue-800'
        }>
          {prospectusStatus.message}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Disclosure Confirmations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="materialInformationDisclosed"
              checked={prospectus.materialInformationDisclosed || false}
              onCheckedChange={(checked) => updateProspectus({ 
                materialInformationDisclosed: checked === true 
              })}
              className={errors.materialInformationDisclosed ? 'border-red-500 mt-1' : 'mt-1'}
            />
            <div className="space-y-1">
              <Label htmlFor="materialInformationDisclosed" className="text-sm font-medium">
                Material Information Disclosure Confirmation
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                I confirm that all material information that could affect an investor's decision 
                has been disclosed in the prospectus, including financial performance, business risks, 
                management changes, and any other material facts or circumstances.
              </p>
              {errors.materialInformationDisclosed && (
                <p className="text-sm text-red-600">{errors.materialInformationDisclosed}</p>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="forecastAssumptionsReasonable"
              checked={prospectus.forecastAssumptionsReasonable || false}
              onCheckedChange={(checked) => updateProspectus({ 
                forecastAssumptionsReasonable: checked === true 
              })}
              className={errors.forecastAssumptionsReasonable ? 'border-red-500 mt-1' : 'mt-1'}
            />
            <div className="space-y-1">
              <Label htmlFor="forecastAssumptionsReasonable" className="text-sm font-medium">
                Forecast Assumptions Reasonableness Confirmation
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                I confirm that all financial forecasts and projections included in the prospectus 
                are based on reasonable assumptions, have been prepared with due care, and reflect 
                the directors' honest opinion of the company's future prospects.
              </p>
              {errors.forecastAssumptionsReasonable && (
                <p className="text-sm text-red-600">{errors.forecastAssumptionsReasonable}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div>
        <h4 className="text-base font-semibold mb-4 flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Prospectus Documents
        </h4>
        <div className="space-y-6">
          <FileUpload
            label="Full Prospectus"
            description="Upload the complete prospectus document containing all required disclosures and information"
            acceptedTypes={['pdf']}
            required={true}
            value={prospectus.documents?.fullProspectus}
            onChange={(file) => updateProspectus({
              documents: {
                ...prospectus.documents,
                fullProspectus: file as Document
              }
            })}
            error={errors.fullProspectus}
          />

          <FileUpload
            label="Abridged Prospectus"
            description="Upload the abridged prospectus for newspaper publication and public distribution"
            acceptedTypes={['pdf']}
            required={true}
            value={prospectus.documents?.abridgedProspectus}
            onChange={(file) => updateProspectus({
              documents: {
                ...prospectus.documents,
                abridgedProspectus: file as Document
              }
            })}
            error={errors.abridgedProspectus}
          />
        </div>
      </div>

      <div>
        <h4 className="text-base font-semibold mb-4 flex items-center">
          <Users className="w-4 h-4 mr-2" />
          Expert Consents & Professional Opinions
        </h4>
        <div className="space-y-6">
          <FileUpload
            label="Expert Consents"
            description="Upload signed consent letters from auditor, legal counsel, and valuer (if applicable) for inclusion of their reports in the prospectus"
            acceptedTypes={['pdf', 'doc', 'docx']}
            required={true}
            multiple={true}
            value={prospectus.documents?.expertConsents}
            onChange={(files) => updateProspectus({
              documents: {
                ...prospectus.documents,
                expertConsents: Array.isArray(files) ? files : (files ? [files] : [])
              }
            })}
            error={errors.expertConsents}
          />
        </div>
      </div>

      <div>
        <h4 className="text-base font-semibold mb-4">Supporting Documentation</h4>
        <div className="space-y-6">
          <FileUpload
            label="Risk Factors Summary"
            description="Upload comprehensive summary of all material risks associated with the investment"
            acceptedTypes={['pdf', 'doc', 'docx']}
            required={true}
            value={prospectus.documents?.riskFactorsSummary}
            onChange={(file) => updateProspectus({
              documents: {
                ...prospectus.documents,
                riskFactorsSummary: file as Document
              }
            })}
            error={errors.riskFactorsSummary}
          />

          <FileUpload
            label="Project Timeline"
            description="Upload detailed timeline showing key milestones and implementation schedule"
            acceptedTypes={['pdf', 'doc', 'docx', 'xls', 'xlsx']}
            required={true}
            value={prospectus.documents?.projectTimeline}
            onChange={(file) => updateProspectus({
              documents: {
                ...prospectus.documents,
                projectTimeline: file as Document
              }
            })}
            error={errors.projectTimeline}
          />

          <FileUpload
            label="Capital Structure Table"
            description="Upload detailed table showing pre and post-offer capital structure and shareholding pattern"
            acceptedTypes={['pdf', 'xls', 'xlsx', 'doc', 'docx']}
            required={true}
            value={prospectus.documents?.capitalStructureTable}
            onChange={(file) => updateProspectus({
              documents: {
                ...prospectus.documents,
                capitalStructureTable: file as Document
              }
            })}
            error={errors.capitalStructureTable}
          />

          <FileUpload
            label="Fee Disclosure Statement"
            description="Upload comprehensive disclosure of all fees payable to advisors, underwriters, and other parties"
            acceptedTypes={['pdf', 'doc', 'docx']}
            required={true}
            value={prospectus.documents?.feeDisclosure}
            onChange={(file) => updateProspectus({
              documents: {
                ...prospectus.documents,
                feeDisclosure: file as Document
              }
            })}
            error={errors.feeDisclosure}
          />
        </div>
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">
            Prospectus Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              {prospectus.documents?.fullProspectus ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>Full prospectus uploaded</span>
            </div>
            <div className="flex items-center space-x-2">
              {prospectus.documents?.abridgedProspectus ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>Abridged prospectus uploaded</span>
            </div>
            <div className="flex items-center space-x-2">
              {prospectus.documents?.expertConsents?.length > 0 ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>Expert consents uploaded ({prospectus.documents?.expertConsents?.length || 0})</span>
            </div>
            <div className="flex items-center space-x-2">
              {prospectus.documents?.riskFactorsSummary ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>Risk factors summary uploaded</span>
            </div>
            <div className="flex items-center space-x-2">
              {prospectus.documents?.projectTimeline ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>Project timeline uploaded</span>
            </div>
            <div className="flex items-center space-x-2">
              {prospectus.documents?.capitalStructureTable ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>Capital structure table uploaded</span>
            </div>
            <div className="flex items-center space-x-2">
              {prospectus.documents?.feeDisclosure ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>Fee disclosure statement uploaded</span>
            </div>
            <div className="flex items-center space-x-2">
              {prospectus.materialInformationDisclosed ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>Material information disclosure confirmed</span>
            </div>
            <div className="flex items-center space-x-2">
              {prospectus.forecastAssumptionsReasonable ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>Forecast assumptions confirmed</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}