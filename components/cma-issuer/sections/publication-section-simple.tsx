"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { FileUpload } from '@/components/cma-issuer/form-components/file-upload'
import { IssuerApplication, Document as AppDocument } from '@/lib/cma-issuer-system/types'
import { Upload, CheckCircle, AlertCircle } from 'lucide-react'

interface PublicationSectionProps {
  data: Partial<IssuerApplication>
  onDataChange: (data: Partial<IssuerApplication>) => void
  onSectionComplete: (isComplete: boolean) => void
}

export function PublicationSection({ data, onDataChange, onSectionComplete }: PublicationSectionProps) {
  const [formData, setFormData] = useState({
    newspaperProspectus: '',
    electronicSubscriptionForm: '',
    submissionTiming: '',
    advertisementApproval: false,
    publicationConfirmation: false,
    newspaperProspectusFile: data.publication?.documents?.newspaperProspectus || null,
    subscriptionFormFile: data.publication?.documents?.electronicSubscriptionForm || null,
    advertisementFiles: [] as AppDocument[]
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const errors: Record<string, string> = {}
    
    if (!formData.newspaperProspectus.trim()) {
      errors.newspaperProspectus = 'Newspaper prospectus details are required'
    }
    
    if (!formData.electronicSubscriptionForm.trim()) {
      errors.electronicSubscriptionForm = 'Electronic subscription form details are required'
    }
    
    if (!formData.submissionTiming.trim()) {
      errors.submissionTiming = 'Submission timing confirmation is required'
    }
    
    if (!formData.advertisementApproval) {
      errors.advertisementApproval = 'CMA advertisement approval confirmation is required'
    }
    
    if (!formData.publicationConfirmation) {
      errors.publicationConfirmation = 'Publication confirmation is required'
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
                      Boolean(formData.newspaperProspectusFile) && 
                      Boolean(formData.subscriptionFormFile)

    onSectionComplete(isComplete)
  }, [formData, touchedFields])

  const updateFormData = (updates: Partial<typeof formData>) => {
    const newFormData = { ...formData, ...updates }
    setFormData(newFormData)
    
    // Update parent data with proper structure
    const updatedData = {
      ...data,
      publication: {
        cmaSubmissionDate: new Date(),
        documents: {
          newspaperProspectus: newFormData.newspaperProspectusFile as AppDocument,
          electronicSubscriptionForm: newFormData.subscriptionFormFile as AppDocument
        }
      }
    }
    onDataChange(updatedData)
  }

  const markFieldTouched = (fieldName: string) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }))
  }

  const handleFileUpload = (field: string, file: AppDocument | AppDocument[] | null) => {
    updateFormData({ [field]: file })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Publication & Advertisement Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Newspaper Prospectus */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Newspaper Prospectus Publication Details *
              </label>
              <Textarea
                value={formData.newspaperProspectus}
                onChange={(e) => updateFormData({ newspaperProspectus: e.target.value })}
                onFocus={() => markFieldTouched('newspaperProspectus')}
                placeholder="Provide details about newspaper prospectus publication plans, including selected newspapers and publication dates..."
                className={validationErrors.newspaperProspectus ? 'border-red-500' : ''}
                rows={4}
              />
              {validationErrors.newspaperProspectus && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.newspaperProspectus}
                </p>
              )}
            </div>

            <FileUpload
              label="Upload Newspaper Prospectus Draft"
              description="Upload the draft newspaper prospectus for CMA review"
              acceptedTypes={['pdf', 'doc', 'docx']}
              required
              value={formData.newspaperProspectusFile || undefined}
              onChange={(file) => handleFileUpload('newspaperProspectusFile', Array.isArray(file) ? file[0] : file)}
            />
          </div>

          {/* Electronic Subscription Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Electronic Subscription Form Details *
              </label>
              <Textarea
                value={formData.electronicSubscriptionForm}
                onChange={(e) => updateFormData({ electronicSubscriptionForm: e.target.value })}
                onFocus={() => markFieldTouched('electronicSubscriptionForm')}
                placeholder="Describe the electronic subscription form setup, online platform details, and accessibility features..."
                className={validationErrors.electronicSubscriptionForm ? 'border-red-500' : ''}
                rows={4}
              />
              {validationErrors.electronicSubscriptionForm && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {validationErrors.electronicSubscriptionForm}
                </p>
              )}
            </div>

            <FileUpload
              label="Upload Electronic Subscription Form"
              description="Upload the electronic subscription form for review"
              acceptedTypes={['pdf', 'doc', 'docx']}
              required
              value={formData.subscriptionFormFile || undefined}
              onChange={(file) => handleFileUpload('subscriptionFormFile', Array.isArray(file) ? file[0] : file)}
            />
          </div>

          {/* Submission Timing */}
          <div>
            <label className="block text-sm font-medium mb-2">
              48-Hour Submission Timing Confirmation *
            </label>
            <Textarea
              value={formData.submissionTiming}
              onChange={(e) => updateFormData({ submissionTiming: e.target.value })}
              onFocus={() => markFieldTouched('submissionTiming')}
              placeholder="Confirm understanding of 48-hour submission requirement and provide timeline for submission after CMA approval..."
              className={validationErrors.submissionTiming ? 'border-red-500' : ''}
              rows={3}
            />
            {validationErrors.submissionTiming && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {validationErrors.submissionTiming}
              </p>
            )}
          </div>

          {/* Advertisement Materials */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Advertisement Materials (Optional)
              </label>
              <p className="text-sm text-muted-foreground mb-4">
                Upload any planned advertisement materials for CMA pre-approval
              </p>
              <FileUpload
                label="Upload Advertisement Materials"
                description="Upload advertisement drafts, marketing materials, or promotional content"
                acceptedTypes={['pdf', 'doc', 'docx', 'jpg', 'png']}
                multiple
                value={formData.advertisementFiles}
                onChange={(files) => updateFormData({ advertisementFiles: Array.isArray(files) ? files : [] })}
              />
            </div>
          </div>

          {/* Confirmations */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium">Required Confirmations</h4>
            
            <div className="flex items-start space-x-3">
              <Checkbox
                id="advertisementApproval"
                checked={formData.advertisementApproval}
                onCheckedChange={(checked) => {
                  markFieldTouched('advertisementApproval')
                  const newValue = Boolean(checked)
                  updateFormData({ advertisementApproval: newValue })
                }}
                className={validationErrors.advertisementApproval ? 'border-red-500' : ''}
              />
              <div className="space-y-1">
                <label htmlFor="advertisementApproval" className="text-sm font-medium cursor-pointer">
                  CMA Advertisement Approval Confirmation *
                </label>
                <p className="text-xs text-muted-foreground">
                  I confirm that all advertisements will be submitted to CMA for approval before publication
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="publicationConfirmation"
                checked={formData.publicationConfirmation}
                onCheckedChange={(checked) => {
                  markFieldTouched('publicationConfirmation')
                  const newValue = Boolean(checked)
                  updateFormData({ publicationConfirmation: newValue })
                }}
                className={validationErrors.publicationConfirmation ? 'border-red-500' : ''}
              />
              <div className="space-y-1">
                <label htmlFor="publicationConfirmation" className="text-sm font-medium cursor-pointer">
                  Publication Timeline Confirmation *
                </label>
                <p className="text-xs text-muted-foreground">
                  I confirm understanding of publication requirements and 48-hour submission timeline
                </p>
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

          {Object.keys(validationErrors).length === 0 && formData.newspaperProspectusFile && formData.subscriptionFormFile && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <CheckCircle className="w-4 h-4" />
                Section 8: Publication & Advertisement - Complete
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}