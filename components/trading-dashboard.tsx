'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TradingInstrument, TradeOrder } from '@/lib/trading-engine';
import { createTradingEngine, SimpleTradingEngine } from '@/lib/trading-engine-factory';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Clock, CheckCircle } from 'lucide-react';

export default function TradingDashboard() {
  const [instruments, setInstruments] = useState<TradingInstrument[]>([]);
  const [selectedInstrument, setSelectedInstrument] = useState<TradingInstrument | null>(null);
  const [userOrders, setUserOrders] = useState<TradeOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tradingEngine, setTradingEngine] = useState<SimpleTradingEngine | null>(null);
  const [orderForm, setOrderForm] = useState({
    side: 'buy' as 'buy' | 'sell',
    orderType: 'limit' as 'market' | 'limit',
    quantity: '',
    price: ''
  });

  // 🎮 Create demo instruments
  const createDemoInstruments = (engine: SimpleTradingEngine) => {
    const demoCompanies = [
      { name: 'TechCorp Solutions', type: 'equity' as const },
      { name: 'Green Energy Inc', type: 'equity' as const },
      { name: 'FinTech Innovations', type: 'equity' as const },
      { name: 'BioMed Research', type: 'equity' as const },
      { name: 'Smart Manufacturing', type: 'equity' as const }
    ];

    demoCompanies.forEach(company => {
      const mockWorkflow = {
        id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        companyName: company.name,
        instrumentType: company.type,
        targetAmount: Math.floor(Math.random() * 50000000) + 10000000, // $10M - $60M
        sharesOffered: Math.floor(Math.random() * 5000000) + 1000000, // 1M - 6M shares
        pricePerShare: Math.floor(Math.random() * 50) + 10, // $10 - $60 per share
      };

      const instrument = engine.createInstrumentFromWorkflow(mockWorkflow);
      
      // Auto-launch trading after a short delay
      setTimeout(() => {
        engine.launchTrading(instrument.id);
      }, 1000 + Math.random() * 2000);
    });
  };

  useEffect(() => {
    // Initialize trading engine
    const initializeEngine = async () => {
      try {
        console.log('🎮 Initializing trading engine...');
        const engine = createTradingEngine();
        
        // Create demo instruments
        console.log('🎮 Creating demo trading instruments...');
        createDemoInstruments(engine);
        
        setTradingEngine(engine);
        setInstruments(engine.getAllInstruments() || []);
        setUserOrders(engine.getUserOrders('current_user') || []);
        setIsLoading(false);
        
        console.log('✅ Trading engine initialized with', engine.getAllInstruments().length, 'instruments');
      } catch (error) {
        console.error('❌ Error initializing trading engine:', error);
        setIsLoading(false);
      }
    };

    initializeEngine();
  }, []);

  // Refresh data every 5 seconds
  useEffect(() => {
    if (!tradingEngine) return;

    const interval = setInterval(() => {
      try {
        setInstruments(tradingEngine.getAllInstruments() || []);
        setUserOrders(tradingEngine.getUserOrders('current_user') || []);
      } catch (error) {
        console.error('Error refreshing trading data:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [tradingEngine]);

  const handlePlaceOrder = () => {
    if (!selectedInstrument || !orderForm.quantity || !tradingEngine) return;

    try {
      const order = tradingEngine.placeOrder({
        instrumentId: selectedInstrument.id,
        userId: 'current_user',
        side: orderForm.side,
        orderType: orderForm.orderType,
        quantity: parseInt(orderForm.quantity),
        price: orderForm.orderType === 'limit' ? parseFloat(orderForm.price) : undefined
      });

      // Reset form
      setOrderForm({
        side: 'buy',
        orderType: 'limit',
        quantity: '',
        price: ''
      });

      // Refresh orders
      setUserOrders(tradingEngine.getUserOrders('current_user'));
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pre-trading': return 'bg-yellow-100 text-yellow-800';
      case 'halted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'filled': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trading market...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <BarChart3 className="h-10 w-10 text-blue-600" />
            Live Trading Market
          </h1>
          <p className="text-xl text-gray-600">Trade securities from completed capital raise workflows</p>
        </div>

        {/* Market Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Instruments</p>
                  <p className="text-2xl font-bold text-green-600">
                    {instruments.filter(i => i.status === 'active').length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Market Cap</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(instruments.reduce((sum, i) => sum + i.marketCap, 0))}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Volume</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatNumber(instruments.reduce((sum, i) => sum + i.volume, 0))}
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Your Orders</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {userOrders.length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Instruments List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Available Instruments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {instruments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No instruments available yet</p>
                      <p className="text-sm">Complete capital raise workflows to create tradeable securities</p>
                    </div>
                  ) : (
                    instruments.map((instrument) => (
                      <div
                        key={instrument.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedInstrument?.id === instrument.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedInstrument(instrument)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{instrument.symbol}</h3>
                              <Badge className={getStatusColor(instrument.status)}>
                                {instrument.status}
                              </Badge>
                              <Badge variant="outline">
                                {instrument.instrumentType}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-2">{instrument.companyName}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Current Price</p>
                                <p className="font-semibold">{formatCurrency(instrument.currentPrice)}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Bid/Ask</p>
                                <p className="font-semibold">
                                  {formatCurrency(instrument.bidPrice)} / {formatCurrency(instrument.askPrice)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Volume</p>
                                <p className="font-semibold">{formatNumber(instrument.volume)}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Market Cap</p>
                                <p className="font-semibold">{formatCurrency(instrument.marketCap)}</p>
                              </div>
                            </div>
                          </div>
                          {instrument.status === 'pre-trading' && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (tradingEngine) {
                                  tradingEngine.launchTrading(instrument.id);
                                  setInstruments(tradingEngine.getAllInstruments());
                                }
                              }}
                              className="ml-4"
                            >
                              Launch Trading
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trading Panel */}
          <div className="space-y-6">
            
            {/* Order Entry */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Place Order
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedInstrument ? (
                  <>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Selected Instrument</p>
                      <p className="font-semibold">{selectedInstrument.symbol} - {selectedInstrument.companyName}</p>
                      <p className="text-sm text-gray-500">Current: {formatCurrency(selectedInstrument.currentPrice)}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={orderForm.side === 'buy' ? 'default' : 'outline'}
                        onClick={() => setOrderForm({...orderForm, side: 'buy'})}
                        className="w-full"
                      >
                        Buy
                      </Button>
                      <Button
                        variant={orderForm.side === 'sell' ? 'default' : 'outline'}
                        onClick={() => setOrderForm({...orderForm, side: 'sell'})}
                        className="w-full"
                      >
                        Sell
                      </Button>
                    </div>

                    <Select
                      value={orderForm.orderType}
                      onValueChange={(value: 'market' | 'limit') => 
                        setOrderForm({...orderForm, orderType: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="market">Market Order</SelectItem>
                        <SelectItem value="limit">Limit Order</SelectItem>
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={orderForm.quantity}
                      onChange={(e) => setOrderForm({...orderForm, quantity: e.target.value})}
                    />

                    {orderForm.orderType === 'limit' && (
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={orderForm.price}
                        onChange={(e) => setOrderForm({...orderForm, price: e.target.value})}
                      />
                    )}

                    <Button
                      onClick={handlePlaceOrder}
                      className="w-full"
                      disabled={!orderForm.quantity || (orderForm.orderType === 'limit' && !orderForm.price)}
                    >
                      Place {orderForm.side.toUpperCase()} Order
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select an instrument to place orders</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Your Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userOrders.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No orders yet</p>
                    </div>
                  ) : (
                    userOrders.slice(0, 5).map((order) => {
                      const instrument = instruments.find(i => i.id === order.instrumentId);
                      return (
                        <div key={order.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{instrument?.symbol}</span>
                              <Badge className={getOrderStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </div>
                            <span className={`text-sm font-semibold ${
                              order.side === 'buy' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {order.side.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex justify-between">
                              <span>Quantity:</span>
                              <span>{formatNumber(order.quantity)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Price:</span>
                              <span>{order.price ? formatCurrency(order.price) : 'Market'}</span>
                            </div>
                            {order.filledQuantity > 0 && (
                              <div className="flex justify-between">
                                <span>Filled:</span>
                                <span>{formatNumber(order.filledQuantity)} @ {formatCurrency(order.avgFillPrice)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}