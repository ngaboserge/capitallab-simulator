"use client"

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { FileUpload } from '@/components/cma-issuer/form-components/file-upload'
import { IssuerApplication, Document } from '@/lib/cma-issuer-system/types'
import { AlertCircle, CheckCircle, Info, TrendingUp, Calendar, DollarSign } from 'lucide-react'

interface OfferDetailsSectionProps {
  data: Partial<IssuerApplication>
  onDataChange: (data: Partial<IssuerApplication>) => void
  onSectionComplete: (isComplete: boolean) => void
}

export function OfferDetailsSection({
  data,
  onDataChange,
  onSectionComplete
}: OfferDetailsSectionProps) {
  const [localData, setLocalData] = useState({
    // Offer Structure
    offerType: data.offerDetails?.offerType || '',
    totalAmountToRaise: data.offerDetails?.totalAmountToRaise?.toString() || '',
    numberOfSecurities: data.offerDetails?.numberOfSecurities?.toString() || '',
    pricePerSecurity: data.offerDetails?.pricePerSecurity?.toString() || '',
    
    // Use of Proceeds
    useOfProceeds: data.offerDetails?.useOfProceeds || '',
    proceedsBreakdown: '',
    
    // Offer Timeline
    offerTimetable: data.offerDetails?.offerTimetable || '',
    openingDate: '',
    closingDate: '',
    allotmentDate: '',
    listingDate: '',
    
    // Pricing and Valuation
    valuationMethod: '',
    priceRange: '',
    bookBuildingProcess: '',
    
    // Documents
    underwritingAgreement: data.offerDetails?.documents?.underwritingAgreement || null,
    advisorMandateLetter: data.offerDetails?.documents?.advisorMandateLetter || null,
    bankRegistrarAgreements: data.offerDetails?.documents?.bankRegistrarAgreements || null
  })

  const updateField = (field: string, value: any) => {
    const newLocalData = { ...localData, [field]: value }
    setLocalData(newLocalData)

    // Calculate price per security if total amount and number of securities are provided
    let calculatedPrice = newLocalData.pricePerSecurity
    if (field === 'totalAmountToRaise' || field === 'numberOfSecurities') {
      const totalAmount = Number(newLocalData.totalAmountToRaise) || 0
      const numberOfSecurities = Number(newLocalData.numberOfSecurities) || 0
      if (totalAmount > 0 && numberOfSecurities > 0) {
        calculatedPrice = (totalAmount / numberOfSecurities).toString()
        newLocalData.pricePerSecurity = calculatedPrice
        setLocalData(newLocalData)
      }
    }

    // Update parent data
    const updatedData = {
      ...data,
      offerDetails: {
        offerType: newLocalData.offerType as 'EQUITY' | 'DEBT' | 'HYBRID',
        totalAmountToRaise: Number(newLocalData.totalAmountToRaise) || 0,
        numberOfSecurities: Number(newLocalData.numberOfSecurities) || 0,
        pricePerSecurity: Number(calculatedPrice) || 0,
        useOfProceeds: newLocalData.useOfProceeds,
        offerTimetable: newLocalData.offerTimetable,
        documents: {
          underwritingAgreement: (newLocalData.underwritingAgreement || undefined) as Document,
          advisorMandateLetter: (newLocalData.advisorMandateLetter || undefined) as Document,
          bankRegistrarAgreements: (newLocalData.bankRegistrarAgreements || undefined) as Document
        }
      }
    }
    
    onDataChange(updatedData)

    // Simple validation
    const hasRequiredFields = 
      newLocalData.offerType &&
      Number(newLocalData.totalAmountToRaise) > 0 &&
      Number(newLocalData.numberOfSecurities) > 0 &&
      newLocalData.useOfProceeds &&
      newLocalData.proceedsBreakdown &&
      newLocalData.offerTimetable &&
      newLocalData.openingDate &&
      newLocalData.closingDate &&
      newLocalData.valuationMethod &&
      newLocalData.underwritingAgreement &&
      newLocalData.advisorMandateLetter &&
      newLocalData.bankRegistrarAgreements

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

  const getOfferStatus = () => {
    const totalAmount = Number(localData.totalAmountToRaise) || 0
    const numberOfSecurities = Number(localData.numberOfSecurities) || 0
    const pricePerSecurity = Number(localData.pricePerSecurity) || 0
    
    if (totalAmount > 0 && numberOfSecurities > 0 && pricePerSecurity > 0) {
      return { type: 'success', message: 'Offer structure is complete' }
    } else if (totalAmount > 0 || numberOfSecurities > 0) {
      return { type: 'error', message: 'Offer structure is incomplete' }
    }
    return { type: 'info', message: 'Enter offer details to calculate structure' }
  }

  const offerStatus = getOfferStatus()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Offer Details (IPO Information)</h3>
        <p className="text-sm text-muted-foreground">
          Provide comprehensive details about your Initial Public Offering structure and timeline.
        </p>
      </div>

      <Alert className={
        offerStatus.type === 'success' ? 'border-green-500 bg-green-50' :
        offerStatus.type === 'error' ? 'border-red-500 bg-red-50' :
        'border-blue-500 bg-blue-50'
      }>
        {offerStatus.type === 'success' ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : offerStatus.type === 'error' ? (
          <AlertCircle className="h-4 w-4 text-red-600" />
        ) : (
          <Info className="h-4 w-4 text-blue-600" />
        )}
        <AlertDescription className={
          offerStatus.type === 'success' ? 'text-green-800' :
          offerStatus.type === 'error' ? 'text-red-800' :
          'text-blue-800'
        }>
          {offerStatus.message}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Offer Structure
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
                value={localData.offerType}
                onValueChange={(value) => updateField('offerType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select offer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EQUITY">Equity Offering</SelectItem>
                  <SelectItem value="DEBT">Debt Securities</SelectItem>
                  <SelectItem value="HYBRID">Hybrid Securities</SelectItem>
                </SelectContent>
              </Select>
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
                value={localData.totalAmountToRaise}
                onChange={(e) => updateField('totalAmountToRaise', e.target.value)}
              />
              {localData.totalAmountToRaise && (
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(Number(localData.totalAmountToRaise))}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfSecurities">
                Number of Securities
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="numberOfSecurities"
                type="number"
                placeholder="10000000"
                value={localData.numberOfSecurities}
                onChange={(e) => updateField('numberOfSecurities', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricePerSecurity">
                Price per Security (RWF)
              </Label>
              <Input
                id="pricePerSecurity"
                type="number"
                placeholder="Calculated automatically"
                value={localData.pricePerSecurity}
                onChange={(e) => updateField('pricePerSecurity', e.target.value)}
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Automatically calculated or enter manually
              </p>
            </div>
          </div>

          {localData.totalAmountToRaise && localData.numberOfSecurities && (
            <div className="p-4 bg-muted rounded-lg">
              <h5 className="font-medium mb-2">Offer Summary</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Raise:</span>
                  <span className="ml-2 font-medium">
                    {formatCurrency(Number(localData.totalAmountToRaise))}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Securities:</span>
                  <span className="ml-2 font-medium">
                    {Number(localData.numberOfSecurities).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Price per Security:</span>
                  <span className="ml-2 font-medium">
                    {formatCurrency(Number(localData.pricePerSecurity))}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Market Cap:</span>
                  <span className="ml-2 font-medium">
                    {formatCurrency(Number(localData.totalAmountToRaise) * 4)} {/* Assuming 25% float */}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Use of Proceeds
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="useOfProceeds">
              Primary Use of Proceeds
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="useOfProceeds"
              placeholder="Describe how the raised funds will be used (e.g., business expansion, debt repayment, working capital)"
              value={localData.useOfProceeds}
              onChange={(e) => updateField('useOfProceeds', e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proceedsBreakdown">
              Detailed Proceeds Breakdown
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="proceedsBreakdown"
              placeholder="Provide percentage breakdown (e.g., 40% expansion, 30% debt repayment, 20% working capital, 10% general corporate purposes)"
              value={localData.proceedsBreakdown}
              onChange={(e) => updateField('proceedsBreakdown', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Offer Timeline & Pricing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="openingDate">
                Offer Opening Date
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="openingDate"
                type="date"
                value={localData.openingDate}
                onChange={(e) => updateField('openingDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="closingDate">
                Offer Closing Date
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="closingDate"
                type="date"
                value={localData.closingDate}
                onChange={(e) => updateField('closingDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="allotmentDate">
                Allotment Date
              </Label>
              <Input
                id="allotmentDate"
                type="date"
                value={localData.allotmentDate}
                onChange={(e) => updateField('allotmentDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="listingDate">
                Expected Listing Date
              </Label>
              <Input
                id="listingDate"
                type="date"
                value={localData.listingDate}
                onChange={(e) => updateField('listingDate', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="offerTimetable">
              Detailed Offer Timetable
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="offerTimetable"
              placeholder="Provide detailed timeline including key milestones, roadshow dates, book building period, etc."
              value={localData.offerTimetable}
              onChange={(e) => updateField('offerTimetable', e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valuationMethod">
              Valuation Methodology
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              value={localData.valuationMethod}
              onValueChange={(value) => updateField('valuationMethod', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select valuation method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DCF">Discounted Cash Flow (DCF)</SelectItem>
                <SelectItem value="COMPARABLE">Comparable Company Analysis</SelectItem>
                <SelectItem value="BOOK_BUILDING">Book Building Process</SelectItem>
                <SelectItem value="FIXED_PRICE">Fixed Price Method</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div>
        <h4 className="text-base font-semibold mb-4">Required Offer Documents</h4>
        <div className="space-y-6">
          <FileUpload
            label="Underwriting Agreement"
            description="Upload signed underwriting agreement with investment bank"
            acceptedTypes={['pdf', 'doc', 'docx']}
            required={true}
            value={localData.underwritingAgreement || undefined}
            onChange={(file) => updateField('underwritingAgreement', file)}
          />

          <FileUpload
            label="Advisor Mandate Letter"
            description="Upload mandate letter from financial advisor/investment bank"
            acceptedTypes={['pdf', 'doc', 'docx']}
            required={true}
            value={localData.advisorMandateLetter || undefined}
            onChange={(file) => updateField('advisorMandateLetter', file)}
          />

          <FileUpload
            label="Bank & Registrar Agreements"
            description="Upload agreements with receiving banks and share registrar"
            acceptedTypes={['pdf', 'doc', 'docx']}
            required={true}
            value={localData.bankRegistrarAgreements || undefined}
            onChange={(file) => updateField('bankRegistrarAgreements', file)}
          />
        </div>
      </div>
    </div>
  )
}