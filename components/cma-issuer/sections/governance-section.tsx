"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
// import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileUpload } from '@/components/cma-issuer/form-components/file-upload'
import { DynamicTable } from '@/components/cma-issuer/form-components/dynamic-table'
import { IssuerApplication, Director, SeniorManager, Document } from '@/lib/cma-issuer-system/types'
import { AlertCircle, CheckCircle, Info, Users } from 'lucide-react'

interface GovernanceSectionProps {
  data: Partial<IssuerApplication>
  onDataChange: (data: Partial<IssuerApplication>) => void
  onSectionComplete: (isComplete: boolean) => void
}

interface ValidationErrors {
  directors?: Record<number, Record<string, string>>
  seniorManagement?: Record<number, Record<string, string>>
  independentDirectorAppointed?: string
  fitAndProperConfirmation?: string
  fitAndProperDeclarations?: string
}

const DIRECTOR_FIELDS = [
  { key: 'name', label: 'Full Name', type: 'text' as const, required: true, placeholder: 'Enter full name' },
  { key: 'nationality', label: 'Nationality', type: 'text' as const, required: true, placeholder: 'Enter nationality' },
  { key: 'position', label: 'Position', type: 'select' as const, required: true, placeholder: 'Select position', 
    options: ['Chairman', 'Managing Director', 'Executive Director', 'Non-Executive Director', 'Independent Director'] },
  { key: 'qualifications', label: 'Qualifications', type: 'text' as const, required: true, placeholder: 'Enter qualifications' },
  { key: 'experience', label: 'Relevant Experience', type: 'text' as const, required: true, placeholder: 'Enter relevant experience' },
  { key: 'appointmentDate', label: 'Appointment Date', type: 'date' as const, required: true },
  { key: 'shareholding', label: 'Shareholding (%)', type: 'number' as const, placeholder: 'Enter shareholding percentage' },
  { key: 'isIndependent', label: 'Independent Director', type: 'checkbox' as const }
]

const MANAGEMENT_FIELDS = [
  { key: 'name', label: 'Full Name', type: 'text' as const, required: true, placeholder: 'Enter full name' },
  { key: 'position', label: 'Position', type: 'select' as const, required: true, placeholder: 'Select position',
    options: ['Chief Executive Officer', 'Chief Financial Officer', 'Chief Operating Officer', 'Company Secretary', 'Head of Operations', 'Head of Finance', 'Other'] },
  { key: 'qualifications', label: 'Qualifications', type: 'text' as const, required: true, placeholder: 'Enter qualifications' },
  { key: 'experience', label: 'Relevant Experience', type: 'text' as const, required: true, placeholder: 'Enter relevant experience' },
  { key: 'appointmentDate', label: 'Appointment Date', type: 'date' as const, required: true }
]

export function GovernanceSection({
  data,
  onDataChange,
  onSectionComplete
}: GovernanceSectionProps) {
  const [errors, setErrors] = useState<ValidationErrors>({})

  const governance = data.governance || {
    directors: [],
    seniorManagement: [],
    independentDirectorAppointed: false,
    fitAndProperConfirmation: false,
    documents: {
      fitAndProperDeclarations: []
    }
  }

  const updateGovernance = (updates: any) => {
    const updatedData = {
      ...data,
      governance: {
        ...governance,
        ...updates
      }
    }
    onDataChange(updatedData)
  }

  const createEmptyDirector = (): Director => ({
    id: `dir_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: '',
    nationality: '',
    position: '',
    qualifications: '',
    experience: '',
    isIndependent: false,
    appointmentDate: new Date(),
    shareholding: 0
  })

  const createEmptyManager = (): SeniorManager => ({
    id: `mgr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: '',
    position: '',
    qualifications: '',
    experience: '',
    appointmentDate: new Date()
  })

  const validateDirectors = () => {
    const directorErrors: Record<number, Record<string, string>> = {}
    const directors = governance.directors || []

    directors.forEach((director: Director, index: number) => {
      const itemErrors: Record<string, string> = {}

      if (!director.name?.trim()) itemErrors.name = 'Name is required'
      if (!director.nationality?.trim()) itemErrors.nationality = 'Nationality is required'
      if (!director.position?.trim()) itemErrors.position = 'Position is required'
      if (!director.qualifications?.trim()) itemErrors.qualifications = 'Qualifications are required'
      if (!director.experience?.trim()) itemErrors.experience = 'Experience is required'
      if (!director.appointmentDate) itemErrors.appointmentDate = 'Appointment date is required'

      if (Object.keys(itemErrors).length > 0) {
        directorErrors[index] = itemErrors
      }
    })

    return directorErrors
  }

  const validateManagement = () => {
    const managementErrors: Record<number, Record<string, string>> = {}
    const management = governance.seniorManagement || []

    management.forEach((manager: SeniorManager, index: number) => {
      const itemErrors: Record<string, string> = {}

      if (!manager.name?.trim()) itemErrors.name = 'Name is required'
      if (!manager.position?.trim()) itemErrors.position = 'Position is required'
      if (!manager.qualifications?.trim()) itemErrors.qualifications = 'Qualifications are required'
      if (!manager.experience?.trim()) itemErrors.experience = 'Experience is required'
      if (!manager.appointmentDate) itemErrors.appointmentDate = 'Appointment date is required'

      if (Object.keys(itemErrors).length > 0) {
        managementErrors[index] = itemErrors
      }
    })

    return managementErrors
  }

  const validateSection = useCallback(() => {
    const newErrors: ValidationErrors = {}

    // Validate directors
    const directorErrors = validateDirectors()
    if (Object.keys(directorErrors).length > 0) {
      newErrors.directors = directorErrors
    }

    // Validate management
    const managementErrors = validateManagement()
    if (Object.keys(managementErrors).length > 0) {
      newErrors.seniorManagement = managementErrors
    }

    // Check for at least one director
    if (!governance.directors || governance.directors.length === 0) {
      newErrors.directors = { 0: { name: 'At least one director is required' } }
    }

    // Check for at least one senior manager
    if (!governance.seniorManagement || governance.seniorManagement.length === 0) {
      newErrors.seniorManagement = { 0: { name: 'At least one senior manager is required' } }
    }

    // Independent director requirement
    const hasIndependentDirector = governance.directors?.some((d: Director) => d.isIndependent) || false
    if (!hasIndependentDirector) {
      newErrors.independentDirectorAppointed = 'At least one independent director is required'
    }

    // Fit and proper confirmation
    if (!governance.fitAndProperConfirmation) {
      newErrors.fitAndProperConfirmation = 'Fit and proper confirmation is required'
    }

    // Document validation
    if (!governance.documents?.fitAndProperDeclarations || governance.documents.fitAndProperDeclarations.length === 0) {
      newErrors.fitAndProperDeclarations = 'Fit and proper declarations are required for all directors and officers'
    }

    setErrors(newErrors)
    
    const isComplete = Object.keys(newErrors).length === 0
    onSectionComplete(isComplete)
    
    return isComplete
  }, [governance.directors, governance.seniorManagement, governance.fitAndProperConfirmation, governance.documents])

  useEffect(() => {
    validateSection()
  }, [governance.directors, governance.seniorManagement, governance.fitAndProperConfirmation, governance.documents])

  const getGovernanceStatus = () => {
    const directors = governance.directors || []
    const management = governance.seniorManagement || []
    const hasIndependent = directors.some((d: Director) => d.isIndependent)
    
    if (directors.length > 0 && management.length > 0 && hasIndependent && governance.fitAndProperConfirmation) {
      return { type: 'success', message: 'Governance requirements met' }
    } else if (directors.length === 0 || management.length === 0 || !hasIndependent) {
      return { type: 'error', message: 'Governance requirements not met' }
    }
    return { type: 'info', message: 'Complete governance information to check requirements' }
  }

  const governanceStatus = getGovernanceStatus()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Governance & Management</h3>
        <p className="text-sm text-muted-foreground">
          Provide governance and management information for CMA to evaluate board competency and integrity.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Requirements:</strong> At least one independent director and fit-and-proper declarations 
          for all directors and senior management.
        </AlertDescription>
      </Alert>

      <Alert className={
        governanceStatus.type === 'success' ? 'border-green-500 bg-green-50' :
        governanceStatus.type === 'error' ? 'border-red-500 bg-red-50' :
        'border-blue-500 bg-blue-50'
      }>
        {governanceStatus.type === 'success' ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : governanceStatus.type === 'error' ? (
          <AlertCircle className="h-4 w-4 text-red-600" />
        ) : (
          <Info className="h-4 w-4 text-blue-600" />
        )}
        <AlertDescription className={
          governanceStatus.type === 'success' ? 'text-green-800' :
          governanceStatus.type === 'error' ? 'text-red-800' :
          'text-blue-800'
        }>
          {governanceStatus.message}
        </AlertDescription>
      </Alert>

      <DynamicTable<Director>
        title="Board of Directors"
        description="Add all directors including executive, non-executive, and independent directors"
        fields={DIRECTOR_FIELDS}
        data={governance.directors || []}
        onChange={(directors) => updateGovernance({ directors })}
        createEmpty={createEmptyDirector}
        errors={errors.directors}
        minItems={1}
        maxItems={15}
      />

      <DynamicTable<SeniorManager>
        title="Senior Management"
        description="Add key senior management personnel"
        fields={MANAGEMENT_FIELDS}
        data={governance.seniorManagement || []}
        onChange={(seniorManagement) => updateGovernance({ seniorManagement })}
        createEmpty={createEmptyManager}
        errors={errors.seniorManagement}
        minItems={1}
        maxItems={10}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Governance Confirmations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="independentDirectorAppointed"
              checked={governance.directors?.some((d: Director) => d.isIndependent) || false}
              disabled
              className="mt-1"
            />
            <div className="space-y-1">
              <Label htmlFor="independentDirectorAppointed" className="text-sm font-medium">
                Independent Director Appointed
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically checked when at least one director is marked as independent above.
              </p>
              {errors.independentDirectorAppointed && (
                <p className="text-sm text-red-600">{errors.independentDirectorAppointed}</p>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="fitAndProperConfirmation"
              checked={Boolean(governance.fitAndProperConfirmation)}
              onCheckedChange={(checked) => updateGovernance({ 
                fitAndProperConfirmation: Boolean(checked)
              })}
              className={errors.fitAndProperConfirmation ? 'border-red-500 mt-1' : 'mt-1'}
            />
            <div className="space-y-1">
              <Label htmlFor="fitAndProperConfirmation" className="text-sm font-medium">
                Fit and Proper Confirmation
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                I confirm that all directors and senior management have no history of bankruptcy, 
                criminal conviction, or regulatory ban that would affect their fitness to serve.
              </p>
              {errors.fitAndProperConfirmation && (
                <p className="text-sm text-red-600">{errors.fitAndProperConfirmation}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="border-t my-6" />

      <div>
        <h4 className="text-base font-semibold mb-4">Required Governance Documents</h4>
        <FileUpload
          label="Fit and Proper Declarations"
          description="Upload signed fit-and-proper declarations for all directors and senior management"
          acceptedTypes={['pdf', 'doc', 'docx']}
          required={true}
          multiple={true}
          value={governance.documents?.fitAndProperDeclarations}
          onChange={(files) => updateGovernance({
            documents: {
              ...governance.documents,
              fitAndProperDeclarations: Array.isArray(files) ? files : (files ? [files] : [])
            }
          })}
          error={errors.fitAndProperDeclarations}
        />
      </div>
    </div>
  )
}