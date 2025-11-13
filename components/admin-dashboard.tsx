'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity,
  ArrowUpIcon,
  ArrowDownIcon,
  AlertTriangle
} from 'lucide-react'

interface MarketMetrics {
  activeTraders: number
  totalTrades: number
  totalVolume: number
  topGainers: Array<{ symbol: string; price: number; change: number }>
  topLosers: Array<{ symbol: string; price: number; change: number }>
  liquidityLevel: number
}

interface RecentTrade {
  id: string
  symbol: string
  type: 'BUY' | 'SELL'
  quantity: number
  price: number
  trader: string
  timestamp: Date
}

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<MarketMetrics>({
    activeTraders: 0,
    totalTrades: 0,
    totalVolume: 0,
    topGainers: [],
    topLosers: [],
    liquidityLevel: 0
  })
  
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([])
  const [alerts, setAlerts] = useState<Array<{ id: string; message: string; severity: 'high' | 'medium' | 'low' }>>([])

  useEffect(() => {
    // Mock data using actual Rwandan stocks
    setMetrics({
      activeTraders: 1247,
      totalTrades: 3892,
      totalVolume: 15420000,
      topGainers: [
        { symbol: 'AGRITECH', price: 78.4, change: 18.61 },
        { symbol: 'BRALIRWA', price: 325.0, change: 2.68 },
        { symbol: 'MTN', price: 198.3, change: 1.9 }
      ],
      topLosers: [
        { symbol: 'CRYSTAL', price: 156.2, change: -2.98 },
        { symbol: 'BKG', price: 142.8, change: -1.45 },
        { symbol: 'BK', price: 285.5, change: 1.86 }
      ],
      liquidityLevel: 78
    })

    setRecentTrades([
      { id: '1', symbol: 'BK', type: 'BUY', quantity: 100, price: 285.5, trader: 'trader_001', timestamp: new Date() },
      { id: '2', symbol: 'MTN', type: 'SELL', quantity: 50, price: 198.3, trader: 'trader_002', timestamp: new Date() },
      { id: '3', symbol: 'AGRITECH', type: 'BUY', quantity: 200, price: 78.4, trader: 'trader_003', timestamp: new Date() }
    ])

    setAlerts([
      { id: '1', message: 'High volatility detected in AGRITECH - up 18.61%', severity: 'high' },
      { id: '2', message: 'Low liquidity warning for CRYSTAL stock', severity: 'medium' }
    ])
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Market Overview</h1>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Market Open</span>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Market Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between">
                  <span className="text-sm">{alert.message}</span>
                  <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Traders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeTraders.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTrades.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RWF {(metrics.totalVolume / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">+15% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liquidity Level</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.liquidityLevel}%</div>
            <p className="text-xs text-muted-foreground">Healthy range</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Movers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Movers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-green-600 mb-2">Top Gainers</h4>
                {metrics.topGainers.map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between py-1">
                    <span className="font-medium">{stock.symbol}</span>
                    <div className="flex items-center gap-2">
                      <span>RWF {stock.price}</span>
                      <div className="flex items-center text-green-600">
                        <ArrowUpIcon className="h-3 w-3" />
                        <span className="text-sm">+{stock.change}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-red-600 mb-2">Top Losers</h4>
                {metrics.topLosers.map((stock) => (
                  <div key={stock.symbol} className="flex items-center justify-between py-1">
                    <span className="font-medium">{stock.symbol}</span>
                    <div className="flex items-center gap-2">
                      <span>RWF {stock.price}</span>
                      <div className="flex items-center text-red-600">
                        <ArrowDownIcon className="h-3 w-3" />
                        <span className="text-sm">{stock.change}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Trades */}
        <Card>
          <CardHeader>
            <CardTitle>Live Trade Feed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <Badge variant={trade.type === 'BUY' ? 'default' : 'secondary'}>
                      {trade.type}
                    </Badge>
                    <span className="font-medium">{trade.symbol}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{trade.quantity} @ RWF {trade.price}</div>
                    <div className="text-xs text-gray-500">{trade.trader}</div>
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