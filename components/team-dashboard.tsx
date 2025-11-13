"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMemo } from "react"
import { TrendingUp, TrendingDown, Users, PieChart, Award, Activity } from "lucide-react"
import { PortfolioChart } from "@/components/portfolio-chart"
import { TeamTopHoldings } from "@/components/team-top-holdings"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useTeamTrading } from "@/contexts/team-trading-context"
import { ConnectionStatus } from "@/components/connection-status"



export function TeamDashboard() {
  const { state } = useTeamTrading()
  const portfolioValue = state.teamPortfolio
  const initialBalance = 400000
  const profitLoss = portfolioValue - initialBalance
  const profitLossPercent = ((profitLoss / initialBalance) * 100).toFixed(2)
  const isProfit = profitLoss >= 0
  const teamMembers = state.members

  // Calculate actual holdings from trades
  const holdings = useMemo(() => {
    const holdingsMap = new Map<string, { shares: number, totalCost: number }>()
    
    state.trades.forEach(trade => {
      const existing = holdingsMap.get(trade.stock) || { shares: 0, totalCost: 0 }
      
      if (trade.type === 'buy') {
        existing.shares += trade.quantity
        existing.totalCost += trade.total
      } else {
        const avgCostPerShare = existing.shares > 0 ? existing.totalCost / existing.shares : 0
        const costToRemove = trade.quantity * avgCostPerShare
        existing.shares = Math.max(0, existing.shares - trade.quantity)
        existing.totalCost = Math.max(0, existing.totalCost - costToRemove)
      }
      
      holdingsMap.set(trade.stock, existing)
    })

    return Array.from(holdingsMap.values()).filter(holding => holding.shares > 0)
  }, [state.trades])

  // Calculate unique sectors
  const stockSectors: Record<string, string> = {
    "BK": "Banking", "MTN": "Telecom", "BRALIRWA": "Consumer", "EQUITY": "Banking",
    "COGEBANQUE": "Banking", "AAPL": "Technology", "TSLA": "Automotive", 
    "MSFT": "Technology", "GOOGL": "Technology"
  }
  
  // Get unique stocks that have holdings
  const stocksWithHoldings = Array.from(new Set(
    state.trades.map(trade => trade.stock)
  ))
  
  const uniqueSectors = new Set(
    stocksWithHoldings.map(stock => stockSectors[stock] || "Other")
  ).size

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Team Dashboard</h2>
          <p className="text-sm text-muted-foreground">Track your team's collective performance</p>
        </div>
        <div className="flex items-center gap-3">
          <ConnectionStatus />
          <Badge className="bg-secondary/10 text-secondary border-secondary/20 px-4 py-2">
            <Users className="w-4 h-4 mr-2" />
            Team Alpha - {state.members.length} Members
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden card-hover animate-slide-up african-pattern">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Team Portfolio</CardTitle>
            <div className="p-2 rounded-lg bg-secondary/10">
              <Users className="h-4 w-4 text-secondary" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-foreground">RWF {portfolioValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Shared Balance</p>
          </CardContent>
        </Card>

        <Card
          className="relative overflow-hidden card-hover animate-slide-up african-pattern"
          style={{ animationDelay: "0.1s" }}
        >
          <div
            className={`absolute inset-0 ${
              isProfit
                ? "bg-gradient-to-br from-primary/10 to-transparent"
                : "bg-gradient-to-br from-destructive/10 to-transparent"
            }`}
          />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Team P&L</CardTitle>
            <div className={`p-2 rounded-lg ${isProfit ? "bg-primary/10" : "bg-destructive/10"}`}>
              {isProfit ? (
                <TrendingUp className="h-4 w-4 text-primary" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className={`text-2xl font-bold ${isProfit ? "text-primary" : "text-destructive"}`}>
              {isProfit ? "+" : ""}RWF {Math.abs(profitLoss).toLocaleString()}
            </div>
            <p className={`text-xs mt-1 font-medium ${isProfit ? "text-primary" : "text-destructive"}`}>
              {isProfit ? "+" : ""}
              {profitLossPercent}% Return
            </p>
          </CardContent>
        </Card>

        <Card
          className="relative overflow-hidden card-hover animate-slide-up african-pattern"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Holdings</CardTitle>
            <div className="p-2 rounded-lg bg-accent/10">
              <PieChart className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-foreground">{holdings.length} Stocks</div>
            <p className="text-xs text-muted-foreground mt-1">{uniqueSectors} Sectors</p>
          </CardContent>
        </Card>

        <Card
          className="relative overflow-hidden card-hover animate-slide-up african-pattern"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Team Rank</CardTitle>
            <div className="p-2 rounded-lg bg-secondary/10">
              <Award className="h-4 w-4 text-secondary" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-foreground">#3</div>
            <p className="text-xs text-muted-foreground mt-1">of 89 Teams</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 card-hover animate-slide-up african-pattern" style={{ animationDelay: "0.4s" }}>
          <CardHeader>
            <CardTitle className="text-foreground">Team Portfolio Growth</CardTitle>
            <p className="text-sm text-muted-foreground">Collective balance evolution over time</p>
          </CardHeader>
          <CardContent>
            <PortfolioChart />
          </CardContent>
        </Card>

        <Card className="card-hover animate-slide-up african-pattern" style={{ animationDelay: "0.5s" }}>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-secondary" />
              Team Members
            </CardTitle>
            <p className="text-sm text-muted-foreground">Individual contributions</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamMembers.map((member, index) => (
              <div
                key={member.name}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-card transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border-2 border-secondary/20">
                    <AvatarFallback className="bg-secondary/10 text-secondary font-semibold">
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.trades} trades</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-secondary">+{member.return.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">return</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="animate-slide-up" style={{ animationDelay: "0.6s" }}>
        <TeamTopHoldings />
      </div>
    </div>
  )
}
