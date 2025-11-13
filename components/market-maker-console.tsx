'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Settings,
  RefreshCw,
  Zap,
  DollarSign,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Wallet,
  Package,
  Target,
  Clock
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useMarketMaker } from '@/contexts/market-maker-context'
import { MarketData, MarketMakerInventory, OrderBook, SpreadConfig } from '@/lib/market-maker-engine'

interface MarketMakerStock {
  symbol: string
  currentPrice: number
  bidPrice: number
  askPrice: number
  spread: number
  volume: number
  isAutoMode: boolean
  volatility: number
  lastUpdate: Date
}

export function MarketMakerConsole() {
  const { 
    marketData, 
    inventory, 
    orderBooks, 
    getSpreadConfig, 
    updateSpreadConfig,
    isConnected,
    lastUpdate 
  } = useMarketMaker()
  
  const [selectedStock, setSelectedStock] = useState<string>('BK')
  const [globalAutoMode, setGlobalAutoMode] = useState(true)
  const [manualBidPrice, setManualBidPrice] = useState<string>('')
  const [manualAskPrice, setManualAskPrice] = useState<string>('')

  const selectedMarketData = marketData.get(selectedStock)
  const selectedInventory = inventory.get(selectedStock)
  const selectedOrderBook = orderBooks.get(selectedStock)
  const selectedSpreadConfig = getSpreadConfig(selectedStock)

  useEffect(() => {
    if (selectedMarketData) {
      setManualBidPrice(selectedMarketData.bidPrice.toFixed(2))
      setManualAskPrice(selectedMarketData.askPrice.toFixed(2))
    }
  }, [selectedStock, selectedMarketData])

  const updateManualPrices = () => {
    if (!selectedSpreadConfig) return
    
    const bidPrice = parseFloat(manualBidPrice)
    const askPrice = parseFloat(manualAskPrice)
    
    if (isNaN(bidPrice) || isNaN(askPrice) || bidPrice >= askPrice) {
      alert('Invalid prices. Bid must be less than Ask.')
      return
    }

    // This would typically update through the market maker engine
    // For now, we'll update the spread config to disable auto mode
    updateSpreadConfig(selectedStock, { autoAdjust: false })
  }

  const toggleAutoMode = (symbol: string) => {
    const config = getSpreadConfig(symbol)
    if (config) {
      updateSpreadConfig(symbol, { autoAdjust: !config.autoAdjust })
    }
  }

  const updateVolatilityMultiplier = (symbol: string, multiplier: number) => {
    updateSpreadConfig(symbol, { volatilityMultiplier: multiplier })
  }

  const updateSpreadLimits = (symbol: string, minSpread: number, maxSpread: number) => {
    updateSpreadConfig(symbol, { minSpread, maxSpread })
  }

  const getOrderImbalance = (orderBook: OrderBook) => {
    const totalBids = orderBook.bids.reduce((sum, bid) => sum + bid.quantity, 0)
    const totalAsks = orderBook.asks.reduce((sum, ask) => sum + ask.quantity, 0)
    const total = totalBids + totalAsks
    
    if (total === 0) return { ratio: 0, direction: 'neutral' as const }
    
    const imbalance = (totalBids - totalAsks) / total
    return {
      ratio: Math.abs(imbalance),
      direction: imbalance > 0.1 ? 'buy' as const : imbalance < -0.1 ? 'sell' as const : 'neutral' as const
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Market Maker</h1>
          <div className="flex items-center gap-4 mt-2">
            <div className={`flex items-center gap-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <span className="text-sm text-gray-500">
              Last Update: {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border">
            <Switch
              checked={globalAutoMode}
              onCheckedChange={setGlobalAutoMode}
            />
            <div>
              <span className="text-sm font-medium">Global Auto Mode</span>
              <p className="text-xs text-gray-600 mt-1">
                {globalAutoMode 
                  ? "All stocks automatically adjust spreads based on market conditions" 
                  : "Manual control enabled - adjust individual stock settings below"
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Market Maker Inventory Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              RWF {Array.from(inventory.values()).reduce((sum, inv) => sum + inv.totalValue, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Market maker holdings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cash</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              RWF {Array.from(inventory.values()).reduce((sum, inv) => sum + inv.cash, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Available liquidity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unrealized P&L</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${Array.from(inventory.values()).reduce((sum, inv) => sum + inv.unrealizedPnL, 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              RWF {Array.from(inventory.values()).reduce((sum, inv) => sum + inv.unrealizedPnL, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Mark-to-market</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Stocks</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{marketData.size}</div>
            <p className="text-xs text-muted-foreground">Making markets</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock Selection & Overview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Stock Selection & Market Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedStock} onValueChange={setSelectedStock}>
              <SelectTrigger>
                <SelectValue placeholder="Select a stock" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(marketData.entries()).map(([symbol, data]) => (
                  <SelectItem key={symbol} value={symbol}>
                    {symbol} - RWF {data.lastPrice.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedMarketData && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{selectedStock}</h3>
                    <Badge variant={selectedSpreadConfig?.autoAdjust ? 'default' : 'secondary'}>
                      {selectedSpreadConfig?.autoAdjust ? 'Auto' : 'Manual'}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    RWF {selectedMarketData.lastPrice.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-sm ${selectedMarketData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedMarketData.change >= 0 ? '+' : ''}{selectedMarketData.changePercent.toFixed(2)}%
                    </span>
                    <span className="text-sm text-gray-500">
                      Last: {selectedMarketData.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Bid Price</p>
                    <p className="font-medium text-red-600">RWF {selectedMarketData.bidPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Ask Price</p>
                    <p className="font-medium text-green-600">RWF {selectedMarketData.askPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Spread</p>
                    <p className="font-medium">RWF {selectedMarketData.spread.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Volume</p>
                    <p className="font-medium">{selectedMarketData.volume.toLocaleString()}</p>
                  </div>
                </div>

                {/* Order Book Imbalance */}
                {selectedOrderBook && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Order Book</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Bids: {selectedOrderBook.bids.reduce((sum, bid) => sum + bid.quantity, 0)}</span>
                        <span>Asks: {selectedOrderBook.asks.reduce((sum, ask) => sum + ask.quantity, 0)}</span>
                      </div>
                      {(() => {
                        const imbalance = getOrderImbalance(selectedOrderBook)
                        return (
                          <div className="flex items-center gap-2">
                            <span className="text-xs">Imbalance:</span>
                            <Badge variant={imbalance.direction === 'buy' ? 'default' : imbalance.direction === 'sell' ? 'destructive' : 'secondary'}>
                              {imbalance.direction === 'buy' ? 'Buy Heavy' : imbalance.direction === 'sell' ? 'Sell Heavy' : 'Balanced'}
                            </Badge>
                            <span className="text-xs">{(imbalance.ratio * 100).toFixed(1)}%</span>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                )}

                {/* Market Maker Inventory for Selected Stock */}
                {selectedInventory && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">MM Inventory</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Shares:</span>
                        <span className="font-medium ml-1">{selectedInventory.shares.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Cash:</span>
                        <span className="font-medium ml-1">RWF {selectedInventory.cash.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Avg Cost:</span>
                        <span className="font-medium ml-1">RWF {selectedInventory.averageCost.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">P&L:</span>
                        <span className={`font-medium ml-1 ${selectedInventory.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          RWF {selectedInventory.unrealizedPnL.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Advanced Market Making Controls */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Advanced Market Making Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMarketData && selectedSpreadConfig && (
              <div className="space-y-6">
                {/* Auto/Manual Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">Market Making Mode</h4>
                    <p className="text-sm text-gray-600">
                      {selectedSpreadConfig.autoAdjust 
                        ? 'Spreads adjust automatically based on volatility and order flow'
                        : 'Manual control of bid/ask prices and spreads'
                      }
                    </p>
                  </div>
                  <Switch
                    checked={selectedSpreadConfig.autoAdjust}
                    onCheckedChange={() => toggleAutoMode(selectedStock)}
                  />
                </div>

                {/* Manual Price Controls */}
                {!selectedSpreadConfig.autoAdjust && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Bid Price (RWF)</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={manualBidPrice}
                            onChange={(e) => setManualBidPrice(e.target.value)}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setManualBidPrice((parseFloat(manualBidPrice) - 0.5).toFixed(2))}
                          >
                            <TrendingDown className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setManualBidPrice((parseFloat(manualBidPrice) + 0.5).toFixed(2))}
                          >
                            <TrendingUp className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Ask Price (RWF)</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={manualAskPrice}
                            onChange={(e) => setManualAskPrice(e.target.value)}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setManualAskPrice((parseFloat(manualAskPrice) - 0.5).toFixed(2))}
                          >
                            <TrendingDown className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setManualAskPrice((parseFloat(manualAskPrice) + 0.5).toFixed(2))}
                          >
                            <TrendingUp className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Button onClick={updateManualPrices} className="w-full">
                      <Target className="h-4 w-4 mr-2" />
                      Update Prices
                    </Button>
                  </div>
                )}

                {/* Spread Management */}
                <div className="space-y-4">
                  <h4 className="font-medium">Spread Management</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Min Spread (RWF)</Label>
                        <span className="text-sm text-gray-600">{selectedSpreadConfig.minSpread.toFixed(2)}</span>
                      </div>
                      <Slider
                        value={[selectedSpreadConfig.minSpread]}
                        onValueChange={([value]: number[]) => updateSpreadLimits(selectedStock, value, selectedSpreadConfig.maxSpread)}
                        max={2}
                        min={0.1}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Max Spread (RWF)</Label>
                        <span className="text-sm text-gray-600">{selectedSpreadConfig.maxSpread.toFixed(2)}</span>
                      </div>
                      <Slider
                        value={[selectedSpreadConfig.maxSpread]}
                        onValueChange={([value]: number[]) => updateSpreadLimits(selectedStock, selectedSpreadConfig.minSpread, value)}
                        max={10}
                        min={1}
                        step={0.1}
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Volatility Multiplier</Label>
                      <span className="text-sm text-gray-600">{selectedSpreadConfig.volatilityMultiplier.toFixed(1)}x</span>
                    </div>
                    <Slider
                      value={[selectedSpreadConfig.volatilityMultiplier]}
                      onValueChange={([value]: number[]) => updateVolatilityMultiplier(selectedStock, value)}
                      max={5}
                      min={0.5}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Conservative (0.5x)</span>
                      <span>Aggressive (5x)</span>
                    </div>
                  </div>
                </div>

                {/* Current Spread Status */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2">Current Spread Status</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Current:</span>
                      <span className="font-medium ml-1">RWF {selectedMarketData.spread.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">% of Price:</span>
                      <span className="font-medium ml-1">{((selectedMarketData.spread / selectedMarketData.lastPrice) * 100).toFixed(2)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <Badge variant={selectedSpreadConfig.autoAdjust ? 'default' : 'secondary'} className="ml-1">
                        {selectedSpreadConfig.autoAdjust ? 'Auto' : 'Manual'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Risk Metrics */}
                {selectedInventory && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Risk Metrics</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Position Size:</span>
                        <span className="font-medium ml-1">{selectedInventory.shares.toLocaleString()} shares</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Position Value:</span>
                        <span className="font-medium ml-1">RWF {(selectedInventory.shares * selectedMarketData.lastPrice).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Cash Ratio:</span>
                        <span className="font-medium ml-1">{((selectedInventory.cash / selectedInventory.totalValue) * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-500">P&L Ratio:</span>
                        <span className={`font-medium ml-1 ${selectedInventory.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {((selectedInventory.unrealizedPnL / selectedInventory.totalValue) * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Market Overview */}
      <Card className="admin-overlay-fix">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Market Making Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto relative z-10">
            <table className="w-full table-auto admin-table">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Symbol</th>
                  <th className="text-left p-3">Last Price</th>
                  <th className="text-left p-3">Bid</th>
                  <th className="text-left p-3">Ask</th>
                  <th className="text-left p-3">Spread</th>
                  <th className="text-left p-3">Change</th>
                  <th className="text-left p-3">Volume</th>
                  <th className="text-left p-3">MM Inventory</th>
                  <th className="text-left p-3">Mode</th>
                  <th className="text-left p-3">P&L</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(marketData.entries()).map(([symbol, data]) => {
                  const inv = inventory.get(symbol)
                  const config = getSpreadConfig(symbol)
                  return (
                    <tr key={symbol} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{symbol}</td>
                      <td className="p-3">RWF {data.lastPrice.toFixed(2)}</td>
                      <td className="p-3 text-red-600">RWF {data.bidPrice.toFixed(2)}</td>
                      <td className="p-3 text-green-600">RWF {data.askPrice.toFixed(2)}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <span>RWF {data.spread.toFixed(2)}</span>
                          <span className="text-xs text-gray-500">
                            ({((data.spread / data.lastPrice) * 100).toFixed(2)}%)
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className={`flex items-center gap-1 ${data.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {data.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          <span>{data.changePercent.toFixed(2)}%</span>
                        </div>
                      </td>
                      <td className="p-3">{data.volume.toLocaleString()}</td>
                      <td className="p-3">
                        {inv && (
                          <div className="text-xs">
                            <div>{inv.shares.toLocaleString()} shares</div>
                            <div className="text-gray-500">RWF {inv.cash.toLocaleString()}</div>
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge variant={config?.autoAdjust ? 'default' : 'secondary'}>
                          {config?.autoAdjust ? 'Auto' : 'Manual'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {inv && (
                          <span className={`text-sm font-medium ${inv.unrealizedPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            RWF {inv.unrealizedPnL.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="p-3 relative z-20">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setSelectedStock(symbol)
                          }}
                          className="relative z-30 pointer-events-auto"
                        >
                          Manage
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Trade Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Market Maker Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-sm text-gray-600 mb-3">
              Last 10 trades involving market maker
            </div>
            {/* This would show recent trades from the engine */}
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Real-time trade feed will appear here</p>
              <p className="text-xs">Showing market maker fills and inventory changes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}