'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMarketMaker } from '@/contexts/market-maker-context'
import { Order } from '@/lib/market-maker-engine'
import { useToast } from '@/hooks/use-toast'

interface EnhancedTradeInterfaceProps {
  selectedStock: string
  onTradeComplete?: (result: any) => void
}

export function EnhancedTradeInterface({ 
  selectedStock, 
  onTradeComplete 
}: EnhancedTradeInterfaceProps) {
  const { marketData, processOrder, getOrderBook } = useMarketMaker()
  const { toast } = useToast()
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY')
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT'>('MARKET')
  const [quantity, setQuantity] = useState('')
  const [limitPrice, setLimitPrice] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const stockData = marketData.get(selectedStock)
  const orderBook = getOrderBook(selectedStock)

  if (!stockData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Select a stock to start trading</p>
        </CardContent>
      </Card>
    )
  }

  const handleTrade = async () => {
    if (!quantity || parseInt(quantity) <= 0) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid quantity",
        variant: "destructive"
      })
      return
    }

    if (orderType === 'LIMIT' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      toast({
        title: "Invalid limit price",
        description: "Please enter a valid limit price",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)

    try {
      const order: Order = {
        id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: 'current_user', // This would come from auth context
        symbol: selectedStock,
        type: tradeType,
        orderType: orderType,
        quantity: parseInt(quantity),
        price: orderType === 'LIMIT' ? parseFloat(limitPrice) : undefined,
        timestamp: new Date(),
        status: 'PENDING',
        filledQuantity: 0,
        remainingQuantity: parseInt(quantity)
      }

      const result = await processOrder(order)

      if (result.success) {
        const totalFilled = parseInt(quantity) - result.remainingQuantity
        const avgPrice = result.fills.reduce((sum, fill, index) => {
          return sum + (fill.price * fill.quantity)
        }, 0) / totalFilled

        toast({
          title: "Order executed successfully!",
          description: `${tradeType} ${totalFilled} shares of ${selectedStock} at avg price RWF ${avgPrice.toFixed(2)}`,
        })

        // Reset form
        setQuantity('')
        setLimitPrice('')
        
        if (onTradeComplete) {
          onTradeComplete(result)
        }
      } else {
        toast({
          title: "Order failed",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error processing order",
        description: "Please try again",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const estimatedPrice = orderType === 'MARKET' 
    ? (tradeType === 'BUY' ? stockData.askPrice : stockData.bidPrice)
    : parseFloat(limitPrice) || 0

  const totalCost = estimatedPrice * parseInt(quantity || '0')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Enhanced Trading - {selectedStock}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Market Data */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Current Market</span>
            <Badge variant="outline">Live</Badge>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Last:</span>
              <span className="font-medium ml-1">RWF {stockData.lastPrice.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-red-600">Bid:</span>
              <span className="font-medium ml-1">RWF {stockData.bidPrice.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-green-600">Ask:</span>
              <span className="font-medium ml-1">RWF {stockData.askPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Order Book Preview */}
        {orderBook && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Order Book Depth</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-red-600 font-medium">Bids ({orderBook.bids.length})</span>
                <div className="space-y-1 mt-1">
                  {orderBook.bids.slice(0, 3).map((bid, index) => (
                    <div key={index} className="flex justify-between">
                      <span>RWF {bid.price.toFixed(2)}</span>
                      <span>{bid.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-green-600 font-medium">Asks ({orderBook.asks.length})</span>
                <div className="space-y-1 mt-1">
                  {orderBook.asks.slice(0, 3).map((ask, index) => (
                    <div key={index} className="flex justify-between">
                      <span>RWF {ask.price.toFixed(2)}</span>
                      <span>{ask.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trade Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Trade Type</Label>
              <Select value={tradeType} onValueChange={(value: 'BUY' | 'SELL') => setTradeType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BUY">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3 w-3 text-green-600" />
                      Buy
                    </div>
                  </SelectItem>
                  <SelectItem value="SELL">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-3 w-3 text-red-600" />
                      Sell
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Order Type</Label>
              <Select value={orderType} onValueChange={(value: 'MARKET' | 'LIMIT') => setOrderType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MARKET">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Market Order
                    </div>
                  </SelectItem>
                  <SelectItem value="LIMIT">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3" />
                      Limit Order
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Quantity (shares)</Label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter number of shares"
            />
          </div>

          {orderType === 'LIMIT' && (
            <div>
              <Label>Limit Price (RWF)</Label>
              <Input
                type="number"
                step="0.01"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                placeholder="Enter limit price"
              />
            </div>
          )}

          {/* Order Summary */}
          {quantity && parseInt(quantity) > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Order Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Order Type:</span>
                  <span>{orderType} {tradeType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity:</span>
                  <span>{quantity} shares</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Price:</span>
                  <span>RWF {estimatedPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total Estimated:</span>
                  <span>RWF {totalCost.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <Button 
            onClick={handleTrade} 
            disabled={isProcessing || !quantity || parseInt(quantity) <= 0}
            className="w-full"
            variant={tradeType === 'BUY' ? 'default' : 'destructive'}
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              `${tradeType} ${selectedStock}`
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}