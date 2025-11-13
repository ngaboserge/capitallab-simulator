"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
// import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileUpload } from '@/components/cma-issuer/form-components/file-upload'
import { IssuerApplication, Document } from '@/lib/cma-issuer-system/types'
import { AlertCircle, CheckCircle, Info } from 'lucide-react'

interface CapitalizationSectionProps {
  data: Partial<IssuerApplication>
  onDataChange: (data: Partial<IssuerApplication>) => void
  onSectionComplete: (isComplete: boolean) => void
}

interface ValidationErrors {
  authorizedShareCapital?: string
  paidUpShareCapital?: string
  netAssetsBeforeOffer?: string
  auditPeriodEnd?: string
  goingConcernConfirmation?: string
  auditedFinancialStatements?: string
  auditorsOpinion?: string
}

const MIN_AUTHORIZED_CAPITAL = 500_000_000 // RWF 500M
const MIN_NET_ASSETS = 1_000_000_000 // RWF 1B

export function CapitalizationSection({
  data,
  onDataChange,
  onSectionComplete
}: CapitalizationSectionProps) {
  const [errors, setErrors] = useState<ValidationErrors>({})

  const capitalization = data.capitalization || {
    authorizedShareCapital: undefined,
    paidUpShareCapital: undefined,
    netAssetsBeforeOffer: undefined,
    auditPeriodEnd: undefined,
    goingConcernConfirmation: false,
    documents: {
      auditedFinancialStatements: undefined,
      auditorsOpinion: undefined
    }
  }

  const updateCapitalization = (updates: any) => {
    onDataChange({
      ...data,
      capitalization: {
        ...capitalization,
        ...updates
      }
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const validateAuditPeriod = (auditPeriodEnd: Date) => {
    const now = new Date()
    const monthsDiff = (now.getTime() - auditPeriodEnd.getTime()) / (1000 * 60 * 60 * 24 * 30)
    
    // For unlisted companies: max 4 months
    // For listed companies: max 6 months
    // Assuming unlisted for now
    return monthsDiff <= 4
  }

  const validateSection = useCallback(() => {
    const newErrors: ValidationErrors = {}

    // Authorized share capital validation
    if (!capitalization.authorizedShareCapital) {
      newErrors.authorizedShareCapital = 'Authorized share capital is required'
    } else if (capitalization.authorizedShareCapital < MIN_AUTHORIZED_CAPITAL) {
      newErrors.authorizedShareCapital = `Minimum authorized capital is ${formatCurrency(MIN_AUTHORIZED_CAPITAL)}`
    }

    // Paid up share capital validation
    if (!capitalization.paidUpShareCapital) {
      newErrors.paidUpShareCapital = 'Paid up share capital is required'
    } else if (capitalization.paidUpShareCapital > (capitalization.authorizedShareCapital || 0)) {
      newErrors.paidUpShareCapital = 'Paid up capital cannot exceed authorized capital'
    }

    // Net assets validation
    if (!capitalization.netAssetsBeforeOffer) {
      newErrors.netAssetsBeforeOffer = 'Net assets before offer is required'
    } else if (capitalization.netAssetsBeforeOffer < MIN_NET_ASSETS) {
      newErrors.netAssetsBeforeOffer = `Minimum net assets required is ${formatCurrency(MIN_NET_ASSETS)}`
    }

    // Audit period validation
    if (!capitalization.auditPeriodEnd) {
      newErrors.auditPeriodEnd = 'Audit period end date is required'
    } else if (!validateAuditPeriod(capitalization.auditPeriodEnd)) {
      newErrors.auditPeriodEnd = 'Audit period must be within 4 months for unlisted companies'
    }

    // Going concern confirmation
    if (!capitalization.goingConcernConfirmation) {
      newErrors.goingConcernConfirmation = 'Going concern confirmation is required'
    }

    // Document validation
    if (!capitalization.documents?.auditedFinancialStatements) {
      newErrors.auditedFinancialStatements = 'Audited financial statements are required'
    }
    if (!capitalization.documents?.auditorsOpinion) {
      newErrors.auditorsOpinion = 'Auditor\'s opinion is required'
    }

    setErrors(newErrors)
    
    const isComplete = Object.keys(newErrors).length === 0
    onSectionComplete(isComplete)
    
    return isComplete
  }, [capitalization.authorizedShareCapital, capitalization.paidUpShareCapital, capitalization.netAssetsBeforeOffer, capitalization.auditPeriodEnd, capitalization.goingConcernConfirmation, capitalization.documents])

  useEffect(() => {
    validateSection()
  }, [capitalization.authorizedShareCapital, capitalization.paidUpShareCapital, capitalization.netAssetsBeforeOffer, capitalization.auditPeriodEnd, capitalization.goingConcernConfirmation, capitalization.documents])

  const getCapitalStatus = () => {
    const authorized = capitalization.authorizedShareCapital || 0
    const netAssets = capitalization.netAssetsBeforeOffer || 0
    
    if (authorized >= MIN_AUTHORIZED_CAPITAL && netAssets >= MIN_NET_ASSETS) {
      return { type: 'success', message: 'Capital requirements met' }
    } else if (authorized < MIN_AUTHORIZED_CAPITAL || netAssets < MIN_NET_ASSETS) {
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
                value={capitalization.authorizedShareCapital || ''}
                onChange={(e) => updateCapitalization({ 
                  authorizedShareCapital: e.target.value ? Number(e.target.value) : undefined 
                })}
                className={errors.authorizedShareCapital ? 'border-red-500' : ''}
              />
              {errors.authorizedShareCapital && (
                <p className="text-sm text-red-600">{errors.authorizedShareCapital}</p>
              )}
              {capitalization.authorizedShareCapital && (
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(capitalization.authorizedShareCapital)}
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
                value={capitalization.paidUpShareCapital || ''}
                onChange={(e) => updateCapitalization({ 
                  paidUpShareCapital: e.target.value ? Number(e.target.value) : undefined 
                })}
                className={errors.paidUpShareCapital ? 'border-red-500' : ''}
              />
              {errors.paidUpShareCapital && (
                <p className="text-sm text-red-600">{errors.paidUpShareCapital}</p>
              )}
              {capitalization.paidUpShareCapital && (
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(capitalization.paidUpShareCapital)}
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
                value={capitalization.netAssetsBeforeOffer || ''}
                onChange={(e) => updateCapitalization({ 
                  netAssetsBeforeOffer: e.target.value ? Number(e.target.value) : undefined 
                })}
                className={errors.netAssetsBeforeOffer ? 'border-red-500' : ''}
              />
              {errors.netAssetsBeforeOffer && (
                <p className="text-sm text-red-600">{errors.netAssetsBeforeOffer}</p>
              )}
              {capitalization.netAssetsBeforeOffer && (
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(capitalization.netAssetsBeforeOffer)}
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
                value={capitalization.auditPeriodEnd ? 
                  new Date(capitalization.auditPeriodEnd).toISOString().split('T')[0] : ''}
                onChange={(e) => updateCapitalization({ 
                  auditPeriodEnd: e.target.value ? new Date(e.target.value) : undefined 
                })}
                className={errors.auditPeriodEnd ? 'border-red-500' : ''}
              />
              {errors.auditPeriodEnd && (
                <p className="text-sm text-red-600">{errors.auditPeriodEnd}</p>
              )}
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
              checked={Boolean(capitalization.goingConcernConfirmation)}
              onCheckedChange={(checked) => updateCapitalization({ 
                goingConcernConfirmation: Boolean(checked)
              })}
              className={errors.goingConcernConfirmation ? 'border-red-500' : ''}
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
              {errors.goingConcernConfirmation && (
                <p className="text-sm text-red-600">{errors.goingConcernConfirmation}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="border-t my-6" />

      <div>
        <h4 className="text-base font-semibold mb-4">Required Financial Documents</h4>
        <div className="space-y-6">
          <FileUpload
            label="Audited Financial Statements"
            description="Upload IFRS-compliant audited financial statements for the most recent financial year"
            acceptedTypes={['pdf', 'doc', 'docx']}
            required={true}
            value={capitalization.documents?.auditedFinancialStatements}
            onChange={(file) => updateCapitalization({
              documents: {
                ...capitalization.documents,
                auditedFinancialStatements: file as Document
              }
            })}
            error={errors.auditedFinancialStatements}
          />

          <FileUpload
            label="Auditor's Opinion"
            description="Upload the independent auditor's unqualified opinion on the financial statements"
            acceptedTypes={['pdf', 'doc', 'docx']}
            required={true}
            value={capitalization.documents?.auditorsOpinion}
            onChange={(file) => updateCapitalization({
              documents: {
                ...capitalization.documents,
                auditorsOpinion: file as Document
              }
            })}
            error={errors.auditorsOpinion}
          />
        </div>
      </div>
    </div>
  )
}