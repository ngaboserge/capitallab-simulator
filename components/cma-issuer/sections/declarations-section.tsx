"use client"

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ContactInfoInput } from '@/components/cma-issuer/form-components/contact-info-input'
import { IssuerApplication, ContactInfo, DigitalSignature } from '@/lib/cma-issuer-system/types'
import { AlertCircle, CheckCircle, Info, PenTool, User, UserCheck, Clock } from 'lucide-react'

interface DeclarationsSectionProps {
  data: Partial<IssuerApplication>
  onDataChange: (data: Partial<IssuerApplication>) => void
  onSectionComplete: (isComplete: boolean) => void
}

interface ValidationErrors {
  authorizedOfficerName?: string
  authorizedOfficerPosition?: string
  authorizedOfficerContact?: Partial<Record<keyof ContactInfo, string>>
  authorizedOfficerSignature?: string
  investmentAdviserSignature?: string
}

const DECLARATION_TEXT = `I, the undersigned, being a duly authorized officer of the company, hereby declare that:

1. All information provided in this application is true, accurate, and complete to the best of my knowledge and belief.

2. The company has complied with all applicable laws and regulations in the preparation of this application.

3. All material facts that could affect an investor's decision have been disclosed in the prospectus and supporting documents.

4. The company undertakes to comply with all ongoing obligations under the Capital Markets Law and CMA regulations.

5. The company acknowledges that any false or misleading information may result in rejection of this application and potential legal action.

6. The company consents to CMA conducting such investigations as may be necessary for the evaluation of this application.

By signing below, I confirm that I have the authority to make this declaration on behalf of the company and that the board of directors has approved this application.`

const ADVISER_CONFIRMATION_TEXT = `As the appointed investment adviser for this application, I hereby confirm that:

1. I have reviewed all information provided in this application and supporting documents.

2. To the best of my knowledge and belief, all information is accurate and complete.

3. I have advised the company on all regulatory requirements and compliance obligations.

4. The company has been made aware of all material risks and disclosure requirements.

5. I recommend this application for CMA consideration based on my professional assessment.`

export function DeclarationsSection({
  data,
  onDataChange,
  onSectionComplete
}: DeclarationsSectionProps) {
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isSigningOfficer, setIsSigningOfficer] = useState(false)
  const [isSigningAdviser, setIsSigningAdviser] = useState(false)

  const declarations = data.declarations || {
    authorizedOfficer: {
      name: '',
      position: '',
      contactInfo: undefined,
      signature: undefined,
      declarationText: DECLARATION_TEXT
    },
    investmentAdviser: {
      signature: undefined,
      confirmationText: ADVISER_CONFIRMATION_TEXT
    }
  }

  const updateDeclarations = (updates: any) => {
    const updatedData = {
      ...data,
      declarations: {
        ...declarations,
        ...updates
      }
    }
    onDataChange(updatedData)
  }

  const createDigitalSignature = (signerName: string, signerPosition: string): DigitalSignature => {
    return {
      signerId: `user_${Date.now()}`, // In real implementation, use actual user ID
      signerName,
      signerPosition,
      signatureData: `DIGITAL_SIGNATURE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ipAddress: '127.0.0.1', // In real implementation, capture actual IP
      certificateId: `CERT_${Date.now()}`
    }
  }

  const handleOfficerSignature = () => {
    if (!declarations.authorizedOfficer.name || !declarations.authorizedOfficer.position) {
      return
    }

    setIsSigningOfficer(true)
    
    // Simulate digital signature process
    setTimeout(() => {
      const signature = createDigitalSignature(
        declarations.authorizedOfficer.name,
        declarations.authorizedOfficer.position
      )
      
      updateDeclarations({
        authorizedOfficer: {
          ...declarations.authorizedOfficer,
          signature
        }
      })
      
      setIsSigningOfficer(false)
    }, 2000)
  }

  const handleAdviserSignature = () => {
    setIsSigningAdviser(true)
    
    // Simulate digital signature process
    setTimeout(() => {
      const signature = createDigitalSignature(
        'Investment Adviser', // In real implementation, get from user context
        'Licensed Investment Adviser'
      )
      
      updateDeclarations({
        investmentAdviser: {
          ...declarations.investmentAdviser,
          signature
        }
      })
      
      setIsSigningAdviser(false)
    }, 2000)
  }

  const validateSection = () => {
    const newErrors: ValidationErrors = {}

    // Authorized officer validation
    if (!declarations.authorizedOfficer.name?.trim()) {
      newErrors.authorizedOfficerName = 'Authorized officer name is required'
    }

    if (!declarations.authorizedOfficer.position?.trim()) {
      newErrors.authorizedOfficerPosition = 'Authorized officer position is required'
    }

    // Contact info validation
    const contactErrors: Partial<Record<keyof ContactInfo, string>> = {}
    if (!declarations.authorizedOfficer.contactInfo?.email?.trim()) {
      contactErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(declarations.authorizedOfficer.contactInfo.email)) {
      contactErrors.email = 'Invalid email format'
    }
    if (!declarations.authorizedOfficer.contactInfo?.phone?.trim()) {
      contactErrors.phone = 'Phone number is required'
    }
    if (Object.keys(contactErrors).length > 0) {
      newErrors.authorizedOfficerContact = contactErrors
    }

    // Signature validation
    if (!declarations.authorizedOfficer.signature) {
      newErrors.authorizedOfficerSignature = 'Authorized officer signature is required'
    }

    if (!declarations.investmentAdviser.signature) {
      newErrors.investmentAdviserSignature = 'Investment adviser signature is required'
    }

    setErrors(newErrors)
    
    const isComplete = Object.keys(newErrors).length === 0
    onSectionComplete(isComplete)
    
    return isComplete
  }

  useEffect(() => {
    validateSection()
  }, [declarations])

  const getDeclarationsStatus = () => {
    const hasOfficerInfo = declarations.authorizedOfficer.name && 
                          declarations.authorizedOfficer.position &&
                          declarations.authorizedOfficer.contactInfo?.email &&
                          declarations.authorizedOfficer.contactInfo?.phone
    
    const hasSignatures = declarations.authorizedOfficer.signature &&
                         declarations.investmentAdviser.signature
    
    if (hasOfficerInfo && hasSignatures) {
      return { type: 'success', message: 'All declarations and signatures complete' }
    } else if (hasOfficerInfo) {
      return { type: 'warning', message: 'Officer information provided, signatures required' }
    }
    return { type: 'info', message: 'Complete declarations and obtain required signatures' }
  }

  const declarationsStatus = getDeclarationsStatus()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Declarations & Contacts</h3>
        <p className="text-sm text-muted-foreground">
          Provide authorized officer details and obtain required signatures to complete the application.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Requirements:</strong> Authorized officer declaration with digital signature 
          and investment adviser confirmation signature.
        </AlertDescription>
      </Alert>

      <Alert className={
        declarationsStatus.type === 'success' ? 'border-green-500 bg-green-50' :
        declarationsStatus.type === 'warning' ? 'border-orange-500 bg-orange-50' :
        'border-blue-500 bg-blue-50'
      }>
        {declarationsStatus.type === 'success' ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : declarationsStatus.type === 'warning' ? (
          <AlertCircle className="h-4 w-4 text-orange-600" />
        ) : (
          <Info className="h-4 w-4 text-blue-600" />
        )}
        <AlertDescription className={
          declarationsStatus.type === 'success' ? 'text-green-800' :
          declarationsStatus.type === 'warning' ? 'text-orange-800' :
          'text-blue-800'
        }>
          {declarationsStatus.message}
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <User className="w-4 h-4 mr-2" />
            Authorized Officer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="officerName">
                Full Name
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="officerName"
                placeholder="Enter full name"
                value={declarations.authorizedOfficer.name || ''}
                onChange={(e) => updateDeclarations({
                  authorizedOfficer: {
                    ...declarations.authorizedOfficer,
                    name: e.target.value
                  }
                })}
                className={errors.authorizedOfficerName ? 'border-red-500' : ''}
              />
              {errors.authorizedOfficerName && (
                <p className="text-sm text-red-600">{errors.authorizedOfficerName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="officerPosition">
                Position/Title
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="officerPosition"
                placeholder="e.g., Chief Executive Officer, Managing Director"
                value={declarations.authorizedOfficer.position || ''}
                onChange={(e) => updateDeclarations({
                  authorizedOfficer: {
                    ...declarations.authorizedOfficer,
                    position: e.target.value
                  }
                })}
                className={errors.authorizedOfficerPosition ? 'border-red-500' : ''}
              />
              {errors.authorizedOfficerPosition && (
                <p className="text-sm text-red-600">{errors.authorizedOfficerPosition}</p>
              )}
            </div>
          </div>

          <ContactInfoInput
            label="Authorized Officer Contact Information"
            value={declarations.authorizedOfficer.contactInfo}
            onChange={(contactInfo) => updateDeclarations({
              authorizedOfficer: {
                ...declarations.authorizedOfficer,
                contactInfo
              }
            })}
            required={true}
            errors={errors.authorizedOfficerContact}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <PenTool className="w-4 h-4 mr-2" />
            Authorized Officer Declaration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h5 className="font-medium mb-3">Declaration Statement</h5>
            <div className="text-sm whitespace-pre-line text-muted-foreground max-h-64 overflow-y-auto">
              {DECLARATION_TEXT}
            </div>
          </div>

          {declarations.authorizedOfficer.signature ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Declaration Signed</p>
                  <p className="text-sm text-green-700">
                    Signed by {declarations.authorizedOfficer.signature.signerName} on{' '}
                    {declarations.authorizedOfficer.signature.timestamp.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600">
                    Signature ID: {declarations.authorizedOfficer.signature.signatureData}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={handleOfficerSignature}
                disabled={!declarations.authorizedOfficer.name || !declarations.authorizedOfficer.position || isSigningOfficer}
                className="w-full"
              >
                {isSigningOfficer ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Signing Declaration...
                  </>
                ) : (
                  <>
                    <PenTool className="w-4 h-4 mr-2" />
                    Sign Declaration
                  </>
                )}
              </Button>
              {errors.authorizedOfficerSignature && (
                <p className="text-sm text-red-600">{errors.authorizedOfficerSignature}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <UserCheck className="w-4 h-4 mr-2" />
            Investment Adviser Confirmation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h5 className="font-medium mb-3">Adviser Confirmation Statement</h5>
            <div className="text-sm whitespace-pre-line text-muted-foreground max-h-64 overflow-y-auto">
              {ADVISER_CONFIRMATION_TEXT}
            </div>
          </div>

          {declarations.investmentAdviser.signature ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Adviser Confirmation Signed</p>
                  <p className="text-sm text-green-700">
                    Signed by {declarations.investmentAdviser.signature.signerName} on{' '}
                    {declarations.investmentAdviser.signature.timestamp.toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600">
                    Signature ID: {declarations.investmentAdviser.signature.signatureData}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={handleAdviserSignature}
                disabled={isSigningAdviser}
                variant="outline"
                className="w-full"
              >
                {isSigningAdviser ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Signing Confirmation...
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Sign Adviser Confirmation
                  </>
                )}
              </Button>
              {errors.investmentAdviserSignature && (
                <p className="text-sm text-red-600">{errors.investmentAdviserSignature}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">
            Declarations Checklist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              {declarations.authorizedOfficer.name ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>Authorized officer name provided</span>
            </div>
            <div className="flex items-center space-x-2">
              {declarations.authorizedOfficer.position ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>Authorized officer position provided</span>
            </div>
            <div className="flex items-center space-x-2">
              {declarations.authorizedOfficer.contactInfo?.email && declarations.authorizedOfficer.contactInfo?.phone ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>Officer contact information complete</span>
            </div>
            <div className="flex items-center space-x-2">
              {declarations.authorizedOfficer.signature ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>Authorized officer declaration signed</span>
            </div>
            <div className="flex items-center space-x-2">
              {declarations.investmentAdviser.signature ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span>Investment adviser confirmation signed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800">
          <strong>Legal Notice:</strong> Digital signatures are legally binding. By signing, you confirm 
          the accuracy of all information and accept full responsibility for the contents of this application.
        </AlertDescription>
      </Alert>
    </div>
  )
}