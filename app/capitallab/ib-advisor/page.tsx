'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Briefcase, 
  FileText, 
  TrendingUp, 
  Users, 
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Building2,
  Activity,
  Target
} from 'lucide-react'
import { IBAdvisorDashboard } from '@/components/ib-advisor-dashboard'

export default function IBAdvisorPage() {
  const [showDashboard, setShowDashboard] = useState(false)
  
  // In real implementation, get user data from auth context
  const mockUser = {
    id: 'ib-advisor-123',
    role: 'ib_advisor'
  }

  if (showDashboard) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={() => setShowDashboard(false)}
              className="mb-4"
            >
              ← Back to Role Selection
            </Button>
          </div>
          <IBAdvisorDashboard 
            userId={mockUser.id}
            userRole={mockUser.role}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Investment Bank Advisor Portal</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Manage client assignments, conduct due diligence, and guide capital raising processes 
            through regulatory approval in Rwanda's capital markets.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Main Dashboard Card */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
            <div className="absolute top-4 right-4">
              <Badge variant="default" className="bg-purple-100 text-purple-800">
                Professional Access
              </Badge>
            </div>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Briefcase className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl">IB Advisor Dashboard</CardTitle>
              </div>
              <p className="text-muted-foreground">
                Complete client management and regulatory workflow control
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Manage assigned issuers</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Conduct due diligence processes</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Create and submit prospectus filings</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Handle regulatory interactions</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button 
                  onClick={() => setShowDashboard(true)}
                  className="w-full flex items-center justify-center gap-2"
                  size="lg"
                >
                  Enter as IB Advisor
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Your Client Portfolio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">2</div>
                  <div className="text-xs text-muted-foreground">Active Clients</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">1</div>
                  <div className="text-xs text-muted-foreground">Pending DD</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Pipeline Value:</span>
                  <span className="font-medium text-green-600">RWF 700M</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Active Filings:</span>
                  <span className="font-medium">1 Draft</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Success Rate:</span>
                  <span className="font-medium">95%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Authority & Responsibilities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Your Authority & Responsibilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="font-semibold mb-2">Client Management</h4>
                <p className="text-sm text-muted-foreground">
                  Full authority over assigned issuer relationships and communication
                </p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="font-semibold mb-2">Regulatory Filings</h4>
                <p className="text-sm text-muted-foreground">
                  Exclusive responsibility for all CMA submissions and regulatory interactions
                </p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h4 className="font-semibold mb-2">Market Structuring</h4>
                <p className="text-sm text-muted-foreground">
                  Complete control over instrument structuring, pricing, and allocation decisions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Current Client Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    RG
                  </div>
                  <div>
                    <p className="font-medium">Rwanda Green Energy Ltd</p>
                    <p className="text-sm text-muted-foreground">Bond • RWF 500M • Due Diligence Phase</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Active
                  </Badge>
                  <Button size="sm" variant="outline">
                    Manage
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                    KT
                  </div>
                  <div>
                    <p className="font-medium">Kigali Tech Solutions</p>
                    <p className="text-sm text-muted-foreground">Equity • RWF 200M • Initial Assignment</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    New
                  </Badge>
                  <Button size="sm" variant="outline">
                    Start Process
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Status */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Workflow Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Due diligence documents received</p>
                    <p className="text-xs text-muted-foreground">Rwanda Green Energy - Financial statements submitted</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    1 hour ago
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New client assignment</p>
                    <p className="text-xs text-muted-foreground">Kigali Tech Solutions - Equity raise intent</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    2 days ago
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Prospectus draft created</p>
                    <p className="text-xs text-muted-foreground">Rwanda Green Energy Bond 2024 - Ready for review</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    3 days ago
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}