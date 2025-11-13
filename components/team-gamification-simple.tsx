"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Flame, Trophy, Crown, Users, Target, Award } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useGamification } from "@/contexts/gamification-context"


interface TeamGamificationSimpleProps {
  teamId?: string
  userId?: string
}

export function TeamGamificationSimple({ teamId, userId }: TeamGamificationSimpleProps) {
  const gamification = useGamification()


  useEffect(() => {
    const initializeTeamGamification = async () => {
      if (teamId) {
        await gamification.initializeTeamGamification(teamId)
      }
      await gamification.loadAvailableItems()
    }

    initializeTeamGamification()
  }, [teamId]) // Only depend on teamId to prevent infinite re-renders

  const stats = gamification.teamGamification

  // Calculate level progress
  const getXPForNextLevel = (level: number) => (level * level) * 100
  const getCurrentLevelXP = (level: number) => ((level - 1) * (level - 1)) * 100
  
  const currentLevel = stats?.level || 1
  const currentXP = stats?.xp || 0
  const nextLevelXP = getXPForNextLevel(currentLevel)
  const currentLevelStartXP = getCurrentLevelXP(currentLevel)
  const progressXP = currentXP - currentLevelStartXP
  const neededXP = nextLevelXP - currentLevelStartXP
  const xpProgress = neededXP > 0 ? (progressXP / neededXP) * 100 : 0


  
  const teamMembers = [
    { name: "Sarah K.", initials: "SK", contribution: 35 },
    { name: "Alex M.", initials: "AM", contribution: 28 },
    { name: "John D.", initials: "JD", contribution: 22 },
    { name: "Emma R.", initials: "ER", contribution: 15 },
  ]

  if (gamification.loading) {
    return (
      <div className="space-y-4">
        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm text-muted-foreground">Loading team data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Team Level & XP Progress */}
      <Card className="bg-gradient-to-br from-secondary/10 via-primary/5 to-transparent card-hover">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary text-secondary-foreground">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Team Level</p>
                <p className="text-2xl font-bold text-foreground">{currentLevel}</p>
              </div>
            </div>
            <Badge className="bg-primary text-primary-foreground">
              <Users className="w-3 h-3 mr-1" />
              {currentLevel >= 10 ? "Elite Squad" : currentLevel >= 5 ? "Rising Team" : "New Team"}
            </Badge>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Team XP Progress</span>
              <span className="font-medium text-foreground">
                {progressXP} / {neededXP}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all" 
                style={{ width: `${xpProgress}%` }}
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
                <p className="text-2xl font-bold text-foreground">{stats?.daily_streak || 0} days</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-orange-500/20 text-orange-500 hover:bg-orange-500/10 bg-transparent"
              onClick={async () => {
                if (teamId) {
                  const bonusXP = (stats?.daily_streak || 0) * 25
                  await gamification.addTeamXP(teamId, bonusXP, 'Daily streak bonus')
                  alert(`🎉 Team earned ${bonusXP} bonus XP for daily streak!`)
                }
              }}
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
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-accent" />
              Team Contributions
            </CardTitle>
            <Button 
              size="sm" 
              variant="outline" 
              className="text-xs h-7"
              onClick={async () => {
                if (teamId) {
                  await gamification.addTeamXP(teamId, 200, 'Team collaboration bonus')
                  alert(`👥 Team Activity Bonus! +200 XP for collaboration!`)
                }
              }}
            >
              Team Up!
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {teamMembers.map((member) => (
            <div key={member.name} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
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
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-xs h-6 px-2 opacity-60 hover:opacity-100"
                onClick={() => {
                  alert(`💬 Sent encouragement to ${member.name}! Team morale +1`)
                }}
              >
                👍
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Team Achievements */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-transparent card-hover">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Trophy className="w-5 h-5 text-purple-500 animate-float" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Team Achievements</p>
              <p className="text-xs text-muted-foreground">
                {stats?.total_achievements || 0} unlocked
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {gamification.teamAchievements?.slice(0, 2).map((achievement: any) => {
              return (
                <div key={achievement.id} className="flex items-start gap-3 p-3 rounded-lg border border-primary bg-primary/5">
                  <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                    <div className="text-lg">{achievement.icon}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-foreground">{achievement.name}</h4>
                      <Badge variant="default" className="text-xs">
                        +{achievement.xp_reward} XP
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
              )
            })}
            {(!gamification.teamAchievements || gamification.teamAchievements.length === 0) && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground text-center py-2">
                  Complete team actions to unlock achievements!
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2 rounded border border-border bg-muted/30">
                    <div className="p-1.5 rounded bg-muted">
                      <div className="text-sm">👥</div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium">Team Player</p>
                      <p className="text-xs text-muted-foreground">Complete 10 team trades (+200 XP)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded border border-border bg-muted/30">
                    <div className="p-1.5 rounded bg-muted">
                      <div className="text-sm">👑</div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium">Team Leader</p>
                      <p className="text-xs text-muted-foreground">Lead team to top 5 ranking (+300 XP)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-green-500/20">
                    <Target className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Diversification Masters</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">500 XP</Badge>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-xs h-6 px-2"
                    onClick={async () => {
                      if (teamId) {
                        await gamification.addTeamXP(teamId, 500, 'Diversification Masters mission')
                        alert(`🎯 Mission Complete! Team earned 500 XP!`)
                      }
                    }}
                  >
                    Complete
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-full bg-muted rounded-full h-2 flex-1">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all" 
                    style={{ width: "75%" }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">75%</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-green-500/20">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Weekly Trading Goal</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Team Badge</Badge>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-xs h-6 px-2"
                    onClick={async () => {
                      if (teamId) {
                        await gamification.addTeamXP(teamId, 750, 'Weekly Trading Goal mission')
                        alert(`🏆 Weekly Goal Complete! Team earned 750 XP + Team Badge!`)
                      }
                    }}
                  >
                    Complete
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-full bg-muted rounded-full h-2 flex-1">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all" 
                    style={{ width: "60%" }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">60%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}