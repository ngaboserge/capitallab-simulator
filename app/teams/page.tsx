'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Plus, 
  Search, 
  Building2, 
  TrendingUp, 
  Clock, 
  Award,
  MapPin,
  Target,
  ArrowRight,
  UserPlus,
  School,
  Briefcase
} from 'lucide-react'

interface Team {
  id: string
  name: string
  university: string
  description: string
  memberCount: number
  maxMembers: number
  currentDeal: string | null
  progress: number
  performance: number
  status: 'forming' | 'active' | 'completed'
  createdAt: Date
  tags: string[]
  isPublic: boolean
  inviteCode?: string
}

export default function TeamsPage() {
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'forming' | 'active' | 'completed'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockTeams: Team[] = [
      {
        id: 'team_001',
        name: 'Kigali University Capital Markets 2024',
        university: 'University of Rwanda - Kigali',
        description: 'Focused on renewable energy and sustainable development projects in Rwanda',
        memberCount: 8,
        maxMembers: 10,
        currentDeal: 'Green Energy Rwanda Ltd',
        progress: 65,
        performance: 91,
        status: 'active',
        createdAt: new Date('2024-10-01'),
        tags: ['Renewable Energy', 'Sustainability', 'IPO'],
        isPublic: true
      },
      {
        id: 'team_002',
        name: 'AUCA Finance Team Alpha',
        university: 'Adventist University of Central Africa',
        description: 'Technology-focused team exploring fintech and digital innovation opportunities',
        memberCount: 6,
        maxMembers: 12,
        currentDeal: null,
        progress: 0,
        performance: 0,
        status: 'forming',
        createdAt: new Date('2024-10-15'),
        tags: ['Technology', 'Fintech', 'Innovation'],
        isPublic: true,
        inviteCode: 'AUCA2024'
      },
      {
        id: 'team_003',
        name: 'KIE Engineering Capital',
        university: 'Kigali Institute of Engineering',
        description: 'Infrastructure and engineering solutions for Rwanda\'s development',
        memberCount: 9,
        maxMembers: 9,
        currentDeal: 'Smart Infrastructure Ltd',
        progress: 100,
        performance: 94,
        status: 'completed',
        createdAt: new Date('2024-09-01'),
        tags: ['Infrastructure', 'Engineering', 'Smart City'],
        isPublic: true
      },
      {
        id: 'team_004',
        name: 'INES Agri-Tech Innovators',
        university: 'Institut d\'Enseignement Supérieur de Ruhengeri',
        description: 'Agricultural technology and food security solutions',
        memberCount: 7,
        maxMembers: 10,
        currentDeal: 'AgriTech Solutions Rwanda',
        progress: 45,
        performance: 87,
        status: 'active',
        createdAt: new Date('2024-09-20'),
        tags: ['Agriculture', 'Food Security', 'Technology'],
        isPublic: true
      }
    ]

    setTimeout(() => {
      setTeams(mockTeams)
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = filterStatus === 'all' || team.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const handleCreateTeam = () => {
    router.push('/teams/create')
  }

  const handleJoinTeam = (teamId: string) => {
    router.push(`/teams/${teamId}/join`)
  }

  const handleViewTeam = (teamId: string) => {
    router.push(`/teams/${teamId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading teams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-b">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                🚀 Collaborative Learning Platform
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
                Join a Capital Markets Team
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Collaborate with university students across Rwanda to simulate real capital raising processes. 
                Build companies, navigate regulations, and create Rwanda's future financial ecosystem.
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <Button onClick={handleCreateTeam} size="lg" className="px-8">
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
              <Button variant="outline" size="lg" onClick={() => setSearchQuery('')}>
                <Search className="w-4 h-4 mr-2" />
                Browse Teams
              </Button>
            </div>

            <Alert className="max-w-2xl mx-auto bg-amber-50 border-amber-200">
              <Building2 className="h-4 w-4" />
              <AlertDescription>
                <strong>Team-Based Learning:</strong> Each team simulates the complete capital raising process 
                with 7-8 students taking different institutional roles. Your team's success contributes to 
                building Rwanda's virtual stock exchange.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search teams by name, university, or focus area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['all', 'forming', 'active', 'completed'].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus(status as any)}
                className="capitalize"
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{teams.length}</p>
                  <p className="text-sm text-muted-foreground">Total Teams</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Briefcase className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{teams.filter(t => t.status === 'active').length}</p>
                  <p className="text-sm text-muted-foreground">Active Deals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <School className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{new Set(teams.map(t => t.university)).size}</p>
                  <p className="text-sm text-muted-foreground">Universities</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <UserPlus className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{teams.filter(t => t.status === 'forming').length}</p>
                  <p className="text-sm text-muted-foreground">Recruiting</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Card key={team.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {team.university}
                    </div>
                  </div>
                  <Badge className={
                    team.status === 'forming' ? 'bg-yellow-100 text-yellow-800' :
                    team.status === 'active' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }>
                    {team.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {team.description}
                </p>

                {/* Team Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{team.memberCount}/{team.maxMembers} members</span>
                  </div>
                  {team.currentDeal && (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{team.currentDeal}</span>
                    </div>
                  )}
                  {team.status === 'active' && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{team.progress}% complete</span>
                    </div>
                  )}
                  {team.performance > 0 && (
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-muted-foreground" />
                      <span>{team.performance}% performance</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {team.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {team.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{team.tags.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewTeam(team.id)}
                  >
                    View Details
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                  {team.status === 'forming' && team.memberCount < team.maxMembers && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleJoinTeam(team.id)}
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      Join
                    </Button>
                  )}
                </div>

                {team.inviteCode && (
                  <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                    Invite Code: <span className="font-mono font-medium">{team.inviteCode}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTeams.length === 0 && (
          <div className="text-center py-12">
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-medium">No teams found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search criteria' : 'Be the first to create a team!'}
                </p>
              </div>
              <Button onClick={handleCreateTeam}>
                <Plus className="w-4 h-4 mr-2" />
                Create New Team
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}