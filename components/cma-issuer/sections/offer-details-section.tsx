"use client"

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileUpload } from '@/components/cma-issuer/form-components/file-upload'
import { IssuerApplication, OfferType, Document } from '@/lib/cma-issuer-system/types'
import { AlertCircle, CheckCircle, Info, TrendingUp, Calculator } from 'lucide-react'

interface OfferDetailsSectionProps {
  data: Partial<IssuerApplication>
  onDataChange: (data: Partial<IssuerApplication>) => void
  onSectionComplete: (isComplete: boolean) => void
}

interface ValidationErrors {
  offerType?: string
  totalAmountToRaise?: string
  numberOfSecurities?: string
  pricePerSecurity?: string
  useOfProceeds?: string
  offerTimetable?: string
  underwritingAgreement?: string
  advisorMandateLetter?: string
  bankRegistrarAgreements?: string
}

const OFFER_TYPES: OfferType[] = ['EQUITY', 'DEBT', 'HYBRID']

export function OfferDetailsSection({
  data,
  onDataChange,
  onSectionComplete
}: OfferDetailsSectionProps) {
  const [errors, setErrors] = useState<ValidationErrors>({})

  const offerDetails = data.offerDetails || {
    offerType: undefined,
    totalAmountToRaise: undefined,
    numberOfSecurities: undefined,
    pricePerSecurity: undefined,
    useOfProceeds: '',
    offerTimetable: '',
    documents: {
      underwritingAgreement: undefined,
      advisorMandateLetter: undefined,
      bankRegistrarAgreements: undefined
    }
  }

  const updateOfferDetails = (updates: any) => {
    const updatedData = {
      ...data,
      offerDetails: {
        ...offerDetails,
        ...updates
      }
    }
    onDataChange(updatedData)
  }

  // Auto-calculate price per security when amount and number change
  const calculatePricePerSecurity = () => {
    const totalAmount = offerDetails.totalAmountToRaise || 0
    const numberOfSecurities = offerDetails.numberOfSecurities || 0
    
    if (totalAmount > 0 && numberOfSecurities > 0) {
      return Math.round((totalAmount / numberOfSecurities) * 100) / 100
    }
    return 0
  }

  // Auto-update price when amount or number changes
  useEffect(() => {
    const calculatedPrice = calculatePricePerSecurity()
    if (calculatedPrice > 0 && calculatedPrice !== offerDetails.pricePerSecurity) {
      updateOfferDetails({ pricePerSecurity: calculatedPrice })
    }
  }, [offerDetails.totalAmountToRaise, offerDetails.numberOfSecurities])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const validateSection = () => {
    const newErrors: ValidationErrors = {}

    // Offer type validation
    if (!offerDetails.offerType) {
      newErrors.offerType = 'Offer type is required'
    }

    // Total amount validation
    if (!offerDetails.totalAmountToRaise) {
      newErrors.totalAmountToRaise = 'Total amount to raise is required'
    } else if (offerDetails.totalAmountToRaise <= 0) {
      newErrors.totalAmountToRaise = 'Amount must be greater than 0'
    }

    // Number of securities validation
    if (!offerDetails.numberOfSecurities) {
      newErrors.numberOfSecurities = 'Number of securities is required'
    } else if (offerDetails.numberOfSecurities <= 0) {
      newErrors.numberOfSecurities = 'Number of securities must be greater than 0'
    }

    // Price per security validation
    if (!offerDetails.pricePerSecurity) {
      newErrors.pricePerSecurity = 'Price per security is required'
    } else if (offerDetails.pricePerSecurity <= 0) {
      newErrors.pricePerSecurity = 'Price must be greater than 0'
    }

    // Use of proceeds validation
    if (!offerDetails.useOfProceeds?.trim()) {
      newErrors.useOfProceeds = 'Use of proceeds is required'
    } else if (offerDetails.useOfProceeds.trim().length < 100) {
      newErrors.useOfProceeds = 'Please provide detailed use of proceeds (minimum 100 characters)'
    }

    // Offer timetable validation
    if (!offerDetails.offerTimetable?.trim()) {
      newErrors.offerTimetable = 'Offer timetable is required'
    } else if (offerDetails.offerTimetable.trim().length < 50) {
      newErrors.offerTimetable = 'Please provide detailed timetable (minimum 50 characters)'
    }

    // Document validation
    if (!offerDetails.documents?.underwritingAgreement) {
      newErrors.underwritingAgreement = 'Underwriting agreement is required'
    }
    if (!offerDetails.documents?.advisorMandateLetter) {
      newErrors.advisorMandateLetter = 'Advisor mandate letter is required'
    }
    if (!offerDetails.documents?.bankRegistrarAgreements) {
      newErrors.bankRegistrarAgreements = 'Bank/Registrar agreements are required'
    }

    setErrors(newErrors)
    
    const isComplete = Object.keys(newErrors).length === 0
    onSectionComplete(isComplete)
    
    return isComplete
  }

  useEffect(() => {
    validateSection()
  }, [offerDetails])

  const getOfferStatus = () => {
    const hasBasicInfo = offerDetails.offerType && 
                        offerDetails.totalAmountToRaise && 
                        offerDetails.numberOfSecurities && 
                        offerDetails.pricePerSecurity
    
    const hasDocuments = offerDetails.documents?.underwritingAgreement &&
                        offerDetails.documents?.advisorMandateLetter &&
                        offerDetails.documents?.bankRegistrarAgreements
    
    if (hasBasicInfo && hasDocuments && offerDetails.useOfProceeds && offerDetails.offerTimetable) {
      return { type: 'success', message: 'Offer details complete' }
    } else if (hasBasicInfo) {
      return { type: 'warning', message: 'Basic offer details provided, complete remaining fields' }
    }
    return { type: 'info', message: 'Enter offer details to proceed' }
  }

  const offerStatus = getOfferStatus()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Offer Details (IPO Information)</h3>
        <p className="text-sm text-muted-foreground">
          Provide comprehensive details about your public offering including structure, pricing, and timeline.
        </p>
      </div>

      <Alert className={
        offerStatus.type === 'success' ? 'border-green-500 bg-green-50' :
        offerStatus.type === 'warning' ? 'border-orange-500 bg-orange-50' :
        'border-blue-500 bg-blue-50'
      }>
        {offerStatus.type === 'success' ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : offerStatus.type === 'warning' ? (
          <AlertCircle className="h-4 w-4 text-orange-600" />
        ) : (
          <Info className="h-4 w-4 text-blue-600" />
        )}
        <AlertDescription className={
          offerStatus.type === 'success' ? 'text-green-800' :
          offerStatus.type === 'warning' ? 'text-orange-800' :
          'text-blue-800'
        }>
          {offerStatus.message}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Offer Structure & Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="offerType">
                Offer Type
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select
                value={offerDetails.offerType || ''}
                onValueChange={(value) => updateOfferDetails({ offerType: value as OfferType })}
              >
                <SelectTrigger className={errors.offerType ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select offer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EQUITY">Equity (Shares)</SelectItem>
                  <SelectItem value="DEBT">Debt (Bonds)</SelectItem>
                  <SelectItem value="HYBRID">Hybrid Securities</SelectItem>
                </SelectContent>
              </Select>
              {errors.offerType && (
                <p className="text-sm text-red-600">{errors.offerType}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalAmountToRaise">
                Total Amount to Raise (RWF)
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="totalAmountToRaise"
                type="number"
                placeholder="1000000000"
                value={offerDetails.totalAmountToRaise || ''}
                onChange={(e) => updateOfferDetails({ 
                  totalAmountToRaise: e.target.value ? Number(e.target.value) : undefined 
                })}
                className={errors.totalAmountToRaise ? 'border-red-500' : ''}
              />
              {errors.totalAmountToRaise && (
                <p className="text-sm text-red-600">{errors.totalAmountToRaise}</p>
              )}
              {offerDetails.totalAmountToRaise && (
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(offerDetails.totalAmountToRaise)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfSecurities">
                Number of Securities to Issue
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="numberOfSecurities"
                type="number"
                placeholder="1000000"
                value={offerDetails.numberOfSecurities || ''}
                onChange={(e) => updateOfferDetails({ 
                  numberOfSecurities: e.target.value ? Number(e.target.value) : undefined 
                })}
                className={errors.numberOfSecurities ? 'border-red-500' : ''}
              />
              {errors.numberOfSecurities && (
                <p className="text-sm text-red-600">{errors.numberOfSecurities}</p>
              )}
              {offerDetails.numberOfSecurities && (
                <p className="text-sm text-muted-foreground">
                  {offerDetails.numberOfSecurities.toLocaleString()} securities
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricePerSecurity">
                Price per Security (RWF)
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="pricePerSecurity"
                  type="number"
                  step="0.01"
                  value={calculatePricePerSecurity() || offerDetails.pricePerSecurity || ''}
                  onChange={(e) => updateOfferDetails({ 
                    pricePerSecurity: e.target.value ? Number(e.target.value) : undefined 
                  })}
                  className={`${errors.pricePerSecurity ? 'border-red-500' : ''} pr-12`}
                />
                <Calculator className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
              {errors.pricePerSecurity && (
                <p className="text-sm text-red-600">{errors.pricePerSecurity}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Automatically calculated from total amount ÷ number of securities
              </p>
            </div>
          </div>

          {/* Offer Summary */}
          {offerDetails.totalAmountToRaise && offerDetails.numberOfSecurities && (
            <div className="p-4 bg-muted rounded-lg">
              <h5 className="font-medium mb-2">Offer Summary</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Raise:</span>
                  <p className="font-medium">{formatCurrency(offerDetails.totalAmountToRaise)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Securities:</span>
                  <p className="font-medium">{offerDetails.numberOfSecurities.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Price Each:</span>
                  <p className="font-medium">{formatCurrency(calculatePricePerSecurity())}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <p className="font-medium">{offerDetails.offerType || 'Not selected'}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Use of Proceeds & Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="useOfProceeds">
              Use of Proceeds
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="useOfProceeds"
              placeholder="Provide detailed explanation of how the raised funds will be used (e.g., business expansion, debt repayment, working capital, etc.)"
              value={offerDetails.useOfProceeds || ''}
              onChange={(e) => updateOfferDetails({ useOfProceeds: e.target.value })}
              rows={6}
              className={errors.useOfProceeds ? 'border-red-500' : ''}
            />
            {errors.useOfProceeds && (
              <p className="text-sm text-red-600">{errors.useOfProceeds}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {offerDetails.useOfProceeds?.length || 0} characters (minimum 100 required)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="offerTimetable">
              Offer Timetable
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="offerTimetable"
              placeholder="Provide detailed timeline for the offer including key dates (application opening, closing, allotment, listing, etc.)"
              value={offerDetails.offerTimetable || ''}
              onChange={(e) => updateOfferDetails({ offerTimetable: e.target.value })}
              rows={4}
              className={errors.offerTimetable ? 'border-red-500' : ''}
            />
            {errors.offerTimetable && (
              <p className="text-sm text-red-600">{errors.offerTimetable}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {offerDetails.offerTimetable?.length || 0} characters (minimum 50 required)
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div>
        <h4 className="text-base font-semibold mb-4">Required Offer Documents</h4>
        <div className="space-y-6">
          <FileUpload
            label="Underwriting Agreement"
            description="Upload signed underwriting agreement with investment bank or financial advisor"
            acceptedTypes={['pdf', 'doc', 'docx']}
            required={true}
            value={offerDetails.documents?.underwritingAgreement}
            onChange={(file) => updateOfferDetails({
              documents: {
                ...offerDetails.documents,
                underwritingAgreement: file as Document
              }
            })}
            error={errors.underwritingAgreement}
          />

          <FileUpload
            label="Advisor Mandate Letter"
            description="Upload mandate letter from appointed financial advisor or investment bank"
            acceptedTypes={['pdf', 'doc', 'docx']}
            required={true}
            value={offerDetails.documents?.advisorMandateLetter}
            onChange={(file) => updateOfferDetails({
              documents: {
                ...offerDetails.documents,
                advisorMandateLetter: file as Document
              }
            })}
            error={errors.advisorMandateLetter}
          />

          <FileUpload
            label="Bank and Registrar Agreements"
            description="Upload agreements with receiving banks and share registrar for the offer"
            acceptedTypes={['pdf', 'doc', 'docx']}
            required={true}
            value={offerDetails.documents?.bankRegistrarAgreements}
            onChange={(file) => updateOfferDetails({
              documents: {
                ...offerDetails.documents,
                bankRegistrarAgreements: file as Document
              }
            })}
            error={errors.bankRegistrarAgreements}
          />
        </div>
      </div>
    </div>
  )
}