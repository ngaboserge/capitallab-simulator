'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { 
  Settings, 
  Save, 
  RotateCcw,
  Clock,
  TrendingUp,
  Shield,
  AlertCircle
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface MarketRules {
  // Trading Session
  sessionStart: string
  sessionEnd: string
  isMarketOpen: boolean
  
  // Order Types
  allowMarketOrders: boolean
  allowLimitOrders: boolean
  allowStopOrders: boolean
  
  // Price Limits
  dailyPriceChangeLimit: number
  maxOrderSize: number
  minOrderSize: number
  
  // Liquidity
  minLiquidityRequirement: number
  autoLiquidityMode: boolean
  
  // Risk Management
  maxPositionSize: number
  marginRequirement: number
  
  // Circuit Breakers
  enableCircuitBreakers: boolean
  circuitBreakerThreshold: number
  circuitBreakerDuration: number
  
  // Compliance
  requireKYC: boolean
  maxDailyVolume: number
  suspiciousActivityThreshold: number
}

interface CompanySpecificRule {
  id: string
  symbol: string
  customPriceLimit?: number
  customLiquidityRequirement?: number
  tradingHalted: boolean
  notes: string
}

export function RuleConfiguration() {
  const [rules, setRules] = useState<MarketRules>({
    sessionStart: '09:30',
    sessionEnd: '16:00',
    isMarketOpen: true,
    allowMarketOrders: true,
    allowLimitOrders: true,
    allowStopOrders: false,
    dailyPriceChangeLimit: 10,
    maxOrderSize: 10000,
    minOrderSize: 1,
    minLiquidityRequirement: 50,
    autoLiquidityMode: true,
    maxPositionSize: 100000,
    marginRequirement: 25,
    enableCircuitBreakers: true,
    circuitBreakerThreshold: 15,
    circuitBreakerDuration: 15,
    requireKYC: true,
    maxDailyVolume: 1000000,
    suspiciousActivityThreshold: 50000
  })

  const [companyRules, setCompanyRules] = useState<CompanySpecificRule[]>([
    {
      id: '1',
      symbol: 'AGRITECH',
      customPriceLimit: 20,
      tradingHalted: false,
      notes: 'High volatility agricultural stock - increased monitoring due to seasonal factors'
    },
    {
      id: '2',
      symbol: 'CRYSTAL',
      customLiquidityRequirement: 75,
      tradingHalted: true,
      notes: 'Trading halted due to regulatory review of telecom operations'
    }
  ])

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const updateRule = (key: keyof MarketRules, value: any) => {
    setRules(prev => ({ ...prev, [key]: value }))
    setHasUnsavedChanges(true)
  }

  const saveRules = () => {
    // Implementation for saving rules
    console.log('Saving rules:', rules)
    setHasUnsavedChanges(false)
  }

  const resetToDefaults = () => {
    // Reset to default values
    setHasUnsavedChanges(true)
  }

  const toggleMarket = () => {
    updateRule('isMarketOpen', !rules.isMarketOpen)
  }

  const updateCompanyRule = (id: string, updates: Partial<CompanySpecificRule>) => {
    setCompanyRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, ...updates } : rule
    ))
    setHasUnsavedChanges(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Rule Configuration</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button 
            onClick={saveRules}
            disabled={!hasUnsavedChanges}
            className={hasUnsavedChanges ? 'bg-orange-600 hover:bg-orange-700' : ''}
          >
            <Save className="h-4 w-4 mr-2" />
            {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
          </Button>
        </div>
      </div>

      {hasUnsavedChanges && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">You have unsaved changes. Remember to save your configuration.</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Session */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Market Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium">Market Status</h4>
                <p className="text-sm text-gray-600">
                  {rules.isMarketOpen ? 'Market is currently open' : 'Market is currently closed'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${rules.isMarketOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <Switch
                  checked={rules.isMarketOpen}
                  onCheckedChange={toggleMarket}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sessionStart">Session Start</Label>
                <Input
                  id="sessionStart"
                  type="time"
                  value={rules.sessionStart}
                  onChange={(e) => updateRule('sessionStart', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sessionEnd">Session End</Label>
                <Input
                  id="sessionEnd"
                  type="time"
                  value={rules.sessionEnd}
                  onChange={(e) => updateRule('sessionEnd', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Types */}
        <Card>
          <CardHeader>
            <CardTitle>Allowed Order Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Market Orders</Label>
                <p className="text-sm text-gray-600">Execute immediately at current market price</p>
              </div>
              <Switch
                checked={rules.allowMarketOrders}
                onCheckedChange={(checked) => updateRule('allowMarketOrders', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Limit Orders</Label>
                <p className="text-sm text-gray-600">Execute only at specified price or better</p>
              </div>
              <Switch
                checked={rules.allowLimitOrders}
                onCheckedChange={(checked) => updateRule('allowLimitOrders', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Stop Orders</Label>
                <p className="text-sm text-gray-600">Trigger market order when price reached</p>
              </div>
              <Switch
                checked={rules.allowStopOrders}
                onCheckedChange={(checked) => updateRule('allowStopOrders', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Price Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Price Limits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Daily Price Change Limit</Label>
                <span className="text-sm text-gray-600">±{rules.dailyPriceChangeLimit}%</span>
              </div>
              <Slider
                value={[rules.dailyPriceChangeLimit]}
                onValueChange={([value]) => updateRule('dailyPriceChangeLimit', value)}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minOrderSize">Min Order Size</Label>
                <Input
                  id="minOrderSize"
                  type="number"
                  value={rules.minOrderSize}
                  onChange={(e) => updateRule('minOrderSize', parseInt(e.target.value) || 1)}
                />
              </div>
              <div>
                <Label htmlFor="maxOrderSize">Max Order Size</Label>
                <Input
                  id="maxOrderSize"
                  type="number"
                  value={rules.maxOrderSize}
                  onChange={(e) => updateRule('maxOrderSize', parseInt(e.target.value) || 10000)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liquidity Management */}
        <Card>
          <CardHeader>
            <CardTitle>Liquidity Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto Liquidity Mode</Label>
                <p className="text-sm text-gray-600">Automatically maintain minimum liquidity</p>
              </div>
              <Switch
                checked={rules.autoLiquidityMode}
                onCheckedChange={(checked) => updateRule('autoLiquidityMode', checked)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Minimum Liquidity Requirement</Label>
                <span className="text-sm text-gray-600">{rules.minLiquidityRequirement}%</span>
              </div>
              <Slider
                value={[rules.minLiquidityRequirement]}
                onValueChange={([value]) => updateRule('minLiquidityRequirement', value)}
                max={100}
                min={10}
                step={5}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Circuit Breakers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Circuit Breakers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Circuit Breakers</Label>
                <p className="text-sm text-gray-600">Halt trading during extreme volatility</p>
              </div>
              <Switch
                checked={rules.enableCircuitBreakers}
                onCheckedChange={(checked) => updateRule('enableCircuitBreakers', checked)}
              />
            </div>

            {rules.enableCircuitBreakers && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Trigger Threshold</Label>
                    <span className="text-sm text-gray-600">{rules.circuitBreakerThreshold}%</span>
                  </div>
                  <Slider
                    value={[rules.circuitBreakerThreshold]}
                    onValueChange={([value]) => updateRule('circuitBreakerThreshold', value)}
                    max={30}
                    min={5}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="circuitBreakerDuration">Halt Duration (minutes)</Label>
                  <Input
                    id="circuitBreakerDuration"
                    type="number"
                    value={rules.circuitBreakerDuration}
                    onChange={(e) => updateRule('circuitBreakerDuration', parseInt(e.target.value) || 15)}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Risk Management */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="maxPositionSize">Max Position Size ($)</Label>
              <Input
                id="maxPositionSize"
                type="number"
                value={rules.maxPositionSize}
                onChange={(e) => updateRule('maxPositionSize', parseInt(e.target.value) || 100000)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Margin Requirement</Label>
                <span className="text-sm text-gray-600">{rules.marginRequirement}%</span>
              </div>
              <Slider
                value={[rules.marginRequirement]}
                onValueChange={([value]) => updateRule('marginRequirement', value)}
                max={100}
                min={10}
                step={5}
                className="w-full"
              />
            </div>

            <div>
              <Label htmlFor="maxDailyVolume">Max Daily Volume ($)</Label>
              <Input
                id="maxDailyVolume"
                type="number"
                value={rules.maxDailyVolume}
                onChange={(e) => updateRule('maxDailyVolume', parseInt(e.target.value) || 1000000)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company-Specific Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Company-Specific Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {companyRules.map((rule) => (
              <div key={rule.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{rule.symbol}</h4>
                    <Switch
                      checked={!rule.tradingHalted}
                      onCheckedChange={(checked) => updateCompanyRule(rule.id, { tradingHalted: !checked })}
                    />
                    <span className="text-sm text-gray-600">
                      {rule.tradingHalted ? 'Trading Halted' : 'Trading Active'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <Label>Custom Price Limit (%)</Label>
                    <Input
                      type="number"
                      value={rule.customPriceLimit || ''}
                      onChange={(e) => updateCompanyRule(rule.id, { 
                        customPriceLimit: e.target.value ? parseFloat(e.target.value) : undefined 
                      })}
                      placeholder="Use global setting"
                    />
                  </div>
                  <div>
                    <Label>Custom Liquidity Requirement (%)</Label>
                    <Input
                      type="number"
                      value={rule.customLiquidityRequirement || ''}
                      onChange={(e) => updateCompanyRule(rule.id, { 
                        customLiquidityRequirement: e.target.value ? parseFloat(e.target.value) : undefined 
                      })}
                      placeholder="Use global setting"
                    />
                  </div>
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={rule.notes}
                    onChange={(e) => updateCompanyRule(rule.id, { notes: e.target.value })}
                    placeholder="Additional notes or restrictions..."
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}