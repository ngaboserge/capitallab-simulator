'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Building2, 
  Target, 
  Info,
  ArrowLeft,
  Plus,
  X,
  CheckCircle,
  School,
  Globe,
  Lock
} from 'lucide-react'

interface TeamFormData {
  name: string
  university: string
  description: string
  maxMembers: number
  focusAreas: string[]
  isPublic: boolean
  expectedDuration: string
  targetSector: string
}

const RWANDA_UNIVERSITIES = [
  'University of Rwanda - Kigali',
  'University of Rwanda - Huye',
  'Adventist University of Central Africa (AUCA)',
  'Kigali Institute of Engineering (KIE)',
  'Institut d\'Enseignement Supérieur de Ruhengeri (INES)',
  'Kigali Independent University (ULK)',
  'Mount Kenya University Rwanda',
  'University of Kigali (UoK)',
  'Rwanda Institute of Higher Education (RIHE)',
  'Other'
]

const FOCUS_AREAS = [
  'Technology & Innovation',
  'Renewable Energy',
  'Agriculture & Food Security',
  'Healthcare & Pharmaceuticals',
  'Infrastructure & Construction',
  'Financial Services',
  'Manufacturing',
  'Tourism & Hospitality',
  'Education',
  'Mining & Natural Resources',
  'Telecommunications',
  'Real Estate'
]

const SECTORS = [
  'Technology',
  'Energy',
  'Agriculture',
  'Healthcare',
  'Infrastructure',
  'Financial Services',
  'Manufacturing',
  'Services',
  'Natural Resources',
  'Mixed Portfolio'
]

export default function CreateTeamPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    university: '',
    description: '',
    maxMembers: 10,
    focusAreas: [],
    isPublic: true,
    expectedDuration: '3-4 months',
    targetSector: ''
  })
  const [newFocusArea, setNewFocusArea] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof TeamFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addFocusArea = (area: string) => {
    if (area && !formData.focusAreas.includes(area)) {
      handleInputChange('focusAreas', [...formData.focusAreas, area])
    }
    setNewFocusArea('')
  }

  const removeFocusArea = (area: string) => {
    handleInputChange('focusAreas', formData.focusAreas.filter(a => a !== area))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required'
    } else if (formData.name.length < 3) {
      newErrors.name = 'Team name must be at least 3 characters'
    }

    if (!formData.university) {
      newErrors.university = 'University selection is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Team description is required'
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters'
    }

    if (formData.maxMembers < 6 || formData.maxMembers > 15) {
      newErrors.maxMembers = 'Team size must be between 6 and 15 members'
    }

    if (formData.focusAreas.length === 0) {
      newErrors.focusAreas = 'Select at least one focus area'
    }

    if (!formData.targetSector) {
      newErrors.targetSector = 'Target sector is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate team ID and invite code
      const teamId = `team_${Date.now()}`
      const inviteCode = Math.random().toString(36).substr(2, 8).toUpperCase()
      
      // In real implementation, this would be an API call
      console.log('Creating team:', { ...formData, teamId, inviteCode })
      
      // Redirect to team dashboard
      router.push(`/teams/${teamId}?created=true`)
      
    } catch (error) {
      console.error('Error creating team:', error)
      setErrors({ submit: 'Failed to create team. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Create New Team</h1>
              <p className="text-muted-foreground">Start your capital markets journey with fellow students</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Team Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Kigali University Capital Markets 2024"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="university">University *</Label>
                  <Select value={formData.university} onValueChange={(value) => handleInputChange('university', value)}>
                    <SelectTrigger className={errors.university ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select your university" />
                    </SelectTrigger>
                    <SelectContent>
                      {RWANDA_UNIVERSITIES.map((uni) => (
                        <SelectItem key={uni} value={uni}>
                          <div className="flex items-center gap-2">
                            <School className="w-4 h-4" />
                            {uni}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.university && <p className="text-sm text-red-600">{errors.university}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Team Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your team's mission, goals, and what kind of companies you want to work with..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                <p className="text-sm text-muted-foreground">
                  {formData.description.length}/500 characters
                </p>
                {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Team Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="maxMembers">Maximum Team Size *</Label>
                  <Select 
                    value={formData.maxMembers.toString()} 
                    onValueChange={(value) => handleInputChange('maxMembers', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((size) => (
                        <SelectItem key={size} value={size.toString()}>
                          {size} members
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Recommended: 8-10 members for optimal role distribution
                  </p>
                  {errors.maxMembers && <p className="text-sm text-red-600">{errors.maxMembers}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectedDuration">Expected Duration</Label>
                  <Select 
                    value={formData.expectedDuration} 
                    onValueChange={(value) => handleInputChange('expectedDuration', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2-3 months">2-3 months</SelectItem>
                      <SelectItem value="3-4 months">3-4 months</SelectItem>
                      <SelectItem value="4-6 months">4-6 months</SelectItem>
                      <SelectItem value="6+ months">6+ months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Team Visibility</Label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleInputChange('isPublic', true)}
                    className={`flex items-center gap-3 p-4 border rounded-lg transition-colors ${
                      formData.isPublic ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <Globe className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium">Public Team</p>
                      <p className="text-sm text-muted-foreground">Anyone can discover and request to join</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('isPublic', false)}
                    className={`flex items-center gap-3 p-4 border rounded-lg transition-colors ${
                      !formData.isPublic ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <Lock className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium">Private Team</p>
                      <p className="text-sm text-muted-foreground">Invite-only via team code</p>
                    </div>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Focus Areas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Focus Areas & Sector
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Focus Areas *</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.focusAreas.map((area) => (
                    <Badge key={area} variant="secondary" className="flex items-center gap-1">
                      {area}
                      <button
                        type="button"
                        onClick={() => removeFocusArea(area)}
                        className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Select value={newFocusArea} onValueChange={setNewFocusArea}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select focus areas" />
                    </SelectTrigger>
                    <SelectContent>
                      {FOCUS_AREAS.filter(area => !formData.focusAreas.includes(area)).map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addFocusArea(newFocusArea)}
                    disabled={!newFocusArea || formData.focusAreas.includes(newFocusArea)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {errors.focusAreas && <p className="text-sm text-red-600">{errors.focusAreas}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetSector">Primary Target Sector *</Label>
                <Select value={formData.targetSector} onValueChange={(value) => handleInputChange('targetSector', value)}>
                  <SelectTrigger className={errors.targetSector ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select primary sector for your deals" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.targetSector && <p className="text-sm text-red-600">{errors.targetSector}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Information Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Next Steps:</strong> After creating your team, you'll receive an invite code to share with 
              potential members. Each team member will be assigned one of 7 institutional roles: Issuer, IB Advisor, 
              CMA Regulator, SHORA Exchange Listing Desk, Licensed Broker, Investor, and CSD Operator.
            </AlertDescription>
          </Alert>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Team...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Create Team
                </>
              )}
            </Button>
          </div>

          {errors.submit && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {errors.submit}
              </AlertDescription>
            </Alert>
          )}
        </form>
      </div>
    </div>
  )
}