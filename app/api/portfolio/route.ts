import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get portfolio holdings
    const holdingsSql = `
      SELECT 
        symbol,
        SUM(CASE WHEN type = 'buy' THEN quantity ELSE -quantity END) as quantity,
        AVG(CASE WHEN type = 'buy' THEN price ELSE NULL END) as avg_price
      FROM trades 
      WHERE user_id = ? 
      GROUP BY symbol 
      HAVING quantity > 0
    `;

    const holdings = await query(holdingsSql, [userId]);

    // Get portfolio value and stats
    const statsSql = `
      SELECT 
        COUNT(*) as total_trades,
        SUM(CASE WHEN type = 'buy' THEN total_value ELSE -total_value END) as net_invested,
        (SELECT balance FROM users WHERE id = ?) as cash_balance
      FROM trades 
      WHERE user_id = ?
    `;

    const stats = await query(statsSql, [userId, userId]);

    return NextResponse.json({
      holdings,
      stats: (stats as any[])[0] || { total_trades: 0, net_invested: 0, cash_balance: 10000 }
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}