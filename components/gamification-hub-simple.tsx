"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Flame, Trophy, TrendingUp, Crown } from "lucide-react"
import { useGamification } from "@/contexts/gamification-context"
import { useGamificationEvents } from "@/hooks/use-gamification-events"
import { GamificationProgressCard } from "@/components/gamification-progress-card"

interface GamificationHubSimpleProps {
  userId?: string
  teamId?: string
}

export function GamificationHubSimple({ userId, teamId }: GamificationHubSimpleProps) {
  const gamification = useGamification()
  const { onDailyLogin } = useGamificationEvents()

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
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-8 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* XP and Level Progress */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-transparent card-hover">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <TrendingUp className="w-5 h-5 text-blue-500 animate-float" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Level {currentLevel}</p>
              <p className="text-xs text-muted-foreground">{currentXP.toLocaleString()} XP</p>
            </div>
            <div className="ml-auto">
              <Badge variant="secondary" className="text-xs">
                {neededXP - progressXP} XP to Level {currentLevel + 1}
              </Badge>
            </div>
          </div>
          <Progress 
            value={(progressXP / neededXP) * 100} 
            className="h-2 mb-2" 
          />
          <p className="text-xs text-muted-foreground text-center">
            {progressXP.toLocaleString()} / {neededXP.toLocaleString()} XP
          </p>
        </CardContent>
      </Card>

      {/* Daily Streak */}
      <Card className="bg-gradient-to-br from-orange-500/10 to-transparent card-hover">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/20">
              <Flame className="w-5 h-5 text-orange-500 animate-bounce" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Daily Streak</p>
              <p className="text-xs text-muted-foreground">
                {stats?.daily_streak || 0} days in a row
              </p>
            </div>
            <div className="ml-auto">
              <Badge variant="outline" className="text-xs border-orange-500 text-orange-500">
                +{25 + (stats?.daily_streak || 0) * 5} XP daily
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements - Using proper design pattern */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-transparent card-hover">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Trophy className="w-5 h-5 text-purple-500 animate-float" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Recent Achievements</p>
              <p className="text-xs text-muted-foreground">
                {stats?.total_achievements || 0} unlocked
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {gamification.userAchievements?.slice(0, 2).map((achievement: any) => {
              const achievementData = achievement.achievements || achievement
              return (
                <div key={achievement.id} className="flex items-start gap-3 p-3 rounded-lg border border-primary bg-primary/5">
                  <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-foreground">{achievementData.name}</h4>
                      <Badge variant="default" className="text-xs">
                        +{achievementData.xp_reward} XP
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{achievementData.description}</p>
                  </div>
                </div>
              )
            })}
            {(!gamification.userAchievements || gamification.userAchievements.length === 0) && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground text-center py-2">
                  Complete actions to unlock achievements!
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 rounded border border-border bg-muted/30">
                    <div className="p-1.5 rounded bg-muted">
                      <TrendingUp className="w-3 h-3" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium">First Trade</p>
                      <p className="text-xs text-muted-foreground">+100 XP</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded border border-border bg-muted/30">
                    <div className="p-1.5 rounded bg-muted">
                      <Flame className="w-3 h-3" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium">3-Day Streak</p>
                      <p className="text-xs text-muted-foreground">+200 XP</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Competition */}
      <Card className="bg-gradient-to-br from-yellow-500/10 to-transparent card-hover">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-yellow-500/20">
              <Crown className="w-5 h-5 text-yellow-500 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Weekly Challenge</p>
              <p className="text-xs text-muted-foreground">Complete 10 trades this week</p>
            </div>
          </div>
          <div className="space-y-2">
            <Progress value={30} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>3 / 10 trades</span>
              <span>+500 XP reward</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* XP Earning Tips */}
      <Card className="card-hover">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Earn XP By:</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Making a trade</span>
            <span className="font-medium text-foreground">+50 XP</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Daily login</span>
            <span className="font-medium text-foreground">+25 XP</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Adding to watchlist</span>
            <span className="font-medium text-foreground">+10 XP</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Profitable trade</span>
            <span className="font-medium text-foreground">Bonus XP</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}