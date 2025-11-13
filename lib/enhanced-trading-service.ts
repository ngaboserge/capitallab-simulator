// Enhanced Trading Service - Database-integrated trading functionality
import { query } from './db';
import { tradingService } from './trading-service';

export interface Trade {
  id: string;
  userId: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  totalValue: number;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}

export interface Portfolio {
  userId: string;
  holdings: {
    symbol: string;
    quantity: number;
    averagePrice: number;
    currentValue: number;
    totalReturn: number;
    returnPercentage: number;
  }[];
  totalValue: number;
  cashBalance: number;
  totalReturn: number;
  returnPercentage: number;
}

export interface UserStats {
  userId: string;
  username: string;
  balance: number;
  xp: number;
  level: number;
  totalTrades: number;
  portfolioValue: number;
  achievements: string[];
}

export class EnhancedTradingService {
  async executeTrade(trade: Omit<Trade, 'id' | 'timestamp' | 'status'>): Promise<Trade> {
    const newTrade: Trade = {
      ...trade,
      id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      status: 'pending'
    };

    try {
      // Validate trade
      const portfolio = await this.getPortfolio(trade.userId);
      
      if (trade.type === 'buy') {
        if (portfolio.cashBalance < trade.totalValue) {
          throw new Error('Insufficient funds');
        }
      } else {
        const holding = portfolio.holdings.find(h => h.symbol === trade.symbol);
        if (!holding || holding.quantity < trade.quantity) {
          throw new Error('Insufficient shares');
        }
      }

      // Insert trade into database
      await query(`
        INSERT INTO trades (user_id, symbol, type, quantity, price, total_value, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
      `, [trade.userId, trade.symbol, trade.type, trade.quantity, trade.price, trade.totalValue]);

      // Update user balance
      const newBalance = trade.type === 'buy' 
        ? portfolio.cashBalance - trade.totalValue
        : portfolio.cashBalance + trade.totalValue;

      await query('UPDATE users SET balance = ? WHERE id = ?', [newBalance, trade.userId]);

      // Add XP for trade
      await this.addXP(trade.userId, 10);

      // Log activity
      await this.logActivity(trade.userId, 'trade', `${trade.type.toUpperCase()} ${trade.quantity} ${trade.symbol} @ $${trade.price}`);

      newTrade.status = 'completed';
      return newTrade;
    } catch (error) {
      newTrade.status = 'failed';
      throw error;
    }
  }

  async getPortfolio(userId: string): Promise<Portfolio> {
    try {
      // Get user balance
      const userResult = await query('SELECT balance FROM users WHERE id = ?', [userId]);
      const user = (userResult as any[])[0];
      const cashBalance = user ? parseFloat(user.balance) : 10000;

      // Get holdings from trades
      const holdingsResult = await query(`
        SELECT 
          symbol,
          SUM(CASE WHEN type = 'buy' THEN quantity ELSE -quantity END) as quantity,
          AVG(CASE WHEN type = 'buy' THEN price ELSE NULL END) as avg_price
        FROM trades 
        WHERE user_id = ? 
        GROUP BY symbol 
        HAVING quantity > 0
      `, [userId]);

      const holdings = await Promise.all((holdingsResult as any[]).map(async holding => {
        const currentPrice = await this.getCurrentPrice(holding.symbol);
        const currentValue = currentPrice * holding.quantity;
        const totalCost = parseFloat(holding.avg_price || 0) * holding.quantity;
        const totalReturn = currentValue - totalCost;
        const returnPercentage = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;

        return {
          symbol: holding.symbol,
          quantity: parseInt(holding.quantity),
          averagePrice: parseFloat(holding.avg_price || 0),
          currentValue,
          totalReturn,
          returnPercentage
        };
      }));

      const portfolioValue = holdings.reduce((sum, holding) => sum + holding.currentValue, 0);
      const totalValue = portfolioValue + cashBalance;

      return {
        userId,
        holdings,
        totalValue,
        cashBalance,
        totalReturn: totalValue - 10000, // Assuming 10k starting balance
        returnPercentage: ((totalValue - 10000) / 10000) * 100
      };
    } catch (error) {
      console.error('Error getting portfolio:', error);
      return {
        userId,
        holdings: [],
        totalValue: 10000,
        cashBalance: 10000,
        totalReturn: 0,
        returnPercentage: 0
      };
    }
  }

  async getUserTrades(userId: string, limit: number = 100): Promise<Trade[]> {
    try {
      const result = await query(`
        SELECT * FROM trades 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `, [userId, limit]);

      return (result as any[]).map(trade => ({
        id: trade.id.toString(),
        userId: trade.user_id.toString(),
        symbol: trade.symbol,
        type: trade.type,
        quantity: trade.quantity,
        price: parseFloat(trade.price),
        totalValue: parseFloat(trade.total_value),
        timestamp: new Date(trade.created_at),
        status: 'completed' as const
      }));
    } catch (error) {
      console.error('Error getting user trades:', error);
      return [];
    }
  }

  async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      const userResult = await query(`
        SELECT u.*, COUNT(t.id) as total_trades
        FROM users u
        LEFT JOIN trades t ON u.id = t.user_id
        WHERE u.id = ?
        GROUP BY u.id
      `, [userId]);

      const user = (userResult as any[])[0];
      if (!user) return null;

      const portfolio = await this.getPortfolio(userId);

      return {
        userId: user.id.toString(),
        username: user.username,
        balance: parseFloat(user.balance),
        xp: user.xp,
        level: user.level,
        totalTrades: user.total_trades || 0,
        portfolioValue: portfolio.totalValue,
        achievements: user.achievements ? JSON.parse(user.achievements) : []
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  }

  async addXP(userId: string, xpAmount: number): Promise<void> {
    try {
      await query(`
        UPDATE users 
        SET xp = xp + ?, 
            level = FLOOR((xp + ?) / 100) + 1,
            updated_at = NOW()
        WHERE id = ?
      `, [xpAmount, xpAmount, userId]);
    } catch (error) {
      console.error('Error adding XP:', error);
    }
  }

  async logActivity(userId: string, activityType: string, description: string, metadata?: any): Promise<void> {
    try {
      await query(`
        INSERT INTO activity_logs (user_id, activity_type, description, metadata, created_at)
        VALUES (?, ?, ?, ?, NOW())
      `, [userId, activityType, description, metadata ? JSON.stringify(metadata) : null]);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      const result = await query('SELECT price FROM market_data WHERE symbol = ?', [symbol]);
      const stock = (result as any[])[0];
      if (stock) {
        return parseFloat(stock.price);
      }
      
      // Fallback to mock price
      const mockPrices: { [key: string]: number } = {
        'AAPL': 175.43,
        'GOOGL': 2847.63,
        'MSFT': 378.85,
        'AMZN': 3342.88,
        'TSLA': 248.42,
        'NVDA': 875.28,
        'META': 485.73,
        'NFLX': 542.18,
        'JPM': 168.45
      };
      
      return mockPrices[symbol] || 100;
    } catch (error) {
      console.error('Error getting current price:', error);
      return 100; // Default price
    }
  }

  async getMarketData(symbol?: string) {
    try {
      if (symbol) {
        const result = await query('SELECT * FROM market_data WHERE symbol = ?', [symbol]);
        const stock = (result as any[])[0];
        if (stock) {
          return {
            symbol: stock.symbol,
            name: stock.name || stock.symbol,
            price: parseFloat(stock.price),
            change: parseFloat(stock.change_amount || 0),
            changePercent: parseFloat(stock.change_percent || 0),
            volume: parseInt(stock.volume || 0),
            marketCap: parseInt(stock.market_cap || 0)
          };
        }
      } else {
        const result = await query('SELECT * FROM market_data ORDER BY symbol');
        return (result as any[]).map(stock => ({
          symbol: stock.symbol,
          name: stock.name || stock.symbol,
          price: parseFloat(stock.price),
          change: parseFloat(stock.change_amount || 0),
          changePercent: parseFloat(stock.change_percent || 0),
          volume: parseInt(stock.volume || 0),
          marketCap: parseInt(stock.market_cap || 0)
        }));
      }
    } catch (error) {
      console.error('Error getting market data:', error);
      // Fallback to mock data
      const mockData = [
        { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 2.15, changePercent: 1.24, volume: 50000000, marketCap: 2800000000000 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2847.63, change: -15.42, changePercent: -0.54, volume: 25000000, marketCap: 1800000000000 },
        { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.85, change: 4.23, changePercent: 1.13, volume: 35000000, marketCap: 2900000000000 },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 3342.88, change: 18.75, changePercent: 0.56, volume: 20000000, marketCap: 1700000000000 },
        { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.42, change: -8.33, changePercent: -3.24, volume: 45000000, marketCap: 800000000000 }
      ];

      if (symbol) {
        return mockData.find(stock => stock.symbol === symbol);
      }
      return mockData;
    }
  }

  async getLeaderboard(type: 'xp' | 'portfolio' = 'xp', limit: number = 10) {
    try {
      const orderBy = type === 'xp' ? 'xp DESC' : 'balance DESC';
      const result = await query(`
        SELECT id, username, balance, xp, level
        FROM users 
        ORDER BY ${orderBy}
        LIMIT ?
      `, [limit]);

      return (result as any[]).map((user, index) => ({
        rank: index + 1,
        userId: user.id.toString(),
        username: user.username,
        balance: parseFloat(user.balance),
        xp: user.xp,
        level: user.level
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  async createUser(username: string, email: string, initialBalance: number = 10000) {
    try {
      const result = await query(`
        INSERT INTO users (username, email, balance, xp, level, created_at)
        VALUES (?, ?, ?, 0, 1, NOW())
      `, [username, email, initialBalance]);

      return {
        success: true,
        userId: (result as any).insertId
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Integration with existing trading service
  getExistingTradingService() {
    return tradingService;
  }
}

export const enhancedTradingService = new EnhancedTradingService();