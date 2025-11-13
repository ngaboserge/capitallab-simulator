// 🏭 Trading Engine - Where Completed Workflows Become Tradeable Securities

export interface TradingInstrument {
  id: string;
  symbol: string;
  companyName: string;
  instrumentType: 'equity' | 'bond' | 'preferred' | 'warrant';
  
  // From completed workflow
  workflowId: string;
  issueSize: number;
  issuePrice: number;
  listingDate: Date;
  
  // Trading data
  currentPrice: number;
  bidPrice: number;
  askPrice: number;
  volume: number;
  marketCap: number;
  
  status: 'pre-trading' | 'active' | 'halted' | 'delisted';
}

export interface TradeOrder {
  id: string;
  instrumentId: string;
  userId: string;
  side: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  quantity: number;
  price?: number;
  status: 'pending' | 'partial' | 'filled' | 'cancelled';
  filledQuantity: number;
  avgFillPrice: number;
  timestamp: Date;
}

export class TradingEngine {
  private instruments: Map<string, TradingInstrument> = new Map();
  private orders: Map<string, TradeOrder> = new Map();

  // 🎓 Create tradeable instrument from completed workflow
  createInstrumentFromWorkflow(workflow: any): TradingInstrument {
    const instrument: TradingInstrument = {
      id: `${workflow.companyName.replace(/\s+/g, '')}_${workflow.instrumentType}`,
      symbol: this.generateSymbol(workflow.companyName),
      companyName: workflow.companyName,
      instrumentType: workflow.instrumentType,
      workflowId: workflow.id,
      issueSize: workflow.targetAmount,
      issuePrice: workflow.pricePerShare || workflow.targetAmount / workflow.sharesOffered,
      listingDate: new Date(),
      currentPrice: workflow.pricePerShare || workflow.targetAmount / workflow.sharesOffered,
      bidPrice: 0,
      askPrice: 0,
      volume: 0,
      marketCap: workflow.targetAmount,
      status: 'pre-trading'
    };

    this.instruments.set(instrument.id, instrument);
    return instrument;
  }

  // 🚀 Launch trading for instrument
  launchTrading(instrumentId: string): boolean {
    const instrument = this.instruments.get(instrumentId);
    if (!instrument) return false;

    instrument.status = 'active';
    
    // Initialize market making
    const midPrice = instrument.issuePrice;
    const spread = midPrice * 0.005; // 0.5% spread
    
    instrument.bidPrice = midPrice - (spread / 2);
    instrument.askPrice = midPrice + (spread / 2);
    instrument.currentPrice = midPrice;

    return true;
  }

  // 📝 Place trade order
  placeOrder(order: Omit<TradeOrder, 'id' | 'timestamp' | 'status' | 'filledQuantity' | 'avgFillPrice'>): TradeOrder {
    const tradeOrder: TradeOrder = {
      ...order,
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      status: 'pending',
      filledQuantity: 0,
      avgFillPrice: 0
    };

    this.orders.set(tradeOrder.id, tradeOrder);
    
    // Simulate order execution
    this.simulateOrderExecution(tradeOrder);

    return tradeOrder;
  }

  // ⚡ Simulate order execution
  private simulateOrderExecution(order: TradeOrder): void {
    const instrument = this.instruments.get(order.instrumentId);
    if (!instrument) return;

    // Simple execution simulation
    setTimeout(() => {
      const executionPrice = order.orderType === 'market' 
        ? instrument.currentPrice
        : order.price || instrument.currentPrice;

      order.filledQuantity = order.quantity;
      order.avgFillPrice = executionPrice;
      order.status = 'filled';

      // Update instrument data
      instrument.currentPrice = executionPrice;
      instrument.volume += order.quantity;
      
      // Update bid/ask based on order flow
      if (order.side === 'buy') {
        instrument.bidPrice = Math.max(instrument.bidPrice, executionPrice * 0.999);
      } else {
        instrument.askPrice = Math.min(instrument.askPrice, executionPrice * 1.001);
      }
    }, 1000 + Math.random() * 2000); // 1-3 second execution delay
  }

  // 🔤 Generate trading symbol
  private generateSymbol(companyName: string): string {
    return companyName
      .replace(/[^a-zA-Z\s]/g, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 4);
  }

  // 🏢 Get all tradeable instruments
  getAllInstruments(): TradingInstrument[] {
    return Array.from(this.instruments.values());
  }

  // 🔍 Get instrument by ID
  getInstrument(instrumentId: string): TradingInstrument | undefined {
    return this.instruments.get(instrumentId);
  }

  // 📝 Get user orders
  getUserOrders(userId: string): TradeOrder[] {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }
}

// 🏭 Global trading engine instance
export const tradingEngine = new TradingEngine();