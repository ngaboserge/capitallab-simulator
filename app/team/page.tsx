'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Briefcase, 
  Building2, 
  TrendingUp,
  Award,
  Shield,
  ArrowRight,
  UserPlus,
  Target
} from 'lucide-react'

// Import original team components
import { TeamDashboard } from '@/components/team-dashboard'
import { TeamTradingPanel } from '@/components/team-trading-panel'
import { TeamGamificationHub } from '@/components/team-gamification-hub'
import { TeamLeaderboard } from '@/components/team-leaderboard'
import { TeamActivity } from '@/components/team-activity'
import { TeamTradeHistory } from '@/components/team-trade-history'
import { TeamWatchlist } from '@/components/team-watchlist'
import { TeamTopHoldings } from '@/components/team-top-holdings'

// Import contexts
import { TeamTradingProvider } from '@/contexts/team-trading-context'
import { GamificationProvider } from '@/contexts/gamification-context'

interface EnhancedTeamPageProps {
  teamId?: string
}

function TeamPageContent({ teamId = 'team-123' }: EnhancedTeamPageProps) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [selectedTeamType, setSelectedTeamType] = useState<string>('trading')
  const [institutionalMode, setInstitutionalMode] = useState(false)

  const teamTypes = [
    {
      id: 'trading',
      title: 'Trading Team',
      description: 'Collaborative portfolio management and trading competitions',
      icon: TrendingUp,
      color: 'bg-green-100 text-green-800',
      features: ['Shared Portfolio', 'Team Competitions', 'Collaborative Decisions', 'Group Analytics']
    },
    {
      id: 'investment_bank',
      title: 'Investment Bank Team',
      description: 'Collaborative prospectus building and client management',
      icon: Briefcase,
      color: 'bg-orange-100 text-orange-800',
      features: ['Client Management', 'Prospectus Collaboration', 'Due Diligence Workflows', 'Regulatory Filings']
    },
    {
      id: 'broker_firm',
      title: 'Broker Firm Team',
      description: 'Multi-client portfolio management and activation workflows',
      icon: Users,
      color: 'bg-red-100 text-red-800',
      features: ['Client Activation', 'Portfolio Management', 'Trade Execution', 'Client Relations']
    },
    {
      id: 'corporate_treasury',
      title: 'Corporate Treasury Team',
      description: 'Company capital management and funding strategies',
      icon: Building2,
      color: 'bg-purple-100 text-purple-800',
      features: ['Capital Planning', 'Funding Strategies', 'Risk Management', 'Regulatory Compliance']
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
                <div className="p-2 rounded-lg bg-green-100">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                Team Trading
              </h1>
              <p className="text-muted-foreground">
                Collaborative trading and team-based institutional workflows
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                Create New Team
              </Button>
            </div>
          </div>

          {/* Team Enhancement Alert */}
          <Alert className="bg-blue-50 border-blue-200">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Enhanced Team Experience:</strong> Choose from different team types including traditional trading teams 
              and institutional teams for investment banking, brokerage, and corporate treasury workflows.
            </AlertDescription>
          </Alert>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="trading">Trading</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="types">Team Types</TabsTrigger>
            <TabsTrigger value="institutional">Institutional</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Original Team Dashboard */}
            <TeamDashboard />
          </TabsContent>

          <TabsContent value="trading" className="space-y-6">
            {/* Original Team Trading Panel */}
            <TeamTradingPanel />
            
            {/* Original Team Watchlist */}
            <TeamWatchlist />
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            {/* Original Team Top Holdings */}
            <TeamTopHoldings />
            
            {/* Original Team Trade History */}
            <TeamTradeHistory />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            {/* Original Team Activity */}
            <TeamActivity />
            
            {/* Original Team Leaderboard */}
            <TeamLeaderboard />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            {/* Original Team Gamification Hub */}
            <TeamGamificationHub />
          </TabsContent>

          <TabsContent value="types" className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Choose Your Team Type</h3>
              <p className="text-muted-foreground">
                Different team types offer unique collaborative experiences and workflows
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teamTypes.map((teamType) => {
                const Icon = teamType.icon
                const isSelected = selectedTeamType === teamType.id
                
                return (
                  <Card 
                    key={teamType.id} 
                    className={`hover:shadow-lg transition-shadow cursor-pointer ${
                      isSelected ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedTeamType(teamType.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-lg ${teamType.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        {isSelected && (
                          <Badge className="bg-primary text-white">
                            Selected
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{teamType.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {teamType.description}
                      </p>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Key Features:</h4>
                        <ul className="text-xs space-y-1">
                          {teamType.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-primary rounded-full" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button 
                        className="w-full" 
                        variant={isSelected ? "default" : "outline"}
                      >
                        {isSelected ? 'Create Team' : 'Select Type'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="institutional" className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Institutional Team Workflows</h3>
              <p className="text-muted-foreground">
                Advanced team features for institutional capital markets simulation
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Investment Bank Workflows
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Collaborate on prospectus building, due diligence, and client management
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Clients</span>
                      <Badge variant="outline">3</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending Submissions</span>
                      <Badge variant="outline">2</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Team Members</span>
                      <Badge variant="outline">5</Badge>
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => window.open('/capitallab/ib-advisor', '_blank')}>
                    Access IB Workflows
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Broker Team Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Manage multiple client portfolios and coordinate trade execution
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Clients</span>
                      <Badge variant="outline">12</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending Activations</span>
                      <Badge variant="outline">4</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Team Brokers</span>
                      <Badge variant="outline">3</Badge>
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => window.open('/capitallab/broker', '_blank')}>
                    Access Broker Tools
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <Target className="w-12 h-12 mx-auto text-purple-600" />
                  <h3 className="text-xl font-bold">Ready for Full Institutional Simulation?</h3>
                  <p className="text-muted-foreground">
                    Experience complete capital markets workflows with role-based team collaboration 
                    in the CapitalLab institutional simulation.
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

export default function EnhancedTeamPage(props: EnhancedTeamPageProps) {
  return (
    <GamificationProvider>
      <TeamTradingProvider>
        <TeamPageContent {...props} />
      </TeamTradingProvider>
    </GamificationProvider>
  )
}