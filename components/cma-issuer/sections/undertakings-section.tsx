"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileUpload } from '@/components/cma-issuer/form-components/file-upload'
import { IssuerApplication, Document } from '@/lib/cma-issuer-system/types'
import { AlertCircle, CheckCircle, Info, FileCheck, Award, Shield } from 'lucide-react'

interface UndertakingsSectionProps {
  data: Partial<IssuerApplication>
  onDataChange: (data: Partial<IssuerApplication>) => void
  onSectionComplete: (isComplete: boolean) => void
}

interface ValidationErrors {
  lockUpUndertaking?: string
  publicationConfirmation?: string
}

export function UndertakingsSection({
  data,
  onDataChange,
  onSectionComplete
}: UndertakingsSectionProps) {
  const [errors, setErrors] = useState<ValidationErrors>({})

  const postApproval = data.postApproval || {
    documents: {
      lockUpUndertaking: undefined,
      publicationConfirmation: undefined,
      cmaApprovalLetter: undefined
    }
  }

  const updatePostApproval = (updates: any) => {
    const updatedData = {
      ...data,
      postApproval: {
        ...postApproval,
        ...updates
      }
    }
    onDataChange(updatedData)
  }

  const validateSection = () => {
    const newErrors: ValidationErrors = {}

    // Document validation
    if (!postApproval.documents?.lockUpUndertaking) {
      newErrors.lockUpUndertaking = 'Lock-up undertaking is required'
    }
    
    if (!postApproval.documents?.publicationConfirmation) {
      newErrors.publicationConfirmation = 'Publication confirmation is required'
    }

    setErrors(newErrors)
    
    const isComplete = Object.keys(newErrors).length === 0
    onSectionComplete(isComplete)
    
    return isComplete
  }

  useEffect(() => {
    validateSection()
  }, [postApproval])

  const getUndertakingsStatus = () => {
    const hasRequiredDocs = postApproval.documents?.lockUpUndertaking &&
                           postApproval.documents?.publicationConfirmation
    
    const hasApprovalLetter = postApproval.documents?.cmaApprovalLetter
    
    if (hasRequiredDocs && hasApprovalLetter) {
      return { type: 'success', message: 'All post-approval undertakings complete' }
    } else if (hasRequiredDocs) {
      return { type: 'success', message: 'Required undertakings provided (CMA approval letter pending)' }
    }
    return { type: 'info', message: 'Complete post-approval undertakings' }
  }

  const undertakingsStatus = getUndertakingsStatus()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Post-Approval Undertakings</h3>
        <p className="text-sm text-muted-foreground">
          Provide undertakings and confirmations required after CMA approval for ongoing compliance.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Post-Approval Requirements:</strong> Lock-up undertakings from promoters/major shareholders 
          and confirmation of compliance with publication requirements.
        </AlertDescription>
      </Alert>

      <Alert className={
        undertakingsStatus.type === 'success' ? 'border-green-500 bg-green-50' :
        'border-blue-500 bg-blue-50'
      }>
        {undertakingsStatus.type === 'success' ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <Info className="h-4 w-4 text-blue-600" />
        )}
        <AlertDescription className={
          undertakingsStatus.type === 'success' ? 'text-green-800' : 'text-blue-800'
        }>
          {undertakingsStatus.message}
        </AlertDescription>
      </Alert>

      <div>
        <h4 className="text-base font-semibold mb-4 flex items-center">
          <Shield className="w-4 h-4 mr-2" />
          Required Undertakings
        </h4>
        <div className="space-y-6">
          <FileUpload
            label="Lock-up Undertaking"
            description="Upload signed lock-up undertaking from promoters and major shareholders (typically 1-3 years post-listing)"
            acceptedTypes={['pdf', 'doc', 'docx']}
            required={true}
            value={postApproval.documents?.lockUpUndertaking}
            onChange={(file) => updatePostApproval({
              documents: {
                ...postApproval.documents,
                lockUpUndertaking: file as Document
              }
            })}
            error={errors.lockUpUndertaking}
          />

          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Lock-up Undertaking Requirements:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Must be signed by all promoters and shareholders holding >5%</li>
                <li>• Typically covers 1-3 years post-listing period</li>
                <li>• Should specify permitted transfers (family, trusts, etc.)</li>
                <li>• Must include penalty clauses for violations</li>
                <li>• Should be legally binding and enforceable</li>
              </ul>
            </AlertDescription>
          </Alert>

          <FileUpload
            label="Publication Confirmation"
            description="Upload confirmation that all required publications have been made in accordance with CMA requirements"
            acceptedTypes={['pdf', 'doc', 'docx']}
            required={true}
            value={postApproval.documents?.publicationConfirmation}
            onChange={(file) => updatePostApproval({
              documents: {
                ...postApproval.documents,
                publicationConfirmation: file as Document
              }
            })}
            error={errors.publicationConfirmation}
          />

          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Publication Confirmation Should Include:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Confirmation of newspaper publication dates and publications</li>
                <li>• Evidence of electronic form availability</li>
                <li>• Confirmation of receiving bank arrangements</li>
                <li>• Verification of compliance with advertising guidelines</li>
                <li>• Timeline compliance confirmation</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="text-base font-semibold mb-4 flex items-center">
          <Award className="w-4 h-4 mr-2" />
          CMA Approval Documentation
        </h4>
        <div className="space-y-6">
          <FileUpload
            label="CMA Approval Letter (Optional)"
            description="Upload the official CMA approval letter once received (this will be provided by CMA after review)"
            acceptedTypes={['pdf']}
            required={false}
            value={postApproval.documents?.cmaApprovalLetter}
            onChange={(file) => updatePostApproval({
              documents: {
                ...postApproval.documents,
                cmaApprovalLetter: file as Document
              }
            })}
          />

          <Alert className="bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Note:</strong> The CMA approval letter will be issued by the Capital Markets Authority 
              after successful review of your application. This field is optional during initial submission 
              but will be required for final compliance verification.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">
            Post-Approval Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              {postApproval.documents?.lockUpUndertaking ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>Lock-up undertaking uploaded</span>
            </div>
            <div className="flex items-center space-x-2">
              {postApproval.documents?.publicationConfirmation ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>Publication confirmation uploaded</span>
            </div>
            <div className="flex items-center space-x-2">
              {postApproval.documents?.cmaApprovalLetter ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-gray-400" />
              )}
              <span>CMA approval letter (optional)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center text-blue-900">
            <FileCheck className="w-4 h-4 mr-2" />
            Ongoing Compliance Obligations
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <p className="text-sm mb-3">
            After CMA approval and successful listing, the company will have ongoing obligations:
          </p>
          <ul className="text-sm space-y-1">
            <li>• Quarterly and annual financial reporting</li>
            <li>• Immediate disclosure of material information</li>
            <li>• Compliance with corporate governance requirements</li>
            <li>• Adherence to lock-up undertakings</li>
            <li>• Maintenance of minimum public shareholding</li>
            <li>• Regular compliance certifications to CMA</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}