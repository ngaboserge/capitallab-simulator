"use client"

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileUpload } from '@/components/cma-issuer/form-components/file-upload'
import { IssuerApplication, Document } from '@/lib/cma-issuer-system/types'
import { AlertCircle, CheckCircle, Info, Newspaper, Calendar, Clock } from 'lucide-react'

interface PublicationSectionProps {
  data: Partial<IssuerApplication>
  onDataChange: (data: Partial<IssuerApplication>) => void
  onSectionComplete: (isComplete: boolean) => void
}

interface ValidationErrors {
  cmaSubmissionDate?: string
  newspaperProspectus?: string
  electronicSubscriptionForm?: string
}

export function PublicationSection({
  data,
  onDataChange,
  onSectionComplete
}: PublicationSectionProps) {
  const [errors, setErrors] = useState<ValidationErrors>({})

  const publication = data.publication || {
    cmaSubmissionDate: undefined,
    documents: {
      newspaperProspectus: undefined,
      electronicSubscriptionForm: undefined
    }
  }

  const updatePublication = (updates: any) => {
    const updatedData = {
      ...data,
      publication: {
        ...publication,
        ...updates
      }
    }
    onDataChange(updatedData)
  }

  const validateSubmissionTiming = (submissionDate: Date) => {
    const now = new Date()
    const timeDiff = submissionDate.getTime() - now.getTime()
    const hoursDiff = timeDiff / (1000 * 60 * 60)
    
    // Must be submitted at least 48 hours before CMA submission
    return hoursDiff >= 48
  }

  const validateSection = () => {
    const newErrors: ValidationErrors = {}

    // CMA submission date validation
    if (!publication.cmaSubmissionDate) {
      newErrors.cmaSubmissionDate = 'CMA submission date is required'
    } else {
      const submissionDate = new Date(publication.cmaSubmissionDate)
      if (submissionDate <= new Date()) {
        newErrors.cmaSubmissionDate = 'CMA submission date must be in the future'
      } else if (!validateSubmissionTiming(submissionDate)) {
        newErrors.cmaSubmissionDate = 'Documents must be submitted at least 48 hours before CMA submission'
      }
    }

    // Document validation
    if (!publication.documents?.newspaperProspectus) {
      newErrors.newspaperProspectus = 'Newspaper prospectus is required'
    }
    
    if (!publication.documents?.electronicSubscriptionForm) {
      newErrors.electronicSubscriptionForm = 'Electronic subscription form is required'
    }

    setErrors(newErrors)
    
    const isComplete = Object.keys(newErrors).length === 0
    onSectionComplete(isComplete)
    
    return isComplete
  }

  useEffect(() => {
    validateSection()
  }, [publication])

  const getPublicationStatus = () => {
    const hasValidDate = publication.cmaSubmissionDate && 
                        new Date(publication.cmaSubmissionDate) > new Date() &&
                        validateSubmissionTiming(new Date(publication.cmaSubmissionDate))
    
    const hasRequiredDocs = publication.documents?.newspaperProspectus &&
                           publication.documents?.electronicSubscriptionForm
    
    if (hasValidDate && hasRequiredDocs) {
      return { type: 'success', message: 'Publication requirements complete' }
    } else if (hasRequiredDocs) {
      return { type: 'warning', message: 'Documents uploaded, verify submission timing' }
    } else if (hasValidDate) {
      return { type: 'warning', message: 'Submission date set, upload required documents' }
    }
    return { type: 'info', message: 'Complete publication and advertisement requirements' }
  }

  const getTimeUntilSubmission = () => {
    if (!publication.cmaSubmissionDate) return null
    
    const now = new Date()
    const submissionDate = new Date(publication.cmaSubmissionDate)
    const timeDiff = submissionDate.getTime() - now.getTime()
    const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60))
    const daysDiff = Math.floor(hoursDiff / 24)
    
    if (daysDiff > 0) {
      return `${daysDiff} days, ${hoursDiff % 24} hours`
    } else if (hoursDiff > 0) {
      return `${hoursDiff} hours`
    } else {
      return 'Past due'
    }
  }

  const publicationStatus = getPublicationStatus()
  const timeUntilSubmission = getTimeUntilSubmission()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Publication & Advertisement</h3>
        <p className="text-sm text-muted-foreground">
          Prepare publication materials and confirm timing requirements for public advertisement of the offer.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Timing Requirement:</strong> All publication materials must be submitted to CMA 
          at least 48 hours before the intended CMA submission date for approval.
        </AlertDescription>
      </Alert>

      <Alert className={
        publicationStatus.type === 'success' ? 'border-green-500 bg-green-50' :
        publicationStatus.type === 'warning' ? 'border-orange-500 bg-orange-50' :
        'border-blue-500 bg-blue-50'
      }>
        {publicationStatus.type === 'success' ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : publicationStatus.type === 'warning' ? (
          <AlertCircle className="h-4 w-4 text-orange-600" />
        ) : (
          <Info className="h-4 w-4 text-blue-600" />
        )}
        <AlertDescription className={
          publicationStatus.type === 'success' ? 'text-green-800' :
          publicationStatus.type === 'warning' ? 'text-orange-800' :
          'text-blue-800'
        }>
          {publicationStatus.message}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Submission Timing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cmaSubmissionDate">
              Intended CMA Submission Date
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="cmaSubmissionDate"
              type="datetime-local"
              value={publication.cmaSubmissionDate ? 
                new Date(publication.cmaSubmissionDate).toISOString().slice(0, 16) : ''}
              onChange={(e) => updatePublication({ 
                cmaSubmissionDate: e.target.value ? new Date(e.target.value) : undefined 
              })}
              className={errors.cmaSubmissionDate ? 'border-red-500' : ''}
            />
            {errors.cmaSubmissionDate && (
              <p className="text-sm text-red-600">{errors.cmaSubmissionDate}</p>
            )}
            {timeUntilSubmission && (
              <p className="text-sm text-muted-foreground">
                Time until submission: {timeUntilSubmission}
              </p>
            )}
          </div>

          {publication.cmaSubmissionDate && (
            <div className="p-4 bg-muted rounded-lg">
              <h5 className="font-medium mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Submission Timeline
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Publication materials deadline:</span>
                  <span className="font-medium">
                    {new Date(new Date(publication.cmaSubmissionDate).getTime() - 48 * 60 * 60 * 1000)
                      .toLocaleDateString('en-RW', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>CMA submission date:</span>
                  <span className="font-medium">
                    {new Date(publication.cmaSubmissionDate).toLocaleDateString('en-RW', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={`font-medium ${
                    validateSubmissionTiming(new Date(publication.cmaSubmissionDate)) 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {validateSubmissionTiming(new Date(publication.cmaSubmissionDate)) 
                      ? 'On schedule' 
                      : 'Insufficient time'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      <div>
        <h4 className="text-base font-semibold mb-4 flex items-center">
          <Newspaper className="w-4 h-4 mr-2" />
          Publication Materials
        </h4>
        <div className="space-y-6">
          <FileUpload
            label="Newspaper Prospectus"
            description="Upload the abridged prospectus formatted for newspaper publication (must comply with CMA advertising guidelines)"
            acceptedTypes={['pdf', 'doc', 'docx']}
            required={true}
            value={publication.documents?.newspaperProspectus}
            onChange={(file) => updatePublication({
              documents: {
                ...publication.documents,
                newspaperProspectus: file as Document
              }
            })}
            error={errors.newspaperProspectus}
          />

          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>Newspaper Publication Requirements:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Must include all material information from abridged prospectus</li>
                <li>• Font size must be readable (minimum 10pt)</li>
                <li>• Must include application procedures and deadlines</li>
                <li>• Contact information for receiving banks must be prominent</li>
                <li>• Risk warnings must be clearly displayed</li>
              </ul>
            </AlertDescription>
          </Alert>

          <FileUpload
            label="Electronic Subscription Form"
            description="Upload the electronic version of the subscription form for online applications"
            acceptedTypes={['pdf', 'doc', 'docx', 'html']}
            required={true}
            value={publication.documents?.electronicSubscriptionForm}
            onChange={(file) => updatePublication({
              documents: {
                ...publication.documents,
                electronicSubscriptionForm: file as Document
              }
            })}
            error={errors.electronicSubscriptionForm}
          />

          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Electronic Form Requirements:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Must be accessible and user-friendly</li>
                <li>• Include all required investor information fields</li>
                <li>• Provide clear instructions for completion</li>
                <li>• Include terms and conditions acceptance</li>
                <li>• Must be compatible with receiving bank systems</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">
            Publication Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              {publication.cmaSubmissionDate && new Date(publication.cmaSubmissionDate) > new Date() ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>CMA submission date set (future date)</span>
            </div>
            <div className="flex items-center space-x-2">
              {publication.cmaSubmissionDate && validateSubmissionTiming(new Date(publication.cmaSubmissionDate)) ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>48-hour advance submission requirement met</span>
            </div>
            <div className="flex items-center space-x-2">
              {publication.documents?.newspaperProspectus ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>Newspaper prospectus uploaded</span>
            </div>
            <div className="flex items-center space-x-2">
              {publication.documents?.electronicSubscriptionForm ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>Electronic subscription form uploaded</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Important:</strong> All advertisement materials must receive CMA approval before 
          publication. No public advertisements may be made without prior written approval from CMA.
        </AlertDescription>
      </Alert>
    </div>
  )
}