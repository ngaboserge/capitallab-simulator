'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  Users, 
  Building2, 
  Briefcase, 
  Shield, 
  Award,
  Database,
  TrendingUp,
  Settings,
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  UserCheck,
  Shuffle,
  Info,
  X
} from 'lucide-react'

interface RoleDefinition {
  id: string
  name: string
  shortName: string
  description: string
  responsibilities: string[]
  icon: any
  color: string
  maxMembers: number
  requiredSkills: string[]
  workload: 'Light' | 'Medium' | 'Heavy'
}

interface TeamMember {
  id: string
  name: string
  email: string
  currentRole?: string
  preferredRoles: string[]
  skills: string[]
  availability: string
  isOnline: boolean
  joinedAt: Date
}

interface RoleAssignment {
  roleId: string
  assignedMembers: TeamMember[]
  isComplete: boolean
  priority: number
}

const INSTITUTIONAL_ROLES: RoleDefinition[] = [
  {
    id: 'issuer',
    name: 'Issuer (Company)',
    shortName: 'Issuer',
    description: 'Represents the company seeking to raise capital through the markets',
    responsibilities: [
      'Submit capital raise intent and business plan',
      'Respond to due diligence requests',
      'Provide financial statements and projections',
      'Work with IB Advisor on deal structuring',
      'Present to potential investors'
    ],
    icon: Building2,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    maxMembers: 2,
    requiredSkills: ['Business Planning', 'Financial Analysis', 'Presentation'],
    workload: 'Heavy'
  },
  {
    id: 'ib_advisor',
    name: 'Investment Bank Advisor',
    shortName: 'IB Advisor',
    description: 'Structures deals and manages the capital raising process on behalf of issuers',
    responsibilities: [
      'Structure the capital raising deal',
      'Prepare regulatory filings and prospectus',
      'Conduct due diligence on the issuer',
      'Coordinate with all market participants',
      'Manage the IPO/listing process'
    ],
    icon: Briefcase,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    maxMembers: 2,
    requiredSkills: ['Financial Modeling', 'Regulatory Knowledge', 'Project Management'],
    workload: 'Heavy'
  },
  {
    id: 'regulator',
    name: 'CMA Regulator',
    shortName: 'Regulator',
    description: 'Reviews and approves all regulatory filings to ensure market integrity',
    responsibilities: [
      'Review regulatory filings for compliance',
      'Assess risk and investor protection measures',
      'Issue approval or rejection decisions',
      'Monitor ongoing compliance requirements',
      'Ensure market transparency and fairness'
    ],
    icon: Shield,
    color: 'bg-red-100 text-red-800 border-red-200',
    maxMembers: 1,
    requiredSkills: ['Regulatory Knowledge', 'Risk Assessment', 'Legal Analysis'],
    workload: 'Medium'
  },
  {
    id: 'listing_desk',
    name: 'SHORA Exchange Listing Desk',
    shortName: 'Listing Desk',
    description: 'Manages the stock exchange listing process and creates trading instruments',
    responsibilities: [
      'Review listing applications',
      'Assign ticker symbols and ISINs',
      'Set up trading infrastructure',
      'Coordinate listing ceremonies',
      'Monitor post-listing compliance'
    ],
    icon: Award,
    color: 'bg-green-100 text-green-800 border-green-200',
    maxMembers: 1,
    requiredSkills: ['Market Operations', 'Technical Systems', 'Compliance'],
    workload: 'Medium'
  },
  {
    id: 'broker',
    name: 'Licensed Broker',
    shortName: 'Broker',
    description: 'Provides market access to investors and executes trades',
    responsibilities: [
      'Onboard and verify investor accounts',
      'Execute buy/sell orders for clients',
      'Provide market research and advice',
      'Ensure best execution practices',
      'Manage client relationships'
    ],
    icon: Users,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    maxMembers: 2,
    requiredSkills: ['Client Management', 'Trading Systems', 'Market Analysis'],
    workload: 'Medium'
  },
  {
    id: 'investor',
    name: 'Investor',
    shortName: 'Investor',
    description: 'Provides capital by purchasing securities through licensed brokers',
    responsibilities: [
      'Analyze investment opportunities',
      'Make investment decisions',
      'Place orders through brokers',
      'Monitor portfolio performance',
      'Participate in shareholder activities'
    ],
    icon: TrendingUp,
    color: 'bg-teal-100 text-teal-800 border-teal-200',
    maxMembers: 3,
    requiredSkills: ['Investment Analysis', 'Portfolio Management', 'Market Research'],
    workload: 'Light'
  },
  {
    id: 'csd_operator',
    name: 'CSD Operator',
    shortName: 'CSD',
    description: 'Maintains the authoritative registry of securities ownership',
    responsibilities: [
      'Maintain securities ownership records',
      'Process settlement instructions',
      'Handle corporate actions',
      'Provide custody services',
      'Generate ownership reports'
    ],
    icon: Database,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    maxMembers: 1,
    requiredSkills: ['Data Management', 'Settlement Systems', 'Record Keeping'],
    workload: 'Light'
  }
]

export default function TeamRolesPage() {
  const params = useParams()
  const router = useRouter()
  const teamId = params.teamId as string

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [roleAssignments, setRoleAssignments] = useState<RoleAssignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAssigning, setIsAssigning] = useState(false)
  const [currentUserId, setCurrentUserId] = useState('user_1') // Mock current user
  const [updatingMember, setUpdatingMember] = useState<string | null>(null)

  useEffect(() => {
    // Mock data - replace with actual API calls
    const mockMembers: TeamMember[] = [
      {
        id: 'user_1',
        name: 'Alice Uwimana',
        email: 'alice@ur.ac.rw',
        currentRole: 'issuer',
        preferredRoles: ['issuer', 'ib_advisor'],
        skills: ['Business Planning', 'Financial Analysis', 'Presentation'],
        availability: 'Full-time',
        isOnline: true,
        joinedAt: new Date('2024-10-01')
      },
      {
        id: 'user_2',
        name: 'Jean Baptiste',
        email: 'jean@ur.ac.rw',
        currentRole: 'ib_advisor',
        preferredRoles: ['ib_advisor', 'regulator'],
        skills: ['Financial Modeling', 'Regulatory Knowledge', 'Project Management'],
        availability: 'Full-time',
        isOnline: true,
        joinedAt: new Date('2024-10-01')
      },
      {
        id: 'user_3',
        name: 'Grace Mukamana',
        email: 'grace@ur.ac.rw',
        preferredRoles: ['regulator', 'listing_desk'],
        skills: ['Regulatory Knowledge', 'Risk Assessment', 'Legal Analysis'],
        availability: 'Part-time',
        isOnline: false,
        joinedAt: new Date('2024-10-02')
      },
      {
        id: 'user_4',
        name: 'David Nkurunziza',
        email: 'david@ur.ac.rw',
        preferredRoles: ['listing_desk', 'broker'],
        skills: ['Market Operations', 'Technical Systems', 'Compliance'],
        availability: 'Full-time',
        isOnline: true,
        joinedAt: new Date('2024-10-02')
      },
      {
        id: 'user_5',
        name: 'Sarah Ingabire',
        email: 'sarah@ur.ac.rw',
        preferredRoles: ['broker', 'investor'],
        skills: ['Client Management', 'Trading Systems', 'Market Analysis'],
        availability: 'Full-time',
        isOnline: true,
        joinedAt: new Date('2024-10-03')
      },
      {
        id: 'user_6',
        name: 'Eric Habimana',
        email: 'eric@ur.ac.rw',
        preferredRoles: ['investor'],
        skills: ['Investment Analysis', 'Portfolio Management', 'Market Research'],
        availability: 'Part-time',
        isOnline: false,
        joinedAt: new Date('2024-10-03')
      },
      {
        id: 'user_7',
        name: 'Marie Nyirahabimana',
        email: 'marie@ur.ac.rw',
        preferredRoles: ['investor', 'csd_operator'],
        skills: ['Investment Analysis', 'Data Management'],
        availability: 'Full-time',
        isOnline: true,
        joinedAt: new Date('2024-10-04')
      },
      {
        id: 'user_8',
        name: 'Patrick Nzeyimana',
        email: 'patrick@ur.ac.rw',
        preferredRoles: ['csd_operator', 'broker'],
        skills: ['Data Management', 'Settlement Systems', 'Record Keeping'],
        availability: 'Full-time',
        isOnline: true,
        joinedAt: new Date('2024-10-04')
      }
    ]

    // Initialize role assignments
    const assignments: RoleAssignment[] = INSTITUTIONAL_ROLES.map(role => ({
      roleId: role.id,
      assignedMembers: mockMembers.filter(member => member.currentRole === role.id),
      isComplete: false,
      priority: role.id === 'issuer' ? 1 : role.id === 'ib_advisor' ? 2 : 3
    }))

    // Check if roles are complete
    assignments.forEach(assignment => {
      const role = INSTITUTIONAL_ROLES.find(r => r.id === assignment.roleId)
      if (role) {
        assignment.isComplete = assignment.assignedMembers.length >= 1 && 
                               assignment.assignedMembers.length <= role.maxMembers
      }
    })

    setTimeout(() => {
      setTeamMembers(mockMembers)
      setRoleAssignments(assignments)
      setIsLoading(false)
    }, 1000)
  }, [teamId])

  const handleRoleAssignment = (memberId: string, roleId: string) => {
    setUpdatingMember(memberId)
    
    // Simulate a brief loading state for better UX
    setTimeout(() => {
      // Update team members
      setTeamMembers(prev => prev.map(member => 
        member.id === memberId 
          ? { ...member, currentRole: roleId || undefined }
          : member
      ))

      // Update role assignments
      setRoleAssignments(prev => {
        // First, remove member from all roles
        let updatedAssignments = prev.map(assignment => ({
          ...assignment,
          assignedMembers: assignment.assignedMembers.filter(m => m.id !== memberId)
        }))

        // If roleId is provided (not empty), add member to new role
        if (roleId) {
          updatedAssignments = updatedAssignments.map(assignment => {
            if (assignment.roleId === roleId) {
              const member = teamMembers.find(m => m.id === memberId)
              if (member) {
                const role = INSTITUTIONAL_ROLES.find(r => r.id === roleId)
                if (role && assignment.assignedMembers.filter(m => m.id !== memberId).length < role.maxMembers) {
                  const updatedMember = { ...member, currentRole: roleId }
                  return {
                    ...assignment,
                    assignedMembers: [...assignment.assignedMembers.filter(m => m.id !== memberId), updatedMember],
                    isComplete: true
                  }
                }
              }
            }
            return assignment
          })
        }

        // Update completion status for all roles
        return updatedAssignments.map(assignment => ({
          ...assignment,
          isComplete: assignment.assignedMembers.length >= 1
        }))
      })
      
      setUpdatingMember(null)
    }, 300)
  }

  const handleAutoAssign = () => {
    setIsAssigning(true)
    
    // Simple auto-assignment algorithm based on preferences and skills
    setTimeout(() => {
      // Get current state of unassigned members
      const currentUnassigned = teamMembers.filter(m => !m.currentRole)
      
      // Process each unassigned member
      currentUnassigned.forEach(member => {
        // Find available roles (roles that aren't at max capacity)
        const availableRoles = INSTITUTIONAL_ROLES.filter(role => {
          const assignment = roleAssignments.find(a => a.roleId === role.id)
          return assignment && assignment.assignedMembers.length < role.maxMembers
        })

        // Try to assign based on preferences first
        let assigned = false
        for (const preferredRoleId of member.preferredRoles) {
          const availableRole = availableRoles.find(role => role.id === preferredRoleId)
          if (availableRole) {
            handleRoleAssignment(member.id, availableRole.id)
            assigned = true
            break
          }
        }

        // If no preferred role available, assign to any available role
        if (!assigned && availableRoles.length > 0) {
          handleRoleAssignment(member.id, availableRoles[0].id)
        }
      })

      setIsAssigning(false)
    }, 1500)
  }

  const handleSaveAssignments = () => {
    // Save role assignments to backend
    console.log('Saving role assignments:', roleAssignments)
    router.push(`/teams/${teamId}`)
  }

  const getUnassignedMembers = () => {
    return teamMembers.filter(member => !member.currentRole)
  }

  const getRoleProgress = () => {
    const totalRoles = INSTITUTIONAL_ROLES.length
    const completedRoles = roleAssignments.filter(a => a.isComplete).length
    return (completedRoles / totalRoles) * 100
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading team roles...</p>
        </div>
      </div>
    )
  }

  const unassignedMembers = getUnassignedMembers()
  const progressPercentage = getRoleProgress()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Team
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Role Assignment</h1>
                <p className="text-muted-foreground">Assign institutional roles to team members</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="font-bold">{Math.round(progressPercentage)}% Complete</p>
              </div>
              
              {unassignedMembers.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={handleAutoAssign}
                  disabled={isAssigning}
                >
                  {isAssigning ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                      Auto-Assigning...
                    </>
                  ) : (
                    <>
                      <Shuffle className="w-4 h-4 mr-2" />
                      Auto-Assign
                    </>
                  )}
                </Button>
              )}
              
              <Button 
                onClick={handleSaveAssignments}
                disabled={progressPercentage < 100}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Save Assignments
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Assignment Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Role Assignment Progress</span>
              <span className="font-bold">{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            
            {unassignedMembers.length > 0 && (
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>{unassignedMembers.length} members</strong> still need role assignments: {' '}
                  {unassignedMembers.map(m => m.name).join(', ')}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Role Assignment Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {INSTITUTIONAL_ROLES.map((role) => {
            const assignment = roleAssignments.find(a => a.roleId === role.id)
            const Icon = role.icon
            
            return (
              <Card key={role.id} className={`border-2 ${assignment?.isComplete ? 'border-green-200 bg-green-50' : 'border-border'}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${role.color.replace('text-', 'text-white ').replace('bg-', 'bg-').split(' ')[0]}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {assignment?.assignedMembers.length || 0}/{role.maxMembers} assigned
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={role.color}>
                        {role.workload}
                      </Badge>
                      {assignment?.isComplete && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                  
                  {/* Required Skills */}
                  <div>
                    <p className="text-sm font-medium mb-2">Required Skills:</p>
                    <div className="flex flex-wrap gap-1">
                      {role.requiredSkills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Key Responsibilities */}
                  <div>
                    <p className="text-sm font-medium mb-2">Key Responsibilities:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {role.responsibilities.slice(0, 3).map((resp, index) => (
                        <li key={index}>• {resp}</li>
                      ))}
                      {role.responsibilities.length > 3 && (
                        <li>• +{role.responsibilities.length - 3} more...</li>
                      )}
                    </ul>
                  </div>

                  {/* Assigned Members */}
                  <div>
                    <p className="text-sm font-medium mb-2">Assigned Members:</p>
                    <div className="space-y-2">
                      {assignment?.assignedMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-2 bg-white rounded border">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{member.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Skills: {member.skills.filter(skill => role.requiredSkills.includes(skill)).join(', ') || 'Learning'}
                              </p>
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRoleAssignment(member.id, '')}
                            disabled={updatingMember === member.id}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {updatingMember === member.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1"></div>
                            ) : (
                              <X className="w-3 h-3 mr-1" />
                            )}
                            Remove
                          </Button>
                        </div>
                      ))}
                      
                      {/* Available slots */}
                      {assignment && assignment.assignedMembers.length < role.maxMembers && (
                        <div className="border-2 border-dashed border-gray-200 rounded p-2">
                          <p className="text-xs text-muted-foreground text-center">
                            {role.maxMembers - assignment.assignedMembers.length} slot(s) available
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Assignment Actions */}
                  {assignment && assignment.assignedMembers.length < role.maxMembers && (
                    <div>
                      <p className="text-sm font-medium mb-2">Available Members:</p>
                      <div className="space-y-1">
                        {/* Show preferred members first */}
                        {getUnassignedMembers()
                          .filter(member => member.preferredRoles.includes(role.id))
                          .map((member) => (
                            <Button
                              key={member.id}
                              size="sm"
                              variant="outline"
                              onClick={() => handleRoleAssignment(member.id, role.id)}
                              disabled={updatingMember === member.id}
                              className="w-full justify-start text-left border-green-200 hover:bg-green-50"
                            >
                              {updatingMember === member.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600 mr-2"></div>
                              ) : (
                                <UserCheck className="w-3 h-3 mr-2 text-green-600" />
                              )}
                              <div className="flex-1 text-left">
                                <p className="font-medium">{member.name}</p>
                                <p className="text-xs text-green-600">Preferred role</p>
                              </div>
                            </Button>
                          ))}
                        
                        {/* Show other available members */}
                        {getUnassignedMembers()
                          .filter(member => !member.preferredRoles.includes(role.id))
                          .map((member) => (
                            <Button
                              key={member.id}
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRoleAssignment(member.id, role.id)}
                              disabled={updatingMember === member.id}
                              className="w-full justify-start text-left hover:bg-gray-50"
                            >
                              {updatingMember === member.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-2"></div>
                              ) : (
                                <Users className="w-3 h-3 mr-2 text-gray-400" />
                              )}
                              <div className="flex-1 text-left">
                                <p className="font-medium text-gray-700">{member.name}</p>
                                <p className="text-xs text-gray-500">Available</p>
                              </div>
                            </Button>
                          ))}
                        
                        {getUnassignedMembers().length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            No unassigned members available
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Information Panel */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Role Assignment Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Assignment Priorities:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>1. <strong>Member Preferences</strong> - Assign based on stated preferences</li>
                  <li>2. <strong>Skill Matching</strong> - Match skills to role requirements</li>
                  <li>3. <strong>Workload Balance</strong> - Distribute heavy workload roles evenly</li>
                  <li>4. <strong>Team Dynamics</strong> - Consider collaboration compatibility</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Role Requirements:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Each role must have at least 1 member assigned</li>
                  <li>• Some roles allow multiple members (Issuer, IB Advisor, Broker, Investor)</li>
                  <li>• Critical roles (Regulator, Listing Desk, CSD) are single-member</li>
                  <li>• All team members must have exactly one role</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}