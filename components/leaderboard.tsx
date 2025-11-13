"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Medal, Award, Users, Star, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useGamificationEvents } from "@/hooks/use-gamification-events"

interface Leader {
  rank: number
  name: string
  profit?: number
  profitPercent?: number
  points?: number
  xp?: number
  level?: number
  streak?: number
  achievements?: number
  user_id?: string
  team_id?: string
}

// Fallback data for demo purposes
const fallbackIndividualLeaders: Leader[] = [
  { rank: 1, name: "Alice K.", profit: 45820, profitPercent: 45.82, points: 2850, xp: 3200, level: 12, streak: 15, achievements: 8 },
  { rank: 2, name: "John M.", profit: 38950, profitPercent: 38.95, points: 2420, xp: 2800, level: 10, streak: 12, achievements: 6 },
  { rank: 3, name: "Sarah N.", profit: 32100, profitPercent: 32.1, points: 2180, xp: 2400, level: 9, streak: 8, achievements: 5 },
  { rank: 4, name: "David R.", profit: 28400, profitPercent: 28.4, points: 1950, xp: 2100, level: 8, streak: 5, achievements: 4 },
  { rank: 5, name: "Emma T.", profit: 25840, profitPercent: 25.84, points: 1820, xp: 1900, level: 7, streak: 3, achievements: 3 },
]

const fallbackTeamLeaders: Leader[] = [
  { rank: 1, name: "Elite Traders", xp: 8500, level: 15, streak: 20, achievements: 12 },
  { rank: 2, name: "Market Masters", xp: 7200, level: 13, streak: 18, achievements: 10 },
  { rank: 3, name: "Trading Titans", xp: 6800, level: 12, streak: 15, achievements: 9 },
  { rank: 4, name: "Profit Pioneers", xp: 6200, level: 11, streak: 12, achievements: 8 },
  { rank: 5, name: "Stock Sharks", xp: 5900, level: 10, streak: 10, achievements: 7 },
]

interface LeaderboardProps {
  mode?: 'individual' | 'team' | 'both'
}

export function Leaderboard({ mode = 'both' }: LeaderboardProps) {
  const [individualLeaders, setIndividualLeaders] = useState<Leader[]>(fallbackIndividualLeaders)
  const [teamLeaders, setTeamLeaders] = useState<Leader[]>(fallbackTeamLeaders)
  const [loading, setLoading] = useState(false)
  const { getUserLeaderboard, getTeamLeaderboard } = useGamificationEvents()

  useEffect(() => {
    loadLeaderboards()
  }, [])

  const loadLeaderboards = async () => {
    setLoading(true)
    try {
      const [userLeaderboard, teamLeaderboard] = await Promise.all([
        getUserLeaderboard(10),
        getTeamLeaderboard(10)
      ])

      // Transform data and add fallback if empty
      if (userLeaderboard && userLeaderboard.length > 0) {
        const transformedUsers = userLeaderboard.map((user: any, index: number) => ({
          rank: index + 1,
          name: `User ${user.user_id?.slice(0, 8)}`,
          xp: user.xp,
          level: user.level,
          streak: user.daily_streak,
          achievements: user.total_achievements,
          user_id: user.user_id
        }))
        setIndividualLeaders(transformedUsers)
      }

      if (teamLeaderboard && teamLeaderboard.length > 0) {
        const transformedTeams = teamLeaderboard.map((team: any, index: number) => ({
          rank: index + 1,
          name: team.teams?.name || `Team ${team.team_id?.slice(0, 8)}`,
          xp: team.xp,
          level: team.level,
          streak: team.daily_streak,
          achievements: team.total_achievements,
          team_id: team.team_id
        }))
        setTeamLeaders(transformedTeams)
      }
    } catch (error) {
      console.error('Error loading leaderboards:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500 animate-float" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Award className="w-5 h-5 text-orange-500" />
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>
    }
  }

  const renderLeaderboardContent = (leaders: Leader[], type: 'individual' | 'team') => (
    <div className="space-y-3">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-muted-foreground">Loading leaderboard...</span>
        </div>
      ) : (
        leaders.map((leader, index) => (
          <div
            key={leader.user_id || leader.team_id || leader.rank}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all animate-slide-up card-hover ${
              leader.rank === 1
                ? "border-yellow-500 bg-gradient-to-r from-yellow-500/10 to-orange-500/5 animate-glow-pulse"
                : leader.rank === 2
                ? "border-gray-400 bg-gradient-to-r from-gray-400/10 to-gray-300/5"
                : leader.rank === 3
                ? "border-orange-500 bg-gradient-to-r from-orange-500/10 to-red-500/5"
                : "border-border bg-card hover:bg-muted/50"
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-center w-8">{getRankIcon(leader.rank)}</div>

            <Avatar className="h-9 w-9 border-2 border-border">
              <AvatarFallback
                className={`text-xs font-semibold ${
                  leader.rank === 1
                    ? "bg-gradient-to-br from-yellow-500 to-orange-500 text-white"
                    : leader.rank === 2
                    ? "bg-gradient-to-br from-gray-400 to-gray-500 text-white"
                    : leader.rank === 3
                    ? "bg-gradient-to-br from-orange-500 to-red-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {type === 'team' ? (
                  <Users className="w-4 h-4" />
                ) : (
                  leader.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                )}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{leader.name}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {leader.level && (
                  <Badge variant="outline" className="text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Lv.{leader.level}
                  </Badge>
                )}
                {leader.streak && leader.streak > 0 && (
                  <Badge variant="outline" className="text-xs text-orange-500 border-orange-500/20">
                    🔥 {leader.streak}
                  </Badge>
                )}
                {leader.achievements && leader.achievements > 0 && (
                  <Badge variant="outline" className="text-xs text-purple-500 border-purple-500/20">
                    🏆 {leader.achievements}
                  </Badge>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-blue-500" />
                <p className="text-sm font-bold text-blue-500">{leader.xp?.toLocaleString() || 0}</p>
              </div>
              {leader.profit && (
                <p className="text-xs text-green-500">+{leader.profitPercent}%</p>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )

  if (mode === 'individual') {
    return (
      <Card className="african-pattern card-hover">
        <CardHeader>
          <CardTitle className="text-foreground">Individual Leaderboard</CardTitle>
          <p className="text-sm text-muted-foreground">Top XP earners this month</p>
        </CardHeader>
        <CardContent>
          {renderLeaderboardContent(individualLeaders, 'individual')}
        </CardContent>
      </Card>
    )
  }

  if (mode === 'team') {
    return (
      <Card className="african-pattern card-hover">
        <CardHeader>
          <CardTitle className="text-foreground">Team Leaderboard</CardTitle>
          <p className="text-sm text-muted-foreground">Top performing teams</p>
        </CardHeader>
        <CardContent>
          {renderLeaderboardContent(teamLeaders, 'team')}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="african-pattern card-hover">
      <CardHeader>
        <CardTitle className="text-foreground">Leaderboards</CardTitle>
        <p className="text-sm text-muted-foreground">Top performers this month</p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="individual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              Individual
            </TabsTrigger>
            <TabsTrigger value="team" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              Teams
            </TabsTrigger>
          </TabsList>
          <TabsContent value="individual" className="mt-4">
            {renderLeaderboardContent(individualLeaders, 'individual')}
          </TabsContent>
          <TabsContent value="team" className="mt-4">
            {renderLeaderboardContent(teamLeaders, 'team')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
