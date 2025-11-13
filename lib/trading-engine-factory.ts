// 🏭 Trading Engine Factory - Creates reliable trading engine instances

import { TradingInstrument, TradeOrder } from './trading-engine';

export interface SimpleTradingEngine {
  getAllInstruments(): TradingInstrument[];
  getUserOrders(userId: string): TradeOrder[];
  placeOrder(orderData: any): TradeOrder;
  launchTrading(instrumentId: string): boolean;
  getInstrument(instrumentId: string): TradingInstrument | undefined;
  createInstrumentFromWorkflow(workflow: any): TradingInstrument;
}

export function createTradingEngine(): SimpleTradingEngine {
  const instruments = new Map<string, TradingInstrument>();
  const orders = new Map<string, TradeOrder>();

  // 🎓 Create tradeable instrument from completed workflow
  const createInstrumentFromWorkflow = (workflow: any): TradingInstrument => {
    const instrument: TradingInstrument = {
      id: `${workflow.companyName.replace(/\s+/g, '')}_${workflow.instrumentType}`,
      symbol: generateSymbol(workflow.companyName),
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

    instruments.set(instrument.id, instrument);
    return instrument;
  };

  // 🚀 Launch trading for instrument
  const launchTrading = (instrumentId: string): boolean => {
    const instrument = instruments.get(instrumentId);
    if (!instrument) return false;

    instrument.status = 'active';
    
    // Initialize market making
    const midPrice = instrument.issuePrice;
    const spread = midPrice * 0.005; // 0.5% spread
    
    instrument.bidPrice = midPrice - (spread / 2);
    instrument.askPrice = midPrice + (spread / 2);
    instrument.currentPrice = midPrice;

    return true;
  };

  // 📝 Place trade order
  const placeOrder = (orderData: any): TradeOrder => {
    const tradeOrder: TradeOrder = {
      ...orderData,
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      status: 'pending',
      filledQuantity: 0,
      avgFillPrice: 0
    };

    orders.set(tradeOrder.id, tradeOrder);
    
    // Simulate order execution
    setTimeout(() => {
      const instrument = instruments.get(tradeOrder.instrumentId);
      if (!instrument) return;

      const executionPrice = tradeOrder.orderType === 'market' 
        ? instrument.currentPrice
        : tradeOrder.price || instrument.currentPrice;

      tradeOrder.filledQuantity = tradeOrder.quantity;
      tradeOrder.avgFillPrice = executionPrice;
      tradeOrder.status = 'filled';

      // Update instrument data
      instrument.currentPrice = executionPrice;
      instrument.volume += tradeOrder.quantity;
      
      // Update bid/ask based on order flow
      if (tradeOrder.side === 'buy') {
        instrument.bidPrice = Math.max(instrument.bidPrice, executionPrice * 0.999);
      } else {
        instrument.askPrice = Math.min(instrument.askPrice, executionPrice * 1.001);
      }
    }, 1000 + Math.random() * 2000); // 1-3 second execution delay

    return tradeOrder;
  };

  // 🔤 Generate trading symbol
  const generateSymbol = (companyName: string): string => {
    return companyName
      .replace(/[^a-zA-Z\s]/g, '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 4);
  };

  return {
    getAllInstruments: () => Array.from(instruments.values()),
    getUserOrders: (userId: string) => Array.from(orders.values()).filter(order => order.userId === userId),
    placeOrder,
    launchTrading,
    getInstrument: (instrumentId: string) => instruments.get(instrumentId),
    createInstrumentFromWorkflow
  };
}