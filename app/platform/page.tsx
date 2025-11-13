'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  Users, 
  Building2, 
  TrendingUp, 
  Award, 
  BookOpen,
  ArrowRight,
  Star,
  Target,
  Briefcase
} from 'lucide-react'
import { PlatformLevelNavigator } from '@/components/platform-level-navigator'
import { UnifiedPlatformDashboard } from '@/components/unified-platform-dashboard'
import { CapitalLabQuickAccess } from '@/components/capitallab-quick-access'

interface UserProfile {
  id: string
  name: string
  email: string
  primaryMode: 'individual' | 'team' | 'institutional'
  accessibleModes: string[]
  stats: {
    individualTrades: number
    teamMemberships: number
    institutionalRoles: string[]
    totalXP: number
    achievements: number
  }
}

export default function PlatformHub() {
  const router = useRouter()
  
  // Redirect to CapitalLab since we're focusing only on educational platform
  useEffect(() => {
    router.push('/capitallab')
  }, [router])

  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock user data - in real implementation, get from auth context
    setTimeout(() => {
      setUser({
        id: 'user-123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        primaryMode: 'individual',
        accessibleModes: ['individual', 'team', 'institutional'],
        stats: {
          individualTrades: 45,
          teamMemberships: 2,
          institutionalRoles: ['investor', 'broker'],
          totalXP: 2850,
          achievements: 12
        }
      })
      setIsLoading(false)
    }, 1000)
  }, [])

  const platformModes = [
    {
      id: 'individual',
      title: 'Individual Trading',
      description: 'Personal portfolio management and direct market access',
      icon: User,
      route: '/individual',
      features: ['Direct Trading', 'Portfolio Tracking', 'Personal Analytics', 'Gamification'],
      color: 'bg-blue-100 text-blue-800',
      stats: user?.stats.individualTrades || 0,
      statsLabel: 'trades completed'
    },
    {
      id: 'team',
      title: 'Team Trading',
      description: 'Collaborative trading and team-based competitions',
      icon: Users,
      route: '/team',
      features: ['Team Collaboration', 'Group Competitions', 'Shared Strategies', 'Team Analytics'],
      color: 'bg-green-100 text-green-800',
      stats: user?.stats.teamMemberships || 0,
      statsLabel: 'team memberships'
    },
    {
      id: 'institutional',
      title: 'CapitalLab Simulation',
      description: 'Professional capital markets process emulation',
      icon: Building2,
      route: '/capitallab',
      features: ['Institutional Roles', 'Regulatory Simulation', 'Professional Workflows', 'Educational Artifacts'],
      color: 'bg-purple-100 text-purple-800',
      stats: user?.stats.institutionalRoles.length || 0,
      statsLabel: 'institutional roles'
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Shora Platform...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Please log in to access the Shora Platform
            </p>
            <Button onClick={() => router.push('/login')}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                Comprehensive Capital Markets Education Platform
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
                Welcome to Shora Platform
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Master capital markets through individual trading, team collaboration, and institutional simulation
              </p>
            </div>

            {/* User Stats */}
            <div className="flex justify-center">
              <div className="flex items-center gap-6 p-4 bg-white rounded-lg border shadow-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{user.stats.totalXP}</div>
                  <div className="text-xs text-muted-foreground">Total XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{user.stats.achievements}</div>
                  <div className="text-xs text-muted-foreground">Achievements</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{user.stats.institutionalRoles.length}</div>
                  <div className="text-xs text-muted-foreground">Roles Mastered</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Modes */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Choose Your Learning Path</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Progress from individual trading to team collaboration to professional institutional simulation
            </p>
          </div>

          {/* Learning Path Visualization */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Individual</span>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Team</span>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                <Building2 className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Institutional</span>
              </div>
            </div>
          </div>

          {/* Comprehensive Platform Dashboard */}
          <UnifiedPlatformDashboard userId={user.id} showNavigation={true} />
          
          {/* Dynamic Level Navigator */}
          <PlatformLevelNavigator 
            userProgress={{
              individualLevel: 12,
              teamExperience: true,
              institutionalRoles: ['investor', 'broker'],
              totalXP: user.stats.totalXP,
              achievements: ['Profit Master', 'Risk Manager', 'Team Player']
            }}
            currentMode={user.primaryMode}
          />

          {/* Comprehensive Platform Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Learning Center
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Comprehensive tutorials, guides, and educational content for all levels
                </p>
                <div className="space-y-2 mb-4">
                  <div className="text-xs text-muted-foreground">Available Resources:</div>
                  <ul className="text-xs space-y-1">
                    <li>• Trading Fundamentals</li>
                    <li>• Team Collaboration Guide</li>
                    <li>• Institutional Processes</li>
                    <li>• Capital Markets Overview</li>
                  </ul>
                </div>
                <Button variant="outline" className="w-full">
                  Browse Learning Center
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Progress Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Track achievements, XP, and progress across all platform modes
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span>Individual Progress</span>
                    <span className="font-medium">Level 12</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Team Experience</span>
                    <span className="font-medium">Active</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Institutional Roles</span>
                    <span className="font-medium">2/8</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  View Full Progress
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Quick Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Jump directly to your preferred trading mode or continue where you left off
                </p>
                <div className="space-y-2">
                  <Button 
                    size="sm" 
                    className="w-full justify-start" 
                    onClick={() => router.push('/individual')}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Continue Individual Trading
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push('/team')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Join Team Trading
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push('/capitallab')}
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Enter CapitalLab
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Platform Statistics */}
          <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 mt-8">
            <CardHeader>
              <CardTitle className="text-center">Platform Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">2,847</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">156</div>
                  <div className="text-sm text-muted-foreground">Active Teams</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">89</div>
                  <div className="text-sm text-muted-foreground">Institutional Workflows</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">15.4K</div>
                  <div className="text-sm text-muted-foreground">Trades Today</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Educational Notice */}
          <Alert className="bg-amber-50 border-amber-200">
            <Briefcase className="h-4 w-4" />
            <AlertDescription>
              <strong>Professional Development Platform:</strong> Progress through individual trading mastery, 
              team collaboration skills, and institutional capital markets expertise. Each mode builds upon the previous, 
              creating a comprehensive learning journey from retail trader to capital markets professional.
            </AlertDescription>
          </Alert>
        </div>
      </div>
      
      {/* CapitalLab Quick Access */}
      <CapitalLabQuickAccess />
    </div>
  )
}