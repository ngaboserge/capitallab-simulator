'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  Pause, 
  RotateCcw, 
  Filter,
  Search,
  Download,
  Eye
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Trade {
  id: string
  timestamp: Date
  trader: string
  symbol: string
  type: 'BUY' | 'SELL'
  quantity: number
  price: number
  total: number
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'FLAGGED'
  flagReason?: string
}

interface TradeFilter {
  trader: string
  symbol: string
  type: string
  status: string
  minPrice: string
  maxPrice: string
  dateFrom: string
  dateTo: string
}

export function TradingMonitor() {
  const [trades, setTrades] = useState<Trade[]>([])
  const [filteredTrades, setFilteredTrades] = useState<Trade[]>([])
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
  const [filters, setFilters] = useState<TradeFilter>({
    trader: '',
    symbol: '',
    type: '',
    status: '',
    minPrice: '',
    maxPrice: '',
    dateFrom: '',
    dateTo: ''
  })

  useEffect(() => {
    // Mock data using actual Rwandan stocks
    const mockTrades: Trade[] = [
      {
        id: '1',
        timestamp: new Date(),
        trader: 'trader_001',
        symbol: 'BK',
        type: 'BUY',
        quantity: 100,
        price: 285.5,
        total: 28550.00,
        status: 'COMPLETED'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 60000),
        trader: 'trader_002',
        symbol: 'MTN',
        type: 'SELL',
        quantity: 50,
        price: 198.3,
        total: 9915.00,
        status: 'COMPLETED'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 120000),
        trader: 'trader_003',
        symbol: 'AGRITECH',
        type: 'BUY',
        quantity: 1000,
        price: 78.4,
        total: 78400.00,
        status: 'FLAGGED',
        flagReason: 'Large volume trade exceeds daily limit'
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 180000),
        trader: 'trader_001',
        symbol: 'BRALIRWA',
        type: 'SELL',
        quantity: 25,
        price: 325.0,
        total: 8125.00,
        status: 'PENDING'
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 240000),
        trader: 'trader_004',
        symbol: 'CRYSTAL',
        type: 'BUY',
        quantity: 200,
        price: 156.2,
        total: 31240.00,
        status: 'FAILED'
      }
    ]
    
    setTrades(mockTrades)
    setFilteredTrades(mockTrades)
  }, [])

  useEffect(() => {
    let filtered = trades.filter(trade => {
      const matchesSearch = 
        trade.trader.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trade.id.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilters = 
        (!filters.trader || trade.trader.includes(filters.trader)) &&
        (!filters.symbol || trade.symbol === filters.symbol) &&
        (!filters.type || trade.type === filters.type) &&
        (!filters.status || trade.status === filters.status) &&
        (!filters.minPrice || trade.price >= parseFloat(filters.minPrice)) &&
        (!filters.maxPrice || trade.price <= parseFloat(filters.maxPrice))

      return matchesSearch && matchesFilters
    })

    setFilteredTrades(filtered)
  }, [trades, searchTerm, filters])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      case 'FLAGGED': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const haltTrading = (symbol: string) => {
    // Implementation for halting trading
    console.log(`Halting trading for ${symbol}`)
  }

  const reverseTrade = (tradeId: string) => {
    setTrades(trades.map(trade => 
      trade.id === tradeId 
        ? { ...trade, status: 'FAILED' as const }
        : trade
    ))
  }

  const clearFilters = () => {
    setFilters({
      trader: '',
      symbol: '',
      type: '',
      status: '',
      minPrice: '',
      maxPrice: '',
      dateFrom: '',
      dateTo: ''
    })
    setSearchTerm('')
  }

  const exportTrades = () => {
    // Implementation for exporting trades
    console.log('Exporting trades...')
  }

  const flaggedTrades = trades.filter(t => t.status === 'FLAGGED')
  const pendingTrades = trades.filter(t => t.status === 'PENDING')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Trading Monitor</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportTrades}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filter Trades</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Trader ID</label>
                  <Input
                    value={filters.trader}
                    onChange={(e) => setFilters({...filters, trader: e.target.value})}
                    placeholder="trader_001"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Symbol</label>
                  <Select value={filters.symbol} onValueChange={(value) => setFilters({...filters, symbol: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All symbols" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All symbols</SelectItem>
                      <SelectItem value="BK">BK</SelectItem>
                      <SelectItem value="MTN">MTN</SelectItem>
                      <SelectItem value="BRALIRWA">BRALIRWA</SelectItem>
                      <SelectItem value="AGRITECH">AGRITECH</SelectItem>
                      <SelectItem value="BKG">BKG</SelectItem>
                      <SelectItem value="CRYSTAL">CRYSTAL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      <SelectItem value="BUY">BUY</SelectItem>
                      <SelectItem value="SELL">SELL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                      <SelectItem value="PENDING">PENDING</SelectItem>
                      <SelectItem value="FAILED">FAILED</SelectItem>
                      <SelectItem value="FLAGGED">FLAGGED</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Min Price</label>
                  <Input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Price</label>
                  <Input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                    placeholder="999.99"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={clearFilters}>
                  Clear All
                </Button>
                <Button onClick={() => setIsFilterOpen(false)}>
                  Apply Filters
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Alert Summary */}
      {(flaggedTrades.length > 0 || pendingTrades.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flaggedTrades.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  Flagged Trades ({flaggedTrades.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {flaggedTrades.slice(0, 3).map((trade) => (
                    <div key={trade.id} className="text-sm">
                      <span className="font-medium">{trade.symbol}</span> - {trade.trader}
                      <p className="text-xs text-red-600">{trade.flagReason}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {pendingTrades.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-5 w-5" />
                  Pending Trades ({pendingTrades.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pendingTrades.slice(0, 3).map((trade) => (
                    <div key={trade.id} className="text-sm">
                      <span className="font-medium">{trade.symbol}</span> - {trade.trader}
                      <p className="text-xs text-yellow-600">
                        {trade.quantity} shares @ ${trade.price}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search trades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="text-sm text-gray-600 flex items-center">
          Showing {filteredTrades.length} of {trades.length} trades
        </div>
      </div>

      {/* Trades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Live Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Time</th>
                  <th className="text-left p-3">Trader</th>
                  <th className="text-left p-3">Symbol</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Quantity</th>
                  <th className="text-left p-3">Price</th>
                  <th className="text-left p-3">Total</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.map((trade) => (
                  <tr key={trade.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm">
                      {trade.timestamp.toLocaleTimeString()}
                    </td>
                    <td className="p-3 font-mono text-sm">{trade.trader}</td>
                    <td className="p-3 font-medium">{trade.symbol}</td>
                    <td className="p-3">
                      <Badge variant={trade.type === 'BUY' ? 'default' : 'secondary'}>
                        {trade.type}
                      </Badge>
                    </td>
                    <td className="p-3">{trade.quantity.toLocaleString()}</td>
                    <td className="p-3">RWF {trade.price.toFixed(2)}</td>
                    <td className="p-3">RWF {trade.total.toLocaleString()}</td>
                    <td className="p-3">
                      <Badge className={getStatusColor(trade.status)}>
                        {trade.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedTrade(trade)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        {trade.status === 'COMPLETED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => reverseTrade(trade.id)}
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => haltTrading(trade.symbol)}
                        >
                          <Pause className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Trade Details Dialog */}
      <Dialog open={!!selectedTrade} onOpenChange={() => setSelectedTrade(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trade Details</DialogTitle>
          </DialogHeader>
          {selectedTrade && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Trade ID</label>
                  <p className="font-mono">{selectedTrade.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Timestamp</label>
                  <p>{selectedTrade.timestamp.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Trader</label>
                  <p className="font-mono">{selectedTrade.trader}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Symbol</label>
                  <p className="font-medium">{selectedTrade.symbol}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Type</label>
                  <Badge variant={selectedTrade.type === 'BUY' ? 'default' : 'secondary'}>
                    {selectedTrade.type}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <Badge className={getStatusColor(selectedTrade.status)}>
                    {selectedTrade.status}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Quantity</label>
                  <p>{selectedTrade.quantity.toLocaleString()} shares</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Price</label>
                  <p>RWF {selectedTrade.price.toFixed(2)}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Total Value</label>
                <p className="text-lg font-bold">RWF {selectedTrade.total.toLocaleString()}</p>
              </div>

              {selectedTrade.flagReason && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                  <label className="text-sm font-medium text-orange-800">Flag Reason</label>
                  <p className="text-sm text-orange-700">{selectedTrade.flagReason}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedTrade(null)}>
                  Close
                </Button>
                {selectedTrade.status === 'COMPLETED' && (
                  <Button 
                    variant="destructive"
                    onClick={() => {
                      reverseTrade(selectedTrade.id)
                      setSelectedTrade(null)
                    }}
                  >
                    Reverse Trade
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}