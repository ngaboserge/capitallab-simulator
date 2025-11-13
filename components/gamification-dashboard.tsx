"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Star, Zap, Target, TrendingUp, Users } from 'lucide-react'
import { useGamification } from '@/contexts/gamification-context'
import { useGamificationEvents } from '@/hooks/use-gamification-events'

interface GamificationDashboardProps {
  userId?: string
  teamId?: string
  mode: 'individual' | 'team'
}

export function GamificationDashboard({ userId, teamId, mode }: GamificationDashboardProps) {
  const gamification = useGamification()
  const { activatePowerUp, getUserLeaderboard, getTeamLeaderboard } = useGamificationEvents()
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const stats = mode === 'individual' ? gamification.userGamification : gamification.teamGamification
  const achievements = mode === 'individual' ? gamification.userAchievements : gamification.teamAchievements
  const activePowerUps = mode === 'individual' ? gamification.userActivePowerUps : gamification.teamActivePowerUps
  const missions = mode === 'individual' ? gamification.userMissionProgress : gamification.teamMissionProgress

  useEffect(() => {
    loadLeaderboard()
  }, [mode])

  const loadLeaderboard = async () => {
    try {
      const data = mode === 'individual' 
        ? await getUserLeaderboard(10)
        : await getTeamLeaderboard(10)
      setLeaderboard(data)
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePowerUpActivation = async (powerUpId: string) => {
    if (!userId) return
    
    const result = await activatePowerUp(userId, powerUpId)
    if (result.success) {
      // Refresh data
      if (userId) await gamification.initializeUserGamification(userId)
    }
  }

  const getXPForNextLevel = (level: number) => {
    return (level * level) * 100
  }

  const getCurrentLevelXP = (level: number) => {
    return ((level - 1) * (level - 1)) * 100
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Level</p>
                <p className="text-2xl font-bold">{stats?.level || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">XP</p>
                <p className="text-2xl font-bold">{stats?.xp || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Streak</p>
                <p className="text-2xl font-bold">{stats?.daily_streak || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Achievements</p>
                <p className="text-2xl font-bold">{stats?.total_achievements || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Level Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Level {stats.level}</span>
                <span>Level {stats.level + 1}</span>
              </div>
              <Progress 
                value={((stats.xp - getCurrentLevelXP(stats.level)) / (getXPForNextLevel(stats.level) - getCurrentLevelXP(stats.level))) * 100}
                className="h-3"
              />
              <p className="text-sm text-gray-600 text-center">
                {stats.xp - getCurrentLevelXP(stats.level)} / {getXPForNextLevel(stats.level) - getCurrentLevelXP(stats.level)} XP
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="achievements" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="missions">Missions</TabsTrigger>
          <TabsTrigger value="powerups">Power-ups</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements?.slice(0, 5).map((achievement: any) => (
                  <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl">{achievement.achievements?.icon || '🏆'}</div>
                    <div className="flex-1">
                      <h4 className="font-medium">{achievement.achievements?.name}</h4>
                      <p className="text-sm text-gray-600">{achievement.achievements?.description}</p>
                    </div>
                    <Badge variant="secondary">+{achievement.achievements?.xp_reward} XP</Badge>
                  </div>
                ))}
                {(!achievements || achievements.length === 0) && (
                  <p className="text-gray-500 text-center py-4">No achievements yet. Start trading to earn your first achievement!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="missions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Missions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {missions?.filter((m: any) => !m.is_completed).map((mission: any) => (
                  <div key={mission.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{mission.missions?.name}</h4>
                        <p className="text-sm text-gray-600">{mission.missions?.description}</p>
                      </div>
                      <Badge variant="outline">+{mission.missions?.xp_reward} XP</Badge>
                    </div>
                    <div className="space-y-2">
                      <Progress 
                        value={(mission.current_progress / mission.missions?.target_value) * 100}
                        className="h-2"
                      />
                      <p className="text-sm text-gray-600">
                        {mission.current_progress} / {mission.missions?.target_value}
                      </p>
                    </div>
                  </div>
                ))}
                {(!missions || missions.filter((m: any) => !m.is_completed).length === 0) && (
                  <p className="text-gray-500 text-center py-4">No active missions. Check back later for new challenges!</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="powerups" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Active Power-ups */}
            <Card>
              <CardHeader>
                <CardTitle>Active Power-ups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activePowerUps?.map((powerUp: any) => (
                    <div key={powerUp.id} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl">{powerUp.power_ups?.icon || '⚡'}</div>
                      <div className="flex-1">
                        <h4 className="font-medium">{powerUp.power_ups?.name}</h4>
                        <p className="text-sm text-gray-600">
                          Expires: {new Date(powerUp.expires_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!activePowerUps || activePowerUps.length === 0) && (
                    <p className="text-gray-500 text-center py-4">No active power-ups</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Available Power-ups */}
            <Card>
              <CardHeader>
                <CardTitle>Power-up Shop</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {gamification.availablePowerUps?.map((powerUp: any) => (
                    <div key={powerUp.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="text-2xl">{powerUp.icon || '⚡'}</div>
                      <div className="flex-1">
                        <h4 className="font-medium">{powerUp.name}</h4>
                        <p className="text-sm text-gray-600">{powerUp.description}</p>
                        <p className="text-sm font-medium text-blue-600">{powerUp.cost_xp} XP</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handlePowerUpActivation(powerUp.id)}
                        disabled={!stats || stats.xp < powerUp.cost_xp}
                      >
                        Activate
                      </Button>
                    </div>
                  ))}
                  {(!gamification.availablePowerUps || gamification.availablePowerUps.length === 0) && (
                    <p className="text-gray-500 text-center py-4">No power-ups available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {mode === 'individual' ? <Users className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                <span>{mode === 'individual' ? 'User' : 'Team'} Leaderboard</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry: any, index: number) => (
                  <div key={entry.user_id || entry.team_id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {mode === 'team' ? entry.teams?.name : `User ${entry.user_id?.slice(0, 8)}`}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Level {entry.level} • {entry.total_achievements} achievements
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{entry.xp} XP</p>
                      <p className="text-sm text-gray-600">{entry.daily_streak} day streak</p>
                    </div>
                  </div>
                ))}
                {leaderboard.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No leaderboard data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}