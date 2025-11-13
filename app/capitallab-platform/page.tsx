'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  BookOpen,
  GraduationCap,
  Building2,
  Shield,
  Award,
  Database,
  Users,
  TrendingUp,
  Briefcase,
  ArrowRight,
  Play,
  Eye,
  Target,
  CheckCircle
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  completedModules: string[]
  currentRole?: string
  learningProgress: number
}

export default function CapitalLabPlatformPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock user data
    setTimeout(() => {
      setUser({
        id: 'user-123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        completedModules: ['basics', 'institutions'],
        currentRole: 'investor',
        learningProgress: 35
      })
      setIsLoading(false)
    }, 1000)
  }, [])

  const institutionalRoles = [
    {
      id: 'issuer',
      name: 'Issuer',
      description: 'Companies seeking capital',
      icon: Building2,
      color: 'bg-gray-50 border-gray-200',
      route: '/capitallab/issuer'
    },
    {
      id: 'ib_advisor',
      name: 'IB Advisor',
      description: 'Investment bank advisory',
      icon: Briefcase,
      color: 'bg-orange-50 border-orange-200',
      route: '/capitallab/ib-advisor'
    },
    {
      id: 'regulator',
      name: 'CMA Regulator',
      description: 'Regulatory oversight',
      icon: Shield,
      color: 'bg-red-50 border-red-200',
      route: '/capitallab/regulator'
    },
    {
      id: 'listing_desk',
      name: 'RSE Listing Desk',
      description: 'Exchange listing authority',
      icon: Award,
      color: 'bg-green-50 border-green-200',
      route: '/capitallab/listing-desk'
    },
    {
      id: 'csd',
      name: 'CSD Operator',
      description: 'Securities registry',
      icon: Database,
      color: 'bg-purple-50 border-purple-200',
      route: '/capitallab/csd'
    },
    {
      id: 'broker',
      name: 'Licensed Broker',
      description: 'Market intermediary',
      icon: Users,
      color: 'bg-blue-50 border-blue-200',
      route: '/capitallab/broker'
    },
    {
      id: 'investor',
      name: 'Investor',
      description: 'Capital provider',
      icon: TrendingUp,
      color: 'bg-teal-50 border-teal-200',
      route: '/capitallab/investor'
    },
    {
      id: 'admin',
      name: 'System Admin',
      description: 'Platform management',
      icon: Target,
      color: 'bg-indigo-50 border-indigo-200',
      route: '/capitallab/admin'
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading CapitalLab Platform...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">CapitalLab Platform</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Master Rwanda's capital markets through comprehensive education and institutional role simulation
          </p>
        </div>

        {/* User Progress */}
        {user && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Welcome back, {user.name}!</CardTitle>
                  <p className="text-muted-foreground">Continue your capital markets education journey</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">
                  {user.learningProgress}% Complete
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{user.completedModules.length}</div>
                  <div className="text-sm text-muted-foreground">Modules Completed</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{user.currentRole ? 1 : 0}</div>
                  <div className="text-sm text-muted-foreground">Active Role</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">8</div>
                  <div className="text-sm text-muted-foreground">Available Roles</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Educational Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Learn capital markets concepts, understand institutional roles, and follow the complete process.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => router.push('/capitallab/learn')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Start Learning
                </Button>
                <Button
                  onClick={() => router.push('/capitallab/workflow')}
                  variant="outline"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Workflows
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Interactive Tutorial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Take a guided walkthrough of the complete capital raising process with real examples.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => router.push('/capitallab')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Tutorial
                </Button>
                <Button
                  variant="outline"
                >
                  <Target className="w-4 h-4 mr-2" />
                  View Progress
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Institutional Roles */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold">Institutional Roles</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore 8 different institutional perspectives in Rwanda's capital markets ecosystem
            </p>
          </div>

          <Alert className="bg-amber-50 border-amber-200">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Educational Focus:</strong> Each role provides a unique perspective on how capital markets work.
              Start with learning the concepts, then explore roles to understand their responsibilities and interactions.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {institutionalRoles.map((role) => {
              const RoleIcon = role.icon
              const isActive = user?.currentRole === role.id

              return (
                <Card
                  key={role.id}
                  className={`${role.color} hover:shadow-md transition-all cursor-pointer ${isActive ? 'ring-2 ring-primary' : ''
                    }`}
                  onClick={() => router.push(role.route)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <RoleIcon className="w-5 h-5 text-primary" />
                      </div>
                      {isActive && (
                        <Badge className="bg-primary text-primary-foreground">
                          Active
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{role.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
                    <Button size="sm" variant="outline" className="w-full">
                      Explore Role
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Educational Notice */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <GraduationCap className="w-5 h-5" />
              Educational Platform Notice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-blue-700">
                CapitalLab is designed for educational purposes to help students, professionals, and business owners
                understand how Rwanda's capital markets operate in the real world.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">What You'll Learn:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Capital markets fundamentals</li>
                    <li>• Institutional roles and responsibilities</li>
                    <li>• Regulatory compliance processes</li>
                    <li>• Real-world capital raising journey</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">Perfect For:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Students studying finance</li>
                    <li>• Business professionals</li>
                    <li>• Entrepreneurs seeking capital</li>
                    <li>• Anyone interested in capital markets</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}