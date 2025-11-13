'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  Users, 
  Building2, 
  ArrowRight, 
  ArrowUp,
  ArrowDown,
  Target,
  Award,
  TrendingUp,
  Shield,
  Briefcase,
  Database,
  Settings
} from 'lucide-react'

interface UserProgress {
  individualLevel: number
  teamExperience: boolean
  institutionalRoles: string[]
  totalXP: number
  achievements: string[]
}

interface PlatformLevelNavigatorProps {
  userProgress: UserProgress
  currentMode: 'individual' | 'team' | 'institutional'
}

export function PlatformLevelNavigator({ userProgress, currentMode }: PlatformLevelNavigatorProps) {
  const [showProgression, setShowProgression] = useState(false)

  const levels = [
    {
      id: 'individual',
      title: 'Individual Trading',
      description: 'Personal portfolio management and direct market access',
      icon: User,
      color: 'bg-blue-100 text-blue-800',
      requirements: 'None - Start here',
      unlocked: true,
      route: '/individual',
      features: [
        'Personal portfolio tracking',
        'Direct market access',
        'Individual achievements',
        'Basic trading education'
      ],
      nextLevel: 'team',
      userStatus: {
        level: userProgress.individualLevel,
        completed: userProgress.individualLevel >= 10,
        canProgress: userProgress.individualLevel >= 5
      }
    },
    {
      id: 'team',
      title: 'Team Trading',
      description: 'Collaborative trading and team-based competitions',
      icon: Users,
      color: 'bg-green-100 text-green-800',
      requirements: 'Individual Level 5+ or 20+ trades',
      unlocked: userProgress.individualLevel >= 5,
      route: '/team',
      features: [
        'Collaborative decision making',
        'Team competitions',
        'Shared portfolio management',
        'Leadership development'
      ],
      nextLevel: 'institutional',
      userStatus: {
        level: userProgress.teamExperience ? 8 : 0,
        completed: userProgress.teamExperience,
        canProgress: userProgress.teamExperience && userProgress.individualLevel >= 10
      }
    },
    {
      id: 'institutional',
      title: 'CapitalLab Institutional',
      description: 'Professional capital markets process emulation',
      icon: Building2,
      color: 'bg-purple-100 text-purple-800',
      requirements: 'Individual Level 10+ AND Team Experience',
      unlocked: userProgress.individualLevel >= 10 && userProgress.teamExperience,
      route: '/capitallab',
      features: [
        'Professional role simulation',
        'Regulatory process learning',
        'Institutional workflows',
        'Professional certification'
      ],
      nextLevel: null,
      userStatus: {
        level: userProgress.institutionalRoles.length,
        completed: userProgress.institutionalRoles.length >= 3,
        canProgress: false
      }
    }
  ]

  const institutionalRoles = [
    { id: 'investor', title: 'Institutional Investor', icon: TrendingUp, level: 1 },
    { id: 'broker', title: 'Licensed Broker', icon: Users, level: 2 },
    { id: 'ib_advisor', title: 'IB Advisor', icon: Briefcase, level: 3 },
    { id: 'issuer', title: 'Corporate Issuer', icon: Building2, level: 2 },
    { id: 'regulator', title: 'CMA Regulator', icon: Shield, level: 4 },
    { id: 'listing_desk', title: 'RSE Listing Desk', icon: Award, level: 4 },
    { id: 'csd_operator', title: 'CSD Operator', icon: Database, level: 5 },
    { id: 'admin', title: 'System Administrator', icon: Settings, level: 5 }
  ]

  const getCurrentLevelInfo = () => {
    return levels.find(level => level.id === currentMode)
  }

  const getNextRecommendation = () => {
    const current = getCurrentLevelInfo()
    if (!current?.nextLevel) return null
    
    const next = levels.find(level => level.id === current.nextLevel)
    return next
  }

  const getProgressionPath = () => {
    const currentLevel = getCurrentLevelInfo()
    if (!currentLevel) return []
    
    const currentIndex = levels.findIndex(level => level.id === currentMode)
    return levels.slice(currentIndex + 1)
  }

  return (
    <div className="space-y-6">
      {/* Current Level Status */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Your Current Level: {getCurrentLevelInfo()?.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{userProgress.totalXP}</div>
              <div className="text-sm text-muted-foreground">Total XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{userProgress.achievements.length}</div>
              <div className="text-sm text-muted-foreground">Achievements</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{userProgress.institutionalRoles.length}</div>
              <div className="text-sm text-muted-foreground">Institutional Roles</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Level Progression */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ArrowUp className="w-5 h-5" />
              Learning Progression Path
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowProgression(!showProgression)}
            >
              {showProgression ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {levels.map((level, index) => {
              const Icon = level.icon
              const isCurrentLevel = level.id === currentMode
              const isCompleted = level.userStatus.completed
              const canProgress = level.userStatus.canProgress
              
              return (
                <div key={level.id} className="relative">
                  {/* Connection Line */}
                  {index < levels.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-8 bg-border" />
                  )}
                  
                  <div className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                    isCurrentLevel 
                      ? 'border-primary bg-primary/5' 
                      : level.unlocked 
                        ? 'border-border hover:border-primary/50' 
                        : 'border-border opacity-50'
                  }`}>
                    <div className={`p-3 rounded-lg ${level.color} ${!level.unlocked ? 'opacity-50' : ''}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{level.title}</h3>
                        {isCurrentLevel && <Badge>Current</Badge>}
                        {isCompleted && <Badge className="bg-green-100 text-green-800">Completed</Badge>}
                        {!level.unlocked && <Badge variant="outline">Locked</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{level.description}</p>
                      <p className="text-xs text-muted-foreground">Requirements: {level.requirements}</p>
                      
                      {showProgression && (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs font-medium">Key Features:</div>
                          <ul className="text-xs space-y-1">
                            {level.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <div className="w-1 h-1 bg-primary rounded-full" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      {level.unlocked && (
                        <Button 
                          size="sm" 
                          variant={isCurrentLevel ? "default" : "outline"}
                          onClick={() => window.location.href = level.route}
                        >
                          {isCurrentLevel ? 'Continue' : 'Enter'}
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                      
                      {canProgress && level.nextLevel && (
                        <div className="text-xs text-green-600 font-medium">
                          Ready to advance!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Institutional Roles Breakdown */}
      {userProgress.institutionalRoles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Your Institutional Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {institutionalRoles.map((role) => {
                const Icon = role.icon
                const hasRole = userProgress.institutionalRoles.includes(role.id)
                
                return (
                  <div 
                    key={role.id} 
                    className={`p-3 border rounded-lg text-center ${
                      hasRole ? 'border-primary bg-primary/5' : 'border-border opacity-50'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${hasRole ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="text-sm font-medium">{role.title}</div>
                    <div className="text-xs text-muted-foreground">Level {role.level}</div>
                    {hasRole && <Badge className="mt-1 text-xs">Mastered</Badge>}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Recommendation */}
      {getNextRecommendation() && (
        <Alert className="bg-green-50 border-green-200">
          <ArrowUp className="h-4 w-4" />
          <AlertDescription>
            <strong>Ready for the next level?</strong> You've made great progress in {getCurrentLevelInfo()?.title}. 
            Consider advancing to <strong>{getNextRecommendation()?.title}</strong> to continue your capital markets education journey.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}