"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Target, TrendingUp, Zap, Star, CheckCircle2, Lock, Flame, Coins, BarChart3, Users } from "lucide-react"

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  points: number
  unlocked: boolean
  progress?: number
  maxProgress?: number
  type?: "individual" | "team"
}

interface Mission {
  id: string
  title: string
  description: string
  reward: number
  progress: number
  maxProgress: number
  icon: React.ReactNode
  type?: "individual" | "team"
}

const achievements: Achievement[] = [
  {
    id: "first-trade",
    title: "First Trade",
    description: "Execute your first trade",
    icon: <Target className="w-5 h-5" />,
    points: 50,
    unlocked: true,
    type: "individual",
  },
  {
    id: "profit-maker",
    title: "Profit Maker",
    description: "Achieve 10% portfolio growth",
    icon: <TrendingUp className="w-5 h-5" />,
    points: 100,
    unlocked: true,
    type: "individual",
  },
  {
    id: "diversified",
    title: "Diversified Investor",
    description: "Own stocks in 4 different sectors",
    icon: <BarChart3 className="w-5 h-5" />,
    points: 150,
    unlocked: true,
    type: "individual",
  },
  {
    id: "team-player",
    title: "Team Player",
    description: "Execute 10 team trades",
    icon: <Users className="w-5 h-5" />,
    points: 150,
    unlocked: true,
    type: "team",
  },
  {
    id: "hot-streak",
    title: "Hot Streak",
    description: "Make 5 profitable trades in a row",
    icon: <Flame className="w-5 h-5" />,
    points: 200,
    unlocked: false,
    progress: 3,
    maxProgress: 5,
    type: "individual",
  },
  {
    id: "team-champion",
    title: "Team Champion",
    description: "Lead your team to top 3 on leaderboard",
    icon: <Trophy className="w-5 h-5" />,
    points: 400,
    unlocked: false,
    progress: 2,
    maxProgress: 3,
    type: "team",
  },
  {
    id: "market-expert",
    title: "Market Expert",
    description: "Achieve 50% total returns",
    icon: <Star className="w-5 h-5" />,
    points: 500,
    unlocked: false,
    progress: 25,
    maxProgress: 50,
    type: "individual",
  },
  {
    id: "top-trader",
    title: "Top Trader",
    description: "Reach top 10 on leaderboard",
    icon: <Trophy className="w-5 h-5" />,
    points: 300,
    unlocked: false,
    type: "individual",
  },
]

const missions: Mission[] = [
  {
    id: "daily-trade",
    title: "Daily Trader",
    description: "Execute 3 trades today",
    reward: 50,
    progress: 1,
    maxProgress: 3,
    icon: <Zap className="w-5 h-5" />,
    type: "individual",
  },
  {
    id: "team-coordination",
    title: "Team Coordination",
    description: "All team members trade today",
    reward: 120,
    progress: 3,
    maxProgress: 4,
    icon: <Users className="w-5 h-5" />,
    type: "team",
  },
  {
    id: "sector-explorer",
    title: "Sector Explorer",
    description: "Trade in all 4 sectors",
    reward: 100,
    progress: 2,
    maxProgress: 4,
    icon: <Target className="w-5 h-5" />,
    type: "individual",
  },
  {
    id: "portfolio-builder",
    title: "Portfolio Builder",
    description: "Reach RWF 150,000 portfolio value",
    reward: 150,
    progress: 125840,
    maxProgress: 150000,
    icon: <Coins className="w-5 h-5" />,
    type: "individual",
  },
]

export function AchievementsPanel() {
  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const totalPoints = achievements.filter((a) => a.unlocked).reduce((sum, a) => sum + a.points, 0)

  const teamAchievements = achievements.filter((a) => a.type === "team" && a.unlocked).length
  const individualAchievements = achievements.filter((a) => a.type === "individual" && a.unlocked).length

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-transparent card-hover">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Trophy className="w-8 h-8 text-primary mb-2 animate-float" />
              <p className="text-2xl font-bold text-foreground">{unlockedCount}</p>
              <p className="text-xs text-muted-foreground">Achievements</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-secondary/10 to-transparent card-hover">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Coins className="w-8 h-8 text-secondary mb-2 animate-float" style={{ animationDelay: "0.2s" }} />
              <p className="text-2xl font-bold text-foreground">{totalPoints}</p>
              <p className="text-xs text-muted-foreground">Total Points</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/10 to-transparent card-hover">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Target className="w-8 h-8 text-accent mb-2 animate-float" style={{ animationDelay: "0.4s" }} />
              <p className="text-2xl font-bold text-foreground">{missions.length}</p>
              <p className="text-xs text-muted-foreground">Active Missions</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Achievements and Missions */}
      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="missions">Missions</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="mt-4 space-y-3">
          {achievements.map((achievement, index) => (
            <Card
              key={achievement.id}
              className={`transition-all animate-slide-up card-hover ${
                achievement.unlocked
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card opacity-75 hover:opacity-100"
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-lg ${
                      achievement.unlocked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {achievement.unlocked ? <CheckCircle2 className="w-5 h-5" /> : achievement.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{achievement.title}</h3>
                        {achievement.type === "team" && (
                          <Badge variant="outline" className="text-xs">
                            <Users className="w-2.5 h-2.5 mr-0.5" />
                            Team
                          </Badge>
                        )}
                      </div>
                      <Badge variant={achievement.unlocked ? "default" : "outline"} className="shrink-0">
                        {achievement.points} pts
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>

                    {!achievement.unlocked && achievement.progress !== undefined && achievement.maxProgress && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium text-foreground">
                            {achievement.progress} / {achievement.maxProgress}
                          </span>
                        </div>
                        <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
                      </div>
                    )}

                    {!achievement.unlocked && !achievement.progress && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Lock className="w-3 h-3" />
                        <span>Locked</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="missions" className="mt-4 space-y-3">
          {missions.map((mission, index) => {
            const progressPercent = (mission.progress / mission.maxProgress) * 100
            const isComplete = mission.progress >= mission.maxProgress

            return (
              <Card
                key={mission.id}
                className={`transition-all animate-slide-up card-hover ${isComplete ? "border-secondary bg-secondary/5" : "border-border bg-card"}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        isComplete ? "bg-secondary text-secondary-foreground" : "bg-accent text-accent-foreground"
                      }`}
                    >
                      {isComplete ? <CheckCircle2 className="w-5 h-5" /> : mission.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{mission.title}</h3>
                          {mission.type === "team" && (
                            <Badge variant="outline" className="text-xs">
                              <Users className="w-2.5 h-2.5 mr-0.5" />
                              Team
                            </Badge>
                          )}
                        </div>
                        <Badge variant={isComplete ? "default" : "secondary"} className="shrink-0 bg-primary">
                          +{mission.reward} pts
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{mission.description}</p>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{isComplete ? "Completed!" : "In Progress"}</span>
                          <span className="font-medium text-foreground">
                            {mission.progress >= 1000 ? `${(mission.progress / 1000).toFixed(0)}K` : mission.progress} /{" "}
                            {mission.maxProgress >= 1000
                              ? `${(mission.maxProgress / 1000).toFixed(0)}K`
                              : mission.maxProgress}
                          </span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>
      </Tabs>
    </div>
  )
}
