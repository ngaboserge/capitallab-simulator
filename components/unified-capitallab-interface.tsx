'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { 
  Building2, 
  Briefcase, 
  Users, 
  TrendingUp, 
  Shield, 
  Database,
  Award,
  ArrowRight,
  ArrowDown,
  CheckCircle,
  Clock,
  BookOpen,
  Play,
  Eye,
  Target,
  Zap,
  GraduationCap,
  Star
} from 'lucide-react'

interface InstitutionalLevel {
  level: number
  name: string
  description: string
  roles: InstitutionalRole[]
  color: string
  bgColor: string
}

interface InstitutionalRole {
  id: string
  name: string
  shortName: string
  description: string
  keyActions: string[]
  learningObjectives: string[]
  icon: any
  status: 'locked' | 'available' | 'in_progress' | 'completed'
  progress: number
  route: string
}

const INSTITUTIONAL_LEVELS: InstitutionalLevel[] = [
  {
    level: 1,
    name: 'Market Oversight',
    description: 'Regulatory and supervisory institutions ensuring market integrity',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200',
    roles: [
      {
        id: 'regulator',
        name: 'CMA Regulator',
        shortName: 'CMA',
        description: 'Reviews and approves all market activities',
        keyActions: ['Review filings', 'Issue approvals', 'Monitor compliance'],
        learningObjectives: ['Understand regulatory framework', 'Learn approval processes', 'Master compliance requirements'],
        icon: Shield,
        status: 'available',
        progress: 0,
        route: '/capitallab/regulator'
      }
    ]
  },
  {
    level: 2,
    name: 'Market Infrastructure',
    description: 'Core market infrastructure providing listing and registry services',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200',
    roles: [
      {
        id: 'listing_desk',
        name: 'RSE Listing Desk',
        shortName: 'RSE',
        description: 'Manages instrument listings and ISIN creation',
        keyActions: ['Create ISINs', 'List instruments', 'Manage trading sessions'],
        learningObjectives: ['Understand listing process', 'Learn ISIN creation', 'Master market operations'],
        icon: Award,
        status: 'locked',
        progress: 0,
        route: '/capitallab/listing-desk'
      },
      {
        id: 'csd',
        name: 'CSD Registry',
        shortName: 'CSD',
        description: 'Maintains authoritative ownership records',
        keyActions: ['Maintain registry', 'Process settlements', 'Issue certificates'],
        learningObjectives: ['Understand settlement process', 'Learn registry management', 'Master ownership tracking'],
        icon: Database,
        status: 'locked',
        progress: 0,
        route: '/capitallab/csd'
      }
    ]
  },
  {
    level: 3,
    name: 'Market Intermediaries',
    description: 'Professional intermediaries facilitating market access',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
    roles: [
      {
        id: 'ib_advisor',
        name: 'Investment Bank Advisor',
        shortName: 'IB',
        description: 'Structures deals and manages regulatory process',
        keyActions: ['Structure deals', 'Prepare filings', 'Manage allocations'],
        learningObjectives: ['Learn deal structuring', 'Understand regulatory filing', 'Master client management'],
        icon: Briefcase,
        status: 'available',
        progress: 25,
        route: '/capitallab/ib-advisor'
      },
      {
        id: 'broker',
        name: 'Licensed Broker',
        shortName: 'Broker',
        description: 'Provides investor access and trade execution',
        keyActions: ['Activate investors', 'Execute trades', 'Manage portfolios'],
        learningObjectives: ['Learn investor onboarding', 'Understand trade execution', 'Master client services'],
        icon: Users,
        status: 'available',
        progress: 60,
        route: '/capitallab/broker'
      }
    ]
  },
  {
    level: 4,
    name: 'Market Participants',
    description: 'End users of the capital markets system',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
    roles: [
      {
        id: 'issuer',
        name: 'Issuer',
        shortName: 'Company',
        description: 'Seeks capital for business growth',
        keyActions: ['Submit intent', 'Provide documents', 'Respond to requests'],
        learningObjectives: ['Understand capital needs', 'Learn documentation requirements', 'Master compliance'],
        icon: Building2,
        status: 'completed',
        progress: 100,
        route: '/capitallab/issuer'
      },
      {
        id: 'investor',
        name: 'Investor',
        shortName: 'Investor',
        description: 'Provides capital and seeks returns',
        keyActions: ['Request activation', 'Place orders', 'Monitor portfolio'],
        learningObjectives: ['Learn investment process', 'Understand risk management', 'Master portfolio tracking'],
        icon: TrendingUp,
        status: 'in_progress',
        progress: 40,
        route: '/capitallab/investor'
      }
    ]
  }
]

interface UnifiedCapitalLabInterfaceProps {
  userId?: string
  showEducationalContent?: boolean
}

export function UnifiedCapitalLabInterface({ userId, showEducationalContent = true }: UnifiedCapitalLabInterfaceProps) {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [showLearningPath, setShowLearningPath] = useState(false)
  const [userProgress, setUserProgress] = useState({
    completedRoles: ['issuer'],
    currentRole: 'investor',
    totalProgress: 35,
    unlockedLevels: [1, 3, 4]
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />
      case 'available':
        return <Play className="w-4 h-4 text-orange-600" />
      default:
        return <Target className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      completed: { variant: 'default' as const, label: 'Completed', color: 'bg-green-100 text-green-800' },
      in_progress: { variant: 'default' as const, label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
      available: { variant: 'secondary' as const, label: 'Available', color: 'bg-orange-100 text-orange-800' },
      locked: { variant: 'outline' as const, label: 'Locked', color: 'bg-gray-100 text-gray-600' }
    }
    
    return (
      <Badge className={config[status as keyof typeof config].color}>
        {config[status as keyof typeof config].label}
      </Badge>
    )
  }

  const isLevelUnlocked = (level: number) => {
    return userProgress.unlockedLevels.includes(level)
  }

  const handleRoleClick = (role: InstitutionalRole) => {
    if (role.status === 'locked') return
    
    setSelectedRole(selectedRole === role.id ? null : role.id)
  }

  const handleEnterRole = (role: InstitutionalRole) => {
    if (role.status === 'locked') return
    router.push(role.route)
  }

  return (
    <div className="space-y-8">
      {/* Header with Progress */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-3xl font-bold text-foreground">CapitalLab</h1>
            <p className="text-muted-foreground">Rwanda Capital Markets Education</p>
          </div>
        </div>

        {/* Overall Progress */}
        <Card className="max-w-md mx-auto bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Learning Progress</span>
              <span className="text-sm text-muted-foreground">{userProgress.totalProgress}%</span>
            </div>
            <Progress value={userProgress.totalProgress} className="h-2 mb-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{userProgress.completedRoles.length} roles completed</span>
              <span>{INSTITUTIONAL_LEVELS.reduce((sum, level) => sum + level.roles.length, 0)} total roles</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {showEducationalContent && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push('/capitallab/learn')}>
            <CardContent className="p-4 text-center">
              <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-green-900">Learn Concepts</h3>
              <p className="text-sm text-green-700">Start with fundamentals</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setShowLearningPath(!showLearningPath)}>
            <CardContent className="p-4 text-center">
              <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-900">Learning Path</h3>
              <p className="text-sm text-blue-700">See your journey</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push('/capitallab/workflow')}>
            <CardContent className="p-4 text-center">
              <Eye className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-900">Live Workflows</h3>
              <p className="text-sm text-purple-700">See processes in action</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Institutional Hierarchy - Unified View */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Institutional Hierarchy & Roles</h2>
          <p className="text-muted-foreground">
            Explore Rwanda's capital markets from regulatory oversight to market participation
          </p>
        </div>

        {/* Hierarchy Levels */}
        <div className="space-y-4">
          {INSTITUTIONAL_LEVELS.map((level, levelIndex) => {
            const isUnlocked = isLevelUnlocked(level.level)
            
            return (
              <div key={level.level} className="space-y-3">
                {/* Level Header */}
                <Card className={`${level.bgColor} ${!isUnlocked ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                          isUnlocked ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-400'
                        }`}>
                          {level.level}
                        </div>
                        <div>
                          <CardTitle className={`text-lg ${level.color}`}>{level.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{level.description}</p>
                        </div>
                      </div>
                      {!isUnlocked && (
                        <Badge variant="outline" className="text-gray-500">
                          Locked
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                </Card>

                {/* Roles in this Level */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
                  {level.roles.map((role) => {
                    const RoleIcon = role.icon
                    const isSelected = selectedRole === role.id
                    const isRoleUnlocked = isUnlocked && role.status !== 'locked'
                    
                    return (
                      <Card 
                        key={role.id}
                        className={`transition-all cursor-pointer ${
                          !isRoleUnlocked 
                            ? 'opacity-50 cursor-not-allowed' 
                            : isSelected 
                              ? 'ring-2 ring-primary shadow-lg scale-[1.02]' 
                              : 'hover:shadow-md hover:scale-[1.01]'
                        }`}
                        onClick={() => handleRoleClick(role)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white rounded-lg shadow-sm">
                                <RoleIcon className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-base">{role.shortName}</CardTitle>
                                <p className="text-xs text-muted-foreground">{role.name}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(role.status)}
                              {getStatusBadge(role.status)}
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
                          
                          {/* Progress Bar */}
                          {role.progress > 0 && (
                            <div className="mb-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Progress</span>
                                <span>{role.progress}%</span>
                              </div>
                              <Progress value={role.progress} className="h-1" />
                            </div>
                          )}

                          {/* Expanded Details */}
                          {isSelected && (
                            <div className="space-y-3 pt-3 border-t">
                              <div>
                                <h4 className="text-xs font-semibold mb-2">Key Actions:</h4>
                                <ul className="text-xs space-y-1">
                                  {role.keyActions.map((action, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                      <div className="w-1 h-1 bg-primary rounded-full" />
                                      {action}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <h4 className="text-xs font-semibold mb-2">Learning Objectives:</h4>
                                <ul className="text-xs space-y-1">
                                  {role.learningObjectives.map((objective, index) => (
                                    <li key={index} className="flex items-center gap-2">
                                      <Star className="w-3 h-3 text-yellow-500" />
                                      {objective}
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <Button 
                                size="sm" 
                                className="w-full mt-3"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEnterRole(role)
                                }}
                                disabled={!isRoleUnlocked}
                              >
                                {role.status === 'completed' ? 'Review Role' : 'Enter Role'}
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Connection Arrow */}
                {levelIndex < INSTITUTIONAL_LEVELS.length - 1 && (
                  <div className="flex justify-center py-2">
                    <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm">
                      <ArrowDown className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Authority & Information Flow</span>
                      <ArrowDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Learning Path Modal/Overlay */}
      {showLearningPath && (
        <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <Zap className="w-5 h-5" />
                Your Learning Path
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowLearningPath(false)}>
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-amber-700">
                Progress through the institutional hierarchy to understand how Rwanda's capital markets work:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-amber-800 mb-2">Recommended Path:</h4>
                  <ol className="text-sm text-amber-700 space-y-1">
                    <li>1. Start as Issuer (understand capital needs)</li>
                    <li>2. Learn IB Advisor role (deal structuring)</li>
                    <li>3. Explore Investor perspective (capital provision)</li>
                    <li>4. Understand Broker role (market access)</li>
                    <li>5. Study regulatory oversight (CMA)</li>
                    <li>6. Learn market infrastructure (RSE, CSD)</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-semibold text-amber-800 mb-2">Your Progress:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Issuer role completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Investor role in progress (40%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Play className="w-4 h-4 text-orange-600" />
                      <span>IB Advisor available (25% started)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Educational Notice */}
      <Alert className="bg-blue-50 border-blue-200">
        <BookOpen className="h-4 w-4" />
        <AlertDescription>
          <strong>Educational Platform:</strong> Click on any role to learn about their responsibilities, 
          then enter the role to experience their workflow. Progress is tracked across all roles to build 
          comprehensive understanding of Rwanda's capital markets.
        </AlertDescription>
      </Alert>
    </div>
  )
}