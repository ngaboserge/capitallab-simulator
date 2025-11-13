'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  BarChart3,
  Clock,
  Users
} from 'lucide-react'

interface OrderBookLevel {
  price: number
  size: number
  orders: number
  mmid?: string // Market Maker ID
}

interface LevelIIData {
  symbol: string
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
  lastTrade: {
    price: number
    size: number
    time: Date
    side: 'BUY' | 'SELL'
  }
  dayStats: {
    high: number
    low: number
    volume: number
    vwap: number
    open: number
  }
}

interface LevelIIMarketDataProps {
  symbol: string
}

export function LevelIIMarketData({ symbol }: LevelIIMarketDataProps) {
  const [data, setData] = useState<LevelIIData | null>(null)
  const [timeAndSales, setTimeAndSales] = useState<Array<{
    time: Date
    price: number
    size: number
    side: 'BUY' | 'SELL'
  }>>([])

  useEffect(() => {
    // Mock Level II data - in real system this would come from market data feed
    const mockData: LevelIIData = {
      symbol,
      bids: [
        { price: 285.50, size: 1000, orders: 3, mmid: 'CITADEL' },
        { price: 285.25, size: 2500, orders: 7, mmid: 'VIRTU' },
        { price: 285.00, size: 1800, orders: 5 },
        { price: 284.75, size: 3200, orders: 12 },
        { price: 284.50, size: 900, orders: 4, mmid: 'JANE' },
        { price: 284.25, size: 1500, orders: 6 },
        { price: 284.00, size: 2100, orders: 8 },
        { price: 283.75, size: 800, orders: 3 },
        { price: 283.50, size: 1200, orders: 5 },
        { price: 283.25, size: 600, orders: 2 }
      ],
      asks: [
        { price: 286.00, size: 800, orders: 2, mmid: 'CITADEL' },
        { price: 286.25, size: 1500, orders: 5 },
        { price: 286.50, size: 2200, orders: 8, mmid: 'VIRTU' },
        { price: 286.75, size: 1100, orders: 4 },
        { price: 287.00, size: 3000, orders: 11 },
        { price: 287.25, size: 700, orders: 3, mmid: 'JANE' },
        { price: 287.50, size: 1800, orders: 6 },
        { price: 287.75, size: 950, orders: 4 },
        { price: 288.00, size: 1300, orders: 5 },
        { price: 288.25, size: 500, orders: 2 }
      ],
      lastTrade: {
        price: 285.75,
        size: 500,
        time: new Date(),
        side: 'BUY'
      },
      dayStats: {
        high: 288.50,
        low: 282.10,
        volume: 1250000,
        vwap: 285.32,
        open: 284.20
      }
    }

    setData(mockData)

    // Mock time and sales data
    const mockTrades = Array.from({ length: 20 }, (_, i) => ({
      time: new Date(Date.now() - i * 30000),
      price: 285 + (Math.random() - 0.5) * 2,
      size: Math.floor(Math.random() * 1000) + 100,
      side: Math.random() > 0.5 ? 'BUY' as const : 'SELL' as const
    }))

    setTimeAndSales(mockTrades)

    // Simulate real-time updates
    const interval = setInterval(() => {
      setData(prev => {
        if (!prev) return prev
        
        // Randomly update some levels
        const newBids = [...prev.bids]
        const newAsks = [...prev.asks]
        
        // Update a random bid
        const bidIndex = Math.floor(Math.random() * newBids.length)
        newBids[bidIndex] = {
          ...newBids[bidIndex],
          size: Math.max(100, newBids[bidIndex].size + (Math.random() - 0.5) * 500)
        }
        
        // Update a random ask
        const askIndex = Math.floor(Math.random() * newAsks.length)
        newAsks[askIndex] = {
          ...newAsks[askIndex],
          size: Math.max(100, newAsks[askIndex].size + (Math.random() - 0.5) * 500)
        }

        return {
          ...prev,
          bids: newBids,
          asks: newAsks
        }
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [symbol])

  if (!data) return <div>Loading Level II data...</div>

  const totalBidSize = data.bids.reduce((sum, bid) => sum + bid.size, 0)
  const totalAskSize = data.asks.reduce((sum, ask) => sum + ask.size, 0)
  const maxSize = Math.max(totalBidSize, totalAskSize)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Order Book */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Level II Order Book - {symbol}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {/* Bids */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-green-600">Bids</h4>
                <span className="text-sm text-gray-500">{totalBidSize.toLocaleString()} shares</span>
              </div>
              <div className="space-y-1">
                {data.bids.map((bid, index) => (
                  <div key={index} className="relative">
                    <div 
                      className="absolute inset-0 bg-green-100 opacity-30"
                      style={{ width: `${(bid.size / Math.max(...data.bids.map(b => b.size))) * 100}%` }}
                    />
                    <div className="relative flex items-center justify-between p-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-green-600">RWF {bid.price.toFixed(2)}</span>
                        {bid.mmid && (
                          <Badge variant="outline" className="text-xs">
                            {bid.mmid}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{bid.size.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{bid.orders} orders</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Asks */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-red-600">Asks</h4>
                <span className="text-sm text-gray-500">{totalAskSize.toLocaleString()} shares</span>
              </div>
              <div className="space-y-1">
                {data.asks.map((ask, index) => (
                  <div key={index} className="relative">
                    <div 
                      className="absolute inset-0 bg-red-100 opacity-30"
                      style={{ width: `${(ask.size / Math.max(...data.asks.map(a => a.size))) * 100}%` }}
                    />
                    <div className="relative flex items-center justify-between p-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-red-600">RWF {ask.price.toFixed(2)}</span>
                        {ask.mmid && (
                          <Badge variant="outline" className="text-xs">
                            {ask.mmid}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{ask.size.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{ask.orders} orders</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Market Depth Visualization */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-3">Market Depth</h4>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-green-600">Bid Depth</span>
                  <span>{((totalBidSize / (totalBidSize + totalAskSize)) * 100).toFixed(1)}%</span>
                </div>
                <Progress 
                  value={(totalBidSize / (totalBidSize + totalAskSize)) * 100} 
                  className="h-2"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-red-600">Ask Depth</span>
                  <span>{((totalAskSize / (totalBidSize + totalAskSize)) * 100).toFixed(1)}%</span>
                </div>
                <Progress 
                  value={(totalAskSize / (totalBidSize + totalAskSize)) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time & Sales + Stats */}
      <div className="space-y-6">
        {/* Day Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Day Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Open:</span>
                <span className="font-medium ml-2">RWF {data.dayStats.open.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500">High:</span>
                <span className="font-medium ml-2 text-green-600">RWF {data.dayStats.high.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500">Low:</span>
                <span className="font-medium ml-2 text-red-600">RWF {data.dayStats.low.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500">VWAP:</span>
                <span className="font-medium ml-2">RWF {data.dayStats.vwap.toFixed(2)}</span>
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Volume:</span>
                <span className="font-medium">{data.dayStats.volume.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time & Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time & Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {timeAndSales.map((trade, index) => (
                <div key={index} className="flex items-center justify-between p-2 text-sm hover:bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {trade.time.toLocaleTimeString()}
                    </span>
                    <Badge 
                      variant={trade.side === 'BUY' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {trade.side}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-mono">RWF {trade.price.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{trade.size}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}