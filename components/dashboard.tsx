"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, PieChart } from "lucide-react"
import { PortfolioChart } from "@/components/portfolio-chart"
import { TopHoldings } from "@/components/top-holdings"

interface DashboardProps {
  mode: "individual" | "team"
}

export function Dashboard({ mode }: DashboardProps) {
  const portfolioValue = mode === "individual" ? 125840.5 : 487320.75
  const initialBalance = mode === "individual" ? 100000 : 400000
  const profitLoss = portfolioValue - initialBalance
  const profitLossPercent = ((profitLoss / initialBalance) * 100).toFixed(2)
  const isProfit = profitLoss >= 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Track your portfolio performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="relative overflow-hidden card-hover animate-slide-up african-pattern">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Value</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-foreground">RWF {portfolioValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Virtual Balance</p>
          </CardContent>
        </Card>

        <Card
          className="relative overflow-hidden card-hover animate-slide-up african-pattern"
          style={{ animationDelay: "0.1s" }}
        >
          <div
            className={`absolute inset-0 ${
              isProfit
                ? "bg-gradient-to-br from-secondary/10 to-transparent"
                : "bg-gradient-to-br from-destructive/10 to-transparent"
            }`}
          />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Profit & Loss</CardTitle>
            <div className={`p-2 rounded-lg ${isProfit ? "bg-secondary/10" : "bg-destructive/10"}`}>
              {isProfit ? (
                <TrendingUp className="h-4 w-4 text-secondary" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className={`text-3xl font-bold ${isProfit ? "text-secondary" : "text-destructive"}`}>
              {isProfit ? "+" : ""}RWF {Math.abs(profitLoss).toLocaleString()}
            </div>
            <p className={`text-xs mt-1 font-medium ${isProfit ? "text-secondary" : "text-destructive"}`}>
              {isProfit ? "+" : ""}
              {profitLossPercent}% Total Return
            </p>
          </CardContent>
        </Card>

        <Card
          className="relative overflow-hidden card-hover animate-slide-up african-pattern"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Diversification</CardTitle>
            <div className="p-2 rounded-lg bg-accent/10">
              <PieChart className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-foreground">5 Stocks</div>
            <p className="text-xs text-muted-foreground mt-1">Across 4 Sectors</p>
          </CardContent>
        </Card>
      </div>

      <Card className="card-hover animate-slide-up african-pattern" style={{ animationDelay: "0.3s" }}>
        <CardHeader>
          <CardTitle className="text-foreground">Portfolio Growth</CardTitle>
          <p className="text-sm text-muted-foreground">Your virtual balance evolution over time</p>
        </CardHeader>
        <CardContent>
          <PortfolioChart />
        </CardContent>
      </Card>

      <div className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
        <TopHoldings />
      </div>
    </div>
  )
}
