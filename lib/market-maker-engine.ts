'use client'

export interface Order {
  id: string
  userId: string
  symbol: string
  type: 'BUY' | 'SELL'
  orderType: 'MARKET' | 'LIMIT'
  quantity: number
  price?: number // For limit orders
  timestamp: Date
  status: 'PENDING' | 'FILLED' | 'PARTIAL' | 'CANCELLED'
  filledQuantity: number
  remainingQuantity: number
}

export interface MarketMakerInventory {
  symbol: string
  shares: number
  averageCost: number
  cash: number
  totalValue: number
  unrealizedPnL: number
}

export interface MarketData {
  symbol: string
  bidPrice: number
  askPrice: number
  lastPrice: number
  lastQuantity: number
  spread: number
  volume: number
  high: number
  low: number
  open: number
  change: number
  changePercent: number
  timestamp: Date
}

export interface SpreadConfig {
  symbol: string
  minSpread: number
  maxSpread: number
  baseSpread: number
  volatilityMultiplier: number
  liquidityThreshold: number
  autoAdjust: boolean
}

export interface OrderBookEntry {
  price: number
  quantity: number
  orderId: string
  timestamp: Date
}

export interface OrderBook {
  symbol: string
  bids: OrderBookEntry[]
  asks: OrderBookEntry[]
  lastUpdate: Date
}

export class MarketMakerEngine {
  private orderBooks: Map<string, OrderBook> = new Map()
  private marketData: Map<string, MarketData> = new Map()
  private inventory: Map<string, MarketMakerInventory> = new Map()
  private spreadConfigs: Map<string, SpreadConfig> = new Map()
  private pendingOrders: Map<string, Order> = new Map()
  private tradeHistory: Array<{
    id: string
    symbol: string
    price: number
    quantity: number
    buyOrderId: string
    sellOrderId: string
    timestamp: Date
    type: 'USER_TO_USER' | 'USER_TO_MM' | 'MM_TO_USER'
  }> = []

  constructor() {
    this.initializeMarketData()
    this.initializeInventory()
    this.initializeSpreadConfigs()
  }

  private initializeMarketData() {
    const stocks = [
      { symbol: 'BK', price: 285.5, volume: 125000 },
      { symbol: 'MTN', price: 198.3, volume: 87000 },
      { symbol: 'BRALIRWA', price: 325.0, volume: 65000 },
      { symbol: 'AGRITECH', price: 78.4, volume: 145000 },
      { symbol: 'BKG', price: 142.8, volume: 75000 },
      { symbol: 'CRYSTAL', price: 156.2, volume: 35000 }
    ]

    stocks.forEach(stock => {
      const spread = this.calculateInitialSpread(stock.symbol, stock.price)
      this.marketData.set(stock.symbol, {
        symbol: stock.symbol,
        bidPrice: stock.price - spread / 2,
        askPrice: stock.price + spread / 2,
        lastPrice: stock.price,
        lastQuantity: 0,
        spread: spread,
        volume: stock.volume,
        high: stock.price * 1.02,
        low: stock.price * 0.98,
        open: stock.price * 0.995,
        change: stock.price * 0.005,
        changePercent: 0.5,
        timestamp: new Date()
      })

      this.orderBooks.set(stock.symbol, {
        symbol: stock.symbol,
        bids: [],
        asks: [],
        lastUpdate: new Date()
      })
    })
  }

  private initializeInventory() {
    const initialCash = 10000000 // RWF 10M starting cash
    
    this.marketData.forEach((data, symbol) => {
      const initialShares = 10000 // Start with 10k shares of each stock
      this.inventory.set(symbol, {
        symbol,
        shares: initialShares,
        averageCost: data.lastPrice,
        cash: initialCash / this.marketData.size,
        totalValue: initialShares * data.lastPrice + (initialCash / this.marketData.size),
        unrealizedPnL: 0
      })
    })
  }

  private initializeSpreadConfigs() {
    this.marketData.forEach((data, symbol) => {
      let baseSpread = 1.0
      let volatilityMultiplier = 1.0
      
      // Adjust based on stock characteristics
      switch (symbol) {
        case 'AGRITECH':
          baseSpread = 2.0
          volatilityMultiplier = 2.5
          break
        case 'CRYSTAL':
          baseSpread = 1.5
          volatilityMultiplier = 2.0
          break
        case 'BK':
        case 'MTN':
          baseSpread = 0.8
          volatilityMultiplier = 1.2
          break
        default:
          baseSpread = 1.0
          volatilityMultiplier = 1.5
      }

      this.spreadConfigs.set(symbol, {
        symbol,
        minSpread: 0.5,
        maxSpread: 5.0,
        baseSpread,
        volatilityMultiplier,
        liquidityThreshold: 1000,
        autoAdjust: true
      })
    })
  }

  private calculateInitialSpread(symbol: string, price: number): number {
    const config = this.spreadConfigs.get(symbol)
    if (!config) return 1.0
    
    return Math.max(config.minSpread, Math.min(config.maxSpread, config.baseSpread))
  }

  // Main order processing function
  public processOrder(order: Order): {
    success: boolean
    fills: Array<{ price: number; quantity: number; counterpartyId?: string }>
    remainingQuantity: number
    message: string
  } {
    const orderBook = this.orderBooks.get(order.symbol)
    const marketData = this.marketData.get(order.symbol)
    
    if (!orderBook || !marketData) {
      return {
        success: false,
        fills: [],
        remainingQuantity: order.quantity,
        message: `Invalid symbol: ${order.symbol}`
      }
    }

    // Add order to pending orders
    this.pendingOrders.set(order.id, { ...order, filledQuantity: 0, remainingQuantity: order.quantity })

    const fills: Array<{ price: number; quantity: number; counterpartyId?: string }> = []
    let remainingQuantity = order.quantity

    if (order.type === 'BUY') {
      // Try to match with existing sell orders
      const matchingAsks = orderBook.asks
        .filter(ask => order.orderType === 'MARKET' || !order.price || ask.price <= order.price)
        .sort((a, b) => a.price - b.price) // Best price first

      for (const ask of matchingAsks) {
        if (remainingQuantity <= 0) break

        const fillQuantity = Math.min(remainingQuantity, ask.quantity)
        fills.push({
          price: ask.price,
          quantity: fillQuantity,
          counterpartyId: ask.orderId
        })

        remainingQuantity -= fillQuantity
        ask.quantity -= fillQuantity

        // Record trade
        this.recordTrade(order.symbol, ask.price, fillQuantity, order.id, ask.orderId, 'USER_TO_USER')

        // Remove empty ask
        if (ask.quantity <= 0) {
          const index = orderBook.asks.indexOf(ask)
          orderBook.asks.splice(index, 1)
        }
      }

      // If still have remaining quantity, trade with market maker
      if (remainingQuantity > 0) {
        const mmFill = this.fillWithMarketMaker(order.symbol, 'BUY', remainingQuantity, order.price)
        if (mmFill.quantity > 0) {
          fills.push({
            price: mmFill.price,
            quantity: mmFill.quantity
          })
          remainingQuantity -= mmFill.quantity
        }
      }

      // Add remaining as bid if it's a limit order
      if (remainingQuantity > 0 && order.orderType === 'LIMIT' && order.price) {
        orderBook.bids.push({
          price: order.price,
          quantity: remainingQuantity,
          orderId: order.id,
          timestamp: new Date()
        })
        orderBook.bids.sort((a, b) => b.price - a.price) // Highest price first
      }

    } else { // SELL order
      // Try to match with existing buy orders
      const matchingBids = orderBook.bids
        .filter(bid => order.orderType === 'MARKET' || !order.price || bid.price >= order.price)
        .sort((a, b) => b.price - a.price) // Best price first

      for (const bid of matchingBids) {
        if (remainingQuantity <= 0) break

        const fillQuantity = Math.min(remainingQuantity, bid.quantity)
        fills.push({
          price: bid.price,
          quantity: fillQuantity,
          counterpartyId: bid.orderId
        })

        remainingQuantity -= fillQuantity
        bid.quantity -= fillQuantity

        // Record trade
        this.recordTrade(order.symbol, bid.price, fillQuantity, bid.orderId, order.id, 'USER_TO_USER')

        // Remove empty bid
        if (bid.quantity <= 0) {
          const index = orderBook.bids.indexOf(bid)
          orderBook.bids.splice(index, 1)
        }
      }

      // If still have remaining quantity, trade with market maker
      if (remainingQuantity > 0) {
        const mmFill = this.fillWithMarketMaker(order.symbol, 'SELL', remainingQuantity, order.price)
        if (mmFill.quantity > 0) {
          fills.push({
            price: mmFill.price,
            quantity: mmFill.quantity
          })
          remainingQuantity -= mmFill.quantity
        }
      }

      // Add remaining as ask if it's a limit order
      if (remainingQuantity > 0 && order.orderType === 'LIMIT' && order.price) {
        orderBook.asks.push({
          price: order.price,
          quantity: remainingQuantity,
          orderId: order.id,
          timestamp: new Date()
        })
        orderBook.asks.sort((a, b) => a.price - b.price) // Lowest price first
      }
    }

    // Update market data and spreads
    if (fills.length > 0) {
      this.updateMarketData(order.symbol, fills)
      this.adjustSpreads(order.symbol)
    }

    // Update order status
    const pendingOrder = this.pendingOrders.get(order.id)
    if (pendingOrder) {
      pendingOrder.filledQuantity = order.quantity - remainingQuantity
      pendingOrder.remainingQuantity = remainingQuantity
      pendingOrder.status = remainingQuantity === 0 ? 'FILLED' : 
                           pendingOrder.filledQuantity > 0 ? 'PARTIAL' : 'PENDING'
    }

    return {
      success: true,
      fills,
      remainingQuantity,
      message: fills.length > 0 ? 
        `Order filled: ${fills.length} fills, ${order.quantity - remainingQuantity} shares executed` :
        'Order added to book'
    }
  }

  private fillWithMarketMaker(symbol: string, orderType: 'BUY' | 'SELL', quantity: number, limitPrice?: number): {
    price: number
    quantity: number
  } {
    const marketData = this.marketData.get(symbol)
    const inventory = this.inventory.get(symbol)
    
    if (!marketData || !inventory) {
      return { price: 0, quantity: 0 }
    }

    let fillPrice: number
    let fillQuantity = quantity

    if (orderType === 'BUY') {
      // User buying from market maker at ask price
      fillPrice = marketData.askPrice
      
      // Check if limit price allows this fill
      if (limitPrice && fillPrice > limitPrice) {
        return { price: 0, quantity: 0 }
      }

      // Check market maker inventory
      const maxSell = Math.min(inventory.shares, quantity)
      fillQuantity = maxSell

      if (fillQuantity > 0) {
        // Update market maker inventory
        inventory.shares -= fillQuantity
        inventory.cash += fillQuantity * fillPrice
        
        // Record trade
        this.recordTrade(symbol, fillPrice, fillQuantity, 'USER', 'MARKET_MAKER', 'USER_TO_MM')
      }

    } else {
      // User selling to market maker at bid price
      fillPrice = marketData.bidPrice
      
      // Check if limit price allows this fill
      if (limitPrice && fillPrice < limitPrice) {
        return { price: 0, quantity: 0 }
      }

      // Check market maker cash
      const maxBuy = Math.min(Math.floor(inventory.cash / fillPrice), quantity)
      fillQuantity = maxBuy

      if (fillQuantity > 0) {
        // Update market maker inventory
        inventory.shares += fillQuantity
        inventory.cash -= fillQuantity * fillPrice
        
        // Record trade
        this.recordTrade(symbol, fillPrice, fillQuantity, 'MARKET_MAKER', 'USER', 'MM_TO_USER')
      }
    }

    return { price: fillPrice, quantity: fillQuantity }
  }

  private recordTrade(symbol: string, price: number, quantity: number, buyOrderId: string, sellOrderId: string, type: 'USER_TO_USER' | 'USER_TO_MM' | 'MM_TO_USER') {
    this.tradeHistory.push({
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      symbol,
      price,
      quantity,
      buyOrderId,
      sellOrderId,
      timestamp: new Date(),
      type
    })

    // Keep only last 1000 trades
    if (this.tradeHistory.length > 1000) {
      this.tradeHistory = this.tradeHistory.slice(-1000)
    }
  }

  private updateMarketData(symbol: string, fills: Array<{ price: number; quantity: number }>) {
    const marketData = this.marketData.get(symbol)
    if (!marketData || fills.length === 0) return

    // Update last price and quantity from most recent fill
    const lastFill = fills[fills.length - 1]
    const oldPrice = marketData.lastPrice
    marketData.lastPrice = lastFill.price
    marketData.lastQuantity = lastFill.quantity

    // Update volume
    const totalVolume = fills.reduce((sum, fill) => sum + fill.quantity, 0)
    marketData.volume += totalVolume

    // Update high/low
    marketData.high = Math.max(marketData.high, lastFill.price)
    marketData.low = Math.min(marketData.low, lastFill.price)

    // Update change
    marketData.change = marketData.lastPrice - marketData.open
    marketData.changePercent = (marketData.change / marketData.open) * 100

    // Update timestamp
    marketData.timestamp = new Date()

    // Adjust bid/ask based on price movement
    const priceMovement = marketData.lastPrice - oldPrice
    if (Math.abs(priceMovement) > 0.01) {
      marketData.bidPrice += priceMovement * 0.7
      marketData.askPrice += priceMovement * 0.7
      marketData.spread = marketData.askPrice - marketData.bidPrice
    }
  }

  private adjustSpreads(symbol: string) {
    const config = this.spreadConfigs.get(symbol)
    const marketData = this.marketData.get(symbol)
    const orderBook = this.orderBooks.get(symbol)
    
    if (!config || !marketData || !orderBook || !config.autoAdjust) return

    // Calculate order imbalance
    const totalBids = orderBook.bids.reduce((sum, bid) => sum + bid.quantity, 0)
    const totalAsks = orderBook.asks.reduce((sum, ask) => sum + ask.quantity, 0)
    const imbalance = totalBids - totalAsks
    const totalOrders = totalBids + totalAsks

    // Calculate volatility (simplified)
    const recentTrades = this.tradeHistory
      .filter(trade => trade.symbol === symbol && Date.now() - trade.timestamp.getTime() < 300000) // Last 5 minutes
    
    let volatility = 1.0
    if (recentTrades.length > 1) {
      const prices = recentTrades.map(t => t.price)
      const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length
      const variance = prices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / prices.length
      volatility = Math.sqrt(variance) / avgPrice
    }

    // Calculate new spread
    let newSpread = config.baseSpread
    
    // Adjust for volatility
    newSpread *= (1 + volatility * config.volatilityMultiplier)
    
    // Adjust for liquidity (order book depth)
    if (totalOrders < config.liquidityThreshold) {
      newSpread *= 1.5 // Widen spread when liquidity is low
    }
    
    // Adjust for order imbalance
    if (totalOrders > 0) {
      const imbalanceRatio = Math.abs(imbalance) / totalOrders
      newSpread *= (1 + imbalanceRatio * 0.5)
    }

    // Apply limits
    newSpread = Math.max(config.minSpread, Math.min(config.maxSpread, newSpread))

    // Update market data
    const midPrice = (marketData.bidPrice + marketData.askPrice) / 2
    marketData.bidPrice = midPrice - newSpread / 2
    marketData.askPrice = midPrice + newSpread / 2
    marketData.spread = newSpread
  }

  // Public getters
  public getMarketData(symbol?: string): MarketData | Map<string, MarketData> {
    if (symbol) {
      return this.marketData.get(symbol) || {} as MarketData
    }
    return this.marketData
  }

  public getOrderBook(symbol: string): OrderBook | null {
    return this.orderBooks.get(symbol) || null
  }

  public getInventory(symbol?: string): MarketMakerInventory | Map<string, MarketMakerInventory> {
    if (symbol) {
      return this.inventory.get(symbol) || {} as MarketMakerInventory
    }
    return this.inventory
  }

  public getSpreadConfig(symbol: string): SpreadConfig | null {
    return this.spreadConfigs.get(symbol) || null
  }

  public updateSpreadConfig(symbol: string, config: Partial<SpreadConfig>) {
    const existing = this.spreadConfigs.get(symbol)
    if (existing) {
      this.spreadConfigs.set(symbol, { ...existing, ...config })
    }
  }

  public getTradeHistory(symbol?: string, limit: number = 100) {
    let trades = symbol ? 
      this.tradeHistory.filter(t => t.symbol === symbol) : 
      this.tradeHistory
    
    return trades.slice(-limit).reverse() // Most recent first
  }

  public getPendingOrders(userId?: string): Order[] {
    const orders = Array.from(this.pendingOrders.values())
    return userId ? orders.filter(o => o.userId === userId) : orders
  }

  public cancelOrder(orderId: string): boolean {
    const order = this.pendingOrders.get(orderId)
    if (!order || order.status === 'FILLED') return false

    // Remove from order book
    const orderBook = this.orderBooks.get(order.symbol)
    if (orderBook) {
      if (order.type === 'BUY') {
        const index = orderBook.bids.findIndex(bid => bid.orderId === orderId)
        if (index >= 0) orderBook.bids.splice(index, 1)
      } else {
        const index = orderBook.asks.findIndex(ask => ask.orderId === orderId)
        if (index >= 0) orderBook.asks.splice(index, 1)
      }
    }

    // Update order status
    order.status = 'CANCELLED'
    return true
  }

  // Simulate market movement for demo purposes
  public simulateMarketMovement() {
    this.marketData.forEach((data, symbol) => {
      const change = (Math.random() - 0.5) * 2 // -1 to +1
      const volatility = this.spreadConfigs.get(symbol)?.volatilityMultiplier || 1
      const priceChange = change * volatility * 0.5

      data.lastPrice += priceChange
      data.bidPrice += priceChange
      data.askPrice += priceChange
      data.change = data.lastPrice - data.open
      data.changePercent = (data.change / data.open) * 100
      data.timestamp = new Date()

      // Update inventory unrealized P&L
      const inventory = this.inventory.get(symbol)
      if (inventory) {
        inventory.unrealizedPnL = (data.lastPrice - inventory.averageCost) * inventory.shares
        inventory.totalValue = inventory.shares * data.lastPrice + inventory.cash
      }
    })
  }
}