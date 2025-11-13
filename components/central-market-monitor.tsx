'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Building2, 
  TrendingUp, 
  Users, 
  Globe,
  BarChart3,
  Activity,
  Award,
  Target,
  Clock,
  DollarSign,
  Briefcase,
  School,
  MapPin,
  ArrowUp,
  ArrowDown,
  Eye,
  Download
} from 'lucide-react'

interface MarketData {
  totalTeams: number
  activeDeals: number
  completedDeals: number
  totalCapitalRaised: number
  totalStudents: number
  universities: number
  averageTeamPerformance: number
  marketGrowth: number
}

interface TeamSummary {
  id: string
  name: string
  university: string
  currentDeal: string
  progress: number
  performance: number
  capitalTarget: number
  status: 'active' | 'completed' | 'paused'
  studentsCount: number
}

interface CompanyListing {
  id: string
  name: string
  sector: string
  teamId: string
  university: string
  capitalRaised: number
  sharesIssued: number
  currentPrice: number
  marketCap: number
  listingDate: Date
  performance: number
}

interface UniversityStats {
  name: string
  activeTeams: number
  completedDeals: number
  totalCapitalRaised: number
  averagePerformance: number
  studentsParticipating: number
}

export function CentralMarketMonitor() {
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const [activeTeams, setActiveTeams] = useState<TeamSummary[]>([])
  const [listedCompanies, setListedCompanies] = useState<CompanyListing[]>([])
  const [universityStats, setUniversityStats] = useState<UniversityStats[]>([])
  const [selectedView, setSelectedView] = useState<'overview' | 'teams' | 'companies' | 'universities'>('overview')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API calls
    const mockMarketData: MarketData = {
      totalTeams: 24,
      activeDeals: 18,
      completedDeals: 6,
      totalCapitalRaised: 12500000000, // 12.5B RWF
      totalStudents: 192,
      universities: 8,
      averageTeamPerformance: 87,
      marketGrowth: 15.3
    }

    const mockTeams: TeamSummary[] = [
      {
        id: 'team_001',
        name: 'Kigali University Capital Markets 2024',
        university: 'University of Rwanda - Kigali',
        currentDeal: 'Green Energy Rwanda Ltd',
        progress: 65,
        performance: 91,
        capitalTarget: 500000000,
        status: 'active',
        studentsCount: 8
      },
      {
        id: 'team_002',
        name: 'AUCA Finance Team Alpha',
        university: 'Adventist University of Central Africa',
        currentDeal: 'Tech Innovation Hub',
        progress: 45,
        performance: 88,
        capitalTarget: 750000000,
        status: 'active',
        studentsCount: 10
      },
      {
        id: 'team_003',
        name: 'KIE Engineering Capital',
        university: 'Kigali Institute of Engineering',
        currentDeal: 'Smart Infrastructure Ltd',
        progress: 100,
        performance: 94,
        capitalTarget: 1200000000,
        status: 'completed',
        studentsCount: 9
      }
    ]

    const mockCompanies: CompanyListing[] = [
      {
        id: 'comp_001',
        name: 'Smart Infrastructure Ltd',
        sector: 'Technology',
        teamId: 'team_003',
        university: 'Kigali Institute of Engineering',
        capitalRaised: 1200000000,
        sharesIssued: 2400000,
        currentPrice: 520,
        marketCap: 1248000000,
        listingDate: new Date('2024-10-15'),
        performance: 4.2
      },
      {
        id: 'comp_002',
        name: 'Rwanda Agri-Tech Solutions',
        sector: 'Agriculture',
        teamId: 'team_004',
        university: 'University of Rwanda - Huye',
        capitalRaised: 800000000,
        sharesIssued: 1600000,
        currentPrice: 485,
        marketCap: 776000000,
        listingDate: new Date('2024-09-28'),
        performance: -2.8
      }
    ]

    const mockUniversityStats: UniversityStats[] = [
      {
        name: 'University of Rwanda - Kigali',
        activeTeams: 4,
        completedDeals: 2,
        totalCapitalRaised: 2100000000,
        averagePerformance: 89,
        studentsParticipating: 32
      },
      {
        name: 'Adventist University of Central Africa',
        activeTeams: 3,
        completedDeals: 1,
        totalCapitalRaised: 1500000000,
        averagePerformance: 86,
        studentsParticipating: 24
      },
      {
        name: 'Kigali Institute of Engineering',
        activeTeams: 2,
        completedDeals: 2,
        totalCapitalRaised: 2200000000,
        averagePerformance: 92,
        studentsParticipating: 18
      }
    ]

    setTimeout(() => {
      setMarketData(mockMarketData)
      setActiveTeams(mockTeams)
      setListedCompanies(mockCompanies)
      setUniversityStats(mockUniversityStats)
      setIsLoading(false)
    }, 1000)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading market data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Rwanda Capital Markets Central Monitor</h1>
                  <p className="text-muted-foreground">Building Rwanda's Wall Street - University Collaboration Hub</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Live Monitor
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Market Overview', icon: BarChart3 },
              { id: 'teams', label: 'Active Teams', icon: Users },
              { id: 'companies', label: 'Listed Companies', icon: Building2 },
              { id: 'universities', label: 'Universities', icon: School }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedView(tab.id as any)}
                className={`flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                  selectedView === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {selectedView === 'overview' && marketData && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Teams</p>
                      <p className="text-2xl font-bold">{marketData.totalTeams}</p>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <ArrowUp className="w-3 h-3" />
                        +12% this month
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Deals</p>
                      <p className="text-2xl font-bold">{marketData.activeDeals}</p>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <ArrowUp className="w-3 h-3" />
                        +8% this week
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <Briefcase className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Capital Raised</p>
                      <p className="text-2xl font-bold">RWF {(marketData.totalCapitalRaised / 1000000000).toFixed(1)}B</p>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <ArrowUp className="w-3 h-3" />
                        +{marketData.marketGrowth}% growth
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <DollarSign className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Students</p>
                      <p className="text-2xl font-bold">{marketData.totalStudents}</p>
                      <p className="text-xs text-muted-foreground">{marketData.universities} universities</p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-full">
                      <School className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Market Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Market Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Average Team Performance</span>
                      <span className="font-medium">{marketData.averageTeamPerformance}%</span>
                    </div>
                    <Progress value={marketData.averageTeamPerformance} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{marketData.completedDeals}</p>
                      <p className="text-sm text-green-700">Completed Deals</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{marketData.activeDeals}</p>
                      <p className="text-sm text-blue-700">Active Deals</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Recent Company Listings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {listedCompanies.slice(0, 3).map((company) => (
                      <div key={company.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{company.name}</p>
                          <p className="text-sm text-muted-foreground">{company.sector} • {company.university}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">RWF {company.currentPrice}</p>
                          <p className={`text-sm flex items-center gap-1 ${
                            company.performance > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {company.performance > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                            {Math.abs(company.performance)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Performing Teams */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Top Performing Teams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeTeams
                    .sort((a, b) => b.performance - a.performance)
                    .slice(0, 5)
                    .map((team, index) => (
                      <div key={team.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-white font-bold text-sm">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{team.name}</p>
                          <p className="text-sm text-muted-foreground">{team.university}</p>
                        </div>
                        <div className="text-center">
                          <p className="font-medium">{team.currentDeal}</p>
                          <p className="text-sm text-muted-foreground">RWF {(team.capitalTarget / 1000000).toFixed(0)}M target</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-lg">{team.performance}%</p>
                          <p className="text-sm text-muted-foreground">Performance</p>
                        </div>
                        <Badge className={
                          team.status === 'completed' ? 'bg-green-100 text-green-800' :
                          team.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {team.status}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedView === 'teams' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Active Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeTeams.map((team) => (
                    <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                        <p className="font-medium">{team.name}</p>
                        <p className="text-sm text-muted-foreground">{team.university}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {team.studentsCount} students
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {team.currentDeal}
                          </span>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Progress:</span>
                          <span className="font-medium">{team.progress}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Performance:</span>
                          <span className="font-medium">{team.performance}%</span>
                        </div>
                        <Badge className={
                          team.status === 'completed' ? 'bg-green-100 text-green-800' :
                          team.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {team.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedView === 'companies' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Listed Companies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {listedCompanies.map((company) => (
                    <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <p className="font-medium">{company.name}</p>
                        <p className="text-sm text-muted-foreground">{company.sector} • {company.university}</p>
                        <p className="text-xs text-muted-foreground">
                          Listed: {company.listingDate.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-bold text-lg">RWF {company.currentPrice}</p>
                        <p className={`text-sm flex items-center gap-1 justify-end ${
                          company.performance > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {company.performance > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                          {Math.abs(company.performance)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Market Cap: RWF {(company.marketCap / 1000000).toFixed(0)}M
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedView === 'universities' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {universityStats.map((university) => (
                <Card key={university.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <School className="w-5 h-5" />
                      {university.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Active Teams</p>
                        <p className="font-bold text-lg">{university.activeTeams}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completed Deals</p>
                        <p className="font-bold text-lg">{university.completedDeals}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Students</p>
                        <p className="font-bold text-lg">{university.studentsParticipating}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Avg Performance</p>
                        <p className="font-bold text-lg">{university.averagePerformance}%</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">Total Capital Raised</p>
                      <p className="font-bold text-xl text-primary">
                        RWF {(university.totalCapitalRaised / 1000000000).toFixed(1)}B
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}