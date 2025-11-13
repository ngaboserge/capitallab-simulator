'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Shield,
  Zap,
  Eye,
  Target
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AdvancedOrderTypesProps {
  selectedStock: string
  currentPrice: number
  onOrderSubmit: (order: any) => void
}

export function AdvancedOrderTypes({ 
  selectedStock, 
  currentPrice, 
  onOrderSubmit 
}: AdvancedOrderTypesProps) {
  const [orderType, setOrderType] = useState<string>('MARKET')
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY')
  const [quantity, setQuantity] = useState('')
  const [limitPrice, setLimitPrice] = useState('')
  const [stopPrice, setStopPrice] = useState('')
  const [timeInForce, setTimeInForce] = useState<string>('DAY')
  const [icebergQty, setIcebergQty] = useState('')

  const orderTypes = [
    { value: 'MARKET', label: 'Market Order', icon: Zap, description: 'Execute immediately at best price' },
    { value: 'LIMIT', label: 'Limit Order', icon: Target, description: 'Execute only at specified price or better' },
    { value: 'STOP_LOSS', label: 'Stop Loss', icon: Shield, description: 'Sell when price falls to stop level' },
    { value: 'STOP_LIMIT', label: 'Stop Limit', icon: TrendingDown, description: 'Limit order triggered by stop price' },
    { value: 'ICEBERG', label: 'Iceberg Order', icon: Eye, description: 'Hide large order quantity' },
    { value: 'BRACKET', label: 'Bracket Order', icon: TrendingUp, description: 'Entry with profit target and stop loss' }
  ]

  const timeInForceOptions = [
    { value: 'DAY', label: 'Day Order', description: 'Valid until market close' },
    { value: 'GTC', label: 'Good Till Cancelled', description: 'Valid until manually cancelled' },
    { value: 'IOC', label: 'Immediate or Cancel', description: 'Fill immediately or cancel' },
    { value: 'FOK', label: 'Fill or Kill', description: 'Fill completely or cancel' },
    { value: 'MOC', label: 'Market on Close', description: 'Execute at closing auction' }
  ]

  const selectedOrderType = orderTypes.find(ot => ot.value === orderType)
  const selectedTIF = timeInForceOptions.find(tif => tif.value === timeInForce)

  const handleSubmit = () => {
    const order = {
      symbol: selectedStock,
      side,
      orderType,
      quantity: parseInt(quantity),
      limitPrice: limitPrice ? parseFloat(limitPrice) : undefined,
      stopPrice: stopPrice ? parseFloat(stopPrice) : undefined,
      timeInForce,
      icebergQty: icebergQty ? parseInt(icebergQty) : undefined,
      timestamp: new Date()
    }
    
    onOrderSubmit(order)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Advanced Order Types - {selectedStock}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Market Data */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium">Current Price</span>
            <span className="text-lg font-bold">RWF {currentPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Order Side */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant={side === 'BUY' ? 'default' : 'outline'}
            onClick={() => setSide('BUY')}
            className="flex items-center gap-2"
          >
            <TrendingUp className="h-4 w-4" />
            Buy
          </Button>
          <Button
            variant={side === 'SELL' ? 'destructive' : 'outline'}
            onClick={() => setSide('SELL')}
            className="flex items-center gap-2"
          >
            <TrendingDown className="h-4 w-4" />
            Sell
          </Button>
        </div>

        {/* Order Type Selection */}
        <div>
          <Label>Order Type</Label>
          <Select value={orderType} onValueChange={setOrderType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {orderTypes.map((type) => {
                const Icon = type.icon
                return (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-3 w-3" />
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          {selectedOrderType && (
            <p className="text-xs text-gray-600 mt-1">{selectedOrderType.description}</p>
          )}
        </div>

        {/* Quantity */}
        <div>
          <Label>Quantity (shares)</Label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity"
          />
        </div>

        {/* Price Fields */}
        {(orderType === 'LIMIT' || orderType === 'STOP_LIMIT' || orderType === 'BRACKET') && (
          <div>
            <Label>Limit Price (RWF)</Label>
            <Input
              type="number"
              step="0.01"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder="Enter limit price"
            />
          </div>
        )}

        {(orderType === 'STOP_LOSS' || orderType === 'STOP_LIMIT' || orderType === 'BRACKET') && (
          <div>
            <Label>Stop Price (RWF)</Label>
            <Input
              type="number"
              step="0.01"
              value={stopPrice}
              onChange={(e) => setStopPrice(e.target.value)}
              placeholder="Enter stop price"
            />
          </div>
        )}

        {/* Iceberg Quantity */}
        {orderType === 'ICEBERG' && (
          <div>
            <Label>Display Quantity (shares)</Label>
            <Input
              type="number"
              value={icebergQty}
              onChange={(e) => setIcebergQty(e.target.value)}
              placeholder="Visible quantity"
            />
            <p className="text-xs text-gray-600 mt-1">
              Only this amount will be visible in the order book
            </p>
          </div>
        )}

        {/* Time in Force */}
        <div>
          <Label>Time in Force</Label>
          <Select value={timeInForce} onValueChange={setTimeInForce}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeInForceOptions.map((tif) => (
                <SelectItem key={tif.value} value={tif.value}>
                  <div>
                    <div className="font-medium">{tif.label}</div>
                    <div className="text-xs text-gray-500">{tif.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedTIF && (
            <p className="text-xs text-gray-600 mt-1">{selectedTIF.description}</p>
          )}
        </div>

        {/* Order Summary */}
        {quantity && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Order Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Type:</span>
                <Badge>{selectedOrderType?.label}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Side:</span>
                <Badge variant={side === 'BUY' ? 'default' : 'destructive'}>{side}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span>{quantity} shares</span>
              </div>
              {limitPrice && (
                <div className="flex justify-between">
                  <span>Limit Price:</span>
                  <span>RWF {parseFloat(limitPrice).toFixed(2)}</span>
                </div>
              )}
              {stopPrice && (
                <div className="flex justify-between">
                  <span>Stop Price:</span>
                  <span>RWF {parseFloat(stopPrice).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Time in Force:</span>
                <Badge variant="outline">{selectedTIF?.label}</Badge>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit}
          disabled={!quantity || parseInt(quantity) <= 0}
          className="w-full"
          variant={side === 'BUY' ? 'default' : 'destructive'}
        >
          <Clock className="h-4 w-4 mr-2" />
          Place {selectedOrderType?.label}
        </Button>
      </CardContent>
    </Card>
  )
}