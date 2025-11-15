"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Building2, 
  Briefcase, 
  Users, 
  TrendingUp, 
  Shield, 
  Database,
  Award,
  ArrowRight,
  Bell,
  Clock,
  CheckCircle,
  AlertCircle,
  Workflow,
  Users2
} from 'lucide-react'
import Link from 'next/link'

interface CollaborativeRole {
  id: string
  name: string
  shortName: string
  description: string
  responsibilities: string[]
  icon: any
  status: 'active' | 'pending' | 'completed'
  workItems: number
  route: string
  color: string
  bgColor: string
}

const COLLABORATIVE_ROLES: CollaborativeRole[] = [
  {
    id: 'issuer',
    name: 'Issuer Company',
    shortName: 'Issuer',
    description: 'Submit IPO applications and provide required documentation',
    responsibilities: [
      'Complete 10-section IPO application',
      'Upload required regulatory documents',
      'Set up team roles (CEO, CFO, Secretary, Legal)',
      'Respond to regulator queries and requests'
    ],
    icon: Building2,
    status: 'active',
    workItems: 5,
    route: '/auth/issuer-entry',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200'
  },

  {
    id: 'ib-advisor',
    name: 'Investment Bank Advisor',
    shortName: 'IB Advisor',
    description: 'Structure deals and guide issuers through regulatory process',
    responsibilities: [
      'Review and take issuer applications',
      'Structure deal terms and pricing',
      'Prepare regulatory filings and documentation',
      'Submit structured deals to CMA for approval'
    ],
    icon: Briefcase,
    status: 'active',
    workItems: 2,
    route: '/capitallab/collaborative/ib-advisor',
    color: 'text-green-700',
    bgColor: 'bg-green-50 border-green-200'
  },

  {
    id: 'cma-regulator',
    name: 'CMA Regulator',
    shortName: 'CMA',
    description: 'Review and approve IPO applications for market protection',
    responsibilities: [
      'Review submitted applications for compliance',
      'Issue queries and information requests',
      'Approve or reject applications with reasoning',
      'Monitor ongoing regulatory compliance'
    ],
    icon: Shield,
    status: 'active',
    workItems: 2,
    route: '/capitallab/collaborative/cma-regulator',
    color: 'text-red-700',
    bgColor: 'bg-red-50 border-red-200'
  },
  {
    id: 'rse-listing',
    name: 'SHORA Exchange Listing Desk',
    shortName: 'SHORA',
    description: 'Manage instrument listings and create ISINs',
    responsibilities: [
      'Create ISIN codes',
      'List approved instruments',
      'Manage trading sessions',
      'Maintain market data'
    ],
    icon: Award,
    status: 'pending',
    workItems: 0,
    route: '/capitallab/collaborative/rse-listing',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200'
  },
  {
    id: 'csd-registry',
    name: 'CSD Registry',
    shortName: 'CSD',
    description: 'Maintain authoritative ownership records and settlements',
    responsibilities: [
      'Maintain share registry',
      'Process settlements',
      'Issue ownership certificates',
      'Handle corporate actions'
    ],
    icon: Database,
    status: 'pending',
    workItems: 0,
    route: '/capitallab/collaborative/csd-registry',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50 border-indigo-200'
  },
  {
    id: 'licensed-broker',
    name: 'Licensed Broker',
    shortName: 'Broker',
    description: 'Facilitate investor access and execute trades',
    responsibilities: [
      'Activate investor accounts',
      'Execute buy/sell orders',
      'Manage client portfolios',
      'Provide market access'
    ],
    icon: Users,
    status: 'pending',
    workItems: 0,
    route: '/capitallab/collaborative/licensed-broker',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-200'
  },
  {
    id: 'investor',
    name: 'Investor',
    shortName: 'Investor',
    description: 'Participate in IPOs and trade securities',
    responsibilities: [
      'Request account activation',
      'Place IPO orders',
      'Monitor portfolio performance',
      'Execute secondary trades'
    ],
    icon: TrendingUp,
    status: 'pending',
    workItems: 0,
    route: '/capitallab/collaborative/investor',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50 border-teal-200'
  }
]

interface CapitalLabCollaborativeHubProps {
  userId?: string
  userRole?: string
}

export function CapitalLabCollaborativeHub({ userId, userRole }: CapitalLabCollaborativeHubProps) {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  const getStatusIcon = (status: string, workItems: number) => {
    if (workItems > 0) {
      return <Bell className="w-4 h-4 text-orange-600" />
    }
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'active':
        return <Clock className="w-4 h-4 text-blue-600" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string, workItems: number) => {
    if (workItems > 0) {
      return (
        <Badge className="bg-orange-100 text-orange-800">
          {workItems} pending
        </Badge>
      )
    }

    const config = {
      completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
      active: { label: 'Active', color: 'bg-blue-100 text-blue-800' },
      pending: { label: 'Ready', color: 'bg-gray-100 text-gray-600' }
    }
    
    return (
      <Badge className={config[status as keyof typeof config].color}>
        {config[status as keyof typeof config].label}
      </Badge>
    )
  }

  const handleRoleClick = (role: CollaborativeRole) => {
    setSelectedRole(selectedRole === role.id ? null : role.id)
  }

  const handleEnterRole = (role: CollaborativeRole) => {
    // Check if user needs to login for specific roles
    if (role.id === 'issuer') {
      // Always go to unified issuer entry page
      router.push('/auth/issuer-entry');
      return;
    }
    
    if (role.id === 'cma-regulator') {
      // Check if CMA regulator is logged in
      const session = localStorage.getItem('auth_session');
      if (session) {
        const sessionData = JSON.parse(session);
        if (sessionData.profile?.role === 'CMA_REGULATOR' || sessionData.profile?.role === 'CMA_ADMIN') {
          router.push(role.route);
          return;
        }
      }
      // Not logged in as CMA regulator, redirect to login
      router.push('/auth/cma-regulator-login');
      return;
    }
    
    if (role.id === 'ib-advisor') {
      // Check if IB Advisor is logged in
      const session = localStorage.getItem('auth_session');
      if (session) {
        const sessionData = JSON.parse(session);
        if (sessionData.profile?.role === 'IB_ADVISOR') {
          router.push(role.route);
          return;
        }
      }
      // Not logged in as IB Advisor, redirect to login
      router.push('/auth/ib-advisor-login');
      return;
    }
    
    // For other roles, just navigate
    router.push(role.route);
  }

  const totalWorkItems = COLLABORATIVE_ROLES.reduce((sum, role) => sum + role.workItems, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Workflow className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-foreground">CapitalLab Collaborative Hub</h1>
              <p className="text-muted-foreground">Rwanda IPO Process Simulation</p>
            </div>
          </div>
          <Link href="/shora-market">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
              <Award className="w-4 h-4 mr-2" />
              View Market
            </Button>
          </Link>
        </div>

        {/* System Status */}
        <Card className="max-w-md mx-auto bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">System Activity</span>
              <span className="text-sm text-muted-foreground">{totalWorkItems} active items</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Enhanced systems available</span>
              <span>Real-time collaboration</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4 text-center">
            <Users2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-green-900">Active Teams</h3>
            <p className="text-2xl font-bold text-green-700">
              {COLLABORATIVE_ROLES.filter(r => r.status === 'active').length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-4 text-center">
            <Bell className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <h3 className="font-semibold text-orange-900">Pending Work</h3>
            <p className="text-2xl font-bold text-orange-700">{totalWorkItems}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4 text-center">
            <Workflow className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-blue-900">Live Processes</h3>
            <p className="text-2xl font-bold text-blue-700">1</p>
          </CardContent>
        </Card>
      </div>

      {/* Role Selection */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Select Your Role</h2>
          <p className="text-muted-foreground">
            Choose your role in the IPO process and collaborate with other teams
          </p>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COLLABORATIVE_ROLES.map((role) => {
            const RoleIcon = role.icon
            const isSelected = selectedRole === role.id
            
            return (
              <Card 
                key={role.id}
                className={`transition-all cursor-pointer ${role.bgColor} ${
                  isSelected 
                    ? 'ring-2 ring-primary shadow-lg scale-[1.02]' 
                    : 'hover:shadow-md hover:scale-[1.01]'
                }`}
                onClick={() => handleRoleClick(role)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white rounded-lg shadow-sm">
                        <RoleIcon className={`w-6 h-6 ${role.color}`} />
                      </div>
                      <div>
                        <CardTitle className={`text-lg ${role.color}`}>{role.shortName}</CardTitle>
                        <p className="text-sm text-muted-foreground">{role.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(role.status, role.workItems)}
                      {getStatusBadge(role.status, role.workItems)}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4">{role.description}</p>
                  
                  {/* Expanded Details */}
                  {isSelected && (
                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Key Responsibilities:</h4>
                        <ul className="text-sm space-y-1">
                          {role.responsibilities.map((responsibility, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                              {responsibility}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button 
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEnterRole(role)
                        }}
                      >
                        Enter as {role.shortName}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* SHORA Market Dashboard - Public Access */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-purple-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Award className="h-6 w-6 mr-2" />
            SHORA Market Dashboard - Live Trading View
          </CardTitle>
          <p className="text-purple-100">
            View all listed companies, real-time prices, and market statistics (Public Access - No Login Required)
          </p>
        </CardHeader>
        <CardContent>
          <Link href="/shora-market">
            <Button size="lg" className="w-full bg-white text-purple-600 hover:bg-purple-50 font-semibold">
              <TrendingUp className="h-5 w-5 mr-2" />
              Open SHORA Market Dashboard
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
          <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
            <div className="text-center">
              <p className="text-purple-200">Live Prices</p>
              <p className="text-xl font-bold">Real-Time</p>
            </div>
            <div className="text-center">
              <p className="text-purple-200">Market Data</p>
              <p className="text-xl font-bold">24/7</p>
            </div>
            <div className="text-center">
              <p className="text-purple-200">Public Access</p>
              <p className="text-xl font-bold">Free</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Creation Section */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users2 className="h-5 w-5 mr-2 text-green-600" />
            Create Professional Accounts
          </CardTitle>
          <p className="text-sm text-gray-600">
            Set up real accounts for different roles to enable full workflow testing
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 border-blue-200 hover:bg-blue-50"
              onClick={() => router.push('/auth/signup-team')}
            >
              <Building2 className="h-6 w-6 text-blue-600" />
              <div className="text-center">
                <div className="font-medium">Issuer Signup</div>
                <div className="text-xs text-gray-500">Create Company Team</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 border-green-200 hover:bg-green-50"
              onClick={() => router.push('/auth/ib-advisor-signup')}
            >
              <Briefcase className="h-6 w-6 text-green-600" />
              <div className="text-center">
                <div className="font-medium">IB Advisor Signup</div>
                <div className="text-xs text-gray-500">Investment Bank</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 border-red-200 hover:bg-red-50"
              onClick={() => router.push('/auth/cma-regulator-signup')}
            >
              <Shield className="h-6 w-6 text-red-600" />
              <div className="text-center">
                <div className="font-medium">CMA Regulator Signup</div>
                <div className="text-xs text-gray-500">Regulatory Authority</div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center space-y-2 border-purple-200 hover:bg-purple-50"
              onClick={() => router.push('/auth/login')}
            >
              <Users className="h-6 w-6 text-purple-600" />
              <div className="text-center">
                <div className="font-medium">Login</div>
                <div className="text-xs text-gray-500">Existing Account</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Process Flow Info */}
      <Alert className="bg-blue-50 border-blue-200">
        <Workflow className="h-4 w-4" />
        <AlertDescription>
          <strong>Collaborative Process:</strong> Work flows from Issuer → IB Advisor → CMA Regulator → SHORA Exchange Listing → CSD Registry. 
          Brokers and Investors participate throughout the process. Each role receives real work items from other teams.
        </AlertDescription>
      </Alert>
    </div>
  )
}