"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, PieChart, Award, Activity } from "lucide-react"
import { PortfolioChart } from "@/components/portfolio-chart"
import { TopHoldings } from "@/components/top-holdings"
import { useIndividualTrading } from "@/contexts/individual-trading-context"

export function IndividualDashboard() {
  const { state } = useIndividualTrading()
  const portfolioValue = state.portfolio
  const cash = state.cash
  const totalValue = portfolioValue + cash
  const initialBalance = 100000
  const profitLoss = totalValue - initialBalance
  const profitLossPercent = ((profitLoss / initialBalance) * 100).toFixed(2)
  const isProfit = profitLoss >= 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Individual Dashboard</h2>
          <p className="text-sm text-muted-foreground">Track your personal trading performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden card-hover animate-slide-up african-pattern">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Portfolio Value</CardTitle>
            <div className="p-2 rounded-lg bg-secondary/10">
              <PieChart className="h-4 w-4 text-secondary" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-foreground">RWF {portfolioValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Holdings Value</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden card-hover animate-slide-up african-pattern" style={{ animationDelay: "0.1s" }}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Cash</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-foreground">RWF {cash.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Buying Power</p>
          </CardContent>
        </Card>

        <Card
          className="relative overflow-hidden card-hover animate-slide-up african-pattern"
          style={{ animationDelay: "0.2s" }}
        >
          <div
            className={`absolute inset-0 ${
              isProfit
                ? "bg-gradient-to-br from-green-500/10 to-transparent"
                : "bg-gradient-to-br from-destructive/10 to-transparent"
            }`}
          />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total P&L</CardTitle>
            <div className={`p-2 rounded-lg ${isProfit ? "bg-green-500/10" : "bg-destructive/10"}`}>
              {isProfit ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className={`text-2xl font-bold ${isProfit ? "text-green-500" : "text-destructive"}`}>
              {isProfit ? "+" : ""}RWF {Math.abs(profitLoss).toLocaleString()}
            </div>
            <p className={`text-xs mt-1 font-medium ${isProfit ? "text-green-500" : "text-destructive"}`}>
              {isProfit ? "+" : ""}
              {profitLossPercent}% Return
            </p>
          </CardContent>
        </Card>

        <Card
          className="relative overflow-hidden card-hover animate-slide-up african-pattern"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Trades</CardTitle>
            <div className="p-2 rounded-lg bg-accent/10">
              <Activity className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-2xl font-bold text-foreground">{state.totalTrades}</div>
            <p className="text-xs text-muted-foreground mt-1">Executed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 card-hover animate-slide-up african-pattern" style={{ animationDelay: "0.4s" }}>
          <CardHeader>
            <CardTitle className="text-foreground">Portfolio Growth</CardTitle>
            <p className="text-sm text-muted-foreground">Your personal portfolio evolution over time</p>
          </CardHeader>
          <CardContent>
            <PortfolioChart />
          </CardContent>
        </Card>

        <Card className="card-hover animate-slide-up african-pattern" style={{ animationDelay: "0.5s" }}>
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Award className="w-5 h-5 text-secondary" />
              Performance Stats
            </CardTitle>
            <p className="text-sm text-muted-foreground">Your trading metrics</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg border border-border bg-card/50">
              <span className="text-sm text-muted-foreground">Total Value</span>
              <span className="font-semibold text-foreground">RWF {totalValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg border border-border bg-card/50">
              <span className="text-sm text-muted-foreground">Return Rate</span>
              <span className={`font-semibold ${isProfit ? "text-green-500" : "text-destructive"}`}>
                {state.totalReturn.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg border border-border bg-card/50">
              <span className="text-sm text-muted-foreground">Trades Count</span>
              <span className="font-semibold text-foreground">{state.totalTrades}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="animate-slide-up" style={{ animationDelay: "0.6s" }}>
        <TopHoldings />
      </div>
    </div>
  )
}