"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Flame, Trophy, TrendingUp, Crown } from "lucide-react"
import { useGamification } from "@/contexts/gamification-context"
import { useGamificationEvents } from "@/hooks/use-gamification-events"
import { GamificationProgressCard } from "@/components/gamification-progress-card"
import { useToast } from "@/hooks/use-toast"
import { Button } from "react-native"
import { Button } from "react-native"
import { Button } from "react-native"
import { Button } from "react-native"

interface GamificationHubProps {
  userId?: string
  teamId?: string
}

export function GamificationHub({ userId, teamId }: GamificationHubProps) {
  const gamification = useGamification()
  const { onDailyLogin } = useGamificationEvents()
  const { toast } = useToast()

  // Initialize gamification data
  useEffect(() => {
    const initializeGamification = async () => {
      if (userId) {
        await gamification.initializeUserGamification(userId)
        await onDailyLogin(userId) // Trigger daily login
      }
      await gamification.loadAvailableItems()
    }

    initializeGamification()
  }, [userId]) // Only depend on userId to prevent infinite re-renders

  const stats = gamification.userGamification

  // Calculate level progress
  const getXPForNextLevel = (level: number) => (level * level) * 100
  const getCurrentLevelXP = (level: number) => ((level - 1) * (level - 1)) * 100
  
  const currentLevel = stats?.level || 1
  const currentXP = stats?.xp || 0
  const nextLevelXP = getXPForNextLevel(currentLevel)
  const currentLevelStartXP = getCurrentLevelXP(currentLevel)
  const progressXP = currentXP - currentLevelStartXP
  const neededXP = nextLevelXP - currentLevelStartXP



  if (gamification.loading) {
    return (
      <div className="space-y-4">
        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Enhanced Progress Card */}
      <GamificationProgressCard 
        userId={userId}
        teamId={teamId}
        mode="individual"
      />

      {/* Level & XP Progress */}
      <Card className="bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent card-hover african-pattern">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="text-2xl font-bold text-foreground">{currentLevel}</p>
              </div>
            </div>
            <Badge className="bg-secondary text-secondary-foreground">
              <TrendingUp className="w-3 h-3 mr-1" />
              {currentLevel >= 10 ? "Elite Trader" : currentLevel >= 5 ? "Rising Star" : "Beginner"}
            </Badge>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">XP Progress</span>
              <span className="font-medium text-foreground">
                {progressXP} / {neededXP}
              </span>
            </div>
            <Progress value={(progressXP / neededXP) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Daily Streak */}
      <Card className="bg-gradient-to-br from-orange-500/10 to-transparent card-hover">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Flame className="w-5 h-5 text-orange-500 animate-float" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Daily Streak</p>
                <p className="text-2xl font-bold text-foreground">{stats?.daily_streak || 0} days</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-orange-500/20 text-orange-500 hover:bg-orange-500/10 bg-transparent"
              onClick={() => userId && onDailyLogin(userId)}
            >
              Claim Bonus
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Keep trading daily to maintain your streak and earn bonus XP!
          </p>
        </CardContent>
      </Card>



      {/* Recent Achievements */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-transparent card-hover">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Trophy className="w-5 h-5 text-purple-500 animate-float" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Achievements</p>
              <p className="text-xs text-muted-foreground">
                {stats?.total_achievements || 0} unlocked
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {gamification.userAchievements?.slice(0, 2).map((achievement: any) => (
              <div key={achievement.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                <div className="text-lg">{achievement.achievements?.icon || '🏆'}</div>
                <div className="flex-1">
                  <p className="text-xs font-medium">{achievement.achievements?.name}</p>
                  <p className="text-xs text-muted-foreground">+{achievement.achievements?.xp_reward} XP</p>
                </div>
              </div>
            ))}
            {(!gamification.userAchievements || gamification.userAchievements.length === 0) && (
              <p className="text-xs text-muted-foreground text-center py-2">
                Start trading to unlock achievements!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Competition */}
      <Card className="bg-gradient-to-br from-yellow-500/10 to-transparent card-hover">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Trophy className="w-5 h-5 text-yellow-500 animate-float" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Weekly Competition</p>
              <p className="text-xs text-muted-foreground">Ends in 3 days</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your XP</span>
              <span className="font-bold text-foreground">{currentXP}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Prize Pool</span>
              <span className="font-bold text-yellow-500">5,000 XP</span>
            </div>
          </div>
          <Button size="sm" className="w-full mt-3 bg-yellow-500 hover:bg-yellow-600 text-yellow-950">
            View Leaderboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
