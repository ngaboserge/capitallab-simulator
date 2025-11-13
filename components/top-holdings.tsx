"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useIndividualTrading } from "@/contexts/individual-trading-context"

// Stock sectors for display
const stockSectors: Record<string, string> = {
  "BK": "Banking",
  "MTN": "Telecom", 
  "BRALIRWA": "Consumer",
  "EQUITY": "Banking",
  "COGEBANQUE": "Banking",
  "AAPL": "Technology",
  "TSLA": "Automotive",
  "MSFT": "Technology",
  "GOOGL": "Technology"
}

// Current market prices (in real app, this would come from API)
const currentPrices: Record<string, number> = {
  "BK": 268,
  "MTN": 195,
  "BRALIRWA": 305,
  "EQUITY": 228,
  "COGEBANQUE": 162,
  "AAPL": 150,
  "TSLA": 250,
  "MSFT": 300,
  "GOOGL": 120
}

export function TopHoldings() {
  const { state } = useIndividualTrading()

  // Calculate actual holdings from trades
  const holdings = useMemo(() => {
    const holdingsMap = new Map<string, {
      symbol: string
      name: string
      shares: number
      totalCost: number
      transactions: number
    }>()

    // Process all trades to calculate current holdings
    state.trades.forEach(trade => {
      const existing = holdingsMap.get(trade.stock) || {
        symbol: trade.stock,
        name: trade.stock, // In real app, get full company name
        shares: 0,
        totalCost: 0,
        transactions: 0
      }

      if (trade.type === 'buy') {
        existing.shares += trade.quantity
        existing.totalCost += trade.total
      } else {
        // For sells, reduce cost based on average cost per share
        const avgCostPerShare = existing.shares > 0 ? existing.totalCost / existing.shares : 0
        const costToRemove = trade.quantity * avgCostPerShare
        existing.shares = Math.max(0, existing.shares - trade.quantity)
        existing.totalCost = Math.max(0, existing.totalCost - costToRemove)
      }
      
      existing.transactions += 1
      holdingsMap.set(trade.stock, existing)
    })

    // Convert to array and filter out zero holdings
    return Array.from(holdingsMap.values())
      .filter(holding => holding.shares > 0)
      .map(holding => ({
        ...holding,
        avgPrice: holding.totalCost / holding.shares,
        currentPrice: currentPrices[holding.symbol] || holding.totalCost / holding.shares,
        sector: stockSectors[holding.symbol] || "Other"
      }))
      .sort((a, b) => (b.shares * b.currentPrice) - (a.shares * a.currentPrice)) // Sort by value
  }, [state.trades])

  if (holdings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Portfolio Holdings</CardTitle>
          <p className="text-sm text-muted-foreground">Your current stock positions</p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No holdings yet</p>
            <p className="text-sm text-muted-foreground mt-1">Execute your first trade to see your positions here</p>
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">Portfolio Holdings</CardTitle>
        <p className="text-sm text-muted-foreground">Your current stock positions ({holdings.length} stocks)</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {holdings.map((holding, index) => {
          const totalValue = holding.shares * holding.currentPrice
          const totalCost = holding.totalCost
          const profitLoss = totalValue - totalCost
          const profitLossPercent = totalCost > 0 ? ((profitLoss / totalCost) * 100).toFixed(2) : "0.00"
          const isProfit = profitLoss >= 0

          return (
            <div
              key={holding.symbol}
              className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50 hover:bg-card transition-all duration-200 animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{holding.symbol}</span>
                    <Badge variant="outline" className="text-xs">
                      {holding.sector}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">{holding.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{holding.shares} shares</p>
                  <p className="text-xs text-muted-foreground">RWF {totalValue.toLocaleString()}</p>
                </div>

                <div className="text-right min-w-[100px]">
                  <div className="flex items-center justify-end gap-1">
                    {isProfit ? (
                      <TrendingUp className="w-3 h-3 text-secondary" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-destructive" />
                    )}
                    <span className={`text-sm font-bold ${isProfit ? "text-secondary" : "text-destructive"}`}>
                      {isProfit ? "+" : ""}
                      {profitLossPercent}%
                    </span>
                  </div>
                  <p className={`text-xs ${isProfit ? "text-secondary" : "text-destructive"}`}>
                    {isProfit ? "+" : ""}RWF {Math.abs(profitLoss).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
