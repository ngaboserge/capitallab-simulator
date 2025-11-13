"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy, TrendingUp, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useTeamTrading } from "@/contexts/team-trading-context"

export function TeamLeaderboard() {
  const { state } = useTeamTrading()
  
  const teams = [
    { rank: 1, name: "Phoenix Traders", members: 5, portfolio: 542890, return: 35.72, badge: "🥇" },
    { rank: 2, name: "Market Masters", members: 4, portfolio: 518340, return: 29.59, badge: "🥈" },
    { 
      rank: 3, 
      name: "Team Alpha", 
      members: state.members.length, 
      portfolio: state.teamPortfolio, 
      return: state.teamReturn, 
      badge: "🥉", 
      isCurrentTeam: true 
    },
    { rank: 4, name: "Bulls United", members: 6, portfolio: 465200, return: 16.3, badge: "" },
    { rank: 5, name: "Growth Squad", members: 3, portfolio: 448750, return: 12.19, badge: "" },
  ]

  return (
    <Card className="card-hover african-pattern">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent" />
          Team Leaderboard
        </CardTitle>
        <p className="text-sm text-muted-foreground">Top performing teams</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {teams.map((team, index) => (
          <div
            key={team.rank}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 animate-slide-up ${
              team.isCurrentTeam ? "border-secondary bg-secondary/5" : "border-border bg-card/50 hover:bg-card"
            }`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-accent/20 to-accent/5 font-bold text-foreground shrink-0">
              {team.badge || team.rank}
            </div>
            <Avatar className="w-10 h-10 border-2 border-secondary/20">
              <AvatarFallback className="bg-secondary/10 text-secondary font-semibold text-xs">
                {team.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground text-sm truncate">{team.name}</p>
                {team.isCurrentTeam && (
                  <Badge variant="outline" className="border-secondary/20 text-secondary text-xs">
                    You
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {team.members}
                </p>
                <span className="text-xs text-muted-foreground">•</span>
                <p className="text-xs text-muted-foreground">RWF {team.portfolio.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 justify-end">
                <TrendingUp className="w-3 h-3 text-secondary" />
                <span className="text-sm font-bold text-secondary">+{team.return.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
