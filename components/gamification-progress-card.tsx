"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Zap, Trophy, Flame, Star, TrendingUp, Plus } from "lucide-react"
import { useGamification } from "@/contexts/gamification-context"

interface GamificationProgressCardProps {
  userId?: string
  teamId?: string
  mode: 'individual' | 'team'
}

export function GamificationProgressCard({ userId, teamId, mode }: GamificationProgressCardProps) {
  const gamification = useGamification()
  
  const stats = mode === 'individual' ? gamification.userGamification : gamification.teamGamification
  const achievements = mode === 'individual' ? gamification.userAchievements : gamification.teamAchievements

  // Calculate level progress
  const getXPForNextLevel = (level: number) => (level * level) * 100
  const getCurrentLevelXP = (level: number) => ((level - 1) * (level - 1)) * 100
  
  const currentLevel = stats?.level || 1
  const currentXP = stats?.xp || 0
  const nextLevelXP = getXPForNextLevel(currentLevel)
  const currentLevelStartXP = getCurrentLevelXP(currentLevel)
  const progressXP = currentXP - currentLevelStartXP
  const neededXP = nextLevelXP - currentLevelStartXP
  const progressPercentage = neededXP > 0 ? (progressXP / neededXP) * 100 : 0

  // Recent XP gains (mock data for now)
  const recentGains = [
    { action: "Trade Executed", xp: 50, time: "2 min ago" },
    { action: "Daily Login", xp: 25, time: "1 hour ago" },
    { action: "Achievement Unlocked", xp: 100, time: "3 hours ago" },
  ]

  if (gamification.loading) {
    return (
      <Card className="card-hover">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Loading progress...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 card-hover">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="w-5 h-5 text-blue-600" />
            Your Progress
          </CardTitle>
          <Badge className="bg-blue-600 text-white">
            Level {currentLevel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level Progress with Animation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {currentLevel}
                </div>
                {progressPercentage > 90 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse flex items-center justify-center">
                    <span className="text-xs">!</span>
                  </div>
                )}
              </div>
              <div>
                <p className="font-bold text-gray-800">Level {currentLevel}</p>
                <p className="text-xs text-gray-600">
                  {progressPercentage >= 90 ? "Almost there!" : 
                   progressPercentage >= 50 ? "Halfway to next level" : 
                   "Keep going!"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">Next Level</p>
              <p className="text-lg font-bold text-purple-600">{currentLevel + 1}</p>
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Level Progress</span>
              <span className="text-blue-600 font-bold">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out relative"
                  style={{ width: `${Math.max(progressPercentage, 2)}%` }}
                >
                  {progressPercentage > 10 && (
                    <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full"></div>
                  )}
                </div>
              </div>
              {/* Progress markers */}
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>0</span>
                <span className="text-purple-600 font-medium">{progressXP}</span>
                <span>{neededXP}</span>
              </div>
            </div>
            
            {/* XP to next level with visual emphasis */}
            <div className={`text-center p-2 rounded-lg transition-all duration-300 ${
              progressPercentage >= 90 
                ? "bg-yellow-100 border border-yellow-300 text-yellow-800" 
                : progressPercentage >= 50 
                ? "bg-blue-100 border border-blue-300 text-blue-800"
                : "bg-gray-100 border border-gray-300 text-gray-700"
            }`}>
              <p className="font-bold">
                {neededXP - progressXP} XP to Level {currentLevel + 1}
              </p>
              {progressPercentage >= 90 && (
                <p className="text-xs animate-pulse">🎉 Level up incoming!</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <Zap className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-800">{currentXP}</p>
            <p className="text-xs text-gray-600">Total XP</p>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <Trophy className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-800">{achievements?.length || 0}</p>
            <p className="text-xs text-gray-600">Achievements</p>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <Flame className="w-5 h-5 text-orange-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-800">{stats?.daily_streak || 0}</p>
            <p className="text-xs text-gray-600">Day Streak</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            Recent XP Gains
          </h4>
          <div className="space-y-1">
            {recentGains.slice(0, 3).map((gain, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white/40 rounded text-xs">
                <div className="flex items-center gap-2">
                  <Plus className="w-3 h-3 text-green-600" />
                  <span className="text-gray-700">{gain.action}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-green-600">+{gain.xp} XP</span>
                  <span className="text-gray-500">{gain.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Milestone */}
        <div className="p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-800">Next Milestone</p>
              <p className="text-xs text-purple-600">Level {currentLevel + 1}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-purple-800">{neededXP - progressXP}</p>
              <p className="text-xs text-purple-600">XP needed</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}