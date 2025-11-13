'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Users,
  DollarSign,
  PieChart,
  Activity,
  Shield,
  UserCheck,
  Phone,
  Mail
} from 'lucide-react'

interface BrokerLink {
  id: string
  brokerName: string
  brokerInstitution: string
  brokerEmail: string
  brokerPhone: string
  activationStatus: 'pending' | 'active' | 'suspended' | 'terminated'
  activatedAt?: Date
  kycStatus: 'pending' | 'completed' | 'rejected'
}

interface InvestorTrade {
  id: string
  instrumentName: string
  tradeType: 'buy' | 'sell'
  quantity: number
  price: number
  totalValue: number
  executedAt: Date
  status: 'executed' | 'settled' | 'failed'
  executedBy: string // Broker name
}

interface PortfolioHolding {
  instrumentName: string
  symbol: string
  quantity: number
  averagePrice: number
  currentPrice: number
  marketValue: number
  unrealizedPL: number
  unrealizedPLPercent: number
}

interface CapitalLabInvestorDashboardProps {
  userId: string
  userRole: string
}

export function CapitalLabInvestorDashboard({ userId, userRole }: CapitalLabInvestorDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [brokerLink, setBrokerLink] = useState<BrokerLink | null>(null)
  const [trades, setTrades] = useState<InvestorTrade[]>([])
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([])
  const [portfolioValue, setPortfolioValue] = useState(0)
  const [cashBalance, setCashBalance] = useState(50000)

  // Mock data - in real implementation, fetch from API
  useEffect(() => {
    // Mock broker link - some investors may not have one yet
    setBrokerLink({
      id: 'BL-001',
      brokerName: 'Sarah Mukamana',
      brokerInstitution: 'Kigali Securities Ltd',
      brokerEmail: 'sarah.mukamana@kigalisec.rw',
      brokerPhone: '+250 788 123 456',
      activationStatus: 'active',
      activatedAt: new Date('2024-01-15'),
      kycStatus: 'completed'
    })

    // Mock trades (only if broker is active)
    setTrades([
      {
        id: 'IT-001',
        instrumentName: 'Bank of Kigali',
        tradeType: 'buy',
        quantity: 50,
        price: 285.5,
        totalValue: 14275,
        executedAt: new Date('2024-01-20T10:30:00'),
        status: 'settled',
        executedBy: 'Sarah Mukamana'
      },
      {
        id: 'IT-002',
        instrumentName: 'MTN Rwanda',
        tradeType: 'buy',
        quantity: 100,
        price: 198.7,
        totalValue: 19870,
        executedAt: new Date('2024-01-18T14:15:00'),
        status: 'settled',
        executedBy: 'Sarah Mukamana'
      }
    ])

    // Mock holdings
    setHoldings([
      {
        instrumentName: 'Bank of Kigali',
        symbol: 'BK',
        quantity: 50,
        averagePrice: 285.5,
        currentPrice: 290.0,
        marketValue: 14500,
        unrealizedPL: 225,
        unrealizedPLPercent: 1.58
      },
      {
        instrumentName: 'MTN Rwanda',
        symbol: 'MTN',
        quantity: 100,
        averagePrice: 198.7,
        currentPrice: 202.1,
        marketValue: 20210,
        unrealizedPL: 340,
        unrealizedPLPercent: 1.71
      }
    ])

    setPortfolioValue(34710) // Sum of market values
  }, [])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'Pending', icon: Clock },
      active: { variant: 'default' as const, label: 'Active', icon: CheckCircle },
      suspended: { variant: 'destructive' as const, label: 'Suspended', icon: AlertCircle },
      terminated: { variant: 'destructive' as const, label: 'Terminated', icon: AlertCircle },
      completed: { variant: 'default' as const, label: 'Completed', icon: CheckCircle },
      rejected: { variant: 'destructive' as const, label: 'Rejected', icon: AlertCircle },
      executed: { variant: 'default' as const, label: 'Executed', icon: Activity },
      settled: { variant: 'default' as const, label: 'Settled', icon: CheckCircle },
      failed: { variant: 'destructive' as const, label: 'Failed', icon: AlertCircle }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig]
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const canTrade = brokerLink?.activationStatus === 'active' && brokerLink?.kycStatus === 'completed'

  if (userRole !== 'investor') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            Access Restricted
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Only registered Investors can access this dashboard. Your current role ({userRole}) does not have this permission.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Investor Dashboard</h1>
          <p className="text-muted-foreground">
            View your portfolio and place orders through your licensed broker
          </p>
        </div>
        {canTrade ? (
          <Button className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Request Trade
          </Button>
        ) : (
          <Button disabled className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Broker Activation Required
          </Button>
        )}
      </div>

      {/* Broker Activation Status */}
      {!brokerLink ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Broker Activation Required:</strong> You must be activated by a licensed broker before you can trade. 
            Contact a licensed broker to begin the activation process.
          </AlertDescription>
        </Alert>
      ) : brokerLink.activationStatus !== 'active' ? (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <strong>Activation Pending:</strong> Your broker activation is pending. 
            Contact {brokerLink.brokerName} at {brokerLink.brokerInstitution} for status updates.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Broker Activated:</strong> You are activated by {brokerLink.brokerName} at {brokerLink.brokerInstitution}. 
            You can now place trading orders through your broker.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="trades">Trade History</TabsTrigger>
          <TabsTrigger value="broker">Broker Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">RWF {portfolioValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Current market value
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">RWF {cashBalance.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Available for trading
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">RWF {(portfolioValue + cashBalance).toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Portfolio + Cash
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{trades.length}</div>
                <p className="text-xs text-muted-foreground">
                  Executed trades
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Trading Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {!canTrade ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Broker Activation Required</h3>
                  <p className="text-muted-foreground">
                    You must be activated by a licensed broker to view trading activity
                  </p>
                </div>
              ) : trades.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Trading Activity</h3>
                  <p className="text-muted-foreground">
                    Your trading activity will appear here once you start trading
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trades.slice(0, 5).map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${trade.tradeType === 'buy' ? 'bg-green-100' : 'bg-red-100'}`}>
                          <TrendingUp className={`w-4 h-4 ${trade.tradeType === 'buy' ? 'text-green-600' : 'text-red-600'}`} />
                        </div>
                        <div>
                          <p className="font-medium">{trade.instrumentName}</p>
                          <p className="text-sm text-muted-foreground">
                            {trade.tradeType.toUpperCase()} {trade.quantity} @ RWF {trade.price}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Executed by: {trade.executedBy}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">RWF {trade.totalValue.toLocaleString()}</p>
                        {getStatusBadge(trade.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Portfolio Holdings</h3>
            {canTrade && (
              <Button>
                <TrendingUp className="w-4 h-4 mr-2" />
                Request Trade
              </Button>
            )}
          </div>

          {!canTrade ? (
            <Card>
              <CardContent className="text-center py-8">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Broker Activation Required</h3>
                <p className="text-muted-foreground">
                  You must be activated by a licensed broker to view your portfolio
                </p>
              </CardContent>
            </Card>
          ) : holdings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <PieChart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Holdings</h3>
                <p className="text-muted-foreground">
                  Your portfolio holdings will appear here once you start trading
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {holdings.map((holding, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-blue-100">
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{holding.instrumentName} ({holding.symbol})</p>
                          <p className="text-sm text-muted-foreground">
                            {holding.quantity} shares @ avg RWF {holding.averagePrice}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">RWF {holding.marketValue.toLocaleString()}</p>
                        <p className={`text-sm ${holding.unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {holding.unrealizedPL >= 0 ? '+' : ''}RWF {holding.unrealizedPL.toLocaleString()} 
                          ({holding.unrealizedPLPercent >= 0 ? '+' : ''}{holding.unrealizedPLPercent.toFixed(2)}%)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trades" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Trade History</h3>
            {canTrade && (
              <Button>
                <Activity className="w-4 h-4 mr-2" />
                Request New Trade
              </Button>
            )}
          </div>

          {!canTrade ? (
            <Card>
              <CardContent className="text-center py-8">
                <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Broker Activation Required</h3>
                <p className="text-muted-foreground">
                  You must be activated by a licensed broker to view trade history
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {trades.map((trade) => (
                <Card key={trade.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${trade.tradeType === 'buy' ? 'bg-green-100' : 'bg-red-100'}`}>
                          <TrendingUp className={`w-5 h-5 ${trade.tradeType === 'buy' ? 'text-green-600' : 'text-red-600'}`} />
                        </div>
                        <div>
                          <p className="font-medium">{trade.instrumentName}</p>
                          <p className="text-sm text-muted-foreground">
                            {trade.tradeType.toUpperCase()} {trade.quantity} shares @ RWF {trade.price}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Executed: {trade.executedAt.toLocaleString()} by {trade.executedBy}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">RWF {trade.totalValue.toLocaleString()}</p>
                        {getStatusBadge(trade.status)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="broker" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Broker Information</h3>
          </div>

          {!brokerLink ? (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Broker Assigned</h3>
                <p className="text-muted-foreground mb-4">
                  You need to be activated by a licensed broker to trade
                </p>
                <Button>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Request Broker Activation
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {brokerLink.brokerName}
                  </CardTitle>
                  {getStatusBadge(brokerLink.activationStatus)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {brokerLink.brokerInstitution}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <strong>Email:</strong> {brokerLink.brokerEmail}
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <strong>Phone:</strong> {brokerLink.brokerPhone}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p><strong>KYC Status:</strong> {getStatusBadge(brokerLink.kycStatus)}</p>
                      {brokerLink.activatedAt && (
                        <p><strong>Activated:</strong> {brokerLink.activatedAt.toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Important:</strong> All your trades must be executed through your assigned broker. 
                      You cannot trade directly on the exchange - this follows Rwanda's capital markets regulations.
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Mail className="w-4 h-4 mr-2" />
                      Contact Broker
                    </Button>
                    <Button variant="outline">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Request Trade
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}