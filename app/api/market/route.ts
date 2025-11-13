import { NextRequest, NextResponse } from 'next/server';

// Mock market data - in production, integrate with real market data API
const mockStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 2.15, changePercent: 1.24 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2847.63, change: -15.42, changePercent: -0.54 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.85, change: 4.23, changePercent: 1.13 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 3342.88, change: 18.75, changePercent: 0.56 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.42, change: -8.33, changePercent: -3.24 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.28, change: 12.45, changePercent: 1.44 },
  { symbol: 'META', name: 'Meta Platforms Inc.', price: 485.73, change: -2.87, changePercent: -0.59 },
  { symbol: 'NFLX', name: 'Netflix Inc.', price: 542.18, change: 7.92, changePercent: 1.48 },
  { symbol: 'BRK.A', name: 'Berkshire Hathaway', price: 544280.00, change: 1250.00, changePercent: 0.23 },
  { symbol: 'JPM', name: 'JPMorgan Chase', price: 168.45, change: 0.85, changePercent: 0.51 }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (symbol) {
      // Get specific stock
      const stock = mockStocks.find(s => s.symbol === symbol.toUpperCase());
      if (!stock) {
        return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
      }
      
      // Add some random variation to simulate real-time data
      const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
      const newPrice = stock.price * (1 + variation);
      const priceChange = newPrice - stock.price;
      const percentChange = (priceChange / stock.price) * 100;

      return NextResponse.json({
        ...stock,
        price: parseFloat(newPrice.toFixed(2)),
        change: parseFloat(priceChange.toFixed(2)),
        changePercent: parseFloat(percentChange.toFixed(2)),
        timestamp: new Date().toISOString()
      });
    } else {
      // Get all stocks with random variations
      const updatedStocks = mockStocks.map(stock => {
        const variation = (Math.random() - 0.5) * 0.02;
        const newPrice = stock.price * (1 + variation);
        const priceChange = newPrice - stock.price;
        const percentChange = (priceChange / stock.price) * 100;

        return {
          ...stock,
          price: parseFloat(newPrice.toFixed(2)),
          change: parseFloat(priceChange.toFixed(2)),
          changePercent: parseFloat(percentChange.toFixed(2)),
          timestamp: new Date().toISOString()
        };
      });

      return NextResponse.json(updatedStocks);
    }
  } catch (error) {
    console.error('Error fetching market data:', error);
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
  }
}