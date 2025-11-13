"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { FileUpload } from '@/components/cma-issuer/form-components/file-upload'
import { IssuerApplication, Document as AppDocument } from '@/lib/cma-issuer-system/types'
import { FileText, CheckCircle, AlertCircle, Shield } from 'lucide-react'

interface UndertakingsSectionProps {
  data: Partial<IssuerApplication>
  onDataChange: (data: Partial<IssuerApplication>) => void
  onSectionComplete: (isComplete: boolean) => void
}

export function UndertakingsSection({ data, onDataChange, onSectionComplete }: UndertakingsSectionProps) {
  const [formData, setFormData] = useState({
    lockUpAgreement: '',
    publicationConfirmation: '',
    cmaApprovalLetter: '',
    ongoingCompliance: '',
    continuousDisclosure: false,
    quarterlyReporting: false,
    materialChangeNotification: false,
    shareholderMeetingNotices: false,
    lockUpAgreementFile: data.postApproval?.documents?.lockUpUndertaking || null,
    publicationConfirmationFile: data.postApproval?.documents?.publicationConfirmation || null,
    cmaApprovalLetterFile: data.postApproval?.documents?.cmaApprovalLetter || null
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const errors: Record<string, string> = {}
    
    if (!formData.lockUpAgreement.trim()) {
      errors.lockUpAgreement = 'Lock-up agreement details are required'
    }
    
    if (!formData.publicationConfirmation.trim()) {
      errors.publicationConfirmation = 'Publication confirmation details are required'
    }
    
    if (!formData.ongoingCompliance.trim()) {
      errors.ongoingCompliance = 'Ongoing compliance commitment is required'
    }
    
    if (!formData.continuousDisclosure) {
      errors.continuousDisclosure = 'Continuous disclosure commitment is required'
    }
    
    if (!formData.quarterlyReporting) {
      errors.quarterlyReporting = 'Quarterly reporting commitment is required'
    }
    
    if (!formData.materialChangeNotification) {
      errors.materialChangeNotification = 'Material change notification commitment is required'
    }
    
    if (!formData.shareholderMeetingNotices) {
      errors.shareholderMeetingNotices = 'Shareholder meeting notice commitment is required'
    }

    // Only show errors for touched fields
    const filteredErrors: Record<string, string> = {}
    Object.keys(errors).forEach(key => {
      if (touchedFields[key]) {
        filteredErrors[key] = errors[key]
      }
    })
    
    setValidationErrors(filteredErrors)
    
    const isComplete = Object.keys(errors).length === 0 && 
                      Boolean(formData.lockUpAgreementFile) && 
                      Boolean(formData.publicationConfirmationFile)

    onSectionComplete(isComplete)
  }, [formData, touchedFields])

  const updateFormData = (updates: Partial<typeof formData>) => {
    const newFormData = { ...formData, ...updates }
    setFormData(newFormData)
    
    // Update parent data with proper structure
    const updatedData = {
      ...data,
      postApproval: {
        documents: {
          lockUpUndertaking: newFormData.lockUpAgreementFile as AppDocument,
          publicationConfirmation: newFormData.publicationConfirmationFile as AppDocument,
          cmaApprovalLetter: newFormData.cmaApprovalLetterFile as AppDocument
        }
      }
    }
    onDataChange(updatedData)
  }

  const handleFileUpload = (field: string, file: AppDocument | AppDocument[] | null) => {
    updateFormData({ [field]: Array.isArray(file) ? file[0] : file })
  }

  const markFieldTouched = (fieldName: string) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Post-Approval Undertakings & Commitments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Lock-up Agreement */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Lock-up Agreement Details *
              </label>
              <Textarea
                value={formData.lockUpAgreement}
                onChange={(e) => updateFormData({ lockUpAgreement: e.target.value })}
                onFocus={() => markFieldTouched('lockUpAgreement')}
                placeholder="Provide details about lock-up agreements for major shareholders, including duration, percentage of shares covered, and exceptions..."
                className={validationErrors.lockUpAgreement ? 'border-red-500' : ''}
                rows={4}
              />
              {validationErrors.lockUpAgreement && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.lockUpAgreement}
                </p>
              )}
            </div>

            <FileUpload
              label="Upload Lock-up Agreement"
              description="Upload signed lock-up agreements from major shareholders"
              acceptedTypes={['pdf', 'doc', 'docx']}
              required
              value={formData.lockUpAgreementFile || undefined}
              onChange={(file) => handleFileUpload('lockUpAgreementFile', file)}
            />
          </div>

          {/* Publication Confirmation */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Publication Confirmation Details *
              </label>
              <Textarea
                value={formData.publicationConfirmation}
                onChange={(e) => updateFormData({ publicationConfirmation: e.target.value })}
                onFocus={() => markFieldTouched('publicationConfirmation')}
                placeholder="Confirm publication arrangements and provide evidence of newspaper publication, electronic form availability, and public accessibility..."
                className={validationErrors.publicationConfirmation ? 'border-red-500' : ''}
                rows={4}
              />
              {validationErrors.publicationConfirmation && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.publicationConfirmation}
                </p>
              )}
            </div>

            <FileUpload
              label="Upload Publication Confirmation"
              description="Upload evidence of publication (newspaper clippings, screenshots, etc.)"
              acceptedTypes={['pdf', 'doc', 'docx', 'jpg', 'png']}
              required
              value={formData.publicationConfirmationFile || undefined}
              onChange={(file) => handleFileUpload('publicationConfirmationFile', file)}
            />
          </div>

          {/* CMA Approval Letter */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                CMA Approval Letter Reference
              </label>
              <Textarea
                value={formData.cmaApprovalLetter}
                onChange={(e) => updateFormData({ cmaApprovalLetter: e.target.value })}
                onFocus={() => markFieldTouched('cmaApprovalLetter')}
                placeholder="Reference the CMA approval letter and any specific conditions or requirements mentioned..."
                rows={3}
              />
            </div>

            <FileUpload
              label="Upload CMA Approval Letter (if available)"
              description="Upload the official CMA approval letter when received"
              acceptedTypes={['pdf', 'doc', 'docx']}
              value={formData.cmaApprovalLetterFile || undefined}
              onChange={(file) => handleFileUpload('cmaApprovalLetterFile', file)}
            />
          </div>

          {/* Ongoing Compliance Commitment */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Ongoing Compliance Commitment *
            </label>
            <Textarea
              value={formData.ongoingCompliance}
              onChange={(e) => updateFormData({ ongoingCompliance: e.target.value })}
              onFocus={() => markFieldTouched('ongoingCompliance')}
              placeholder="Describe the company's commitment to ongoing compliance with CMA regulations, including internal processes and responsible personnel..."
              className={validationErrors.ongoingCompliance ? 'border-red-500' : ''}
              rows={4}
            />
            {validationErrors.ongoingCompliance && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.ongoingCompliance}
              </p>
            )}
          </div>

          {/* Compliance Undertakings */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium">Ongoing Compliance Undertakings</h4>
            <p className="text-sm text-muted-foreground">
              The company undertakes to comply with all ongoing obligations as a listed entity:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="continuousDisclosure"
                  checked={formData.continuousDisclosure}
                  onCheckedChange={(checked) => {
                    markFieldTouched('continuousDisclosure')
                    const newValue = Boolean(checked)
                    updateFormData({ continuousDisclosure: newValue })
                  }}
                  className={validationErrors.continuousDisclosure ? 'border-red-500' : ''}
                />
                <div className="space-y-1">
                  <label htmlFor="continuousDisclosure" className="text-sm font-medium cursor-pointer">
                    Continuous Disclosure Obligations *
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Commit to timely disclosure of all material information that may affect share price
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="quarterlyReporting"
                  checked={formData.quarterlyReporting}
                  onCheckedChange={(checked) => {
                    markFieldTouched('quarterlyReporting')
                    const newValue = Boolean(checked)
                    updateFormData({ quarterlyReporting: newValue })
                  }}
                  className={validationErrors.quarterlyReporting ? 'border-red-500' : ''}
                />
                <div className="space-y-1">
                  <label htmlFor="quarterlyReporting" className="text-sm font-medium cursor-pointer">
                    Quarterly Financial Reporting *
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Commit to submitting quarterly financial reports within required timeframes
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="materialChangeNotification"
                  checked={formData.materialChangeNotification}
                  onCheckedChange={(checked) => {
                    markFieldTouched('materialChangeNotification')
                    const newValue = Boolean(checked)
                    updateFormData({ materialChangeNotification: newValue })
                  }}
                  className={validationErrors.materialChangeNotification ? 'border-red-500' : ''}
                />
                <div className="space-y-1">
                  <label htmlFor="materialChangeNotification" className="text-sm font-medium cursor-pointer">
                    Material Change Notifications *
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Commit to notifying CMA of any material changes in business, structure, or operations
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="shareholderMeetingNotices"
                  checked={formData.shareholderMeetingNotices}
                  onCheckedChange={(checked) => {
                    markFieldTouched('shareholderMeetingNotices')
                    const newValue = Boolean(checked)
                    updateFormData({ shareholderMeetingNotices: newValue })
                  }}
                  className={validationErrors.shareholderMeetingNotices ? 'border-red-500' : ''}
                />
                <div className="space-y-1">
                  <label htmlFor="shareholderMeetingNotices" className="text-sm font-medium cursor-pointer">
                    Shareholder Meeting Notices *
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Commit to providing proper notice and documentation for all shareholder meetings
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Validation Summary */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                <AlertCircle className="w-4 h-4" />
                Please complete the following required fields:
              </div>
              <ul className="text-sm text-red-600 space-y-1">
                {Object.values(validationErrors).map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {Object.keys(validationErrors).length === 0 && formData.lockUpAgreementFile && formData.publicationConfirmationFile && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <CheckCircle className="w-4 h-4" />
                Section 9: Post-Approval Undertakings - Complete
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}