"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { ArrowUpCircle, ArrowDownCircle, AlertCircle, Sparkles, TrendingUp, TrendingDown, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTeamTrading } from "@/contexts/team-trading-context"
import { useGamification } from "@/contexts/gamification-context"
import { useGamificationEvents } from "@/hooks/use-gamification-events"

interface TeamTradeInterfaceProps {
  selectedStock: string | null
}

export function TeamTradeInterface({ selectedStock }: TeamTradeInterfaceProps) {
  const [quantity, setQuantity] = useState<string>("1")
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [tradeSuccess, setTradeSuccess] = useState(false)
  const [orderType, setOrderType] = useState<"market" | "limit" | "stop">("market")
  const [limitPrice, setLimitPrice] = useState<string>("")
  const [stopPrice, setStopPrice] = useState<string>("")
  const { toast } = useToast()
  const { addTrade, state } = useTeamTrading()
  const gamification = useGamification()
  const { onTradeExecuted } = useGamificationEvents()
  
  // Mock team and user IDs - in real app, get from auth/team context
  const userId = "user-123"
  const teamId = "team-456"

  // Simulate real-time price updates
  const [stockPrice, setStockPrice] = useState(285.5)
  const [priceChange, setPriceChange] = useState(0)

  // Simulate price fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 2 // Random change between -1 and +1
      setStockPrice(prev => {
        const newPrice = Math.max(prev + change, 1) // Ensure price doesn't go below 1
        setPriceChange(change)
        return newPrice
      })
    }, 3000) // Update every 3 seconds

    return () => clearInterval(interval)
  }, [])
  const totalCost =
    Number.parseFloat(quantity || "0") *
    (orderType === "limit" && limitPrice ? Number.parseFloat(limitPrice) : stockPrice)

  // Check if trade is valid (sufficient funds/shares)
  const isTradeValid = useMemo(() => {
    if (!selectedStock || !quantity || Number.parseFloat(quantity) <= 0) return false
    
    if (tradeType === "buy") {
      return totalCost <= state.teamCash
    } else {
      // For sell orders, check if team has enough shares
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

      const currentHolding = holdingsMap.get(selectedStock) || { shares: 0, totalCost: 0 }
      return currentHolding.shares >= Number.parseFloat(quantity)
    }
  }, [selectedStock, quantity, tradeType, totalCost, state.teamCash, state.trades])

  const handleTradeClick = () => {
    if (!selectedStock) {
      toast({
        title: "No stock selected",
        description: "Please select a stock from the list first",
        variant: "destructive",
      })
      return
    }

    if (!quantity || Number.parseFloat(quantity) <= 0) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid quantity",
        variant: "destructive",
      })
      return
    }

    if (orderType === "limit" && (!limitPrice || Number.parseFloat(limitPrice) <= 0)) {
      toast({
        title: "Invalid limit price",
        description: "Please enter a valid limit price",
        variant: "destructive",
      })
      return
    }

    if (orderType === "stop" && (!stopPrice || Number.parseFloat(stopPrice) <= 0)) {
      toast({
        title: "Invalid stop price",
        description: "Please enter a valid stop price",
        variant: "destructive",
      })
      return
    }

    // Check if team has enough cash for buy orders
    if (tradeType === "buy" && totalCost > state.teamCash) {
      toast({
        title: "Insufficient team funds",
        description: `Team needs RWF ${totalCost.toLocaleString()} but only has RWF ${state.teamCash.toLocaleString()} available`,
        variant: "destructive",
      })
      return
    }

    // For sell orders, check if team has enough shares
    if (tradeType === "sell") {
      // Calculate current holdings for this stock
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

      const currentHolding = holdingsMap.get(selectedStock) || { shares: 0, totalCost: 0 }
      const requestedQuantity = Number.parseFloat(quantity)

      if (currentHolding.shares < requestedQuantity) {
        toast({
          title: "Insufficient shares",
          description: `Team only has ${currentHolding.shares} shares of ${selectedStock}, but trying to sell ${requestedQuantity}`,
          variant: "destructive",
        })
        return
      }
    }

    setShowConfirmation(true)
  }

  const executeTrade = async () => {
    setIsExecuting(true)

    try {
      // Add trade to Supabase
      const trade = await addTrade({
        type: tradeType,
        stock: selectedStock!,
        quantity: Number.parseFloat(quantity),
        price: orderType === "limit" && limitPrice ? Number.parseFloat(limitPrice) : stockPrice,
        total: totalCost,
        proposedBy: "You",
        initials: "YU",
        orderType
      })

      // Trigger gamification event for team trade
      await onTradeExecuted(userId, teamId, {
        tradeId: trade?.id || `team-trade-${Date.now()}`,
        tradeValue: totalCost,
        stockSymbol: selectedStock!,
        tradeType: tradeType,
        quantity: Number.parseFloat(quantity),
        price: orderType === "limit" && limitPrice ? Number.parseFloat(limitPrice) : stockPrice
      })

      toast({
        title: `Team ${tradeType === "buy" ? "Buy" : "Sell"} order executed!`,
        description: `${orderType} ${tradeType}: ${quantity} shares of ${selectedStock} for RWF ${totalCost.toLocaleString()} (+50 Team XP!)`,
      })

      // Reset form immediately
      setQuantity("1")
      setLimitPrice("")
      setStopPrice("")
      setShowConfirmation(false)
    } catch (error) {
      toast({
        title: "Error executing trade",
        description: "There was an error processing your trade. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsExecuting(false)
    }
  }

  if (!selectedStock) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center animate-slide-up">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4 animate-float">
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Stock Selected</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Select a stock from the Available Stocks tab to start team trading
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6 animate-slide-up">
        <Card className="p-6 bg-gradient-to-br from-muted/50 to-muted/30 african-pattern card-hover">
          <div className="space-y-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold text-foreground">{selectedStock}</h3>
                <Badge variant="outline" className="gap-1">
                  <Users className="w-3 h-3" />
                  Team Trade
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                {priceChange >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <span>Current Price: </span>
                <span className={`font-semibold transition-colors ${
                  priceChange > 0 ? 'text-green-500' : 
                  priceChange < 0 ? 'text-red-500' : 
                  'text-foreground'
                }`}>
                  RWF {stockPrice.toFixed(2)}
                </span>
                {priceChange !== 0 && (
                  <span className={`text-xs ${priceChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ({priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)})
                  </span>
                )}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant={tradeType === "buy" ? "default" : "outline"}
                className={`flex-1 gap-2 btn-micro transition-all ${
                  tradeType === "buy"
                    ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg hover:shadow-xl"
                    : "hover:border-secondary"
                }`}
                onClick={() => setTradeType("buy")}
              >
                <ArrowUpCircle className="w-4 h-4" />
                Buy
              </Button>
              <Button
                variant={tradeType === "sell" ? "default" : "outline"}
                className={`flex-1 gap-2 btn-micro transition-all ${
                  tradeType === "sell"
                    ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg hover:shadow-xl"
                    : "hover:border-destructive"
                }`}
                onClick={() => setTradeType("sell")}
              >
                <ArrowDownCircle className="w-4 h-4" />
                Sell
              </Button>
            </div>
          </div>
        </Card>

        <Tabs value={orderType} onValueChange={(v) => setOrderType(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="limit">Limit</TabsTrigger>
            <TabsTrigger value="stop">Stop Loss</TabsTrigger>
          </TabsList>

          <TabsContent value="market" className="mt-4 space-y-4">
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-sm text-muted-foreground">
                Market orders execute immediately at the current market price
              </p>
            </div>
          </TabsContent>

          <TabsContent value="limit" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="limitPrice" className="text-foreground font-medium">
                Limit Price
              </Label>
              <Input
                id="limitPrice"
                type="number"
                step="0.01"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                placeholder="Enter limit price"
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">Order will execute only at this price or better</p>
            </div>
          </TabsContent>

          <TabsContent value="stop" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stopPrice" className="text-foreground font-medium">
                Stop Price
              </Label>
              <Input
                id="stopPrice"
                type="number"
                step="0.01"
                value={stopPrice}
                onChange={(e) => setStopPrice(e.target.value)}
                placeholder="Enter stop price"
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">Order triggers when price reaches this level</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-foreground font-medium">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              className="text-lg h-12 transition-all focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity("10")}
                className="flex-1"
              >
                10
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity("50")}
                className="flex-1"
              >
                50
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity("100")}
                className="flex-1"
              >
                100
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity("500")}
                className="flex-1"
              >
                500
              </Button>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 backdrop-blur-sm space-y-2 border border-border/50">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order Type</span>
              <Badge variant="outline">{orderType.charAt(0).toUpperCase() + orderType.slice(1)}</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Price per share</span>
              <span className="font-medium text-foreground">
                RWF {(orderType === "limit" && limitPrice ? Number.parseFloat(limitPrice) : stockPrice).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Quantity</span>
              <span className="font-medium text-foreground">{quantity || 0}</span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground">Total</span>
              <span className="font-bold text-xl text-foreground">RWF {totalCost.toLocaleString()}</span>
            </div>
          </div>

          <Button
            size="lg"
            disabled={!isTradeValid}
            className={`w-full text-lg font-semibold btn-micro transition-all shadow-lg hover:shadow-xl ${
              !isTradeValid
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : tradeType === "buy"
                ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground animate-glow-pulse"
                : "bg-destructive hover:bg-destructive/90 text-destructive-foreground animate-glow-pulse"
            }`}
            onClick={handleTradeClick}
          >
            {!isTradeValid ? (
              <AlertCircle className="w-5 h-5 mr-2" />
            ) : (
              <Sparkles className="w-5 h-5 mr-2" />
            )}
            {!isTradeValid 
              ? `Insufficient ${tradeType === "buy" ? "Funds" : "Shares"}`
              : `Execute Team ${tradeType === "buy" ? "Buy" : "Sell"} Order`
            }
          </Button>
          
          {!isTradeValid && tradeType === "buy" && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive">
                Need RWF {totalCost.toLocaleString()} but team only has RWF {state.teamCash.toLocaleString()}
              </span>
            </div>
          )}
          
          {!isTradeValid && tradeType === "sell" && selectedStock && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive">
                Not enough {selectedStock} shares to sell {quantity}
              </span>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md animate-scale-in">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              {tradeType === "buy" ? (
                <ArrowUpCircle className="w-5 h-5 text-secondary" />
              ) : (
                <ArrowDownCircle className="w-5 h-5 text-destructive" />
              )}
              Confirm Team {tradeType === "buy" ? "Buy" : "Sell"} Order
            </DialogTitle>
            <DialogDescription>
              Team order - Please review your order details before confirming
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-muted space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Trade Mode</span>
                <Badge variant="outline" className="gap-1">
                  <Users className="w-3 h-3" />
                  Team
                </Badge>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Order Type</span>
                <Badge variant="outline">{orderType.charAt(0).toUpperCase() + orderType.slice(1)}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Stock</span>
                <span className="font-semibold text-foreground">{selectedStock}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Action</span>
                <span className={`font-semibold ${tradeType === "buy" ? "text-secondary" : "text-destructive"}`}>
                  {tradeType === "buy" ? "Buy" : "Sell"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Quantity</span>
                <span className="font-semibold text-foreground">{quantity} shares</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Price per share</span>
                <span className="font-semibold text-foreground">
                  RWF {(orderType === "limit" && limitPrice ? Number.parseFloat(limitPrice) : stockPrice).toFixed(2)}
                </span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">Total Amount</span>
                <span className="font-bold text-xl text-foreground">RWF {totalCost.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowConfirmation(false)} disabled={isExecuting}>
              Cancel
            </Button>
            <Button
              className={`${
                tradeType === "buy"
                  ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              }`}
              onClick={executeTrade}
              disabled={isExecuting}
            >
              {isExecuting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Executing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Confirm Order
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}