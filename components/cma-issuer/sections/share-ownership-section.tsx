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
import { AlertCircle, CheckCircle, Info, Calculator } from 'lucide-react'

interface ShareOwnershipSectionProps {
  data: Partial<IssuerApplication>
  onDataChange: (data: Partial<IssuerApplication>) => void
  onSectionComplete: (isComplete: boolean) => void
}

interface ValidationErrors {
  totalIssuedShares?: string
  sharesToPublic?: string
  publicShareholdingPercentage?: string
  expectedShareholders?: string
  freeTransferability?: string
  shareRegister?: string
  ownershipStructure?: string
}

const MIN_PUBLIC_FLOAT_PERCENTAGE = 25
const MIN_SHAREHOLDERS = 1000

export function ShareOwnershipSection({
  data,
  onDataChange,
  onSectionComplete
}: ShareOwnershipSectionProps) {
  const [errors, setErrors] = useState<ValidationErrors>({})

  const shareOwnership = data.shareOwnership || {
    totalIssuedShares: undefined,
    sharesToPublic: undefined,
    publicShareholdingPercentage: 0,
    expectedShareholders: undefined,
    freeTransferability: false,
    documents: {
      shareRegister: undefined,
      ownershipStructure: undefined
    }
  }

  const updateShareOwnership = (updates: any) => {
    const updatedData = {
      ...data,
      shareOwnership: {
        ...shareOwnership,
        ...updates
      }
    }
    onDataChange(updatedData)
  }

  // Calculate public shareholding percentage automatically
  const calculatePublicPercentage = () => {
    const totalShares = shareOwnership.totalIssuedShares || 0
    const publicShares = shareOwnership.sharesToPublic || 0
    
    if (totalShares > 0 && publicShares > 0) {
      const percentage = (publicShares / totalShares) * 100
      return Math.round(percentage * 100) / 100 // Round to 2 decimal places
    }
    return 0
  }

  // Calculate percentage on render (no useEffect to avoid infinite loops)
  const currentPercentage = calculatePublicPercentage()

  const validateSection = useCallback(() => {
    const newErrors: ValidationErrors = {}

    // Total issued shares validation
    if (!shareOwnership.totalIssuedShares) {
      newErrors.totalIssuedShares = 'Total issued shares is required'
    } else if (shareOwnership.totalIssuedShares <= 0) {
      newErrors.totalIssuedShares = 'Total issued shares must be greater than 0'
    }

    // Shares to public validation
    if (!shareOwnership.sharesToPublic) {
      newErrors.sharesToPublic = 'Shares to public is required'
    } else if (shareOwnership.sharesToPublic <= 0) {
      newErrors.sharesToPublic = 'Shares to public must be greater than 0'
    } else if (shareOwnership.sharesToPublic > (shareOwnership.totalIssuedShares || 0)) {
      newErrors.sharesToPublic = 'Shares to public cannot exceed total issued shares'
    }

    // Public shareholding percentage validation
    if (currentPercentage < MIN_PUBLIC_FLOAT_PERCENTAGE) {
      newErrors.publicShareholdingPercentage = `Minimum public float is ${MIN_PUBLIC_FLOAT_PERCENTAGE}%`
    }

    // Expected shareholders validation
    if (!shareOwnership.expectedShareholders) {
      newErrors.expectedShareholders = 'Expected number of shareholders is required'
    } else if (shareOwnership.expectedShareholders < MIN_SHAREHOLDERS) {
      newErrors.expectedShareholders = `Minimum ${MIN_SHAREHOLDERS} shareholders required`
    }

    // Free transferability confirmation
    if (!shareOwnership.freeTransferability) {
      newErrors.freeTransferability = 'Free transferability confirmation is required'
    }

    // Document validation
    if (!shareOwnership.documents?.shareRegister) {
      newErrors.shareRegister = 'Share register is required'
    }
    if (!shareOwnership.documents?.ownershipStructure) {
      newErrors.ownershipStructure = 'Ownership structure diagram is required'
    }

    setErrors(newErrors)
    
    const isComplete = Object.keys(newErrors).length === 0
    onSectionComplete(isComplete)
    
    return isComplete
  }, [shareOwnership.totalIssuedShares, shareOwnership.sharesToPublic, shareOwnership.expectedShareholders, shareOwnership.freeTransferability, shareOwnership.documents])

  useEffect(() => {
    validateSection()
  }, [shareOwnership.totalIssuedShares, shareOwnership.sharesToPublic, shareOwnership.expectedShareholders, shareOwnership.freeTransferability, shareOwnership.documents])

  const getComplianceStatus = () => {
    const shareholders = shareOwnership.expectedShareholders || 0
    
    if (currentPercentage >= MIN_PUBLIC_FLOAT_PERCENTAGE && shareholders >= MIN_SHAREHOLDERS) {
      return { type: 'success', message: 'Public float requirements met' }
    } else if (currentPercentage < MIN_PUBLIC_FLOAT_PERCENTAGE || shareholders < MIN_SHAREHOLDERS) {
      return { type: 'error', message: 'Public float requirements not met' }
    }
    return { type: 'info', message: 'Enter share information to check requirements' }
  }

  const complianceStatus = getComplianceStatus()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Share Ownership & Distribution</h3>
        <p className="text-sm text-muted-foreground">
          Specify share ownership and distribution details to verify public float requirements.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Minimum Requirements:</strong> At least {MIN_PUBLIC_FLOAT_PERCENTAGE}% public shareholding 
          and minimum {MIN_SHAREHOLDERS.toLocaleString()} shareholders post-offer.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Calculator className="w-4 h-4 mr-2" />
            Share Distribution Calculation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalIssuedShares">
                Total Issued Shares
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="totalIssuedShares"
                type="number"
                placeholder="Enter total issued shares"
                value={shareOwnership.totalIssuedShares || ''}
                onChange={(e) => updateShareOwnership({ 
                  totalIssuedShares: e.target.value ? Number(e.target.value) : undefined 
                })}
                className={errors.totalIssuedShares ? 'border-red-500' : ''}
              />
              {errors.totalIssuedShares && (
                <p className="text-sm text-red-600">{errors.totalIssuedShares}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sharesToPublic">
                Shares to be Offered to Public
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="sharesToPublic"
                type="number"
                placeholder="Enter shares to public"
                value={shareOwnership.sharesToPublic || ''}
                onChange={(e) => updateShareOwnership({ 
                  sharesToPublic: e.target.value ? Number(e.target.value) : undefined 
                })}
                className={errors.sharesToPublic ? 'border-red-500' : ''}
              />
              {errors.sharesToPublic && (
                <p className="text-sm text-red-600">{errors.sharesToPublic}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="publicShareholdingPercentage">
                Public Shareholding Percentage
              </Label>
              <div className="relative">
                <Input
                  id="publicShareholdingPercentage"
                  type="number"
                  step="0.01"
                  value={currentPercentage}
                  disabled
                  className="bg-muted pr-8"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  %
                </span>
              </div>
              {errors.publicShareholdingPercentage && (
                <p className="text-sm text-red-600">{errors.publicShareholdingPercentage}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Automatically calculated based on shares entered above
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedShareholders">
                Expected Number of Shareholders Post-Offer
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="expectedShareholders"
                type="number"
                placeholder="1000"
                value={shareOwnership.expectedShareholders || ''}
                onChange={(e) => updateShareOwnership({ 
                  expectedShareholders: e.target.value ? Number(e.target.value) : undefined 
                })}
                className={errors.expectedShareholders ? 'border-red-500' : ''}
              />
              {errors.expectedShareholders && (
                <p className="text-sm text-red-600">{errors.expectedShareholders}</p>
              )}
            </div>
          </div>

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

          {shareOwnership.totalIssuedShares && shareOwnership.sharesToPublic && (
            <div className="p-4 bg-muted rounded-lg">
              <h5 className="font-medium mb-2">Share Distribution Summary</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Shares:</span>
                  <span className="ml-2 font-medium">
                    {shareOwnership.totalIssuedShares.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Public Shares:</span>
                  <span className="ml-2 font-medium">
                    {shareOwnership.sharesToPublic.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Private Shares:</span>
                  <span className="ml-2 font-medium">
                    {(shareOwnership.totalIssuedShares - shareOwnership.sharesToPublic).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Public Float:</span>
                  <span className="ml-2 font-medium">
                    {currentPercentage}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Share Transferability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-3">
            <Checkbox
              id="freeTransferability"
              checked={Boolean(shareOwnership.freeTransferability)}
              onCheckedChange={(checked) => updateShareOwnership({ 
                freeTransferability: Boolean(checked)
              })}
              className={errors.freeTransferability ? 'border-red-500' : ''}
            />
            <div className="space-y-1">
              <Label htmlFor="freeTransferability" className="text-sm font-medium">
                Free Transferability Confirmation
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                I confirm that the shares to be offered to the public will be freely transferable 
                without any restrictions on transfer, except as may be imposed by law.
              </p>
              {errors.freeTransferability && (
                <p className="text-sm text-red-600">{errors.freeTransferability}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="border-t my-6" />

      <div>
        <h4 className="text-base font-semibold mb-4">Required Ownership Documents</h4>
        <div className="space-y-6">
          <FileUpload
            label="Share Register"
            description="Upload the current share register showing all shareholders and their holdings"
            acceptedTypes={['pdf', 'xls', 'xlsx', 'doc', 'docx']}
            required={true}
            value={shareOwnership.documents?.shareRegister}
            onChange={(file) => updateShareOwnership({
              documents: {
                ...shareOwnership.documents,
                shareRegister: file as Document
              }
            })}
            error={errors.shareRegister}
          />

          <FileUpload
            label="Ownership Structure Diagram"
            description="Upload a diagram showing the ownership structure before and after the public offering"
            acceptedTypes={['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']}
            required={true}
            value={shareOwnership.documents?.ownershipStructure}
            onChange={(file) => updateShareOwnership({
              documents: {
                ...shareOwnership.documents,
                ownershipStructure: file as Document
              }
            })}
            error={errors.ownershipStructure}
          />
        </div>
      </div>
    </div>
  )
}