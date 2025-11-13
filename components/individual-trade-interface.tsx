"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { ArrowUpCircle, ArrowDownCircle, AlertCircle, Sparkles, TrendingUp, TrendingDown, User } from "lucide-react"
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
import { useIndividualTrading } from "@/contexts/individual-trading-context"
import { useGamificationEvents } from "@/hooks/use-gamification-events"

interface IndividualTradeInterfaceProps {
  selectedStock: string | null
}

export function IndividualTradeInterface({ selectedStock }: IndividualTradeInterfaceProps) {
  const [quantity, setQuantity] = useState<string>("1")
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [orderType, setOrderType] = useState<"market" | "limit" | "stop">("market")
  const [limitPrice, setLimitPrice] = useState<string>("")
  const [stopPrice, setStopPrice] = useState<string>("")
  const { toast } = useToast()
  const { addTrade, state } = useIndividualTrading()
  const { onTradeExecuted, onWatchlistAdd } = useGamificationEvents()
  
  // Mock user ID - in real app, get from auth context
  const userId = "user-123"

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
  
  const canAffordTrade = tradeType === "sell" || totalCost <= state.cash
  const shortfall = totalCost - state.cash

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

    if (tradeType === "buy" && totalCost > state.cash) {
      toast({
        title: "Insufficient funds",
        description: `You need RWF ${totalCost.toLocaleString()} but only have RWF ${state.cash.toLocaleString()}`,
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

    setShowConfirmation(true)
  }

  const executeTrade = async () => {
    setIsExecuting(true)

    try {
      const tradePrice = orderType === "limit" && limitPrice ? Number.parseFloat(limitPrice) : stockPrice
      const tradeQuantity = Number.parseFloat(quantity)
      
      // Add trade to Supabase
      const trade = await addTrade({
        type: tradeType,
        stock: selectedStock!,
        quantity: tradeQuantity,
        price: tradePrice,
        total: totalCost,
        orderType
      })

      // Trigger gamification event
      await onTradeExecuted(userId, undefined, {
        tradeId: trade?.id || `trade-${Date.now()}`,
        tradeValue: totalCost,
        stockSymbol: selectedStock!,
        tradeType: tradeType,
        quantity: tradeQuantity,
        price: tradePrice
      })

      toast({
        title: `${tradeType === "buy" ? "Buy" : "Sell"} order executed!`,
        description: `${orderType} ${tradeType}: ${quantity} shares of ${selectedStock} for RWF ${totalCost.toLocaleString()}`,
      })

      // Reset form
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

  const handleAddToWatchlist = async () => {
    if (selectedStock) {
      await onWatchlistAdd(userId, undefined, {
        stockSymbol: selectedStock,
        stockName: selectedStock // In real app, get full company name
      })
      
      toast({
        title: "Added to Watchlist",
        description: `${selectedStock} has been added to your watchlist`,
      })
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
          Select a stock from the Available Stocks tab to start individual trading
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
                  <User className="w-3 h-3" />
                  Personal
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
              <p className="text-xs text-muted-foreground mt-1">
                Available Cash: RWF {state.cash.toLocaleString()}
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

          {/* Insufficient Funds Warning */}
          {tradeType === "buy" && !canAffordTrade && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-3">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Insufficient Funds</span>
              </div>
              <p className="text-sm text-red-600 mt-1">
                You need RWF {shortfall.toLocaleString()} more to complete this trade.
              </p>
              <p className="text-xs text-red-500 mt-1">
                Available: RWF {state.cash.toLocaleString()} | Required: RWF {totalCost.toLocaleString()}
              </p>
            </div>
          )}

          <Button
            size="lg"
            className={`w-full text-lg font-semibold btn-micro transition-all shadow-lg hover:shadow-xl ${
              !canAffordTrade && tradeType === "buy"
                ? "bg-gray-400 hover:bg-gray-400 text-gray-600 cursor-not-allowed"
                : tradeType === "buy"
                ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground animate-glow-pulse"
                : "bg-destructive hover:bg-destructive/90 text-destructive-foreground animate-glow-pulse"
            }`}
            onClick={handleTradeClick}
            disabled={!canAffordTrade && tradeType === "buy"}
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {!canAffordTrade && tradeType === "buy" 
              ? "Insufficient Funds" 
              : `Execute ${tradeType === "buy" ? "Buy" : "Sell"} Order`
            }
          </Button>
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
              Confirm {tradeType === "buy" ? "Buy" : "Sell"} Order
            </DialogTitle>
            <DialogDescription>
              Personal order - Please review your order details before confirming
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-muted space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Account</span>
                <Badge variant="outline" className="gap-1">
                  <User className="w-3 h-3" />
                  Personal
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