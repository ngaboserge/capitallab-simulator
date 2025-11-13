"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Activity } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function MarketOverview() {
  const indices = [
    { name: "RSE All Share", value: 145.32, change: 2.45, changePercent: 1.71 },
    { name: "EAC Index", value: 892.15, change: -5.23, changePercent: -0.58 },
    { name: "Banking Sector", value: 234.67, change: 3.89, changePercent: 1.68 },
  ]

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Market Overview</h2>
          <p className="text-sm text-muted-foreground">Live market indices</p>
        </div>
        <Badge variant="outline" className="gap-1 animate-glow-pulse">
          <Activity className="w-3 h-3" />
          Live
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {indices.map((index, i) => {
          const isPositive = index.change >= 0
          return (
            <Card key={index.name} className="card-hover african-pattern" style={{ animationDelay: `${i * 0.1}s` }}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">{index.name}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{index.value.toFixed(2)}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${isPositive ? "bg-secondary/10" : "bg-destructive/10"}`}>
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4 text-secondary" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-sm font-semibold ${isPositive ? "text-secondary" : "text-destructive"}`}>
                    {isPositive ? "+" : ""}
                    {index.change.toFixed(2)}
                  </span>
                  <span className={`text-xs ${isPositive ? "text-secondary" : "text-destructive"}`}>
                    ({isPositive ? "+" : ""}
                    {index.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
