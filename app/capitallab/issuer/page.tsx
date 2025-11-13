'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  FileText, 
  TrendingUp, 
  Users, 
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { IssuerDashboard } from '@/components/issuer-dashboard'

export default function IssuerPage() {
  const [showDashboard, setShowDashboard] = useState(false)
  
  // In real implementation, get user data from auth context
  const mockUser = {
    id: 'user-123',
    role: 'issuer'
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
          <IssuerDashboard 
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
          <h1 className="text-4xl font-bold mb-4">Corporate Issuer Portal</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Access your capital raising journey through Rwanda's capital markets. 
            Submit intents, respond to due diligence, and track your progress.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Main Dashboard Card */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
            <div className="absolute top-4 right-4">
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                Primary Access
              </Badge>
            </div>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Issuer Dashboard</CardTitle>
              </div>
              <p className="text-muted-foreground">
                Complete capital raising workflow management
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Submit capital raise intents</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Respond to due diligence requests</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Track application progress</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Communicate with IB Advisor</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Button 
                  onClick={() => setShowDashboard(true)}
                  className="w-full flex items-center justify-center gap-2"
                  size="lg"
                >
                  Enter as Issuer
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Your Capital Raising Journey
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">1</div>
                  <div className="text-xs text-muted-foreground">Active Intent</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">2</div>
                  <div className="text-xs text-muted-foreground">Pending DD</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Current Status:</span>
                  <Badge variant="default" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Due Diligence
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>IB Advisor:</span>
                  <span className="font-medium">Sarah Mukamana</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Target Amount:</span>
                  <span className="font-medium">RWF 500M</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Process Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Capital Raising Process Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  1
                </div>
                <h4 className="font-semibold mb-1">Submit Intent</h4>
                <p className="text-xs text-muted-foreground">
                  Express your capital raising intention with basic details
                </p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  2
                </div>
                <h4 className="font-semibold mb-1">IB Assignment</h4>
                <p className="text-xs text-muted-foreground">
                  Get matched with a qualified Investment Bank Advisor
                </p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  3
                </div>
                <h4 className="font-semibold mb-1">Due Diligence</h4>
                <p className="text-xs text-muted-foreground">
                  Provide required documents and information
                </p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                  4
                </div>
                <h4 className="font-semibold mb-1">Market Listing</h4>
                <p className="text-xs text-muted-foreground">
                  Your instrument gets listed and trading begins
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Preview */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Due diligence request received</p>
                    <p className="text-xs text-muted-foreground">Financial statements required by Feb 5, 2024</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    2 days ago
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">IB Advisor assigned</p>
                    <p className="text-xs text-muted-foreground">Sarah Mukamana from Rwanda Capital Partners</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    1 week ago
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Capital raise intent submitted</p>
                    <p className="text-xs text-muted-foreground">RWF 500M bond for solar farm development</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    2 weeks ago
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