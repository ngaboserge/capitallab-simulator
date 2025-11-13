"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, TrendingUp, TrendingDown, Award } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useTeamTrading } from "@/contexts/team-trading-context"

export function TeamActivity() {
  const { state } = useTeamTrading()
  
  // Convert trades to activity format and add some achievements
  const activities = [
    ...state.trades.slice(0, 4).map(trade => ({
      member: trade.proposedBy,
      initials: trade.initials,
      action: trade.type === "buy" ? "bought" : "sold",
      shares: trade.quantity,
      stock: trade.stock,
      price: trade.price,
      time: trade.time,
      type: trade.type,
    })),
    {
      member: "Team Alpha",
      initials: "TA",
      action: "earned",
      achievement: "Diversification Master",
      time: "1h ago",
      type: "achievement",
    },
  ]
  return (
    <Card className="card-hover african-pattern">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Activity className="w-5 h-5 text-secondary" />
          Team Activity
        </CardTitle>
        <p className="text-sm text-muted-foreground">Recent team actions</p>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-all duration-200 animate-slide-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <Avatar className="w-9 h-9 border-2 border-secondary/20">
              <AvatarFallback className="bg-secondary/10 text-secondary text-xs font-semibold">
                {activity.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{activity.member}</span>{" "}
                    {activity.type === "achievement" ? (
                      <>
                        <span className="text-muted-foreground">{activity.action}</span>{" "}
                        <span className="font-medium text-accent">{"achievement" in activity ? activity.achievement : ""}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-muted-foreground">{activity.action}</span>{" "}
                        <span className="font-medium">{"shares" in activity ? activity.shares : ""}</span>{" "}
                        <span className="font-semibold">{"stock" in activity ? activity.stock : ""}</span>
                      </>
                    )}
                  </p>
                  {activity.type !== "achievement" && "price" in activity && (
                    <p className="text-xs text-muted-foreground mt-0.5">@ RWF {activity.price}</p>
                  )}
                </div>
                {activity.type === "buy" && (
                  <Badge variant="outline" className="border-primary/20 text-primary shrink-0">
                    <TrendingUp className="w-3 h-3" />
                  </Badge>
                )}
                {activity.type === "sell" && (
                  <Badge variant="outline" className="border-destructive/20 text-destructive shrink-0">
                    <TrendingDown className="w-3 h-3" />
                  </Badge>
                )}
                {activity.type === "achievement" && (
                  <Badge variant="outline" className="border-accent/20 text-accent shrink-0">
                    <Award className="w-3 h-3" />
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
