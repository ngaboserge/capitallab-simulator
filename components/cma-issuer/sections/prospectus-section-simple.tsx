"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { FlexibleFileUpload } from '@/components/cma-issuer/form-components/flexible-file-upload'
import { IssuerApplication, Document } from '@/lib/cma-issuer-system/types'
import { AlertCircle, CheckCircle, Info, FileText, Shield, BookOpen } from 'lucide-react'

interface ProspectusSectionProps {
  data: Partial<IssuerApplication>
  onDataChange: (data: Partial<IssuerApplication>) => void
  onSectionComplete: (isComplete: boolean) => void
}

export function ProspectusSection({
  data,
  onDataChange,
  onSectionComplete
}: ProspectusSectionProps) {
  const [localData, setLocalData] = useState({
    // Disclosure Confirmations
    materialInformationDisclosed: data.prospectus?.materialInformationDisclosed || false,
    forecastAssumptionsReasonable: data.prospectus?.forecastAssumptionsReasonable || false,
    riskFactorsIdentified: false,
    expertConsentsObtained: false,
    financialProjectionsReasonable: false,
    
    // Risk Factors
    riskFactorsSummary: '',
    industryRisks: '',
    companySpecificRisks: '',
    marketRisks: '',
    
    // Financial Projections
    projectionPeriod: '',
    keyAssumptions: '',
    sensitivityAnalysis: ''
  })

  const [documents, setDocuments] = useState<Record<string, Document | null>>({
    fullProspectus: data.prospectus?.documents?.fullProspectus || null,
    abridgedProspectus: data.prospectus?.documents?.abridgedProspectus || null,
    expertConsents: data.prospectus?.documents?.expertConsents?.[0] || null, // Handle array as single for now
    riskFactorsSummaryDoc: data.prospectus?.documents?.riskFactorsSummary || null,
    projectTimeline: data.prospectus?.documents?.projectTimeline || null,
    capitalStructureTable: data.prospectus?.documents?.capitalStructureTable || null,
    feeDisclosure: data.prospectus?.documents?.feeDisclosure || null
  })

  const updateField = (field: string, value: any) => {
    const newLocalData = { ...localData, [field]: value }
    setLocalData(newLocalData)
    updateParentData(newLocalData, documents)
  }

  const updateDocuments = (newDocuments: Record<string, Document | null>) => {
    setDocuments(newDocuments)
    updateParentData(localData, newDocuments)
  }

  const updateParentData = (formData: typeof localData, docData: Record<string, Document | null>) => {
    // Update parent data
    const updatedData = {
      ...data,
      prospectus: {
        materialInformationDisclosed: Boolean(formData.materialInformationDisclosed),
        forecastAssumptionsReasonable: Boolean(formData.forecastAssumptionsReasonable),
        documents: {
          fullProspectus: docData.fullProspectus as Document,
          abridgedProspectus: docData.abridgedProspectus as Document,
          expertConsents: docData.expertConsents ? [docData.expertConsents as Document] : [], // Convert back to array
          riskFactorsSummary: docData.riskFactorsSummaryDoc as Document,
          projectTimeline: docData.projectTimeline as Document,
          capitalStructureTable: docData.capitalStructureTable as Document,
          feeDisclosure: docData.feeDisclosure as Document
        }
      }
    }
    
    onDataChange(updatedData)

    // Simple validation
    const hasRequiredFields = 
      formData.materialInformationDisclosed &&
      formData.forecastAssumptionsReasonable &&
      docData.fullProspectus &&
      docData.abridgedProspectus &&
      docData.expertConsents &&
      docData.riskFactorsSummaryDoc &&
      docData.projectTimeline &&
      docData.capitalStructureTable &&
      docData.feeDisclosure

    onSectionComplete(Boolean(hasRequiredFields))
  }

  const getProspectusStatus = () => {
    const hasBasicConfirmations = 
      localData.materialInformationDisclosed &&
      localData.forecastAssumptionsReasonable

    const hasDocuments = 
      documents.fullProspectus &&
      documents.abridgedProspectus &&
      documents.expertConsents

    if (hasBasicConfirmations && hasDocuments) {
      return { type: 'success', message: 'Prospectus requirements met' }
    } else if (hasBasicConfirmations || hasDocuments) {
      return { type: 'error', message: 'Prospectus requirements incomplete' }
    }
    return { type: 'info', message: 'Complete prospectus information and upload documents' }
  }

  const prospectusStatus = getProspectusStatus()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Prospectus & Disclosure Checklist</h3>
        <p className="text-sm text-muted-foreground">
          Ensure comprehensive disclosure and prospectus compliance for investor protection.
        </p>
      </div>

      <Alert className={
        prospectusStatus.type === 'success' ? 'border-green-500 bg-green-50' :
        prospectusStatus.type === 'error' ? 'border-red-500 bg-red-50' :
        'border-blue-500 bg-blue-50'
      }>
        {prospectusStatus.type === 'success' ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : prospectusStatus.type === 'error' ? (
          <AlertCircle className="h-4 w-4 text-red-600" />
        ) : (
          <Info className="h-4 w-4 text-blue-600" />
        )}
        <AlertDescription className={
          prospectusStatus.type === 'success' ? 'text-green-800' :
          prospectusStatus.type === 'error' ? 'text-red-800' :
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
              checked={localData.materialInformationDisclosed}
              onCheckedChange={(checked) => updateField('materialInformationDisclosed', checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="materialInformationDisclosed" className="text-sm font-medium">
                Material Information Disclosure
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                I confirm that all material information about the company has been disclosed 
                in the prospectus and there are no material omissions.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="forecastAssumptionsReasonable"
              checked={localData.forecastAssumptionsReasonable}
              onCheckedChange={(checked) => updateField('forecastAssumptionsReasonable', checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="forecastAssumptionsReasonable" className="text-sm font-medium">
                Reasonable Forecast Assumptions
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                I confirm that all financial forecasts and projections are based on reasonable 
                assumptions and have been prepared with due care.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="riskFactorsIdentified"
              checked={localData.riskFactorsIdentified}
              onCheckedChange={(checked) => updateField('riskFactorsIdentified', checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="riskFactorsIdentified" className="text-sm font-medium">
                Risk Factors Identified
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                I confirm that all material risk factors have been identified and adequately 
                disclosed to potential investors.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="expertConsentsObtained"
              checked={localData.expertConsentsObtained}
              onCheckedChange={(checked) => updateField('expertConsentsObtained', checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="expertConsentsObtained" className="text-sm font-medium">
                Expert Consents Obtained
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                I confirm that written consents have been obtained from all experts whose 
                opinions or reports are included in the prospectus.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="financialProjectionsReasonable"
              checked={localData.financialProjectionsReasonable}
              onCheckedChange={(checked) => updateField('financialProjectionsReasonable', checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="financialProjectionsReasonable" className="text-sm font-medium">
                Financial Projections Reasonable
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                I confirm that financial projections are reasonable, achievable, and based 
                on realistic market and business assumptions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            Risk Factors Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="riskFactorsSummary">
              Executive Summary of Risk Factors
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="riskFactorsSummary"
              placeholder="Provide a concise summary of the most significant risk factors affecting the investment"
              value={localData.riskFactorsSummary}
              onChange={(e) => updateField('riskFactorsSummary', e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industryRisks">
                Industry-Specific Risks
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Textarea
                id="industryRisks"
                placeholder="Describe risks specific to your industry sector"
                value={localData.industryRisks}
                onChange={(e) => updateField('industryRisks', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companySpecificRisks">
                Company-Specific Risks
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Textarea
                id="companySpecificRisks"
                placeholder="Describe risks unique to your company"
                value={localData.companySpecificRisks}
                onChange={(e) => updateField('companySpecificRisks', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="marketRisks">
              Market & Economic Risks
            </Label>
            <Textarea
              id="marketRisks"
              placeholder="Describe market volatility, economic conditions, and regulatory risks"
              value={localData.marketRisks}
              onChange={(e) => updateField('marketRisks', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <BookOpen className="w-4 h-4 mr-2" />
            Financial Projections
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectionPeriod">
              Projection Period & Methodology
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="projectionPeriod"
              placeholder="Describe the projection period (e.g., 3-5 years) and methodology used"
              value={localData.projectionPeriod}
              onChange={(e) => updateField('projectionPeriod', e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="keyAssumptions">
              Key Financial Assumptions
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="keyAssumptions"
              placeholder="List key assumptions underlying financial projections (growth rates, market conditions, etc.)"
              value={localData.keyAssumptions}
              onChange={(e) => updateField('keyAssumptions', e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sensitivityAnalysis">
              Sensitivity Analysis
            </Label>
            <Textarea
              id="sensitivityAnalysis"
              placeholder="Describe sensitivity analysis performed on key variables and assumptions"
              value={localData.sensitivityAnalysis}
              onChange={(e) => updateField('sensitivityAnalysis', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div>
        <h4 className="text-base font-semibold mb-4 flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Required Prospectus Documents
        </h4>
        <FlexibleFileUpload
          title="Required Prospectus Documents"
          documentFields={[
            {
              key: 'fullProspectus',
              label: 'Full Prospectus',
              description: 'Upload complete prospectus document with all required disclosures',
              acceptedTypes: ['pdf'],
              required: true
            },
            {
              key: 'abridgedProspectus',
              label: 'Abridged Prospectus',
              description: 'Upload abridged prospectus for newspaper publication',
              acceptedTypes: ['pdf', 'doc', 'docx'],
              required: true
            },
            {
              key: 'expertConsents',
              label: 'Expert Consents',
              description: 'Upload written consents from all experts (auditors, valuers, legal advisors)',
              acceptedTypes: ['pdf', 'doc', 'docx'],
              required: true
            },
            {
              key: 'riskFactorsSummaryDoc',
              label: 'Risk Factors Summary',
              description: 'Upload detailed risk factors analysis document',
              acceptedTypes: ['pdf', 'doc', 'docx'],
              required: true
            },
            {
              key: 'projectTimeline',
              label: 'Project Timeline',
              description: 'Upload detailed project implementation timeline',
              acceptedTypes: ['pdf', 'xls', 'xlsx', 'doc', 'docx'],
              required: true
            },
            {
              key: 'capitalStructureTable',
              label: 'Capital Structure Table',
              description: 'Upload pre and post-offer capital structure comparison',
              acceptedTypes: ['pdf', 'xls', 'xlsx'],
              required: true
            },
            {
              key: 'feeDisclosure',
              label: 'Fee Disclosure Statement',
              description: 'Upload complete fee disclosure for all intermediaries',
              acceptedTypes: ['pdf', 'doc', 'docx'],
              required: true
            }
          ]}
          onDocumentsChange={updateDocuments}
          initialDocuments={documents}
        />
      </div>
    </div>
  )
}