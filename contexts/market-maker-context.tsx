'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { MarketMakerEngine, Order, MarketData, MarketMakerInventory, OrderBook, SpreadConfig } from '@/lib/market-maker-engine'

interface MarketMakerContextType {
  engine: MarketMakerEngine
  marketData: Map<string, MarketData>
  inventory: Map<string, MarketMakerInventory>
  orderBooks: Map<string, OrderBook>
  
  // Actions
  processOrder: (order: Order) => Promise<{
    success: boolean
    fills: Array<{ price: number; quantity: number; counterpartyId?: string }>
    remainingQuantity: number
    message: string
  }>
  
  getMarketData: (symbol?: string) => MarketData | Map<string, MarketData>
  getOrderBook: (symbol: string) => OrderBook | null
  getInventory: (symbol?: string) => MarketMakerInventory | Map<string, MarketMakerInventory>
  getSpreadConfig: (symbol: string) => SpreadConfig | null
  updateSpreadConfig: (symbol: string, config: Partial<SpreadConfig>) => void
  cancelOrder: (orderId: string) => boolean
  
  // Real-time updates
  isConnected: boolean
  lastUpdate: Date
}

const MarketMakerContext = createContext<MarketMakerContextType | null>(null)

export function MarketMakerProvider({ children }: { children: React.ReactNode }) {
  const [engine] = useState(() => new MarketMakerEngine())
  const [marketData, setMarketData] = useState<Map<string, MarketData>>(new Map())
  const [inventory, setInventory] = useState<Map<string, MarketMakerInventory>>(new Map())
  const [orderBooks, setOrderBooks] = useState<Map<string, OrderBook>>(new Map())
  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Update state from engine
  const updateState = useCallback(() => {
    setMarketData(new Map(engine.getMarketData() as Map<string, MarketData>))
    setInventory(new Map(engine.getInventory() as Map<string, MarketMakerInventory>))
    
    // Update order books
    const newOrderBooks = new Map<string, OrderBook>()
    const symbols = ['BK', 'MTN', 'BRALIRWA', 'AGRITECH', 'BKG', 'CRYSTAL']
    symbols.forEach(symbol => {
      const orderBook = engine.getOrderBook(symbol)
      if (orderBook) {
        newOrderBooks.set(symbol, orderBook)
      }
    })
    setOrderBooks(newOrderBooks)
    
    setLastUpdate(new Date())
  }, [engine])

  // Process order with state update
  const processOrder = useCallback(async (order: Order) => {
    const result = engine.processOrder(order)
    updateState() // Update state after processing
    return result
  }, [engine, updateState])

  // Get market data
  const getMarketData = useCallback((symbol?: string) => {
    return engine.getMarketData(symbol)
  }, [engine])

  // Get order book
  const getOrderBook = useCallback((symbol: string) => {
    return engine.getOrderBook(symbol)
  }, [engine])

  // Get inventory
  const getInventory = useCallback((symbol?: string) => {
    return engine.getInventory(symbol)
  }, [engine])

  // Get spread config
  const getSpreadConfig = useCallback((symbol: string) => {
    return engine.getSpreadConfig(symbol)
  }, [engine])

  // Update spread config
  const updateSpreadConfig = useCallback((symbol: string, config: Partial<SpreadConfig>) => {
    engine.updateSpreadConfig(symbol, config)
    updateState()
  }, [engine, updateState])

  // Cancel order
  const cancelOrder = useCallback((orderId: string) => {
    const result = engine.cancelOrder(orderId)
    if (result) {
      updateState()
    }
    return result
  }, [engine, updateState])

  // Initialize and set up real-time updates
  useEffect(() => {
    updateState()

    // Simulate market movement every 3 seconds
    const marketInterval = setInterval(() => {
      engine.simulateMarketMovement()
      updateState()
    }, 3000)

    // Simulate connection status
    const connectionInterval = setInterval(() => {
      setIsConnected(prev => Math.random() > 0.05 ? true : prev) // 95% uptime
    }, 1000)

    return () => {
      clearInterval(marketInterval)
      clearInterval(connectionInterval)
    }
  }, [engine, updateState])

  const value: MarketMakerContextType = {
    engine,
    marketData,
    inventory,
    orderBooks,
    processOrder,
    getMarketData,
    getOrderBook,
    getInventory,
    getSpreadConfig,
    updateSpreadConfig,
    cancelOrder,
    isConnected,
    lastUpdate
  }

  return (
    <MarketMakerContext.Provider value={value}>
      {children}
    </MarketMakerContext.Provider>
  )
}

export function useMarketMaker() {
  const context = useContext(MarketMakerContext)
  if (!context) {
    throw new Error('useMarketMaker must be used within a MarketMakerProvider')
  }
  return context
}