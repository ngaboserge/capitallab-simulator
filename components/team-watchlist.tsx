"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Plus, TrendingUp, TrendingDown, Users } from "lucide-react"
import { useTeamTrading } from "@/contexts/team-trading-context"

export function TeamWatchlist() {
  const { state } = useTeamTrading()
  const watchlist = state.watchlist

  return (
    <Card className="card-hover african-pattern">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-accent fill-accent" />
            <CardTitle className="text-foreground">Team Watchlist</CardTitle>
          </div>
          <Button size="sm" variant="outline" className="gap-1 bg-transparent">
            <Plus className="w-3 h-3" />
            Suggest
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">Stocks your team is tracking</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {watchlist.map((stock, i) => {
          const isPositive = stock.changePercent >= 0
          return (
            <div
              key={stock.symbol}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all group animate-slide-up"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-foreground">{stock.symbol}</p>
                  <span className="text-xs text-muted-foreground">{stock.name}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs text-muted-foreground">RWF {stock.price.toFixed(2)}</p>
                  <div className="flex items-center gap-1">
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3 text-secondary" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-destructive" />
                    )}
                    <span className={`text-xs font-medium ${isPositive ? "text-secondary" : "text-destructive"}`}>
                      {isPositive ? "+" : ""}
                      {stock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {stock.votes}/{stock.totalMembers} votes
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">by {stock.addedBy}</span>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}