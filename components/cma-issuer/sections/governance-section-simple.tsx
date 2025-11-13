"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileUpload } from '@/components/cma-issuer/form-components/file-upload'
import { IssuerApplication, Document } from '@/lib/cma-issuer-system/types'
import { AlertCircle, CheckCircle, Info, Users, User } from 'lucide-react'

interface GovernanceSectionProps {
  data: Partial<IssuerApplication>
  onDataChange: (data: Partial<IssuerApplication>) => void
  onSectionComplete: (isComplete: boolean) => void
}

export function GovernanceSection({
  data,
  onDataChange,
  onSectionComplete
}: GovernanceSectionProps) {
  const [localData, setLocalData] = useState({
    // Director information
    directorName: '',
    directorPosition: '',
    directorQualifications: '',
    directorExperience: '',
    directorIsIndependent: false,
    
    // Management information
    managerName: '',
    managerPosition: '',
    managerQualifications: '',
    managerExperience: '',
    
    // Confirmations
    independentDirectorAppointed: data.governance?.independentDirectorAppointed || false,
    fitAndProperConfirmation: data.governance?.fitAndProperConfirmation || false,
    fitAndProperDeclarations: data.governance?.documents?.fitAndProperDeclarations || []
  })

  const updateField = (field: string, value: any) => {
    const newLocalData = { ...localData, [field]: value }
    setLocalData(newLocalData)

    // Update parent data
    const updatedData = {
      ...data,
      governance: {
        directors: newLocalData.directorName ? [{
          id: 'dir_1',
          name: newLocalData.directorName,
          nationality: 'Rwandan', // Default
          position: newLocalData.directorPosition,
          qualifications: newLocalData.directorQualifications,
          experience: newLocalData.directorExperience,
          isIndependent: newLocalData.directorIsIndependent,
          appointmentDate: new Date(),
          shareholding: 0
        }] : [],
        seniorManagement: newLocalData.managerName ? [{
          id: 'mgr_1',
          name: newLocalData.managerName,
          position: newLocalData.managerPosition,
          qualifications: newLocalData.managerQualifications,
          experience: newLocalData.managerExperience,
          appointmentDate: new Date()
        }] : [],
        independentDirectorAppointed: Boolean(newLocalData.independentDirectorAppointed),
        fitAndProperConfirmation: Boolean(newLocalData.fitAndProperConfirmation),
        documents: {
          fitAndProperDeclarations: newLocalData.fitAndProperDeclarations as Document[]
        }
      }
    }
    
    onDataChange(updatedData)

    // Simple validation
    const hasRequiredFields = 
      newLocalData.directorName &&
      newLocalData.directorPosition &&
      newLocalData.managerName &&
      newLocalData.managerPosition &&
      newLocalData.independentDirectorAppointed &&
      newLocalData.fitAndProperConfirmation &&
      newLocalData.fitAndProperDeclarations.length > 0

    onSectionComplete(Boolean(hasRequiredFields))
  }

  const getGovernanceStatus = () => {
    const hasRequiredFields = 
      localData.directorName &&
      localData.directorPosition &&
      localData.managerName &&
      localData.managerPosition &&
      localData.independentDirectorAppointed &&
      localData.fitAndProperConfirmation &&
      localData.fitAndProperDeclarations.length > 0
    
    if (hasRequiredFields) {
      return { type: 'success', message: 'Governance requirements met' }
    } else if (localData.directorName || localData.managerName) {
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <User className="w-4 h-4 mr-2" />
            Director Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="directorName">
                Director Name
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="directorName"
                placeholder="Enter director's full name"
                value={localData.directorName}
                onChange={(e) => updateField('directorName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="directorPosition">
                Position
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select
                value={localData.directorPosition}
                onValueChange={(value) => updateField('directorPosition', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chairman">Chairman</SelectItem>
                  <SelectItem value="Managing Director">Managing Director</SelectItem>
                  <SelectItem value="Executive Director">Executive Director</SelectItem>
                  <SelectItem value="Non-Executive Director">Non-Executive Director</SelectItem>
                  <SelectItem value="Independent Director">Independent Director</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="directorQualifications">
                Qualifications
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="directorQualifications"
                placeholder="Enter qualifications"
                value={localData.directorQualifications}
                onChange={(e) => updateField('directorQualifications', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="directorExperience">
                Relevant Experience
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Textarea
                id="directorExperience"
                placeholder="Enter relevant experience"
                value={localData.directorExperience}
                onChange={(e) => updateField('directorExperience', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="directorIsIndependent"
              checked={localData.directorIsIndependent}
              onCheckedChange={(checked) => updateField('directorIsIndependent', checked)}
            />
            <Label htmlFor="directorIsIndependent" className="text-sm">
              This is an Independent Director
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <User className="w-4 h-4 mr-2" />
            Senior Management Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="managerName">
                Manager Name
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="managerName"
                placeholder="Enter manager's full name"
                value={localData.managerName}
                onChange={(e) => updateField('managerName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="managerPosition">
                Position
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select
                value={localData.managerPosition}
                onValueChange={(value) => updateField('managerPosition', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chief Executive Officer">Chief Executive Officer</SelectItem>
                  <SelectItem value="Chief Financial Officer">Chief Financial Officer</SelectItem>
                  <SelectItem value="Chief Operating Officer">Chief Operating Officer</SelectItem>
                  <SelectItem value="Company Secretary">Company Secretary</SelectItem>
                  <SelectItem value="Head of Operations">Head of Operations</SelectItem>
                  <SelectItem value="Head of Finance">Head of Finance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="managerQualifications">
                Qualifications
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="managerQualifications"
                placeholder="Enter qualifications"
                value={localData.managerQualifications}
                onChange={(e) => updateField('managerQualifications', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="managerExperience">
                Relevant Experience
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Textarea
                id="managerExperience"
                placeholder="Enter relevant experience"
                value={localData.managerExperience}
                onChange={(e) => updateField('managerExperience', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

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
              checked={localData.independentDirectorAppointed}
              onCheckedChange={(checked) => updateField('independentDirectorAppointed', checked)}
            />
            <div className="space-y-1">
              <Label htmlFor="independentDirectorAppointed" className="text-sm font-medium">
                Independent Director Appointed
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <p className="text-sm text-muted-foreground">
                I confirm that at least one independent director has been appointed to the board.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="fitAndProperConfirmation"
              checked={localData.fitAndProperConfirmation}
              onCheckedChange={(checked) => updateField('fitAndProperConfirmation', checked)}
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
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h4 className="text-base font-semibold mb-4">Required Governance Documents</h4>
        <FileUpload
          label="Fit and Proper Declarations"
          description="Upload signed fit-and-proper declarations for all directors and senior management"
          acceptedTypes={['pdf', 'doc', 'docx']}
          required={true}
          multiple={true}
          value={localData.fitAndProperDeclarations}
          onChange={(files) => updateField('fitAndProperDeclarations', Array.isArray(files) ? files : (files ? [files] : []))}
        />
      </div>
    </div>
  )
}