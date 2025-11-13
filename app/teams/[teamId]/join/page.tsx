'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Building2, 
  Briefcase, 
  Shield, 
  Award,
  Database,
  TrendingUp,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Star,
  Clock,
  Target
} from 'lucide-react'

interface TeamInfo {
  id: string
  name: string
  university: string
  description: string
  memberCount: number
  maxMembers: number
  status: string
  currentDeal?: string
}

interface RoleOption {
  id: string
  name: string
  shortName: string
  description: string
  icon: any
  color: string
  workload: string
  availableSlots: number
  maxSlots: number
  responsibilities: string[]
  requiredSkills: string[]
}

interface JoinRequest {
  preferredRoles: string[]
  skills: string[]
  availability: string
  experience: string
  motivation: string
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'issuer',
    name: 'Issuer (Company)',
    shortName: 'Issuer',
    description: 'Represent the company seeking capital',
    icon: Building2,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    workload: 'Heavy',
    availableSlots: 1,
    maxSlots: 2,
    responsibilities: [
      'Submit capital raise intent',
      'Provide financial statements',
      'Present to investors',
      'Work with IB Advisor'
    ],
    requiredSkills: ['Business Planning', 'Financial Analysis', 'Presentation']
  },
  {
    id: 'ib_advisor',
    name: 'Investment Bank Advisor',
    shortName: 'IB Advisor',
    description: 'Structure deals and manage the process',
    icon: Briefcase,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    workload: 'Heavy',
    availableSlots: 1,
    maxSlots: 2,
    responsibilities: [
      'Structure capital raising deals',
      'Prepare regulatory filings',
      'Conduct due diligence',
      'Coordinate with all parties'
    ],
    requiredSkills: ['Financial Modeling', 'Regulatory Knowledge', 'Project Management']
  },
  {
    id: 'regulator',
    name: 'CMA Regulator',
    shortName: 'Regulator',
    description: 'Review and approve regulatory filings',
    icon: Shield,
    color: 'bg-red-100 text-red-800 border-red-200',
    workload: 'Medium',
    availableSlots: 0,
    maxSlots: 1,
    responsibilities: [
      'Review regulatory compliance',
      'Assess investor protection',
      'Issue approval decisions',
      'Monitor ongoing compliance'
    ],
    requiredSkills: ['Regulatory Knowledge', 'Risk Assessment', 'Legal Analysis']
  },
  {
    id: 'listing_desk',
    name: 'SHORA Exchange Listing Desk',
    shortName: 'Listing Desk',
    description: 'Manage stock exchange listings',
    icon: Award,
    color: 'bg-green-100 text-green-800 border-green-200',
    workload: 'Medium',
    availableSlots: 1,
    maxSlots: 1,
    responsibilities: [
      'Review listing applications',
      'Assign ticker symbols',
      'Set up trading infrastructure',
      'Monitor post-listing compliance'
    ],
    requiredSkills: ['Market Operations', 'Technical Systems', 'Compliance']
  },
  {
    id: 'broker',
    name: 'Licensed Broker',
    shortName: 'Broker',
    description: 'Provide market access to investors',
    icon: Users,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    workload: 'Medium',
    availableSlots: 2,
    maxSlots: 2,
    responsibilities: [
      'Onboard investor accounts',
      'Execute trades for clients',
      'Provide market research',
      'Manage client relationships'
    ],
    requiredSkills: ['Client Management', 'Trading Systems', 'Market Analysis']
  },
  {
    id: 'investor',
    name: 'Investor',
    shortName: 'Investor',
    description: 'Provide capital by purchasing securities',
    icon: TrendingUp,
    color: 'bg-teal-100 text-teal-800 border-teal-200',
    workload: 'Light',
    availableSlots: 2,
    maxSlots: 3,
    responsibilities: [
      'Analyze investment opportunities',
      'Make investment decisions',
      'Place orders through brokers',
      'Monitor portfolio performance'
    ],
    requiredSkills: ['Investment Analysis', 'Portfolio Management', 'Market Research']
  },
  {
    id: 'csd_operator',
    name: 'CSD Operator',
    shortName: 'CSD',
    description: 'Maintain securities ownership records',
    icon: Database,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    workload: 'Light',
    availableSlots: 1,
    maxSlots: 1,
    responsibilities: [
      'Maintain ownership records',
      'Process settlements',
      'Handle corporate actions',
      'Generate reports'
    ],
    requiredSkills: ['Data Management', 'Settlement Systems', 'Record Keeping']
  }
]

const SKILL_OPTIONS = [
  'Business Planning', 'Financial Analysis', 'Financial Modeling', 'Presentation',
  'Regulatory Knowledge', 'Risk Assessment', 'Legal Analysis', 'Project Management',
  'Market Operations', 'Technical Systems', 'Compliance', 'Client Management',
  'Trading Systems', 'Market Analysis', 'Investment Analysis', 'Portfolio Management',
  'Market Research', 'Data Management', 'Settlement Systems', 'Record Keeping'
]

export default function JoinTeamPage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params.teamId as string

  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null)
  const [joinRequest, setJoinRequest] = useState<JoinRequest>({
    preferredRoles: [],
    skills: [],
    availability: 'Full-time',
    experience: '',
    motivation: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockTeamInfo: TeamInfo = {
      id: teamId,
      name: "Kigali University Capital Markets 2024",
      university: "University of Rwanda - Kigali",
      description: "Focused on renewable energy and sustainable development projects in Rwanda. Our mission is to understand how green energy companies can access capital markets while contributing to Rwanda's Vision 2050.",
      memberCount: 6,
      maxMembers: 10,
      status: 'forming',
      currentDeal: undefined
    }

    setTimeout(() => {
      setTeamInfo(mockTeamInfo)
      setIsLoading(false)
    }, 1000)
  }, [teamId])

  const handleRoleToggle = (roleId: string) => {
    setJoinRequest(prev => ({
      ...prev,
      preferredRoles: prev.preferredRoles.includes(roleId)
        ? prev.preferredRoles.filter(id => id !== roleId)
        : [...prev.preferredRoles, roleId]
    }))
    
    if (errors.preferredRoles) {
      setErrors(prev => ({ ...prev, preferredRoles: '' }))
    }
  }

  const handleSkillToggle = (skill: string) => {
    setJoinRequest(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (joinRequest.preferredRoles.length === 0) {
      newErrors.preferredRoles = 'Please select at least one preferred role'
    }

    if (joinRequest.skills.length === 0) {
      newErrors.skills = 'Please select at least one skill'
    }

    if (!joinRequest.motivation.trim()) {
      newErrors.motivation = 'Please explain why you want to join this team'
    } else if (joinRequest.motivation.length < 50) {
      newErrors.motivation = 'Please provide a more detailed explanation (at least 50 characters)'
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
      
      // In real implementation, this would send join request to backend
      console.log('Submitting join request:', joinRequest)
      
      // Redirect to team page with success message
      router.push(`/teams/${teamId}?joined=pending`)
      
    } catch (error) {
      console.error('Error submitting join request:', error)
      setErrors({ submit: 'Failed to submit join request. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading team information...</p>
        </div>
      </div>
    )
  }

  if (!teamInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Team not found or no longer accepting members.</AlertDescription>
        </Alert>
      </div>
    )
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
              <h1 className="text-2xl font-bold text-foreground">Join Team</h1>
              <p className="text-muted-foreground">Apply to join {teamInfo.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Team Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {teamInfo.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">University</p>
                <p className="font-medium">{teamInfo.university}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Team Size</p>
                <p className="font-medium">{teamInfo.memberCount}/{teamInfo.maxMembers} members</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className="bg-yellow-100 text-yellow-800">{teamInfo.status}</Badge>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-sm">{teamInfo.description}</p>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Role Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Role Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select the roles you're interested in. You can choose multiple roles, and we'll try to match you based on availability and your skills.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ROLE_OPTIONS.map((role) => {
                  const Icon = role.icon
                  const isSelected = joinRequest.preferredRoles.includes(role.id)
                  const isAvailable = role.availableSlots > 0
                  
                  return (
                    <div
                      key={role.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-primary bg-primary/5' 
                          : isAvailable 
                            ? 'border-border hover:border-primary/50' 
                            : 'border-border bg-gray-50 opacity-60'
                      }`}
                      onClick={() => isAvailable && handleRoleToggle(role.id)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${role.color.replace('text-', 'text-white ').replace('bg-', 'bg-').split(' ')[0]}`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium">{role.shortName}</h3>
                            <p className="text-xs text-muted-foreground">{role.workload} workload</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {isSelected && <Star className="w-4 h-4 text-primary fill-primary" />}
                          <Badge variant={isAvailable ? "outline" : "secondary"} className="text-xs">
                            {role.availableSlots}/{role.maxSlots} slots
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
                      
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-medium">Key Responsibilities:</p>
                          <ul className="text-xs text-muted-foreground">
                            {role.responsibilities.slice(0, 2).map((resp, index) => (
                              <li key={index}>• {resp}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <p className="text-xs font-medium">Required Skills:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {role.requiredSkills.slice(0, 3).map((skill) => (
                              <Badge key={skill} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {!isAvailable && (
                        <div className="mt-2 text-xs text-red-600 font-medium">
                          Role currently full
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              
              {errors.preferredRoles && (
                <p className="text-sm text-red-600">{errors.preferredRoles}</p>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Your Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select the skills you have or are learning. This helps us match you to the most suitable role.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {SKILL_OPTIONS.map((skill) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={skill}
                      checked={joinRequest.skills.includes(skill)}
                      onCheckedChange={() => handleSkillToggle(skill)}
                    />
                    <Label htmlFor={skill} className="text-sm cursor-pointer">
                      {skill}
                    </Label>
                  </div>
                ))}
              </div>
              
              {errors.skills && (
                <p className="text-sm text-red-600">{errors.skills}</p>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <select
                  id="availability"
                  value={joinRequest.availability}
                  onChange={(e) => setJoinRequest(prev => ({ ...prev, availability: e.target.value }))}
                  className="w-full p-2 border border-border rounded-md"
                >
                  <option value="Full-time">Full-time (20+ hours/week)</option>
                  <option value="Part-time">Part-time (10-20 hours/week)</option>
                  <option value="Limited">Limited (5-10 hours/week)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Relevant Experience (Optional)</Label>
                <Textarea
                  id="experience"
                  placeholder="Describe any relevant experience in finance, business, or related fields..."
                  value={joinRequest.experience}
                  onChange={(e) => setJoinRequest(prev => ({ ...prev, experience: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivation">Why do you want to join this team? *</Label>
                <Textarea
                  id="motivation"
                  placeholder="Explain your motivation for joining this team and what you hope to learn or contribute..."
                  value={joinRequest.motivation}
                  onChange={(e) => setJoinRequest(prev => ({ ...prev, motivation: e.target.value }))}
                  rows={4}
                  className={errors.motivation ? 'border-red-500' : ''}
                />
                <p className="text-sm text-muted-foreground">
                  {joinRequest.motivation.length}/500 characters
                </p>
                {errors.motivation && (
                  <p className="text-sm text-red-600">{errors.motivation}</p>
                )}
              </div>
            </CardContent>
          </Card>

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
                  Submitting Request...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Submit Join Request
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