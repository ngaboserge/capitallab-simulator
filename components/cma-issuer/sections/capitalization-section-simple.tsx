"use client"

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FlexibleFileUpload } from '@/components/cma-issuer/form-components/flexible-file-upload'
import { IssuerApplication, Document } from '@/lib/cma-issuer-system/types'
import { AlertCircle, CheckCircle, Info } from 'lucide-react'

interface CapitalizationSectionProps {
  data: Partial<IssuerApplication>
  onDataChange: (data: Partial<IssuerApplication>) => void
  onSectionComplete: (isComplete: boolean) => void
}

const MIN_AUTHORIZED_CAPITAL = 500_000_000 // RWF 500M
const MIN_NET_ASSETS = 1_000_000_000 // RWF 1B

export function CapitalizationSection({
  data,
  onDataChange,
  onSectionComplete
}: CapitalizationSectionProps) {
  const [localData, setLocalData] = useState({
    authorizedShareCapital: data.capitalization?.authorizedShareCapital || '',
    paidUpShareCapital: data.capitalization?.paidUpShareCapital || '',
    netAssetsBeforeOffer: data.capitalization?.netAssetsBeforeOffer || '',
    auditPeriodEnd: data.capitalization?.auditPeriodEnd ? 
      new Date(data.capitalization.auditPeriodEnd).toISOString().split('T')[0] : '',
    goingConcernConfirmation: data.capitalization?.goingConcernConfirmation || false
  })

  const [documents, setDocuments] = useState<Record<string, Document | null>>({
    auditedFinancialStatements: data.capitalization?.documents?.auditedFinancialStatements || null,
    auditorsOpinion: data.capitalization?.documents?.auditorsOpinion || null
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
      capitalization: {
        authorizedShareCapital: Number(formData.authorizedShareCapital) || 0,
        paidUpShareCapital: Number(formData.paidUpShareCapital) || 0,
        netAssetsBeforeOffer: Number(formData.netAssetsBeforeOffer) || 0,
        auditPeriodEnd: formData.auditPeriodEnd ? new Date(formData.auditPeriodEnd) : new Date(),
        goingConcernConfirmation: Boolean(formData.goingConcernConfirmation),
        documents: {
          auditedFinancialStatements: docData.auditedFinancialStatements as Document,
          auditorsOpinion: docData.auditorsOpinion as Document
        }
      }
    }
    
    onDataChange(updatedData)

    // Simple validation
    const hasRequiredFields = 
      Number(formData.authorizedShareCapital) >= MIN_AUTHORIZED_CAPITAL &&
      Number(formData.paidUpShareCapital) > 0 &&
      Number(formData.netAssetsBeforeOffer) >= MIN_NET_ASSETS &&
      formData.auditPeriodEnd &&
      formData.goingConcernConfirmation &&
      docData.auditedFinancialStatements &&
      docData.auditorsOpinion

    onSectionComplete(Boolean(hasRequiredFields))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getCapitalStatus = () => {
    const authorized = Number(localData.authorizedShareCapital) || 0
    const netAssets = Number(localData.netAssetsBeforeOffer) || 0
    
    if (authorized >= MIN_AUTHORIZED_CAPITAL && netAssets >= MIN_NET_ASSETS) {
      return { type: 'success', message: 'Capital requirements met' }
    } else if (authorized > 0 || netAssets > 0) {
      return { type: 'error', message: 'Capital requirements not met' }
    }
    return { type: 'info', message: 'Enter capital amounts to check requirements' }
  }

  const capitalStatus = getCapitalStatus()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Capitalization & Financial Strength</h3>
        <p className="text-sm text-muted-foreground">
          Provide financial information to demonstrate your company's financial eligibility for public offering.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Minimum Requirements:</strong> Authorized capital of {formatCurrency(MIN_AUTHORIZED_CAPITAL)} 
          and net assets of {formatCurrency(MIN_NET_ASSETS)} before the offer.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Share Capital Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="authorizedShareCapital">
                Authorized Share Capital (RWF)
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="authorizedShareCapital"
                type="number"
                placeholder="500000000"
                value={localData.authorizedShareCapital}
                onChange={(e) => updateField('authorizedShareCapital', e.target.value)}
              />
              {localData.authorizedShareCapital && (
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(Number(localData.authorizedShareCapital))}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paidUpShareCapital">
                Paid Up Share Capital (RWF)
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="paidUpShareCapital"
                type="number"
                placeholder="Enter paid up capital"
                value={localData.paidUpShareCapital}
                onChange={(e) => updateField('paidUpShareCapital', e.target.value)}
              />
              {localData.paidUpShareCapital && (
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(Number(localData.paidUpShareCapital))}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="netAssetsBeforeOffer">
                Net Assets Before Offer (RWF)
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="netAssetsBeforeOffer"
                type="number"
                placeholder="1000000000"
                value={localData.netAssetsBeforeOffer}
                onChange={(e) => updateField('netAssetsBeforeOffer', e.target.value)}
              />
              {localData.netAssetsBeforeOffer && (
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(Number(localData.netAssetsBeforeOffer))}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="auditPeriodEnd">
                Audit Period End Date
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="auditPeriodEnd"
                type="date"
                value={localData.auditPeriodEnd}
                onChange={(e) => updateField('auditPeriodEnd', e.target.value)}
              />
            </div>
          </div>

          <Alert className={
            capitalStatus.type === 'success' ? 'border-green-500 bg-green-50' :
            capitalStatus.type === 'error' ? 'border-red-500 bg-red-50' :
            'border-blue-500 bg-blue-50'
          }>
            {capitalStatus.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : capitalStatus.type === 'error' ? (
              <AlertCircle className="h-4 w-4 text-red-600" />
            ) : (
              <Info className="h-4 w-4 text-blue-600" />
            )}
            <AlertDescription className={
              capitalStatus.type === 'success' ? 'text-green-800' :
              capitalStatus.type === 'error' ? 'text-red-800' :
              'text-blue-800'
            }>
              {capitalStatus.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Going Concern Confirmation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-3">
            <Checkbox
              id="goingConcernConfirmation"
              checked={localData.goingConcernConfirmation}
              onCheckedChange={(checked) => updateField('goingConcernConfirmation', checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="goingConcernConfirmation" className="text-sm font-medium">
                Going Concern Confirmation
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                I confirm that the company is a going concern and has the financial capacity 
                to continue operations for at least 12 months from the date of this application.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <FlexibleFileUpload
        title="Required Financial Documents"
        documentFields={[
          {
            key: 'auditedFinancialStatements',
            label: 'Audited Financial Statements',
            description: 'Upload IFRS-compliant audited financial statements for the most recent financial year',
            acceptedTypes: ['pdf', 'doc', 'docx'],
            required: true
          },
          {
            key: 'auditorsOpinion',
            label: "Auditor's Opinion",
            description: "Upload the independent auditor's unqualified opinion on the financial statements",
            acceptedTypes: ['pdf', 'doc', 'docx'],
            required: true
          }
        ]}
        onDocumentsChange={updateDocuments}
        initialDocuments={documents}
      />
    </div>
  )
}