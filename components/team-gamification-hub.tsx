"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
// import { Progress } from "@/components/ui/progress"
import { Flame, Zap, Trophy, Star, TrendingUp, Gift, Crown, Users, Target, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function TeamGamificationHub() {
  const teamLevel = 8
  const currentXP = 1850
  const nextLevelXP = 2500
  const teamStreak = 12
  const teamMembers = [
    { name: "Sarah K.", initials: "SK", contribution: 35 },
    { name: "Alex M.", initials: "AM", contribution: 28 },
    { name: "John D.", initials: "JD", contribution: 22 },
    { name: "Emma R.", initials: "ER", contribution: 15 },
  ]

  const teamPowerUps = [
    { 
      id: "team-boost", 
      name: "Team XP Boost", 
      duration: "2 hours", 
      icon: <Zap className="w-4 h-4" />, 
      active: true,
      description: "All team members get 2x XP"
    },
    { 
      id: "market-intel", 
      name: "Market Intelligence", 
      duration: "24 hours", 
      icon: <Star className="w-4 h-4" />, 
      active: false,
      description: "Advanced market insights for team"
    },
  ]

  const teamMissions = [
    { name: "Diversification Masters", progress: 75, target: 100, reward: "500 XP", icon: <Target className="w-4 h-4" /> },
    { name: "Weekly Trading Goal", progress: 60, target: 100, reward: "Team Badge", icon: <Trophy className="w-4 h-4" /> },
  ]

  return (
    <div className="space-y-4">
      {/* Team Level & XP Progress */}
      <Card className="bg-gradient-to-br from-secondary/10 via-primary/5 to-transparent card-hover african-pattern">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary text-secondary-foreground">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Team Level</p>
                <p className="text-2xl font-bold text-foreground">{teamLevel}</p>
              </div>
            </div>
            <Badge className="bg-primary text-primary-foreground">
              <Users className="w-3 h-3 mr-1" />
              Elite Squad
            </Badge>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Team XP Progress</span>
              <span className="font-medium text-foreground">
                {currentXP} / {nextLevelXP}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all" 
                style={{ width: `${(currentXP / nextLevelXP) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Streak */}
      <Card className="bg-gradient-to-br from-orange-500/10 to-transparent card-hover">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Flame className="w-5 h-5 text-orange-500 animate-float" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Team Streak</p>
                <p className="text-2xl font-bold text-foreground">{teamStreak} days</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-orange-500/20 text-orange-500 hover:bg-orange-500/10 bg-transparent"
            >
              Claim Bonus
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            All team members trading daily! Keep it up for bonus rewards.
          </p>
        </CardContent>
      </Card>

      {/* Team Contributions */}
      <Card className="card-hover">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-accent" />
            Team Contributions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {teamMembers.map((member, index) => (
            <div key={member.name} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
              <Avatar className="w-8 h-8 border-2 border-secondary/20">
                <AvatarFallback className="bg-secondary/10 text-secondary text-xs font-semibold">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{member.name}</p>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-muted rounded-full h-1.5 flex-1">
                    <div 
                      className="bg-secondary h-1.5 rounded-full transition-all" 
                      style={{ width: `${member.contribution}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{member.contribution}%</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Team Power-Ups */}
      <Card className="card-hover">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Gift className="w-4 h-4 text-accent" />
            Team Power-Ups
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {teamPowerUps.map((powerUp) => (
            <div
              key={powerUp.id}
              className={`p-3 rounded-lg border transition-all ${
                powerUp.active
                  ? "border-accent bg-accent/5 animate-glow-pulse"
                  : "border-border bg-card hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded ${powerUp.active ? "bg-accent text-accent-foreground" : "bg-muted"}`}>
                    {powerUp.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{powerUp.name}</p>
                    <p className="text-xs text-muted-foreground">{powerUp.description}</p>
                  </div>
                </div>
                {powerUp.active ? (
                  <Badge variant="outline" className="text-xs border-accent text-accent">
                    Active
                  </Badge>
                ) : (
                  <Button size="sm" variant="ghost" className="text-xs h-7">
                    Activate
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Team Missions */}
      <Card className="bg-gradient-to-br from-green-500/10 to-transparent card-hover">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <Target className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Team Missions</p>
              <p className="text-xs text-muted-foreground">Complete together for rewards</p>
            </div>
          </div>
          <div className="space-y-3">
            {teamMissions.map((mission, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-green-500/20">
                      {mission.icon}
                    </div>
                    <span className="text-sm font-medium text-foreground">{mission.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {mission.reward}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-muted rounded-full h-2 flex-1">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all" 
                      style={{ width: `${mission.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{mission.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}