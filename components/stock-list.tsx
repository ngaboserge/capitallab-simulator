"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { StockChart } from "@/components/stock-chart"

interface Stock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  sector: string
}

const stocks: Stock[] = [
  {
    symbol: "BK",
    name: "Bank of Kigali",
    price: 285.5,
    change: 5.2,
    changePercent: 1.86,
    sector: "Banking",
  },
  {
    symbol: "BKG",
    name: "BK Group",
    price: 142.8,
    change: -2.1,
    changePercent: -1.45,
    sector: "Banking",
  },
  {
    symbol: "MTN",
    name: "MTN Rwanda",
    price: 198.3,
    change: 3.7,
    changePercent: 1.9,
    sector: "Telecom",
  },
  {
    symbol: "BRALIRWA",
    name: "Bralirwa",
    price: 325.0,
    change: 8.5,
    changePercent: 2.68,
    sector: "Consumer",
  },
  {
    symbol: "AGRITECH",
    name: "AgriTech Rwanda",
    price: 78.4,
    change: 12.3,
    changePercent: 18.61,
    sector: "Agriculture",
  },
  {
    symbol: "CRYSTAL",
    name: "Crystal Telecom",
    price: 156.2,
    change: -4.8,
    changePercent: -2.98,
    sector: "Telecom",
  },
]

interface StockListProps {
  onSelectStock: (symbol: string) => void
  selectedStock: string | null
}

export function StockList({ onSelectStock, selectedStock }: StockListProps) {
  const [animatingStocks, setAnimatingStocks] = useState<Set<string>>(new Set())
  const [chartStock, setChartStock] = useState<Stock | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      const randomStock = stocks[Math.floor(Math.random() * stocks.length)]
      setAnimatingStocks((prev) => new Set(prev).add(randomStock.symbol))
      setTimeout(() => {
        setAnimatingStocks((prev) => {
          const next = new Set(prev)
          next.delete(randomStock.symbol)
          return next
        })
      }, 600)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-2">
      {stocks.map((stock) => {
        const isPositive = stock.change >= 0
        const isAnimating = animatingStocks.has(stock.symbol)
        const isSelected = selectedStock === stock.symbol

        return (
          <div
            key={stock.symbol}
            className={`p-4 rounded-lg border transition-all duration-300 ${
              isSelected
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:bg-muted/50 hover:border-primary/50"
            } ${isAnimating ? (isPositive ? "animate-price-up" : "animate-price-down") : ""}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{stock.symbol}</h3>
                  <Badge variant="outline" className="text-xs">
                    {stock.sector}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{stock.name}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">RWF {stock.price.toFixed(2)}</p>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-secondary" : "text-destructive"}`}
                  >
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    <span>
                      {isPositive ? "+" : ""}
                      {stock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="ghost" onClick={() => setChartStock(stock)}>
                      <BarChart3 className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-foreground">
                        {stock.symbol} - {stock.name}
                      </DialogTitle>
                    </DialogHeader>
                    <StockChart stock={stock} />
                  </DialogContent>
                </Dialog>

                <Button
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => onSelectStock(stock.symbol)}
                  className="min-w-[80px]"
                >
                  {isSelected ? "Selected" : "Trade"}
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
