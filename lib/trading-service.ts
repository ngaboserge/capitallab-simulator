// 🔧 Trading Service - Reliable wrapper for trading engine
import { tradingEngine, TradingInstrument, TradeOrder } from './trading-engine';
import { workflowTradingIntegration } from './workflow-trading-integration';

class TradingService {
  private initialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      // Create demo instruments if none exist
      const currentInstruments = tradingEngine.getAllInstruments();
      if (currentInstruments.length === 0) {
        console.log('🎮 Creating demo trading instruments...');
        workflowTradingIntegration.createDemoInstruments();
      }
      this.initialized = true;
      console.log('✅ Trading service initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing trading service:', error);
      this.initialized = false;
    }
  }

  getAllInstruments(): TradingInstrument[] {
    try {
      if (!this.initialized) {
        this.initialize();
      }
      return tradingEngine.getAllInstruments() || [];
    } catch (error) {
      console.error('Error getting instruments:', error);
      return [];
    }
  }

  getUserOrders(userId: string): TradeOrder[] {
    try {
      if (!this.initialized) {
        this.initialize();
      }
      return tradingEngine.getUserOrders(userId) || [];
    } catch (error) {
      console.error('Error getting user orders:', error);
      return [];
    }
  }

  placeOrder(orderData: Omit<TradeOrder, 'id' | 'timestamp' | 'status' | 'filledQuantity' | 'avgFillPrice'>): TradeOrder | null {
    try {
      if (!this.initialized) {
        this.initialize();
      }
      return tradingEngine.placeOrder(orderData);
    } catch (error) {
      console.error('Error placing order:', error);
      return null;
    }
  }

  getInstrument(instrumentId: string): TradingInstrument | null {
    try {
      if (!this.initialized) {
        this.initialize();
      }
      return tradingEngine.getInstrument(instrumentId) || null;
    } catch (error) {
      console.error('Error getting instrument:', error);
      return null;
    }
  }

  launchTrading(instrumentId: string): boolean {
    try {
      if (!this.initialized) {
        this.initialize();
      }
      return tradingEngine.launchTrading(instrumentId);
    } catch (error) {
      console.error('Error launching trading:', error);
      return false;
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

// 🏭 Global trading service instance
export const tradingService = new TradingService();