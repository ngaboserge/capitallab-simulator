'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { useMarketMaker } from '@/contexts/market-maker-context'

interface RealTimeMarketDataProps {
  symbol?: string
  showBidAsk?: boolean
  compact?: boolean
}

export function RealTimeMarketData({ 
  symbol, 
  showBidAsk = true, 
  compact = false 
}: RealTimeMarketDataProps) {
  const { marketData, isConnected } = useMarketMaker()
  const [animatingSymbols, setAnimatingSymbols] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Animate price changes
    const interval = setInterval(() => {
      const symbols = Array.from(marketData.keys())
      if (symbols.length > 0) {
        const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)]
        setAnimatingSymbols(prev => new Set(prev).add(randomSymbol))
        
        setTimeout(() => {
          setAnimatingSymbols(prev => {
            const next = new Set(prev)
            next.delete(randomSymbol)
            return next
          })
        }, 1000)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [marketData])

  if (symbol) {
    // Single stock display
    const data = marketData.get(symbol)
    if (!data) return null

    const isAnimating = animatingSymbols.has(symbol)
    const isPositive = data.change >= 0

    if (compact) {
      return (
        <div className={`flex items-center gap-2 p-2 rounded transition-all duration-300 ${
          isAnimating ? (isPositive ? 'bg-green-100' : 'bg-red-100') : ''
        }`}>
          <span className="font-medium">{symbol}</span>
          <span className="font-bold">RWF {data.lastPrice.toFixed(2)}</span>
          <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%</span>
          </div>
          {showBidAsk && (
            <div className="text-xs text-gray-500">
              Bid: {data.bidPrice.toFixed(2)} | Ask: {data.askPrice.toFixed(2)}
            </div>
          )}
        </div>
      )
    }

    return (
      <Card className={`transition-all duration-300 ${
        isAnimating ? (isPositive ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50') : ''
      }`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">{symbol}</h3>
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? 'Live' : 'Offline'}
            </Badge>
          </div>
          
          <div className="text-2xl font-bold mb-1">
            RWF {data.lastPrice.toFixed(2)}
          </div>
          
          <div className={`flex items-center gap-2 mb-3 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{isPositive ? '+' : ''}{data.change.toFixed(2)} ({data.changePercent.toFixed(2)}%)</span>
          </div>

          {showBidAsk && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Bid:</span>
                <span className="font-medium text-red-600 ml-1">RWF {data.bidPrice.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-500">Ask:</span>
                <span className="font-medium text-green-600 ml-1">RWF {data.askPrice.toFixed(2)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Multiple stocks display
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Live Market Data
          <Badge variant={isConnected ? 'default' : 'destructive'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Array.from(marketData.entries()).map(([sym, data]) => {
            const isAnimating = animatingSymbols.has(sym)
            const isPositive = data.change >= 0
            
            return (
              <div
                key={sym}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                  isAnimating 
                    ? (isPositive ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50')
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">{sym}</span>
                  <span className="text-lg font-bold">RWF {data.lastPrice.toFixed(2)}</span>
                </div>
                
                <div className="flex items-center gap-4">
                  {showBidAsk && (
                    <div className="text-sm">
                      <span className="text-red-600">B: {data.bidPrice.toFixed(2)}</span>
                      <span className="text-gray-400 mx-1">|</span>
                      <span className="text-green-600">A: {data.askPrice.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    <span className="text-sm font-medium">
                      {isPositive ? '+' : ''}{data.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}