'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  User,
  TrendingUp,
  Award,
  Shield,
  BookOpen,
  ArrowRight,
  Building2,
  Users,
  Briefcase
} from 'lucide-react'

// Import original components
import { IndividualDashboard } from '@/components/individual-dashboard'
import { IndividualTradingPanel } from '@/components/individual-trading-panel'
import { GamificationDashboard } from '@/components/gamification-dashboard'
import { Watchlist } from '@/components/watchlist'
import { TradeHistory } from '@/components/trade-history'
import { PortfolioChart } from '@/components/portfolio-chart'

// Import contexts
import { IndividualTradingProvider } from '@/contexts/individual-trading-context'
import { GamificationProvider } from '@/contexts/gamification-context'

interface EnhancedIndividualPageProps {
  userId?: string
}

function IndividualPageContent({ userId = 'user-123' }: EnhancedIndividualPageProps) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [institutionalLearningMode, setInstitutionalLearningMode] = useState(false)
  const [brokerMediatedMode, setBrokerMediatedMode] = useState(false)

  const roleExplorationOptions = [
    {
      role: 'broker',
      title: 'Try as Licensed Broker',
      description: 'Experience client activation and trade execution',
      icon: Users,
      route: '/capitallab/broker',
      color: 'bg-red-100 text-red-800'
    },
    {
      role: 'ib_advisor',
      title: 'Try as IB Advisor',
      description: 'Learn prospectus building and regulatory filing',
      icon: Briefcase,
      route: '/capitallab/ib-advisor',
      color: 'bg-orange-100 text-orange-800'
    },
    {
      role: 'investor_institutional',
      title: 'Try Institutional Investor',
      description: 'Experience broker-mediated trading',
      icon: Building2,
      route: '/capitallab/investor',
      color: 'bg-purple-100 text-purple-800'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                Individual Trading
              </h1>
              <p className="text-muted-foreground">
                Personal portfolio management with optional institutional learning
              </p>
            </div>

            {/* Mode Controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={institutionalLearningMode}
                  onCheckedChange={setInstitutionalLearningMode}
                />
                <span className="text-sm">Institutional Learning</span>
              </div>

              {institutionalLearningMode && (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={brokerMediatedMode}
                    onCheckedChange={setBrokerMediatedMode}
                  />
                  <span className="text-sm">Broker Mediated</span>
                </div>
              )}
            </div>
          </div>

          {/* Institutional Learning Alert */}
          {institutionalLearningMode && (
            <Alert className="bg-blue-50 border-blue-200">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <strong>Institutional Learning Mode:</strong> Educational compliance alerts,
                professional contract notes, and role exploration enabled.
                {brokerMediatedMode && ' Broker mediation active - trades require broker approval.'}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="trading">Trading</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="explore">Explore</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Original Individual Dashboard */}
            <IndividualDashboard />

            {/* Institutional Learning Features */}
            {institutionalLearningMode && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Compliance Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-800">
                          ✓ All trades comply with tick size requirements
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          ⚠ Consider diversification - 60% allocation in tech sector
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Professional Development
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Trading Competency</span>
                        <Badge>Advanced</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Risk Management</span>
                        <Badge variant="outline">Intermediate</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Market Analysis</span>
                        <Badge>Advanced</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="trading" className="space-y-6">
            {/* Original Individual Trading Panel */}
            <IndividualTradingPanel />

            {/* Broker Mediation Interface */}
            {brokerMediatedMode && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <Users className="w-5 h-5" />
                    Broker Mediation Active
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-orange-800">
                      Your trades are being processed through your assigned broker.
                      This simulates real institutional investor experience.
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="text-sm">
                        <strong>Assigned Broker:</strong> Kigali Securities Ltd
                      </div>
                      <Button size="sm" variant="outline">
                        Contact Broker
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Original Watchlist */}
            <Watchlist />
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            {/* Original Portfolio Chart */}
            <PortfolioChart />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {/* Original Trade History */}
            <TradeHistory />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            {/* Original Gamification Dashboard */}
            <GamificationDashboard mode="individual" />

            {/* Institutional Achievements */}
            {institutionalLearningMode && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Institutional Learning Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <Shield className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                      <h4 className="font-medium">Compliance Champion</h4>
                      <p className="text-xs text-muted-foreground">Zero rule violations</p>
                      <Badge className="mt-2">Unlocked</Badge>
                    </div>
                    <div className="p-4 border rounded-lg text-center opacity-50">
                      <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <h4 className="font-medium">Broker Relationship</h4>
                      <p className="text-xs text-muted-foreground">Complete broker-mediated trade</p>
                      <Badge variant="outline" className="mt-2">Locked</Badge>
                    </div>
                    <div className="p-4 border rounded-lg text-center opacity-50">
                      <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <h4 className="font-medium">Role Explorer</h4>
                      <p className="text-xs text-muted-foreground">Try 3 institutional roles</p>
                      <Badge variant="outline" className="mt-2">Locked</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="explore" className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Explore Capital Markets Roles</h3>
              <p className="text-muted-foreground">
                Experience different perspectives in the capital markets ecosystem
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roleExplorationOptions.map((option) => {
                const Icon = option.icon

                return (
                  <Card key={option.role} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className={`p-3 rounded-lg w-fit ${option.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-lg">{option.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>

                      <Button className="w-full" onClick={() => window.open(option.route, '_blank')}>
                        Try This Role
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Building2 className="w-12 h-12 mx-auto text-purple-600" />
                  <h3 className="text-xl font-bold">Ready for Full Institutional Experience?</h3>
                  <p className="text-muted-foreground">
                    Join the complete CapitalLab simulation with role-based workflows,
                    regulatory processes, and professional document generation.
                  </p>
                  <Button size="lg" onClick={() => window.open('/capitallab', '_blank')}>
                    Enter CapitalLab
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function EnhancedIndividualPage(props: EnhancedIndividualPageProps) {
  return (
    <GamificationProvider>
      <IndividualTradingProvider>
        <IndividualPageContent {...props} />
      </IndividualTradingProvider>
    </GamificationProvider>
  )
}