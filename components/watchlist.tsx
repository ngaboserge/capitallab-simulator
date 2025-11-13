"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Plus, TrendingUp, TrendingDown, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function Watchlist() {
  const [watchlist, setWatchlist] = useState([
    { symbol: "BK", name: "Bank of Kigali", price: 285.5, change: 2.3, changePercent: 0.81 },
    { symbol: "EQTY", name: "Equity Bank", price: 156.3, change: -1.2, changePercent: -0.76 },
    { symbol: "MTN", name: "MTN Rwanda", price: 198.7, change: 4.5, changePercent: 2.32 },
  ])

  const removeFromWatchlist = (symbol: string) => {
    setWatchlist(watchlist.filter((stock) => stock.symbol !== symbol))
  }

  return (
    <Card className="card-hover african-pattern">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-accent fill-accent" />
            <CardTitle className="text-foreground">Watchlist</CardTitle>
          </div>
          <Button size="sm" variant="outline" className="gap-1 bg-transparent">
            <Plus className="w-3 h-3" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {watchlist.length === 0 ? (
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm text-muted-foreground">No stocks in watchlist</p>
            <p className="text-xs text-muted-foreground mt-1">Add stocks to track them</p>
          </div>
        ) : (
          watchlist.map((stock, i) => {
            const isPositive = stock.change >= 0
            return (
              <div
                key={stock.symbol}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all group animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{stock.symbol}</p>
                    <Badge variant="outline" className="text-xs">
                      {stock.name}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
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
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeFromWatchlist(stock.symbol)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
