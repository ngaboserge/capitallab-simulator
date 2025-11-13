"use client"

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { FlexibleFileUpload } from '@/components/cma-issuer/form-components/flexible-file-upload'
import { IssuerApplication, Document } from '@/lib/cma-issuer-system/types'
import { AlertCircle, CheckCircle, Info, Calculator, PieChart, Users } from 'lucide-react'

interface ShareOwnershipSectionProps {
  data: Partial<IssuerApplication>
  onDataChange: (data: Partial<IssuerApplication>) => void
  onSectionComplete: (isComplete: boolean) => void
}

const MIN_PUBLIC_FLOAT_PERCENTAGE = 25
const MIN_SHAREHOLDERS = 1000

export function ShareOwnershipSection({
  data,
  onDataChange,
  onSectionComplete
}: ShareOwnershipSectionProps) {
  const [localData, setLocalData] = useState({
    // Share Structure
    totalIssuedShares: data.shareOwnership?.totalIssuedShares?.toString() || '',
    sharesToPublic: data.shareOwnership?.sharesToPublic?.toString() || '',
    shareClass: 'Ordinary Shares',
    parValue: '100',
    
    // Pre-Offer Ownership
    foundersShares: '',
    institutionalShares: '',
    employeeShares: '',
    otherShares: '',
    
    // Post-Offer Projections
    expectedShareholders: data.shareOwnership?.expectedShareholders?.toString() || '',
    minimumSubscription: '',
    maximumSubscription: '',
    
    // Confirmations
    freeTransferability: data.shareOwnership?.freeTransferability || false,
    noRestrictions: false,
    liquidityConfirmation: false
  })

  const [documents, setDocuments] = useState<Record<string, Document | null>>({
    shareRegister: data.shareOwnership?.documents?.shareRegister || null,
    ownershipStructure: data.shareOwnership?.documents?.ownershipStructure || null
  })

  // Calculate public shareholding percentage
  const calculatePublicPercentage = () => {
    const totalShares = Number(localData.totalIssuedShares) || 0
    const publicShares = Number(localData.sharesToPublic) || 0
    
    if (totalShares > 0 && publicShares > 0) {
      const percentage = (publicShares / totalShares) * 100
      return Math.round(percentage * 100) / 100 // Round to 2 decimal places
    }
    return 0
  }

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
    // Calculate current percentage
    const totalShares = Number(formData.totalIssuedShares) || 0
    const publicShares = Number(formData.sharesToPublic) || 0
    const currentPercentage = totalShares > 0 && publicShares > 0 
      ? Math.round((publicShares / totalShares) * 10000) / 100 
      : 0

    // Update parent data
    const updatedData = {
      ...data,
      shareOwnership: {
        totalIssuedShares: Number(formData.totalIssuedShares) || 0,
        sharesToPublic: Number(formData.sharesToPublic) || 0,
        publicShareholdingPercentage: currentPercentage,
        expectedShareholders: Number(formData.expectedShareholders) || 0,
        freeTransferability: Boolean(formData.freeTransferability),
        documents: {
          shareRegister: docData.shareRegister as Document,
          ownershipStructure: docData.ownershipStructure as Document
        }
      }
    }
    
    onDataChange(updatedData)

    // Simple validation
    const hasRequiredFields = 
      Number(formData.totalIssuedShares) > 0 &&
      Number(formData.sharesToPublic) > 0 &&
      currentPercentage >= MIN_PUBLIC_FLOAT_PERCENTAGE &&
      Number(formData.expectedShareholders) >= MIN_SHAREHOLDERS &&
      formData.foundersShares &&
      formData.minimumSubscription &&
      formData.freeTransferability &&
      formData.noRestrictions &&
      formData.liquidityConfirmation &&
      docData.shareRegister &&
      docData.ownershipStructure

    onSectionComplete(Boolean(hasRequiredFields))
  }

  const currentPercentage = calculatePublicPercentage()

  const getComplianceStatus = () => {
    const shareholders = Number(localData.expectedShareholders) || 0
    
    if (currentPercentage >= MIN_PUBLIC_FLOAT_PERCENTAGE && shareholders >= MIN_SHAREHOLDERS) {
      return { type: 'success', message: 'Public float requirements met' }
    } else if (currentPercentage > 0 || shareholders > 0) {
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
                value={localData.totalIssuedShares}
                onChange={(e) => updateField('totalIssuedShares', e.target.value)}
              />
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
                value={localData.sharesToPublic}
                onChange={(e) => updateField('sharesToPublic', e.target.value)}
              />
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
              <p className="text-xs text-muted-foreground">
                Automatically calculated based on shares entered above
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shareClass">
                Share Class
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select
                value={localData.shareClass}
                onValueChange={(value) => updateField('shareClass', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select share class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ordinary Shares">Ordinary Shares</SelectItem>
                  <SelectItem value="Preference Shares">Preference Shares</SelectItem>
                  <SelectItem value="Convertible Shares">Convertible Shares</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parValue">
                Par Value per Share (RWF)
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="parValue"
                type="number"
                placeholder="100"
                value={localData.parValue}
                onChange={(e) => updateField('parValue', e.target.value)}
              />
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
                value={localData.expectedShareholders}
                onChange={(e) => updateField('expectedShareholders', e.target.value)}
              />
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

          {localData.totalIssuedShares && localData.sharesToPublic && (
            <div className="p-4 bg-muted rounded-lg">
              <h5 className="font-medium mb-2">Share Distribution Summary</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Shares:</span>
                  <span className="ml-2 font-medium">
                    {Number(localData.totalIssuedShares).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Public Shares:</span>
                  <span className="ml-2 font-medium">
                    {Number(localData.sharesToPublic).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Private Shares:</span>
                  <span className="ml-2 font-medium">
                    {(Number(localData.totalIssuedShares) - Number(localData.sharesToPublic)).toLocaleString()}
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
          <CardTitle className="text-base flex items-center">
            <PieChart className="w-4 h-4 mr-2" />
            Pre-Offer Ownership Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="foundersShares">
                Founders/Promoters Shares
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="foundersShares"
                type="number"
                placeholder="Enter number of shares"
                value={localData.foundersShares}
                onChange={(e) => updateField('foundersShares', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="institutionalShares">
                Institutional Investors Shares
              </Label>
              <Input
                id="institutionalShares"
                type="number"
                placeholder="Enter number of shares"
                value={localData.institutionalShares}
                onChange={(e) => updateField('institutionalShares', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeShares">
                Employee/ESOP Shares
              </Label>
              <Input
                id="employeeShares"
                type="number"
                placeholder="Enter number of shares"
                value={localData.employeeShares}
                onChange={(e) => updateField('employeeShares', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="otherShares">
                Other Shareholders
              </Label>
              <Input
                id="otherShares"
                type="number"
                placeholder="Enter number of shares"
                value={localData.otherShares}
                onChange={(e) => updateField('otherShares', e.target.value)}
              />
            </div>
          </div>

          {(localData.foundersShares || localData.institutionalShares) && (
            <div className="p-4 bg-muted rounded-lg">
              <h5 className="font-medium mb-2">Pre-Offer Ownership Breakdown</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {localData.foundersShares && (
                  <div>
                    <span className="text-muted-foreground">Founders:</span>
                    <span className="ml-2 font-medium">
                      {Number(localData.foundersShares).toLocaleString()} shares
                    </span>
                  </div>
                )}
                {localData.institutionalShares && (
                  <div>
                    <span className="text-muted-foreground">Institutional:</span>
                    <span className="ml-2 font-medium">
                      {Number(localData.institutionalShares).toLocaleString()} shares
                    </span>
                  </div>
                )}
                {localData.employeeShares && (
                  <div>
                    <span className="text-muted-foreground">Employees:</span>
                    <span className="ml-2 font-medium">
                      {Number(localData.employeeShares).toLocaleString()} shares
                    </span>
                  </div>
                )}
                {localData.otherShares && (
                  <div>
                    <span className="text-muted-foreground">Others:</span>
                    <span className="ml-2 font-medium">
                      {Number(localData.otherShares).toLocaleString()} shares
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Offer Subscription Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minimumSubscription">
                Minimum Subscription (% of offer)
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="minimumSubscription"
                type="number"
                placeholder="90"
                value={localData.minimumSubscription}
                onChange={(e) => updateField('minimumSubscription', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Minimum percentage of shares that must be subscribed for the offer to proceed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maximumSubscription">
                Maximum Subscription (% of offer)
              </Label>
              <Input
                id="maximumSubscription"
                type="number"
                placeholder="100"
                value={localData.maximumSubscription}
                onChange={(e) => updateField('maximumSubscription', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Maximum percentage allowed (for oversubscription scenarios)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Share Transferability & Liquidity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="freeTransferability"
              checked={localData.freeTransferability}
              onCheckedChange={(checked) => updateField('freeTransferability', checked)}
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
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="noRestrictions"
              checked={localData.noRestrictions}
              onCheckedChange={(checked) => updateField('noRestrictions', checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="noRestrictions" className="text-sm font-medium">
                No Transfer Restrictions
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                I confirm that there are no lock-up periods, transfer restrictions, or pre-emption 
                rights that would limit the liquidity of the offered shares.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="liquidityConfirmation"
              checked={localData.liquidityConfirmation}
              onCheckedChange={(checked) => updateField('liquidityConfirmation', checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="liquidityConfirmation" className="text-sm font-medium">
                Market Liquidity Commitment
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                I confirm that the company will ensure adequate market liquidity through market makers 
                or other mechanisms to facilitate trading of the offered shares.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div>
        <h4 className="text-base font-semibold mb-4">Required Ownership Documents</h4>
        <FlexibleFileUpload
          title="Required Ownership Documents"
          documentFields={[
            {
              key: 'shareRegister',
              label: 'Share Register',
              description: 'Upload the current share register showing all shareholders and their holdings',
              acceptedTypes: ['pdf', 'xls', 'xlsx', 'doc', 'docx'],
              required: true
            },
            {
              key: 'ownershipStructure',
              label: 'Ownership Structure Diagram',
              description: 'Upload diagrams showing the ownership structure before and after the public offering',
              acceptedTypes: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
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