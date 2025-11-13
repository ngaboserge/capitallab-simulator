'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  Briefcase,
  Shield,
  Database,
  Settings,
  Activity,
  BarChart3,
  PieChart,
  Clock,
  CheckCircle
} from 'lucide-react'

interface UnifiedDashboardProps {
  userId?: string
  showNavigation?: boolean
  compactMode?: boolean
}

interface UserStats {
  individualLevel: number
  individualTrades: number
  teamMemberships: number
  institutionalRoles: string[]
  totalXP: number
  achievements: string[]
  currentStreak: number
  portfolioValue: number
  totalReturn: number
}

interface PlatformActivity {
  id: string
  type: 'trade' | 'achievement' | 'level_up' | 'team_join' | 'role_unlock'
  title: string
  description: string
  timestamp: Date
  mode: 'individual' | 'team' | 'institutional'
}

export function UnifiedPlatformDashboard({ userId = 'user-123', showNavigation = true, compactMode = false }: UnifiedDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [userStats, setUserStats] = useState<UserStats>({
    individualLevel: 12,
    individualTrades: 45,
    teamMemberships: 2,
    institutionalRoles: ['investor', 'broker'],
    totalXP: 2850,
    achievements: ['Profit Master', 'Risk Manager', 'Team Player', 'Compliance Champion'],
    currentStreak: 7,
    portfolioValue: 125000,
    totalReturn: 25.5
  })
  
  const [recentActivity, setRecentActivity] = useState<PlatformActivity[]>([
    {
      id: '1',
      type: 'achievement',
      title: 'Compliance Champion',
      description: 'Completed 10 trades without rule violations',
      timestamp: new Date('2024-01-22T10:30:00'),
      mode: 'individual'
    },
    {
      id: '2',
      type: 'trade',
      title: 'Successful Trade',
      description: 'Bought 100 BK shares at RWF 285.5',
      timestamp: new Date('2024-01-22T09:15:00'),
      mode: 'individual'
    },
    {
      id: '3',
      type: 'team_join',
      title: 'Joined Trading Team',
      description: 'Joined "Rwanda Traders" team',
      timestamp: new Date('2024-01-21T16:45:00'),
      mode: 'team'
    },
    {
      id: '4',
      type: 'role_unlock',
      title: 'New Role Unlocked',
      description: 'Unlocked Licensed Broker role in CapitalLab',
      timestamp: new Date('2024-01-21T14:20:00'),
      mode: 'institutional'
    }
  ])

  const institutionalRoles = [
    { id: 'investor', title: 'Institutional Investor', icon: TrendingUp, mastered: true },
    { id: 'broker', title: 'Licensed Broker', icon: Users, mastered: true },
    { id: 'ib_advisor', title: 'IB Advisor', icon: Briefcase, mastered: false },
    { id: 'issuer', title: 'Corporate Issuer', icon: Building2, mastered: false },
    { id: 'regulator', title: 'CMA Regulator', icon: Shield, mastered: false },
    { id: 'listing_desk', title: 'RSE Listing Desk', icon: Award, mastered: false },
    { id: 'csd_operator', title: 'CSD Operator', icon: Database, mastered: false },
    { id: 'admin', title: 'System Administrator', icon: Settings, mastered: false }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'trade': return TrendingUp
      case 'achievement': return Award
      case 'level_up': return Star
      case 'team_join': return Users
      case 'role_unlock': return Building2
      default: return Activity
    }
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'individual': return 'bg-blue-100 text-blue-800'
      case 'team': return 'bg-green-100 text-green-800'
      case 'institutional': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (compactMode) {
    return (
      <div className="space-y-4">
        {/* Compact Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-primary">{userStats.totalXP}</div>
              <div className="text-sm text-muted-foreground">Total XP</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{userStats.achievements.length}</div>
              <div className="text-sm text-muted-foreground">Achievements</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{userStats.institutionalRoles.length}</div>
              <div className="text-sm text-muted-foreground">Roles</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{userStats.currentStreak}</div>
              <div className="text-sm text-muted-foreground">Day Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            <User className="w-4 h-4 mr-2" />
            Individual
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Users className="w-4 h-4 mr-2" />
            Team
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Building2 className="w-4 h-4 mr-2" />
            CapitalLab
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-800">{userStats.totalXP}</div>
                <div className="text-sm text-blue-600">Total Experience Points</div>
                <div className="text-xs text-blue-500 mt-1">Level {userStats.individualLevel}</div>
              </div>
              <Star className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-800">RWF {userStats.portfolioValue.toLocaleString()}</div>
                <div className="text-sm text-green-600">Portfolio Value</div>
                <div className="text-xs text-green-500 mt-1">+{userStats.totalReturn}% return</div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-800">{userStats.institutionalRoles.length}/8</div>
                <div className="text-sm text-purple-600">Institutional Roles</div>
                <div className="text-xs text-purple-500 mt-1">Professional Progress</div>
              </div>
              <Building2 className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-800">{userStats.currentStreak}</div>
                <div className="text-sm text-orange-600">Day Streak</div>
                <div className="text-xs text-orange-500 mt-1">{userStats.achievements.length} achievements</div>
              </div>
              <Award className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mode Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Mode Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Individual Trading</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">Level {userStats.individualLevel}</Badge>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium">Team Trading</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium">Institutional</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-100 text-purple-800">{userStats.institutionalRoles.length}/8 Roles</Badge>
                      <Clock className="w-4 h-4 text-orange-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Continue Individual Trading
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Join Team Session
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Building2 className="w-4 h-4 mr-2" />
                  Explore New Role
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Learning Resources
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userStats.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <Award className="w-5 h-5 text-yellow-600" />
                      <div>
                        <div className="font-medium text-sm">{achievement}</div>
                        <div className="text-xs text-muted-foreground">Recently earned</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Learning Path */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Learning Path
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Individual Trading:</strong> Mastered! Ready for advanced features.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert className="bg-blue-50 border-blue-200">
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Team Trading:</strong> Active participation. Continue building collaboration skills.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert className="bg-purple-50 border-purple-200">
                    <Target className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Institutional:</strong> 2/8 roles mastered. Try IB Advisor next!
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const Icon = getActivityIcon(activity.type)
                  
                  return (
                    <div key={activity.id} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="p-2 rounded-lg bg-gray-100">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{activity.title}</div>
                        <div className="text-xs text-muted-foreground">{activity.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {activity.timestamp.toLocaleString()}
                        </div>
                      </div>
                      <Badge className={getModeColor(activity.mode)}>
                        {activity.mode}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Institutional Roles Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {institutionalRoles.map((role) => {
                  const Icon = role.icon
                  
                  return (
                    <div 
                      key={role.id} 
                      className={`p-4 border rounded-lg ${
                        role.mastered ? 'border-green-200 bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-6 h-6 ${role.mastered ? 'text-green-600' : 'text-gray-400'}`} />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{role.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {role.mastered ? 'Mastered' : 'Not started'}
                          </div>
                        </div>
                        {role.mastered ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Button size="sm" variant="outline">
                            Start
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}