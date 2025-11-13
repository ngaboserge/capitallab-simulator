'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  BarChart3, 
  Target,
  Activity,
  Zap
} from 'lucide-react'
import { AdvancedOrderTypes } from '@/components/advanced-order-types'
import { LevelIIMarketData } from '@/components/level-ii-market-data'
import { RealTimeMarketData } from '@/components/real-time-market-data'
import { EnhancedTradeInterface } from '@/components/enhanced-trade-interface'

export default function ProfessionalTradingPage() {
  const [activeTab, setActiveTab] = useState('level-ii')
  const [selectedStock, setSelectedStock] = useState('BK')

  const stocks = [
    { symbol: 'BK', name: 'Bank of Kigali', price: 285.5 },
    { symbol: 'MTN', name: 'MTN Rwanda', price: 198.3 },
    { symbol: 'BRALIRWA', name: 'Bralirwa', price: 325.0 },
    { symbol: 'AGRITECH', name: 'AgriTech Rwanda', price: 78.4 },
    { symbol: 'BKG', name: 'BK Group', price: 142.8 },
    { symbol: 'CRYSTAL', name: 'Crystal Telecom', price: 156.2 }
  ]

  const currentStock = stocks.find(s => s.symbol === selectedStock)

  const tabs = [
    { id: 'level-ii', label: 'Level II Data', icon: BarChart3, description: 'Professional order book' },
    { id: 'advanced-orders', label: 'Advanced Orders', icon: Target, description: 'Professional order types' },
    { id: 'enhanced-trading', label: 'Enhanced Trading', icon: Zap, description: 'Smart order routing' },
    { id: 'real-time-data', label: 'Real-time Data', icon: Activity, description: 'Live market feeds' }
  ]

  const handleOrderSubmit = (order: any) => {
    console.log('Order submitted:', order)
    // Here you would integrate with your market maker engine
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'level-ii':
        return <LevelIIMarketData symbol={selectedStock} />
      case 'advanced-orders':
        return (
          <AdvancedOrderTypes 
            selectedStock={selectedStock}
            currentPrice={currentStock?.price || 0}
            onOrderSubmit={handleOrderSubmit}
          />
        )
      case 'enhanced-trading':
        return (
          <EnhancedTradeInterface 
            selectedStock={selectedStock}
            onTradeComplete={(result) => console.log('Trade completed:', result)}
          />
        )
      case 'real-time-data':
        return <RealTimeMarketData showBidAsk={true} />
      default:
        return <LevelIIMarketData symbol={selectedStock} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Professional Trading</h1>
            <p className="text-gray-600 mt-1">NASDAQ-level trading tools and market data</p>
          </div>
          <Badge className="bg-blue-600 text-white">
            <TrendingUp className="h-3 w-3 mr-1" />
            Professional
          </Badge>
        </div>

        {/* Stock Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stocks.map((stock) => (
                <Button
                  key={stock.symbol}
                  variant={selectedStock === stock.symbol ? 'default' : 'outline'}
                  onClick={() => setSelectedStock(stock.symbol)}
                  className="flex items-center gap-2"
                >
                  <span className="font-medium">{stock.symbol}</span>
                  <span className="text-sm">RWF {stock.price}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <Card 
                key={tab.id}
                className={`cursor-pointer transition-all ${
                  activeTab === tab.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${
                      activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <h3 className={`font-medium ${
                        activeTab === tab.id ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {tab.label}
                      </h3>
                      <p className="text-xs text-gray-500">{tab.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-lg shadow-sm">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}