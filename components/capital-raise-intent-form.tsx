'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Building2, 
  DollarSign, 
  Calendar, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react'

interface CapitalRaiseIntent {
  companyName: string
  instrumentType: 'equity' | 'bond' | 'note' | 'sukuk'
  targetAmount: number
  currency: string
  purpose: string
  timelineMonths: number
  businessDescription: string
  contactEmail: string
  contactPhone: string
}

interface CapitalRaiseIntentFormProps {
  onSubmit: (intent: CapitalRaiseIntent) => void
  isSubmitting?: boolean
  userRole: string
}

export function CapitalRaiseIntentForm({ onSubmit, isSubmitting = false, userRole }: CapitalRaiseIntentFormProps) {
  const [formData, setFormData] = useState<CapitalRaiseIntent>({
    companyName: '',
    instrumentType: 'equity',
    targetAmount: 0,
    currency: 'RWF',
    purpose: '',
    timelineMonths: 12,
    businessDescription: '',
    contactEmail: '',
    contactPhone: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required'
    }

    if (formData.targetAmount <= 0) {
      newErrors.targetAmount = 'Target amount must be greater than 0'
    }

    if (formData.targetAmount < 10000000) { // Minimum 10M RWF
      newErrors.targetAmount = 'Minimum capital raise amount is RWF 10,000,000'
    }

    if (!formData.purpose.trim()) {
      newErrors.purpose = 'Purpose of capital raise is required'
    }

    if (!formData.businessDescription.trim()) {
      newErrors.businessDescription = 'Business description is required'
    }

    if (!formData.contactEmail.trim() || !formData.contactEmail.includes('@')) {
      newErrors.contactEmail = 'Valid email address is required'
    }

    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Contact phone number is required'
    }

    if (formData.timelineMonths < 3 || formData.timelineMonths > 24) {
      newErrors.timelineMonths = 'Timeline must be between 3 and 24 months'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleInputChange = (field: keyof CapitalRaiseIntent, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Check if user has permission to submit
  const canSubmit = userRole === 'issuer'

  if (!canSubmit) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            Access Restricted
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Only registered Issuers can submit Capital Raise Intents. Your current role ({userRole}) does not have this permission.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Capital Raise Intent</h1>
        <p className="text-muted-foreground">
          Express your intention to raise capital. An Investment Bank Advisor will be assigned to guide you through the process.
        </p>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Step 1 of 7: Intent Submission
        </Badge>
      </div>

      {/* Process Flow Indicator */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">1</div>
              <span className="font-medium text-blue-900">Intent Submission</span>
            </div>
            <ArrowRight className="w-4 h-4 text-blue-400" />
            <div className="flex items-center gap-2 opacity-50">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold">2</div>
              <span className="text-gray-600">IB Assignment</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-2 opacity-50">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold">3</div>
              <span className="text-gray-600">Due Diligence</span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-2 opacity-50">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold">4</div>
              <span className="text-gray-600">Regulatory Review</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> After submission, you will be assigned an Investment Bank Advisor who will handle all structuring, 
          filing, and regulatory interactions. Your role will be to respond to due diligence requests only.
        </AlertDescription>
      </Alert>

      {/* Main Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Company & Instrument Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter your company name"
                  className={errors.companyName ? 'border-destructive' : ''}
                />
                {errors.companyName && (
                  <p className="text-sm text-destructive">{errors.companyName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="instrumentType">Instrument Type *</Label>
                <Select 
                  value={formData.instrumentType} 
                  onValueChange={(value: any) => handleInputChange('instrumentType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select instrument type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="equity">Equity Shares</SelectItem>
                    <SelectItem value="bond">Corporate Bond</SelectItem>
                    <SelectItem value="note">Promissory Note</SelectItem>
                    <SelectItem value="sukuk">Sukuk (Islamic Bond)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="targetAmount"
                    type="number"
                    value={formData.targetAmount || ''}
                    onChange={(e) => handleInputChange('targetAmount', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className={`pl-10 ${errors.targetAmount ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.targetAmount && (
                  <p className="text-sm text-destructive">{errors.targetAmount}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select 
                  value={formData.currency} 
                  onValueChange={(value) => handleInputChange('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RWF">RWF - Rwandan Franc</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timelineMonths">Timeline (Months) *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="timelineMonths"
                    type="number"
                    min="3"
                    max="24"
                    value={formData.timelineMonths}
                    onChange={(e) => handleInputChange('timelineMonths', parseInt(e.target.value) || 12)}
                    className={`pl-10 ${errors.timelineMonths ? 'border-destructive' : ''}`}
                  />
                </div>
                {errors.timelineMonths && (
                  <p className="text-sm text-destructive">{errors.timelineMonths}</p>
                )}
              </div>
            </div>

            {/* Purpose and Description */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose of Capital Raise *</Label>
                <Input
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  placeholder="e.g., Business expansion, equipment purchase, working capital"
                  className={errors.purpose ? 'border-destructive' : ''}
                />
                {errors.purpose && (
                  <p className="text-sm text-destructive">{errors.purpose}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessDescription">Business Description *</Label>
                <Textarea
                  id="businessDescription"
                  value={formData.businessDescription}
                  onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                  placeholder="Provide a brief description of your business, industry, and key activities"
                  rows={4}
                  className={errors.businessDescription ? 'border-destructive' : ''}
                />
                {errors.businessDescription && (
                  <p className="text-sm text-destructive">{errors.businessDescription}</p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  placeholder="your.email@company.com"
                  className={errors.contactEmail ? 'border-destructive' : ''}
                />
                {errors.contactEmail && (
                  <p className="text-sm text-destructive">{errors.contactEmail}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone *</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="+250 XXX XXX XXX"
                  className={errors.contactPhone ? 'border-destructive' : ''}
                />
                {errors.contactPhone && (
                  <p className="text-sm text-destructive">{errors.contactPhone}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                size="lg" 
                disabled={isSubmitting}
                className="min-w-[200px]"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Submit Capital Raise Intent
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Educational Note */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-semibold text-amber-900">Educational Simulation</h4>
              <p className="text-sm text-amber-800">
                This is an educational simulation of Rwanda's capital markets process. No real money or regulatory effect. 
                All generated documents will be watermarked "EDUCATION SIMULATION ONLY".
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}